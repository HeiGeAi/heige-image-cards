#!/usr/bin/env python3
from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
ADAPTERS = ROOT / "adapters"

COMMON_DIRS = ["references", "templates", "examples", "scripts", "assets", "docs"]


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def copy_tree(src: Path, dst: Path) -> None:
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def copy_common(dst: Path) -> None:
    for dirname in COMMON_DIRS:
        src = ROOT / dirname
        if src.exists():
            copy_tree(src, dst / dirname)


def build_claude(skill: str) -> None:
    target = ADAPTERS / "claude-code" / "heige-image-cards"
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    write_text(target / "SKILL.md", skill)
    copy_common(target)


def build_codex(skill: str) -> None:
    target = ADAPTERS / "codex" / "heige-image-cards"
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    agents = f"""# heige-image-cards for Codex

以下规则来自 heige-image-cards。用于把内容锻造成黑哥 Ai 图片卡片。

{skill}
"""
    write_text(target / "AGENTS.md", agents)
    write_text(target / "SKILL.md", skill)
    copy_common(target)


def build_openclaw(skill: str, manifest: dict) -> None:
    target = ADAPTERS / "openclaw" / "heige-image-cards"
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    write_text(target / "SKILL.md", skill)
    write_text(
        target / "openclaw.json",
        json.dumps(
            {
                "name": manifest["name"],
                "description": manifest["description"],
                "entry": "SKILL.md",
                "version": manifest["version"],
                "tags": manifest["tags"],
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
    )
    copy_common(target)


def build_hermes(skill: str, manifest: dict) -> None:
    target = ADAPTERS / "hermes" / "heige-image-cards"
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    write_text(target / "skill.md", skill)
    write_text(
        target / "manifest.json",
        json.dumps(
            {
                "name": manifest["name"],
                "description": manifest["description"],
                "version": manifest["version"],
                "entry": "skill.md",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
    )
    copy_common(target)


def build_prompt(skill: str) -> None:
    target = ADAPTERS / "prompt"
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True)
    prompt = f"""# heige-image-cards 通用 Prompt

把下面内容作为 system prompt 或项目规则使用。

{skill}
"""
    write_text(target / "heige-image-cards.md", prompt)


def main() -> None:
    manifest = json.loads(read_text(ROOT / "source" / "manifest.json"))
    skill = read_text(ROOT / "SKILL.md")
    if ADAPTERS.exists():
        shutil.rmtree(ADAPTERS)
    ADAPTERS.mkdir()
    build_claude(skill)
    build_codex(skill)
    build_openclaw(skill, manifest)
    build_hermes(skill, manifest)
    build_prompt(skill)
    print("built adapters")


if __name__ == "__main__":
    main()
