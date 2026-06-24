# 安全说明

heige-image-cards 默认面向本地可信内容生产。它会读取项目内的 Markdown、HTML、模板和图片，再用浏览器截图导出 PNG。

## 默认安全边界

- 默认只渲染项目目录内的 `.html` 和 `.htm` 文件。
- 默认只把 PNG 输出到项目目录内。
- 渲染时关闭页面 JavaScript。
- 渲染时拦截 `http` 和 `https` 远程资源。
- 截图文件名会先做白名单清洗，避免 HTML 节点 id 影响输出路径。
- 校验器会拒绝软链接，避免安装包里藏路径跳转。
- 模板文件不得依赖远程资源。

## 可信外部文件

如果你确实要渲染项目外的本地 HTML，先确认这个 HTML 来源可信，再显式打开开关：

```bash
HEIGE_ALLOW_EXTERNAL_PATHS=1 node scripts/render-static-cards.mjs /absolute/path/cards.html /absolute/path/output
```

不建议对群聊、邮件、网页下载、陌生仓库里的 HTML 直接打开这个开关。

## 安装前检查

安装到 Claude Code、Codex、OpenClaw 或其它 agent 工具前，建议先运行：

```bash
python3 build.py
python3 validate.py
```

如果本机安装了 skill-vetter，也可以运行：

```bash
bash ~/.codex/skills/skill-vetter/scripts/vett.sh /path/to/heige-image-cards
```

只有在检查通过后再安装。

## 不收集信息

本项目没有后端服务，没有遥测，没有 API key 配置，也不会主动上传生成内容。
