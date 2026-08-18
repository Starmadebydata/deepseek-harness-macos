// 全自动对局模拟：验证引擎整条链路（定缺→出牌→碰杠胡→查叫）无死锁、无状态泄漏
// 引擎代码与插件 mjhn-1/pkg-2 的 Host 半区保持一致；差异：4 座位全为 bot + 同步 timer

const SUITS = ['w', 't', 'b']
const SUIT_CHAR = { w: '万', t: '筒', b: '条' }
const RANK_CHAR = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const NAMES = ['甲', '乙', '丙', '丁']
const ALL_TILES = []
for (const s of SUITS) for (let r = 1; r <= 9; r++) for (let c = 0; c < 4; c++) ALL_TILES.push(r + s)
const suitOf = (t) => t[t.length - 1]
const rankOf = (t) => Number(t[0])
const nameOf = (t) => RANK_CHAR[rankOf(t)] + SUIT_CHAR[suitOf(t)]
const cmp = (a, b) => { const sa = suitOf(a), sb = suitOf(b); if (sa !== sb) return SUITS.indexOf(sa) - SUITS.indexOf(sb); return rankOf(a) - rankOf(b) }
const sortTiles = (arr) => arr.sort(cmp)
function countTiles(arr) { const m = {}; for (const t of arr) m[t] = (m[t] || 0) + 1; return m }
function uniq(arr) { const o = {}; for (const x of arr) o[x] = 1; return Object.keys(o) }
function removeOne(arr, tile) { const out = arr.slice(); const i = out.indexOf(tile); if (i >= 0) out.splice(i, 1); return out }
function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function shuffle(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t } return a }

let game = null

function canFormMelds(counts, pungOnly) {
  const keys = Object.keys(counts).filter(k => counts[k] > 0).sort(cmp)
  if (keys.length === 0) return true
  const t0 = keys[0]
  if (counts[t0] >= 3) {
    const n = Object.assign({}, counts); n[t0] -= 3; if (n[t0] === 0) delete n[t0]
    if (canFormMelds(n, pungOnly)) return true
  }
  if (!pungOnly) {
    const r = rankOf(t0)
    if (r <= 7) {
      const t1 = (r + 1) + suitOf(t0), t2 = (r + 2) + suitOf(t0)
      if (counts[t1] > 0 && counts[t2] > 0) {
        const n = Object.assign({}, counts)
        n[t0]--; n[t1]--; n[t2]--
        for (const k of [t0, t1, t2]) if (n[k] === 0) delete n[k]
        if (canFormMelds(n, pungOnly)) return true
      }
    }
  }
  return false
}
function winType(full) {
  if (full.length !== 14) return null
  const counts = countTiles(full)
  const keys = Object.keys(counts)
  const pairCount = keys.reduce((s, k) => s + Math.floor(counts[k] / 2), 0)
  if (pairCount === 7) {
    let quad = 0, ok = true
    for (const k of keys) { const c = counts[k]; if (c !== 2 && c !== 4) { ok = false; break } if (c === 4) quad++ }
    if (ok) return quad > 0 ? 'longqidui' : 'qidui'
  }
  for (const p of keys) {
    if (counts[p] >= 2) {
      const n = Object.assign({}, counts); n[p] -= 2; if (n[p] === 0) delete n[p]
      if (canFormMelds(n, false)) return 'standard'
    }
  }
  return null
}
function isPengPengConcealed(full) {
  const counts = countTiles(full)
  const keys = Object.keys(counts)
  for (const p of keys) {
    if (counts[p] >= 2) {
      let ok = true
      for (const k of keys) if ((counts[k] - (k === p ? 2 : 0)) % 3 !== 0) { ok = false; break }
      if (ok) return true
    }
  }
  return false
}
function meldTriples(s) { const out = []; for (const m of s.melds) out.push(m.tiles[0], m.tiles[0], m.tiles[0]); return out }
function fullHand(seat, extra) { const s = game.seats[seat]; const f = s.hand.slice(); if (extra) f.push(extra); return f.concat(meldTriples(s)) }
function checkHu(seat, opts) {
  const s = game.seats[seat]
  if (s.hu) return null
  const f = fullHand(seat, opts && opts.extra)
  if (f.length !== 14) return null
  if (s.dique && s.hand.some(t => suitOf(t) === s.dique)) return null
  const wt = winType(f)
  if (!wt) return null
  if ((wt === 'qidui' || wt === 'longqidui') && s.melds.length > 0) return null
  const fan = calcFan(seat, wt, f, opts || {})
  return { wt, fan }
}
function calcFan(seat, wt, full, opts) {
  const suits = {}
  for (const t of full) suits[suitOf(t)] = 1
  const nSuits = Object.keys(suits).length
  let fan = 1
  if (wt === 'qidui') fan = nSuits === 1 ? 4 : 2
  else if (wt === 'longqidui') fan = 4
  else {
    if (nSuits === 1) fan += 2
    if (isPengPengConcealed(full)) fan += 2
  }
  if (opts.gangDraw) fan += 1
  if (opts.lastTile) fan += 1
  return Math.min(fan, 4)
}
function tingTiles(seat) {
  const s = game.seats[seat]
  const base = fullHand(seat, null)
  if (base.length !== 13) return []
  if (s.dique && s.hand.some(t => suitOf(t) === s.dique)) return []
  const out = []
  for (const t of ALL_TILES) {
    const wt = winType(base.concat([t]))
    if (!wt) continue
    if ((wt === 'qidui' || wt === 'longqidui') && s.melds.length > 0) continue
    out.push(t)
  }
  return out
}

