#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"
APP_NAME="DeepSeek Harness"
PROCESS_NAME="DeepSeekHarness"
BUNDLE_ID="com.elliotguo.deepseek-harness"
APP_VERSION="0.3.0"
MIN_SYSTEM_VERSION="14.0"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
APP_BUNDLE="$DIST_DIR/$APP_NAME.app"
APP_CONTENTS="$APP_BUNDLE/Contents"
APP_MACOS="$APP_CONTENTS/MacOS"
APP_RESOURCES="$APP_CONTENTS/Resources"
APP_BINARY="$APP_MACOS/$PROCESS_NAME"
INFO_PLIST="$APP_CONTENTS/Info.plist"
ICON_FILE="$APP_RESOURCES/AppIcon.icns"

if [[ "$MODE" == "--install-plugin" || "$MODE" == "install-plugin" ]]; then
  "$ROOT_DIR/script/install_sidebar_plugin.sh"
  exit 0
fi

pkill -x "$PROCESS_NAME" >/dev/null 2>&1 || true

cd "$ROOT_DIR"
swift build -c release
BUILD_BINARY="$(swift build -c release --show-bin-path)/$PROCESS_NAME"

rm -rf "$APP_BUNDLE"
mkdir -p "$APP_MACOS" "$APP_RESOURCES"
cp "$BUILD_BINARY" "$APP_BINARY"
chmod +x "$APP_BINARY"
cp "$ROOT_DIR/Assets/AppIcon.icns" "$ICON_FILE"

cat >"$INFO_PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>zh_CN</string>
  <key>CFBundleDisplayName</key>
  <string>$APP_NAME</string>
  <key>CFBundleExecutable</key>
  <string>$PROCESS_NAME</string>
  <key>CFBundleIdentifier</key>
  <string>$BUNDLE_ID</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleName</key>
  <string>$APP_NAME</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>$APP_VERSION</string>
  <key>CFBundleVersion</key>
  <string>4</string>
  <key>LSMinimumSystemVersion</key>
  <string>$MIN_SYSTEM_VERSION</string>
  <key>NSHighResolutionCapable</key>
  <true/>
  <key>NSPrincipalClass</key>
  <string>NSApplication</string>
</dict>
</plist>
PLIST

codesign --force --deep --sign - "$APP_BUNDLE" >/dev/null

open_app() {
  /usr/bin/open -n "$APP_BUNDLE"
}

case "$MODE" in
  run)
    "$ROOT_DIR/script/install_sidebar_plugin.sh"
    open_app
    ;;
  --debug|debug)
    "$ROOT_DIR/script/install_sidebar_plugin.sh"
    lldb -- "$APP_BINARY"
    ;;
  --logs|logs)
    "$ROOT_DIR/script/install_sidebar_plugin.sh"
    open_app
    /usr/bin/log stream --info --style compact --predicate "process == \"$PROCESS_NAME\""
    ;;
  --telemetry|telemetry)
    "$ROOT_DIR/script/install_sidebar_plugin.sh"
    open_app
    /usr/bin/log stream --info --style compact --predicate "subsystem == \"$BUNDLE_ID\""
    ;;
  --verify|verify)
    "$ROOT_DIR/script/install_sidebar_plugin.sh"
    open_app
    for _ in {1..20}; do
      if pgrep -x "$PROCESS_NAME" >/dev/null; then
        exit 0
      fi
      sleep 0.25
    done
    echo "$APP_NAME 未能启动" >&2
    exit 1
    ;;
  --build|build)
    echo "$APP_BUNDLE"
    ;;
  *)
    echo "用法：$0 [run|--build|--install-plugin|--debug|--logs|--telemetry|--verify]" >&2
    exit 2
    ;;
esac
