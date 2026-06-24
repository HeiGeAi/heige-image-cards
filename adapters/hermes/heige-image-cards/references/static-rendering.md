# 静态渲染流程

## 为什么优先静态 HTML

中文图卡的关键价值经常在文字。直接生图容易出现错字、漏字、字形扭曲和布局不可控。

所以默认流程是：

```text
文案定稿 → 静态 HTML 排版 → 浏览器截图 → PNG 检查
```

## 渲染规则

- 不使用动画。
- 不使用远程字体。
- 不使用需要联网的资源。
- 不执行页面 JavaScript。
- 不使用 `backdrop-filter`。
- 不使用 SVG 文字替代正文。
- 所有文字必须能被浏览器正常渲染。
- 每张卡单独导出 PNG。

## 推荐文件

```text
cards.html
render.mjs
01-cover.png
02-method.png
```

## Playwright 导出建议

使用本项目 `scripts/render-static-cards.mjs` 作为起点。

默认约定：

```text
输入：cards.html
输出：outputs/*.png
视口：１２００ × １６００
动画：disabled
脚本：disabled
网络：http 和 https 拦截
```

如果系统没有 Playwright 浏览器缓存，可以使用系统 Chrome：

```text
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

默认只允许读取项目目录内的 HTML，并输出到项目目录内。确实需要处理可信外部文件时，再显式设置：

```text
HEIGE_ALLOW_EXTERNAL_PATHS=1
```

## 抽检规则

导出后必须打开图片看一遍。

重点看：

- 标题是否压边。
- 底部署名是否被裁。
- 代码块是否太小。
- 中文引号是否统一。
- 英文单词是否撑开容器。
- 是否出现破折号。
- 是否没有远程资源依赖。
- 是否没有不可信外部 HTML。