function evalBase(base, dique) {
  let score = 0
  score -= base.filter(t => suitOf(t) === dique).length * 12
  const bySuit = { w: [], t: [], b: [] }
  for (const t of base) if (suitOf(t) !== dique) bySuit[suitOf(t)].push(t)
  for (const su of SUITS) {
    const arr = bySuit[su].slice().sort(cmp)
    if (!arr.length) continue
    const counts = countTiles(arr)
    let melds = 0, pairs = 0
    for (const k of Object.keys(counts)) { melds += Math.floor(counts[k] / 3); counts[k] = counts[k] % 3 }
    const keys = Object.keys(counts).filter(k => counts[k] > 0).sort(cmp)
    for (const k of keys) if (counts[k] === 2) pairs++
    const tiles = []
    for (const k of keys) for (let i = 0; i < counts[k]; i++) tiles.push(k)
    tiles.sort((a, b) => rankOf(a) - rankOf(b))
    let i = 0
    while (i < tiles.length) {
      const r = rankOf(tiles[i]), s2 = suitOf(tiles[i])
      const i1 = tiles.findIndex((x, j) => j !== i && x === (r + 1) + s2)
      const i2 = i1 >= 0 ? tiles.findIndex((x, j) => j !== i && j !== i1 && x === (r + 2) + s2) : -1
      if (i2 >= 0) { melds++; tiles.splice(i2, 1); tiles.splice(i1, 1); tiles.splice(i, 1) }
      else i++
    }
    let partial = 0
    i = 0
    while (i < tiles.length - 1) { if (rankOf(tiles[i + 1]) === rankOf(tiles[i]) + 1) { partial++; i += 2 } else i++ }
    score += melds * 10 + pairs * 4 + partial * 1.5
    if (arr.length >= 9) score += 4
  }
  return score
}
function tingOfBase(base) {
  const out = []
  for (const t of ALL_TILES) if (winType(base.concat([t]))) out.push(t)
  return out
}
function chooseDiscard(seat) {
  const s = game.seats[seat]
  const hand = s.hand.slice()
  const meldT = meldTriples(s)
  const diqueTiles = hand.filter(t => suitOf(t) === s.dique)
  const cands = diqueTiles.length ? diqueTiles : hand
  let best = null
  for (const t of uniq(cands)) {
    const base = removeOne(hand, t).concat(meldT)
    let sc = -1000
    if (base.length === 13) {
      sc = tingOfBase(base).length ? 100 + evalBase(base, s.dique) : evalBase(base, s.dique)
    }
    if (!best || sc > best.sc) best = { tile: t, sc }
  }
  return best ? best.tile : (hand[0] || null)
}
function chooseDique(seat) {
  const s = game.seats[seat]
  let best = 'w', bestN = 99
  for (const su of SUITS) {
    const n = s.hand.filter(t => suitOf(t) === su).length
    if (n < bestN) { bestN = n; best = su }
  }
  return best
}
function wantPeng(seat, tile) {
  const s = game.seats[seat]
  if (countTiles(s.hand)[tile] < 2) return false
  const ting = tingTiles(seat)
  if (ting.length) {
    const hand2 = removeOne(removeOne(s.hand, tile), tile)
    const melds2 = s.melds.concat([{ kind: 'peng', tiles: [tile, tile, tile] }])
    const base = hand2.concat(melds2.map(m => { const out = []; for (let i = 0; i < 3; i++) out.push(m.tiles[0]); return out }).reduce((a, b) => a.concat(b), []))
    return tingOfBase(base).length > 0
  }
  return true
}

