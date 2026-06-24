# 安装与使用

## 获取项目

```bash
git clone https://github.com/HeiGeAi/heige-image-cards.git
cd heige-image-cards
python3 build.py
python3 validate.py
```

## Claude Code

```bash
cp -R adapters/claude-code/heige-image-cards ~/.claude/skills/
```

新开会话后直接说：

```text
用 heige-image-cards，把这段内容做成２张黑哥 Ai 图卡。
```

## Codex

把 Codex 适配版复制到项目里：

```bash
cp adapters/codex/heige-image-cards/AGENTS.md ./AGENTS.heige-image-cards.md
```

然后把其中内容合并进当前项目的 `AGENTS.md`，或在当前线程里引用它。

## OpenClaw

```bash
cp -R adapters/openclaw/heige-image-cards ~/.openclaw/skills/
```

## Hermes

使用 `adapters/hermes/heige-image-cards/skill.md` 和 `manifest.json` 加载为技能定义。

## Cursor、Windsurf、Cline、Aider

把 `SKILL.md` 和 `references/` 作为项目规则或自定义指令导入。核心方法不绑定某个运行时。

## 直接渲染 HTML 卡片

```bash
node scripts/render-static-cards.mjs templates/static-card.html outputs
```

如果 Playwright 没有默认浏览器，可以指定系统 Chrome：

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
PLAYWRIGHT_PATH="/path/to/playwright/index.js" \
node scripts/render-static-cards.mjs templates/static-card.html outputs
```

