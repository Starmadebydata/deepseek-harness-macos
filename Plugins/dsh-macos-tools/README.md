# dsh-macos-tools 0.1.0

DeepSeek Harness 的 macOS 原生工具集插件（宿主插件，零依赖）。

给 Agent 注册一组直接调用 macOS 系统能力的模型工具，让 Agent 不用猜 `osascript` 语法就能完成常见 Mac 操作：

| 工具 | 作用 |
|---|---|
| `macos_open_path` | 用默认应用打开文件/文件夹，或 `reveal` 在 Finder 中显示 |
| `macos_open_url` | 用默认浏览器打开网址（自动补 `https://`） |
| `macos_clipboard_get` | 读取剪贴板文本 |
| `macos_clipboard_set` | 写入剪贴板文本 |
| `macos_notify` | 发送系统通知（可带提示音） |
| `macos_speak` | 系统语音朗读（`say`，可选语音与语速） |
| `macos_music` | 控制 Apple Music：播放/暂停/切歌/停止，或查询当前曲目 |
| `macos_screenshot` | 截取整个屏幕或指定显示器为 PNG |
| `macos_volume` | 查询/设置系统输出音量 |
| `macos_app` | 启动、激活或退出应用（按名字/包 ID/路径） |

工具注册在全局 tools 层，所有会话的 Agent 都能看到并调用。

## 安装

在仓库根目录运行：

```bash
./script/build_and_run.sh --install-plugin
```

脚本会把插件软链到 `$DSH_HOME/profiles/node_modules/`，并向 web profile 的
`package.json` 与 `cordis.patch.yml` 写入标记区块（重复执行安全）。
改完插件代码后需要重启 `dsh web`（或重开 App）才生效。

## 安全设计

- 所有命令用 `execFile` 传参数数组，不经 shell，免疫注入；
- 路径统一规范化（`~` 展开、相对路径按工作区解析），不存在的路径直接报错；
- 剪贴板/朗读/通知文本有长度上限；
- 截图默认写入系统临时目录，不覆盖用户文件；
- 工具权限与当前 Mac 用户一致，等同该用户执行 `open` / `osascript` 等命令。

## 已知限制

- 截图需要 macOS「屏幕录制」权限（系统设置 → 隐私与安全性 → 屏幕录制）；
- 通知横幅来自 `osascript`，需要系统允许脚本发送通知；
- 若本机用「音乐」旧版（iTunes），`macos_music` 需把脚本里的 `Music` 改成 `iTunes`。
