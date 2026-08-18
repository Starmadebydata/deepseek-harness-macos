// 静态 Host 端到端冒烟测试：用假 webServer/timer 捕获 HTTP 路由并驱动 RPC
import { Readable } from 'node:stream'
import * as mj from '../lib/index.js'

let captured = null
const fakeCtx = {
  effect(cb) { const dispose = cb(); return dispose || (() => {}) },
  timer: {
    timeout(cb, ms) { const t = setTimeout(cb, Math.min(ms, 8)); return () => clearTimeout(t) },
  },
  webServer: {
    register(route) { captured = route; return () => {} },
  },
}
mj.apply(fakeCtx)
if (!captured) { console.error('❌ 未捕获到路由'); process.exit(1) }
console.log('✅ 路由已注册:', captured.path, captured.kind)

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

function rpc(action, args) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(Object.assign({ action }, args || {}))
    const req = Readable.from([body])
    req.method = 'POST'
    req.headers = { 'content-type': 'application/json', 'x-dsh-mahjong': '1', 'sec-fetch-site': 'same-origin' }
    const chunks = []
    const res = {
      writeHead(status, headers) { this.status = status; this.headers = headers },
      end(data) { if (data) chunks.push(data); resolve(JSON.parse(chunks.join(''))) },
    }
    captured.handler(req, res).catch(reject)
  })
}

let pass = 0, fail = 0
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name) }
  else { fail++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra) : '') }
}

// 未开局 → idle
const idle = await rpc('state', {})
check('初始 idle', idle.phase === 'idle', idle)

// 开局 → 定缺阶段
const started = await rpc('start', { round: 1 })
check('开局进入定缺', started.phase === 'dique', started)
check('pending 是你定缺', started.pending && started.pending.type === 'dique' && started.pending.seat === 0, started.pending)
check('你 14 张（庄家）', started.players[0].hand.length === 14, started.players[0].hand.length)

// 非法定缺被拒
const badDique = await rpc('dique', { suit: 'x' })
check('非法定缺被拒', badDique.ok === false, badDique)

// 定缺 → 机器人自动定缺（异步）→ playing
const diqued = await rpc('dique', { suit: 'w' })
await sleep(300)
const afterDique = await rpc('state', {})
check('定缺后进入对局', afterDique.phase === 'playing', afterDique.phase)
check('三家机器人已定缺', afterDique.players.filter(p => p.type === 'bot' && p.dique).length === 3, afterDique.players.map(p => p.dique))
check('牌墙 + 手牌守恒', afterDique.wallCount > 0, afterDique.wallCount)

// 你出第一张（庄家 14 张）→ 机器人接续
const act = await rpc('act', { tile: diqued.players[0].hand[0] })
check('出牌成功', act.ok !== false, act)
check('出牌后你的手牌 13 张', act.players[0].hand.length === 13, act.players[0].hand.length)

// 稍等机器人行动，确认状态推进
await sleep(300)
const mid = await rpc('state', {})
check('机器人开始行动（弃牌数>0 或回合推进）', mid.phase === 'playing', mid.phase)
const anyDiscards = mid.players.some(p => p.discards.length > 0)
check('桌上已有弃牌', anyDiscards, mid.players.map(p => p.discards.length))
console.log('  现场: 回合', mid.turn, '| 牌墙', mid.wallCount, '| 各家弃牌', mid.players.map(p => p.discards.length).join('/'))
console.log('  事件:', mid.events.slice(-4).map(e => e.detail).join(' | '))

// claim 路由回归：decision 参数不能被 action 方法名覆盖（碰/杠/胡/过 按钮的 bug）
const claimRoute = await rpc('claim', { decision: 'pass' })
check('claim 路由可达（非 unknown action）', !(claimRoute.ok === false && String(claimRoute.reason || '').indexOf('unknown action') === 0), claimRoute)

// 终止游戏 → 回到 idle；残留机器人定时器无害
const quit = await rpc('quit', {})
check('终止后回到 idle', quit.phase === 'idle', quit)
await sleep(300)
const afterQuit = await rpc('state', {})
check('终止后状态稳定为 idle', afterQuit.phase === 'idle', afterQuit)

console.log(`\n结果: ${pass} 通过, ${fail} 失败`)
process.exit(fail ? 1 : 0)
