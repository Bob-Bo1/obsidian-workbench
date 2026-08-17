// obsidian-workbench — Host half.
//
// Reads the active local Obsidian vault and exposes a narrow HTTP API to the
// browser half. Every path is resolved below the selected vault root.

import path from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync
} from "node:fs";

const API = "/api/obsidian-workbench";
const MAX_NOTE_BYTES = 4 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set([".md", ".markdown", ".txt"]);
const IMAGE_TYPES = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"]
]);

function appDataPath() {
  return process.env.APPDATA || path.join(process.env.USERPROFILE || process.cwd(), "AppData", "Roaming");
}

function readObsidianVaults() {
  const configPath = path.join(appDataPath(), "obsidian", "obsidian.json");
  try {
    const raw = JSON.parse(readFileSync(configPath, "utf8"));
    return Object.values(raw?.vaults || {}).filter((item) => item && typeof item.path === "string");
  } catch {
    return [];
  }
}

function resolveVaultPath() {
  const configured = process.env.OBSIDIAN_VAULT_PATH?.trim();
  if (configured && existsSync(configured) && statSync(configured).isDirectory()) return path.resolve(configured);

  const vaults = readObsidianVaults();
  const openVault = vaults.find((item) => item.open && existsSync(item.path));
  if (openVault) return path.resolve(openVault.path);

  const newest = [...vaults]
    .filter((item) => existsSync(item.path))
    .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0))[0];
  return newest ? path.resolve(newest.path) : null;
}

let vaultRoot = resolveVaultPath();

function json(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function text(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(value);
}

function ensureVault() {
  if (!vaultRoot || !existsSync(vaultRoot) || !statSync(vaultRoot).isDirectory()) {
    throw new Error("没有找到 Obsidian 仓库，请设置 OBSIDIAN_VAULT_PATH");
  }
  return realpathSync(vaultRoot);
}

function relativePath(raw) {
  const root = ensureVault();
  const decoded = decodeURIComponent(String(raw || "")).replace(/^[/\\]+/, "");
  const absolute = path.resolve(root, decoded);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("路径超出 Obsidian 仓库范围");
  const parts = relative.split(path.sep).filter(Boolean);
  if (parts.some((part) => part === ".obsidian" || part.startsWith("."))) throw new Error("隐藏目录不开放访问");
  if (!existsSync(absolute)) throw new Error("文件或目录不存在");
  const realAbsolute = realpathSync(absolute);
  const realRelative = path.relative(root, realAbsolute);
  if (realRelative.startsWith("..") || path.isAbsolute(realRelative)) throw new Error("路径超出 Obsidian 仓库范围");
  return { relative: relative.replace(/\\/g, "/"), absolute: realAbsolute };
}

function readTree(relative) {
  const { absolute } = relativePath(relative);
  if (!existsSync(absolute) || !statSync(absolute).isDirectory()) throw new Error("目录不存在");
  const entries = readdirSync(absolute, { withFileTypes: true });
  const dirs = [];
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const childRelative = path.relative(ensureVault(), path.join(absolute, entry.name)).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      dirs.push({ name: entry.name, path: childRelative, kind: "directory" });
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (TEXT_EXTENSIONS.has(ext) || IMAGE_TYPES.has(ext)) {
      files.push({ name: entry.name, path: childRelative, kind: IMAGE_TYPES.has(ext) ? "image" : "file", ext });
    }
  }
  dirs.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  files.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  return { path: String(relative || ""), dirs, files };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_NOTE_BYTES) {
        reject(new Error("笔记超过 4 MB，暂不支持保存"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function writeAtomically(filePath, content) {
  const tempPath = `${filePath}.dsh-tmp-${process.pid}`;
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(tempPath, content, "utf8");
  renameSync(tempPath, filePath);
}

function register(serverCtx, route, handler) {
  return serverCtx.webServer.register({ kind: "exact", path: route, handler });
}

function routeHandler(req, res, action) {
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  Promise.resolve().then(() => action(req, res)).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    json(res, message.includes("范围") || message.includes("隐藏") ? 403 : 400, { error: message });
  });
}

export function apply(ctx) {
  ctx.inject(["webServer"], (serverCtx) => {
    const disposers = [];

    disposers.push(register(serverCtx, `${API}/meta`, (_req, res) => routeHandler(_req, res, () => {
      vaultRoot = resolveVaultPath() || vaultRoot;
      if (!vaultRoot || !existsSync(vaultRoot)) return json(res, 200, { configured: false, vault: null });
      return json(res, 200, { configured: true, vault: { name: path.basename(vaultRoot), path: vaultRoot } });
    })));

    disposers.push(register(serverCtx, `${API}/tree`, (req, res) => routeHandler(req, res, () => {
      const url = new URL(req.url || `${API}/tree`, "http://localhost");
      return json(res, 200, readTree(url.searchParams.get("path") || ""));
    })));

    disposers.push(register(serverCtx, `${API}/file`, (req, res) => routeHandler(req, res, () => {
      const url = new URL(req.url || `${API}/file`, "http://localhost");
      const { relative, absolute } = relativePath(url.searchParams.get("path") || "");
      if (!TEXT_EXTENSIONS.has(path.extname(absolute).toLowerCase())) throw new Error("当前只支持 Markdown 或文本文件");
      const stat = statSync(absolute);
      if (stat.size > MAX_NOTE_BYTES) throw new Error("笔记超过 4 MB，暂不支持打开");
      return json(res, 200, { path: relative, name: path.basename(absolute), content: readFileSync(absolute, "utf8"), modifiedAt: stat.mtimeMs });
    })));

    disposers.push(register(serverCtx, `${API}/asset`, (req, res) => routeHandler(req, res, () => {
      const url = new URL(req.url || `${API}/asset`, "http://localhost");
      const { absolute } = relativePath(url.searchParams.get("path") || "");
      const type = IMAGE_TYPES.get(path.extname(absolute).toLowerCase());
      if (!type) throw new Error("附件类型不支持");
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
      res.end(readFileSync(absolute));
    })));

    disposers.push(register(serverCtx, `${API}/save`, (req, res) => routeHandler(req, res, async () => {
      if (req.method !== "PUT" && req.method !== "POST") throw new Error("保存接口只接受 PUT");
      const payload = JSON.parse(await readBody(req));
      const { relative, absolute } = relativePath(payload.path || "");
      if (!TEXT_EXTENSIONS.has(path.extname(absolute).toLowerCase())) throw new Error("当前只支持保存 Markdown 或文本文件");
      if (typeof payload.content !== "string") throw new Error("保存内容必须是文本");
      writeAtomically(absolute, payload.content);
      return json(res, 200, { ok: true, path: relative, modifiedAt: statSync(absolute).mtimeMs });
    })));

    ctx.effect(() => () => {
      for (const dispose of disposers) dispose?.();
    }, "obsidian-workbench: route lifecycle");
  });
}
