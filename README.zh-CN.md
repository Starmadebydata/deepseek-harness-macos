# DeepSeek Harness macOS 客户端

这是官方 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web UI 的轻量原生 macOS 外壳。

它把本地 Harness 服务变成一个普通 Mac 应用：双击启动，在独立窗口中使用，并自动启动或连接本机的 `dsh`。

> 这是社区项目，与 DeepSeek 没有隶属、授权或官方维护关系。

## 应用截图

![DeepSeek Harness macOS 客户端模型服务设置](docs/images/deepseek-harness-macos.png)

## 功能

- 原生 SwiftUI 窗口，内嵌完整 Harness 界面
- 自动连接 `127.0.0.1:3080` 上已经运行的 Harness
- 没有现成服务时，自动启动本机安装的 `dsh`
- 退出应用时，只停止由应用自己启动的服务
- 沿用 Harness 原有的工作区、会话、模型和凭据存储
- 外部链接交给默认浏览器打开
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

生成的应用位于：

```text
dist/DeepSeek Harness.app
```

只构建、不启动：

```bash
./script/build_and_run.sh --build
```

运行测试：

```bash
swift test
```

## 模型服务

模型配置仍由 DeepSeek Harness 管理。打开“设置 → 模型”，可以配置内置服务或添加自定义接口。API 密钥由 Harness 保存，不会写入本仓库。

## 工作方式

应用启动时检查 `http://127.0.0.1:3080`：

1. 如果 Harness 已经运行，应用直接连接，不接管现有进程。
2. 如果没有运行，应用寻找本机 `dsh`，并启动本地服务。
3. 退出时，只有应用自己启动的服务会被停止。

## 分发说明

本机构建使用本地签名，适合开发和个人使用。公开分发安装包需要 Apple Developer ID 证书并通过苹果公证。

## 开源协议

本项目采用 [MIT License](LICENSE)。DeepSeek Harness 是独立项目，使用其自己的协议与商标。
