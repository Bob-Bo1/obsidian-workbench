// obsidian-workbench — Client half.
//
// A focused three-column Obsidian-style workbench. The right column reuses the
// currently selected DSH Session, so the user can ask about the open note and
// save edits without leaving the desktop client.

window.__ModuleLoader__.load({
  id: "obsidian-workbench",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");
    const { useCallback, useEffect, useMemo, useRef, useState } = React;

    const API = "/api/obsidian-workbench";
    const css = [
      "._ow_button{box-sizing:border-box;width:36px;height:36px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:19px;line-height:1;transition:background .15s ease,border-color .15s ease,transform .15s ease}",
      "._ow_button:hover{background:var(--dsw-alias-interactive-bg-hover-accent);transform:translateY(-1px)}",
      "._ow_button[data-active=true]{border-color:#7c65d7;background:color-mix(in srgb,#7c65d7 16%,var(--dsw-alias-bg-module-platform))}",
      "._ow_obsidianicon{display:block;width:23px;height:23px;color:#7c65d7}",
      "._ow_overlay{position:fixed;inset:0;z-index:1500;min-width:0;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);display:grid;grid-template-columns:280px 8px minmax(360px,1fr) 8px 360px;overflow:hidden;font-family:var(--ds-font-family,Inter,system-ui,sans-serif)}",
      "._ow_left,._ow_center,._ow_right{min-width:0;min-height:0;overflow:hidden}",
      "._ow_left{display:flex;flex-direction:column;background:color-mix(in srgb,#7c65d7 4%,var(--dsw-specific-sidebar-fill));border-right:1px solid var(--dsw-alias-border-l2)}",
      "._ow_center{display:flex;flex-direction:column;background:var(--dsw-alias-bg-base)}",
      "._ow_right{display:flex;flex-direction:column;background:color-mix(in srgb,#7c65d7 3%,var(--dsw-alias-bg-base));border-left:1px solid var(--dsw-alias-border-l2)}",
      "._ow_resize{position:relative;z-index:2;min-height:0;background:var(--dsw-alias-border-l2);cursor:col-resize;touch-action:none}",
      "._ow_resize::after{content:\"\";position:absolute;inset:0 -3px;cursor:col-resize}",
      "._ow_resize:hover,._ow_resize[data-dragging=true]{background:#7c65d7}",
      "._ow_topbar{height:58px;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}",
      "._ow_vaultmark{width:30px;height:30px;border-radius:9px;background:color-mix(in srgb,#7c65d7 12%,transparent);color:#7c65d7;display:flex;align-items:center;justify-content:center;flex:none}",
      "._ow_vaultmark ._ow_obsidianicon{width:27px;height:27px}",
      "._ow_title{min-width:0;display:flex;flex-direction:column;gap:1px;flex:1}",
      "._ow_title strong{font-size:14px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "._ow_title span{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "._ow_iconbtn{width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:16px;display:inline-flex;align-items:center;justify-content:center;flex:none}",
      "._ow_iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      "._ow_leftbody{min-width:0;min-height:0;flex:1;overflow:auto;overscroll-behavior:contain;padding:10px 8px 18px}",
      "._ow_sectionlabel{padding:7px 8px 6px;color:var(--dsw-alias-label-tertiary);font-size:11px;letter-spacing:.04em;text-transform:uppercase}",
      "._ow_treeentry{width:100%;box-sizing:border-box;border:0;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:7px;min-height:30px;padding:0 8px;display:flex;align-items:center;gap:7px;text-align:left;cursor:pointer;font-size:13px}",
      "._ow_treeentry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      "._ow_treeentry[data-selected=true]{background:color-mix(in srgb,#7c65d7 15%,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-primary)}",
      "._ow_treearrow{width:12px;color:var(--dsw-alias-label-tertiary);font-size:11px;flex:none}",
      "._ow_treeicon{width:17px;text-align:center;flex:none}",
      "._ow_treetext{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}",
      "._ow_treechildren{margin-left:17px}",
      "._ow_editorbar{height:58px;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:0 18px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}",
      "._ow_fileicon{color:#7c65d7;font-size:16px}",
      "._ow_filename{font-size:14px;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}",
      "._ow_dirty{color:#c48a25;font-size:11px;white-space:nowrap}",
      "._ow_mode{display:flex;gap:3px;padding:3px;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover);flex:none}",
      "._ow_mode button{border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);padding:5px 8px;font-size:11px;cursor:pointer}",
      "._ow_mode button[data-active=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 1px 4px rgba(0,0,0,.08)}",
      "._ow_save{border:0;border-radius:7px;background:#7c65d7;color:white;padding:7px 12px;font-size:12px;cursor:pointer;white-space:nowrap}",
      "._ow_save:disabled{opacity:.45;cursor:default}",
      "._ow_editor{min-width:0;min-height:0;flex:1;overflow:auto;overscroll-behavior:contain}",
      "._ow_textarea{display:block;box-sizing:border-box;width:100%;min-height:100%;resize:none;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);padding:32px 42px 60px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:14px;line-height:1.8;tab-size:2}",
      "._ow_preview{box-sizing:border-box;min-height:100%;max-width:900px;margin:0 auto;padding:34px 48px 70px;font-size:15px;line-height:1.8}",
      "._ow_preview h1,._ow_preview h2,._ow_preview h3{font-family:var(--ds-font-family,Inter,system-ui,sans-serif);line-height:1.3;margin:0 0 18px;color:var(--dsw-alias-label-primary)}",
      "._ow_preview h1{font-size:28px}._ow_preview h2{font-size:22px;margin-top:28px}._ow_preview h3{font-size:18px;margin-top:24px}",
      "._ow_preview p{margin:0 0 14px;white-space:pre-wrap}._ow_preview ._ow_blank{height:10px}",
      "._ow_preview ._ow_wikilink{color:#7c65d7;background:color-mix(in srgb,#7c65d7 12%,transparent);border-radius:4px;padding:1px 3px}",
      "._ow_image{max-width:calc(100% - 48px);max-height:70vh;object-fit:contain;margin:34px auto;display:block;border-radius:10px}",
      "._ow_empty{height:100%;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px;text-align:center;padding:30px;box-sizing:border-box}",
      "._ow_status{height:30px;box-sizing:border-box;padding:0 18px;color:var(--dsw-alias-label-tertiary);font-size:11px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--dsw-alias-border-l1);flex:none}",
      "._ow_chathead{height:58px;box-sizing:border-box;display:flex;align-items:center;gap:9px;padding:0 16px;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none}",
      "._ow_chatdot{width:8px;height:8px;border-radius:50%;background:#7c65d7;box-shadow:0 0 0 4px color-mix(in srgb,#7c65d7 16%,transparent)}",
      "._ow_chatname{font-size:13px;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      "._ow_controls{flex:none;display:flex;align-items:center;gap:8px;padding:8px 0 0;border-top:1px solid var(--dsw-alias-border-l2)}",
      "._ow_control{display:flex;align-items:center;gap:6px;min-width:0;flex:1}",
      "._ow_control label{width:auto;flex:none;color:var(--dsw-alias-label-tertiary);font-size:10px}",
      "._ow_select{box-sizing:border-box;min-width:0;flex:1;height:27px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:0 6px;font:11px var(--ds-font-family,Inter,system-ui,sans-serif);outline:0}",
      "._ow_select:focus{border-color:#7c65d7;box-shadow:0 0 0 2px color-mix(in srgb,#7c65d7 15%,transparent)}",
      "._ow_select:disabled{opacity:.55}",
      "._ow_controlhint{font-size:10px;color:var(--dsw-alias-label-tertiary);line-height:1.5}",
      "._ow_chatbody{min-width:0;min-height:0;overflow:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;flex:1;overscroll-behavior:contain}",
      "._ow_msg{max-width:92%;display:flex;flex-direction:column;gap:4px}",
      "._ow_msg[data-role=user]{align-self:flex-end;align-items:flex-end}._ow_msg[data-role=assistant]{align-self:flex-start;align-items:flex-start}",
      "._ow_msglabel{font-size:10px;color:var(--dsw-alias-label-tertiary);padding:0 4px}",
      "._ow_bubble{white-space:pre-wrap;word-break:break-word;border-radius:11px;padding:9px 11px;font-size:12px;line-height:1.65;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      "._ow_msg[data-role=user] ._ow_bubble{background:#7c65d7;color:white;border-bottom-right-radius:4px}",
      "._ow_msg[data-role=assistant] ._ow_bubble{border-bottom-left-radius:4px}",
      "._ow_chatcomposer{padding:10px 12px 12px;border-top:1px solid var(--dsw-alias-border-l2);flex:none}",
      "._ow_chatinput{box-sizing:border-box;width:100%;min-height:76px;max-height:150px;resize:vertical;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);outline:0;padding:9px 10px;font:12px/1.55 var(--ds-font-family,Inter,system-ui,sans-serif)}",
      "._ow_chatinput:focus{border-color:#7c65d7;box-shadow:0 0 0 2px color-mix(in srgb,#7c65d7 15%,transparent)}",
      "._ow_chatfoot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;color:var(--dsw-alias-label-tertiary);font-size:10px}",
      "._ow_send{border:0;border-radius:7px;background:#7c65d7;color:white;padding:7px 12px;font-size:11px;cursor:pointer}",
      "._ow_send:disabled{opacity:.45;cursor:default}",
      "._ow_error{margin:18px;padding:12px;border-radius:9px;background:color-mix(in srgb,#c84b4b 10%,transparent);color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.6}",
      "._ow_hint{padding:16px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.7}",
      "@media(max-width:960px){._ow_overlay{grid-template-columns:220px 8px minmax(280px,1fr)}._ow_resize[data-side=right],._ow_right{display:none}._ow_textarea{padding-left:24px;padding-right:24px}._ow_preview{padding-left:24px;padding-right:24px}}",
      "@media(prefers-reduced-motion:reduce){._ow_button{transition:none;transform:none!important}}"
    ].join("");
    const styleId = "obsidian-workbench/style";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "obsidian-workbench";
      tag.dataset.pluginCss = styleId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    async function requestJson(url, options) {
      const response = await fetch(url, options);
      let payload = null;
      try { payload = await response.json(); } catch {}
      if (!response.ok) throw new Error(payload?.error || `请求失败（${response.status}）`);
      return payload;
    }

    function contentText(content) {
      if (typeof content === "string") return content;
      if (!Array.isArray(content)) return "";
      return content.map((block) => {
        if (block?.type === "text" || block?.kind === "text" || block?.kind === "reasoning") return block.text || "";
        return "";
      }).join("");
    }

    function nodeText(node) {
      if (!node) return "";
      const data = node.data || node;
      if (node.kind === "user" || node.kind === "steering") return contentText(data.content);
      if (node.kind === "assistant-step" || node.kind === "assistant") return contentText(data.blocks || data.content);
      if (node.kind === "turn-error" || node.kind === "unknown") return data.message || node.message || "";
      if (node.kind === "model-retry") return data.current?.message || "模型正在重试";
      return "";
    }

    function useCurrentSession(sessions) {
      const [listSnapshot, setListSnapshot] = useState(() => sessions?.list?.getSnapshot?.() || null);
      useEffect(() => {
        const store = sessions?.list;
        if (!store?.subscribe) {
          setListSnapshot(null);
          return undefined;
        }
        const update = () => setListSnapshot(store.getSnapshot());
        update();
        return store.subscribe(update);
      }, [sessions]);
      const currentId = listSnapshot?.current;
      const session = currentId === undefined ? undefined : sessions.binding(currentId)?.session;
      const [snapshot, setSnapshot] = useState(() => session?.getSnapshot?.() || null);
      useEffect(() => {
        if (!session?.subscribe) {
          setSnapshot(null);
          return undefined;
        }
        const update = () => setSnapshot(session.getSnapshot());
        update();
        return session.subscribe(update);
      }, [session]);
      return { currentId, session, snapshot, listSnapshot };
    }

    function chatItems(snapshot) {
      const order = snapshot?.chat?.order || [];
      const nodes = snapshot?.chat?.nodes;
      return order.map((key) => {
        const node = typeof nodes?.get === "function" ? nodes.get(key) : nodes?.[key];
        const text = nodeText(node);
        if (!text.trim()) return null;
        const role = node.kind === "user" || node.kind === "steering" ? "user" : "assistant";
        return { key, role, text: text.trim() };
      }).filter(Boolean).slice(-40);
    }

    function previewLine(line, key) {
      const parts = String(line).split(/(\[\[[^\]]+\]\])/g);
      return React.createElement("p", { key }, parts.map((part, index) => part.startsWith("[[")
        ? React.createElement("span", { className: "_ow_wikilink", key: `${key}-${index}` }, part)
        : part));
    }

    function markdownPreview(markdown) {
      const lines = String(markdown || "").split(/\r?\n/);
      return lines.map((line, index) => {
        if (line.trim() === "") return React.createElement("div", { className: "_ow_blank", key: index });
        if (/^###\s+/.test(line)) return React.createElement("h3", { key: index }, line.replace(/^###\s+/, ""));
        if (/^##\s+/.test(line)) return React.createElement("h2", { key: index }, line.replace(/^##\s+/, ""));
        if (/^#\s+/.test(line)) return React.createElement("h1", { key: index }, line.replace(/^#\s+/, ""));
        if (/^```/.test(line)) return React.createElement("p", { key: index, className: "_ow_codehint" }, line);
        return previewLine(line, index);
      });
    }

    function TreeDirectory({ entry, selected, onOpen }) {
      const [open, setOpen] = useState(false);
      const [tree, setTree] = useState(null);
      const [error, setError] = useState("");
      const toggle = async () => {
        const next = !open;
        setOpen(next);
        if (next && tree === null) {
          try { setTree(await requestJson(`${API}/tree?path=${encodeURIComponent(entry.path)}`)); }
          catch (e) { setError(e.message); }
        }
      };
      return React.createElement(React.Fragment, null,
        React.createElement("button", { className: "_ow_treeentry", type: "button", onClick: toggle },
          React.createElement("span", { className: "_ow_treearrow" }, open ? "⌄" : "›"),
          React.createElement("span", { className: "_ow_treeicon" }, open ? "▾" : "▸"),
          React.createElement("span", { className: "_ow_treetext" }, entry.name)),
        open && React.createElement("div", { className: "_ow_treechildren" },
          error ? React.createElement("div", { className: "_ow_hint" }, error) : tree && React.createElement(TreeContents, { tree, selected, onOpen }))
      );
    }

    function TreeContents({ tree, selected, onOpen }) {
      return React.createElement(React.Fragment, null,
        tree.dirs.map((entry) => React.createElement(TreeDirectory, { key: entry.path, entry, selected, onOpen })),
        tree.files.map((entry) => React.createElement("button", {
          key: entry.path,
          className: "_ow_treeentry",
          type: "button",
          "data-selected": selected === entry.path,
          onClick: () => onOpen(entry)
        },
          React.createElement("span", { className: "_ow_treearrow" }),
          React.createElement("span", { className: "_ow_treeicon" }, entry.kind === "image" ? "▧" : "·"),
          React.createElement("span", { className: "_ow_treetext" }, entry.name)))
      );
    }

    function VaultTree({ selected, onOpen }) {
      const [tree, setTree] = useState(null);
      const [error, setError] = useState("");
      const load = useCallback(() => requestJson(`${API}/tree`).then(setTree).catch((e) => setError(e.message)), []);
      useEffect(() => { load(); }, [load]);
      if (error) return React.createElement("div", { className: "_ow_error" }, error);
      if (!tree) return React.createElement("div", { className: "_ow_hint" }, "正在读取仓库…");
      return React.createElement(TreeContents, { tree, selected, onOpen });
    }

    function displayPermissionName(option) {
      const value = option?.name || option?.value || "";
      if (value === "danger-full-access") return "Full access";
      return value.split("-").map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part).join(" ");
    }

    function SessionControls({ session, currentId, listSnapshot, modelDirectories }) {
      const [directory, setDirectory] = useState(null);
      const [modelState, setModelState] = useState(null);
      const [projectionValues, setProjectionValues] = useState(() => session?.projections?.values?.() || null);
      const [modelError, setModelError] = useState("");
      const [permissionError, setPermissionError] = useState("");
      const [permissionBusy, setPermissionBusy] = useState(false);

      useEffect(() => {
        if (!session?.projections?.subscribeAny) {
          setProjectionValues(null);
          return undefined;
        }
        const update = () => setProjectionValues(session.projections.values());
        update();
        return session.projections.subscribeAny(update);
      }, [session]);

      useEffect(() => {
        if (!currentId || !modelDirectories?.directoryFor) {
          setDirectory(null);
          setModelState(null);
          return undefined;
        }
        let nextDirectory;
        try {
          nextDirectory = modelDirectories.directoryFor(currentId);
        } catch (error) {
          setDirectory(null);
          setModelState(null);
          setModelError(error.message);
          return undefined;
        }
        setDirectory(nextDirectory);
        setModelState(nextDirectory.store.getSnapshot());
        setModelError("");
        const stop = nextDirectory.store.subscribe(() => setModelState(nextDirectory.store.getSnapshot()));
        nextDirectory.load().catch((error) => setModelError(error.message));
        return stop;
      }, [currentId, modelDirectories]);

      const modelOptions = useMemo(() => (modelState?.groups || []).flatMap((group) => (group.models || []).map((model) => ({
        value: `${group.id}::${model.id}`,
        provider: group.id,
        model: model.id,
        label: model.name || model.id,
        detail: group.name || group.id,
        reasoningEffort: model.reasoning?.defaultEffort
      }))), [modelState]);
      const currentModel = modelState?.current;
      const currentModelValue = currentModel ? `${currentModel.provider}::${currentModel.model}` : "";
      const currentItem = listSnapshot?.items?.find((item) => (item.sessionId || item.id) === currentId);
      const permissions = projectionValues?.permissions || currentItem?.projectionValues?.permissions;
      const permissionOptions = (permissions?.options || []).filter((option) => option.value !== "custom");

      const selectModel = async (event) => {
        const choice = modelOptions.find((option) => option.value === event.target.value);
        if (!choice || !directory) return;
        setModelError("");
        try {
          await directory.select({
            provider: choice.provider,
            model: choice.model,
            ...choice.reasoningEffort === undefined ? {} : { reasoningEffort: choice.reasoningEffort }
          });
        } catch (error) {
          setModelError(error.message);
        }
      };

      const selectPermission = async (event) => {
        const value = event.target.value;
        if (!value || !session || permissionBusy) return;
        if (value === "danger-full-access" && !window.confirm("Full access 会允许当前会话执行更高风险的操作。确定要切换吗？")) {
          event.target.value = permissions?.currentValue || "";
          return;
        }
        setPermissionBusy(true);
        setPermissionError("");
        try {
          const result = await session.command(`/permission ${value}`);
          if (result && result.ok === false) throw new Error(result.error?.message || "权限切换失败");
        } catch (error) {
          setPermissionError(error.message);
        } finally {
          setPermissionBusy(false);
        }
      };

      return React.createElement("div", { className: "_ow_controls" },
        React.createElement("div", { className: "_ow_control" },
          React.createElement("label", null, "模型"),
          React.createElement("select", {
            className: "_ow_select",
            value: currentModelValue,
            disabled: !session || !directory || modelState?.status === "loading" || modelState?.status === "selecting" || modelOptions.length === 0,
            onChange: selectModel,
            title: modelError || "切换当前 DSH 会话模型"
          },
            !currentModelValue && React.createElement("option", { value: "" }, modelState?.status === "loading" ? "正在读取模型…" : "选择模型"),
            modelOptions.map((option) => React.createElement("option", { value: option.value, key: option.value }, `${option.label} · ${option.detail}`)))),
        React.createElement("div", { className: "_ow_control" },
          React.createElement("label", null, "权限"),
          React.createElement("select", {
            className: "_ow_select",
            value: permissions?.currentValue || "",
            disabled: !session || permissionBusy || permissionOptions.length === 0,
            onChange: selectPermission,
            title: permissionError || "切换当前 DSH 会话权限"
          },
            !permissions && React.createElement("option", { value: "" }, session ? "当前会话未提供权限选项" : "请先打开会话"),
            permissionOptions.map((option) => React.createElement("option", { value: option.value, key: option.value }, displayPermissionName(option)))),
        (modelError || permissionError) && React.createElement("div", { className: "_ow_controlhint" }, modelError || permissionError))
      );
    }

    function ChatPanel({ sessions, modelDirectories, notePath, noteContent }) {
      const { currentId, session, snapshot, listSnapshot } = useCurrentSession(sessions);
      const [draft, setDraft] = useState("");
      const [sending, setSending] = useState(false);
      const [error, setError] = useState("");
      const items = useMemo(() => chatItems(snapshot), [snapshot]);
      const send = async () => {
        const question = draft.trim();
        if (!question || !session || sending) return;
        setSending(true);
        setError("");
        setDraft("");
        const context = notePath && noteContent !== null
          ? `\n\n当前 Obsidian 笔记：${notePath}\n\n笔记内容：\n${noteContent.slice(0, 16000)}\n\n用户问题：${question}`
          : question;
        try {
          const result = await session.prompt([{ type: "text", text: context }], "queue");
          if (!result?.ok) throw new Error(result?.error?.message || "消息没有发送成功");
        } catch (e) {
          setError(e.message);
        } finally {
          setSending(false);
        }
      };
      return React.createElement("div", { className: "_ow_right" },
        React.createElement("div", { className: "_ow_chathead" },
          React.createElement("span", { className: "_ow_chatdot" }),
          React.createElement("span", { className: "_ow_chatname" }, session ? "当前 DSH 会话" : "DSH 对话")),
        React.createElement("div", { className: "_ow_chatbody" },
          !session && React.createElement("div", { className: "_ow_hint" }, "请先在 DSH 中打开一个会话，右侧就能继续使用当前对话。"),
          session && items.length === 0 && React.createElement("div", { className: "_ow_hint" }, "从当前笔记开始提问。发送后，AI 会继续写入当前 DSH 会话。"),
          items.map((item) => React.createElement("div", { className: "_ow_msg", "data-role": item.role, key: item.key },
            React.createElement("span", { className: "_ow_msglabel" }, item.role === "user" ? "你" : "DeepSeek"),
            React.createElement("div", { className: "_ow_bubble" }, item.text))),
          error && React.createElement("div", { className: "_ow_error" }, error)),
        React.createElement("div", { className: "_ow_chatcomposer" },
          React.createElement("textarea", {
            className: "_ow_chatinput",
            value: draft,
            disabled: !session || sending,
            placeholder: session ? "围绕当前笔记提问…" : "请先打开一个 DSH 会话",
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                send();
              }
            }
          }),
          React.createElement(SessionControls, { session, currentId, listSnapshot, modelDirectories }),
          React.createElement("div", { className: "_ow_chatfoot" },
            React.createElement("span", null, "Ctrl/Cmd + Enter 发送"),
            React.createElement("button", { className: "_ow_send", type: "button", disabled: !session || !draft.trim() || sending, onClick: send }, sending ? "发送中…" : "发送")))
      );
    }

    function ResizeHandle({ side, dragging, onPointerDown }) {
      return React.createElement("div", {
        className: "_ow_resize",
        "data-side": side,
        "data-dragging": dragging,
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": side === "left" ? "调整左侧栏宽度" : "调整右侧栏宽度",
        onPointerDown: (event) => onPointerDown(side, event)
      });
    }

    function Workbench({ onClose, sessions, modelDirectories }) {
      const [meta, setMeta] = useState(null);
      const [metaError, setMetaError] = useState("");
      const [selected, setSelected] = useState("");
      const [note, setNote] = useState(null);
      const [editor, setEditor] = useState("");
      const [view, setView] = useState("edit");
      const [saving, setSaving] = useState(false);
      const [status, setStatus] = useState("就绪");
      const [widths, setWidths] = useState({ left: 280, right: 360 });
      const [drag, setDrag] = useState(null);
      const rootRef = useRef(null);

      useEffect(() => {
        requestJson(`${API}/meta`).then(setMeta).catch((e) => setMetaError(e.message));
        rootRef.current?.focus();
      }, []);

      useEffect(() => {
        if (!drag) return undefined;
        const move = (event) => {
          const delta = event.clientX - drag.startX;
          if (drag.side === "left") {
            setWidths((value) => ({ ...value, left: Math.max(220, Math.min(460, drag.startLeft + delta)) }));
          } else {
            setWidths((value) => ({ ...value, right: Math.max(280, Math.min(560, drag.startRight - delta)) }));
          }
        };
        const stop = () => setDrag(null);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        return () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", stop);
          window.removeEventListener("pointercancel", stop);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        };
      }, [drag]);

      const startResize = (side, event) => {
        event.preventDefault();
        setDrag({ side, startX: event.clientX, startLeft: widths.left, startRight: widths.right });
      };

      const openFile = async (entry) => {
        if (entry.kind === "image") {
          setSelected(entry.path);
          setNote({ path: entry.path, name: entry.name, image: true });
          setStatus("已打开附件");
          return;
        }
        try {
          setStatus("正在读取…");
          const payload = await requestJson(`${API}/file?path=${encodeURIComponent(entry.path)}`);
          setSelected(entry.path);
          setNote(payload);
          setEditor(payload.content);
          setView("edit");
          setStatus("已加载");
        } catch (e) {
          setStatus(e.message);
        }
      };

      const save = async () => {
        if (!note?.path || note.image || saving) return;
        setSaving(true);
        setStatus("保存中…");
        try {
          const payload = await requestJson(`${API}/save`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: note.path, content: editor })
          });
          setNote((value) => ({ ...value, content: editor, modifiedAt: payload.modifiedAt }));
          setStatus("已保存");
        } catch (e) {
          setStatus(e.message);
        } finally {
          setSaving(false);
        }
      };

      const dirty = Boolean(note && !note.image && note.content !== editor);
      const onKeyDown = (event) => {
        if (event.key === "Escape") onClose();
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          save();
        }
      };

      const vaultName = meta?.vault?.name || "Obsidian";
      return React.createElement("div", {
        className: "_ow_overlay",
        ref: rootRef,
        tabIndex: -1,
        onKeyDown,
        style: { gridTemplateColumns: `${widths.left}px 8px minmax(360px, 1fr) 8px ${widths.right}px` }
      },
        React.createElement("aside", { className: "_ow_left" },
          React.createElement("div", { className: "_ow_topbar" },
            React.createElement("div", { className: "_ow_vaultmark" }, React.createElement(ObsidianIcon)),
            React.createElement("div", { className: "_ow_title" },
              React.createElement("strong", null, vaultName),
              React.createElement("span", null, meta?.vault?.path || "正在读取仓库路径…")),
            React.createElement("button", { className: "_ow_iconbtn", type: "button", title: "关闭工作台", onClick: onClose }, "×")),
          React.createElement("div", { className: "_ow_leftbody" },
            React.createElement("div", { className: "_ow_sectionlabel" }, "仓库"),
            metaError ? React.createElement("div", { className: "_ow_error" }, metaError) : !meta?.configured ? React.createElement("div", { className: "_ow_hint" }, "没有找到本机 Obsidian 仓库。可以通过 OBSIDIAN_VAULT_PATH 指定路径。") : React.createElement(VaultTree, { selected, onOpen: openFile }))),
        React.createElement(ResizeHandle, { side: "left", dragging: drag?.side === "left", onPointerDown: startResize }),
        React.createElement("main", { className: "_ow_center" },
          React.createElement("div", { className: "_ow_editorbar" },
            React.createElement("span", { className: "_ow_fileicon" }, note?.image ? "▧" : "✦"),
            React.createElement("span", { className: "_ow_filename" }, note?.name || "选择一篇笔记"),
            dirty && React.createElement("span", { className: "_ow_dirty" }, "未保存"),
            note && !note.image && React.createElement("div", { className: "_ow_mode" },
              React.createElement("button", { type: "button", "data-active": view === "edit", onClick: () => setView("edit") }, "编辑"),
              React.createElement("button", { type: "button", "data-active": view === "preview", onClick: () => setView("preview") }, "预览")),
            note && !note.image && React.createElement("button", { className: "_ow_save", type: "button", disabled: !dirty || saving, onClick: save }, saving ? "保存中" : "保存")),
          React.createElement("div", { className: "_ow_editor" },
            metaError && React.createElement("div", { className: "_ow_error" }, metaError),
            !note && !metaError && React.createElement("div", { className: "_ow_empty" }, "从左侧选择一篇 Markdown 笔记"),
            note?.image && React.createElement("img", { className: "_ow_image", src: `${API}/asset?path=${encodeURIComponent(note.path)}`, alt: note.name }),
            note && !note.image && view === "edit" && React.createElement("textarea", { className: "_ow_textarea", value: editor, onChange: (event) => setEditor(event.target.value), spellCheck: false }),
            note && !note.image && view === "preview" && React.createElement("article", { className: "_ow_preview" }, markdownPreview(editor))),
          React.createElement("div", { className: "_ow_status" }, React.createElement("span", null, status), React.createElement("span", null, note?.path || ""))),
        React.createElement(ResizeHandle, { side: "right", dragging: drag?.side === "right", onPointerDown: startResize }),
        React.createElement(ChatPanel, { sessions, modelDirectories, notePath: note?.path, noteContent: note?.image ? null : editor }));
    }

    function ObsidianIcon() {
      return React.createElement("svg", {
        className: "_ow_obsidianicon",
        viewBox: "0 0 24 24",
        fill: "none",
        "aria-hidden": true
      },
        React.createElement("path", { d: "M7.1 3.2 12 1l4.9 2.2 3.2 6.2-2.3 8.5L12 21.8l-5.8-3.9-2.3-8.5 3.2-6.2Z", fill: "currentColor", opacity: "0.22" }),
        React.createElement("path", { d: "M7.1 3.2 12 1v20.8l-5.8-3.9-2.3-8.5 3.2-6.2Z", fill: "currentColor", opacity: "0.92" }),
        React.createElement("path", { d: "m12 1 4.9 2.2 3.2 6.2-2.3 8.5-5.8 3.9V1Z", fill: "currentColor", opacity: "0.58" }),
        React.createElement("path", { d: "m7.1 3.2 4.9 5.1 4.9-5.1M4 9.4l8 10.1 8-10.1", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "0.9", strokeLinejoin: "round", opacity: "0.8" }),
        React.createElement("path", { d: "M12 8.3v11.2", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "0.9", opacity: "0.8" })
      );
    }

    function Launcher({ sessions, modelDirectories }) {
      const [open, setOpen] = useState(false);
      return React.createElement("div", { style: { position: "relative" } },
        React.createElement("button", {
          className: "_ow_button",
          type: "button",
          "data-active": open,
          "aria-label": "打开 Obsidian 工作台",
          title: "Obsidian 工作台",
          onClick: () => setOpen((value) => !value)
        }, React.createElement(ObsidianIcon)),
        open && React.createElement(Workbench, { sessions, modelDirectories, onClose: () => setOpen(false) }));
    }

    const inject = ["slots", "sessions", "conversation", "modelDirectories"];
    function apply(ctx) {
      const slots = ctx.get("slots");
      const sessions = ctx.get("sessions");
      const modelDirectories = ctx.get("modelDirectories");
      if (slots === undefined || sessions === undefined) return;
      ctx.slots.inject("sidebar.footer.action", () => slots.register({
        name: "sidebar.footer.action",
        id: "obsidian-workbench"
      }, () => React.createElement(Launcher, { sessions, modelDirectories })));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
