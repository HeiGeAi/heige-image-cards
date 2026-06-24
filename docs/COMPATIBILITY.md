# 平台兼容说明

heige-image-cards 的核心是方法论和静态渲染流程，不绑定某一个 Agent 工具。

## 运行时适配

| 运行时 | 适配入口 | 说明 |
|---|---|---|
| Claude Code | `adapters/claude-code/heige-image-cards/SKILL.md` | 放进用户级 skills 目录后自动触发 |
| Codex | `adapters/codex/heige-image-cards/AGENTS.md` | 合并到项目根 AGENTS.md 或作为项目规则引用 |
| OpenClaw | `adapters/openclaw/heige-image-cards/SKILL.md` | 同时带 `openclaw.json` |
| Hermes | `adapters/hermes/heige-image-cards/skill.md` | 带 `manifest.json` |
| Cursor / Windsurf / Cline | 根 `SKILL.md` 和 `references/` | 作为项目规则导入 |
| Aider | 根 `SKILL.md` 和 `references/` | 作为 repo instruction 使用 |
| ChatGPT / Claude.ai | `adapters/prompt/heige-image-cards.md` | 粘贴为自定义指令 |

## 能力降级

不同平台文件能力不同，按三档处理：

| 档位 | 能力 | 输出 |
|---|---|---|
| 完整文件能力 | 能写 HTML、运行脚本、截图 | 直接交付 PNG |
| 文件写入但不能截图 | 能写 HTML，不能跑浏览器 | 交付 HTML 和渲染命令 |
| 纯聊天 | 不能写文件 | 交付完整 HTML 代码和手动保存步骤 |

## 不变规则

- 黑哥 Ai 署名保持一致。
- 关键中文文字优先静态渲染。
- 不使用动画。
- 不使用破折号。
- 先做梗点，再落方法。

