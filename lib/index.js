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
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";

const API = "/api/obsidian-workbench";
const MAX_NOTE_BYTES = 4 * 1024 * 1024;
const MAX_SEARCH_FILES = 5000;
const MAX_SEARCH_RESULTS = 100;
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

function relativePath(raw, { mustExist = true } = {}) {
  const root = ensureVault();
  const decoded = decodeURIComponent(String(raw || "")).replace(/^[/\\]+/, "");
  const absolute = path.resolve(root, decoded);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("路径超出 Obsidian 仓库范围");
  const parts = relative.split(path.sep).filter(Boolean);
  if (parts.some((part) => part === ".obsidian" || part.startsWith("."))) throw new Error("隐藏目录不开放访问");
  if (!existsSync(absolute)) {
    if (mustExist) throw new Error("文件或目录不存在");
    const parent = path.dirname(absolute);
    if (!existsSync(parent) || !statSync(parent).isDirectory()) throw new Error("目标文件夹不存在");
    const realParent = realpathSync(parent);
    const parentRelative = path.relative(root, realParent);
    if (parentRelative.startsWith("..") || path.isAbsolute(parentRelative)) throw new Error("路径超出 Obsidian 仓库范围");
    return { relative: relative.replace(/\\/g, "/"), absolute };
  }
  const realAbsolute = realpathSync(absolute);
  const realRelative = path.relative(root, realAbsolute);
  if (realRelative.startsWith("..") || path.isAbsolute(realRelative)) throw new Error("路径超出 Obsidian 仓库范围");
  return { relative: realRelative.replace(/\\/g, "/"), absolute: realAbsolute };
}

