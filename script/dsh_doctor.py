#!/usr/bin/env python3
"""Repair and validate local DeepSeek Harness (dsh) model/provider config.

This guards against the failure modes we hit in production use:
- custom gateways occupying the official `deepseek` provider id
- TokenRhythm keys overwriting DEEPSEEK_API_KEY
- missing OpenCode provider registration
- dsh-model-router silently overriding the user-selected model
- default model pointing at an unusable/custom provider
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    print("需要 PyYAML：python3 -m pip install pyyaml", file=sys.stderr)
    sys.exit(2)


DSH_HOME = Path.home() / ".dsh"
SETTINGS = DSH_HOME / "settings.yaml"
CREDENTIALS = DSH_HOME / ".credentials.yaml"
PATCH = DSH_HOME / "profiles" / "web" / "cordis.patch.yml"

OFFICIAL_DEFAULT = {
    "provider": "deepseek-official",
    "model": "deepseek-v4-pro",
    "reasoningEffort": "high",
}

REQUIRED_PROVIDERS = {
    "kimi-coding": {
        "apiKeyEnv": "KIMI_CODING_API_KEY",
        "models": [
            {"id": "k3", "name": "Kimi K3", "contextWindow": 1048576, "maxTokens": 131072},
            {"id": "k3-256k", "name": "Kimi K3-256K", "contextWindow": 262144, "maxTokens": 131072},
        ],
    },
    "opencode-go": {
        "apiKeyEnv": "OPENCODE_API_KEY",
        "models": [
            {"id": "deepseek-v4-flash", "name": "DeepSeek V4 Flash", "contextWindow": 1000000, "maxTokens": 384000},
            {"id": "deepseek-v4-pro", "name": "DeepSeek V4 Pro", "contextWindow": 1000000, "maxTokens": 384000},
            {"id": "glm-5.2", "name": "GLM-5.2", "contextWindow": 1000000, "maxTokens": 131072},
            {"id": "hy3", "name": "Hy3", "contextWindow": 256000, "maxTokens": 64000},
            {"id": "kimi-k3", "name": "Kimi K3 (2x usage)", "contextWindow": 1048576, "maxTokens": 131072},
            {"id": "grok-4.5", "name": "Grok 4.5", "contextWindow": 500000, "maxTokens": 500000},
        ],
    },
}


def load_credentials(path: Path) -> dict[str, str]:
    vals: dict[str, str] = {}
    if not path.exists():
        return vals
    for line in path.read_text().splitlines():
        if not line.strip() or ":" not in line or line.lstrip().startswith("#"):
            continue
        key, value = line.split(":", 1)
        vals[key.strip()] = value.strip().strip('"').strip("'")
    return vals


def write_credentials(path: Path, vals: dict[str, str]) -> None:
    order = [
        "DEEPSEEK_API_KEY",
        "KIMI_CODING_API_KEY",
        "OPENCODE_API_KEY",
        "OPENCODE_GO_API_KEY",
        "TOKENRHYTHM_API_KEY",
    ]
    lines: list[str] = []
    seen: set[str] = set()
    for key in order:
        if vals.get(key):
            lines.append(f"{key}: {vals[key]}")
            seen.add(key)
    for key, value in vals.items():
        if key not in seen and value:
            lines.append(f"{key}: {value}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + ("\n" if lines else ""))


def check_and_fix(*, fix: bool) -> list[str]:
    problems: list[str] = []
    actions: list[str] = []

    if not SETTINGS.exists():
        problems.append(f"缺少配置文件：{SETTINGS}")
        return problems

    settings = yaml.safe_load(SETTINGS.read_text()) or {}
    providers = ((settings.get("llm-pi-ai") or {}).get("providers")) or {}
    default = settings.get("agent-default-model") or {}
    creds = load_credentials(CREDENTIALS)
    patch = PATCH.read_text() if PATCH.exists() else ""

    # 1) Official DeepSeek key must not be a TokenRhythm key.
    deepseek_key = creds.get("DEEPSEEK_API_KEY", "")
    if deepseek_key.startswith("sk_tr_"):
        msg = "DEEPSEEK_API_KEY 目前是 TokenRhythm 钥匙，官方 DeepSeek 通道会认证失败"
        problems.append(msg)
        if fix:
            creds["TOKENRHYTHM_API_KEY"] = deepseek_key
            # Keep the bad value out of the official slot; user must paste official key if absent.
            # If an older non-tr key is unavailable, clear and report.
            del creds["DEEPSEEK_API_KEY"]
            actions.append("已把 TokenRhythm 钥匙移到 TOKENRHYTHM_API_KEY，并清空被占用的 DEEPSEEK_API_KEY")

    # 2) Alias OpenCode credential names.
    if creds.get("OPENCODE_GO_API_KEY") and not creds.get("OPENCODE_API_KEY"):
        problems.append("有 OPENCODE_GO_API_KEY，但缺少 OPENCODE_API_KEY（OpenCode 适配器读后者）")
        if fix:
            creds["OPENCODE_API_KEY"] = creds["OPENCODE_GO_API_KEY"]
            actions.append("已把 OPENCODE_GO_API_KEY 同步为 OPENCODE_API_KEY")

    # 3) Provider id collision: never let custom gateway use id `deepseek`.
    if "deepseek" in providers:
        problems.append("llm-pi-ai.providers 里存在 id=deepseek 的自定义项，会和官方通道冲突并搞空模型列表")
        if fix:
            old = providers.pop("deepseek")
            tr = dict(old)
            tr["apiKeyEnv"] = "TOKENRHYTHM_API_KEY"
            tr["api"] = tr.get("api") or "openai-completions"
            if not tr.get("baseURL"):
                tr["baseURL"] = "https://tokenrhythm.studio/v1"
            providers["tokenrhythm"] = tr
            if old.get("apiKeyEnv") == "DEEPSEEK_API_KEY" and creds.get("DEEPSEEK_API_KEY", "").startswith("sk_tr_"):
                creds["TOKENRHYTHM_API_KEY"] = creds["DEEPSEEK_API_KEY"]
            actions.append("已把自定义 deepseek 提供方重命名为 tokenrhythm，并改用独立密钥槽")

    # 4) Ensure required providers exist with correct apiKeyEnv.
    for name, spec in REQUIRED_PROVIDERS.items():
        current = providers.get(name)
        if current is None:
            problems.append(f"缺少提供方 {name}")
            if fix:
                providers[name] = json.loads(json.dumps(spec))
                actions.append(f"已补回提供方 {name}")
            continue
        if current.get("apiKeyEnv") != spec["apiKeyEnv"]:
            problems.append(f"{name}.apiKeyEnv 应为 {spec['apiKeyEnv']}，当前是 {current.get('apiKeyEnv')}")
            if fix:
                current["apiKeyEnv"] = spec["apiKeyEnv"]
                actions.append(f"已修正 {name}.apiKeyEnv")
        if not current.get("models"):
            problems.append(f"{name} 没有 models 列表")
            if fix:
                current["models"] = json.loads(json.dumps(spec["models"]))
                actions.append(f"已补回 {name}.models")

    # 5) tokenrhythm isolation
    tr = providers.get("tokenrhythm")
    if tr is not None:
        if tr.get("apiKeyEnv") != "TOKENRHYTHM_API_KEY":
            problems.append("tokenrhythm 必须使用 TOKENRHYTHM_API_KEY，不能共用 DEEPSEEK_API_KEY")
            if fix:
                tr["apiKeyEnv"] = "TOKENRHYTHM_API_KEY"
                actions.append("已把 tokenrhythm.apiKeyEnv 改为 TOKENRHYTHM_API_KEY")
        if not tr.get("api"):
            problems.append("tokenrhythm 缺少 api 字段，会导致整组 llm-pi-ai 提供方加载失败")
            if fix:
                tr["api"] = "openai-completions"
                actions.append("已为 tokenrhythm 补上 api=openai-completions")
        if not tr.get("baseURL"):
            problems.append("tokenrhythm 缺少 baseURL")
            if fix:
                tr["baseURL"] = "https://tokenrhythm.studio/v1"
                actions.append("已为 tokenrhythm 补上 baseURL")

    # 6) Default model should be official DeepSeek.
    if default.get("provider") != "deepseek-official" or default.get("model") not in {"deepseek-v4-pro", "deepseek-v4-flash"}:
        problems.append(
            f"默认模型不稳：当前 {default.get('provider')}/{default.get('model')}，建议 deepseek-official/deepseek-v4-pro"
        )
        if fix:
            settings["agent-default-model"] = dict(OFFICIAL_DEFAULT)
            actions.append("已把默认模型改回 deepseek-official/deepseek-v4-pro")

    # 7) model-router must stay out of the active patch.
    if PATCH.exists():
        active_router = False
        for raw in patch.splitlines():
            line = raw.strip()
            if line.startswith("#"):
                continue
            if "name: 'dsh-model-router'" in line or 'name: "dsh-model-router"' in line or "name: dsh-model-router" in line:
                active_router = True
                break
        if active_router:
            problems.append("cordis.patch.yml 仍在加载 dsh-model-router（会偷改用户选中的模型）")
            if fix:
                cleaned: list[str] = []
                skip = False
                for raw in patch.splitlines(keepends=True):
                    if "name: 'dsh-model-router'" in raw or 'name: "dsh-model-router"' in raw or "name: dsh-model-router" in raw:
                        # drop this insert item; also drop preceding `- id: model-router` block roughly
                        skip = True
                        # remove previous id line if present in cleaned
                        while cleaned and cleaned[-1].strip() in {"", "- id: model-router"}:
                            cleaned.pop()
                        while cleaned and cleaned[-1].lstrip().startswith("- id: model-router"):
                            cleaned.pop()
                        continue
                    if skip:
                        # skip until next top-level list item under insert or dedent
                        if raw.startswith("    - id:") or raw.startswith("- "):
                            skip = False
                            cleaned.append(raw)
                        elif raw.strip() == "":
                            skip = False
                            cleaned.append(raw)
                        else:
                            continue
                    else:
                        cleaned.append(raw)
                PATCH.write_text("".join(cleaned))
                actions.append("已从 cordis.patch.yml 移除 dsh-model-router")

    if fix:
        settings.setdefault("llm-pi-ai", {})["providers"] = providers
        SETTINGS.write_text(yaml.safe_dump(settings, allow_unicode=True, sort_keys=False))
        write_credentials(CREDENTIALS, creds)

    # Final advisory checks (non-blocking after fix attempt)
    creds_after = load_credentials(CREDENTIALS)
    if not creds_after.get("DEEPSEEK_API_KEY"):
        problems.append("缺少有效的 DEEPSEEK_API_KEY：请在设置 → 模型里重新填入官方 DeepSeek 密钥")
    elif creds_after["DEEPSEEK_API_KEY"].startswith("sk_tr_"):
        problems.append("DEEPSEEK_API_KEY 仍然是 TokenRhythm 钥匙")

    for item in actions:
        print(f"FIX: {item}")

    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate/repair local dsh model provider config")
    parser.add_argument("--fix", action="store_true", help="automatically repair known misconfigurations")
    args = parser.parse_args()

    problems = check_and_fix(fix=args.fix)
    if not problems:
        print("OK: DSH 模型/密钥/路由配置检查通过")
        return 0

    print("PROBLEMS:")
    for problem in problems:
        print(f"- {problem}")
    if not args.fix:
        print("\n可执行：script/dsh_doctor.py --fix")
        return 1
    # After fix, re-run read-only to report residual issues.
    residual = check_and_fix(fix=False)
    if residual:
        print("REMAINING:")
        for problem in residual:
            print(f"- {problem}")
        return 1
    print("OK: 已修复，复检通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
