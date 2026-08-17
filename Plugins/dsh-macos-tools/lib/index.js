/**
 * dsh-macos-tools — macOS 原生工具集（宿主插件）。
 *
 * 给 Agent 注册一组直接调用 macOS 系统能力的模型工具。与 model-router 相同的
 * 宿主插件模式：零外部依赖（只用 child_process + AppleScript），工具注册进
 * 全局 tools 层，所有会话的 Agent 都能看到并调用。
 *
 * 安全设计：
 * - 所有命令用 execFile 传参数数组，不经 shell，天然免疫注入；
 * - 路径统一规范化（~ 展开、相对路径按工作区根解析），不存在的路径给出明确报错；
 * - 剪贴板 / 朗读 / 通知文本都有长度上限；
 * - 截图默认写入系统临时目录（可指定输出路径），不覆盖用户文件。
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir, tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { stat } from "node:fs/promises";

const execFileAsync = promisify(execFile);

export const name = "dsh-macos-tools";
/** tools：注册模型工具；systemPrompt：追加使用指引。 */
export const inject = ["tools", "systemPrompt"];

const MAX_CLIPBOARD_READ = 20 * 1024;
const MAX_CLIPBOARD_WRITE = 1024 * 1024;
const MAX_SPEAK_TEXT = 4000;
const MAX_NOTIFY_TEXT = 4000;

/** 执行命令，参数数组传参；非零退出码抛错并附带 stderr。 */
async function run(cmd, args, { timeoutMs = 15000, input } = {}) {
  let stdout;
  let stderr;
  try {
    ({ stdout, stderr } = await execFileAsync(cmd, args, {
      timeout: timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
      ...(input === undefined ? {} : { input }),
    }));
  } catch (error) {
    const detail = error && typeof error.stderr === "string" && error.stderr.trim()
      ? `: ${error.stderr.trim()}`
      : "";
    throw new Error(`\`${cmd}\` 执行失败${detail}`);
  }
  return { stdout: String(stdout ?? ""), stderr: String(stderr ?? "") };
}

/** 展开 ~，并把相对路径解析到工作区根；返回绝对路径。 */
function normalizePath(raw) {
  let p = String(raw ?? "").trim();
  if (!p) throw new Error("path 不能为空");
  if (p === "~") p = homedir();
  else if (p.startsWith("~/")) p = join(homedir(), p.slice(2));
  if (!isAbsolute(p)) p = resolve(p);
  return p;
}

/** 校验路径存在，返回 stat 信息。 */
async function assertExists(p) {
  try {
    return await stat(p);
  } catch {
    throw new Error(`路径不存在：${p}`);
  }
}

/** 校验 URL，缺 scheme 时自动补 https://。 */
function normalizeUrl(raw) {
  let url = String(raw ?? "").trim();
  if (!url) throw new Error("url 不能为空");
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = `https://${url}`;
  return url;
}