function pushEvent(t, seat, tile, detail) {
  game.events.push({ seq: ++game.seq, t, seat, tile, detail: detail || (tile ? nameOf(tile) : '') })
  if (game.events.length > 40) game.events.shift()
}
function totalTiles(seat) {
  const s = game.seats[seat]
  let n = s.hand.length
  for (const m of s.melds) n += m.kind === 'peng' ? 3 : 4
  return n
}
function newGame(round, seed) {
  const rnd = mulberry32(seed)
  const wall = shuffle(ALL_TILES, rnd)
  game = {
    phase: 'dique', round: round || 1, seed, dealer: ((round || 1) - 1) % 4,
    turn: -1, wall, lastDiscard: null, lastTile: false, pending: null,
    winners: [], seq: 0, events: [], diqueCount: 0, busy: false,
    seats: [0, 1, 2, 3].map(i => ({
      name: NAMES[i], type: 'bot',
      hand: [], melds: [], discards: [], dique: null, hu: null, score: 0, ting: [], drawnTile: null,
    })),
  }
  for (let i = 0; i < 13; i++) for (let s2 = 0; s2 < 4; s2++) game.seats[s2].hand.push(wall.pop())
  game.seats[game.dealer].hand.push(wall.pop())
  for (const s2 of game.seats) sortTiles(s2.hand)
  game.pending = { type: 'dique', seat: 0 }
}
function nextUndeclared() {
  for (let i = 0; i < 4; i++) if (!game.seats[i].dique) return { type: 'dique', seat: i }
  return null
}
function declareDique(seat, suit) {
  const s = game.seats[seat]
  s.dique = suit
  game.diqueCount++
  pushEvent('dique', seat, null, '定缺 ' + SUIT_CHAR[suit])
  if (game.diqueCount >= 4) {
    game.phase = 'playing'
    game.pending = null
    game.turn = game.dealer
    tick()
  } else {
    game.pending = nextUndeclared()
    tick()
  }
}
function draw(seat) {
  if (!game.wall.length) { endGame(); return false }
  const tile = game.wall.pop()
  game.lastTile = game.wall.length === 0
  const s = game.seats[seat]
  s.hand.push(tile)
  sortTiles(s.hand)
  s.drawnTile = tile
  pushEvent('draw', seat, tile, '摸牌')
  return true
}
function openDrawOptions(seat) {
  const s = game.seats[seat]
  const opts = []
  const r = checkHu(seat, {})
  if (r) opts.push('hu')
  const counts = countTiles(s.hand)
  const four = Object.keys(counts).filter(k => counts[k] === 4)
  if (four.length) opts.push('angang')
  const bugangM = s.melds.find(m => m.kind === 'peng' && counts[m.tiles[0]] >= 1)
  if (bugangM) opts.push('bugang')
  opts.push('discard')
  game.pending = { type: 'drawOptions', seat, options: opts, hu: r }
  game.turn = seat
  tick()
}
function advanceTurn(fromSeat) {
  if (game.phase !== 'playing') return
  if (game.winners.length >= 3) { endGame(); return }
  let seat = fromSeat
  for (let i = 0; i < 4; i++) {
    seat = (seat + 1) % 4
    if (!game.seats[seat].hu) { game.turn = seat; return }
  }
  endGame()
}
function endGame() {
  if (game.phase === 'finished') return
  game.phase = 'finished'
  game.pending = null
  game.turn = -1
  const remain = [0, 1, 2, 3].filter(i => !game.seats[i].hu)
  if (remain.length >= 2 && game.wall.length === 0) {
    for (const i of remain) {
      const s = game.seats[i]
      s.ting = tingTiles(i)
      if (s.hand.some(t => suitOf(t) === s.dique)) s.huazi = true
    }
    for (const a of remain) for (const b of remain) {
      if (a === b) continue
      const sa = game.seats[a], sb = game.seats[b]
      if (sa.ting.length && !sb.ting.length) {
        const pay = sb.huazi ? 40 : 20
        sb.score -= pay
        sa.score += pay
        pushEvent('chajiao', a, null, '查叫')
      }
    }
  }
  pushEvent('end', -1, null, '牌局结束')
}
function applyHu(seat, tile, from, opts) {
  const s = game.seats[seat]
  if (from === 'discard') { s.hand.push(tile); sortTiles(s.hand) }
  const r = checkHu(seat, {})
  if (!r) { if (from === 'discard') s.hand.pop(); return false }
  const fan = r.fan
  const lastTile = game.wall.length === 0
  if (from === 'discard') {
    const payer = game.seats[game.lastDiscard.seat]
    payer.score -= 10 * fan
    s.score += 10 * fan
  } else {
    for (let i = 0; i < 4; i++) {
      if (i === seat || game.seats[i].hu) continue
      game.seats[i].score -= 10 * fan
      s.score += 10 * fan
    }
  }
  s.hu = { tile, fan, wt: r.wt, from, lastTile, gangDraw: !!opts.gangDraw }
  s.ting = []
  game.winners.push(seat)
  const how = from === 'discard' ? '点炮胡' : (opts.gangDraw ? '杠上花' : '自摸')
  pushEvent('hu', seat, tile, how + ' ' + nameOf(tile) + ' · ' + fan + '番')
  if (game.winners.length >= 3) { endGame(); return true }
  if (from === 'discard') advanceTurn(game.lastDiscard.seat)
  else advanceTurn(seat)
  return true
}
function applyPeng(seat, tile) {
  const s = game.seats[seat]
  for (let i = 0; i < 2; i++) s.hand.splice(s.hand.indexOf(tile), 1)
  sortTiles(s.hand)
  s.melds.push({ kind: 'peng', tiles: [tile, tile, tile] })
  pushEvent('peng', seat, tile, '碰 ' + nameOf(tile))
  game.turn = seat
  tick()
}
function applyGang(seat, kind, tile, payer) {
  const s = game.seats[seat]
  if (kind === 'zhigang') {
    for (let i = 0; i < 3; i++) s.hand.splice(s.hand.indexOf(tile), 1)
    s.melds.push({ kind: 'gang', source: 'zhigang', tiles: [tile, tile, tile, tile] })
    game.seats[payer].score -= 2
    s.score += 2
    pushEvent('gang', seat, tile, '直杠 ' + nameOf(tile))
  } else if (kind === 'angang') {
    for (let i = 0; i < 4; i++) s.hand.splice(s.hand.indexOf(tile), 1)
    s.melds.push({ kind: 'angang', tiles: [tile, tile, tile, tile] })
    for (let i = 0; i < 4; i++) { if (i === seat || game.seats[i].hu) continue; game.seats[i].score -= 2; s.score += 2 }
    pushEvent('gang', seat, tile, '暗杠 ' + nameOf(tile))
  } else if (kind === 'bugang') {
    const m = s.melds.find(m2 => m2.kind === 'peng' && m2.tiles[0] === tile)
    if (m) { m.kind = 'gang'; m.source = 'bugang'; m.tiles = [tile, tile, tile, tile] }
    s.hand.splice(s.hand.indexOf(tile), 1)
    for (let i = 0; i < 4; i++) { if (i === seat || game.seats[i].hu) continue; game.seats[i].score -= 1; s.score += 1 }
    pushEvent('gang', seat, tile, '补杠 ' + nameOf(tile))
  }
  sortTiles(s.hand)
  if (!draw(seat)) return
  const r = checkHu(seat, {})
  if (r) { applyHu(seat, s.drawnTile, 'gangdraw', { gangDraw: true }); return }
  openDrawOptions(seat)
}
function collectClaims(discarder, tile) {
  const claims = []
  for (let i = 1; i <= 3; i++) {
    const seat = (discarder + i) % 4
    const s = game.seats[seat]
    if (s.hu) continue
    const kinds = []
    if (checkHu(seat, { extra: tile })) kinds.push('hu')
    const c = countTiles(s.hand)
    if (c[tile] >= 3) kinds.push('gang')
    if (c[tile] >= 2) kinds.push('peng')
    if (kinds.length) claims.push({ seat, kinds })
  }
  return claims
}
function resolveClaims() {
  const p = game.pending
  if (!p || p.type !== 'claim') return
  const huSeats = p.claims.filter(c => c.kinds.indexOf('hu') >= 0).map(c => c.seat)
  if (huSeats.length) {
    for (const seat of huSeats) {
      if (game.phase !== 'playing') break
      applyHu(seat, p.tile, 'discard', {})
    }
    game.pending = null
    return
  }
  const gangC = p.claims.find(c => c.kinds.indexOf('gang') >= 0)
  if (gangC) { game.pending = null; applyGang(gangC.seat, 'zhigang', p.tile, p.discarder); return }
  const pengC = p.claims.find(c => c.kinds.indexOf('peng') >= 0)
  if (pengC) {
    if (wantPeng(pengC.seat, p.tile)) { game.pending = null; applyPeng(pengC.seat, p.tile); return }
    const rest = p.claims.filter(c => c !== pengC)
    if (rest.length) { p.claims = rest; resolveClaims() } else { game.pending = null; advanceTurn(p.discarder) }
    return
  }
  game.pending = null
  advanceTurn(p.discarder)
}
function discard(seat, tile, auto) {
  const s = game.seats[seat]
  if (s.hu) return false
  const idx = s.hand.indexOf(tile)
  if (idx < 0) return false
  if (s.dique) {
    const dq = s.hand.filter(t => suitOf(t) === s.dique)
    if (dq.length && suitOf(tile) !== s.dique) return false
  }
  s.hand.splice(idx, 1)
  s.discards.push(tile)
  s.drawnTile = null
  pushEvent('discard', seat, tile, '打出 ' + nameOf(tile))
  game.lastDiscard = { tile, seat, kind: 'discard' }
  const claims = collectClaims(seat, tile)
  if (claims.length) {
    game.pending = { type: 'claim', tile, discarder: seat, claims }
    tick()
  } else {
    advanceTurn(seat)
    tick()
  }
  return true
}
function botDrawOptions(seat) {
  const p = game.pending
  if (!p || p.type !== 'drawOptions' || p.seat !== seat) return
  const s = game.seats[seat]
  if (p.options.indexOf('hu') >= 0) { game.pending = null; applyHu(seat, s.drawnTile, 'selfdraw', {}); return }
  if (p.options.indexOf('angang') >= 0) {
    const four = Object.keys(countTiles(s.hand)).find(k => countTiles(s.hand)[k] === 4)
    game.pending = null
    applyGang(seat, 'angang', four)
    return
  }
  if (p.options.indexOf('bugang') >= 0) {
    const m = s.melds.find(m2 => m2.kind === 'peng' && countTiles(s.hand)[m2.tiles[0]] >= 1)
    if (m) { game.pending = null; applyGang(seat, 'bugang', m.tiles[0]); return }
  }
  game.pending = null
}

