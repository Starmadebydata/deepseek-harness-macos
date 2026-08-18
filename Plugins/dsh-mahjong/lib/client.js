// 四川麻将·血战到底 — Client 半区（静态客户端模块）
// 真实麻将桌风格 UI：木框绿毡、立体厚牌、竖立牌墙、弃牌分区、中央罗盘。
window.__ModuleLoader__.load({
  id: "dsh-mahjong",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const React = require("react");
    const h = React.createElement;

    const SUITS = ["w", "t", "b"];
    const SUIT_CHAR = { w: "万", t: "筒", b: "条" };
    const RANK_CHAR = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const suitOf = (t) => t[t.length - 1];
    const rankOf = (t) => Number(t[0]);
    const tileName = (t) => RANK_CHAR[rankOf(t)] + SUIT_CHAR[suitOf(t)];
    const cmp = (a, b) => { const sa = suitOf(a), sb = suitOf(b); if (sa !== sb) return SUITS.indexOf(sa) - SUITS.indexOf(sb); return rankOf(a) - rankOf(b); };
    const sortT = (arr) => (arr || []).slice().sort(cmp);

    const css = `
/* ============ 桌面框架 ============ */
.mj-overlay{position:fixed;inset:0;z-index:1000;background:radial-gradient(ellipse at center,#2b180c 0%,#150b04 80%);color:#f3eeda;font-family:'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;overflow:hidden}
.mj-topbar{position:absolute;top:0;left:0;right:0;height:52px;display:flex;align-items:center;gap:14px;padding:0 18px;background:linear-gradient(180deg,#2b1a0a,#1c0f05);border-bottom:1px solid #553818;z-index:10;box-shadow:0 4px 16px rgba(0,0,0,.5)}
.mj-title{font-size:17px;font-weight:800;letter-spacing:1px;color:#f0d9a8}
.mj-round{font-size:13px;color:#1c0f05;background:#e8c56a;padding:3px 11px;border-radius:12px;font-weight:700}
.mj-chips{display:flex;gap:10px;margin-left:8px;flex-wrap:wrap}
.mj-chip{font-size:12px;background:rgba(255,235,190,.08);border:1px solid rgba(232,197,106,.35);border-radius:10px;padding:2px 9px;color:#f3eeda}
.mj-chip b{color:#ffd968}
.mj-spacer{flex:1}
.mj-btn{border:none;border-radius:9px;padding:8px 16px;font-size:15px;font-weight:600;cursor:pointer;background:rgba(255,255,255,.14);color:#fff;transition:filter .12s}
.mj-btn:hover{filter:brightness(1.15)}
.mj-btn-close{background:rgba(140,72,48,.6)}
.mj-btn-gold{background:linear-gradient(180deg,#f0b429,#c78f0a);color:#3c2a00;font-weight:700;box-shadow:0 3px 8px rgba(0,0,0,.35)}
.mj-btn-blue{background:linear-gradient(180deg,#4a90d9,#2563a8);font-weight:700;box-shadow:0 3px 8px rgba(0,0,0,.35)}
.mj-btn-purple{background:linear-gradient(180deg,#9b59b6,#6c3483);font-weight:700;box-shadow:0 3px 8px rgba(0,0,0,.35)}
.mj-btn-gray{background:rgba(255,255,255,.16)}
.mj-btn-danger{background:linear-gradient(180deg,#e74c3c,#b03a2e);font-weight:700}
.mj-btn:disabled{opacity:.45;cursor:not-allowed}
.mj-msg{position:absolute;top:64px;left:50%;transform:translateX(-50%);background:rgba(20,20,20,.9);color:#ffd;padding:9px 18px;border-radius:10px;font-size:14px;z-index:12;box-shadow:0 4px 14px rgba(0,0,0,.5);white-space:nowrap}
/* ============ 绿毡桌面（木框）============ */
.mj-felt{position:absolute;left:3vw;right:3vw;top:64px;bottom:12px;border-radius:40px;background:radial-gradient(ellipse at center,#31955a 0%,#237647 55%,#175731 100%);border:7px solid #59371a;box-shadow:0 0 0 3px #8a6234,inset 0 2px 24px rgba(0,0,0,.5),inset 0 0 90px rgba(0,0,0,.3),0 14px 44px rgba(0,0,0,.5)}
.mj-felt::before{content:"";position:absolute;inset:14px;border-radius:28px;border:1px dashed rgba(255,255,255,.12);pointer-events:none}
/* ============ 牌（立体厚牌）============ */
.mj-tile{position:relative;flex:none;border-radius:9px;width:52px;height:72px}
.mj-tile.mj-sm{width:34px;height:47px;border-radius:6px}
.mj-tile.mj-md{width:42px;height:58px;border-radius:7px}
.mj-tile.mj-lg{width:60px;height:84px;border-radius:11px}
.mj-face{background:linear-gradient(180deg,#fffef8 0%,#f7f0dc 55%,#e6dab8 100%);border:1.5px solid #a9986c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;box-shadow:inset 0 1px 0 #ffffff,inset 0 -5px 0 #d5c69c,inset 0 -7px 3px rgba(120,100,60,.28),0 3px 6px rgba(0,0,0,.45);transition:transform .12s ease,box-shadow .12s ease}
.mj-face:hover{transform:translateY(-7px);box-shadow:inset 0 1px 0 #ffffff,inset 0 -5px 0 #d5c69c,0 10px 16px rgba(0,0,0,.55);z-index:3}
.mj-face.mj-disabled{cursor:default;opacity:.95}
.mj-face.mj-disabled:hover{transform:none;box-shadow:inset 0 1px 0 #ffffff,inset 0 -5px 0 #d5c69c,inset 0 -7px 3px rgba(120,100,60,.28),0 3px 6px rgba(0,0,0,.45)}
.mj-rank{font-size:27px;font-weight:900;line-height:1;-webkit-text-stroke:0.6px currentColor}
.mj-suit{font-size:15px;font-weight:900;line-height:1;-webkit-text-stroke:0.4px currentColor}
.mj-tile.mj-sm .mj-rank{font-size:18px}
.mj-tile.mj-sm .mj-suit{font-size:11px}
.mj-tile.mj-md .mj-rank{font-size:21px}
.mj-tile.mj-md .mj-suit{font-size:12px}
.mj-tile.mj-lg .mj-rank{font-size:33px}
.mj-tile.mj-lg .mj-suit{font-size:18px}
.mj-sw .mj-rank,.mj-sw .mj-suit{color:#8f1407}
.mj-st .mj-rank,.mj-st .mj-suit{color:#0d3a70}
.mj-sb .mj-rank,.mj-sb .mj-suit{color:#09601f}
/* 花色角标圆点（仅万字牌显示） */
.mj-face::after{content:"";position:absolute;top:4px;right:5px;width:9px;height:9px;border-radius:50%;box-shadow:inset 0 -1px 1px rgba(0,0,0,.3),0 1px 1px rgba(255,255,255,.5)}
.mj-tile.mj-sm.mj-face::after{width:6px;height:6px;top:3px;right:3px}
.mj-sw.mj-face::after{background:#e74c3c}
/* 图案牌（筒/条）不显示角标 */
.mj-pat.mj-face::after{display:none}
/* 筒：经典圆点阵（同心圆环，中心可红） */
.mj-dot{position:absolute;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,#2e86de 0 24%,#ffffff 25% 42%,#2e86de 43% 80%,#1d5f9e 81% 100%);box-shadow:0 1px 2px rgba(0,0,0,.3)}
.mj-dot-red{background:radial-gradient(circle,#d92410 0 24%,#ffffff 25% 42%,#2e86de 43% 80%,#1d5f9e 81% 100%)}
/* 条：经典竹节（竖竹条带竹节纹） */
.mj-stick{position:absolute;transform:translate(-50%,-50%);width:13%;border-radius:3px;background:linear-gradient(90deg,#3cb67a 0%,#1d7a49 55%,#146138 100%);box-shadow:inset 0 0 2px rgba(0,0,0,.4),0 1px 1px rgba(0,0,0,.2)}
.mj-stick::after{content:"";position:absolute;left:-1px;right:-1px;top:46%;height:2px;background:rgba(255,255,255,.55);box-shadow:0 1px 1px rgba(0,0,0,.25)}
/* 牌背（翡翠） */
.mj-back{background:linear-gradient(180deg,#30825a 0%,#215c3c 55%,#174029 100%);border:1.5px solid #d0ac55;box-shadow:inset 0 1px 0 rgba(255,255,255,.32),inset 0 -5px 0 #0f2f1e,inset 0 -7px 3px rgba(0,0,0,.3),0 3px 6px rgba(0,0,0,.5)}
.mj-back::before{content:"";position:absolute;inset:6px 5px 10px;border-radius:5px;background:repeating-linear-gradient(45deg,rgba(255,255,255,.1) 0 2px,transparent 2px 5px)}
.mj-tile.mj-sm.mj-back::before{inset:4px 3px 8px}
/* 竖立牌墙（左右两家侧面） */
.mj-slabs{display:flex;flex-direction:column;align-items:center}
.mj-slab{width:46px;height:14px;margin-top:-2px;border-radius:4px;background:linear-gradient(180deg,#30825a 0%,#215c3c 60%,#174029 100%);border:1px solid #d0ac55;border-bottom:2px solid #0f2f1e;box-shadow:0 2px 3px rgba(0,0,0,.4)}
/* 刚摸的牌 */
.mj-justdrawn{animation:mjGlow 1.2s ease-in-out infinite}
@keyframes mjGlow{0%,100%{box-shadow:inset 0 1px 0 #fff,inset 0 -5px 0 #d5c69c,0 3px 6px rgba(0,0,0,.45)}50%{box-shadow:inset 0 1px 0 #fff,inset 0 -5px 0 #d5c69c,0 0 16px 4px rgba(255,215,90,.9)}}
.mj-drawn-gap{margin-left:12px}
/* ============ 座位 ============ */
.mj-seat{position:absolute;display:flex;flex-direction:column;align-items:center;gap:8px;z-index:3}
.mj-seat-bottom{left:50%;bottom:16px;transform:translateX(-50%)}
.mj-seat-top{left:50%;top:12px;transform:translateX(-50%)}
.mj-seat-left{left:22px;top:50%;transform:translateY(-50%)}
.mj-seat-right{right:22px;top:50%;transform:translateY(-50%)}
.mj-seat-label{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;background:rgba(0,0,0,.4);padding:4px 13px;border-radius:14px;border:1px solid rgba(208,172,85,.45);color:#f3eeda;white-space:nowrap}
.mj-seat-label.mj-active{border-color:#ffd968;box-shadow:0 0 14px rgba(255,217,104,.75);color:#ffe9a8}
.mj-tag{font-size:12px;font-weight:600;background:rgba(0,0,0,.38);border-radius:8px;padding:2px 9px}
.mj-tag-dique{color:#9fd8ff}
.mj-tag-hu{color:#ffd968;background:rgba(160,120,0,.4)}
.mj-tag-ting{color:#7fe08a}
.mj-score{color:#ffd968}
/* 手牌 */
.mj-hand{display:flex;align-items:flex-end;max-width:94vw}
.mj-hand .mj-tile{margin-right:-9px}
.mj-hand .mj-tile:last-child{margin-right:0}
.mj-hand.mj-myturn{animation:mjMyTurn 1.6s ease-in-out infinite}
@keyframes mjMyTurn{0%,100%{filter:drop-shadow(0 0 0 rgba(255,217,104,0))}50%{filter:drop-shadow(0 0 10px rgba(255,217,104,.85))}}
.mj-handrow{display:flex;align-items:flex-end;gap:14px}
/* 明刻 */
.mj-melds{display:flex;gap:8px;align-items:flex-end}
.mj-meld{display:flex;align-items:center;gap:2px;background:rgba(0,0,0,.28);padding:3px 5px;border-radius:7px;border:1px solid rgba(208,172,85,.3)}
.mj-meld-kind{font-size:10px;background:rgba(208,172,85,.85);color:#241408;padding:1px 5px;border-radius:5px;white-space:nowrap;font-weight:700}
/* 手牌分析条 */
.mj-analysis{font-size:12px;color:#ffe9a8;background:rgba(0,0,0,.42);padding:3px 13px;border-radius:9px;border:1px solid rgba(208,172,85,.4);white-space:nowrap}
.mj-analysis-dim{color:#cfe8d6;opacity:.85}
/* 弃牌区（四家分区，真实摆放感） */
.mj-dz{position:absolute;display:flex;flex-wrap:wrap;gap:3px;z-index:2}
.mj-dz-top{left:50%;top:128px;transform:translateX(-50%);max-width:310px;justify-content:center}
.mj-dz-bottom{left:50%;bottom:172px;transform:translateX(-50%);max-width:330px;justify-content:center}
.mj-dz-left{left:96px;top:50%;transform:translateY(-50%);width:132px;justify-content:center}
.mj-dz-right{right:96px;top:50%;transform:translateY(-50%);width:132px;justify-content:center}
.mj-dz .mj-tile{transform:rotate(var(--tilt,0deg))}
/* ============ 中央罗盘 ============ */
.mj-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2;pointer-events:none}
.mj-compass{width:128px;height:128px;border-radius:50%;background:radial-gradient(circle,#114328 0%,#0a2c19 72%);border:3px solid #d0ac55;box-shadow:0 5px 16px rgba(0,0,0,.55),inset 0 2px 10px rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.mj-compass-wall{font-size:22px;font-weight:800;color:#ffd968;line-height:1}
.mj-compass-sub{font-size:11px;color:#cfe8d6;opacity:.9}
.mj-lasttile-box{display:flex;flex-direction:column;align-items:center;gap:4px}
.mj-lasttile-label{font-size:11px;color:#cfe8d6;opacity:.85}
.mj-last-pop{animation:mjPop .32s ease-out}
@keyframes mjPop{from{transform:scale(.5) rotate(-10deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.mj-thinking{font-size:13px;color:#ffe9a8;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.mj-ticker{width:300px;max-height:120px;overflow:hidden;font-size:12px;color:#d5ead9;text-align:center;line-height:1.7;text-shadow:0 1px 2px rgba(0,0,0,.4)}
/* ============ 操作条 / 面板 ============ */
.mj-actions{position:absolute;left:50%;bottom:246px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;z-index:8;background:rgba(20,12,5,.72);padding:9px 16px;border-radius:14px;border:1px solid rgba(208,172,85,.5);box-shadow:0 6px 18px rgba(0,0,0,.45)}
.mj-btn-hint{font-size:14px;color:#ffe9a8;font-weight:600}
.mj-msg-inline{font-size:11px;color:#ffd;opacity:.9}
.mj-panel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:linear-gradient(180deg,#2b1a0c,#1c1006);border:2px solid #8a6234;border-radius:16px;padding:24px 30px;z-index:20;min-width:360px;box-shadow:0 24px 60px rgba(0,0,0,.65)}
.mj-panel h3{margin:0 0 14px;text-align:center;color:#f0d9a8}
.mj-result-row{display:flex;justify-content:space-between;gap:24px;font-size:14px;padding:5px 0;border-bottom:1px dashed rgba(208,172,85,.25)}
.mj-result-actions{display:flex;gap:12px;justify-content:center;margin-top:16px}
.mj-idle{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:18px;z-index:8}
.mj-idle h2{margin:0;letter-spacing:6px;color:#f0d9a8;text-shadow:0 3px 10px rgba(0,0,0,.6)}
.mj-launcher{display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);border-radius:8px;padding:3px 9px;cursor:pointer;font-size:13px;color:#f3eeda;font-weight:600;font-family:inherit;white-space:nowrap}
.mj-launcher:hover{background:rgba(255,255,255,.22)}
.mj-launcher-emoji{font-size:16px;line-height:1}
`;
    const styleId = "dsh-mahjong/styles";
    if (typeof document !== "undefined" && !document.querySelector(`style[data-plugin-css="${styleId}"]`)) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-mahjong";
      tag.dataset.pluginCss = styleId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    async function rpc(action, args) {
      try {
        const response = await fetch("/dsh-mahjong/rpc", {
          method: "POST",
          headers: { "content-type": "application/json", "x-dsh-mahjong": "1" },
          body: JSON.stringify(Object.assign({ action }, args || {})),
        });
        return await response.json();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("dsh-mahjong rpc fail", action, String(e));
        return null;
      }
    }

    // ---------- 组件 ----------
    // 筒（圆点阵）与 条（竹节）的标准排布：位置为牌面百分比
    const DOT_POS = {
      1: [[50, 50]],
      2: [[32, 32], [68, 68]],
      3: [[28, 28], [50, 50], [72, 72]],
      4: [[32, 30], [68, 30], [32, 70], [68, 70]],
      5: [[30, 28], [70, 28], [50, 50], [30, 72], [70, 72]],
      6: [[32, 22], [68, 22], [32, 50], [68, 50], [32, 78], [68, 78]],
      7: [[30, 22], [50, 22], [70, 22], [50, 50], [30, 78], [50, 78], [70, 78]],
      8: [[32, 16], [68, 16], [32, 38], [68, 38], [32, 62], [68, 62], [32, 84], [68, 84]],
      9: [[30, 24], [50, 24], [70, 24], [30, 50], [50, 50], [70, 50], [30, 76], [50, 76], [70, 76]],
    };
    const STICK_POS = {
      1: [[50, 50, 56]],
      2: [[36, 50, 52], [64, 50, 52]],
      3: [[28, 50, 52], [50, 50, 52], [72, 50, 52]],
      4: [[36, 30, 24], [64, 30, 24], [36, 70, 24], [64, 70, 24]],
      5: [[28, 28, 24], [72, 28, 24], [50, 50, 24], [28, 72, 24], [72, 72, 24]],
      6: [[28, 30, 24], [50, 30, 24], [72, 30, 24], [28, 70, 24], [50, 70, 24], [72, 70, 24]],
      7: [[50, 18, 22], [28, 45, 22], [50, 45, 22], [72, 45, 22], [28, 75, 22], [50, 75, 22], [72, 75, 22]],
      8: [[36, 16, 20], [64, 16, 20], [36, 38, 20], [64, 38, 20], [36, 62, 20], [64, 62, 20], [36, 84, 20], [64, 84, 20]],
      9: [[28, 24, 20], [50, 24, 20], [72, 24, 20], [28, 50, 20], [50, 50, 20], [72, 50, 20], [28, 76, 20], [50, 76, 20], [72, 76, 20]],
    };
    function renderDots(n) {
      const pos = DOT_POS[n] || [];
      const size = n === 1 ? 34 : 20;
      // 中心点（1、5 的中心）用红心
      const centerIdx = n === 1 ? 0 : n === 5 ? 2 : -1;
      return pos.map((p, i) =>
        h("div", { key: i, className: "mj-dot" + (i === centerIdx ? " mj-dot-red" : ""), style: { left: p[0] + "%", top: p[1] + "%", width: size + "%", height: size + "%" } })
      );
    }
    function renderSticks(n) {
      const pos = STICK_POS[n] || [];
      return pos.map((p, i) =>
        h("div", { key: i, className: "mj-stick", style: { left: p[0] + "%", top: p[1] + "%", height: p[2] + "%" } })
      );
    }
    function TileView(props) {
      const t = props.t;
      const back = props.back;
      const suit = back ? null : suitOf(t);
      const pattern = !back && suit !== "w";
      const cls = "mj-tile" + (back ? " mj-back" : " mj-face mj-s" + suit) + (pattern ? " mj-pat" : "") + (props.small ? " mj-sm" : "") + (props.md ? " mj-md" : "") + (props.lg ? " mj-lg" : "") + (props.extra ? " " + props.extra : "") + (props.onClick ? "" : " mj-disabled");
      const title = back ? "暗牌" : tileName(t);
      const style = props.tilt ? { "--tilt": props.tilt } : undefined;
      if (back) return h("div", { className: cls, title, style });
      if (suit === "w") {
        return h("div", { className: cls, onClick: props.onClick, title, style },
          h("span", { className: "mj-rank" }, RANK_CHAR[rankOf(t)]),
          h("span", { className: "mj-suit" }, SUIT_CHAR[suit])
        );
      }
      return h("div", { className: cls, onClick: props.onClick, title, style },
        suit === "t" ? renderDots(rankOf(t)) : renderSticks(rankOf(t))
      );
    }
    // 弃牌区（带轻微倾角，真实摆放感）
    function discardZone(p, pos) {
      if (!p.discards || !p.discards.length) return null;
      const tiles = p.discards.map((t, i) => {
        const tilt = (((i * 7 + p.seat * 3) % 5) - 2) + "deg";
        return h(TileView, { key: i, t: t, small: true, tilt });
      });
      return h("div", { className: "mj-dz mj-dz-" + pos }, tiles);
    }
    function meldView(p, small) {
      if (!p.melds || !p.melds.length) return null;
      return h("div", { className: "mj-melds" }, p.melds.map((m, i) =>
        h("div", { className: "mj-meld", key: i },
          h("span", { className: "mj-meld-kind" }, m.kind === "angang" ? "暗杠" : m.kind === "gang" ? "杠" : "碰"),
          m.tiles.map((t, j) => h(TileView, { key: j, t: t, small: small !== false, md: small === false }))
        )
      ));
    }
    function seatLabel(p, isActive, extraTag) {
      const tags = [];
      if (p.dique) tags.push(h("span", { className: "mj-tag mj-tag-dique", key: "d" }, "缺" + SUIT_CHAR[p.dique]));
      if (p.hu) tags.push(h("span", { className: "mj-tag mj-tag-hu", key: "h" }, "胡 " + tileName(p.hu.tile) + " " + p.hu.fan + "番"));
      if (extraTag) tags.push(extraTag);
      return h("div", { className: "mj-seat-label" + (isActive ? " mj-active" : "") },
        h("span", null, p.name),
        h("span", { className: "mj-score" }, p.score + "分"),
        tags
      );
    }
    // 顶部机器人：横向牌背
    function BotSeatTop(p, isActive) {
      const backs = [];
      for (let i = 0; i < p.handCount; i++) backs.push(h(TileView, { key: i, back: true, md: true }));
      return h("div", { className: "mj-seat mj-seat-top" },
        seatLabel(p, isActive),
        h("div", { style: { display: "flex", alignItems: "flex-end" } }, backs),
        meldView(p, false)
      );
    }
    // 左右机器人：竖立牌墙
    function BotSeatSide(p, pos, isActive) {
      const slabs = [];
      for (let i = 0; i < p.handCount; i++) slabs.push(h("div", { className: "mj-slab", key: i }));
      return h("div", { className: "mj-seat mj-seat-" + pos },
        seatLabel(p, isActive),
        h("div", { className: "mj-slabs" }, slabs),
        meldView(p, true)
      );
    }
    // 手牌：摸的牌分离到右侧（真实麻将手感）
    function splitHand(hand, drawnTile, canSeparate) {
      const sorted = sortT(hand);
      if (!canSeparate || !drawnTile) return { rest: sorted, drawn: null };
      const idx = sorted.lastIndexOf(drawnTile);
      if (idx < 0) return { rest: sorted, drawn: null };
      return { rest: sorted.slice(0, idx).concat(sorted.slice(idx + 1)), drawn: drawnTile };
    }
    // 手牌分析条：告诉玩家当前手牌状态（为什么没胡/怎么听牌）
    function analysisRow(snap) {
      const a = snap.analysis;
      if (!a) return null;
      let text = null;
      if (a.state === "dique-left") text = "缺门未打完：需先打出 " + a.tiles.map(tileName).join(" ");
      else if (a.state === "suggest") text = "未胡牌。" + a.sugg.slice(0, 3).map(s2 => "打 " + tileName(s2.discard) + " 可听 " + s2.ting.map(tileName).join("/")).join("；");
      else if (a.state === "noting") text = "未听牌";
      if (!text) return null;
      return h("div", { className: "mj-analysis" + (a.state === "noting" ? " mj-analysis-dim" : "") }, text);
    }
    function humanSeat(me, snap, canDiscard, isActive, onTile) {
      const tingTag = !me.hu && snap.hints && snap.hints.state === "ting"
        ? h("span", { className: "mj-tag mj-tag-ting", key: "t" }, "听牌: " + snap.hints.tiles.map(tileName).join(" "))
        : null;
      const parts = splitHand(me.hand, me.drawnTile, snap.turn === 0 && !me.hu && snap.phase === "playing");
      const handTiles = parts.rest.map((t, i) =>
        h(TileView, {
          key: "h" + i, t: t, lg: true,
          onClick: canDiscard ? (() => onTile(t)) : null,
        })
      );
      if (parts.drawn) {
        handTiles.push(h(TileView, {
          key: "drawn", t: parts.drawn, lg: true,
          onClick: canDiscard ? (() => onTile(parts.drawn)) : null,
          extra: " mj-justdrawn mj-drawn-gap",
        }));
      }
      return h("div", { className: "mj-seat mj-seat-bottom" },
        seatLabel(me, isActive, tingTag),
        analysisRow(snap),
        h("div", { className: "mj-handrow" },
          h("div", { className: "mj-hand" + (canDiscard ? " mj-myturn" : "") }, handTiles),
          meldView(me, false)
        )
      );
    }
    function actionBar(snap, humanClaim, humanDique, humanDraw, handlers) {
      if (humanDique) {
        return h("div", { className: "mj-actions" },
          h("span", { className: "mj-btn-hint" }, "请定缺（缺一门）:"),
          SUITS.map(s => h("button", { key: s, className: "mj-btn mj-btn-blue", onClick: () => handlers.dique(s) }, "缺" + SUIT_CHAR[s]))
        );
      }
      if (humanClaim) {
        const kinds = humanClaim.kinds;
        const btns = [];
        if (kinds.indexOf("hu") >= 0) btns.push(h("button", { key: "hu", className: "mj-btn mj-btn-gold", onClick: () => handlers.claim("hu") }, "胡"));
        if (kinds.indexOf("gang") >= 0) btns.push(h("button", { key: "gang", className: "mj-btn mj-btn-purple", onClick: () => handlers.claim("gang") }, "杠"));
        if (kinds.indexOf("peng") >= 0) btns.push(h("button", { key: "peng", className: "mj-btn mj-btn-blue", onClick: () => handlers.claim("peng") }, "碰"));
        btns.push(h("button", { key: "pass", className: "mj-btn mj-btn-gray", onClick: () => handlers.claim("pass") }, "过"));
        return h("div", { className: "mj-actions" },
          h("span", { className: "mj-btn-hint" }, "别人打出 " + tileName(snap.pending.tile) + ":"),
          btns
        );
      }
      if (humanDraw) {
        const btns = [];
        if (humanDraw.indexOf("hu") >= 0) btns.push(h("button", { key: "hu", className: "mj-btn mj-btn-gold", onClick: () => handlers.claim("hu") }, "自摸胡"));
        if (humanDraw.indexOf("angang") >= 0) btns.push(h("button", { key: "angang", className: "mj-btn mj-btn-purple", onClick: () => handlers.claim("angang") }, "暗杠"));
        if (humanDraw.indexOf("bugang") >= 0) btns.push(h("button", { key: "bugang", className: "mj-btn mj-btn-purple", onClick: () => handlers.claim("bugang") }, "补杠"));
        btns.push(h("button", { key: "pass", className: "mj-btn mj-btn-gray", onClick: () => handlers.claim("pass") }, "过"));
        return h("div", { className: "mj-actions" },
          h("span", { className: "mj-btn-hint" }, "摸牌后请出牌:"),
          btns
        );
      }
      return null;
    }
    function evText(ev, players) {
      const who = ev.seat >= 0 && players[ev.seat] ? players[ev.seat].name + " " : "";
      return who + (ev.detail || "");
    }

    function MahjongApp(props) {
      const store = props.store;
      const timer = props.timer;
      const [open, setLocal] = React.useState(store.open);
      const [snap, setSnap] = React.useState(null);
      const [msg, setMsg] = React.useState("");
      const [armQuit, setArmQuit] = React.useState(false);
      const armQuitRef = React.useRef(null);
      React.useEffect(() => () => { if (armQuitRef.current) clearTimeout(armQuitRef.current); }, []);
      const onQuitClick = () => {
        if (armQuit) {
          rpc("quit", {});
          props.setOpen(false);
          return;
        }
        setArmQuit(true);
        if (armQuitRef.current) clearTimeout(armQuitRef.current);
        armQuitRef.current = setTimeout(() => { setArmQuit(false); armQuitRef.current = null; }, 5000);
      };
      React.useEffect(() => { store.subs.add(setLocal); return () => store.subs.delete(setLocal); }, [store]);
      React.useEffect(() => {
        if (!open) return;
        let dead = false;
        const refresh = async () => { const st = await rpc("state", {}); if (!dead && st) setSnap(st); };
        refresh();
        let iv = null;
        if (timer) iv = timer.interval(refresh, 700);
        return () => { dead = true; if (iv) iv(); };
      }, [open, timer]);
      if (!open) return null;
      if (!snap) return h("div", { className: "mj-overlay" }, h("div", { className: "mj-msg" }, "加载中…"));

      const players = snap.players || [];
      const me = players[0];
      const humanClaim = snap.pending && snap.pending.type === "claim" && snap.pending.claims ? snap.pending.claims.find(c => c.seat === 0) : null;
      const humanDique = snap.pending && snap.pending.type === "dique" && snap.pending.seat === 0;
      const humanDraw = snap.pending && snap.pending.type === "drawOptions" && snap.pending.seat === 0 ? snap.pending.options : null;
      const canDiscard = snap.phase === "playing" && me && !me.hu && snap.turn === 0 && !humanClaim && !humanDique;

      const handlers = {
        async claim(action) {
          const res = await rpc("claim", { decision: action });
          if (res && res.ok === false) { setMsg(res.reason || "操作无效"); return; }
          if (res) setSnap(res);
          setMsg("");
        },
        async dique(suit) {
          const res = await rpc("dique", { suit });
          if (res && res.ok === false) { setMsg(res.reason || "操作无效"); return; }
          if (res) setSnap(res);
          setMsg("");
        },
        async act(tile) {
          const res = await rpc("act", { tile });
          if (res && res.ok === false) { setMsg(res.reason || "操作无效"); return; }
          if (res) setSnap(res);
          setMsg("");
        },
        async start(round) {
          const res = await rpc("start", { round });
          if (res) setSnap(res);
        },
      };

      if (snap.phase === "idle" || !me) {
        return h("div", { className: "mj-overlay" },
          h("div", { className: "mj-topbar" },
            h("span", { className: "mj-title" }, "🀄 四川麻将 · 血战到底"),
            h("span", { className: "mj-spacer" }),
            h("button", { className: "mj-btn mj-btn-close", onClick: () => props.setOpen(false) }, "收起")
          ),
          h("div", { className: "mj-felt" },
            h("div", { className: "mj-idle" },
              h("h2", null, "🀄 四川麻将"),
              h("div", { className: "mj-btn-hint" }, "血战到底 · 你 vs 幺鸡 / 白板 / 发财"),
              h("button", { className: "mj-btn mj-btn-gold", onClick: () => handlers.start(1) }, "开始游戏")
            )
          )
        );
      }

      const thinking = snap.phase === "playing" && snap.turn != null && snap.turn >= 0 && players[snap.turn] && players[snap.turn].type === "bot"
        ? players[snap.turn].name + " 思考中…" : null;
      const lastDiscardTile = snap.lastDiscard && snap.lastDiscard.tile;
      const lastDiscardKey = snap.lastDiscard ? snap.lastDiscard.seat + "-" + snap.lastDiscard.tile + "-" + (snap.events.length ? snap.events[snap.events.length - 1].seq : 0) : "none";

      return h("div", { className: "mj-overlay" },
        h("div", { className: "mj-topbar" },
          h("span", { className: "mj-title" }, "🀄 四川麻将 · 血战到底"),
          h("span", { className: "mj-round" }, "第 " + (snap.round || 1) + " 局"),
          h("div", { className: "mj-chips" }, players.map(p =>
            h("span", { className: "mj-chip", key: p.seat }, p.name + ": ", h("b", null, p.score))
          )),
          h("span", { className: "mj-spacer" }),
          (snap.phase === "dique" || snap.phase === "playing") ? h("button", {
            className: "mj-btn" + (armQuit ? " mj-btn-danger" : " mj-btn-gray"),
            onClick: onQuitClick,
            title: "终止当前牌局并返回对话",
          }, armQuit ? "确认终止？" : "终止游戏") : null,
          h("button", { className: "mj-btn mj-btn-close", onClick: () => props.setOpen(false) }, "收起")
        ),
        msg ? h("div", { className: "mj-msg" }, msg) : null,
        h("div", { className: "mj-felt" },
          // 中央罗盘
          h("div", { className: "mj-center" },
            h("div", { className: "mj-compass" },
              h("div", { className: "mj-compass-wall" }, String(snap.wallCount)),
              h("div", { className: "mj-compass-sub" }, "牌墙"),
              h("div", { className: "mj-compass-sub" }, "庄 " + (players[snap.dealer] ? players[snap.dealer].name : ""))
            ),
            h("div", { className: "mj-lasttile-box" },
              h("div", { className: "mj-lasttile-label" }, "上家打出"),
              lastDiscardTile
                ? h("div", { className: "mj-last-pop", key: lastDiscardKey }, h(TileView, { t: lastDiscardTile, md: true }))
                : h("div", { className: "mj-tile mj-back mj-md" })
            ),
            thinking ? h("div", { className: "mj-thinking" }, thinking) : null,
            h("div", { className: "mj-ticker" }, snap.events.map(ev => h("div", { key: ev.seq }, evText(ev, players))))
          ),
          // 顶部：白板（seat 2）
          BotSeatTop(players[2], snap.turn === 2),
          // 左侧：发财（seat 3，上家）/ 右侧：幺鸡（seat 1，下家）
          BotSeatSide(players[3], "left", snap.turn === 3),
          BotSeatSide(players[1], "right", snap.turn === 1),
          // 弃牌分区
          discardZone(players[2], "top"),
          discardZone(players[3], "left"),
          discardZone(players[1], "right"),
          discardZone(players[0], "bottom"),
          // 你的手牌
          me ? humanSeat(me, snap, canDiscard, snap.turn === 0, handlers.act) : null,
          actionBar(snap, humanClaim, humanDique, humanDraw, handlers),
          snap.phase === "finished" ? h("div", { className: "mj-panel" },
            h("h3", null, "🀄 本局结束"),
            players.map(p => h("div", { className: "mj-result-row", key: p.seat },
              h("span", null, p.name + (p.hu ? "（" + tileName(p.hu.tile) + " " + p.hu.fan + "番" + (p.hu.gangDraw ? " 杠上花" : "") + "）" : (p.huazi ? "（花猪）" : ""))),
              h("b", null, p.score + " 分")
            )),
            h("div", { className: "mj-result-actions" },
              h("button", { className: "mj-btn mj-btn-gold", onClick: () => handlers.start((snap.round || 1) + 1) }, "下一局"),
              h("button", { className: "mj-btn mj-btn-gray", onClick: () => props.setOpen(false) }, "关闭")
            )
          ) : null
        )
      );
    }

    function Launcher(props) {
      return h("button", { className: "mj-launcher", title: "四川麻将 · 血战到底", onClick: () => props.setOpen(true) },
        h("span", { className: "mj-launcher-emoji" }, "🀄"),
        " 麻将"
      );
    }

    const inject = ["slots", "timer"];

    function apply(ctx) {
      const timer = ctx.get("timer");
      const slots = ctx.get("slots");
      if (!slots) return;
      const store = { open: false, subs: new Set() };
      const setOpen = (v) => { store.open = v; store.subs.forEach(f => f(v)); };

      slots.inject("sidebar.footer.action", () => slots.register(
        { name: "sidebar.footer.action", id: "mahjong-launcher", order: 10, label: "麻将" },
        () => h(Launcher, { setOpen })
      ));
      slots.inject("conversation.session.header.actions", () => slots.register(
        { name: "conversation.session.header.actions", id: "mahjong-open", order: 5, label: "麻将" },
        () => h(Launcher, { setOpen })
      ));
      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "mahjong-table" },
        () => h(MahjongApp, { store, timer, setOpen })
      ));
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
