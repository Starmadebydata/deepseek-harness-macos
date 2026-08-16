# DeepSeek Harness macOS 客户端

当前版本：**0.3.0** · [版本更新日志](CHANGELOG.md)

这是官方 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI 的轻量原生 macOS 外壳。

它把本地 Harness 服务变成一个普通 Mac 应用：双击启动，在独立窗口中使用，并自动启动或连接本机的 `dsh`。

> 这是社区项目，与 DeepSeek 没有隶属、授权或官方维护关系。

## 应用截图

![DeepSeek Harness macOS 客户端模型服务设置](docs/images/deepseek-harness-macos.png)

## 功能

- 原生 SwiftUI 窗口，内嵌完整 Harness 界面
- 自动连接 `127.0.0.1:3080` 上已经运行的 Harness
- 没有现成服务时，自动启动本机安装的 `dsh`
- 退出应用时，同时关闭本机的 `dsh` web 服务
- 沿用 Harness 原有的工作区、会话、模型和凭据存储
- 主界面中的普通外部链接交给默认浏览器打开
- 右栏提供真正内嵌的浏览器，支持地址访问、前进、后退和刷新
- 右栏提供从当前工作区启动的终端
- 右栏宽度会在重启后自动保持
- 右栏内置媒体播放器，可播放本地 MP3 音频与 MP4 视频
- 在媒体页粘贴 Spotify 分享链接，于右栏浏览器打开对应单曲、专辑、歌单或播客页面
- 右栏内置电子书阅读器，可导入并阅读本地 EPUB 与 PDF 电子书
- 右栏「抖音」页以手机外框样式展示抖音网页版播放器
- 可在「设置 → 通用」中选择右侧辅助栏要显示的标签页
- 支持当前 Harness 版本提供的模型服务与自定义接口

## 环境要求

- macOS 14 或更高版本
- Apple 芯片 Mac
- Xcode Command Line Tools 或 Xcode，包含 Swift 5.10 或更高版本
- Node.js 22.19 或更高版本
- 已安装 DeepSeek Harness：

```bash
npm install -g @deepseek-ai/dsh
```

## 构建和运行

```bash
git clone https://github.com/Starmadebydata/deepseek-harness-macos.git
cd deepseek-harness-macos
./script/build_and_run.sh
```

正常启动命令会同时把仓库内置的右栏插件安装到本机 Harness 的 `web` 配置中。如果该配置尚未生成，请先运行一次 `dsh web`，停止后再重新执行上面的命令。

生成的应用位于：

```text
dist/DeepSeek Harness.app
```

只构建、不启动：

```bash
./script/build_and_run.sh --build
```

只安装或更新右栏插件：

```bash
./script/build_and_run.sh --install-plugin
```

运行测试：

```bash
swift test
```

## 模型服务

模型配置仍由 DeepSeek Harness 管理。打开“设置 → 模型”，可以配置内置服务或添加自定义接口。API 密钥由 Harness 保存，不会写入本仓库。

## 多功能右栏

仓库内置的 `dsh-right-sidebar` 插件提供会话搜索、最近文件、会话概览、内置浏览器和工作区终端。安装脚本只会补充该插件所需的本地 `web` 配置，不会读取或复制 API 密钥。

终端命令只在用户主动输入后运行，权限与当前 Mac 用户一致。

## 工作方式

应用启动时检查 `http://127.0.0.1:3080`：

1. 如果 Harness 已经运行，应用直接连接并接管其生命周期。
2. 如果没有运行，应用寻找本机 `dsh`，并启动本地服务。
3. 退出时，本机的 `dsh` web 服务会一并关闭。

版本历史见 [CHANGELOG.md](CHANGELOG.md)。

## 分发说明

本机构建使用本地签名，适合开发和个人使用。公开分发安装包需要 Apple Developer ID 证书并通过苹果公证。

## 开源协议

本项目采用 [MIT License](LICENSE)。DeepSeek Harness 是独立项目，使用其自己的协议与商标。
