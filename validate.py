#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
REQUIRED = [
    "README.md",
    "SKILL.md",
    "SECURITY.md",
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


def project_files():
    ignored = {".git", "node_modules", "outputs", "dist", "tmp", "__pycache__"}
    for path in ROOT.rglob("*"):
        if any(part in ignored for part in path.relative_to(ROOT).parts):
            continue
        yield path


def main() -> None:
    for rel in REQUIRED:
        if not (ROOT / rel).exists():
            fail(f"missing {rel}")

    manifest = json.loads((ROOT / "source" / "manifest.json").read_text(encoding="utf-8"))
    if manifest.get("name") != "heige-image-cards":
        fail("manifest name mismatch")

    for path in project_files():
        if path.is_symlink():
            fail(f"symlink found {path.relative_to(ROOT)}")

    text_files = [
        path
        for path in project_files()
        if path.is_file() and path.suffix in {".md", ".html", ".json", ".py", ".mjs"}
    ]
    em_dash = chr(0x2014)
    for path in text_files:
        text = path.read_text(encoding="utf-8")
        if em_dash in text:
            fail(f"em dash found in {path.relative_to(ROOT)}")

    for path in (ROOT / "templates").glob("*.html"):
        text = path.read_text(encoding="utf-8")
        if "http://" in text or "https://" in text:
            fail(f"remote resource found in template {path.relative_to(ROOT)}")

    render_script = (ROOT / "scripts" / "render-static-cards.mjs").read_text(encoding="utf-8")
    security_markers = [
        "HEIGE_ALLOW_EXTERNAL_PATHS",
        "assertInsideRoot",
        "sanitizeFilePart",
        "javaScriptEnabled: false",
        "blockedbyclient",
        "pathToFileURL",
    ]
    for marker in security_markers:
        if marker not in render_script:
            fail(f"render security marker missing {marker}")

    package = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
    scripts = package.get("scripts", {})
    dangerous_terms = ["curl ", "wget ", "bash -c", "e" + "val "]
    for name, script in scripts.items():
        if any(term in script for term in dangerous_terms):
            fail(f"dangerous package script {name}")

    adapters = ROOT / "adapters"
    expected_adapters = [
        "claude-code/heige-image-cards/SKILL.md",
        "claude-code/heige-image-cards/SECURITY.md",
        "claude-code/heige-image-cards/package.json",
        "claude-code/heige-image-cards/package-lock.json",
        "codex/heige-image-cards/AGENTS.md",
        "codex/heige-image-cards/SECURITY.md",
        "codex/heige-image-cards/package.json",
        "codex/heige-image-cards/package-lock.json",
        "openclaw/heige-image-cards/openclaw.json",
        "openclaw/heige-image-cards/SECURITY.md",
        "openclaw/heige-image-cards/package.json",
        "openclaw/heige-image-cards/package-lock.json",
        "hermes/heige-image-cards/manifest.json",
        "hermes/heige-image-cards/SECURITY.md",
        "hermes/heige-image-cards/package.json",
        "hermes/heige-image-cards/package-lock.json",
        "prompt/heige-image-cards.md",
    ]
    if adapters.exists():
        for rel in expected_adapters:
            if not (adapters / rel).exists():
                fail(f"missing adapter {rel}")

    print("validate ok")


if __name__ == "__main__":
    main()
