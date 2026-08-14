#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGIN_DIR="$ROOT_DIR/Plugins/dsh-right-sidebar"
DSH_BASE_DIR="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$DSH_BASE_DIR/profiles/web"
PROFILE_PACKAGE="$PROFILE_DIR/package.json"
PROFILE_PATCH="$PROFILE_DIR/cordis.patch.yml"
PROFILE_MODULES="$DSH_BASE_DIR/profiles/node_modules"

if [[ ! -f "$PROFILE_PACKAGE" || ! -f "$PROFILE_PATCH" ]]; then
  echo "未找到 DeepSeek Harness web profile：$PROFILE_DIR" >&2
  echo "请先运行一次 dsh web，再重新执行此脚本。" >&2
  exit 1
fi

mkdir -p "$PROFILE_MODULES"
if [[ -e "$PROFILE_MODULES/dsh-right-sidebar" && ! -L "$PROFILE_MODULES/dsh-right-sidebar" ]]; then
  echo "目标位置已存在且不是符号链接：$PROFILE_MODULES/dsh-right-sidebar" >&2
  echo "为避免覆盖现有文件，安装已停止。" >&2
  exit 1
fi
ln -sfn "$PLUGIN_DIR" "$PROFILE_MODULES/dsh-right-sidebar"

PROFILE_PACKAGE="$PROFILE_PACKAGE" PLUGIN_DIR="$PLUGIN_DIR" node <<'NODE'
const fs = require("node:fs");
const profilePath = process.env.PROFILE_PACKAGE;
const pluginPath = process.env.PLUGIN_DIR;
const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
profile.dependencies ??= {};
profile.dependencies["dsh-right-sidebar"] = `file:${pluginPath}`;
fs.writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`);
NODE

PROFILE_PATCH="$PROFILE_PATCH" node <<'NODE'
const fs = require("node:fs");
const patchPath = process.env.PROFILE_PATCH;
const begin = "# BEGIN deepseek-harness-macos right-sidebar";
const end = "# END deepseek-harness-macos right-sidebar";
let source = fs.readFileSync(patchPath, "utf8");
source = source.replace(new RegExp(`\\n?${begin}[\\s\\S]*?${end}\\n?`, "g"), "\n").trimEnd();

const rows = [];
if (!/^\s*- id:\s*session-query-sqlite\s*$/m.test(source)) {
  rows.push(`- id: session-query-sqlite
  config:
    path: !!js dshHomePath('session-search.sqlite')
    openAt: first-search`);
}
if (!/name:\s*['\"]?dsh-right-sidebar['\"]?/m.test(source)) {
  rows.push(`- insert:
    - id: right-sidebar
      name: 'dsh-right-sidebar'`);
}
if (rows.length) source += `\n\n${begin}\n${rows.join("\n\n")}\n${end}`;
fs.writeFileSync(patchPath, `${source.trimEnd()}\n`);
NODE

echo "已安装右栏插件：$PLUGIN_DIR"
echo "配置位置：$PROFILE_DIR"
