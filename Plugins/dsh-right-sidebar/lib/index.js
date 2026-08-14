// Host services for the DeepSeek Harness macOS right sidebar.
import { randomUUID } from "node:crypto";
import { stat } from "node:fs/promises";
import { spawn } from "node:child_process";

export const name = "dsh-right-sidebar";
export const inject = ["webServer"];

const ENDPOINT = "/dsh-right-sidebar/terminal";
const MAX_BODY = 40 * 1024;
const MAX_OUTPUT = 200 * 1024;

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
}
