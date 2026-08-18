// 人类路径模拟：seat0 = human，用等价 RPC 的操作驱动（定缺/出牌/碰杠胡/过）
import fs from 'node:fs'
let src = fs.readFileSync(new URL('./sim.js', import.meta.url), 'utf8')
const marker = 'let games = 0'
let core = src.slice(0, src.indexOf(marker))
core = core.replace("type: 'bot',", "type: i === 0 ? 'human' : 'bot',")

const driver = `
const queue2 = []
timer = { timeout(cb) { queue2.push(cb); return () => {} } }

function humanAct() {
  const g = game
  if (!g || g.phase !== 'playing') return
  if (g.pending && g.pending.type === 'dique' && g.pending.seat === 0) {
    declareDique(0, chooseDique(0))
    return true
  }
  if (g.pending && g.pending.type === 'claim') {
    const mine = g.pending.claims.find(c => c.seat === 0)
    if (mine) {
      if (mine.kinds.indexOf('hu') >= 0) {
        const tile = g.pending.tile
        applyHu(0, tile, 'discard', {})
        const rest = g.pending.claims.filter(c => c.seat !== 0 && c.kinds.indexOf('hu') >= 0).map(c => c.seat)
        g.pending = null
        if (g.phase === 'playing') for (const seat of rest) { if (g.phase !== 'playing') break; applyHu(seat, tile, 'discard', {}) }
        return true
      }
      if (mine.kinds.indexOf('gang') >= 0) { const d = g.pending.discarder; const t = g.pending.tile; g.pending = null; applyGang(0, 'zhigang', t, d); return true }
      if (mine.kinds.indexOf('peng') >= 0 && wantPeng(0, g.pending.tile)) { const t = g.pending.tile; g.pending = null; applyPeng(0, t); return true }
      g.pending.claims = g.pending.claims.filter(c => c.seat !== 0)
      if (g.pending.claims.length) resolveClaims()
      else { const d = g.pending.discarder; g.pending = null; advanceTurn(d) }
      return true
    }
    return false
  }
  if (g.pending && g.pending.type === 'drawOptions' && g.pending.seat === 0) {
    const opts = g.pending.options
    const s = g.seats[0]
    if (opts.indexOf('hu') >= 0) { g.pending = null; applyHu(0, s.drawnTile, 'selfdraw', {}); return true }
    if (opts.indexOf('angang') >= 0) { const four = Object.keys(countTiles(s.hand)).find(k => countTiles(s.hand)[k] === 4); g.pending = null; applyGang(0, 'angang', four); return true }
    if (opts.indexOf('bugang') >= 0) { const m = s.melds.find(m2 => m2.kind === 'peng' && countTiles(s.hand)[m2.tiles[0]] >= 1); g.pending = null; applyGang(0, 'bugang', m.tiles[0]); return true }
    g.pending = null
    return true
  }
  if (g.turn === 0 && !g.seats[0].hu) {
    const t = totalTiles(0)
    const gangs = g.seats[0].melds.filter(m => m.kind !== 'peng').length
    if (t >= 14 + gangs) {
      const tile = chooseDiscard(0)
      return discard(0, tile, false)
    }
  }
  return false
}

function pumpHuman() {
  let guard = 0
  while (game.phase !== 'finished' && guard < 300000) {
    if (queue2.length) { queue2.shift()(); guard++; continue }
    if (humanAct()) { guard++; continue }
    tick()
    guard++
  }
  if (game.phase !== 'finished') throw new Error('未结束（人类路径超限）')
}

let games = 0
for (let seed = 1; seed <= 150; seed++) {
  newGame(1, seed)
  try {
    pumpHuman()
    checkInvariants(seed)
  } catch (e) {
    console.log('❌ seed', seed, e.message)
    console.log('  events:', JSON.stringify(game.events.slice(-8)))
    process.exit(1)
  }
  games++
}
console.log('✅ 人类路径 150 局模拟全部通过')
`
eval(core + driver)