/** 校验字符串参数：必须存在、可选长度上限。 */
function requireText(value, label, max = 4096) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} 不能为空`);
  if (text.length > max) throw new Error(`${label} 过长（最多 ${max} 字符）`);
  return text;
}

/** 清除 AppleScript 字符串字面量里的控制字符与反斜杠，避免转义歧义。 */
function cleanAppleScript(value) {
  return String(value).replace(/[\x00-\x1f\\]/g, "");
}

// ── 工具定义 ────────────────────────────────────────────────────────────────
// 每个工具给出完整 JSON Schema 的 parameters 与 output：注册器会用
// output.schema 校验 execute 的返回值，output.render 决定模型可见的内容。

const macosTools = [
  {
    name: "macos_open_path",
    description: "用系统默认应用打开一个文件或文件夹；reveal 为 true 时在 Finder 中显示它。",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "要打开的文件或文件夹路径：绝对路径、相对当前工作区的路径、或 ~ 开头的路径。"
        },
        reveal: {
          type: "boolean",
          description: "为 true 时在 Finder 中显示该路径而不是打开它。"
        }
      },
      required: ["path"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          path: { type: "string" }
        },
        required: ["ok", "path"]
      },
      render: (_args, value) => [{ type: "text", text: value.ok ? `已打开：${value.path}` : `失败：${value.path}` }]
    },
    async execute(args) {
      const p = normalizePath(args.path);
      await assertExists(p);
      await run("/usr/bin/open", args.reveal ? ["-R", p] : [p]);
      return { ok: true, path: p };
    }
  },

  {
    name: "macos_open_url",
    description: "用系统默认浏览器打开一个网址；未带协议的地址会自动补 https://。",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "要打开的网址，例如 https://example.com 或 example.com。"
        }
      },
      required: ["url"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          url: { type: "string" }
        },
        required: ["ok", "url"]
      },
      render: (_args, value) => [{ type: "text", text: value.ok ? `已用默认浏览器打开：${value.url}` : `失败：${value.url}` }]
    },
    async execute(args) {
      const url = normalizeUrl(args.url);
      await run("/usr/bin/open", [url]);
      return { ok: true, url };
    }
  },

  {
    name: "macos_clipboard_get",
    description: "读取剪贴板中的文本内容。剪贴板为空时返回空字符串。",
    parameters: {
      type: "object",
      properties: {}
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          text: { type: "string" }
        },
        required: ["ok", "text"]
      },
      render: (_args, value) => [{
        type: "text",
        text: value.ok
          ? (value.text ? `剪贴板内容：\n${value.text}` : "剪贴板为空")
          : `读取失败：${value.error}`
      }]
    },
    async execute() {
      let text = "";
      try {
        const { stdout } = await run("/usr/bin/pbpaste", [], { timeoutMs: 10000 });
        text = stdout.slice(0, MAX_CLIPBOARD_READ);
      } catch {
        // pbpaste 在剪贴板为空或含非文本数据时非零退出：视为空剪贴板。
      }
      return { ok: true, text };
    }
  },

  {
    name: "macos_clipboard_set",
    description: "把文本写入剪贴板，替换当前内容。",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "要写入剪贴板的文本（上限 1MB）。"
        }
      },
      required: ["text"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          chars: { type: "integer" }
        },
        required: ["ok", "chars"]
      },
      render: (_args, value) => [{ type: "text", text: value.ok ? `已写入剪贴板（${value.chars} 字符）` : "写入失败" }]
    },
    async execute(args) {
      const text = requireText(args.text, "text", MAX_CLIPBOARD_WRITE);
      await run("/usr/bin/pbcopy", [], { input: text });
      return { ok: true, chars: text.length };
    }
  },

  {
    name: "macos_notify",
    description: "在 macOS 上发送一条系统通知（横幅/弹窗）。",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "通知标题，例如「任务完成」。"
        },
        message: {
          type: "string",
          description: "通知正文，可为空。"
        },
        sound: {
          type: "boolean",
          description: "是否播放提示音，默认 false。"
        }
      },
      required: ["title"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          title: { type: "string" }
        },
        required: ["ok", "title"]
      },
      render: (_args, value) => [{ type: "text", text: value.ok ? `已发送通知：${value.title}` : "通知发送失败" }]
    },
    async execute(args) {
      const title = requireText(args.title, "title", MAX_NOTIFY_TEXT);
      const message = cleanAppleScript(String(args.message ?? "").trim().slice(0, MAX_NOTIFY_TEXT));
      let script = `display notification ${JSON.stringify(message)} with title ${JSON.stringify(cleanAppleScript(title))}`;
      if (args.sound) script += ` sound name "Glass"`;
      await run("/usr/bin/osascript", ["-e", script]);
      return { ok: true, title };
    }
  },

  {
    name: "macos_speak",
    description: "用 macOS 语音合成朗读一段文本（say）。",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "要朗读的文本（上限 4000 字符）。"
        },
        voice: {
          type: "string",
          description: "可选，语音名称，例如 Tingting、Meijia、Samantha；省略用系统默认。"
        },
        rate: {
          type: "number",
          description: "可选，语速（词/分钟），约 80–500，默认 175。"
        }
      },
      required: ["text"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          chars: { type: "integer" }
        },
        required: ["ok", "chars"]
      },
      render: (_args, value) => [{ type: "text", text: value.ok ? `已开始朗读（${value.chars} 字符）` : "朗读失败" }]
    },
    async execute(args) {
      const text = requireText(args.text, "text", MAX_SPEAK_TEXT);
      const argv = [];
      if (args.rate !== undefined) {
        const rate = Number(args.rate);
        if (!Number.isFinite(rate) || rate < 80 || rate > 500) throw new Error("rate 必须是 80–500 之间的数字");
        argv.push("-r", String(Math.round(rate)));
      }
      if (args.voice !== undefined) argv.push("-v", requireText(args.voice, "voice", 100));
      argv.push(text);
      await run("/usr/bin/say", argv, { timeoutMs: 30000 });
      return { ok: true, chars: text.length };
    }
  },

  {
    name: "macos_music",
    description: "控制 Apple Music（或 iTunes）播放：播放、暂停、下一首、上一首、停止，或查询当前曲目信息。",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["play", "pause", "playpause", "next", "previous", "stop", "status"],
          description: "要执行的动作：status 查询播放状态与当前曲目，其余为播放控制。"
        }
      },
      required: ["action"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          action: { type: "string" },
          state: { type: "string" },
          track: { type: "string" },
          artist: { type: "string" },
          album: { type: "string" }
        },
        required: ["ok", "action"]
      },
      render: (_args, value) => {
        if (!value.ok) return [{ type: "text", text: `音乐操作失败：${value.error ?? value.action}` }];
        if (value.action === "status") {
          const parts = [value.state ? `状态：${value.state}` : ""];
          if (value.track) parts.push(`曲目：${value.track}`);
          if (value.artist) parts.push(`歌手：${value.artist}`);
          if (value.album) parts.push(`专辑：${value.album}`);
          return [{ type: "text", text: parts.filter(Boolean).join("\n") || "未在播放任何曲目" }];
        }
        return [{ type: "text", text: `已执行：${value.action}` }];
      }
    },
    async execute(args) {
      const action = requireText(args.action, "action", 20);
      const APP = 'tell application "Music"';
      if (action === "status") {
        const script = [
          APP,
          "set p to player state",
          'set n to ""',
          'set a to ""',
          'set al to ""',
          "try",
          "  set n to name of current track",
          "  set a to artist of current track",
          "  set al to album of current track",
          "end try",
          'return (p as string) & "||" & n & "||" & a & "||" & al',
          "end tell"
        ].join("\n");
        const { stdout } = await run("/usr/bin/osascript", ["-e", script], { timeoutMs: 20000 });
        const [state, track, artist, album] = stdout.trim().split("||");
        return { ok: true, action, state: state || "", track: track || "", artist: artist || "", album: album || "" };
      }
      const verbs = { play: "play", pause: "pause", playpause: "playpause", next: "next track", previous: "previous track", stop: "stop" };
      const verb = verbs[action];
      if (!verb) throw new Error(`未知动作：${action}`);
      await run("/usr/bin/osascript", ["-e", `${APP} to ${verb}`], { timeoutMs: 20000 });
      return { ok: true, action };
    }
  },

  {
    name: "macos_screenshot",
    description: "截取整个屏幕或指定显示器，保存为 PNG，返回文件路径。需要 macOS 屏幕录制权限。",
    parameters: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["full", "display"],
          description: "full 截取所有显示器合并画面；display 截取指定显示器。默认 full。"
        },
        display_index: {
          type: "integer",
          description: "mode 为 display 时的显示器编号（从 1 开始）。"
        },
        output_path: {
          type: "string",
          description: "可选，PNG 输出路径；省略则写入系统临时目录。"
        }
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          path: { type: "string" },
          bytes: { type: "integer" }
        },
        required: ["ok", "path", "bytes"]
      },
      render: (_args, value) => [{
        type: "text",
        text: value.ok ? `截图已保存：${value.path}（${value.bytes} 字节）` : `截图失败：${value.error}`
      }]
    },
    async execute(args) {
      const out = args.output_path !== undefined
        ? normalizePath(args.output_path)
        : join(tmpdir(), `dsh-macos-screenshot-${Date.now()}.png`);
      const argv = ["-x"];
      if (args.mode === "display") {
        const index = Number(args.display_index);
        if (!Number.isInteger(index) || index < 1) throw new Error("display_index 必须是 >= 1 的整数");
        argv.push("-D", String(index));
      }
      argv.push(out);
      await run("/usr/sbin/screencapture", argv, { timeoutMs: 30000 });
      const info = await stat(out);
      return { ok: true, path: out, bytes: info.size };
    }
  },

  {
    name: "macos_volume",
    description: "查询或设置系统输出音量（0–100）。",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get", "set"],
          description: "get 查询当前音量与静音状态；set 设置音量。"
        },
        level: {
          type: "integer",
          description: "action 为 set 时的目标音量（0–100）。"
        }
      },
      required: ["action"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          level: { type: "integer" },
          muted: { type: "boolean" }
        },
        required: ["ok"]
      },
      render: (_args, value) => {
        if (!value.ok) return [{ type: "text", text: `音量操作失败：${value.error}` }];
        if (value.level === undefined) return [{ type: "text", text: "已设置音量" }];
        return [{
          type: "text",
          text: `当前音量：${value.level}${value.muted ? "（已静音）" : ""}`
        }];
      }
    },
    async execute(args) {
      const action = requireText(args.action, "action", 10);
      if (action === "set") {
        const level = Number(args.level);
        if (!Number.isInteger(level) || level < 0 || level > 100) throw new Error("level 必须是 0–100 的整数");
        await run("/usr/bin/osascript", ["-e", `set volume output volume ${level}`]);
        return { ok: true };
      }
      if (action !== "get") throw new Error(`未知动作：${action}`);
      const { stdout } = await run("/usr/bin/osascript", [
        "-e",
        'return ((output volume of (get volume settings)) as string) & "||" & (output muted of (get volume settings))'
      ]);
      const [level, muted] = stdout.trim().split("||");
      return { ok: true, level: Number(level) || 0, muted: muted === "true" };
    }
  },

  {
    name: "macos_app",
    description: "启动、激活或退出一个 macOS 应用（按应用名、包 ID 或应用路径）。",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["launch", "activate", "quit"],
          description: "launch 启动应用；activate 把已运行的应用带到前台；quit 退出应用。"
        },
        name: {
          type: "string",
          description: "应用名（如 Safari）、包 ID（如 com.apple.Safari）或 .app 路径。"
        }
      },
      required: ["action", "name"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          action: { type: "string" },
          name: { type: "string" }
        },
        required: ["ok", "action", "name"]
      },
      render: (_args, value) => [{ type: "text", text: value.ok ? `已${value.action === "launch" ? "启动" : value.action === "quit" ? "退出" : "激活"}：${value.name}` : `操作失败：${value.name}` }]
    },
    async execute(args) {
      const action = requireText(args.action, "action", 20);
      const rawName = requireText(args.name, "name", 512);
      const isPath = rawName.startsWith("/") || rawName.startsWith("~/");
      const name = isPath ? normalizePath(rawName) : rawName;
      if (action === "launch") {
        if (isPath) {
          await assertExists(name);
          await run("/usr/bin/open", [name]);
        } else {
          await run("/usr/bin/open", ["-a", name]);
        }
        return { ok: true, action, name };
      }
      if (action === "activate" || action === "quit") {
        await run("/usr/bin/osascript", ["-e", `tell application ${JSON.stringify(cleanAppleScript(name))} to ${action}`], { timeoutMs: 20000 });
        return { ok: true, action, name };
      }
      throw new Error(`未知动作：${action}`);
    }
  }
];

// ── 注册 ─────────────────────────────────────────────────────────────────────

export function apply(ctx) {
  for (const tool of macosTools) {
    ctx.tools.register(tool);
  }
  ctx.systemPrompt.section({
    name: "tool:macos-native",
    order: 100,
    text: "macOS 原生操作优先使用 macos_* 工具而不是裸 shell：打开文件/文件夹/URL、Finder 显示、剪贴板读写、系统通知、语音朗读、Apple Music 控制、截图、系统音量、应用启停。这些工具不经 shell 传参，无需关心引号转义。"
  });
  ctx.logger.info(`dsh-macos-tools: registered ${macosTools.length} native macOS tools`);
}
