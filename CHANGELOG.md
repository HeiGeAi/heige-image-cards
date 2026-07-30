# Changelog

## v1.0.2

- 声明并锁定 `playwright-core`，让默认渲染命令可复现。
- 适配包携带相同的依赖、锁文件和 Node.js 18 最低版本。
- 增加真实 PNG、路径边界、软链接和原子输出回归测试。

## v1.0.1

- 加固静态渲染脚本，默认只读取项目内 HTML 并输出到项目内目录。
- 渲染时关闭页面 JavaScript，并拦截远程 `http` 和 `https` 资源。
- 清洗 `.card` 节点 id 后再生成 PNG 文件名。
- 新增 `SECURITY.md`，并让各平台适配包携带安全说明。
- 校验器新增软链接、远程模板资源和渲染安全标记检查。

## v1.0.0

- 首次发布。
- 新增黑哥图片卡片锻造方法论。
- 新增静态 HTML 到 PNG 渲染流程。
- 新增 Claude Code、Codex、OpenClaw、Hermes 和通用 Prompt 适配包生成。
- 新增「codex 防降智的邪修用法」示例预览。
