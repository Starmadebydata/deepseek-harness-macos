# Contributing

Contributions are welcome.

1. Fork the repository and create a focused branch.
2. Keep the wrapper independent from the DeepSeek Harness source tree.
3. Do not commit API keys, credentials, user sessions, or generated app bundles.
4. Run `swift test`, the two plugin `node --check` commands, and `./script/build_and_run.sh --build` before opening a pull request.
5. Explain the behavior change and how it was verified.

For bugs, include the macOS version, Mac architecture, `dsh --version`, and clear reproduction steps. Never include secrets in logs or screenshots.
