# dsh-right-sidebar 0.2.0

DeepSeek Harness 的可折叠多功能右边栏。

- 搜索：搜索当前会话或全部会话，并可直接跳转。
- 文件：汇总当前消息窗口中出现过的文件路径，并可用系统默认应用打开。
- 概览：显示当前会话的模型预设、权限、轮数、步骤数和上下文占用。
- 浏览器：在 Mac App 右栏中直接打开网页，支持地址访问、前进、后退和刷新。
- 终端：在当前会话工作目录中运行命令，保留目录状态和命令历史。
- 快捷键：`Cmd/Ctrl + Shift + F` 打开或关闭。

插件使用 Harness 原生右侧栏宽度，使界面形成“工作区 / 对话 / 辅助信息”三栏布局。

在本仓库根目录运行以下命令安装或更新插件：

```bash
./script/build_and_run.sh --install-plugin
```

历史搜索依赖 web profile 中的本地全文索引：

```yaml
- id: session-query-sqlite
  config:
    path: !!js dshHomePath('session-search.sqlite')
    openAt: first-search
```
