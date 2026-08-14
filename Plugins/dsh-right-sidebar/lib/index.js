// Host services for the DeepSeek Harness macOS right sidebar.
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { open, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, resolve } from "node:path";

export const name = "dsh-right-sidebar";
export const inject = ["webServer"];

const ENDPOINT = "/dsh-right-sidebar/terminal";
const MEDIA_STREAM_ENDPOINT = "/dsh-right-sidebar/media/stream";
const MEDIA_METADATA_ENDPOINT = "/dsh-right-sidebar/media/metadata";
const MAX_BODY = 40 * 1024;
const MAX_OUTPUT = 200 * 1024;
const MEDIA_TYPES = { ".mp3": "audio/mpeg", ".mp4": "video/mp4" };

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

function syncsafeInt(buffer, offset) {
  return ((buffer[offset] & 0x7f) << 21) |
    ((buffer[offset + 1] & 0x7f) << 14) |
    ((buffer[offset + 2] & 0x7f) << 7) |
    (buffer[offset + 3] & 0x7f);
}

function decodeID3Text(buffer, start, size) {
  if (size <= 1) return "";
  const encoding = buffer[start];
  let end = start + size;
  while (end > start + 1 && buffer[end - 1] === 0) end--;
  const raw = buffer.subarray(start + 1, end);
  try {
    if (encoding === 1) {
      if (raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe) return raw.toString("utf16le", 2).replace(/\0/g, "").trim();
      if (raw.length >= 2 && raw[0] === 0xfe && raw[1] === 0xff) return raw.toString("utf16be", 2).replace(/\0/g, "").trim();
      return raw.toString("utf16le").replace(/\0/g, "").trim();
    }
    if (encoding === 2) return raw.toString("utf16be").replace(/\0/g, "").trim();
    if (encoding === 3) return raw.toString("utf8").trim();
    const text = raw.toString("utf8");
    return text.includes("\uFFFD") ? raw.toString("latin1").trim() : text.trim();
  } catch {
    return "";
  }
}

function decodeID3v1(buffer) {
  if (buffer.length < 128 || buffer.toString("latin1", 0, 3) !== "TAG") return null;
  const clean = (from, to) => buffer.toString("latin1", from, to).replace(/\0/g, "").trim();
  return {
    title: clean(3, 33),
    artist: clean(33, 63),
    album: clean(63, 93)
  };
}

function decodeMP4Data(buffer) {
  if (buffer.length < 8) return "";
  return buffer.subarray(8).toString("utf8").replace(/\0/g, "").trim();
}

async function readAt(fh, position, length) {
  const buffer = Buffer.alloc(length);
  let offset = 0;
  while (offset < length) {
    const { bytesRead } = await fh.read(buffer, offset, length - offset, position + offset);
    if (bytesRead === 0) break;
    offset += bytesRead;
  }
  return offset === length ? buffer : buffer.subarray(0, offset);
}

async function readMP3Metadata(fh, fileSize) {
  const header = await readAt(fh, 0, 10);
  if (header.length >= 10 && header.toString("latin1", 0, 3) === "ID3") {
    const major = header[3];
    const tagSize = syncsafeInt(header, 6);
    const body = await readAt(fh, 10, Math.min(tagSize, fileSize - 10));
    const result = {};
    let offset = 0;
    if (major === 3) {
      if (header[5] & 0x40 && offset + 4 <= body.length) offset = 4 + body.readUInt32BE(offset);
    } else if (major === 4) {
      if (header[5] & 0x40 && offset + 4 <= body.length) offset = syncsafeInt(body, offset);
    }
    while (offset + 10 <= body.length) {
      const id = body.toString("latin1", offset, offset + 4);
      if (!/^[A-Z0-9]{4}$/.test(id)) break;
      const frameSize = major === 4 ? syncsafeInt(body, offset + 4) : body.readUInt32BE(offset + 4);
      if (frameSize <= 0 || offset + 10 + frameSize > body.length) break;
      if (id === "TIT2" || id === "TPE1" || id === "TALB") {
        const text = decodeID3Text(body, offset + 10, frameSize);
        if (text) {
          if (id === "TIT2") result.title = text;
          else if (id === "TPE1") result.artist = text;
          else if (id === "TALB") result.album = text;
        }
      }
      offset += 10 + frameSize;
    }
    return result;
  }
  if (fileSize > 128) {
    const tag = await readAt(fh, fileSize - 128, 128);
    if (tag.length >= 128) {
      const v1 = decodeID3v1(tag);
      if (v1) return v1;
    }
  }
  return {};
}

