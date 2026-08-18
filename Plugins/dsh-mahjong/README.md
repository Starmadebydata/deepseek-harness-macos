# dsh-mahjong

四川麻将·血战到底插件：人类与 AI 机器人同桌对局，全屏真实麻将桌 UI（木框绿毡、立体厚牌、竖立牌墙、弃牌分区、中央罗盘）。

## 功能

- **完整血战到底规则**：108 张牌（万/筒/条）、定缺（缺一门）、血战到底（三家胡或牌墙摸完）、碰/直杠/暗杠/补杠、刮风下雨计分、点炮胡/自摸/杠上花/一炮多响、查叫赔叫、花猪罚分、番型计算（平胡/对对胡/清一色/七对/龙七对，封顶 4 番）、庄家轮换、多局记分
- **启发式 AI 对手**：自动定缺（选最少门）、按手牌价值选牌、听牌保护（听牌时不拆搭）、碰/杠/胡决策
- **真实麻将桌视觉**：木框 + 绿毡桌面；立体厚牌（底部厚度阴影、翡翠牌背）；筒用标准圆点阵、条用标准竹节图案；左右两家竖立牌墙；弃牌四家分区带随机倾角；中央罗盘显示牌墙/庄家；刚摸的牌分离并高亮
- **手牌分析**：实时显示"缺门未打完 / 未听牌 / 打出 X 可听 Y"，听牌时提示可胡的张
- **回合指示**：当前行动玩家座位金色光环，轮到你时整排手牌呼吸光晕
- **终止游戏**：顶栏"终止游戏"按钮（二次确认）立即结束并返回对话页面

## 安装

仓库的插件安装脚本会把它注册进本机 Harness 的 `web` 配置：

```bash
./script/build_and_run.sh --install-plugin
```

或手动：在 `$DSH_HOME/profiles/web/package.json` 添加 `"dsh-mahjong": "file:<本目录>"`，在 `cordis.patch.yml` 添加插件行，然后 `pnpm install` 并重启 `dsh web`。

入口：会话标题栏或侧边栏底部的「🀄 麻将」按钮。

## 架构

- `lib/index.js` — Host 半区（Cordis 插件）：规则引擎、机器人 AI、回合调度（timer 驱动），通过 `webServer` 暴露 `/dsh-mahjong/rpc` HTTP RPC（start/state/dique/act/claim/quit）
- `lib/client.js` — Client 半区（`__ModuleLoader__` UMD 模块）：`ctx.slots` 注册启动按钮与全屏牌桌，`fetch` 轮询/提交操作

## 测试

```bash
cd Plugins/dsh-mahjong
node test/engine.test.js      # 胡牌判定单元测试（11 例）
node test/sim.js              # 300 局全机器人模拟 + 不变量检查
node test/human-sim.js        # 150 局人类路径模拟
node test/win-fuzz.js         # 8 万例胡牌判定交叉验证（独立参考实现对比）
node test/static-smoke.mjs    # HTTP RPC 端到端冒烟（含 claim 路由回归）
```
