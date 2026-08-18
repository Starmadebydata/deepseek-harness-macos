// 独立验证四川麻将引擎核心算法（与插件 Host 半区代码保持一致）
const SUITS = ['w', 't', 'b']
const ALL_TILES = []
for (const s of SUITS) for (let r = 1; r <= 9; r++) ALL_TILES.push(r + s)
const suitOf = (t) => t[t.length - 1]
const rankOf = (t) => Number(t[0])
const cmp = (a, b) => { const sa = suitOf(a), sb = suitOf(b); if (sa !== sb) return SUITS.indexOf(sa) - SUITS.indexOf(sb); return rankOf(a) - rankOf(b) }
function countTiles(arr) { const m = {}; for (const t of arr) m[t] = (m[t] || 0) + 1; return m }

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
function tingOf(hand13) {
  const out = []
  for (const t of ALL_TILES) if (winType(hand13.concat([t]))) out.push(t)
  return out
}

let pass = 0, fail = 0
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want)
  if (g === w) { pass++; console.log('PASS', name) }
  else { fail++; console.log('FAIL', name, 'got', g, 'want', w) }
}

// 1. 平胡（顺子+对子）
eq('平胡', winType(['1w','2w','3w','4w','5w','6w','7w','8w','9w','1t','1t','2b','3b','4b']), 'standard')
// 2. 非胡（缺对子）
eq('非胡', winType(['1w','2w','3w','4w','5w','6w','7w','8w','9w','1t','2t','3t','2b','3b']), null)
// 3. 七对
eq('七对', winType(['1w','1w','2w','2w','3w','3w','4w','4w','5w','5w','6w','6w','7w','7w']), 'qidui')
// 4. 龙七对
eq('龙七对', winType(['1w','1w','1w','1w','2w','2w','3w','3w','4w','4w','5w','5w','6w','6w']), 'longqidui')
// 5. 对对胡（全碰）
eq('对对胡', winType(['1w','1w','1w','2w','2w','2w','3w','3w','3w','4w','4w','4w','5t','5t']), 'standard')
eq('对对胡判定', isPengPengConcealed(['1w','1w','1w','2w','2w','2w','3w','3w','3w','4w','4w','4w','5t','5t']), true)
// 6. 平胡非对对
eq('平胡非对对', isPengPengConcealed(['1w','2w','3w','4w','5w','6w','7w','8w','9w','1t','1t','2b','3b','4b']), false)
// 7. 听牌：123456789w 11t 23b → 听 1b、4b
eq('听牌1b4b', tingOf(['1w','2w','3w','4w','5w','6w','7w','8w','9w','1t','1t','2b','3b']).sort(), ['1b','4b'])
// 8. 三面听：1122334455667w → 听 1w(标准)/4w(标准)/7w(七对)
eq('七对听', tingOf(['1w','1w','2w','2w','3w','3w','4w','4w','5w','5w','6w','6w','7w']).sort(), ['1w','4w','7w'])
// 9. 边张听：123w 456w 789w 11t 45b → 听 3b、6b
eq('边张听', tingOf(['1w','2w','3w','4w','5w','6w','7w','8w','9w','1t','1t','4b','5b']).sort(), ['3b','6b'])
// 10. 单调将：123w 456w 789w 123t 4b4b? 14张太多 —— 13张: 123w 456w 789w 123t 4b → 听 4b
eq('单调将', tingOf(['1w','2w','3w','4w','5w','6w','7w','8w','9w','1t','2t','3t','4b']), ['4b'])

console.log('\n结果:', pass, '通过,', fail, '失败')
process.exit(fail ? 1 : 0)
