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
      "._ow_overlay{position:fixed;inset:0;z-index:1500;min-width:0;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);display:grid;grid-template-columns:280px 1px minmax(360px,1fr) 1px 360px;overflow:hidden;font-family:var(--ds-font-family,Inter,system-ui,sans-serif)}",
      "._ow_left,._ow_center,._ow_right{min-width:0;min-height:0;overflow:hidden}",
      "._ow_left{display:flex;flex-direction:column;background:color-mix(in srgb,#7c65d7 4%,var(--dsw-specific-sidebar-fill))}",
      "._ow_center{display:flex;flex-direction:column;background:var(--dsw-alias-bg-base)}",
      "._ow_right{display:flex;flex-direction:column;background:color-mix(in srgb,#7c65d7 3%,var(--dsw-alias-bg-base))}",
      "._ow_resize{position:relative;z-index:2;min-height:0;background:var(--dsw-alias-border-l2);cursor:col-resize;touch-action:none}",
      "._ow_resize::after{content:\"\";position:absolute;inset:0 -4px;cursor:col-resize}",
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
      "._ow_sectionhead{display:flex;align-items:center;gap:5px;padding:4px 4px 6px 8px;color:var(--dsw-alias-label-tertiary)}",
      "._ow_sectionlabel{min-width:0;flex:1;font-size:11px;letter-spacing:.04em;text-transform:uppercase}",
      "._ow_searchbar{display:flex;align-items:center;gap:5px;margin:0 4px 8px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base)}",
      "._ow_searchbar:focus-within{border-color:#7c65d7;box-shadow:0 0 0 2px color-mix(in srgb,#7c65d7 12%,transparent)}",
      "._ow_searchinput{min-width:0;flex:1;height:29px;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:12px var(--ds-font-family,Inter,system-ui,sans-serif)}",
      "._ow_searchinput::placeholder{color:var(--dsw-alias-label-tertiary)}",
      "._ow_searchclear{border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:15px;padding:0 2px}",
      "._ow_searchresult{width:100%;box-sizing:border-box;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);padding:7px 8px;text-align:left;cursor:pointer}",
      "._ow_searchresult:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      "._ow_searchname{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}",
      "._ow_searchpath{display:block;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:10px}",
      "._ow_searchexcerpt{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:10px}",
      "._ow_treeactions{display:flex;align-items:center;gap:2px}",
      "._ow_mini{width:25px;height:25px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:17px;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}",
      "._ow_mini:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      "._ow_movebar{display:flex;align-items:center;gap:7px;margin:0 4px 7px;padding:6px 8px;border:1px solid color-mix(in srgb,#7c65d7 24%,var(--dsw-alias-border-l2));border-radius:8px;background:color-mix(in srgb,#7c65d7 7%,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.35}",
      "._ow_movebar[data-dragging=true]{border-color:#7c65d7;background:color-mix(in srgb,#7c65d7 14%,var(--dsw-alias-bg-base))}",
      "._ow_moveinfo{min-width:0;flex:1;display:flex;flex-direction:column;gap:1px;overflow:hidden}",
      "._ow_moveinfo strong,._ow_moveinfo span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "._ow_moveinfo strong{font-size:11px;font-weight:600;color:var(--dsw-alias-label-primary)}",
      "._ow_moveinfo span{font-size:10px;color:var(--dsw-alias-label-tertiary)}",
      "._ow_moveaction{border:0;background:transparent;color:#7c65d7;font-size:11px;cursor:pointer;white-space:nowrap;padding:2px 3px}",
      "._ow_moveaction:hover{text-decoration:underline}",
      "._ow_contextmenu{position:fixed;z-index:2000;min-width:190px;padding:5px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base);box-shadow:0 12px 32px rgba(36,30,18,.18)}",
      "._ow_contextitem{display:flex;align-items:center;gap:9px;width:100%;box-sizing:border-box;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);padding:8px 10px;text-align:left;font-size:12px;cursor:pointer}",
      "._ow_contextitem:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      "._ow_contextitem[data-danger=true]{color:var(--dsw-alias-state-error-primary)}",
      "._ow_contextsep{height:1px;margin:5px 2px;background:var(--dsw-alias-border-l1)}",
      "._ow_dialogbackdrop{position:fixed;inset:0;z-index:2100;background:rgba(36,30,18,.18);display:flex;align-items:center;justify-content:center;padding:20px}",
      "._ow_dialog{width:min(340px,calc(100vw - 40px));box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-base);box-shadow:0 16px 44px rgba(36,30,18,.22);padding:16px}",
      "._ow_dialogtitle{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:12px}",
      "._ow_dialogcopy{margin:-3px 0 2px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}",
      "._ow_dialoginput{box-sizing:border-box;width:100%;height:36px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);outline:0;padding:0 10px;font:13px var(--ds-font-family,Inter,system-ui,sans-serif)}",
      "._ow_dialoginput:focus{border-color:#7c65d7;box-shadow:0 0 0 2px color-mix(in srgb,#7c65d7 15%,transparent)}",
      "._ow_dialogactions{display:flex;justify-content:flex-end;gap:7px;margin-top:14px}",
      "._ow_dialogbutton{border:0;border-radius:7px;padding:7px 12px;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer}",
      "._ow_dialogbutton[data-primary=true]{background:#7c65d7;color:white}",
      "._ow_dialogbutton[data-danger=true]{background:var(--dsw-alias-state-error-primary);color:white}",
      "._ow_treeentry{width:100%;box-sizing:border-box;border:0;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:7px;min-height:30px;padding:0 8px;display:flex;align-items:center;gap:7px;text-align:left;cursor:pointer;font-size:13px}",
      "._ow_treeentry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      "._ow_treeentry[data-selected=true]{background:color-mix(in srgb,#7c65d7 15%,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-primary)}",
      "._ow_treeentry[data-moving=true]{background:color-mix(in srgb,#7c65d7 18%,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-primary)}",
      "._ow_treeentry[data-drop-target=true]{background:color-mix(in srgb,#7c65d7 18%,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1px color-mix(in srgb,#7c65d7 70%,transparent)}",
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
      "._ow_controls{min-width:0;flex:1;display:flex;align-items:center;gap:4px}",
      "._ow_control{display:flex;align-items:center;min-width:0;flex:1}",
      "._ow_control:last-child{flex:1.25}",
      "._ow_control label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",
      "._ow_select{box-sizing:border-box;min-width:0;width:100%;height:32px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);padding:0 5px;font:12px var(--ds-font-family,Inter,system-ui,sans-serif);outline:0;text-overflow:ellipsis}",
      "._ow_select:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      "._ow_select:focus{background:var(--dsw-alias-interactive-bg-hover);box-shadow:0 0 0 2px color-mix(in srgb,#7c65d7 15%,transparent)}",
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
      "._ow_compbox{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:16px;background:var(--dsw-alias-bg-base);box-shadow:0 2px 9px rgba(36,30,18,.08);padding:11px 10px 7px;transition:border-color .15s ease,box-shadow .15s ease}",
      "._ow_compbox:focus-within{border-color:color-mix(in srgb,#7c65d7 48%,var(--dsw-alias-border-l2));box-shadow:0 0 0 2px color-mix(in srgb,#7c65d7 11%,transparent),0 2px 9px rgba(36,30,18,.08)}",
      "._ow_chatinput{display:block;box-sizing:border-box;width:100%;min-height:54px;max-height:140px;resize:vertical;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);outline:0;padding:0 1px;font:13px/1.55 var(--ds-font-family,Inter,system-ui,sans-serif)}",
      "._ow_chatinput::placeholder{color:var(--dsw-alias-label-tertiary);opacity:.9}",
      "._ow_compbar{display:flex;align-items:center;gap:6px;min-width:0;margin-top:8px;min-height:34px}",
      "._ow_compadd{box-sizing:border-box;width:32px;height:32px;border:0;border-radius:50%;background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-size:23px;font-weight:300;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none}",
      "._ow_compadd:hover{background:var(--dsw-alias-interactive-bg-hover-accent)}",
      "._ow_chatfoot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:8px 4px 0;color:var(--dsw-alias-label-tertiary);font-size:10px}",
      "._ow_send{box-sizing:border-box;width:40px;height:40px;border:0;border-radius:50%;background:#cfc19b;color:white;padding:0;font-size:24px;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none}",
      "._ow_send:hover{background:#c3b487}",
      "._ow_send:disabled{opacity:.48;cursor:default}",
      "._ow_error{margin:18px;padding:12px;border-radius:9px;background:color-mix(in srgb,#c84b4b 10%,transparent);color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.6}",
      "._ow_hint{padding:16px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.7}",
      "@media(max-width:960px){._ow_overlay{grid-template-columns:220px 1px minmax(280px,1fr)}._ow_resize[data-side=right],._ow_right{display:none}._ow_textarea{padding-left:24px;padding-right:24px}._ow_preview{padding-left:24px;padding-right:24px}}",
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

    function TreeDirectory({ entry, selected, onOpen, revision, movingEntry, dropTargetPath, onMoveStart, onMoveTarget, onMoveHover, onMoveCancel, onFolderFocus, onContextMenu }) {
      const [open, setOpen] = useState(false);
      const [tree, setTree] = useState(null);
      const [error, setError] = useState("");
      const timer = useRef(null);
      const longPressed = useRef(false);
      const dragged = useRef(false);
      const load = useCallback(() => requestJson(`${API}/tree?path=${encodeURIComponent(entry.path)}`).then((payload) => {
        setTree(payload);
        setError("");
      }).catch((e) => setError(e.message)), [entry.path]);
      useEffect(() => {
        if (open) load();
      }, [open, load, revision]);
      const clearPress = () => {
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = null;
      };
      const startPress = (event) => {
        if (event.button !== 0 || movingEntry) return;
        longPressed.current = false;
        clearPress();
        timer.current = window.setTimeout(() => {
          longPressed.current = true;
          onMoveStart(entry);
        }, 600);
      };
      const wasLongPress = () => {
        if (!longPressed.current) return false;
        longPressed.current = false;
        return true;
      };
      const toggle = async () => {
        if (movingEntry) {
          onMoveTarget(entry);
          return;
        }
        onFolderFocus(entry.path);
        const next = !open;
        setOpen(next);
      };
      const startDrag = (event) => {
        dragged.current = true;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", entry.path);
        onMoveStart(entry);
      };
      return React.createElement(React.Fragment, null,
        React.createElement("button", {
          className: "_ow_treeentry",
          type: "button",
          draggable: true,
          "data-moving": movingEntry?.path === entry.path,
          "data-drop-target": Boolean(dropTargetPath === entry.path && movingEntry?.path !== entry.path),
          onPointerDown: startPress,
          onPointerUp: clearPress,
          onPointerLeave: clearPress,
          onPointerCancel: clearPress,
          onDragStart: startDrag,
          onDragEnd: () => { window.setTimeout(() => { dragged.current = false; onMoveCancel(); }, 0); },
          onDragEnter: (event) => { if (event.dataTransfer.types.includes("text/plain")) { event.preventDefault(); onMoveHover(entry); } },
          onDragOver: (event) => { if (event.dataTransfer.types.includes("text/plain")) { event.preventDefault(); onMoveHover(entry); } },
          onDrop: (event) => { event.preventDefault(); onMoveTarget(entry); },
          onContextMenu: (event) => onContextMenu(event, entry),
          onClick: () => { if (!wasLongPress() && !dragged.current) toggle(); }
        },
          React.createElement("span", { className: "_ow_treeicon" }, open ? "▾" : "▸"),
          React.createElement("span", { className: "_ow_treetext" }, entry.name)),
        open && React.createElement("div", { className: "_ow_treechildren" },
          error ? React.createElement("div", { className: "_ow_hint" }, error) : tree && React.createElement(TreeContents, { tree, selected, onOpen, revision, movingEntry, dropTargetPath, onMoveStart, onMoveTarget, onMoveHover, onMoveCancel, onFolderFocus, onContextMenu }))
      );
    }

    function TreeFile({ entry, selected, onOpen, movingEntry, onMoveStart, onMoveCancel, onContextMenu }) {
      const timer = useRef(null);
      const longPressed = useRef(false);
      const dragged = useRef(false);
      const clearPress = () => {
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = null;
      };
      const startPress = (event) => {
        if (event.button !== 0 || movingEntry) return;
        longPressed.current = false;
        clearPress();
        timer.current = window.setTimeout(() => {
          longPressed.current = true;
          onMoveStart(entry);
        }, 600);
      };
      const handleClick = () => {
        if (longPressed.current || dragged.current) {
          longPressed.current = false;
          dragged.current = false;
          return;
        }
        if (!movingEntry) onOpen(entry);
      };
      const startDrag = (event) => {
        dragged.current = true;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", entry.path);
        onMoveStart(entry);
      };
      return React.createElement("button", {
        className: "_ow_treeentry",
        type: "button",
        draggable: true,
        "data-selected": selected === entry.path,
        "data-moving": movingEntry?.path === entry.path,
        onPointerDown: startPress,
        onPointerUp: clearPress,
        onPointerLeave: clearPress,
        onPointerCancel: clearPress,
        onDragStart: startDrag,
        onDragEnd: () => { window.setTimeout(() => { dragged.current = false; onMoveCancel(); }, 0); },
        onContextMenu: (event) => onContextMenu(event, entry),
        onClick: handleClick
      },
        React.createElement("span", { className: "_ow_treeicon" }, entry.kind === "image" ? "▧" : "·"),
        React.createElement("span", { className: "_ow_treetext" }, entry.name));
    }

    function TreeContents({ tree, selected, onOpen, revision, movingEntry, dropTargetPath, onMoveStart, onMoveTarget, onMoveHover, onMoveCancel, onFolderFocus, onContextMenu }) {
      return React.createElement(React.Fragment, null,
        tree.dirs.map((entry) => React.createElement(TreeDirectory, { key: entry.path, entry, selected, onOpen, revision, movingEntry, dropTargetPath, onMoveStart, onMoveTarget, onMoveHover, onMoveCancel, onFolderFocus, onContextMenu })),
        tree.files.map((entry) => React.createElement(TreeFile, { key: entry.path, entry, selected, onOpen, movingEntry, onMoveStart, onMoveCancel, onContextMenu }))
      );
    }

    function VaultTree({ selected, onOpen, revision, movingEntry, dropTargetPath, onMoveStart, onMoveTarget, onMoveHover, onMoveCancel, onFolderFocus, onContextMenu }) {
      const [tree, setTree] = useState(null);
      const [error, setError] = useState("");
      const load = useCallback(() => requestJson(`${API}/tree`).then((payload) => {
        setTree(payload);
        setError("");
      }).catch((e) => setError(e.message)), []);
      useEffect(() => { load(); }, [load, revision]);
      if (error) return React.createElement("div", { className: "_ow_error" }, error);
      if (!tree) return React.createElement("div", { className: "_ow_hint" }, "正在读取仓库…");
      return React.createElement(TreeContents, { tree, selected, onOpen, revision, movingEntry, dropTargetPath, onMoveStart, onMoveTarget, onMoveHover, onMoveCancel, onFolderFocus, onContextMenu });
    }

    function SearchResults({ payload, loading, onOpen }) {
      if (loading) return React.createElement("div", { className: "_ow_hint" }, "正在搜索…");
      if (payload?.error) return React.createElement("div", { className: "_ow_error" }, payload.error);
      if (!payload?.results?.length) return React.createElement("div", { className: "_ow_hint" }, "没有找到匹配的笔记");
      return React.createElement("div", null,
        payload.results.map((entry) => React.createElement("button", { key: entry.path, className: "_ow_searchresult", type: "button", onClick: () => onOpen(entry) },
          React.createElement("span", { className: "_ow_searchname" }, entry.name),
          React.createElement("span", { className: "_ow_searchpath" }, entry.path),
          entry.excerpt && React.createElement("span", { className: "_ow_searchexcerpt" }, `${entry.lineNumber ? `第 ${entry.lineNumber} 行：` : "文件名匹配："}${entry.excerpt}`))),
        payload.truncated && React.createElement("div", { className: "_ow_hint" }, "结果较多，已显示前 100 条"));
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

      const controlError = modelError || permissionError;
      return React.createElement("div", { className: "_ow_controls" },
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
            permissionOptions.map((option) => React.createElement("option", { value: option.value, key: option.value }, displayPermissionName(option)))
          )
        ),
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
            modelOptions.map((option) => React.createElement("option", { value: option.value, key: option.value }, `${option.label} · ${option.detail}`))
          )
        ),
        controlError ? React.createElement("div", { className: "_ow_controlhint" }, controlError) : null
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
          React.createElement("div", { className: "_ow_compbox" },
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
            React.createElement("div", { className: "_ow_compbar" },
              React.createElement("span", { className: "_ow_compadd", "aria-hidden": true }, "+"),
              React.createElement(SessionControls, { session, currentId, listSnapshot, modelDirectories }),
              React.createElement("button", {
                className: "_ow_send",
                type: "button",
                disabled: !session || !draft.trim() || sending,
                "aria-label": sending ? "发送中" : "发送",
                title: sending ? "发送中" : "发送",
                onClick: send
              }, sending ? "…" : "↑"))
          ),
          React.createElement("div", { className: "_ow_chatfoot" },
            React.createElement("span", null, "Ctrl/Cmd + Enter 发送")))
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
      const [treeRevision, setTreeRevision] = useState(0);
      const [moving, setMoving] = useState(null);
      const [dropTargetPath, setDropTargetPath] = useState("");
      const [focusedFolder, setFocusedFolder] = useState("");
      const [treeActionError, setTreeActionError] = useState("");
      const [contextMenu, setContextMenu] = useState(null);
      const [nameDialog, setNameDialog] = useState(null);
      const [nameValue, setNameValue] = useState("");
      const [deleteDialog, setDeleteDialog] = useState(null);
      const [searchQuery, setSearchQuery] = useState("");
      const [searchResults, setSearchResults] = useState(null);
      const [searching, setSearching] = useState(false);
      const rootRef = useRef(null);
      const saveTimerRef = useRef(null);
      const savePromiseRef = useRef(null);
      const saveRef = useRef(null);

      useEffect(() => {
        requestJson(`${API}/meta`).then(setMeta).catch((e) => setMetaError(e.message));
        rootRef.current?.focus();
      }, []);

      useEffect(() => {
        const query = searchQuery.trim();
        if (!query) {
          setSearchResults(null);
          setSearching(false);
          return undefined;
        }
        setSearching(true);
        const timer = window.setTimeout(() => {
          requestJson(`${API}/search?q=${encodeURIComponent(query)}`)
            .then((payload) => setSearchResults(payload))
            .catch((error) => setSearchResults({ error: error.message }))
            .finally(() => setSearching(false));
        }, 220);
        return () => window.clearTimeout(timer);
      }, [searchQuery]);

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
        const saved = await saveRef.current?.();
        if (saved === false) return;
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
      const openSearchResult = async (entry) => {
        setSearchQuery("");
        setSearchResults(null);
        await openFile(entry);
      };

      const save = async ({ auto = false } = {}) => {
        if (!note?.path || note.image || note.content === editor) return true;
        if (savePromiseRef.current) return savePromiseRef.current;
        const path = note.path;
        const content = editor;
        const run = (async () => {
          setSaving(true);
          setStatus(auto ? "自动保存中…" : "保存中…");
          try {
            const payload = await requestJson(`${API}/save`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path, content })
            });
            setNote((value) => value?.path === path ? { ...value, content, modifiedAt: payload.modifiedAt } : value);
            setStatus(auto ? "已自动保存" : "已保存");
            return true;
          } catch (e) {
            setStatus(e.message);
            return false;
          } finally {
            setSaving(false);
          }
        })();
        savePromiseRef.current = run;
        try {
          return await run;
        } finally {
          if (savePromiseRef.current === run) savePromiseRef.current = null;
        }
      };
      saveRef.current = save;

      useEffect(() => {
        if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
        if (!note || note.image || note.content === editor) return undefined;
        setStatus("等待自动保存…");
        saveTimerRef.current = window.setTimeout(() => {
          saveRef.current?.({ auto: true });
        }, 800);
        return () => {
          if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        };
      }, [editor, note?.path, note?.content, note?.image]);

      const refreshTree = () => setTreeRevision((value) => value + 1);
      const newItemParent = () => {
        if (focusedFolder) return focusedFolder;
        const slash = selected.lastIndexOf("/");
        return slash === -1 ? "" : selected.slice(0, slash);
      };
      const parentForEntry = (entry) => {
        if (!entry) return newItemParent();
        if (entry.kind === "directory") return entry.path;
        const slash = entry.path.lastIndexOf("/");
        return slash === -1 ? "" : entry.path.slice(0, slash);
      };
      const openNameDialog = (kind, parent) => {
        setContextMenu(null);
        setNameValue(kind === "folder" ? "新文件夹" : "未命名笔记");
        setNameDialog({ kind, parent });
      };
      const createFolderAt = async (parent, name) => {
        if (!name) return;
        const saved = await saveRef.current?.();
        if (saved === false) return;
        setTreeActionError("");
        try {
          const payload = await requestJson(`${API}/create-folder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parent, name })
          });
          setFocusedFolder(payload.path);
          refreshTree();
          setStatus("文件夹已创建");
        } catch (e) {
          setTreeActionError(e.message);
          setStatus(e.message);
        }
      };
      const createNoteAt = async (parent, name) => {
        if (!name) return;
        const saved = await saveRef.current?.();
        if (saved === false) return;
        setTreeActionError("");
        try {
          const payload = await requestJson(`${API}/create-note`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ parent, name, content: "" })
          });
          refreshTree();
          setStatus("笔记已创建");
          await openFile({ path: payload.path, name: payload.name, kind: "file" });
        } catch (e) {
          setTreeActionError(e.message);
          setStatus(e.message);
        }
      };
      const submitName = async (event) => {
        event.preventDefault();
        const name = nameValue.trim();
        if (!name || !nameDialog) return;
        const dialog = nameDialog;
        setNameDialog(null);
        if (dialog.kind === "folder") await createFolderAt(dialog.parent, name);
        else if (dialog.kind === "note") await createNoteAt(dialog.parent, name);
        else await renameEntry(dialog.entry, name);
      };
      const openRenameDialog = (entry) => {
        setContextMenu(null);
        setNameValue(entry.name);
        setNameDialog({ kind: "rename", entry });
      };
      const renameEntry = async (entry, name) => {
        if (!entry || !name) return;
        const saved = await saveRef.current?.();
        if (saved === false) return;
        setTreeActionError("");
        try {
          const payload = await requestJson(`${API}/rename`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: entry.path, name })
          });
          const source = entry.path;
          const nextPath = (value) => {
            if (!value) return value;
            if (value === source) return payload.path;
            return value.startsWith(`${source}/`) ? `${payload.path}${value.slice(source.length)}` : value;
          };
          setSelected(nextPath);
          setFocusedFolder((value) => nextPath(value));
          setNote((value) => value?.path ? { ...value, path: nextPath(value.path), name: value.path === source ? payload.name : value.name } : value);
          refreshTree();
          setStatus("已重命名");
        } catch (e) {
          setTreeActionError(e.message);
          setStatus(e.message);
        }
      };
      const askDelete = (entry) => {
        setContextMenu(null);
        setDeleteDialog(entry);
      };
      const deleteEntry = async (entry) => {
        if (!entry) return;
        const saved = await saveRef.current?.();
        if (saved === false) return;
        setTreeActionError("");
        try {
          await requestJson(`${API}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: entry.path })
          });
          const deletedPath = entry.path;
          if (selected === deletedPath || selected.startsWith(`${deletedPath}/`)) {
            setSelected("");
            setNote(null);
            setEditor("");
          }
          if (focusedFolder === deletedPath || focusedFolder.startsWith(`${deletedPath}/`)) setFocusedFolder("");
          refreshTree();
          setStatus("已删除");
        } catch (e) {
          setTreeActionError(e.message);
          setStatus(e.message);
        }
      };
      const confirmDelete = async () => {
        const target = deleteDialog;
        setDeleteDialog(null);
        await deleteEntry(target);
      };
      const openContextMenu = (event, entry = null) => {
        event.preventDefault();
        event.stopPropagation();
        if (entry?.kind === "directory") setFocusedFolder(entry.path);
        const width = 220;
        const height = entry ? 230 : 135;
        setContextMenu({
          x: Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8)),
          y: Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8)),
          entry,
          parent: parentForEntry(entry)
        });
      };
      const startMove = (entry) => {
        setTreeActionError("");
        setContextMenu(null);
        setMoving({ entry });
        setDropTargetPath("");
        setStatus(`正在移动「${entry.name}」，请选择目标文件夹`);
      };
      const cancelMove = () => {
        setMoving(null);
        setDropTargetPath("");
        setStatus("已取消移动");
      };
      const hoverMoveTarget = (entry) => {
        if (!moving?.entry) return;
        if (moving.entry.path === entry.path) {
          setDropTargetPath("");
          return;
        }
        setDropTargetPath(entry.path);
        setStatus(`移动「${moving.entry.name}」到「${entry.name}」`);
      };
      const moveTo = async (destination) => {
        if (!moving?.entry) return;
        if (await saveRef.current?.() === false) return;
        const source = moving.entry.path;
        const destinationPath = typeof destination === "string" ? destination : destination?.path || "";
        setTreeActionError("");
        try {
          const payload = await requestJson(`${API}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source, destination: destinationPath })
          });
          const nextPath = (value) => {
            if (!value) return value;
            if (value === source) return payload.path;
            return value.startsWith(`${source}/`) ? `${payload.path}${value.slice(source.length)}` : value;
          };
          setSelected(nextPath);
          setNote((value) => value?.path ? { ...value, path: nextPath(value.path) } : value);
          setMoving(null);
          setDropTargetPath("");
          refreshTree();
          setStatus("已移动");
        } catch (e) {
          setTreeActionError(e.message);
          setStatus(e.message);
        }
      };
      const closeWorkbench = async () => {
        if (await saveRef.current?.() === false) return;
        onClose();
      };
      const dirty = Boolean(note && !note.image && note.content !== editor);
      const onKeyDown = (event) => {
        if (event.key === "Escape") {
          if (deleteDialog) setDeleteDialog(null);
          else if (nameDialog) setNameDialog(null);
          else if (contextMenu) setContextMenu(null);
          else if (moving) cancelMove();
          else closeWorkbench();
          return;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
          event.preventDefault();
          save({ auto: false });
        }
      };

      const vaultName = meta?.vault?.name || "Obsidian";
      return React.createElement("div", {
        className: "_ow_overlay",
        ref: rootRef,
        tabIndex: -1,
        onKeyDown,
        style: { gridTemplateColumns: `${widths.left}px 1px minmax(360px, 1fr) 1px ${widths.right}px` }
      },
        React.createElement("aside", { className: "_ow_left" },
          React.createElement("div", { className: "_ow_topbar" },
            React.createElement("div", { className: "_ow_vaultmark" }, React.createElement(ObsidianIcon, { idPrefix: "vault" })),
            React.createElement("div", { className: "_ow_title" },
              React.createElement("strong", null, vaultName),
              React.createElement("span", null, meta?.vault?.path || "正在读取仓库路径…")),
          React.createElement("button", { className: "_ow_iconbtn", type: "button", title: "关闭工作台", onClick: closeWorkbench }, "×")),
          React.createElement("div", { className: "_ow_leftbody", onContextMenu: (event) => openContextMenu(event, null) },
            React.createElement("div", { className: "_ow_sectionhead" },
              React.createElement("div", { className: "_ow_sectionlabel" }, "仓库")),
            React.createElement("div", { className: "_ow_searchbar" },
              React.createElement("input", { className: "_ow_searchinput", value: searchQuery, onChange: (event) => setSearchQuery(event.target.value), placeholder: "搜索仓库…", "aria-label": "搜索仓库" }),
              searchQuery && React.createElement("button", { className: "_ow_searchclear", type: "button", onClick: () => setSearchQuery(""), "aria-label": "清除搜索" }, "×")),
            moving && React.createElement("div", { className: "_ow_movebar", "data-dragging": Boolean(dropTargetPath) },
              React.createElement("div", { className: "_ow_moveinfo" },
                React.createElement("strong", null, `移动：${moving.entry.name}`),
                React.createElement("span", null, dropTargetPath ? `放入「${dropTargetPath.split("/").pop()}」` : "按住拖到目标文件夹")),
              React.createElement("button", { className: "_ow_moveaction", type: "button", onClick: () => moveTo("") }, "移到根目录"),
              React.createElement("button", { className: "_ow_moveaction", type: "button", onClick: cancelMove }, "取消")),
            treeActionError && React.createElement("div", { className: "_ow_error" }, treeActionError),
            metaError ? React.createElement("div", { className: "_ow_error" }, metaError) : !meta?.configured ? React.createElement("div", { className: "_ow_hint" }, "没有找到本机 Obsidian 仓库。可以通过 OBSIDIAN_VAULT_PATH 指定路径。") : searchQuery.trim() ? React.createElement(SearchResults, { payload: searchResults, loading: searching, onOpen: openSearchResult }) : React.createElement(VaultTree, { selected, onOpen: openFile, revision: treeRevision, movingEntry: moving?.entry, dropTargetPath, onMoveStart: startMove, onMoveTarget: moveTo, onMoveHover: hoverMoveTarget, onMoveCancel: cancelMove, onFolderFocus: setFocusedFolder, onContextMenu: openContextMenu }))),
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
        React.createElement(ChatPanel, { sessions, modelDirectories, notePath: note?.path, noteContent: note?.image ? null : editor }),
        contextMenu && React.createElement("div", {
          className: "_ow_contextmenu",
          style: { left: contextMenu.x, top: contextMenu.y },
          onPointerDown: (event) => event.stopPropagation(),
          onClick: (event) => event.stopPropagation(),
          onContextMenu: (event) => event.preventDefault()
        },
          React.createElement("button", { className: "_ow_contextitem", type: "button", onClick: () => openNameDialog("note", contextMenu.parent) }, "新建笔记"),
          React.createElement("button", { className: "_ow_contextitem", type: "button", onClick: () => openNameDialog("folder", contextMenu.parent) }, "新建文件夹"),
          contextMenu.entry && React.createElement("div", { className: "_ow_contextsep" }),
          contextMenu.entry && React.createElement("button", { className: "_ow_contextitem", type: "button", onClick: () => startMove(contextMenu.entry) }, "移动到…"),
          React.createElement("div", { className: "_ow_contextsep" }),
          contextMenu.entry && React.createElement("button", { className: "_ow_contextitem", type: "button", onClick: () => openRenameDialog(contextMenu.entry) }, "重命名"),
          contextMenu.entry && React.createElement("button", { className: "_ow_contextitem", "data-danger": true, type: "button", onClick: () => askDelete(contextMenu.entry) }, "删除"),
          contextMenu.entry && React.createElement("div", { className: "_ow_contextsep" }),
          React.createElement("button", { className: "_ow_contextitem", type: "button", onClick: () => setContextMenu(null) }, "取消")),
        nameDialog && React.createElement("div", { className: "_ow_dialogbackdrop", onPointerDown: () => setNameDialog(null) },
          React.createElement("form", { className: "_ow_dialog", onSubmit: submitName, onPointerDown: (event) => event.stopPropagation() },
            React.createElement("div", { className: "_ow_dialogtitle" }, nameDialog.kind === "folder" ? "新建文件夹" : nameDialog.kind === "note" ? "新建笔记" : "重命名"),
            React.createElement("input", {
              className: "_ow_dialoginput",
              autoFocus: true,
              value: nameValue,
              onChange: (event) => setNameValue(event.target.value),
              onKeyDown: (event) => { if (event.key === "Escape") { event.preventDefault(); setNameDialog(null); } }
            }),
            React.createElement("div", { className: "_ow_dialogactions" },
              React.createElement("button", { className: "_ow_dialogbutton", type: "button", onClick: () => setNameDialog(null) }, "取消"),
              React.createElement("button", { className: "_ow_dialogbutton", type: "submit", "data-primary": true }, "创建")))),
        deleteDialog && React.createElement("div", { className: "_ow_dialogbackdrop", onPointerDown: () => setDeleteDialog(null) },
          React.createElement("div", { className: "_ow_dialog", onPointerDown: (event) => event.stopPropagation() },
            React.createElement("div", { className: "_ow_dialogtitle" }, `删除「${deleteDialog.name}」？`),
            React.createElement("div", { className: "_ow_dialogcopy" }, deleteDialog.kind === "directory" ? "文件夹中的内容也会一起删除。此操作无法撤销。" : "此操作无法撤销。"),
            React.createElement("div", { className: "_ow_dialogactions" },
              React.createElement("button", { className: "_ow_dialogbutton", type: "button", onClick: () => setDeleteDialog(null) }, "取消"),
              React.createElement("button", { className: "_ow_dialogbutton", "data-danger": true, type: "button", onClick: confirmDelete }, "删除")))));
    }

    function ObsidianIcon({ idPrefix = "obsidian" }) {
      const svg = `
        <defs>
          <radialGradient id="${idPrefix}-bottom-left" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-59 -225 150 -39 161.4 470)">
            <stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-opacity=".1"/>
          </radialGradient>
          <radialGradient id="${idPrefix}-top-right" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(50 -379 280 37 360 374.2)">
            <stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/>
          </radialGradient>
          <radialGradient id="${idPrefix}-top-left" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(69 -319 218 47 175.4 307)">
            <stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/>
          </radialGradient>
          <radialGradient id="${idPrefix}-bottom-right" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-96 -163 187 -111 335.3 512.2)">
            <stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-opacity=".3"/>
          </radialGradient>
          <radialGradient id="${idPrefix}-top-edge" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-36 166 -112 -24 310 128.2)">
            <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/>
          </radialGradient>
          <radialGradient id="${idPrefix}-left-edge" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(88 89 -190 187 111 220.2)">
            <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/>
          </radialGradient>
          <radialGradient id="${idPrefix}-bottom-edge" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(9 130 -276 20 215 284)">
            <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/>
          </radialGradient>
          <radialGradient id="${idPrefix}-middle-edge" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-198 -104 327 -623 400 399.2)">
            <stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/>
          </radialGradient>
          <clipPath id="${idPrefix}-clip"><path d="M.2.2h512v512H.2z"/></clipPath>
        </defs>
        <g clip-path="url(#${idPrefix}-clip)">
          <path d="M382.3 475.6c-3.1 23.4-26 41.6-48.7 35.3-32.4-8.9-69.9-22.8-103.6-25.4l-51.7-4a34 34 0 0 1-22-10.2l-89-91.7a34 34 0 0 1-6.7-37.7s55-121 57.1-127.3c2-6.3 9.6-61.2 14-90.6 1.2-7.9 5-15 11-20.3L248 8.9a34.1 34.1 0 0 1 49.6 4.3L386 125.6a37 37 0 0 1 7.6 22.4c0 21.3 1.8 65 13.6 93.2 11.5 27.3 32.5 57 43.5 71.5a17.3 17.3 0 0 1 1.3 19.2 1494 1494 0 0 1-44.8 70.6c-15 22.3-21.9 49.9-25 73.1z" fill="#6c31e3"/>
          <path d="M165.9 478.3c41.4-84 40.2-144.2 22.6-187-16.2-39.6-46.3-64.5-70-80-.6 2.3-1.3 4.4-2.2 6.5L60.6 342a34 34 0 0 0 6.6 37.7l89.1 91.7a34 34 0 0 0 9.6 7z" fill="url(#${idPrefix}-bottom-left)"/>
          <path d="M278.4 307.8c11.2 1.2 22.2 3.6 32.8 7.6 34 12.7 65 41.2 90.5 96.3 1.8-3.1 3.6-6.2 5.6-9.2a1536 1536 0 0 0 44.8-70.6 17 17 0 0 0-1.3-19.2c-11-14.6-32-44.2-43.5-71.5-11.8-28.2-13.5-72-13.6-93.2 0-8.1-2.6-16-7.6-22.4L297.6 13.2a34 34 0 0 0-1.5-1.7 96 96 0 0 1 2 54 198.3 198.3 0 0 1-17.6 41.3l-7.2 14.2a171 171 0 0 0-19.4 71c-1.2 29.4 4.8 66.4 24.5 115.8z" fill="url(#${idPrefix}-top-right)"/>
          <path d="M278.4 307.8c-19.7-49.4-25.8-86.4-24.5-115.9a171 171 0 0 1 19.4-71c2.3-4.8 4.8-9.5 7.2-14.1 7.1-13.9 14-27 17.6-41.4a96 96 0 0 0-2-54A34.1 34.1 0 0 0 248 9l-105.4 94.8a34.1 34.1 0 0 0-10.9 20.3l-12.8 85-.5 2.3c23.8 15.5 54 40.4 70.1 80a147 147 0 0 1 7.8 24.8c28-6.8 55.7-11 82.1-8.3z" fill="url(#${idPrefix}-top-left)"/>
          <path d="M333.6 511c22.7 6.2 45.6-12 48.7-35.4a187 187 0 0 1 19.4-63.9c-25.6-55-56.5-83.6-90.4-96.3-36-13.4-75.2-9-115 .7 8.9 40.4 3.6 93.3-30.4 162.2 4 1.8 8.1 3 12.5 3.3 0 0 24.4 2 53.6 4.1 29 2 72.4 17.1 101.6 25.2z" fill="url(#${idPrefix}-bottom-right)"/>
          <g clip-rule="evenodd" fill-rule="evenodd">
            <path d="M254.1 190c-1.3 29.2 2.4 62.8 22.1 112.1l-6.2-.5c-17.7-51.5-21.5-78-20.2-107.6a174.7 174.7 0 0 1 20.4-72c2.4-4.9 8-14.1 10.5-18.8 7.1-13.7 11.9-21 16-33.6 5.7-17.5 4.5-25.9 3.8-34.1 4.6 29.9-12.7 56-25.7 82.4a177.1 177.1 0 0 0-20.7 72z" fill="url(#${idPrefix}-top-edge)"/>
            <path d="M194.3 293.4c2.4 5.4 4.6 9.8 6 16.5L195 311c-2.1-7.8-3.8-13.4-6.8-20-17.8-42-46.3-63.6-69.7-79.5 28.2 15.2 57.2 39 75.7 81.9z" fill="url(#${idPrefix}-left-edge)"/>
            <path d="M200.6 315.1c9.8 46-1.2 104.2-33.6 160.9 27.1-56.2 40.2-110.1 29.3-160z" fill="url(#${idPrefix}-bottom-edge)"/>
            <path d="M312.5 311c53.1 19.9 73.6 63.6 88.9 100-19-38.1-45.2-80.3-90.8-96-34.8-11.8-64.1-10.4-114.3 1l-1.1-5c53.2-12.1 81-13.5 117.3 0z" fill="url(#${idPrefix}-middle-edge)"/>
          </g>
        </g>`;
      return React.createElement("svg", {
        className: "_ow_obsidianicon",
        viewBox: "0 0 512 512",
        fill: "none",
        "aria-hidden": true,
        dangerouslySetInnerHTML: { __html: svg }
      });
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
        }, React.createElement(ObsidianIcon, { idPrefix: "launcher" })),
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
