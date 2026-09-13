# Changelog

## v1.0.3

- 渲染脚本的相对路径按调用者当前工作目录解析，与常规 CLI 一致，并删除了从未生效的 fallback 参数。
- 输出目录的 realpath 校验提前到临时 PNG 写入之前，并在 rename 前复查，关闭 TOCTOU 窗口。
- 渲染时拦截项目根目录之外的 `file://` 子资源。
- 测试夹具全部迁入系统临时目录，测试中断不会再往工作树残留软链接。
- 版本断言改为以 `source/manifest.json` 为单一真相源，覆盖 package.json、四个适配包、SKILL.md 和 README badge。
- 统一 README.md 与 INSTALL.md 的 Hermes 安装路径，并把 INSTALL.md 纳入文档断言。
- SKILL.md 与静态渲染参考改为直接调用共享渲染脚本，移除指向不存在的 render.mjs 的指引。
- INSTALL.md 与 SECURITY.md 明示 `PLAYWRIGHT_PATH` 和 `CHROME_PATH` 是代码执行级开关。
- validate.py 的危险命令检测改用词边界正则，并注明它只是人工复核提醒。
- README.md 项目结构图补全 tests/、evals/、docs/ 等缺失目录。

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