let timer = null
function tick() {
  if (!game || !timer) return
  const g = game
  if (g.phase !== 'dique' && g.phase !== 'playing') return
  if (g.busy) return
  if (g.phase === 'dique') {
    const seat = g.pending && g.pending.seat
    if (seat == null || seat < 0) return
    g.busy = true
    timer.timeout(() => {
      const st = g.pending && g.pending.seat
      if (st != null && st >= 0 && !g.seats[st].dique) {
        const suit = chooseDique(st)
        declareDique(st, suit)
      }
      g.busy = false
      tick()
    }, 1)
    return
  }
  if (g.pending && g.pending.type === 'claim') {
    g.busy = true
    timer.timeout(() => { resolveClaims(); g.busy = false; tick() }, 1)
    return
  }
  if (g.pending && g.pending.type === 'drawOptions') {
    g.busy = true
    timer.timeout(() => { botDrawOptions(g.pending.seat); g.busy = false; tick() }, 1)
    return
  }
  const seat = g.turn
  if (seat < 0) return
  const s = g.seats[seat]
  if (g.phase !== 'playing' || s.hu) return
  const gangs = s.melds.filter(m => m.kind !== 'peng').length
  const t = totalTiles(seat)
  if (s.type === 'human') {
    // 人类等待回合：自动摸牌并打开操作选项
    if (t === 13 + gangs) {
      if (draw(seat)) openDrawOptions(seat)
    }
    return
  }
  g.busy = true
  timer.timeout(() => {
    const s2 = g.seats[seat]
    if (s2.hu || g.phase !== 'playing') { g.busy = false; tick(); return }
    const t2 = totalTiles(seat)
    const gangs2 = s2.melds.filter(m => m.kind !== 'peng').length
    if (t2 === 13 + gangs2) {
      if (!draw(seat)) { g.busy = false; tick(); return }
      openDrawOptions(seat)
    } else if (t2 >= 14 + gangs2) {
      const tile = chooseDiscard(seat)
      discard(seat, tile, true)
    }
    g.busy = false
    tick()
  }, 1)
}

