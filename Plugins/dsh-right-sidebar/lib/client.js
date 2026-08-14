// Client UI for the DeepSeek Harness macOS right sidebar.
window.__ModuleLoader__.load({
  id: "dsh-right-sidebar",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const React = require("react");
    const { bindSnapshotSelector } = require("@deepseek-ai/dsh-client-web-react");
    const h = React.createElement;

    const css = `
._rs_toggle{position:absolute;z-index:24;right:0;top:50%;width:32px;height:68px;transform:translateY(-50%);border:1px solid var(--dsw-alias-border-l2);border-right:0;border-radius:13px 0 0 13px;background:var(--dsw-alias-button-floating-fill);color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.08);transition:width .16s ease,background .16s ease,color .16s ease}
._rs_toggle:hover{width:38px;background:var(--dsw-alias-button-floating-hover);color:var(--dsw-alias-label-primary)}
._rs_panel{position:absolute;z-index:23;inset:0 0 0 auto;width:min(360px,calc(100vw - 456px));min-width:300px;background:var(--dsw-alias-bg-base);border-left:1px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;box-shadow:-12px 0 32px rgba(0,0,0,.035);animation:_rs_in .18s var(--ds-ease-in-out)}
._rs_resize{position:absolute;z-index:31;left:-9px;top:0;bottom:0;width:18px;cursor:col-resize;touch-action:none}
._rs_resize:after{content:"";position:absolute;left:50%;top:50%;width:3px;height:34px;border-radius:4px;background:var(--dsw-alias-border-l3);opacity:.28;transform:translate(-50%,-50%);transition:opacity .12s ease,background .12s ease}
._rs_resize:hover:after,._rs_resize[data-dragging]:after{opacity:1;background:var(--dsw-alias-brand-primary)}
body[data-rs-resizing] ._rs_browserFrame{pointer-events:none!important}
body[data-rs-wide] .pI_x6G_centerCol table{width:100%;max-width:100%}
body[data-rs-wide] .pI_x6G_centerCol th,body[data-rs-wide] .pI_x6G_centerCol td{overflow-wrap:break-word;word-break:normal}
body[data-rs-wide] .pI_x6G_centerCol pre{white-space:pre-wrap;overflow-wrap:break-word}
body[data-rs-wide] .pI_x6G_centerCol code{overflow-wrap:break-word}
body[data-rs-wide] .pI_x6G_centerCol img,body[data-rs-wide] .pI_x6G_centerCol video{max-width:100%;height:auto}
@keyframes _rs_in{from{opacity:.4;transform:translateX(12px)}to{opacity:1;transform:none}}
._rs_header{height:54px;box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 16px;flex:none}
._rs_title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);letter-spacing:.01em}
._rs_iconBtn{width:30px;height:30px;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer}
._rs_iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
._rs_tabs{height:42px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l1);display:flex;align-items:end;gap:18px;flex:none}
._rs_tab{height:42px;padding:0 2px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:13px;cursor:pointer}
._rs_tab:hover{color:var(--dsw-alias-label-secondary)}
._rs_tab[data-active]{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary)}
._rs_body{min-height:0;flex:1;overflow-y:auto;padding:14px 14px 24px}
._rs_searchBox{height:36px;border:1px solid var(--dsw-alias-border-l2);border-radius:11px;display:flex;align-items:center;gap:8px;padding:0 10px;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-1)}
._rs_searchBox:focus-within{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)}
._rs_input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
._rs_input::placeholder{color:var(--dsw-alias-label-tertiary)}
._rs_scope{display:flex;gap:4px;margin:10px 0 8px}
._rs_scopeBtn{height:28px;padding:0 10px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;cursor:pointer}
._rs_scopeBtn[data-active]{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}
._rs_status{padding:20px 4px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px}
._rs_list{display:flex;flex-direction:column}
._rs_item{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l1);background:transparent;text-align:left;padding:11px 4px;color:inherit;cursor:pointer}
._rs_item:hover{background:var(--dsw-alias-interactive-bg-hover);border-radius:9px;padding-left:9px;padding-right:9px}
._rs_itemTitle{display:block;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
._rs_itemSub{display:-webkit-box;margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
._rs_path{font-family:var(--ds-font-family-code);font-size:11px}
._rs_sectionLabel{margin:4px 2px 8px;color:var(--dsw-alias-label-tertiary);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
._rs_workspace{padding:10px 11px;margin-bottom:12px;border-radius:11px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code);font-size:11px;line-height:18px;word-break:break-all}
._rs_metrics{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--dsw-alias-border-l1);border-left:1px solid var(--dsw-alias-border-l1);border-radius:12px;overflow:hidden}
._rs_metric{min-height:74px;box-sizing:border-box;padding:12px;border-right:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
._rs_metricValue{color:var(--dsw-alias-label-primary);font-size:18px;font-weight:600;line-height:25px}
._rs_metricLabel{margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:11px}
._rs_info{margin-top:16px}
._rs_infoRow{display:flex;justify-content:space-between;gap:16px;padding:9px 2px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px}
._rs_infoKey{color:var(--dsw-alias-label-tertiary)}
._rs_infoValue{min-width:0;color:var(--dsw-alias-label-secondary);text-align:right;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
._rs_hint{position:absolute;right:42px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:0;white-space:nowrap;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:5px 8px;color:var(--dsw-alias-label-secondary);font-size:11px;transition:opacity .12s}
._rs_toggle:hover ._rs_hint{opacity:1}
._rs_body[data-full]{padding:0;overflow:hidden;display:flex;flex-direction:column}
._rs_browserBar{height:46px;padding:7px 8px;box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l1);display:flex;align-items:center;gap:4px;flex:none}
._rs_navBtn{width:29px;height:29px;flex:none;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer;font-size:15px}
._rs_navBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
._rs_navBtn:disabled{opacity:.3;cursor:default}
._rs_url{min-width:0;height:30px;flex:1;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;padding:0 9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;outline:0}
._rs_url:focus{border-color:var(--dsw-alias-brand-primary)}
._rs_browserFrame{min-height:0;flex:1;width:100%;border:0;background:#fff}
._rs_browserNative{position:relative;overflow:hidden;display:flex}
._rs_browserEmpty{min-height:0;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px}
._rs_browserEmpty strong{margin-bottom:7px;color:var(--dsw-alias-label-secondary);font-size:13px}
._rs_terminal{min-height:0;flex:1;display:flex;flex-direction:column;background:#101216;color:#d8dce3}
._rs_terminalTop{height:38px;box-sizing:border-box;padding:0 10px;border-bottom:1px solid #252933;display:flex;align-items:center;gap:8px;flex:none;color:#8e96a5;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px}
._rs_terminalCwd{min-width:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
._rs_terminalAction{border:0;background:transparent;color:#9ca4b3;font:inherit;cursor:pointer;padding:4px 5px;border-radius:5px}
._rs_terminalAction:hover{background:#252933;color:#fff}
._rs_terminalOut{min-height:0;flex:1;overflow:auto;margin:0;padding:12px;box-sizing:border-box;white-space:pre-wrap;word-break:break-word;color:#d8dce3;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace}
._rs_terminalInputRow{min-height:40px;box-sizing:border-box;border-top:1px solid #252933;padding:7px 10px;display:flex;align-items:flex-start;gap:7px;flex:none}
._rs_prompt{color:#70d6a0;font:12px/25px ui-monospace,SFMono-Regular,Menlo,monospace}
._rs_terminalInput{min-width:0;flex:1;resize:none;border:0;outline:0;background:transparent;color:#f1f3f5;font:11px/17px ui-monospace,SFMono-Regular,Menlo,monospace;min-height:25px;max-height:76px;padding:4px 0}
._rs_terminalStatus{color:#f0b35a}
@media(max-width:820px){._rs_panel{width:min(320px,calc(100vw - 56px));min-width:280px;box-shadow:-18px 0 40px rgba(0,0,0,.12)}}
@media(prefers-reduced-motion:reduce){._rs_panel{animation:none}}
._mp_toggle{width:28px;height:28px;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer}
._mp_toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
._mp_toggle[data-active]{color:var(--dsw-alias-brand-primary)}
._mp_panel{position:absolute;z-index:22;left:0;top:0;bottom:0;width:min(420px,calc(100vw - 96px));background:var(--dsw-alias-bg-base);border-right:1px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;box-shadow:12px 0 32px rgba(0,0,0,.06);animation:_mp_in .18s var(--ds-ease-in-out)}
@keyframes _mp_in{from{opacity:.4;transform:translateX(-12px)}to{opacity:1;transform:none}}
._mp_header{height:54px;box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:space-between;padding:0 12px 0 16px;flex:none}
._mp_title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}
._mp_iconBtn{width:30px;height:30px;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer}
._mp_iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
._mp_body{min-height:0;flex:1;padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden}
._mp_dirRow{display:flex;gap:8px;flex:none}
._mp_input{min-width:0;flex:1;height:32px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;padding:0 9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:0}
._mp_input:focus{border-color:var(--dsw-alias-brand-primary)}
._mp_btn{height:32px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;flex:none}
._mp_btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
._mp_btn:disabled{opacity:.5;cursor:default}
._mp_status{padding:14px 4px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px;flex:none}
._mp_list{display:flex;flex-direction:column;min-height:0;flex:1;overflow-y:auto}
._mp_file{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l1);background:transparent;text-align:left;padding:9px 4px;color:inherit;cursor:pointer;display:flex;align-items:center;gap:8px}
._mp_file:hover{background:var(--dsw-alias-interactive-bg-hover);border-radius:9px}
._mp_file[data-active]{background:var(--dsw-alias-interactive-bg-active);border-radius:9px}
._mp_fileName{min-width:0;flex:1;color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
._mp_fileMeta{color:var(--dsw-alias-label-tertiary);font-size:11px;font-family:var(--ds-font-family-code)}
._mp_player{flex:none;border-top:1px solid var(--dsw-alias-border-l1);padding-top:12px}
._mp_video{width:100%;max-height:260px;background:#000;border-radius:10px;display:block}
._mp_audio{width:100%;display:block}
._mp_now{margin-bottom:8px;color:var(--dsw-alias-label-secondary);font-size:12px;word-break:break-all}
@media(prefers-reduced-motion:reduce){._mp_panel{animation:none}}
`;
    const styleId = "dsh-right-sidebar/styles";
    if (typeof document !== "undefined" && !document.querySelector(`style[data-plugin-css="${styleId}"]`)) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-right-sidebar";
      tag.dataset.pluginCss = styleId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    function icon(kind, size = 16) {
      const common = { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
      if (kind === "search") return h("svg", common, h("circle", { cx: 11, cy: 11, r: 6 }), h("path", { d: "m16 16 4 4" }));
      if (kind === "close") return h("svg", common, h("path", { d: "M6 6l12 12M18 6 6 18" }));
      if (kind === "back") return h("svg", common, h("path", { d: "m15 18-6-6 6-6" }));
      if (kind === "forward") return h("svg", common, h("path", { d: "m9 18 6-6-6-6" }));
      if (kind === "reload") return h("svg", common, h("path", { d: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" }));
      if (kind === "external") return h("svg", common, h("path", { d: "M14 5h5v5M19 5l-8 8M18 13v6H5V6h6" }));
      if (kind === "music") return h("svg", common, h("path", { d: "M9 18V6l12-2v12" }), h("circle", { cx: 6, cy: 18, r: 3 }), h("circle", { cx: 18, cy: 16, r: 3 }));
      return h("svg", common, h("path", { d: "M5 4h14v16H5zM9 8h6M9 12h6M9 16h4" }));
    }

    const readPreference = (key, fallback) => {
      try { const value = window.localStorage.getItem(key); return value === null ? fallback : value; } catch { return fallback; }
    };
    const writePreference = (key, value) => { try { window.localStorage.setItem(key, value); } catch {} };
    const titleFor = (summary) => summary?.projections?.values?.title || (summary?.blank ? "新会话" : "未命名会话");
    const basename = (path) => path.split("/").filter(Boolean).pop() || path;
    const terminalRequest = async (body) => {
      const response = await fetch("/dsh-right-sidebar/terminal", {
        method: "POST",
        headers: { "content-type": "application/json", "x-dsh-right-sidebar": "1" },
        body: JSON.stringify(body)
      });
      const value = await response.json();
      if (!response.ok || !value.ok) throw new Error(value.error || "终端暂时不可用");
      return value;
    };
    const normalizeUrl = (value) => {
      const input = value.trim();
      if (!input) return "";
      if (/^(https?:\/\/|about:blank$)/i.test(input)) return input;
      if (/^[\w.-]+(?::\d+)?(?:\/.*)?$/i.test(input) && (input.includes(".") || input.startsWith("localhost") || input.startsWith("127.0.0.1"))) return `https://${input}`;
      return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
    };
    const nativeBrowserBridge = window.webkit?.messageHandlers?.dshNativeBrowser;
    const postNativeBrowser = (message) => {
      try { nativeBrowserBridge?.postMessage(message); return Boolean(nativeBrowserBridge); }
      catch { return false; }
    };

    const mediaStreamUrl = (path) => `/dsh-right-sidebar/media/stream?path=${encodeURIComponent(path)}`;
    const formatMediaSize = (bytes) => {
      if (!Number.isFinite(bytes)) return "";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    function collectVisibleFiles(cwd) {
      const values = new Set();
      const candidates = [];
      for (const el of document.querySelectorAll("button,a,[title],[aria-label]")) {
        candidates.push(el.textContent || "", el.getAttribute("title") || "", el.getAttribute("aria-label") || "");
      }
      const absolute = /\/Users\/[A-Za-z0-9._-]+\/[A-Za-z0-9_@%+.,()\[\] -]+(?:\/[A-Za-z0-9_@%+.,()\[\] -]+)*\.[A-Za-z0-9]{1,12}/g;
      const relative = /(?:^|[\s`"'(])((?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\.[A-Za-z0-9]{1,12})(?=$|[\s`"'),:])/g;
      for (const text of candidates) {
        for (const match of text.matchAll(absolute)) values.add(match[0].trim());
        for (const match of text.matchAll(relative)) {
          const path = match[1];
          if (cwd && !path.startsWith("http")) values.add(`${cwd}/${path.replace(/^\.\//, "")}`);
        }
      }
      return [...values].sort((a, b) => basename(a).localeCompare(basename(b))).slice(0, 80);
    }

    // The layout service intentionally exposes only open/close actions. Use the
    // shipped details handle's React owner callbacks so this overlay can share
    // the same clamped width state without replacing the built-in details pane.
    function findDetailsResizeController() {
      const handle = document.querySelector('[data-side="details"]');
      if (!handle) return null;
      const fiberKey = Object.keys(handle).find((key) => key.startsWith("__reactFiber$"));
      let fiber = fiberKey ? handle[fiberKey] : null;
      while (fiber) {
        const props = fiber.memoizedProps;
        if (props?.side === "details" && typeof props.onStart === "function" && typeof props.onDrag === "function" && typeof props.onEnd === "function") {
          return { onStart: props.onStart, onDrag: props.onDrag, onEnd: props.onEnd };
        }
        fiber = fiber.return;
      }
      return null;
    }

    const DETAILS_MIN_WIDTH = 300;
    const DETAILS_MAX_WIDTH = 520;
    const PANEL_MAX_WIDTH = 860;
    const CENTER_MIN_WIDTH = 320;
    const getMaxPanelWidth = () => {
      const overlay = document.querySelector("[data-shell-overlay]");
      const leftSidebarWidth = Math.round(overlay?.parentElement?.firstElementChild?.getBoundingClientRect().width || 56);
      return Math.max(360, Math.min(PANEL_MAX_WIDTH, window.innerWidth - leftSidebarWidth - CENTER_MIN_WIDTH));
    };
    const clampPanelWidth = (width) => {
      return Math.max(DETAILS_MIN_WIDTH, Math.min(width, getMaxPanelWidth()));
    };

    function RightSidebar({ useSessions, sessions, workspaces, layout, connection }) {
      const snapshot = useSessions((state) => state);
      const current = snapshot.current;
      const [catalog, setCatalog] = React.useState({});
      const summary = current ? (catalog[current] || snapshot.byId[current]) : undefined;
      const [open, setOpen] = React.useState(() => readPreference("dsh-right-sidebar:open", "0") === "1");
      const [tab, setTab] = React.useState(() => readPreference("dsh-right-sidebar:tab", "search"));
      const [query, setQuery] = React.useState("");
      const [fileQuery, setFileQuery] = React.useState("");
      const [scope, setScope] = React.useState("current");
      const [results, setResults] = React.useState([]);
      const [searchState, setSearchState] = React.useState("idle");
      const [filesTick, setFilesTick] = React.useState(0);
      const [panelWidth, setPanelWidth] = React.useState(() => {
        const saved = Number(readPreference("dsh-right-sidebar:width", ""));
        if (!Number.isFinite(saved) || saved <= 0) return 360;
        return Math.round(clampPanelWidth(saved));
      });
      const [resizing, setResizing] = React.useState(false);
      const [browserInput, setBrowserInput] = React.useState(() => readPreference("dsh-right-sidebar:url", ""));
      const [browserHistory, setBrowserHistory] = React.useState(() => {
        const saved = readPreference("dsh-right-sidebar:url", "");
        return saved ? [saved] : [];
      });
      const [browserIndex, setBrowserIndex] = React.useState(() => readPreference("dsh-right-sidebar:url", "") ? 0 : -1);
      const [browserKey, setBrowserKey] = React.useState(0);
      const [nativeBrowserState, setNativeBrowserState] = React.useState({ url: "", canGoBack: false, canGoForward: false, loading: false, error: "" });
      const [terminalId, setTerminalId] = React.useState(null);
      const [terminalOutput, setTerminalOutput] = React.useState("");
      const [terminalCwd, setTerminalCwd] = React.useState("");
      const [terminalAlive, setTerminalAlive] = React.useState(false);
      const [terminalError, setTerminalError] = React.useState("");
      const [terminalInput, setTerminalInput] = React.useState("");
      const [commandHistory, setCommandHistory] = React.useState([]);
      const [historyIndex, setHistoryIndex] = React.useState(-1);
      const terminalOutRef = React.useRef(null);
      const browserFrameRef = React.useRef(null);
      const browserInputRef = React.useRef(null);
      const browserEditingRef = React.useRef(false);
      const terminalIdRef = React.useRef(null);
      const terminalStartingRef = React.useRef(false);
      const resizeCleanupRef = React.useRef(null);
      const manualResizeRef = React.useRef(false);
      const restoreGuardRef = React.useRef(false);

      React.useEffect(() => {
        let live = true;
        connection.api.sessions.list({}).then((response) => {
          if (!live || !response.result.ok) return;
          const next = {};
          for (const item of response.result.value.items) next[item.sessionId] = item;
          setCatalog(next);
        }).catch(() => {});
        return () => { live = false; };
      }, [connection, current]);

      const toggle = React.useCallback(() => {
        setOpen((value) => {
          const next = !value;
          writePreference("dsh-right-sidebar:open", next ? "1" : "0");
          if (next) layout.openDetails(); else layout.closeDetails();
          return next;
        });
      }, [layout]);

      React.useEffect(() => {
        if (open) layout.openDetails();
      }, []);

      // Restore the saved sidebar width and keep the details-column sync from
      // shrinking it back while the open transition settles.
      React.useLayoutEffect(() => {
        if (!open) return;
        const saved = Number(readPreference("dsh-right-sidebar:width", ""));
        if (!Number.isFinite(saved) || saved <= 0) return;
        restoreGuardRef.current = true;
        setPanelWidth(Math.round(clampPanelWidth(saved)));
        const timer = setTimeout(() => { restoreGuardRef.current = false; }, 500);
        return () => { clearTimeout(timer); restoreGuardRef.current = false; };
      }, [open]);

      React.useLayoutEffect(() => {
        if (!open) return;
        const overlay = document.querySelector("[data-shell-overlay]");
        const detailsColumn = overlay?.previousElementSibling;
        if (!detailsColumn) return;
        let frame = 0;
        const sync = () => {
          if (manualResizeRef.current || restoreGuardRef.current) return;
          const width = Math.round(detailsColumn.getBoundingClientRect().width);
          if (width >= DETAILS_MIN_WIDTH) setPanelWidth((currentWidth) => {
            if (width >= DETAILS_MAX_WIDTH && currentWidth > DETAILS_MAX_WIDTH) return clampPanelWidth(currentWidth);
            return currentWidth === width ? currentWidth : width;
          });
        };
        const observer = new ResizeObserver(sync);
        observer.observe(detailsColumn);
        const started = performance.now();
        const followTransition = () => {
          sync();
          if (performance.now() - started < 320) frame = requestAnimationFrame(followTransition);
        };
        followTransition();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
      }, [open]);

      React.useLayoutEffect(() => {
        if (!open) return;
        const overlay = document.querySelector("[data-shell-overlay]");
        const detailsColumn = overlay?.previousElementSibling;
        const centerColumn = detailsColumn?.previousElementSibling;
        if (!detailsColumn || !centerColumn) return;
        const detailsWidth = Math.round(detailsColumn.getBoundingClientRect().width);
        const extraWidth = Math.max(0, Math.round(panelWidth - detailsWidth - 4));
        centerColumn.style.marginRight = extraWidth ? `${extraWidth}px` : "";
        if (extraWidth) document.body.setAttribute("data-rs-wide", "");
        else document.body.removeAttribute("data-rs-wide");
        return () => {
          centerColumn.style.marginRight = "";
          document.body.removeAttribute("data-rs-wide");
        };
      }, [open, panelWidth]);

      const beginResize = React.useCallback((event) => {
        if (event.button !== 0 && event.pointerType !== "touch") return;
        const controller = findDetailsResizeController();
        if (!controller) return;
        event.preventDefault();
        event.stopPropagation();
        resizeCleanupRef.current?.();

        const pointerId = event.pointerId;
        const startX = event.clientX;
        const resizeHandle = event.currentTarget;
        const overlay = document.querySelector("[data-shell-overlay]");
        const detailsColumn = overlay?.previousElementSibling;
        const startDetailsWidth = Math.round(detailsColumn?.getBoundingClientRect().width || panelWidth);
        const startPanelWidth = Math.round(resizeHandle.parentElement?.getBoundingClientRect().width || panelWidth) + 4;
        let latestX = startX;
        let frame = 0;
        const previousUserSelect = document.body.style.userSelect;
        const previousCursor = document.body.style.cursor;
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
        document.body.setAttribute("data-rs-resizing", "");
        postNativeBrowser({ action: "resizeStart" });
        try {
          resizeHandle.setPointerCapture(pointerId);
        } catch {}
        controller.onStart();
        manualResizeRef.current = true;
        setResizing(true);

        const applyResize = () => {
          const desiredWidth = clampPanelWidth(startPanelWidth - (latestX - startX));
          const targetDetailsWidth = Math.max(DETAILS_MIN_WIDTH, Math.min(DETAILS_MAX_WIDTH, desiredWidth));
          setPanelWidth(desiredWidth);
          controller.onDrag(startDetailsWidth - targetDetailsWidth);
          return desiredWidth;
        };
        const flush = () => {
          frame = 0;
          applyResize();
        };
        const move = (moveEvent) => {
          if (moveEvent.pointerId !== pointerId) return;
          moveEvent.preventDefault();
          latestX = moveEvent.clientX;
          if (!frame) frame = requestAnimationFrame(flush);
        };
        const cleanup = () => {
          window.removeEventListener("pointermove", move, true);
          window.removeEventListener("mousemove", move, true);
          window.removeEventListener("pointerup", finish, true);
          window.removeEventListener("mouseup", finish, true);
          window.removeEventListener("pointercancel", finish, true);
          window.removeEventListener("blur", finish, true);
          if (frame) cancelAnimationFrame(frame);
          try {
            if (resizeHandle.hasPointerCapture(pointerId)) resizeHandle.releasePointerCapture(pointerId);
          } catch {}
          document.body.style.userSelect = previousUserSelect;
          document.body.style.cursor = previousCursor;
          document.body.removeAttribute("data-rs-resizing");
          postNativeBrowser({ action: "resizeEnd" });
          manualResizeRef.current = false;
          resizeCleanupRef.current = null;
        };
        const finish = (finishEvent) => {
          if (typeof finishEvent?.pointerId === "number" && finishEvent.pointerId !== pointerId) return;
          latestX = typeof finishEvent?.clientX === "number" ? finishEvent.clientX : latestX;
          const finalWidth = applyResize();
          writePreference("dsh-right-sidebar:width", String(Math.round(finalWidth)));
          controller.onEnd();
          cleanup();
          setResizing(false);
        };
        window.addEventListener("pointermove", move, true);
        window.addEventListener("mousemove", move, true);
        window.addEventListener("pointerup", finish, true);
        window.addEventListener("mouseup", finish, true);
        window.addEventListener("pointercancel", finish, true);
        window.addEventListener("blur", finish, true);
        resizeCleanupRef.current = cleanup;
      }, []);

      React.useEffect(() => () => resizeCleanupRef.current?.(), []);

      React.useEffect(() => {
        const onKey = (event) => {
          if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "f") {
            event.preventDefault();
            toggle();
          }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
      }, [toggle]);

      React.useEffect(() => {
        if (tab !== "search" || query.trim().length < 2) {
          setResults([]);
          setSearchState(query.trim() ? "short" : "idle");
          return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
          setSearchState("loading");
          const response = await sessions.search(query.trim(), controller.signal);
          if (controller.signal.aborted) return;
          if (!response.ok) { setResults([]); setSearchState("error"); return; }
          const items = scope === "current" ? response.value.items.filter((item) => item.sessionId === current) : response.value.items;
          setResults(items);
          setSearchState(items.length ? "ready" : "empty");
        }, 220);
        return () => { clearTimeout(timer); controller.abort(); };
      }, [query, scope, current, tab, sessions]);

      const cwd = summary?.cwd;
      const files = React.useMemo(() => collectVisibleFiles(cwd), [current, cwd, tab, filesTick]);
      const filteredFiles = fileQuery.trim() ? files.filter((path) => path.toLowerCase().includes(fileQuery.trim().toLowerCase())) : files;
      const stats = summary?.projections?.values?.sessionStats || {};
      const pressure = summary?.projections?.values?.contextPressure || {};
      const permission = summary?.projections?.values?.permissions?.currentValue || "—";
      const percent = pressure.contextWindow ? Math.round(((pressure.pressureTokens || 0) / pressure.contextWindow) * 100) : 0;
      const browserUrl = browserIndex >= 0 ? browserHistory[browserIndex] : "";

      const chooseTab = (next) => { setTab(next); writePreference("dsh-right-sidebar:tab", next); if (next === "files") setFilesTick((n) => n + 1); };

      const navigate = React.useCallback((raw) => {
        const next = normalizeUrl(raw);
        if (!next) return;
        setBrowserHistory((history) => {
          const trimmed = history.slice(0, browserIndex + 1);
          return [...trimmed, next];
        });
        setBrowserIndex((value) => value + 1);
        setBrowserInput(next);
        writePreference("dsh-right-sidebar:url", next);
        if (nativeBrowserBridge) postNativeBrowser({ action: "navigate", url: next });
      }, [browserIndex]);

      const browserBack = () => {
        browserInputRef.current?.blur();
        browserEditingRef.current = false;
        if (nativeBrowserBridge) { postNativeBrowser({ action: "back" }); return; }
        const next = browserIndex - 1;
        if (next < 0) return;
        setBrowserIndex(next);
        setBrowserInput(browserHistory[next] || "");
        writePreference("dsh-right-sidebar:url", browserHistory[next] || "");
      };
      const browserForward = () => {
        browserInputRef.current?.blur();
        browserEditingRef.current = false;
        if (nativeBrowserBridge) { postNativeBrowser({ action: "forward" }); return; }
        const next = browserIndex + 1;
        if (next >= browserHistory.length) return;
        setBrowserIndex(next);
        setBrowserInput(browserHistory[next] || "");
        writePreference("dsh-right-sidebar:url", browserHistory[next] || "");
      };
      const browserReload = () => {
        browserInputRef.current?.blur();
        browserEditingRef.current = false;
        if (nativeBrowserBridge) { postNativeBrowser({ action: "reload" }); return; }
        setBrowserKey((value) => value + 1);
      };

      const closeTerminal = React.useCallback((id) => {
        if (id) terminalRequest({ action: "close", id }).catch(() => {});
      }, []);

      const startTerminal = React.useCallback(async () => {
        if (terminalStartingRef.current) return;
        terminalStartingRef.current = true;
        closeTerminal(terminalIdRef.current);
        terminalIdRef.current = null;
        setTerminalId(null);
        setTerminalOutput("");
        setTerminalError("");
        try {
          const value = await terminalRequest({ action: "start", cwd: cwd || undefined });
          terminalIdRef.current = value.id;
          setTerminalId(value.id);
          setTerminalCwd(value.cwd);
          setTerminalAlive(true);
        } catch (error) {
          setTerminalError(error.message || String(error));
          setTerminalAlive(false);
        } finally {
          terminalStartingRef.current = false;
        }
      }, [cwd, closeTerminal]);

      React.useEffect(() => {
        if (!open || tab !== "terminal" || terminalId) return;
        startTerminal();
      }, [open, tab, terminalId, startTerminal]);

      React.useEffect(() => {
        if (!terminalId || !open || tab !== "terminal") return;
        let live = true;
        const poll = async () => {
          try {
            const value = await terminalRequest({ action: "poll", id: terminalId });
            if (!live) return;
            setTerminalOutput(value.output || "");
            setTerminalCwd(value.cwd || "");
            setTerminalAlive(Boolean(value.alive));
          } catch (error) {
            if (live) setTerminalError(error.message || String(error));
          }
        };
        poll();
        const timer = setInterval(poll, 350);
        return () => { live = false; clearInterval(timer); };
      }, [terminalId, open, tab]);

      React.useEffect(() => {
        const node = terminalOutRef.current;
        if (node) node.scrollTop = node.scrollHeight;
      }, [terminalOutput]);

      React.useEffect(() => () => closeTerminal(terminalIdRef.current), [closeTerminal]);

      React.useEffect(() => {
        if (!nativeBrowserBridge) return;
        const onState = (event) => {
          const detail = event.detail || {};
          setNativeBrowserState({
            url: detail.url || "",
            canGoBack: Boolean(detail.canGoBack),
            canGoForward: Boolean(detail.canGoForward),
            loading: Boolean(detail.loading),
            error: detail.error || ""
          });
          if (detail.url && (!browserEditingRef.current || !detail.loading)) {
            setBrowserInput(detail.url);
            writePreference("dsh-right-sidebar:url", detail.url);
          }
        };
        window.addEventListener("dsh-native-browser-state", onState);
        return () => window.removeEventListener("dsh-native-browser-state", onState);
      }, []);

      React.useLayoutEffect(() => {
        if (!nativeBrowserBridge) return;
        if (!open || tab !== "browser" || !browserUrl || !browserFrameRef.current) {
          postNativeBrowser({ action: "hide" });
          return;
        }
        let frame = 0;
        let lastFrame = "";
        const node = browserFrameRef.current;
        const sync = () => {
          const rect = node.getBoundingClientRect();
          const nextFrame = [rect.x, rect.y, rect.width, rect.height].map((value) => Math.round(value * 2) / 2).join(":");
          if (nextFrame === lastFrame) return;
          lastFrame = nextFrame;
          postNativeBrowser({ action: "frame", x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        };
        const rect = node.getBoundingClientRect();
        postNativeBrowser({ action: "show", url: browserUrl, x: rect.x, y: rect.y, width: rect.width, height: rect.height });
        const followGeometry = () => {
          sync();
          frame = requestAnimationFrame(followGeometry);
        };
        const observer = new ResizeObserver(sync);
        observer.observe(node);
        window.addEventListener("resize", sync);
        followGeometry();
        return () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          window.removeEventListener("resize", sync);
          postNativeBrowser({ action: "hide" });
        };
      }, [open, tab, browserUrl]);

      const runCommand = async () => {
        const command = terminalInput;
        if (!terminalId || !command.trim()) return;
        setTerminalInput("");
        setCommandHistory((items) => [...items.filter((item) => item !== command), command].slice(-80));
        setHistoryIndex(-1);
        try { await terminalRequest({ action: "write", id: terminalId, command }); }
        catch (error) { setTerminalError(error.message || String(error)); }
      };

      const searchBody = h(React.Fragment, null,
        h("div", { className: "_rs_searchBox" }, icon("search", 15), h("input", { className: "_rs_input", value: query, autoFocus: true, placeholder: "搜索消息内容…", onChange: (event) => setQuery(event.target.value) })),
        h("div", { className: "_rs_scope" },
          h("button", { className: "_rs_scopeBtn", "data-active": scope === "current" || undefined, onClick: () => setScope("current") }, "当前会话"),
          h("button", { className: "_rs_scopeBtn", "data-active": scope === "all" || undefined, onClick: () => setScope("all") }, "全部会话")
        ),
        searchState === "idle" ? h("div", { className: "_rs_status" }, "输入至少两个字，快速定位历史消息。") : null,
        searchState === "short" ? h("div", { className: "_rs_status" }, "请再输入一个字。") : null,
        searchState === "loading" ? h("div", { className: "_rs_status" }, "正在搜索…") : null,
        searchState === "empty" ? h("div", { className: "_rs_status" }, "没有找到匹配内容。") : null,
        searchState === "error" ? h("div", { className: "_rs_status" }, "搜索暂时不可用，请稍后重试。") : null,
        h("div", { className: "_rs_list" }, results.map((item) => {
          const itemSummary = catalog[item.sessionId] || snapshot.byId[item.sessionId];
          return h("button", { key: item.sessionId, className: "_rs_item", onClick: () => sessions.open(item.sessionId) },
            h("span", { className: "_rs_itemTitle" }, titleFor(itemSummary)),
            h("span", { className: "_rs_itemSub" }, item.snippet)
          );
        }))
      );

      const filesBody = h(React.Fragment, null,
        h("div", { className: "_rs_searchBox" }, icon("search", 15), h("input", { className: "_rs_input", value: fileQuery, placeholder: "筛选当前窗口中的文件…", onChange: (event) => setFileQuery(event.target.value) })),
        cwd ? h("div", { className: "_rs_workspace" }, cwd) : null,
        h("div", { className: "_rs_sectionLabel" }, `最近文件 · ${filteredFiles.length}`),
        filteredFiles.length === 0 ? h("div", { className: "_rs_status" }, "当前消息窗口里还没有可识别的文件路径。") : null,
        h("div", { className: "_rs_list" }, filteredFiles.map((path) => h("button", { key: path, className: "_rs_item", onClick: () => workspaces.openPath(path).catch(() => {}) },
          h("span", { className: "_rs_itemTitle" }, basename(path)),
          h("span", { className: "_rs_itemSub _rs_path" }, path)
        )))
      );

      const overviewBody = summary ? h(React.Fragment, null,
        h("div", { className: "_rs_sectionLabel" }, "当前会话"),
        h("div", { className: "_rs_metrics" },
          h("div", { className: "_rs_metric" }, h("div", { className: "_rs_metricValue" }, stats.turns || 0), h("div", { className: "_rs_metricLabel" }, "轮次")),
          h("div", { className: "_rs_metric" }, h("div", { className: "_rs_metricValue" }, stats.steps || 0), h("div", { className: "_rs_metricLabel" }, "步骤")),
          h("div", { className: "_rs_metric" }, h("div", { className: "_rs_metricValue" }, `${percent}%`), h("div", { className: "_rs_metricLabel" }, "上下文")),
          h("div", { className: "_rs_metric" }, h("div", { className: "_rs_metricValue" }, summary.running ? "运行中" : "空闲"), h("div", { className: "_rs_metricLabel" }, "状态"))
        ),
        h("div", { className: "_rs_info" },
          h("div", { className: "_rs_infoRow" }, h("span", { className: "_rs_infoKey" }, "会话"), h("span", { className: "_rs_infoValue" }, titleFor(summary))),
          h("div", { className: "_rs_infoRow" }, h("span", { className: "_rs_infoKey" }, "预设"), h("span", { className: "_rs_infoValue" }, summary.agentPreset || "—")),
          h("div", { className: "_rs_infoRow" }, h("span", { className: "_rs_infoKey" }, "权限"), h("span", { className: "_rs_infoValue" }, permission)),
          h("div", { className: "_rs_infoRow" }, h("span", { className: "_rs_infoKey" }, "工作区"), h("span", { className: "_rs_infoValue" }, cwd ? basename(cwd) : "—"))
        )
      ) : h("div", { className: "_rs_status" }, "打开一个会话后，这里会显示运行概览。 ");

      const browserBody = h(React.Fragment, null,
        h("form", { className: "_rs_browserBar", onSubmit: (event) => { event.preventDefault(); browserEditingRef.current = false; browserInputRef.current?.blur(); navigate(browserInput); } },
          h("button", { type: "button", className: "_rs_navBtn", disabled: nativeBrowserBridge ? !nativeBrowserState.canGoBack : browserIndex <= 0, title: "后退", onClick: browserBack }, icon("back", 15)),
          h("button", { type: "button", className: "_rs_navBtn", disabled: nativeBrowserBridge ? !nativeBrowserState.canGoForward : browserIndex < 0 || browserIndex >= browserHistory.length - 1, title: "前进", onClick: browserForward }, icon("forward", 15)),
          h("button", { type: "button", className: "_rs_navBtn", disabled: !browserUrl, title: "刷新", onClick: browserReload }, icon("reload", 14)),
          h("input", { ref: browserInputRef, className: "_rs_url", value: browserInput, placeholder: "输入网址或搜索内容", onFocus: () => { browserEditingRef.current = true; }, onBlur: () => { browserEditingRef.current = false; }, onChange: (event) => setBrowserInput(event.target.value), onKeyDown: (event) => { if (event.key === "Enter" && !event.nativeEvent?.isComposing) { event.preventDefault(); browserEditingRef.current = false; const value = event.currentTarget.value; event.currentTarget.blur(); navigate(value); } } }),
          h("button", { type: "submit", className: "_rs_navBtn", disabled: !browserInput.trim(), title: "在右栏打开" }, icon("forward", 14))
        ),
        nativeBrowserBridge
          ? h("div", { ref: browserFrameRef, className: "_rs_browserFrame _rs_browserNative", role: "region", "aria-label": "内置浏览器页面" }, browserUrl ? null : h("div", { className: "_rs_browserEmpty" }, h("strong", null, "内置浏览器"), "输入网址或搜索内容，网页将在右栏中打开。"))
          : browserUrl
            ? h("iframe", { key: `${browserUrl}:${browserKey}`, className: "_rs_browserFrame", src: browserUrl, title: "内置浏览器", referrerPolicy: "no-referrer" })
            : h("div", { className: "_rs_browserEmpty" }, h("strong", null, "内置浏览器"), "输入网址或搜索内容即可开始。")
      );

      const terminalBody = h("div", { className: "_rs_terminal" },
        h("div", { className: "_rs_terminalTop" },
          h("span", { className: `_rs_terminalCwd${terminalError ? " _rs_terminalStatus" : ""}`, title: terminalError || terminalCwd }, terminalError || terminalCwd || "正在启动终端…"),
          h("button", { className: "_rs_terminalAction", title: "清空显示", onClick: () => setTerminalOutput("") }, "清空"),
          h("button", { className: "_rs_terminalAction", title: "重新启动终端", onClick: startTerminal }, "重启")
        ),
        h("pre", { className: "_rs_terminalOut", ref: terminalOutRef }, terminalOutput || (terminalAlive ? "终端已就绪。\n" : "")),
        h("div", { className: "_rs_terminalInputRow" },
          h("span", { className: "_rs_prompt" }, "$"),
          h("textarea", { className: "_rs_terminalInput", rows: 1, value: terminalInput, disabled: !terminalAlive, spellCheck: false, placeholder: terminalAlive ? "输入命令，按 Enter 运行" : "终端不可用", onChange: (event) => setTerminalInput(event.target.value), onKeyDown: (event) => {
            if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); runCommand(); return; }
            if (event.key === "ArrowUp" && !event.shiftKey && commandHistory.length) { event.preventDefault(); const next = historyIndex < 0 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1); setHistoryIndex(next); setTerminalInput(commandHistory[next]); }
            if (event.key === "ArrowDown" && !event.shiftKey && historyIndex >= 0) { event.preventDefault(); const next = historyIndex + 1; if (next >= commandHistory.length) { setHistoryIndex(-1); setTerminalInput(""); } else { setHistoryIndex(next); setTerminalInput(commandHistory[next]); } }
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") { event.preventDefault(); setTerminalOutput(""); }
          } })
        )
      );

      if (!open) return h("button", { className: "_rs_toggle", "aria-label": "打开多功能右边栏", title: "打开右边栏 · ⇧⌘F", onClick: toggle }, icon("panel", 17), h("span", { className: "_rs_hint" }, "搜索、浏览器与终端"));

      return h("aside", { className: "_rs_panel", style: { width: `${Math.max(296, panelWidth - 4)}px`, minWidth: "296px" }, "aria-label": "多功能右边栏" },
        h("div", { className: "_rs_resize", role: "separator", "aria-label": "调整右边栏宽度", "aria-orientation": "vertical", "data-dragging": resizing || undefined, title: "左右拖动调整宽度", onPointerDown: beginResize }),
        h("div", { className: "_rs_header" }, h("div", { className: "_rs_title" }, "辅助栏"), h("button", { className: "_rs_iconBtn", "aria-label": "关闭多功能右边栏", title: "关闭右边栏 · ⇧⌘F", onClick: toggle }, icon("close", 16))),
        h("div", { className: "_rs_tabs", role: "tablist" },
          [["search", "搜索"], ["files", "文件"], ["overview", "概览"], ["browser", "浏览器"], ["terminal", "终端"]].map(([id, label]) => h("button", { key: id, role: "tab", className: "_rs_tab", "data-active": tab === id || undefined, "aria-selected": tab === id, onClick: () => chooseTab(id) }, label))
        ),
        h("div", { className: "_rs_body", "data-full": tab === "browser" || tab === "terminal" || undefined }, tab === "search" ? searchBody : tab === "files" ? filesBody : tab === "overview" ? overviewBody : tab === "browser" ? browserBody : terminalBody)
      );
    }

    function useMediaOpen() {
      const [open, setOpen] = React.useState(() => readPreference("dsh-right-sidebar:media-open", "0") === "1");
      React.useEffect(() => {
        const onChange = (event) => setOpen(event.detail === true);
        window.addEventListener("dsh-media-open", onChange);
        return () => window.removeEventListener("dsh-media-open", onChange);
      }, []);
      const toggle = React.useCallback(() => {
        const next = !(readPreference("dsh-right-sidebar:media-open", "0") === "1");
        writePreference("dsh-right-sidebar:media-open", next ? "1" : "0");
        window.dispatchEvent(new CustomEvent("dsh-media-open", { detail: next }));
      }, []);
      return [open, toggle];
    }

    function MediaToggle() {
      const [open, toggle] = useMediaOpen();
      return h("button", {
        className: "_mp_toggle",
        "aria-label": "媒体播放器",
        "data-active": open || undefined,
        title: "媒体播放器",
        onClick: toggle
      }, icon("music", 16));
    }

    function MediaPlayer({ useSessions }) {
      const [open, toggle] = useMediaOpen();
      const snapshot = useSessions((state) => state);
      const cwd = snapshot.byId?.[snapshot.current]?.cwd || "";
      const [dir, setDir] = React.useState("");
      const [files, setFiles] = React.useState([]);
      const [loading, setLoading] = React.useState(false);
      const [error, setError] = React.useState("");
      const [currentPath, setCurrentPath] = React.useState("");

      const scan = React.useCallback(async (targetDir) => {
        setLoading(true);
        setError("");
        try {
          const response = await fetch("/dsh-right-sidebar/media/list", {
            method: "POST",
            headers: { "content-type": "application/json", "x-dsh-right-sidebar": "1" },
            body: JSON.stringify({ dir: targetDir || "" })
          });
          const value = await response.json();
          if (!response.ok || !value.ok) throw new Error(value.error || "扫描失败");
          setDir(value.dir);
          setFiles(Array.isArray(value.files) ? value.files : []);
        } catch (err) {
          setError(err?.message || String(err));
        } finally {
          setLoading(false);
        }
      }, []);

      React.useEffect(() => {
        if (open && !dir) scan(cwd || "");
      }, [open, dir, cwd, scan]);

      if (!open) return null;

      const isVideo = currentPath.toLowerCase().endsWith(".mp4");
      return h("aside", { className: "_mp_panel", "aria-label": "媒体播放器" },
        h("div", { className: "_mp_header" },
          h("div", { className: "_mp_title" }, "媒体播放器"),
          h("button", { className: "_mp_iconBtn", "aria-label": "关闭媒体播放器", title: "关闭", onClick: toggle }, icon("close", 16))
        ),
        h("div", { className: "_mp_body" },
          h("div", { className: "_mp_dirRow" },
            h("input", { className: "_mp_input", value: dir, placeholder: "目录路径，回车扫描", spellCheck: false, onChange: (event) => setDir(event.target.value), onKeyDown: (event) => { if (event.key === "Enter") scan(dir); } }),
            h("button", { className: "_mp_btn", onClick: () => scan(dir), disabled: loading }, loading ? "扫描中…" : "扫描")
          ),
          error ? h("div", { className: "_mp_status" }, error) : null,
          !loading && !error && files.length === 0 ? h("div", { className: "_mp_status" }, "没有找到 MP3 / MP4 文件，可输入其它目录后扫描。") : null,
          h("div", { className: "_mp_list" }, files.map((file) => h("button", {
            key: file.path, className: "_mp_file", "data-active": file.path === currentPath || undefined,
            onClick: () => setCurrentPath(file.path)
          },
            h("span", { className: "_mp_fileName" }, file.name),
            h("span", { className: "_mp_fileMeta" }, formatMediaSize(file.size))
          ))),
          currentPath ? h("div", { className: "_mp_player" },
            h("div", { className: "_mp_now" }, currentPath),
            isVideo
              ? h("video", { key: currentPath, className: "_mp_video", src: mediaStreamUrl(currentPath), controls: true, autoPlay: true })
              : h("audio", { key: currentPath, className: "_mp_audio", src: mediaStreamUrl(currentPath), controls: true, autoPlay: true })
          ) : null
        )
      );
    }

    const inject = ["slots", "layout", "sessions", "workspaces", "connection"];
    function apply(ctx) {
      const useSessions = bindSnapshotSelector(ctx.sessions.list);
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay",
        id: "right-sidebar",
        order: 100,
        inject: () => ({ useSessions, sessions: ctx.sessions, workspaces: ctx.workspaces, layout: ctx.layout, connection: ctx.connection })
      }, RightSidebar));
      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
        name: "sidebar.footer.action",
        id: "media-player-toggle",
        order: 50,
        inject: () => ({})
      }, MediaToggle));
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay",
        id: "media-player",
        order: 90,
        inject: () => ({ useSessions })
      }, MediaPlayer));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
