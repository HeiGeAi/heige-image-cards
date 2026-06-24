#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
REQUIRED = [
    "README.md",
    "SKILL.md",
    "source/manifest.json",
    "references/content-workflow.md",
    "references/heige-visual-system.md",
    "references/card-templates.md",
    "references/static-rendering.md",
    "references/qa-checklist.md",
    "templates/static-card.html",
    "templates/two-card-tutorial.md",
    "scripts/render-static-cards.mjs",
]


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    sys.exit(1)


def main() -> None:
    for rel in REQUIRED:
        if not (ROOT / rel).exists():
            fail(f"missing {rel}")

    manifest = json.loads((ROOT / "source" / "manifest.json").read_text(encoding="utf-8"))
    if manifest.get("name") != "heige-image-cards":
        fail("manifest name mismatch")

    text_files = [
        path
        for path in ROOT.rglob("*")
        if path.is_file() and path.suffix in {".md", ".html", ".json", ".py", ".mjs"}
    ]
    em_dash = chr(0x2014)
    for path in text_files:
        text = path.read_text(encoding="utf-8")
        if em_dash in text:
            fail(f"em dash found in {path.relative_to(ROOT)}")

    adapters = ROOT / "adapters"
    expected_adapters = [
        "claude-code/heige-image-cards/SKILL.md",
        "codex/heige-image-cards/AGENTS.md",
        "openclaw/heige-image-cards/openclaw.json",
        "hermes/heige-image-cards/manifest.json",
        "prompt/heige-image-cards.md",
    ]
    if adapters.exists():
        for rel in expected_adapters:
            if not (adapters / rel).exists():
                fail(f"missing adapter {rel}")

    print("validate ok")


if __name__ == "__main__":
    main()