async function readMP4Metadata(fh, fileSize) {
  const meta = {};
  const findAtom = async (start, end, wantType) => {
    let pos = start;
    while (pos + 8 <= end) {
      const header = await readAt(fh, pos, 8);
      if (header.length < 8) break;
      let size = header.readUInt32BE(0);
      const type = header.toString("latin1", 4, 8);
      if (size === 1) {
        const ext = await readAt(fh, pos + 8, 8);
        if (ext.length < 8) break;
        size = Number(ext.readBigUInt64BE(0));
      } else if (size === 0) {
        size = end - pos;
      }
      if (size < 8) break;
      if (type === wantType) return { start: pos, size };
      pos += size;
    }
    return null;
  };
  const moov = await findAtom(0, fileSize, "moov");
  if (!moov) return meta;
  const moovEnd = Math.min(fileSize, moov.start + moov.size);
  const udta = await findAtom(moov.start + 8, moovEnd, "udta");
  if (!udta) return meta;
  const udtaEnd = Math.min(moovEnd, udta.start + udta.size);
  const metaAtom = await findAtom(udta.start + 8, udtaEnd, "meta");
  if (!metaAtom) return meta;
  const metaEnd = Math.min(udtaEnd, metaAtom.start + metaAtom.size);
  const ilst = await findAtom(metaAtom.start + 12, metaEnd, "ilst");
  if (!ilst) return meta;
  const ilstEnd = Math.min(metaEnd, ilst.start + ilst.size);
  const want = { "\u00A9nam": "title", "\u00A9ART": "artist", "\u00A9alb": "album" };
  let pos = ilst.start + 8;
  while (pos + 8 <= ilstEnd) {
    const header = await readAt(fh, pos, 8);
    if (header.length < 8) break;
    const size = header.readUInt32BE(0);
    const type = header.toString("latin1", 4, 8);
    if (size < 8) break;
    const key = want[type];
    if (key) {
      const childEnd = Math.min(ilstEnd, pos + size);
      let cpos = pos + 8;
      while (cpos + 8 <= childEnd) {
        const chead = await readAt(fh, cpos, 8);
        if (chead.length < 8) break;
        const csize = chead.readUInt32BE(0);
        const ctype = chead.toString("latin1", 4, 8);
        if (csize < 8) break;
        if (ctype === "data" && csize > 8) {
          const dbuf = await readAt(fh, cpos + 8, Math.min(csize - 8, 4096));
          const value = decodeMP4Data(dbuf);
          if (value) meta[key] = value;
          break;
        }
        cpos += csize;
      }
    }
    pos += size;
  }
  return meta;
}

async function readMediaMetadata(filePath) {
  const fh = await open(filePath, "r");
  try {
    const info = await fh.stat();
    const ext = extname(filePath).toLowerCase();
    if (ext === ".mp3") return await readMP3Metadata(fh, info.size);
    if (ext === ".mp4") return await readMP4Metadata(fh, info.size);
    return {};
  } finally {
    await fh.close();
  }
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
    const disposeMetadata = ctx.webServer.register({
      kind: "exact",
      path: MEDIA_METADATA_ENDPOINT,
      handler: async (req, res) => {
        if (req.method !== "POST" || req.headers["x-dsh-right-sidebar"] !== "1" || !isSameOrigin(req)) {
          json(res, 403, { ok: false, error: "forbidden" });
          return;
        }
        try {
          const body = await readJson(req);
          const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path : "";
          if (!path || !MEDIA_TYPES[extname(path).toLowerCase()]) {
            json(res, 400, { ok: false, error: "unsupported media path" });
            return;
          }
          const metadata = await readMediaMetadata(path);
          json(res, 200, { ok: true, title: metadata.title || "", artist: metadata.artist || "", album: metadata.album || "" });
        } catch (error) {
          json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      }
    });
    return () => {
      disposeStream();
      disposeMetadata();
    };
  }, "dsh-right-sidebar: media");
}