function validateName(raw, label) {
  const name = String(raw || "").trim();
  if (!name || name === "." || name === ".." || name.includes("/") || name.includes("\\")) {
    throw new Error(`${label}名称不合法`);
  }
  if (name.startsWith(".")) throw new Error("隐藏文件或文件夹不开放操作");
  return name;
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

function searchVault(rawQuery) {
  const query = String(rawQuery || "").trim();
  if (!query) return { query: "", results: [], truncated: false };
  const normalized = query.toLocaleLowerCase("zh-CN");
  const results = [];
  let scannedFiles = 0;
  let truncated = false;

  const walk = (directory) => {
    if (results.length >= MAX_SEARCH_RESULTS || scannedFiles >= MAX_SEARCH_FILES) {
      truncated = true;
      return;
    }
    let entries = [];
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        if (truncated) return;
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (!TEXT_EXTENSIONS.has(ext)) continue;
      scannedFiles += 1;
      const relative = path.relative(ensureVault(), absolute).replace(/\\/g, "/");
      const nameMatch = entry.name.toLocaleLowerCase("zh-CN").includes(normalized);
      let excerpt = "";
      let lineNumber = 0;
      try {
        const stat = statSync(absolute);
        if (stat.size <= MAX_NOTE_BYTES) {
          const content = readFileSync(absolute, "utf8");
          const lines = content.split(/\r?\n/);
          const matchIndex = lines.findIndex((line) => line.toLocaleLowerCase("zh-CN").includes(normalized));
          if (matchIndex >= 0) {
            lineNumber = matchIndex + 1;
            excerpt = lines[matchIndex].trim().slice(0, 160);
          }
        }
      } catch {
        continue;
      }
      if (!nameMatch && !excerpt) continue;
      results.push({ name: entry.name, path: relative, kind: "file", lineNumber, excerpt });
      if (results.length >= MAX_SEARCH_RESULTS) {
        truncated = true;
        return;
      }
    }
  };

  walk(ensureVault());
  return { query, results, truncated };
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

    disposers.push(register(serverCtx, `${API}/search`, (req, res) => routeHandler(req, res, () => {
      const url = new URL(req.url || `${API}/search`, "http://localhost");
      return json(res, 200, searchVault(url.searchParams.get("q") || ""));
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

    disposers.push(register(serverCtx, `${API}/create-folder`, (req, res) => routeHandler(req, res, async () => {
      if (req.method !== "POST") throw new Error("新建文件夹接口只接受 POST");
      const payload = JSON.parse(await readBody(req));
      const name = validateName(payload.name, "文件夹");
      const parent = relativePath(payload.parent || "");
      const target = relativePath(path.join(parent.relative, name), { mustExist: false });
      if (existsSync(target.absolute)) throw new Error("同名文件或文件夹已经存在");
      mkdirSync(target.absolute);
      return json(res, 201, { ok: true, path: target.relative, kind: "directory" });
    })));

    disposers.push(register(serverCtx, `${API}/create-note`, (req, res) => routeHandler(req, res, async () => {
      if (req.method !== "POST") throw new Error("新建笔记接口只接受 POST");
      const payload = JSON.parse(await readBody(req));
      let name = validateName(payload.name, "笔记");
      if (!TEXT_EXTENSIONS.has(path.extname(name).toLowerCase())) name += ".md";
      const parent = relativePath(payload.parent || "");
      const target = relativePath(path.join(parent.relative, name), { mustExist: false });
      if (existsSync(target.absolute)) throw new Error("同名文件已经存在");
      writeAtomically(target.absolute, typeof payload.content === "string" ? payload.content : "");
      return json(res, 201, { ok: true, path: target.relative, name, kind: "file", content: typeof payload.content === "string" ? payload.content : "" });
    })));

    disposers.push(register(serverCtx, `${API}/rename`, (req, res) => routeHandler(req, res, async () => {
      if (req.method !== "POST") throw new Error("重命名接口只接受 POST");
      const payload = JSON.parse(await readBody(req));
      const source = relativePath(payload.path || "");
      if (!source.relative) throw new Error("不能重命名仓库根目录");
      const name = validateName(payload.name, "名称");
      if (name === path.basename(source.absolute)) throw new Error("名称没有变化");
      const parent = path.relative(ensureVault(), path.dirname(source.absolute)).replace(/\\/g, "/");
      const target = relativePath(path.join(parent, name), { mustExist: false });
      if (existsSync(target.absolute)) throw new Error("同名文件或文件夹已经存在");
      const kind = statSync(source.absolute).isDirectory() ? "directory" : "file";
      renameSync(source.absolute, target.absolute);
      return json(res, 200, { ok: true, from: source.relative, path: target.relative, name, kind });
    })));

    disposers.push(register(serverCtx, `${API}/move`, (req, res) => routeHandler(req, res, async () => {
      if (req.method !== "POST") throw new Error("移动接口只接受 POST");
      const payload = JSON.parse(await readBody(req));
      const source = relativePath(payload.source || "");
      if (!source.relative) throw new Error("不能移动仓库根目录");
      const destination = relativePath(payload.destination || "");
      if (!statSync(destination.absolute).isDirectory()) throw new Error("目标位置必须是文件夹");
      const sourceIsDirectory = statSync(source.absolute).isDirectory();
      const nested = path.relative(source.absolute, destination.absolute);
      if (sourceIsDirectory && nested && !nested.startsWith("..") && !path.isAbsolute(nested)) {
        throw new Error("不能把文件夹移动到自己或子文件夹内");
      }
      const targetAbsolute = path.join(destination.absolute, path.basename(source.absolute));
      if (existsSync(targetAbsolute)) throw new Error("目标位置已有同名文件或文件夹");
      renameSync(source.absolute, targetAbsolute);
      const movedPath = path.relative(ensureVault(), targetAbsolute).replace(/\\/g, "/");
      return json(res, 200, { ok: true, from: source.relative, path: movedPath, kind: sourceIsDirectory ? "directory" : "file" });
    })));

    disposers.push(register(serverCtx, `${API}/delete`, (req, res) => routeHandler(req, res, async () => {
      if (req.method !== "POST") throw new Error("删除接口只接受 POST");
      const payload = JSON.parse(await readBody(req));
      const target = relativePath(payload.path || "");
      if (!target.relative) throw new Error("不能删除 Obsidian 仓库根目录");
      const targetIsDirectory = statSync(target.absolute).isDirectory();
      rmSync(target.absolute, { recursive: targetIsDirectory, force: false });
      return json(res, 200, { ok: true, path: target.relative, kind: targetIsDirectory ? "directory" : "file" });
    })));

    ctx.effect(() => () => {
      for (const dispose of disposers) dispose?.();
    }, "obsidian-workbench: route lifecycle");
  });
}
