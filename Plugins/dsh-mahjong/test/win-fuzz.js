// 胡牌判定交叉验证：winType（引擎实现） vs isWinRef（独立参考实现），构造性+随机模糊测试
const SUITS = ['w', 't', 'b']
const ALL = []
for (const s of SUITS) for (let r = 1; r <= 9; r++) ALL.push(r + s)
const suitOf = t => t[t.length - 1]
const rankOf = t => Number(t[0])
const cmp = (a, b) => { const sa = suitOf(a), sb = suitOf(b); if (sa !== sb) return SUITS.indexOf(sa) - SUITS.indexOf(sb); return rankOf(a) - rankOf(b) }
function countTiles(arr) { const m = {}; for (const t of arr) m[t] = (m[t] || 0) + 1; return m }

// ===== 引擎实现（与 lib/index.js 一致）=====
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

// ===== 独立参考实现：选数量最少的牌，尝试所有包含它的刻/顺 =====
function refMelds(counts) {
  const keys = Object.keys(counts).filter(k => counts[k] > 0)
  if (keys.length === 0) return true
  // 选数量最少的牌（换一种分解顺序，交叉验证）
  let t0 = keys[0]
  for (const k of keys) if (counts[k] < counts[t0]) t0 = k
  const r = rankOf(t0), s = suitOf(t0)
  // 刻子
  if (counts[t0] >= 3) {
    const n = Object.assign({}, counts); n[t0] -= 3; if (n[t0] === 0) delete n[t0]
    if (refMelds(n)) return true
  }
  // 顺子：t0 可以是低位/中位/高位
  const seqs = [[r, r + 1, r + 2], [r - 1, r, r + 1], [r - 2, r - 1, r]]
  for (const seq of seqs) {
    if (seq[0] < 1 || seq[2] > 9) continue
    const tiles = seq.map(x => x + s)
    if (tiles.every(t => counts[t] > 0)) {
      const n = Object.assign({}, counts)
      for (const t of tiles) { n[t]--; if (n[t] === 0) delete n[t] }
      if (refMelds(n)) return true
    }
  }
  return false
}
function isWinRef(full) {
  if (full.length !== 14) return false
  const counts = countTiles(full)
  const keys = Object.keys(counts)
  // 七对
  if (keys.every(k => counts[k] % 2 === 0) && keys.reduce((s, k) => s + counts[k] / 2, 0) === 7) return true
  for (const p of keys) {
    if (counts[p] >= 2) {
      const n = Object.assign({}, counts); n[p] -= 2; if (n[p] === 0) delete n[p]
      if (refMelds(n)) return true
    }
  }
  return false
}

// ===== 测试 =====
let pass = 0, fail = 0
const bad = []
function check(name, got, want, hand) {
  const g = got === null ? false : true
  if (g === want) pass++
  else { fail++; if (bad.length < 5) bad.push({ name, got, want, hand: hand && hand.join(',') }) }
}

// 1) 构造性胡牌：4 组 + 1 对，打乱
function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const rnd = mulberry32(42)
function shuffle(a) { const arr = a.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t } return arr }
function randomSet() {
  const s = SUITS[Math.floor(rnd() * 3)]
  if (rnd() < 0.5) { const r = 1 + Math.floor(rnd() * 9); return [r + s, r + s, r + s] }
  const r = 1 + Math.floor(rnd() * 7); return [r + s, (r + 1) + s, (r + 2) + s]
}
for (let i = 0; i < 20000; i++) {
  const hand = []
  for (let j = 0; j < 4; j++) hand.push(...randomSet())
  const ps = SUITS[Math.floor(rnd() * 3)], pr = 1 + Math.floor(rnd() * 9)
  hand.push(pr + ps, pr + ps)
  const shuffled = shuffle(hand)
  const got = winType(shuffled)
  const want = isWinRef(shuffled)
  check('构造胡牌', got, want, shuffled)
  if (got === null) { fail++; bad.push({ name: '漏判胡牌', hand: shuffled.join(',') }) }
}

// 2) 随机 14 张模糊测试：两个实现必须一致
for (let i = 0; i < 60000; i++) {
  const counts = {}
  let total = 0
  while (total < 14) {
    const t = ALL[Math.floor(rnd() * ALL.length)]
    if ((counts[t] || 0) < 4) { counts[t] = (counts[t] || 0) + 1; total++ }
  }
  const hand = Object.keys(counts).flatMap(t => Array(counts[t]).fill(t))
  const a = winType(hand) !== null
  const b = isWinRef(hand)
  if (a !== b) { fail++; if (bad.length < 8) bad.push({ name: '实现不一致', engine: a, ref: b, hand: hand.sort(cmp).join(',') }) }
  else pass++
}

console.log('结果:', pass, '通过,', fail, '失败')
if (bad.length) { console.log('失败样例:'); for (const b of bad) console.log(' ', JSON.stringify(b)) }
process.exit(fail ? 1 : 0)
