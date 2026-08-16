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
._rs_tabs{height:42px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l1);display:flex;align-items:end;gap:14px;flex:none;overflow-x:auto;scrollbar-width:none}
._rs_tabs::-webkit-scrollbar{display:none}
._rs_tab{height:42px;padding:0 2px;flex:none;white-space:nowrap;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:13px;cursor:pointer}
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
._mp_body{display:flex;flex-direction:column;gap:12px}
._mp_dirRow{display:flex;gap:8px;flex:none}
._mp_input{min-width:0;flex:1;height:32px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;padding:0 9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:0}
._mp_input:focus{border-color:var(--dsw-alias-brand-primary)}
._mp_btn{height:32px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;flex:none}
._mp_btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
._mp_btn:disabled{opacity:.5;cursor:default}
._mp_pick{width:100%;height:40px;flex:none;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
._mp_pick:hover{background:var(--dsw-alias-interactive-bg-hover)}
._mp_status{padding:14px 4px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px;flex:none}
._mp_plHead{display:flex;align-items:center;justify-content:space-between;margin-top:4px}
._mp_plActions{display:flex;align-items:center;gap:4px}
._mp_plLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
._mp_clear{height:24px;padding:0 8px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;cursor:pointer}
._mp_clear:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
._mp_list{display:flex;flex-direction:column}
._mp_file{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l1);background:transparent;text-align:left;padding:8px 4px;color:inherit;cursor:pointer;display:flex;align-items:center;gap:4px}
._mp_file:hover{background:var(--dsw-alias-interactive-bg-hover);border-radius:9px}
._mp_file[data-active]{background:var(--dsw-alias-interactive-bg-active);border-radius:9px}
._mp_file[data-active] ._mp_fileName{color:var(--dsw-alias-brand-primary)}
._mp_fileText{min-width:0;flex:1;display:flex;flex-direction:column}
._mp_fileName{min-width:0;color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
._mp_fileSub{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;margin-top:1px}
._mp_fileMeta{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;font-family:var(--ds-font-family-code)}
._mp_fileRemove{flex:none;width:22px;height:22px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);display:grid;place-items:center;cursor:pointer}
._mp_fileRemove:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
._mp_video{width:100%;max-height:260px;background:#000;border-radius:10px;display:block}
._np_footer{flex:none;border-top:1px solid var(--dsw-alias-border-l1);padding:10px 14px 12px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-base)}
._np_footer[data-hidden]{display:none}
._np_viz{width:100%;height:56px;display:block;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 60%,transparent)}
._np_row{display:flex;align-items:center;justify-content:space-between;gap:10px}
._np_info{min-width:0;flex:1}
._np_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:18px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
._np_time{color:var(--dsw-alias-label-tertiary);font-size:11px;margin-top:2px;font-family:var(--ds-font-family-code)}
._np_sub{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;margin-top:2px}
._np_controls{display:flex;align-items:center;gap:2px;flex:none}
._np_btn{width:30px;height:30px;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer}
._np_btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
._np_btn[data-active]{color:var(--dsw-alias-brand-primary)}
._np_play{width:36px;height:36px;background:var(--dsw-alias-brand-primary);color:#fff}
._np_play:hover{background:var(--dsw-alias-brand-primary);color:#fff}
._np_seek{width:100%;height:4px;-webkit-appearance:none;appearance:none;background:var(--dsw-alias-border-l2);border-radius:2px;outline:0;cursor:pointer}
._np_seek::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:var(--dsw-alias-brand-primary);cursor:pointer}
._sp_section{margin-top:18px;padding-top:14px;border-top:1px solid var(--dsw-alias-border-l1)}
._eb_shelf{min-height:0;flex:1;overflow-y:auto;padding:14px 14px 24px;display:flex;flex-direction:column;gap:12px}
._eb_reader{min-height:0;flex:1;display:flex;flex-direction:column;overflow:hidden}
._eb_toolbar{height:44px;flex:none;border-bottom:1px solid var(--dsw-alias-border-l1);display:flex;align-items:center;gap:2px;padding:0 8px}
._eb_title{min-width:0;flex:1;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;padding:0 6px}
._eb_chapters{max-height:45%;overflow:auto;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);padding:6px;flex:none}
._eb_chapter{display:block;width:100%;text-align:left;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:20px;padding:5px 8px;border-radius:7px;cursor:pointer;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
._eb_chapter:hover{background:var(--dsw-alias-interactive-bg-hover)}
._eb_chapter[data-active]{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-brand-primary)}
._eb_content{min-height:0;flex:1;overflow:hidden;background:#fff}
._eb_frame{width:100%;height:100%;border:0;display:block}
._eb_scale{flex:none;min-width:44px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:11px;font-family:var(--ds-font-family-code)}
._dy_body{min-height:0;flex:1;display:flex;flex-direction:column;align-items:stretch;gap:12px;padding:12px 12px 24px;overflow-y:auto}
._dy_toolbar{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;flex:none}
._dy_phone{position:relative;flex:none;width:100%;background:#0a0a0c;border:1px solid #26262c;border-radius:32px;padding:12px;box-sizing:border-box;box-shadow:0 16px 36px rgba(0,0,0,.28)}
._dy_notch{width:34%;height:16px;border-radius:9px;background:#000;margin:0 auto 9px}
._dy_screen{position:relative;width:100%;aspect-ratio:9/19;border-radius:22px;overflow:hidden;background:#000}
._dy_homeBar{width:32%;height:5px;border-radius:3px;background:#2a2a30;margin:10px auto 0}
._dy_status{padding:0 6px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px;text-align:center}
._dy_status a{color:var(--dsw-alias-brand-primary);text-decoration:none}
._dy_status a:hover{text-decoration:underline}
._dy_btn{height:30px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
._dy_btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
._rs_setGroup{flex-direction:column;gap:8px;padding:16px 0;border-bottom:1px solid var(--dsw-alias-border-l2);display:flex}
._rs_setTitle{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
._rs_setDesc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
._rs_setChips{flex-wrap:wrap;align-items:center;gap:6px;display:flex}
._rs_setChip{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border-radius:999px;padding:5px 14px;font-size:13px;line-height:20px}
._rs_setChip:hover{background:var(--dsw-alias-interactive-bg-hover)}
._rs_setChip[aria-pressed=true]{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-static-neutral-bluish-400)}
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
      if (kind === "douyin") return h("svg", common, h("path", { d: "M9.5 18.5V6.2l9.5-1.7v11.2" }), h("circle", { cx: 7, cy: 18.5, r: 2.6 }), h("circle", { cx: 16.5, cy: 15.7, r: 2.6 }), h("path", { d: "M19 8.3c-1.8 0-3.4-.9-4.3-2.3" }));
      if (kind === "play") return h("svg", common, h("path", { d: "M7 5l12 7-12 7z" }));
      if (kind === "pause") return h("svg", common, h("path", { d: "M7 5h4v14H7zM13 5h4v14h-4z" }));
      if (kind === "prev") return h("svg", common, h("path", { d: "M6 5v14M19 5l-10 7 10 7z" }));
      if (kind === "next") return h("svg", common, h("path", { d: "M18 5v14M5 5l10 7-10 7z" }));
      if (kind === "up") return h("svg", common, h("path", { d: "M12 5l-6 6h12z" }));
      if (kind === "down") return h("svg", common, h("path", { d: "M12 19l6-6H6z" }));
      if (kind === "repeat") return h("svg", common, h("path", { d: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" }));
      if (kind === "shuffle") return h("svg", common, h("path", { d: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" }));
      if (kind === "repeat-one") return h("svg", common, h("path", { d: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3M11 10h1.5v4" }));
      if (kind === "book") return h("svg", common, h("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" }));
      if (kind === "list") return h("svg", common, h("path", { d: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" }));
      if (kind === "zoom-in") return h("svg", common, h("circle", { cx: 11, cy: 11, r: 7 }), h("path", { d: "m21 21-4.35-4.35M11 8v6M8 11h6" }));
      if (kind === "zoom-out") return h("svg", common, h("circle", { cx: 11, cy: 11, r: 7 }), h("path", { d: "m21 21-4.35-4.35M8 11h6" }));
      if (kind === "eye") return h("svg", common, h("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" }), h("circle", { cx: 12, cy: 12, r: 3 }));
      return h("svg", common, h("path", { d: "M5 4h14v16H5zM9 8h6M9 12h6M9 16h4" }));
    }

    const readPreference = (key, fallback) => {
      try { const value = window.localStorage.getItem(key); return value === null ? fallback : value; } catch { return fallback; }
    };
    const writePreference = (key, value) => { try { window.localStorage.setItem(key, value); } catch {} };

    // Tabs the sidebar can show, in display order. `id` is the stable key;
    // `zh`/`en` are used by the Settings row (localized through the locale
    // service) and by the tab bar fallback labels.
    const SIDEBAR_TABS = [
      { id: "search", zh: "搜索", en: "Search" },
      { id: "files", zh: "文件", en: "Files" },
      { id: "overview", zh: "概览", en: "Overview" },
      { id: "browser", zh: "浏览器", en: "Browser" },
      { id: "terminal", zh: "终端", en: "Terminal" },
      { id: "media", zh: "媒体", en: "Media" },
      { id: "ebook", zh: "电子书", en: "E-book" },
      { id: "douyin", zh: "抖音", en: "TikTok" }
    ];
    const DEFAULT_VISIBLE_TABS = () => Object.fromEntries(SIDEBAR_TABS.map((entry) => [entry.id, true]));
    const TABS_PREFERENCE_KEY = "dsh-right-sidebar:tabs";

    // Reactive visibility store shared by the sidebar tab bar and the Settings
    // row. Out-of-tree plugins resolve without `@deepseek-ai/dsh-settings`, so
    // persistence uses localStorage (same pattern as the theme-from-image
    // plugin), while the row itself mounts through the official
    // `settings.general.item` slot.
    function createTabsStore() {
      let visible = (() => {
        const base = DEFAULT_VISIBLE_TABS();
        try {
          const saved = JSON.parse(readPreference(TABS_PREFERENCE_KEY, ""));
          if (saved && typeof saved === "object") {
            for (const entry of SIDEBAR_TABS) {
              if (typeof saved[entry.id] === "boolean") base[entry.id] = saved[entry.id];
            }
          }
        } catch {}
        return base;
      })();
      const listeners = new Set();
      return {
        getSnapshot: () => visible,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        setVisible: (id, value) => {
          const next = { ...visible, [id]: Boolean(value) };
          visible = next;
          writePreference(TABS_PREFERENCE_KEY, JSON.stringify(next));
          for (const listener of listeners) listener();
        }
      };
    }
    const SETTINGS_NS = "settings.rightSidebar";
    const settingsZh = {
      "sidebar.tabs.title": "辅助栏标签页",
      "sidebar.tabs.description": "选择要显示在右侧辅助栏的标签页。",
      "sidebar.tab.search": "搜索",
      "sidebar.tab.files": "文件",
      "sidebar.tab.overview": "概览",
      "sidebar.tab.browser": "浏览器",
      "sidebar.tab.terminal": "终端",
      "sidebar.tab.media": "媒体",
      "sidebar.tab.ebook": "电子书",
      "sidebar.tab.douyin": "抖音"
    };
    const settingsEn = {
      "sidebar.tabs.title": "Sidebar tabs",
      "sidebar.tabs.description": "Choose which tabs appear in the right sidebar.",
      "sidebar.tab.search": "Search",
      "sidebar.tab.files": "Files",
      "sidebar.tab.overview": "Overview",
      "sidebar.tab.browser": "Browser",
      "sidebar.tab.terminal": "Terminal",
      "sidebar.tab.media": "Media",
      "sidebar.tab.ebook": "E-book",
      "sidebar.tab.douyin": "TikTok"
    };

    // Settings → General row: toggle chips for each sidebar tab.
    function SidebarTabsRow({ t, useTabs, setTabVisible }) {
      const visible = useTabs((state) => state);
      return h("div", { className: "_rs_setGroup" },
        h("div", { className: "_rs_setTitle" }, t("sidebar.tabs.title")),
        h("div", { className: "_rs_setDesc" }, t("sidebar.tabs.description")),
        h("div", { className: "_rs_setChips" },
          SIDEBAR_TABS.map((entry) => h("button", {
            key: entry.id,
            type: "button",
            className: "_rs_setChip",
            "aria-pressed": visible[entry.id] ? "true" : "false",
            onClick: () => setTabVisible(entry.id, !visible[entry.id])
          }, t(`sidebar.tab.${entry.id}`)))
        )
      );
    }

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
    const isMediaFile = (path) => /\.(mp3|mp4)$/i.test(String(path || ""));
    const mediaName = (path) => {
      const base = basename(path).replace(/\.(mp3|mp4)$/i, "");
      return base.replace(/[_-]+/g, " ").trim() || base;
    };
    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    };
    const mediaPickerBridge = window.webkit?.messageHandlers?.dshMediaPicker;
    const savePlaylistBridge = window.webkit?.messageHandlers?.dshSavePlaylist;
    const fetchMediaMetadata = async (path) => {
      try {
        const response = await fetch("/dsh-right-sidebar/media/metadata", {
          method: "POST",
          headers: { "content-type": "application/json", "x-dsh-right-sidebar": "1" },
          body: JSON.stringify({ path })
        });
        const value = await response.json();
        if (!response.ok || !value.ok) return {};
        return {
          title: typeof value.title === "string" ? value.title : "",
          artist: typeof value.artist === "string" ? value.artist : "",
          album: typeof value.album === "string" ? value.album : ""
        };
      } catch {
        return {};
      }
    };

    const SPOTIFY_TYPES = ["track", "album", "playlist", "artist", "episode", "show"];
    const parseSpotifyLink = (value) => {
      const input = String(value || "").trim();
      if (!input) return null;
      const uri = /^spotify:(track|album|playlist|artist|episode|show):([A-Za-z0-9]+)/i.exec(input);
      if (uri) return { type: uri[1].toLowerCase(), id: uri[2] };
      try {
        const url = new URL(/^[a-z]+:\/\//i.test(input) ? input : `https://${input}`);
        if (!/(^|\.)spotify\.com$/i.test(url.hostname)) return null;
        const match = /(?:\/intl-[a-z]{2})?\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/i.exec(url.pathname);
        if (!match || !SPOTIFY_TYPES.includes(match[1].toLowerCase())) return null;
        return { type: match[1].toLowerCase(), id: match[2] };
      } catch {
        return null;
      }
    };
    const spotifyPageUrl = (parsed) => `https://open.spotify.com/${parsed.type}/${parsed.id}`;

    const ebookRequest = async (endpoint, body) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", "x-dsh-right-sidebar": "1" },
        body: JSON.stringify(body)
      });
      const value = await response.json();
      if (!response.ok || !value.ok) throw new Error(value.error || "电子书服务不可用");
      return value;
    };
    const ebookExt = (path) => (/\.pdf$/i.test(String(path || "")) ? "pdf" : /\.epub$/i.test(String(path || "")) ? "epub" : "");
    const ebookName = (path) => {
      const base = basename(path).replace(/\.(epub|pdf)$/i, "");
      return base.trim() || base;
    };
    const ebookPdfUrl = (path) => `/dsh-right-sidebar/ebook/pdf?path=${encodeURIComponent(path)}`;
    const wrapChapter = (html, eyeMode) => {
      const background = eyeMode ? "#f6efdf" : "#ffffff";
      const color = eyeMode ? "#4a4032" : "#1c1c1e";
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:${background}!important}body{padding:26px 32px;font-family:-apple-system,'PingFang SC','Hiragino Sans GB',sans-serif;line-height:1.9;color:${color}!important;word-break:break-word;max-width:720px;margin:0 auto;box-sizing:border-box}img{max-width:100%;height:auto}h1,h2,h3,h4,h5{line-height:1.4;color:inherit}p{margin:0 0 1em}</style></head><body>${html}</body></html>`;
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

    function RightSidebar({ useSessions, useLocale, useTabs, sessions, workspaces, layout, connection }) {
      const snapshot = useSessions((state) => state);
      const localeSnapshot = useLocale((state) => state);
      const localeActive = localeSnapshot?.active || "zh";
      const tabsVisible = useTabs((state) => state);
      const visibleTabIds = React.useMemo(
        () => SIDEBAR_TABS.filter((entry) => tabsVisible[entry.id] !== false).map((entry) => entry.id),
        [tabsVisible]
      );
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
      const [mediaPlaylist, setMediaPlaylist] = React.useState(() => {
        try {
          const parsed = JSON.parse(readPreference("dsh-right-sidebar:playlist", "[]"));
          return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
      });
      const [mediaPath, setMediaPath] = React.useState(() => readPreference("dsh-right-sidebar:media-path", ""));
      const [mediaInput, setMediaInput] = React.useState("");
      const [mediaHint, setMediaHint] = React.useState("");
      const [mediaPlaying, setMediaPlaying] = React.useState(false);
      const [mediaTime, setMediaTime] = React.useState(() => {
        const saved = Number(readPreference("dsh-right-sidebar:media-time", "0"));
        return Number.isFinite(saved) && saved > 0 ? saved : 0;
      });
      const [mediaDuration, setMediaDuration] = React.useState(0);
      const [playMode, setPlayMode] = React.useState(() => readPreference("dsh-right-sidebar:play-mode", "order"));
      const [spotifyLink, setSpotifyLink] = React.useState(() => readPreference("dsh-right-sidebar:spotify", ""));
      const [ebookLibrary, setEbookLibrary] = React.useState(() => {
        try {
          const parsed = JSON.parse(readPreference("dsh-right-sidebar:ebooks", "[]"));
          return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
      });
      const [ebookOpen, setEbookOpen] = React.useState(() => readPreference("dsh-right-sidebar:ebook-open", ""));
      const [ebookMeta, setEbookMeta] = React.useState(null);
      const [ebookChapterIndex, setEbookChapterIndex] = React.useState(0);
      const [ebookHtml, setEbookHtml] = React.useState("");
      const [ebookLoading, setEbookLoading] = React.useState(false);
      const [ebookError, setEbookError] = React.useState("");
      const [ebookShowChapters, setEbookShowChapters] = React.useState(false);
      const [ebookFontScale, setEbookFontScale] = React.useState(() => {
        const saved = Number(readPreference("dsh-right-sidebar:ebook-scale", "1"));
        return Number.isFinite(saved) && saved > 0 ? saved : 1;
      });
      const [ebookInput, setEbookInput] = React.useState("");
      const [ebookEyeMode, setEbookEyeMode] = React.useState(() => readPreference("dsh-right-sidebar:ebook-eye", "0") === "1");
      const douyinSite = localeActive === "en" ? "https://www.tiktok.com/" : "https://www.douyin.com/";
      const douyinFrameRef = React.useRef(null);
      const nativeOwnerRef = React.useRef("");
      const [modalOpen, setModalOpen] = React.useState(false);
      const audioRef = React.useRef(null);
      const videoRef = React.useRef(null);
      const vizCanvasRef = React.useRef(null);
      const audioCtxRef = React.useRef(null);

      const isMediaVideo = mediaPath.toLowerCase().endsWith(".mp4");
      const currentMediaName = mediaPath ? mediaName(mediaPath) : "";
      const currentMediaItem = mediaPlaylist.find((item) => item.path === mediaPath);
      const currentMediaSub = [currentMediaItem?.artist, currentMediaItem?.album].filter(Boolean).join(" · ");
      const modeTitle = playMode === "order" ? "顺序播放" : playMode === "shuffle" ? "随机播放" : "单曲循环";
      const modeIcon = playMode === "order" ? "repeat" : playMode === "shuffle" ? "shuffle" : "repeat-one";

      const addMediaPaths = React.useCallback((paths) => {
        const valid = [];
        for (const raw of paths) {
          const path = String(raw || "").trim();
          if (!path || !isMediaFile(path)) continue;
          valid.push({ path, name: mediaName(path), title: "", artist: "", album: "" });
        }
        if (!valid.length) return;
        setMediaPlaylist((items) => {
          const seen = new Set(items.map((item) => item.path));
          return [...items, ...valid.filter((item) => !seen.has(item.path))];
        });
        setMediaPath((current) => current || valid[0].path);
        for (const item of valid) {
          fetchMediaMetadata(item.path).then((meta) => {
            setMediaPlaylist((items) => items.map((it) => (it.path === item.path ? { ...it, ...meta } : it)));
          }).catch(() => {});
        }
      }, []);

      const pickMedia = React.useCallback(() => {
        if (!mediaPickerBridge) {
          setMediaHint("当前环境不支持原生文件选择，请在下方输入文件路径。");
          return;
        }
        setMediaHint("");
        try { mediaPickerBridge.postMessage({ action: "pick" }); }
        catch { setMediaHint("无法打开文件选择器。"); }
      }, []);

      React.useEffect(() => {
        const onPicked = (event) => {
          const paths = event.detail?.paths;
          if (Array.isArray(paths) && paths.length) addMediaPaths(paths);
        };
        window.addEventListener("dsh-media-picked", onPicked);
        return () => window.removeEventListener("dsh-media-picked", onPicked);
      }, [addMediaPaths]);

      const removeMediaPath = React.useCallback((path) => {
        setMediaPlaylist((items) => items.filter((item) => item.path !== path));
        setMediaPath((current) => (current === path ? "" : current));
      }, []);

      const moveMediaItem = React.useCallback((index, delta) => {
        setMediaPlaylist((items) => {
          const target = index + delta;
          if (target < 0 || target >= items.length) return items;
          const next = [...items];
          [next[index], next[target]] = [next[target], next[index]];
          return next;
        });
      }, []);

      const clearMediaList = React.useCallback(() => {
        setMediaPlaylist([]);
        setMediaPath("");
        setMediaPlaying(false);
        setMediaTime(0);
        setMediaDuration(0);
      }, []);

      const playMedia = React.useCallback((path) => {
        setMediaPath(path);
        setMediaTime(0);
        setMediaPlaying(true);
      }, []);

      const playMediaNext = React.useCallback(() => {
        if (!mediaPlaylist.length) return;
        if (playMode === "shuffle" && mediaPlaylist.length > 1) {
          const cur = mediaPlaylist.findIndex((item) => item.path === mediaPath);
          let idx = Math.floor(Math.random() * mediaPlaylist.length);
          if (idx === cur) idx = (idx + 1) % mediaPlaylist.length;
          playMedia(mediaPlaylist[idx].path);
          return;
        }
        const idx = mediaPlaylist.findIndex((item) => item.path === mediaPath);
        const next = mediaPlaylist[(idx + 1) % mediaPlaylist.length];
        if (next) playMedia(next.path);
      }, [mediaPlaylist, mediaPath, playMode, playMedia]);

      const playMediaPrev = React.useCallback(() => {
        if (!mediaPlaylist.length) return;
        const idx = mediaPlaylist.findIndex((item) => item.path === mediaPath);
        const prev = mediaPlaylist[(idx - 1 + mediaPlaylist.length) % mediaPlaylist.length];
        if (prev) playMedia(prev.path);
      }, [mediaPlaylist, mediaPath, playMedia]);

      const cyclePlayMode = React.useCallback(() => {
        setPlayMode((mode) => (mode === "order" ? "shuffle" : mode === "shuffle" ? "loop-one" : "order"));
      }, []);

      const handleMediaEnded = React.useCallback(() => {
        if (playMode === "loop-one") {
          const el = isMediaVideo ? videoRef.current : audioRef.current;
          if (el) { el.currentTime = 0; const p = el.play(); if (p) p.catch(() => {}); }
          return;
        }
        playMediaNext();
      }, [playMode, isMediaVideo, playMediaNext]);

      const exportPlaylist = React.useCallback(() => {
        if (!mediaPlaylist.length) { setMediaHint("播放列表为空，无法导出。"); return; }
        const lines = ["#EXTM3U"];
        for (const item of mediaPlaylist) {
          const meta = [item.artist, item.album].filter(Boolean).join(" · ");
          const title = item.title || item.name;
          lines.push(`#EXTINF:0,${meta ? `${title} - ${meta}` : title}`);
          lines.push(item.path);
        }
        const content = `${lines.join("\n")}\n`;
        if (savePlaylistBridge) {
          try { savePlaylistBridge.postMessage({ action: "save", content }); }
          catch { setMediaHint("无法导出播放列表。"); }
        } else {
          setMediaHint("当前环境不支持导出，请在 App 中使用。");
        }
      }, [mediaPlaylist]);

      const toggleMedia = React.useCallback(() => {
        const el = isMediaVideo ? videoRef.current : audioRef.current;
        if (!el) return;
        if (el.paused) { const p = el.play(); if (p) p.catch(() => {}); }
        else el.pause();
      }, [isMediaVideo]);

      const seekMedia = React.useCallback((value) => {
        const el = isMediaVideo ? videoRef.current : audioRef.current;
        const time = Number(value);
        if (!el || !Number.isFinite(time)) return;
        el.currentTime = time;
        setMediaTime(time);
      }, [isMediaVideo]);

      const submitMediaPath = () => {
        const value = mediaInput.trim();
        if (!value) return;
        if (!isMediaFile(value)) { setMediaHint("仅支持 MP3 / MP4 文件。"); return; }
        setMediaHint("");
        addMediaPaths([value]);
        setMediaInput("");
      };

      React.useEffect(() => {
        if (!mediaPath) return;
        const el = mediaPath.toLowerCase().endsWith(".mp4") ? videoRef.current : audioRef.current;
        if (!el) return;
        el.load();
        if (mediaTime > 0) {
          const onMeta = () => {
            try { el.currentTime = mediaTime; } catch {}
            el.removeEventListener("loadedmetadata", onMeta);
          };
          el.addEventListener("loadedmetadata", onMeta);
        }
        const p = el.play();
        if (p) p.catch(() => {});
      }, [mediaPath]);

      React.useEffect(() => {
        writePreference("dsh-right-sidebar:playlist", JSON.stringify(mediaPlaylist));
        writePreference("dsh-right-sidebar:media-path", mediaPath || "");
      }, [mediaPlaylist, mediaPath]);

      React.useEffect(() => {
        writePreference("dsh-right-sidebar:play-mode", playMode);
      }, [playMode]);

      React.useEffect(() => {
        writePreference("dsh-right-sidebar:spotify", spotifyLink.trim());
      }, [spotifyLink]);

      React.useEffect(() => {
        if (!mediaPath || !mediaPlaying) return;
        const timer = setInterval(() => {
          const el = isMediaVideo ? videoRef.current : audioRef.current;
          if (el && Number.isFinite(el.currentTime) && el.currentTime > 0) {
            writePreference("dsh-right-sidebar:media-time", String(el.currentTime));
          }
        }, 2000);
        return () => clearInterval(timer);
      }, [mediaPath, mediaPlaying, isMediaVideo]);

      React.useEffect(() => {
        if (tab !== "media" || !isMediaVideo) return;
        const v = videoRef.current;
        if (v && v.paused) { const p = v.play(); if (p) p.catch(() => {}); }
      }, [tab, isMediaVideo]);

      React.useEffect(() => {
        if (!open) return;
        const audio = audioRef.current;
        const canvas = vizCanvasRef.current;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!audio || !canvas || !Ctx) return;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        try {
          const source = ctx.createMediaElementSource(audio);
          source.connect(analyser);
          source.connect(ctx.destination);
        } catch {}
        const data = new Uint8Array(analyser.frequencyBinCount);
        let raf = 0;
        const draw = () => {
          const c = vizCanvasRef.current;
          if (c) {
            const g = c.getContext("2d");
            const w = c.width;
            const h = c.height;
            if (w && h) {
              analyser.getByteFrequencyData(data);
              g.clearRect(0, 0, w, h);
              const bars = 64;
              const gap = 2;
              const bw = (w - gap * (bars - 1)) / bars;
              const grad = g.createLinearGradient(0, h, 0, 0);
              grad.addColorStop(0, "#4f7cff");
              grad.addColorStop(1, "#b388ff");
              g.fillStyle = grad;
              for (let i = 0; i < bars; i++) {
                const v = data[Math.floor((i / bars) * (data.length * 0.72))] / 255;
                const bh = Math.max(2, v * (h - 4));
                const x = i * (bw + gap);
                g.fillRect(x, h - bh, bw, bh);
              }
            }
          }
          raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
      }, [open]);

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

      // If the active tab is hidden (e.g. toggled off in Settings), fall back
      // to the first still-visible tab so the panel never shows a ghost body.
      React.useEffect(() => {
        if (!visibleTabIds.includes(tab)) {
          const fallback = visibleTabIds[0] || "search";
          setTab(fallback);
          writePreference("dsh-right-sidebar:tab", fallback);
        }
      }, [visibleTabIds, tab]);

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
          if (detail.url && nativeOwnerRef.current === "browser" && (!browserEditingRef.current || !detail.loading)) {
            setBrowserInput(detail.url);
            writePreference("dsh-right-sidebar:url", detail.url);
          }
        };
        window.addEventListener("dsh-native-browser-state", onState);
        return () => window.removeEventListener("dsh-native-browser-state", onState);
      }, []);

      React.useEffect(() => {
        if (typeof document === "undefined") return;
        const refresh = () => setModalOpen(Boolean(document.querySelector('[aria-modal="true"]')));
        refresh();
        const observer = new MutationObserver(refresh);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-modal"] });
        return () => observer.disconnect();
      }, []);

      React.useLayoutEffect(() => {
        if (!nativeBrowserBridge) return;
        const douyinActive = open && tab === "douyin" && douyinFrameRef.current;
        const browserActive = open && tab === "browser" && browserUrl && browserFrameRef.current;
        const node = douyinActive ? douyinFrameRef.current : browserActive ? browserFrameRef.current : null;
        const activeUrl = douyinActive ? douyinSite : browserActive ? browserUrl : "";
        if (!node || !activeUrl || modalOpen) {
          postNativeBrowser({ action: "hide" });
          return;
        }
        let frame = 0;
        let lastFrame = "";
        const radius = douyinActive ? 22 : 0;
        const sync = () => {
          const rect = node.getBoundingClientRect();
          const nextFrame = [rect.x, rect.y, rect.width, rect.height].map((value) => Math.round(value * 2) / 2).join(":");
          if (nextFrame === lastFrame) return;
          lastFrame = nextFrame;
          postNativeBrowser({ action: "frame", x: rect.x, y: rect.y, width: rect.width, height: rect.height, radius });
        };
        const rect = node.getBoundingClientRect();
        postNativeBrowser({ action: "show", url: activeUrl, x: rect.x, y: rect.y, width: rect.width, height: rect.height, radius });
        const owner = douyinActive ? `douyin:${douyinSite}` : "browser";
        if (nativeOwnerRef.current !== owner) {
          const previous = nativeOwnerRef.current;
          nativeOwnerRef.current = owner;
          // On first mount the `show` action already loads the URL when the
          // embedded browser is empty; only force a reload on a real switch.
          // The douyin owner key includes the site so switching language
          // (Douyin <-> TikTok) also reloads the frame.
          if (previous !== "") postNativeBrowser({ action: "navigate", url: activeUrl });
        }
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
      }, [open, tab, browserUrl, douyinSite, modalOpen]);

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

      const openSpotifyPage = (url) => {
        chooseTab("browser");
        navigate(url);
      };
      const spotifyConfig = parseSpotifyLink(spotifyLink);
      const openSpotify = () => {
        if (spotifyConfig) openSpotifyPage(spotifyPageUrl(spotifyConfig));
      };
      const spotifySection = h("div", { className: "_sp_section" },
        h("div", { className: "_mp_plHead" },
          h("span", { className: "_mp_plLabel" }, "Spotify 在线音乐"),
          h("div", { className: "_mp_plActions" },
            h("button", { className: "_mp_clear", title: "在右栏浏览器打开 Spotify 首页并登录", onClick: () => openSpotifyPage("https://open.spotify.com/") }, "打开首页")
          )
        ),
        h("div", { className: "_mp_dirRow" },
          h("input", { className: "_mp_input", value: spotifyLink, placeholder: "粘贴 Spotify 单曲 / 专辑 / 歌单 / 播客链接", spellCheck: false, onChange: (event) => setSpotifyLink(event.target.value), onKeyDown: (event) => { if (event.key === "Enter") openSpotify(); } }),
          spotifyLink.trim() ? h("button", { className: "_mp_btn", onClick: () => setSpotifyLink("") }, "清除") : null,
          h("button", { className: "_mp_btn", disabled: !spotifyConfig, onClick: openSpotify }, "打开")
        ),
        h("div", { className: "_mp_status" }, spotifyLink.trim() && !spotifyConfig ? "无法识别这个链接，请粘贴 Spotify 的单曲、专辑、歌单或播客分享链接。" : "粘贴链接点「打开」，在右栏浏览器中用 Spotify 网页版播放。首次使用请点「打开首页」登录账号，之后即可完整播放。")
      );

      const pickEbook = React.useCallback(() => {
        const bridge = window.webkit?.messageHandlers?.dshEbookPicker;
        if (!bridge) {
          setEbookError("文件选择器需要重启 App 后可用；你也可以在下方输入文件或文件夹路径导入。");
          return;
        }
        try { bridge.postMessage({ action: "pick" }); }
        catch { setEbookError("无法打开文件选择器。"); }
      }, []);

      const addEbooks = React.useCallback((paths) => {
        const files = [];
        const dirs = [];
        for (const raw of paths) {
          const path = String(raw || "").trim();
          if (!path) continue;
          if (ebookExt(path)) files.push(path);
          else dirs.push(path);
        }
        const merge = (list) => setEbookLibrary((items) => {
          const seen = new Set(items.map((item) => item.path));
          return [...items, ...list.filter((path) => !seen.has(path)).map((path) => ({ path, name: ebookName(path), ext: ebookExt(path) }))];
        });
        if (files.length) merge(files);
        for (const dir of dirs) {
          ebookRequest("/dsh-right-sidebar/ebook/scan", { dir })
            .then((value) => merge(value.files || []))
            .catch((error) => setEbookError(error.message || String(error)));
        }
      }, []);

      const submitEbookPath = React.useCallback(() => {
        const value = ebookInput.trim();
        if (!value) return;
        setEbookInput("");
        addEbooks([value]);
      }, [ebookInput, addEbooks]);

      React.useEffect(() => {
        const onPicked = (event) => {
          const paths = event.detail?.paths;
          if (Array.isArray(paths) && paths.length) addEbooks(paths);
        };
        window.addEventListener("dsh-ebook-picked", onPicked);
        return () => window.removeEventListener("dsh-ebook-picked", onPicked);
      }, [addEbooks]);

      const loadChapter = React.useCallback(async (path, href) => {
        try {
          const value = await ebookRequest("/dsh-right-sidebar/ebook/chapter", { path, href });
          setEbookHtml(value.html || "");
        } catch (error) {
          setEbookError(error.message || String(error));
        }
      }, []);

      const openEbook = React.useCallback(async (path) => {
        const ext = ebookExt(path);
        if (!ext) return;
        setEbookOpen(path);
        setEbookError("");
        setEbookShowChapters(false);
        if (ext === "pdf") {
          setEbookMeta(null);
          setEbookHtml("");
          return;
        }
        setEbookLoading(true);
        try {
          const value = await ebookRequest("/dsh-right-sidebar/ebook/meta", { path });
          const chapters = Array.isArray(value.chapters) ? value.chapters : [];
          setEbookMeta({ title: value.title || ebookName(path), author: value.author || "", chapters });
          const saved = Number(readPreference(`dsh-right-sidebar:ebook-chapter:${path}`, "0"));
          const index = chapters.length ? Math.min(Math.max(0, saved), chapters.length - 1) : 0;
          setEbookChapterIndex(index);
          if (chapters.length) await loadChapter(path, chapters[index].href);
          else setEbookHtml("");
        } catch (error) {
          setEbookError(error.message || String(error));
          setEbookMeta(null);
        } finally {
          setEbookLoading(false);
        }
      }, [loadChapter]);

      const gotoChapter = React.useCallback((index) => {
        if (!ebookMeta || !ebookMeta.chapters.length || !ebookOpen) return;
        const next = Math.min(Math.max(0, index), ebookMeta.chapters.length - 1);
        setEbookChapterIndex(next);
        writePreference(`dsh-right-sidebar:ebook-chapter:${ebookOpen}`, String(next));
        loadChapter(ebookOpen, ebookMeta.chapters[next].href);
      }, [ebookMeta, ebookOpen, loadChapter]);

      const closeEbook = React.useCallback(() => {
        setEbookOpen("");
        setEbookMeta(null);
        setEbookHtml("");
        setEbookError("");
        setEbookShowChapters(false);
      }, []);

      const removeEbook = React.useCallback((path) => {
        setEbookLibrary((items) => items.filter((item) => item.path !== path));
        if (ebookOpen === path) closeEbook();
      }, [ebookOpen, closeEbook]);

      const changeFontScale = React.useCallback((delta) => {
        setEbookFontScale((scale) => {
          const next = Math.min(1.8, Math.max(0.7, Math.round((scale + delta) * 100) / 100));
          writePreference("dsh-right-sidebar:ebook-scale", String(next));
          return next;
        });
      }, []);

      React.useEffect(() => {
        writePreference("dsh-right-sidebar:ebooks", JSON.stringify(ebookLibrary));
      }, [ebookLibrary]);

      React.useEffect(() => {
        writePreference("dsh-right-sidebar:ebook-open", ebookOpen);
      }, [ebookOpen]);

      React.useEffect(() => {
        writePreference("dsh-right-sidebar:ebook-eye", ebookEyeMode ? "1" : "0");
      }, [ebookEyeMode]);

      const isEbookPdf = ebookExt(ebookOpen) === "pdf";
      const shelfBody = h("div", { className: "_eb_shelf" },
        h("button", { className: "_mp_pick", onClick: pickEbook }, icon("book", 15), "导入电子书（EPUB / PDF）"),
        h("div", { className: "_mp_dirRow" },
          h("input", { className: "_mp_input", value: ebookInput, placeholder: "或输入文件 / 文件夹路径，回车导入", spellCheck: false, onChange: (event) => setEbookInput(event.target.value), onKeyDown: (event) => { if (event.key === "Enter") submitEbookPath(); } }),
          h("button", { className: "_mp_btn", onClick: submitEbookPath }, "添加")
        ),
        ebookError ? h("div", { className: "_mp_status" }, ebookError) : null,
        h("div", { className: "_mp_plHead" }, h("span", { className: "_mp_plLabel" }, `书架 · ${ebookLibrary.length}`)),
        ebookLibrary.length === 0 ? h("div", { className: "_mp_status" }, "还没有电子书。点击上方按钮选择 EPUB / PDF 文件，或选择一个文件夹批量导入。") : null,
        h("div", { className: "_mp_list" }, ebookLibrary.map((item) => h("div", {
          key: item.path, className: "_mp_file", role: "button", tabIndex: 0,
          onClick: () => openEbook(item.path),
          onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openEbook(item.path); } }
        },
          h("span", { className: "_mp_fileMeta" }, item.ext === "pdf" ? "PDF" : "EPUB"),
          h("div", { className: "_mp_fileText" },
            h("div", { className: "_mp_fileName", title: item.name }, item.name),
            h("div", { className: "_mp_fileSub _rs_path" }, item.path)
          ),
          h("button", { className: "_mp_fileRemove", "aria-label": `移除 ${item.name}`, title: "移除", onClick: (event) => { event.stopPropagation(); removeEbook(item.path); } }, icon("close", 13))
        )))
      );

      const readerBody = h("div", { className: "_eb_reader" },
        h("div", { className: "_eb_toolbar" },
          h("button", { className: "_rs_navBtn", title: "返回书架", onClick: closeEbook }, icon("back", 15)),
          h("div", { className: "_eb_title" }, ebookMeta?.title || ebookName(ebookOpen)),
          isEbookPdf ? null : h("button", { className: "_rs_navBtn", title: "章节目录", onClick: () => setEbookShowChapters((value) => !value) }, icon("list", 15)),
          isEbookPdf ? null : h("button", { className: "_rs_navBtn", "data-active": ebookEyeMode || undefined, title: ebookEyeMode ? "关闭护眼模式" : "护眼模式", onClick: () => setEbookEyeMode((value) => !value) }, icon("eye", 15)),
          isEbookPdf ? null : h("button", { className: "_rs_navBtn", title: "缩小", onClick: () => changeFontScale(-0.15) }, icon("zoom-out", 15)),
          isEbookPdf ? null : h("span", { className: "_eb_scale" }, `${Math.round(ebookFontScale * 100)}%`),
          isEbookPdf ? null : h("button", { className: "_rs_navBtn", title: "放大", onClick: () => changeFontScale(0.15) }, icon("zoom-in", 15)),
          isEbookPdf ? null : h("button", { className: "_rs_navBtn", title: "上一章", disabled: !ebookMeta || ebookChapterIndex <= 0, onClick: () => gotoChapter(ebookChapterIndex - 1) }, icon("up", 15)),
          isEbookPdf ? null : h("button", { className: "_rs_navBtn", title: "下一章", disabled: !ebookMeta || ebookChapterIndex >= ebookMeta.chapters.length - 1, onClick: () => gotoChapter(ebookChapterIndex + 1) }, icon("down", 15))
        ),
        isEbookPdf ? null : ebookShowChapters ? h("div", { className: "_eb_chapters" }, (ebookMeta?.chapters || []).map((chapter, index) => h("button", {
          key: chapter.href, className: "_eb_chapter", "data-active": index === ebookChapterIndex || undefined,
          onClick: () => { gotoChapter(index); setEbookShowChapters(false); }
        }, `${index + 1}. ${chapter.label}`))) : null,
        h("div", { className: "_eb_content", style: { background: ebookEyeMode ? "#f6efdf" : "#fff" } },
          isEbookPdf
            ? h("iframe", { className: "_eb_frame", src: ebookPdfUrl(ebookOpen), title: "PDF 阅读器" })
            : ebookLoading ? h("div", { className: "_rs_status" }, "正在加载…")
            : ebookError ? h("div", { className: "_rs_status" }, ebookError)
            : h("iframe", { key: `${ebookOpen}:${ebookChapterIndex}`, className: "_eb_frame", srcDoc: ebookHtml ? wrapChapter(ebookHtml, ebookEyeMode) : "", style: { zoom: ebookFontScale }, title: "章节内容" })
        )
      );

      const ebookBody = ebookOpen ? readerBody : shelfBody;

      const openDouyinInBrowser = () => {
        chooseTab("browser");
        navigate(douyinSite);
      };
      const douyinBody = h("div", { className: "_dy_body" },
        h("div", { className: "_dy_toolbar" },
          h("button", { className: "_dy_btn", title: localeActive === "en" ? "Reload TikTok" : "刷新抖音", onClick: () => postNativeBrowser({ action: "reload" }) }, icon("reload", 14), localeActive === "en" ? "Reload" : "刷新"),
          h("button", { className: "_dy_btn", title: localeActive === "en" ? "Open TikTok in the sidebar browser" : "在右栏浏览器打开抖音网页版", onClick: openDouyinInBrowser }, icon("external", 14), localeActive === "en" ? "Open in browser" : "浏览器打开")
        ),
        h("div", { className: "_dy_phone" },
          h("div", { className: "_dy_notch" }),
          h("div", { ref: douyinFrameRef, className: "_dy_screen" }),
          h("div", { className: "_dy_homeBar" })
        ),
        h("div", { className: "_dy_status" },
          localeActive === "en"
            ? "The phone frame shows the TikTok web player (sign in on first use). Auto-play depends on TikTok's own web limits; if you want full screen or have trouble signing in, tap \"Open in browser\" above to visit it in the sidebar browser."
            : "手机界面内是抖音网页版（首次需登录账号）。视频能否自动播放取决于抖音网页自身的限制；若想全屏或登录不顺，点上方「浏览器打开」在右栏浏览器中访问。"
        )
      );

      const mediaBody = h("div", { className: "_mp_body" },
        h("button", { className: "_mp_pick", onClick: pickMedia }, icon("music", 15), "选择音频或视频文件"),
        h("div", { className: "_mp_dirRow" },
          h("input", { className: "_mp_input", value: mediaInput, placeholder: "或输入文件完整路径，回车添加", spellCheck: false, onChange: (event) => setMediaInput(event.target.value), onKeyDown: (event) => { if (event.key === "Enter") submitMediaPath(); } }),
          h("button", { className: "_mp_btn", onClick: submitMediaPath }, "添加")
        ),
        mediaHint ? h("div", { className: "_mp_status" }, mediaHint) : null,
        mediaPath && isMediaVideo ? h("video", { ref: videoRef, key: mediaPath, className: "_mp_video", src: mediaStreamUrl(mediaPath), controls: true, onPlay: () => setMediaPlaying(true), onPause: () => setMediaPlaying(false), onTimeUpdate: (event) => setMediaTime(event.currentTarget.currentTime), onLoadedMetadata: (event) => setMediaDuration(event.currentTarget.duration), onEnded: handleMediaEnded }) : null,
        h("div", { className: "_mp_plHead" },
          h("span", { className: "_mp_plLabel" }, `播放列表 · ${mediaPlaylist.length}`),
          h("div", { className: "_mp_plActions" },
            mediaPlaylist.length ? h("button", { className: "_mp_clear", title: "导出为 M3U 播放列表", onClick: exportPlaylist }, "导出") : null,
            mediaPlaylist.length ? h("button", { className: "_mp_clear", onClick: clearMediaList }, "清空") : null
          )
        ),
        mediaPlaylist.length === 0 ? h("div", { className: "_mp_status" }, "还没有添加文件，点击上方按钮或输入路径选择要播放的 MP3 / MP4。") : null,
        h("div", { className: "_mp_list" }, mediaPlaylist.map((item, index) => h("div", {
          key: item.path, className: "_mp_file", role: "button", tabIndex: 0, "data-active": item.path === mediaPath || undefined,
          onClick: () => playMedia(item.path),
          onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); playMedia(item.path); } }
        },
          h("span", { className: "_mp_fileMeta" }, item.path.toLowerCase().endsWith(".mp4") ? "视频" : "音频"),
          h("div", { className: "_mp_fileText" },
            h("div", { className: "_mp_fileName", title: item.title || item.name }, item.title || item.name),
            (item.artist || item.album) ? h("div", { className: "_mp_fileSub" }, [item.artist, item.album].filter(Boolean).join(" · ")) : null
          ),
          h("button", { className: "_mp_fileRemove", "aria-label": `上移 ${item.name}`, title: "上移", onClick: (event) => { event.stopPropagation(); moveMediaItem(index, -1); } }, icon("up", 13)),
          h("button", { className: "_mp_fileRemove", "aria-label": `下移 ${item.name}`, title: "下移", onClick: (event) => { event.stopPropagation(); moveMediaItem(index, 1); } }, icon("down", 13)),
          h("button", { className: "_mp_fileRemove", "aria-label": `移除 ${item.name}`, title: "移除", onClick: (event) => { event.stopPropagation(); removeMediaPath(item.path); } }, icon("close", 13))
        ))),
        spotifySection
      );

      if (!open) return h("button", { className: "_rs_toggle", "aria-label": "打开多功能右边栏", title: "打开右边栏 · ⇧⌘F", onClick: toggle }, icon("panel", 17), h("span", { className: "_rs_hint" }, "搜索、浏览器与终端"));

      return h("aside", { className: "_rs_panel", style: { width: `${Math.max(296, panelWidth - 4)}px`, minWidth: "296px" }, "aria-label": "多功能右边栏" },
        h("div", { className: "_rs_resize", role: "separator", "aria-label": "调整右边栏宽度", "aria-orientation": "vertical", "data-dragging": resizing || undefined, title: "左右拖动调整宽度", onPointerDown: beginResize }),
        h("div", { className: "_rs_header" }, h("div", { className: "_rs_title" }, "辅助栏"), h("button", { className: "_rs_iconBtn", "aria-label": "关闭多功能右边栏", title: "关闭右边栏 · ⇧⌘F", onClick: toggle }, icon("close", 16))),
        h("div", { className: "_rs_tabs", role: "tablist" },
          SIDEBAR_TABS.filter((entry) => visibleTabIds.includes(entry.id)).map((entry) => h("button", { key: entry.id, role: "tab", className: "_rs_tab", "data-active": tab === entry.id || undefined, "aria-selected": tab === entry.id, onClick: () => chooseTab(entry.id) }, localeActive === "en" ? entry.en : entry.zh))
        ),
        h("div", { className: "_rs_body", "data-full": tab === "browser" || tab === "terminal" || tab === "ebook" || tab === "douyin" || undefined }, tab === "search" ? searchBody : tab === "files" ? filesBody : tab === "overview" ? overviewBody : tab === "browser" ? browserBody : tab === "terminal" ? terminalBody : tab === "ebook" ? ebookBody : tab === "douyin" ? douyinBody : mediaBody),
        h("div", { className: "_np_footer", "data-hidden": mediaPath && tab !== "ebook" ? undefined : "" },
          h("canvas", { ref: vizCanvasRef, className: "_np_viz", width: 800, height: 64 }),
          h("audio", { ref: audioRef, style: { display: "none" }, src: !isMediaVideo && mediaPath ? mediaStreamUrl(mediaPath) : undefined, onPlay: () => setMediaPlaying(true), onPause: () => setMediaPlaying(false), onTimeUpdate: (event) => setMediaTime(event.currentTarget.currentTime), onLoadedMetadata: (event) => setMediaDuration(event.currentTarget.duration), onEnded: handleMediaEnded }),
          h("div", { className: "_np_row" },
            h("div", { className: "_np_info" },
              h("div", { className: "_np_title" }, currentMediaItem?.title || currentMediaName || "未播放"),
              currentMediaSub ? h("div", { className: "_np_sub" }, currentMediaSub) : null,
              h("div", { className: "_np_time" }, `${formatTime(mediaTime)} / ${formatTime(mediaDuration)}`)
            ),
            h("div", { className: "_np_controls" },
              h("button", { className: "_np_btn", title: "上一首", onClick: playMediaPrev }, icon("prev", 16)),
              h("button", { className: "_np_btn _np_play", title: mediaPlaying ? "暂停" : "播放", onClick: toggleMedia }, icon(mediaPlaying ? "pause" : "play", 18)),
              h("button", { className: "_np_btn", title: "下一首", onClick: playMediaNext }, icon("next", 16)),
              h("button", { className: "_np_btn", "data-active": playMode !== "order" || undefined, title: modeTitle, onClick: cyclePlayMode }, icon(modeIcon, 16))
            )
          ),
          h("input", { className: "_np_seek", type: "range", min: 0, max: mediaDuration || 0, step: 0.1, value: mediaTime, onChange: (event) => seekMedia(event.target.value), "aria-label": "播放进度" })
        )
      );
    }

    const inject = ["slots", "layout", "sessions", "workspaces", "connection", "locale"];
    function apply(ctx) {
      const useSessions = bindSnapshotSelector(ctx.sessions.list);
      const useLocale = bindSnapshotSelector(ctx.locale);
      const tabsStore = createTabsStore();
      const useTabs = bindSnapshotSelector(tabsStore);
      ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh: settingsZh, en: settingsEn }), "right-sidebar: settings row dictionaries");
      ctx.slots.inject("settings.general.item", () => ctx.slots.register({
        name: "settings.general.item",
        id: "right-sidebar-tabs",
        order: 30,
        locale: SETTINGS_NS,
        inject: () => ({ useTabs, setTabVisible: tabsStore.setVisible })
      }, SidebarTabsRow));
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({
        name: "shell.overlay",
        id: "right-sidebar",
        order: 100,
        inject: () => ({ useSessions, useLocale, useTabs, sessions: ctx.sessions, workspaces: ctx.workspaces, layout: ctx.layout, connection: ctx.connection })
      }, RightSidebar));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
