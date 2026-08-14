// Host services for the DeepSeek Harness macOS right sidebar.
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, join, resolve } from "node:path";
import { homedir } from "node:os";

export const name = "dsh-right-sidebar";
export const inject = ["webServer"];

const ENDPOINT = "/dsh-right-sidebar/terminal";
const MEDIA_LIST_ENDPOINT = "/dsh-right-sidebar/media/list";
const MEDIA_STREAM_ENDPOINT = "/dsh-right-sidebar/media/stream";
const MAX_BODY = 40 * 1024;
const MAX_OUTPUT = 200 * 1024;
const MEDIA_EXTENSIONS = new Set([".mp3", ".mp4"]);
const MEDIA_TYPES = { ".mp3": "audio/mpeg", ".mp4": "video/mp4" };
const MEDIA_MAX_FILES = 200;
const MEDIA_MAX_DEPTH = 5;

function json(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(JSON.stringify(value));
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_BODY) throw new Error("request too large");
  }
  return body ? JSON.parse(body) : {};
}

const isSameOrigin = (req) => {
  const site = req.headers["sec-fetch-site"];
  return !site || site === "same-origin" || site === "none";
};

async function listMediaFiles(root) {
  const results = [];
  const pending = [{ dir: root, depth: 0 }];
  while (pending.length && results.length < MEDIA_MAX_FILES) {
    const { dir, depth } = pending.pop();
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (results.length >= MEDIA_MAX_FILES) break;
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (depth < MEDIA_MAX_DEPTH) pending.push({ dir: full, depth: depth + 1 });
      } else if (entry.isFile() && MEDIA_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        try {
          const info = await stat(full);
          results.push({ path: full, name: entry.name, size: info.size });
        } catch {}
      }
    }
  }
  results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

function streamMedia(req, res, rawPath) {
  const ext = extname(rawPath).toLowerCase();
  const type = MEDIA_TYPES[ext];
  if (!type || !rawPath.startsWith("/")) {
    json(res, 403, { ok: false, error: "unsupported media path" });
    return;
  }
  const filePath = resolve(rawPath);
  stat(filePath).then((info) => {
    if (!info.isFile()) {
      json(res, 404, { ok: false, error: "file not found" });
      return;
    }
    const size = info.size;
    const range = req.headers.range;
    res.setHeader("accept-ranges", "bytes");
    res.setHeader("content-type", type);
    res.setHeader("cache-control", "no-store");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (match) {
        let start = match[1] === "" ? null : Number(match[1]);
        let end = match[2] === "" ? null : Number(match[2]);
        if (start === null) {
          const suffix = end ?? 0;
          start = Math.max(0, size - suffix);
          end = size - 1;
        } else if (end === null || end >= size) {
          end = size - 1;
        }
        if (start > end || start >= size) {
          res.writeHead(416, { "content-range": `bytes */${size}` });
          res.end();
          return;
        }
        res.writeHead(206, {
          "content-range": `bytes ${start}-${end}/${size}`,
          "content-length": end - start + 1
        });
        const stream = createReadStream(filePath, { start, end });
        stream.pipe(res);
        stream.on("error", () => res.end());
        return;
      }
    }
    res.writeHead(200, { "content-length": size });
    const stream = createReadStream(filePath);
    stream.pipe(res);
    stream.on("error", () => res.end());
  }).catch(() => {
    json(res, 404, { ok: false, error: "file not found" });
  });
}

function cleanOutput(session) {
  let latest = session.cwd;
  const completeMarker = /\x1eDSH_PWD:([^\x1f]*)\x1f/g;
  const output = session.raw.replace(completeMarker, (_all, cwd) => {
    latest = cwd || latest;
    return "";
  }).replace(/\x1eDSH_PWD:[^\x1f]*$/, "");
  session.cwd = latest;
  return output;
}

function append(session, chunk) {
  session.raw += chunk.toString("utf8");
  if (session.raw.length > MAX_OUTPUT) session.raw = session.raw.slice(-MAX_OUTPUT);
}

function markCwd(child) {
  child.stdin.write("printf '\\036DSH_PWD:%s\\037' \"$PWD\"\n");
}