// ================= 模拟驱动 =================
// 队列式 timer：每步回调在独立栈上执行，避免同步递归爆栈（真实插件 timer 为异步，无此问题）
const queue = []
timer = {
  timeout(cb) { queue.push(cb); return () => {} },
}
function pump(seed) {
  let guard = 0
  while (game.phase !== 'finished' && guard < 200000) {
    if (queue.length) { queue.shift()(); guard++; continue }
    tick()
    guard++
  }
  if (game.phase !== 'finished') {
    console.log('卡死现场 seed', seed)
    console.log('  phase', game.phase, 'turn', game.turn, 'busy', game.busy, 'wall', game.wall.length)
    console.log('  pending', JSON.stringify(game.pending && { type: game.pending.type, seat: game.pending.seat, tile: game.pending.tile, options: game.pending.options, claims: game.pending.claims }))
    for (let i = 0; i < 4; i++) {
      const s = game.seats[i]
      console.log('  seat', i, s.name, 'hu=', !!s.hu, 'hand', s.hand.length, 'discards', s.discards.length, 'melds', s.melds.map(m => m.kind + '/' + (m.source || '')).join(','), 'total', totalTiles(i))
    }
    throw new Error('未结束（步骤超限）')
  }
}

// 不变量检查：所有牌实例并集，减去被吃进的牌（碰/直杠/补杠/点炮胡各 1 张）后 = 108，且每张 ≤ 4
function checkInvariants(seed) {
  const s0 = game.seats
  const seen = {}
  const add = (t, n) => { seen[t] = (seen[t] || 0) + n }
  for (let i = 0; i < 4; i++) {
    const s = s0[i]
    for (const t of s.hand) add(t, 1)
    for (const t of s.discards) add(t, 1)
    for (const m of s.melds) for (const t of m.tiles) add(t, 1)
    if (s.hu) {
      const full = fullHand(i, null)
      if (full.length !== 14) throw new Error('seed ' + seed + ': 胡牌座位手牌数异常 ' + full.length)
      const wt = winType(full)
      if (!wt) throw new Error('seed ' + seed + ': 胡牌座位 ' + i + ' 实际不成胡')
    } else if (game.phase === 'playing') {
      const gangs = s.melds.filter(m => m.kind !== 'peng').length
      const t = totalTiles(i)
      if (t !== 13 + gangs && t !== 14 + gangs && t !== 15 + gangs) {
        throw new Error('seed ' + seed + ': 座位 ' + i + ' 张数异常 ' + t + '（杠数 ' + gangs + '）')
      }
    }
  }
  for (const t of game.wall) add(t, 1)
  // 被吃进的牌：碰/直杠/补杠的明刻里那 1 张来自别人的弃牌，点炮胡的胡牌也在弃牌堆里
  for (let i = 0; i < 4; i++) {
    const s = s0[i]
    if (s.hu && s.hu.from === 'discard') add(s.hu.tile, -1)
    for (const m of s.melds) {
      if (m.kind === 'peng' || m.source === 'zhigang' || m.source === 'bugang') add(m.tiles[0], -1)
    }
  }
  let sum = 0
  for (const k of Object.keys(seen)) {
    sum += seen[k]
    if (seen[k] > 4) throw new Error('seed ' + seed + ': 牌 ' + k + ' 出现 ' + seen[k] + ' 次')
    if (seen[k] < 0) throw new Error('seed ' + seed + ': 牌 ' + k + ' 计数为负')
  }
  if (sum !== 108) throw new Error('seed ' + seed + ': 牌总数守恒破坏 ' + sum)
}

let games = 0, huCount = 0, gangCount = 0, chajiaoCount = 0, maxSteps = 0
for (let seed = 1; seed <= 300; seed++) {
  if (seed % 25 === 1) console.log('... seed', seed)
  newGame(1, seed)
  let steps = 0
  try {
    pump(seed)
    checkInvariants(seed)
    steps = queue.length
  } catch (e) {
    console.log('❌ seed', seed, e.message)
    console.log('   events:', JSON.stringify(game.events.slice(-8)))
    process.exit(1)
  }
  games++
  huCount += game.winners.length
  maxSteps = Math.max(maxSteps, steps)
  for (const s of game.seats) for (const m of s.melds) if (m.kind !== 'peng') gangCount++
  for (const ev of game.events) if (ev.t === 'chajiao') chajiaoCount++
}
console.log('✅ 300 局模拟全部通过')
console.log('   总胡牌数:', huCount, '| 平均每局胡', (huCount / games).toFixed(2), '家')
console.log('   杠数:', gangCount, '| 查叫事件:', chajiaoCount)
console.log('   最长局步数:', maxSteps)
