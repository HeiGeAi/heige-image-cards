# 项目清单

## 产品入口

- `README.md`：GitHub 介绍页。
- `SKILL.md`：根技能入口。
- `SECURITY.md`：安全边界和安装前检查。
- `INSTALL.md`：跨平台安装说明。
- `CHANGELOG.md`：版本记录。
- `LICENSE`：MIT 许可证。

## 构建与校验

- `build.py`：生成多 Agent 适配包。
- `validate.py`：检查关键文件、manifest、破折号和 adapters。
- `package.json`：快捷命令。
- `source/manifest.json`：项目元数据。

## 方法论

- `references/content-workflow.md`：黑哥钩子和内容拆解。
- `references/heige-visual-system.md`：视觉系统。
- `references/card-templates.md`：卡片结构。
- `references/static-rendering.md`：静态渲染流程。
- `references/qa-checklist.md`：交付检查。

## 模板与示例

- `templates/static-card.html`：静态卡片 HTML 模板。
- `templates/two-card-tutorial.md`：２ 张教程卡文案模板。
- `templates/black-hook-bank.md`：黑哥钩子库。
- `examples/codex-laogong-card.md`：示例案例。
- `assets/previews/`：README 预览图。

## 运行时适配

`python3 build.py` 会生成：

- `adapters/claude-code/heige-image-cards/`
- `adapters/codex/heige-image-cards/`
- `adapters/openclaw/heige-image-cards/`
- `adapters/hermes/heige-image-cards/`
- `adapters/prompt/heige-image-cards.md`
