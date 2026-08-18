#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DSH_BASE_DIR="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$DSH_BASE_DIR/profiles/web"
PROFILE_PACKAGE="$PROFILE_DIR/package.json"
PROFILE_PATCH="$PROFILE_DIR/cordis.patch.yml"
PROFILE_MODULES="$DSH_BASE_DIR/profiles/node_modules"

# 仓库内置插件清单：相对仓库根目录的插件目录 | 标记名（用于 cordis.patch.yml 标记块与行 id）| 额外补丁
# extra: sqlite = 补配会话全文索引（右栏搜索依赖）；none = 无需额外补丁
PLUGINS=(
  "Plugins/dsh-right-sidebar|right-sidebar|sqlite"
  "Plugins/dsh-macos-tools|macos-tools|none"
  "Plugins/dsh-mahjong|dsh-mahjong|none"
)

if [[ ! -f "$PROFILE_PACKAGE" || ! -f "$PROFILE_PATCH" ]]; then
  echo "未找到 DeepSeek Harness web profile：$PROFILE_DIR" >&2
  echo "请先运行一次 dsh web，再重新执行此脚本。" >&2
  exit 1
fi

mkdir -p "$PROFILE_MODULES"

SPEC="["
FIRST=1
for entry in "${PLUGINS[@]}"; do
  IFS='|' read -r REL_DIR MARKER EXTRA <<<"$entry"
  PLUGIN_DIR="$ROOT_DIR/$REL_DIR"
  PLUGIN_NAME="$(basename "$PLUGIN_DIR")"

  if [[ -e "$PROFILE_MODULES/$PLUGIN_NAME" && ! -L "$PROFILE_MODULES/$PLUGIN_NAME" ]]; then
    echo "目标位置已存在且不是符号链接：$PROFILE_MODULES/$PLUGIN_NAME" >&2
    echo "为避免覆盖现有文件，安装已停止。" >&2
    exit 1
  fi
  ln -sfn "$PLUGIN_DIR" "$PROFILE_MODULES/$PLUGIN_NAME"

  if [[ "$FIRST" -eq 1 ]]; then FIRST=0; else SPEC+=","; fi
  SPEC+="{\"name\":\"$PLUGIN_NAME\",\"dir\":\"$PLUGIN_DIR\",\"marker\":\"$MARKER\",\"extra\":\"$EXTRA\"}"
done
SPEC+="]"

PROFILE_PACKAGE="$PROFILE_PACKAGE" PROFILE_PATCH="$PROFILE_PATCH" SPEC="$SPEC" node <<'NODE'
const fs = require("node:fs");
const packagePath = process.env.PROFILE_PACKAGE;
const patchPath = process.env.PROFILE_PATCH;
const plugins = JSON.parse(process.env.SPEC);

// package.json：登记 file: 依赖
const profile = JSON.parse(fs.readFileSync(packagePath, "utf8"));
profile.dependencies ??= {};
for (const p of plugins) profile.dependencies[p.name] = `file:${p.dir}`;
fs.writeFileSync(packagePath, `${JSON.stringify(profile, null, 2)}\n`);

// cordis.patch.yml：每个插件写入自己的标记块（重复执行安全）
let source = fs.readFileSync(patchPath, "utf8");
for (const p of plugins) {
  const begin = `# BEGIN deepseek-harness-macos ${p.marker}`;
  const end = `# END deepseek-harness-macos ${p.marker}`;
  source = source.replace(new RegExp(`\\n?${begin}[\\s\\S]*?${end}\\n?`, "g"), "\n").trimEnd();

  const rows = [];
  if (p.extra === "sqlite" && !/^\s*- id:\s*session-query-sqlite\s*$/m.test(source)) {
    rows.push(`- id: session-query-sqlite
  config:
    path: !!js dshHomePath('session-search.sqlite')
    openAt: first-search`);
  }
  if (!new RegExp(`name:\\s*['\"]?${p.name}['\"]?`, "m").test(source)) {
    rows.push(`- insert:
    - id: ${p.marker}
      name: '${p.name}'`);
  }
  if (rows.length) source += `\n\n${begin}\n${rows.join("\n\n")}\n${end}`;
}
fs.writeFileSync(patchPath, `${source.trimEnd()}\n`);
NODE

echo "已安装插件："
for entry in "${PLUGINS[@]}"; do
  IFS='|' read -r REL_DIR _ _ <<<"$entry"
  echo "  - $ROOT_DIR/$REL_DIR"
done
echo "配置位置：$PROFILE_DIR"
