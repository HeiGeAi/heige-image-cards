# heige-image-cards for Codex

以下规则来自 heige-image-cards。用于把内容锻造成黑哥 Ai 图片卡片。

---
name: heige-image-cards
description: "黑哥专属图片卡片生产技能。用户要做黑哥 AI、小红书图卡、微信贴图、公众号配图、两张图讲清楚、封面图、知识卡、梗图式教程、商业评论卡片、AI 工具教程卡片时，优先使用本技能。它把内容先拆成黑哥式钩子、梗点和可执行信息，再用静态 HTML 渲染或图片生成工具输出 1 到 10 张社交媒体卡片，强调低 AI 味、中文排版、可打印、可复用模板和黑哥 Ai 署名。"
metadata:
  version: 1.0.0
  brand: "黑哥 Ai"
  runtimes: "Claude Code, Codex, OpenClaw, Hermes, Cursor, Windsurf, Cline, Aider"
---

# Heige Image Cards

这是黑哥专属图片卡片技能。它不是 baoyu-image-cards 的换皮版，而是把这次「codex 防降智的邪修用法」验证过的流程固化下来：先找一个能让人停住的梗，再把梗落回真实可用的方法。

## 适用场景

使用本技能处理这些任务：

- 用户要做「黑哥 Ai」署名的社交媒体图卡。
- 用户说「２ 张图讲清楚」「做成小红书图」「封面图」「卡片」「贴图」「知识卡」。
- 用户给一段文章、观点、教程、聊天截图或产品说明，想变成可传播图片。
- 用户希望好玩一点、像人写的、有梗但不是硬搞笑。
- 用户要把黑哥 AI 的商业评论、AI 工具教程、工作流经验做成图片系列。

不适用这些任务：

- 用户只要纯文字文章，不需要图片或卡片。
- 用户要严格仿制某个已有品牌的视觉资产。
- 用户要生成真实照片、复杂插画或角色连续镜头，此时可以结合 imagegen，但仍要先用本技能产出文案和版式规划。

## 核心原则

### １．梗点先行，信息兜底

每组卡片要有一个肉眼可见的传播钩子。钩子可以离谱、反常、好笑，但必须服务于信息。

好例子：

- 「让 AI 叫你老公」表层是梗，底层是上下文在线检测。
- 「老板看不懂 AI 不是他的错」表层是冲突，底层是交付语言不对。

坏例子：

- 只有情绪，没有方法。
- 只有方法，没有第一眼停留理由。

### ２．黑哥账号边界

保持黑哥 AI 的账号气质：把复杂事情翻译给普通人，讲清楚利益、风险、动作和判断。

不要混入其他固定人设。不要写成卡兹克、半佛、０号机房或泛行业报告。

### ３．静态渲染优先

中文图卡最怕文字糊、错字和排版漂移。默认优先走静态 HTML 到 PNG 的流程。

只有在需要真实插画、照片质感、漫画角色或复杂视觉隐喻时，才把 imagegen 当成视觉素材生成器。即便如此，卡片里的关键文字仍建议静态排版。

### ４．可打印，可复查，可迭代

输出 HTML 时不要动画、动态效果、滚动触发、滤镜堆叠或依赖远程资源。所有卡片都要能打开即打印，能截图，能重新渲染。

## 标准工作流

### Step 0：读项目规则

如果当前项目有 AGENTS.md 或用户给了风格约束，先遵守它。尤其注意：

- 中文输出用中文标点。
- 不使用破折号。
- HTML 成品不要动画。
- 黑哥署名使用「黑哥 Ai」。

### Step 1：内容拆解

先写一个 `analysis.md`，包含：

- 主题一句话。
- 目标受众。
- 第一眼钩子。
- 梗点和真实价值之间的关系。
- 卡片张数建议。
- 哪些内容必须保留，哪些内容可以删。

### Step 2：选择卡片结构

默认用 ２ 张图结构：

- 第 １ 张：封面。只负责停住人。
- 第 ２ 张：教程或方法。负责讲清楚怎么做。

内容更复杂时用 ４ 到 ６ 张：

- 第 １ 张：反常识封面。
- 第 ２ 张：问题现场。
- 第 ３ 张：方法拆解。
- 第 ４ 张：示例或对比。
- 第 ５ 张：避坑。
- 第 ６ 张：保存理由或行动清单。

### Step 3：写卡片文案

每张卡只做一个任务。先写标题，再写副标题，再写 １ 到 ３ 个信息块。

文案规则：

- 标题短、狠、口语化。
- 每句话都能被截图转发。
- 少用抽象词，多用场景动作。
- 梗不能盖过方法。
- 不要写「本文将」「以下是」「我们可以看到」这类说明腔。

### Step 4：渲染路线

默认路线：

1. 生成 `card-copy.md`。
2. 生成静态 `cards.html`。
3. 用浏览器截图导出 PNG。
4. 人眼检查两轮。

如果用户明确要 AI 生图质感：

1. 先写 `prompts/NN-card.md`。
2. 用 imagegen 生成视觉底图或插画。
3. 回到静态 HTML 叠加准确中文文字。

### Step 5：质量检查

交付前读 `references/qa-checklist.md`，逐条检查：

- 有没有黑哥 Ai 署名。
- 有没有错字。
- 有没有破折号。
- 有没有文字溢出。
- ３ 秒内能不能看懂主题。
- 梗点是不是服务于方法。
- 打开 HTML 是否静态、可打印。

## 输出目录

建议每个任务输出到：

```text
heige-cards/[topic-slug]/
├── analysis.md
├── card-copy.md
├── cards.html
├── render.mjs
├── 01-cover.png
├── 02-method.png
└── qa.md
```

如果是在 Codex 桌面项目里给用户交付，最终 PNG 和 HTML 放到 `outputs/` 下。

## 需要读取的参考文件

按任务需要读取：

- `references/content-workflow.md`：内容拆解和黑哥式钩子。
- `references/heige-visual-system.md`：视觉风格、字号、颜色、版式。
- `references/card-templates.md`：２ 张图、４ 张图、６ 张图结构。
- `references/static-rendering.md`：HTML 到 PNG 的确定性渲染流程。
- `references/qa-checklist.md`：交付前检查。

## 默认推荐

没有额外要求时，使用：

- 尺寸：１２００ × １６００。
- 张数：２ 张。
- 风格：暖纸底、深墨字、荧光绿重点、黑底梗图气泡。
- 署名：右下角「黑哥 Ai」。
- 渲染：静态 HTML 截图 PNG。

## 跨平台使用方式

本技能不绑定单一 Agent 工具。仓库里的 `build.py` 会生成适配包：

- Claude Code：`adapters/claude-code/heige-image-cards/SKILL.md`。
- Codex：`adapters/codex/heige-image-cards/AGENTS.md`。
- OpenClaw：`adapters/openclaw/heige-image-cards/SKILL.md` 和 `openclaw.json`。
- Hermes：`adapters/hermes/heige-image-cards/skill.md` 和 `manifest.json`。
- 通用 Prompt：`adapters/prompt/heige-image-cards.md`。

如果运行时支持文件读写，就生成 `cards.html` 并截图导出 PNG。如果运行时只支持聊天，就输出完整 HTML 和渲染步骤，让用户复制保存。