async function startSession(cwd) {
  const initial = typeof cwd === "string" && cwd ? cwd : process.cwd();
  const info = await stat(initial);
  if (!info.isDirectory()) throw new Error("workspace is not a directory");
  const child = spawn("/bin/zsh", ["-f"], {
    cwd: initial,
    env: { ...process.env, TERM: "dumb", NO_COLOR: "1", CLICOLOR: "0" },
    stdio: ["pipe", "pipe", "pipe"]
  });
  const session = { id: randomUUID(), child, cwd: initial, raw: "", alive: true };
  child.stdout.on("data", (chunk) => append(session, chunk));
  child.stderr.on("data", (chunk) => append(session, chunk));
  child.stdin.on("error", () => {});
  child.once("error", (error) => {
    append(session, `\n终端启动失败：${error.message}\n`);
    session.alive = false;
  });
  child.once("exit", (code) => {
    session.alive = false;
    if (code && code !== 0) append(session, `\n[终端已退出：${code}]\n`);
  });
  markCwd(child);
  return session;
}

export function apply(ctx) {
  const sessions = new Map();

  const stop = (id) => {
    const session = sessions.get(id);
    if (!session) return;
    sessions.delete(id);
    if (session.alive) session.child.kill("SIGTERM");
  };

  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: "exact",
      path: ENDPOINT,
      handler: async (req, res) => {
        const site = req.headers["sec-fetch-site"];
        if (req.method !== "POST" || req.headers["x-dsh-right-sidebar"] !== "1" || (site && site !== "same-origin" && site !== "none")) {
          json(res, 403, { ok: false, error: "forbidden" });
          return;
        }
        let body;
        try {
          body = await readJson(req);
          if (body.action === "start") {
            const session = await startSession(body.cwd);
            sessions.set(session.id, session);
            json(res, 200, { ok: true, id: session.id, cwd: session.cwd, output: "" });
            return;
          }
          const session = sessions.get(body.id);
          if (!session) {
            json(res, 404, { ok: false, error: "terminal not found" });
            return;
          }
          if (body.action === "write") {
            if (!session.alive) throw new Error("terminal has exited");
            const command = String(body.command || "");
            if (!command.trim()) {
              json(res, 200, { ok: true });
              return;
            }
            if (command.length > 32 * 1024) throw new Error("command too long");
            append(session, `$ ${command}\n`);
            session.child.stdin.write(`${command}\n`);
            markCwd(session.child);
            json(res, 200, { ok: true });
            return;
          }
          if (body.action === "poll") {
            json(res, 200, { ok: true, cwd: session.cwd, output: cleanOutput(session), alive: session.alive });
            return;
          }
          if (body.action === "close") {
            stop(session.id);
            json(res, 200, { ok: true });
            return;
          }
          json(res, 400, { ok: false, error: "unknown action" });
        } catch (error) {
          json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      }
    });
    return () => {
      dispose();
      for (const id of [...sessions.keys()]) stop(id);
    };
  }, "dsh-right-sidebar: terminal");

  ctx.effect(() => {
    const disposeList = ctx.webServer.register({
      kind: "exact",
      path: MEDIA_LIST_ENDPOINT,
      handler: async (req, res) => {
        if (req.method !== "POST" || req.headers["x-dsh-right-sidebar"] !== "1" || !isSameOrigin(req)) {
          json(res, 403, { ok: false, error: "forbidden" });
          return;
        }
        try {
          const body = await readJson(req);
          const dir = typeof body.dir === "string" && body.dir.startsWith("/") ? body.dir : homedir();
          const files = await listMediaFiles(dir);
          json(res, 200, { ok: true, dir, files });
        } catch (error) {
          json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      }
    });
    const disposeStream = ctx.webServer.register({
      kind: "exact",
      path: MEDIA_STREAM_ENDPOINT,
      handler: (req, res) => {
        if (req.method !== "GET" || !isSameOrigin(req)) {
          json(res, 403, { ok: false, error: "forbidden" });
          return;
        }
        const url = new URL(req.url ?? "/", "http://127.0.0.1");
        streamMedia(req, res, url.searchParams.get("path") || "");
      }
    });
    return () => {
      disposeList();
      disposeStream();
    };
  }, "dsh-right-sidebar: media");
}
