// 四川麻将·血战到底 — Host 半区（静态插件）
// 规则引擎 + 机器人 AI + 回合调度，通过 HTTP 端点向客户端提供 RPC。
// 引擎经 11 项胡牌判定单测 + 300 局全机器人模拟 + 150 局人类路径模拟验证。
export const name = "dsh-mahjong";
export const inject = ["webServer", "timer"];

// ================= 工具 =================
const SUITS = ["w", "t", "b"];
const SUIT_CHAR = { w: "万", t: "筒", b: "条" };
const RANK_CHAR = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const NAMES = ["你", "幺鸡", "白板", "发财"];
const ALL_TILES = [];
for (const s of SUITS) for (let r = 1; r <= 9; r++) for (let c = 0; c < 4; c++) ALL_TILES.push(r + s);
const suitOf = (t) => t[t.length - 1];
const rankOf = (t) => Number(t[0]);
const nameOf = (t) => RANK_CHAR[rankOf(t)] + SUIT_CHAR[suitOf(t)];
const wtName = (w) => w === "qidui" ? "七对" : w === "longqidui" ? "龙七对" : "平胡";
const cmp = (a, b) => { const sa = suitOf(a), sb = suitOf(b); if (sa !== sb) return SUITS.indexOf(sa) - SUITS.indexOf(sb); return rankOf(a) - rankOf(b); };
const sortTiles = (arr) => arr.sort(cmp);
function countTiles(arr) { const m = {}; for (const t of arr) m[t] = (m[t] || 0) + 1; return m; }
function uniq(arr) { const o = {}; for (const x of arr) o[x] = 1; return Object.keys(o); }
function removeOne(arr, tile) { const out = arr.slice(); const i = out.indexOf(tile); if (i >= 0) out.splice(i, 1); return out; }
function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffle(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

let game = null;
let timer = null;

// ================= 胡牌判定 =================
function canFormMelds(counts, pungOnly) {
  const keys = Object.keys(counts).filter(k => counts[k] > 0).sort(cmp);
  if (keys.length === 0) return true;
  const t0 = keys[0];
  if (counts[t0] >= 3) {
    const n = Object.assign({}, counts); n[t0] -= 3; if (n[t0] === 0) delete n[t0];
    if (canFormMelds(n, pungOnly)) return true;
  }
  if (!pungOnly) {
    const r = rankOf(t0);
    if (r <= 7) {
      const t1 = (r + 1) + suitOf(t0), t2 = (r + 2) + suitOf(t0);
      if (counts[t1] > 0 && counts[t2] > 0) {
        const n = Object.assign({}, counts);
        n[t0]--; n[t1]--; n[t2]--;
        for (const k of [t0, t1, t2]) if (n[k] === 0) delete n[k];
        if (canFormMelds(n, pungOnly)) return true;
      }
    }
  }
  return false;
}
function winType(full) {
  if (full.length !== 14) return null;
  const counts = countTiles(full);
  const keys = Object.keys(counts);
  const pairCount = keys.reduce((s, k) => s + Math.floor(counts[k] / 2), 0);
  if (pairCount === 7) {
    let quad = 0, ok = true;
    for (const k of keys) { const c = counts[k]; if (c !== 2 && c !== 4) { ok = false; break; } if (c === 4) quad++; }
    if (ok) return quad > 0 ? "longqidui" : "qidui";
  }
  for (const p of keys) {
    if (counts[p] >= 2) {
      const n = Object.assign({}, counts); n[p] -= 2; if (n[p] === 0) delete n[p];
      if (canFormMelds(n, false)) return "standard";
    }
  }
  return null;
}
function isPengPengConcealed(full) {
  const counts = countTiles(full);
  const keys = Object.keys(counts);
  for (const p of keys) {
    if (counts[p] >= 2) {
      let ok = true;
      for (const k of keys) if ((counts[k] - (k === p ? 2 : 0)) % 3 !== 0) { ok = false; break; }
      if (ok) return true;
    }
  }
  return false;
}
function meldTriples(s) { const out = []; for (const m of s.melds) out.push(m.tiles[0], m.tiles[0], m.tiles[0]); return out; }
function fullHand(seat, extra) { const s = game.seats[seat]; const f = s.hand.slice(); if (extra) f.push(extra); return f.concat(meldTriples(s)); }
function checkHu(seat, opts) {
  const s = game.seats[seat];
  if (s.hu) return null;
  const f = fullHand(seat, opts && opts.extra);
  if (f.length !== 14) return null;
  if (s.dique && s.hand.some(t => suitOf(t) === s.dique)) return null;
  const wt = winType(f);
  if (!wt) return null;
  if ((wt === "qidui" || wt === "longqidui") && s.melds.length > 0) return null;
  const fan = calcFan(seat, wt, f, opts || {});
  return { wt, fan };
}
function calcFan(seat, wt, full, opts) {
  const suits = {};
  for (const t of full) suits[suitOf(t)] = 1;
  const nSuits = Object.keys(suits).length;
  let fan = 1;
  if (wt === "qidui") fan = nSuits === 1 ? 4 : 2;
  else if (wt === "longqidui") fan = 4;
  else {
    if (nSuits === 1) fan += 2;
    if (isPengPengConcealed(full)) fan += 2;
  }
  if (opts.gangDraw) fan += 1;
  if (opts.lastTile) fan += 1;
  return Math.min(fan, 4);
}
function tingTiles(seat) {
  const s = game.seats[seat];
  const base = fullHand(seat, null);
  if (base.length !== 13) return [];
  if (s.dique && s.hand.some(t => suitOf(t) === s.dique)) return [];
  const out = [];
  for (const t of ALL_TILES) {
    const wt = winType(base.concat([t]));
    if (!wt) continue;
    if ((wt === "qidui" || wt === "longqidui") && s.melds.length > 0) continue;
    out.push(t);
  }
  return out;
}

// ================= 机器人 AI =================
function evalBase(base, dique) {
  let score = 0;
  score -= base.filter(t => suitOf(t) === dique).length * 12;
  const bySuit = { w: [], t: [], b: [] };
  for (const t of base) if (suitOf(t) !== dique) bySuit[suitOf(t)].push(t);
  for (const su of SUITS) {
    const arr = bySuit[su].slice().sort(cmp);
    if (!arr.length) continue;
    const counts = countTiles(arr);
    let melds = 0, pairs = 0;
    for (const k of Object.keys(counts)) { melds += Math.floor(counts[k] / 3); counts[k] = counts[k] % 3; }
    const keys = Object.keys(counts).filter(k => counts[k] > 0).sort(cmp);
    for (const k of keys) if (counts[k] === 2) pairs++;
    const tiles = [];
    for (const k of keys) for (let i = 0; i < counts[k]; i++) tiles.push(k);
    tiles.sort((a, b) => rankOf(a) - rankOf(b));
    let i = 0;
    while (i < tiles.length) {
      const r = rankOf(tiles[i]), s2 = suitOf(tiles[i]);
      const i1 = tiles.findIndex((x, j) => j !== i && x === (r + 1) + s2);
      const i2 = i1 >= 0 ? tiles.findIndex((x, j) => j !== i && j !== i1 && x === (r + 2) + s2) : -1;
      if (i2 >= 0) { melds++; tiles.splice(i2, 1); tiles.splice(i1, 1); tiles.splice(i, 1); }
      else i++;
    }
    let partial = 0;
    i = 0;
    while (i < tiles.length - 1) { if (rankOf(tiles[i + 1]) === rankOf(tiles[i]) + 1) { partial++; i += 2; } else i++; }
    score += melds * 10 + pairs * 4 + partial * 1.5;
    if (arr.length >= 9) score += 4;
  }
  return score;
}
function tingOfBase(base) {
  const out = [];
  for (const t of ALL_TILES) if (winType(base.concat([t]))) out.push(t);
  return out;
}
function chooseDiscard(seat) {
  const s = game.seats[seat];
  const hand = s.hand.slice();
  const meldT = meldTriples(s);
  const diqueTiles = hand.filter(t => suitOf(t) === s.dique);
  const cands = diqueTiles.length ? diqueTiles : hand;
  let best = null;
  for (const t of uniq(cands)) {
    const base = removeOne(hand, t).concat(meldT);
    let sc = -1000;
    if (base.length === 13) {
      sc = tingOfBase(base).length ? 100 + evalBase(base, s.dique) : evalBase(base, s.dique);
    }
    if (!best || sc > best.sc) best = { tile: t, sc };
  }
  return best ? best.tile : (hand[0] || null);
}
function chooseDique(seat) {
  const s = game.seats[seat];
  let best = "w", bestN = 99;
  for (const su of SUITS) {
    const n = s.hand.filter(t => suitOf(t) === su).length;
    if (n < bestN) { bestN = n; best = su; }
  }
  return best;
}
function wantPeng(seat, tile) {
  const s = game.seats[seat];
  if (countTiles(s.hand)[tile] < 2) return false;
  const ting = tingTiles(seat);
  if (ting.length) {
    const hand2 = removeOne(removeOne(s.hand, tile), tile);
    const melds2 = s.melds.concat([{ kind: "peng", tiles: [tile, tile, tile] }]);
    const base = hand2.concat(melds2.map(m => { const out = []; for (let i = 0; i < 3; i++) out.push(m.tiles[0]); return out; }).reduce((a, b) => a.concat(b), []));
    return tingOfBase(base).length > 0;
  }
  return true;
}

// ================= 流程 =================
function pushEvent(t, seat, tile, detail) {
  game.events.push({ seq: ++game.seq, t, seat, tile, detail: detail || (tile ? nameOf(tile) : "") });
  if (game.events.length > 40) game.events.shift();
}
function totalTiles(seat) {
  const s = game.seats[seat];
  let n = s.hand.length;
  for (const m of s.melds) n += m.kind === "peng" ? 3 : 4;
  return n;
}
function countGangs(seat) {
  let n = 0;
  for (const m of game.seats[seat].melds) if (m.kind !== "peng") n++;
  return n;
}
function newGame(round, seed) {
  const rnd = mulberry32(seed);
  const wall = shuffle(ALL_TILES, rnd);
  game = {
    phase: "dique", round: round || 1, seed, dealer: ((round || 1) - 1) % 4,
    turn: -1, wall, lastDiscard: null, lastTile: false, pending: null,
    winners: [], seq: 0, events: [], diqueCount: 0, busy: false,
    seats: [0, 1, 2, 3].map(i => ({
      name: NAMES[i], type: i === 0 ? "human" : "bot",
      hand: [], melds: [], discards: [], dique: null, hu: null, score: 0, ting: [], drawnTile: null,
    })),
  };
  for (let i = 0; i < 13; i++) for (let s2 = 0; s2 < 4; s2++) game.seats[s2].hand.push(wall.pop());
  game.seats[game.dealer].hand.push(wall.pop());
  for (const s2 of game.seats) sortTiles(s2.hand);
  game.pending = { type: "dique", seat: 0 };
}
function nextUndeclared() {
  for (let i = 0; i < 4; i++) if (!game.seats[i].dique) return { type: "dique", seat: i };
  return null;
}
function declareDique(seat, suit) {
  const s = game.seats[seat];
  s.dique = suit;
  game.diqueCount++;
  pushEvent("dique", seat, null, "定缺 " + SUIT_CHAR[suit]);
  if (game.diqueCount >= 4) {
    game.phase = "playing";
    game.pending = null;
    game.turn = game.dealer;
    tick();
  } else {
    game.pending = nextUndeclared();
    tick();
  }
}
function draw(seat) {
  if (!game.wall.length) { endGame(); return false; }
  const tile = game.wall.pop();
  game.lastTile = game.wall.length === 0;
  const s = game.seats[seat];
  s.hand.push(tile);
  sortTiles(s.hand);
  s.drawnTile = tile;
  pushEvent("draw", seat, tile, "摸牌");
  return true;
}
function openDrawOptions(seat) {
  const s = game.seats[seat];
  const opts = [];
  const r = checkHu(seat, {});
  if (r) opts.push("hu");
  const counts = countTiles(s.hand);
  const four = Object.keys(counts).filter(k => counts[k] === 4);
  if (four.length) opts.push("angang");
  const bugangM = s.melds.find(m => m.kind === "peng" && counts[m.tiles[0]] >= 1);
  if (bugangM) opts.push("bugang");
  opts.push("discard");
  game.pending = { type: "drawOptions", seat, options: opts, hu: r };
  game.turn = seat;
  tick();
}
function advanceTurn(fromSeat) {
  if (game.phase !== "playing") return;
  if (game.winners.length >= 3) { endGame(); return; }
  let seat = fromSeat;
  for (let i = 0; i < 4; i++) {
    seat = (seat + 1) % 4;
    if (!game.seats[seat].hu) { game.turn = seat; return; }
  }
  endGame();
}
function endGame() {
  if (game.phase === "finished") return;
  game.phase = "finished";
  game.pending = null;
  game.turn = -1;
  const remain = [0, 1, 2, 3].filter(i => !game.seats[i].hu);
  if (remain.length >= 2 && game.wall.length === 0) {
    for (const i of remain) {
      const s = game.seats[i];
      s.ting = tingTiles(i);
      if (s.hand.some(t => suitOf(t) === s.dique)) s.huazi = true;
    }
    for (const a of remain) for (const b of remain) {
      if (a === b) continue;
      const sa = game.seats[a], sb = game.seats[b];
      if (sa.ting.length && !sb.ting.length) {
        const pay = sb.huazi ? 40 : 20;
        sb.score -= pay;
        sa.score += pay;
        pushEvent("chajiao", a, null, "查叫：" + sb.name + " 未叫赔 " + sa.name + " " + pay + " 分");
      }
    }
  }
  pushEvent("end", -1, null, "牌局结束（" + game.winners.length + " 家胡牌）");
}
function applyHu(seat, tile, from, opts) {
  const s = game.seats[seat];
  if (from === "discard") { s.hand.push(tile); sortTiles(s.hand); }
  const r = checkHu(seat, {});
  if (!r) { if (from === "discard") s.hand.pop(); return false; }
  const fan = r.fan;
  if (from === "discard") {
    const payer = game.seats[game.lastDiscard.seat];
    payer.score -= 10 * fan;
    s.score += 10 * fan;
  } else {
    for (let i = 0; i < 4; i++) {
      if (i === seat || game.seats[i].hu) continue;
      game.seats[i].score -= 10 * fan;
      s.score += 10 * fan;
    }
  }
  s.hu = { tile, fan, wt: r.wt, from, lastTile: game.wall.length === 0, gangDraw: !!opts.gangDraw };
  s.ting = [];
  game.winners.push(seat);
  const how = from === "discard" ? "点炮胡" : (opts.gangDraw ? "杠上花" : "自摸");
  pushEvent("hu", seat, tile, how + " " + nameOf(tile) + " · " + wtName(r.wt) + " " + fan + "番");
  if (game.winners.length >= 3) { endGame(); return true; }
  if (from === "discard") advanceTurn(game.lastDiscard.seat);
  else advanceTurn(seat);
  return true;
}
function applyPeng(seat, tile) {
  const s = game.seats[seat];
  for (let i = 0; i < 2; i++) s.hand.splice(s.hand.indexOf(tile), 1);
  sortTiles(s.hand);
  s.melds.push({ kind: "peng", tiles: [tile, tile, tile] });
  pushEvent("peng", seat, tile, "碰 " + nameOf(tile));
  game.turn = seat;
  tick();
}
function applyGang(seat, kind, tile, payer) {
  const s = game.seats[seat];
  if (kind === "zhigang") {
    for (let i = 0; i < 3; i++) s.hand.splice(s.hand.indexOf(tile), 1);
    s.melds.push({ kind: "gang", source: "zhigang", tiles: [tile, tile, tile, tile] });
    game.seats[payer].score -= 2;
    s.score += 2;
    pushEvent("gang", seat, tile, "直杠 " + nameOf(tile));
  } else if (kind === "angang") {
    for (let i = 0; i < 4; i++) s.hand.splice(s.hand.indexOf(tile), 1);
    s.melds.push({ kind: "angang", tiles: [tile, tile, tile, tile] });
    for (let i = 0; i < 4; i++) { if (i === seat || game.seats[i].hu) continue; game.seats[i].score -= 2; s.score += 2; }
    pushEvent("gang", seat, tile, "暗杠 " + nameOf(tile));
  } else if (kind === "bugang") {
    const m = s.melds.find(m2 => m2.kind === "peng" && m2.tiles[0] === tile);
    if (m) { m.kind = "gang"; m.source = "bugang"; m.tiles = [tile, tile, tile, tile]; }
    s.hand.splice(s.hand.indexOf(tile), 1);
    for (let i = 0; i < 4; i++) { if (i === seat || game.seats[i].hu) continue; game.seats[i].score -= 1; s.score += 1; }
    pushEvent("gang", seat, tile, "补杠 " + nameOf(tile));
  }
  sortTiles(s.hand);
  if (!draw(seat)) return;
  const r = checkHu(seat, {});
  if (r) { applyHu(seat, s.drawnTile, "gangdraw", { gangDraw: true }); return; }
  openDrawOptions(seat);
}
function collectClaims(discarder, tile) {
  const claims = [];
  for (let i = 1; i <= 3; i++) {
    const seat = (discarder + i) % 4;
    const s = game.seats[seat];
    if (s.hu) continue;
    const kinds = [];
    if (checkHu(seat, { extra: tile })) kinds.push("hu");
    const c = countTiles(s.hand);
    if (c[tile] >= 3) kinds.push("gang");
    if (c[tile] >= 2) kinds.push("peng");
    if (kinds.length) claims.push({ seat, kinds });
  }
  return claims;
}
function resolveClaims() {
  const p = game.pending;
  if (!p || p.type !== "claim") return;
  const huSeats = p.claims.filter(c => c.kinds.indexOf("hu") >= 0).map(c => c.seat);
  if (huSeats.length) {
    for (const seat of huSeats) {
      if (game.phase !== "playing") break;
      applyHu(seat, p.tile, "discard", {});
    }
    game.pending = null;
    return;
  }
  const gangC = p.claims.find(c => c.kinds.indexOf("gang") >= 0);
  if (gangC) { game.pending = null; applyGang(gangC.seat, "zhigang", p.tile, p.discarder); return; }
  const pengC = p.claims.find(c => c.kinds.indexOf("peng") >= 0);
  if (pengC) {
    if (wantPeng(pengC.seat, p.tile)) { game.pending = null; applyPeng(pengC.seat, p.tile); return; }
    const rest = p.claims.filter(c => c !== pengC);
    if (rest.length) { p.claims = rest; resolveClaims(); } else { game.pending = null; advanceTurn(p.discarder); }
    return;
  }
  game.pending = null;
  advanceTurn(p.discarder);
}
function discard(seat, tile, auto) {
  const s = game.seats[seat];
  if (s.hu) return false;
  const idx = s.hand.indexOf(tile);
  if (idx < 0) return false;
  if (s.dique) {
    const dq = s.hand.filter(t => suitOf(t) === s.dique);
    if (dq.length && suitOf(tile) !== s.dique) return false;
  }
  s.hand.splice(idx, 1);
  s.discards.push(tile);
  s.drawnTile = null;
  pushEvent("discard", seat, tile, "打出 " + nameOf(tile));
  game.lastDiscard = { tile, seat, kind: "discard" };
  const claims = collectClaims(seat, tile);
  if (claims.length) {
    game.pending = { type: "claim", tile, discarder: seat, claims };
    tick();
  } else {
    advanceTurn(seat);
    tick();
  }
  return true;
}
function botDrawOptions(seat) {
  const p = game.pending;
  if (!p || p.type !== "drawOptions" || p.seat !== seat) return;
  const s = game.seats[seat];
  if (p.options.indexOf("hu") >= 0) { game.pending = null; applyHu(seat, s.drawnTile, "selfdraw", {}); return; }
  if (p.options.indexOf("angang") >= 0) {
    const four = Object.keys(countTiles(s.hand)).find(k => countTiles(s.hand)[k] === 4);
    game.pending = null;
    applyGang(seat, "angang", four);
    return;
  }
  if (p.options.indexOf("bugang") >= 0) {
    const m = s.melds.find(m2 => m2.kind === "peng" && countTiles(s.hand)[m2.tiles[0]] >= 1);
    if (m) { game.pending = null; applyGang(seat, "bugang", m.tiles[0]); return; }
  }
  game.pending = null;
}
function tick() {
  if (!game || !timer) return;
  const g = game;
  if (g.phase !== "dique" && g.phase !== "playing") return;
  if (g.busy) return;
  if (g.phase === "dique") {
    const seat = g.pending && g.pending.seat;
    if (seat == null || seat < 0) return;
    if (g.seats[seat].type === "human") return;
    g.busy = true;
    timer.timeout(() => {
      const st = g.pending && g.pending.seat;
      if (st != null && st >= 0 && !g.seats[st].dique) {
        const suit = chooseDique(st);
        declareDique(st, suit);
      }
      g.busy = false;
      tick();
    }, 600);
    return;
  }
  if (g.pending && g.pending.type === "claim") {
    const hasHuman = g.pending.claims.some(c => g.seats[c.seat].type === "human");
    if (hasHuman) return;
    g.busy = true;
    timer.timeout(() => { resolveClaims(); g.busy = false; tick(); }, 800);
    return;
  }
  if (g.pending && g.pending.type === "drawOptions") {
    if (g.pending.seat === 0) return;
    g.busy = true;
    timer.timeout(() => { botDrawOptions(g.pending.seat); g.busy = false; tick(); }, 900);
    return;
  }
  const seat = g.turn;
  if (seat < 0) return;
  const s = g.seats[seat];
  if (g.phase !== "playing" || s.hu) return;
  const gangs = countGangs(seat);
  const t = totalTiles(seat);
  if (s.type === "human") {
    if (t === 13 + gangs) {
      if (draw(seat)) openDrawOptions(seat);
    }
    return;
  }
  g.busy = true;
  timer.timeout(() => {
    const s2 = g.seats[seat];
    if (s2.hu || g.phase !== "playing") { g.busy = false; tick(); return; }
    const t2 = totalTiles(seat);
    const gangs2 = countGangs(seat);
    if (t2 === 13 + gangs2) {
      if (!draw(seat)) { g.busy = false; tick(); return; }
      openDrawOptions(seat);
    } else if (t2 >= 14 + gangs2) {
      const tile = chooseDiscard(seat);
      discard(seat, tile, true);
    }
    g.busy = false;
    tick();
  }, 1000);
}

// ================= 快照 / RPC 逻辑 =================
function bad(reason) { return { ok: false, reason }; }
// 手牌分析：告诉玩家当前手牌状态（为什么没胡/怎么听牌）
function analyzeHuman() {
  const s = game && game.seats[0];
  if (!s || s.hu || game.phase !== "playing" || !s.dique) return null;
  const left = s.hand.filter(t => suitOf(t) === s.dique);
  if (left.length) return { state: "dique-left", tiles: left };
  const base = fullHand(0, null);
  if (base.length === 13) {
    const ting = tingTiles(0);
    return ting.length ? { state: "ting", tiles: ting } : { state: "noting" };
  }
  if (base.length === 14 && game.pending && game.pending.type === "drawOptions" && game.pending.seat === 0) {
    const meldT = meldTriples(s);
    const sugg = [];
    for (const t of uniq(s.hand)) {
      const rest = removeOne(s.hand, t).concat(meldT);
      if (rest.length === 13) {
        const ting = tingOfBase(rest);
        if (ting.length) sugg.push({ discard: t, ting });
      }
    }
    return sugg.length ? { state: "suggest", sugg } : { state: "noting" };
  }
  return null;
}
function snap() {
  if (!game) return { phase: "idle", round: 0, dealer: 0, turn: -1, wallCount: 0, lastDiscard: null, lastTile: false, players: [], pending: null, winners: [], events: [], hints: { state: "idle", tiles: [] }, analysis: null };
  let hints = { state: "normal", tiles: [] };
  const hs = game.seats[0];
  if (game.phase === "playing" && hs && !hs.hu) {
    const base = fullHand(0, null);
    if (base.length === 13) {
      const ting = tingTiles(0);
      if (ting.length) hints = { state: "ting", tiles: ting };
    }
  }
  const analysis = analyzeHuman();
  return {
    phase: game.phase, round: game.round, dealer: game.dealer, turn: game.turn,
    wallCount: game.wall.length, lastTile: game.lastTile,
    lastDiscard: game.lastDiscard ? { tile: game.lastDiscard.tile, seat: game.lastDiscard.seat } : null,
    players: game.seats.map((s, i) => ({
      seat: i, name: s.name, type: s.type, dique: s.dique,
      hand: i === 0 ? s.hand.slice() : null,
      handCount: s.hand.length,
      melds: s.melds.map(m => ({ kind: m.kind, tiles: m.tiles.slice() })),
      discards: s.discards.slice(),
      score: s.score, hu: s.hu, huazi: !!s.huazi,
      drawnTile: i === 0 ? s.drawnTile : null,
    })),
    pending: game.pending ? {
      type: game.pending.type,
      seat: game.pending.seat,
      tile: game.pending.tile,
      options: game.pending.options ? game.pending.options.slice() : undefined,
      claims: game.pending.claims ? game.pending.claims.map(c => ({ seat: c.seat, kinds: c.kinds.slice() })) : undefined,
    } : null,
    winners: game.winners.slice(),
    events: game.events.slice(-14),
    hints,
    analysis,
  };
}
function handleStart(args) {
  const round = args && args.round ? args.round : 1;
  let seed = args && args.seed != null ? args.seed : null;
  if (seed == null) {
    const now = (typeof Date !== "undefined" && Date.now) ? Date.now() : 1234567;
    seed = (now ^ ((Math.random() * 1e9) | 0)) >>> 0;
  }
  newGame(round, seed);
  tick();
  return snap();
}
function handleDique(args) {
  if (!game || game.phase !== "dique") return bad("当前不需要定缺");
  if (!game.pending || game.pending.type !== "dique" || game.pending.seat !== 0) return bad("还没轮到你定缺");
  if (SUITS.indexOf(args && args.suit) < 0) return bad("无效定缺");
  declareDique(0, args.suit);
  return snap();
}
function handleAct(args) {
  if (!game || game.phase !== "playing") return bad("游戏未开始");
  if (game.turn !== 0) return bad("还没轮到你");
  const s = game.seats[0];
  if (s.hu) return bad("你已胡牌");
  if (game.pending) {
    if (game.pending.type === "dique") return bad("请先定缺");
    if (game.pending.type === "claim") return bad("请先处理碰/杠/胡");
    if (game.pending.type === "drawOptions" && game.pending.seat === 0) game.pending = null;
  }
  const tile = args && args.tile;
  if (!tile || s.hand.indexOf(tile) < 0) return bad("无效的牌");
  if (!discard(0, tile, false)) return bad("无效出牌（定缺中需先打缺门牌）");
  return snap();
}
function handleClaim(args) {
  if (!game || game.phase !== "playing") return bad("游戏未进行中");
  const action = args && (args.decision != null ? args.decision : args.action);
  const s = game.seats[0];
  if (game.pending && game.pending.type === "claim") {
    const p = game.pending;
    const tile = p.tile;
    const discarder = p.discarder;
    const mine = p.claims.find(c => c.seat === 0);
    if (!mine) return bad("没有需要你处理的牌");
    if (action === "pass") {
      p.claims = p.claims.filter(c => c.seat !== 0);
      if (p.claims.length) resolveClaims();
      else { game.pending = null; advanceTurn(discarder); }
      tick();
      return snap();
    }
    if (action === "hu" && mine.kinds.indexOf("hu") >= 0) {
      applyHu(0, tile, "discard", {});
      const rest = p.claims.filter(c => c.seat !== 0 && c.kinds.indexOf("hu") >= 0).map(c => c.seat);
      game.pending = null;
      if (game.phase === "playing") for (const seat of rest) { if (game.phase !== "playing") break; applyHu(seat, tile, "discard", {}); }
      tick();
      return snap();
    }
    if (action === "gang" && mine.kinds.indexOf("gang") >= 0) { game.pending = null; applyGang(0, "zhigang", tile, discarder); return snap(); }
    if (action === "peng" && mine.kinds.indexOf("peng") >= 0) { game.pending = null; applyPeng(0, tile); return snap(); }
    return bad("无效操作");
  }
  if (game.pending && game.pending.type === "drawOptions" && game.pending.seat === 0) {
    const p = game.pending;
    const opts = p.options;
    if (action === "pass") { game.pending = null; return snap(); }
    if (action === "hu" && opts.indexOf("hu") >= 0) { game.pending = null; applyHu(0, s.drawnTile, "selfdraw", {}); tick(); return snap(); }
    if (action === "angang" && opts.indexOf("angang") >= 0) {
      const four = Object.keys(countTiles(s.hand)).find(k => countTiles(s.hand)[k] === 4);
      game.pending = null;
      applyGang(0, "angang", four);
      return snap();
    }
    if (action === "bugang" && opts.indexOf("bugang") >= 0) {
      const m = s.melds.find(m2 => m2.kind === "peng" && countTiles(s.hand)[m2.tiles[0]] >= 1);
      game.pending = null;
      applyGang(0, "bugang", m.tiles[0]);
      return snap();
    }
    return bad("无效操作");
  }
  return bad("当前没有可操作项");
}
function dispatch(body) {
  const action = body && body.action;
  switch (action) {
    case "start": return handleStart(body);
    case "state": return snap();
    case "dique": return handleDique(body);
    case "act": return handleAct(body);
    case "claim": return handleClaim(body);
    case "quit": game = null; return snap();
    default: return bad("unknown action: " + String(body && body.action));
  }
}

// ================= HTTP 入口 =================
const RPC_PATH = "/dsh-mahjong/rpc";
const MAX_BODY = 64 * 1024;
function isSameOrigin(req) {
  const site = req.headers["sec-fetch-site"];
  return !site || site === "same-origin" || site === "none";
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY) { reject(new Error("request too large")); req.destroy(); }
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}
function json(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(value));
}

export function apply(ctx) {
  timer = ctx.timer;
  ctx.effect(() => {
    const dispose = ctx.webServer.register({
      kind: "exact",
      path: RPC_PATH,
      handler: async (req, res) => {
        if (req.method !== "POST" || req.headers["x-dsh-mahjong"] !== "1" || !isSameOrigin(req)) {
          json(res, 403, { ok: false, reason: "forbidden" });
          return;
        }
        let body;
        try {
          body = await readJson(req);
        } catch {
          json(res, 400, { ok: false, reason: "bad request" });
          return;
        }
        json(res, 200, dispatch(body));
      },
    });
    return dispose;
  }, "dsh-mahjong: rpc");
}
