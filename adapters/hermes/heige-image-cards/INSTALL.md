# 安装与使用

## 获取项目

```bash
git clone https://github.com/HeiGeAi/heige-image-cards.git
cd heige-image-cards
npm ci --ignore-scripts
python3 build.py
python3 validate.py
```

## Claude Code

```bash
cp -R adapters/claude-code/heige-image-cards ~/.claude/skills/
cd ~/.claude/skills/heige-image-cards && npm ci --ignore-scripts
```

新开会话后直接说：

```text
用 heige-image-cards，把这段内容做成２张黑哥 Ai 图卡。
```

## Codex

把完整 Codex 适配版安装到本机，保留渲染脚本和锁定依赖：

```bash
mkdir -p ~/.codex/skills
cp -R adapters/codex/heige-image-cards ~/.codex/skills/
cd ~/.codex/skills/heige-image-cards && npm ci --ignore-scripts
```

需要项目级常驻规则时，再把适配目录中的 `AGENTS.md` 合并进当前项目。

## OpenClaw

```bash
cp -R adapters/openclaw/heige-image-cards ~/.openclaw/skills/
cd ~/.openclaw/skills/heige-image-cards && npm ci --ignore-scripts
```

## Hermes

先复制完整适配目录并安装锁定依赖，再使用其中的 `skill.md` 和 `manifest.json` 加载技能定义：

```bash
cp -R adapters/hermes/heige-image-cards ./heige-image-cards-hermes
cd ./heige-image-cards-hermes && npm ci --ignore-scripts
```

## Cursor、Windsurf、Cline、Aider

把 `SKILL.md` 和 `references/` 作为项目规则或自定义指令导入。核心方法不绑定某个运行时。

## 直接渲染 HTML 卡片

```bash
node scripts/render-static-cards.mjs templates/static-card.html outputs
```

默认只渲染项目目录内的 HTML，并输出到项目目录内。确实要处理可信外部文件时，先确认来源，再显式开启：

```bash
HEIGE_ALLOW_EXTERNAL_PATHS=1 node scripts/render-static-cards.mjs /absolute/path/cards.html /absolute/path/output
```

如果 Playwright 没有默认浏览器，可以指定系统 Chrome：

```bash
npx playwright-core install chromium
```

也可以直接指定已经安装的系统 Chrome：

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
PLAYWRIGHT_PATH="/path/to/playwright/index.js" \
node scripts/render-static-cards.mjs templates/static-card.html outputs
```
