# vscode 目录说明

这个目录用于存放 VS Code / Trae CN 相关的界面样式、运行时补丁、字体资源以及主题配置文件。

## 目录结构

```text
vscode/
├── README.md             # 当前目录说明文档
├── assets/               # 核心运行时资源：UI 注入、样式覆盖、字体配置
│   ├── fonts/            # 字体资源目录
│   ├── fonts.css         # 字体注册与全局字体栈配置
│   ├── index.css         # 编辑器界面样式覆盖
│   └── index.js          # 浏览器端 UI 监听与修复脚本
├── patchs/               # 源码补丁模块：窗口效果、活动栏逻辑等
│   ├── apps/             # 补丁配置与辅助脚本
│   │   ├── appCode.sh    # 宿主源码辅助脚本
│   │   └── patch.config.js # 补丁规则与参数配置
│   └── main.js           # 补丁执行与替换工具
└── themes/               # 主题系统：主题数据、生成脚本、开发文档
    ├── main.js           # 扫描主题并生成 themes 注册配置
    ├── docs/             # 主题开发参考文档
    │   ├── scope.md      # Token / Scope 检查说明
    │   └── theme.md      # 主题颜色配置说明
    └── json/             # 主题 JSON 数据目录
```

## 文件功能说明

### 根目录

#### `README.md`

当前说明文档，记录 `vscode` 目录结构和各文件职责，便于后续维护、扩展和排查问题。

### `assets/`

这一层主要负责编辑器的基础界面注入，包括字体、全局 CSS 和浏览器端运行脚本。

#### `assets/index.js`

浏览器端 UI 监听脚本，主要作用有：

- 监听 DOM 变化。
- 修复 `.vscode-tokens-styles` 中语法高亮样式作用域不完整的问题，给 `.mtk` 规则补上 `.monaco-editor` 前缀。
- 在检测到 Trae CN 环境时，自动处理特定通知弹窗，例如扩展被修改、安装损坏提示。
- 提供 `waitNode`、`observeNode` 等辅助函数，方便后续继续扩展界面修复逻辑。

#### `assets/index.css`

全局样式覆盖文件，主要负责：

- 调整 VS Code / Monaco 的字体抗锯齿表现。
- 优化列表和编辑器滚动条宽度、圆角、内边距。
- 统一部分标题、图标、折叠箭头、面包屑等控件的字号和显示效果。
- 处理背景透明、悬浮层、搜索框、分割线等界面细节。
- 补充 Trae CN 环境下的一些额外样式修正。

#### `assets/fonts.css`

字体注册与全局字体栈配置文件，主要作用：

- 通过 `@font-face` 注册 JetBrains Mono 全套字重与斜体。
- 注册 `TsangerJinKai02-W04` 中文字体。
- 注册 `Symbols Nerd Font Mono` 图标字体。
- 通过全局 `font-family` 统一编辑器和界面的字体回退顺序。

#### `assets/fonts/`

字体资源目录，为 `fonts.css` 提供实际字体文件：

- `JetBrainsMono-Regular.ttf`：JetBrains Mono 常规字重。
- `JetBrainsMono-Italic.ttf`：JetBrains Mono 常规斜体。
- `JetBrainsMono-Medium.ttf`：JetBrains Mono 中等字重。
- `JetBrainsMono-Medium-Italic.ttf`：JetBrains Mono 中等字重斜体。
- `JetBrainsMono-Bold.ttf`：JetBrains Mono 粗体。
- `JetBrainsMono-Bold-Italic.ttf`：JetBrains Mono 粗体斜体。
- `JetBrainsMono-ExtraBold.ttf`：JetBrains Mono 特粗体。
- `JetBrainsMono-ExtraBold-Italic.ttf`：JetBrains Mono 特粗体斜体。
- `SymbolsNerdFontMono-Regular.ttf`：Nerd Font 图标字体，用于图标和特殊符号显示。
- `TsangerJinKai02-W04.ttf`：中文楷体字体，用于中文文本显示补充。

### `patchs/`

这一层负责对 VS Code / Trae CN 产物进行源码级补丁处理。

#### `patchs/main.js`

补丁执行辅助模块，主要职责：

- 提供 `getAllMatches()` 统一处理字符串和正则匹配，并统计补丁命中数量。
- 导出 `traeActivityBar()`，用于给活动栏相关 JS/CSS 代码打补丁。
- 导出 `frostedGlass()`，用于给窗口模糊和玻璃效果相关代码打补丁。
- 统一作为 `patchs/apps/patch.config.js` 中补丁配置的执行入口。

#### `patchs/apps/patch.config.js`

补丁配置中心，定义了两大类能力：

- `activityBar`
  - 扩展 `workbench.activityBar.location` 配置项。
  - 修复活动栏位置被硬编码成 `default` 的问题。
  - 为 `top`、`bottom` 等布局模式补上逻辑分支。
  - 调整活动项数量计算与布局细节。
  - 附带一段活动栏样式补丁 CSS。
- `windowBlur`
  - 定义窗口玻璃效果参数，例如 `frame`、`transparent`、`vibrancy`、`backgroundMaterial`、`backgroundColor`。
  - 提供一组 `workbenchCustomColors`，用于配合透明和模糊背景调整编辑器、侧边栏、状态栏、面板等颜色。
  - 生成对应的 `windowBlur.patch` 替换规则，注入到目标源码中。

### `themes/`

这一层负责主题文件维护、主题配置生成和主题开发说明文档。

#### `themes/main.js`

主题构建辅助脚本，主要职责：

- 扫描 `themes/json` 下的所有主题 JSON 文件。
- 读取每个主题文件的 `name` 和 `type` 字段。
- 自动生成 `package.json` 中 `contributes.themes` 配置。
- 统一输出主题标签格式为 `Apple ${theme.name}`。
- 提供测试入口，单独运行时可以预览生成结果而不改写 `package.json`。

#### `themes/docs/theme.md`

主题颜色配置说明文档，内容偏向使用和配置参考，主要介绍：

- 如何在 VS Code 中打开 `settings.json`。
- 如何配置 `colors` 对象。
- 常见主题色字段在标题栏、菜单栏、状态栏、活动栏、侧边栏、编辑器等区域中的含义。

#### `themes/docs/scope.md`

语法高亮作用域说明文档，主要用于主题开发时快速查阅：

- 什么是 Token。
- 什么是 Scope。
- 如何通过 `Developer: Inspect Editor Tokens and Scopes` 检查编辑器中的作用域。
- 如何根据作用域为主题编写 `tokenColors` 规则。

#### `themes/json/`

主题定义目录，每个 JSON 文件都是一个可被 `themes/main.js` 扫描并注册的 VS Code 主题：

- `dark-agola.json`：深色主题，偏 Zed Agola 风格，包含较完整的 `tokenColors` 和部分 `semanticTokenColors` 定义。
- `dark-deep-i.json`：深色主题，偏深灰蓝风格，重点定义 UI `colors`，适合整体界面外观调整。
- `dark-deep-ii.json`：深色主题，接近 VS Code 默认暗色系的延展版本，同时包含 `colors` 与 `tokenColors`。
- `dark-deep-iii.json`：深色主题，是 `Deep` 系列的一个变体，强化了缩进线、列表、面板等界面颜色。
- `dark-deep-iv.json`：深色主题，和 `Deep III` 同系列的继续调整版本，用于进一步微调整体深色体验。
- `dark-github.json`：GitHub Dark 风格主题，覆盖范围较广，既定义工作台颜色，也定义编辑器配色。
- `dark-material.json`：Material Dark 风格主题，偏 Material Design 视觉语言。
- `dark-one.json`：One Dark Pro 风格主题，带有较完整的语义高亮与语法高亮配置。
- `dark-zed.json`：Zed Andromeda 风格深色主题，强调高对比语法色和语义高亮。
- `light-boxy.json`：浅色主题，偏 Boxy Yesterday 风格。
- `light-italic.json`：浅色主题，部分关键语法使用斜体风格，偏 Zed Italic 视觉路线。
- `light-quiet.json`：浅色主题，风格更柔和安静，适合低刺激阅读和编码场景。

## 使用关系

几个目录之间的关系大致如下：

- `assets/` 负责运行时样式和字体注入。
- `patchs/` 负责对目标应用源码进行补丁替换。
- `themes/` 负责主题 JSON 维护和主题注册生成。
- `themes/main.js` 会读取 `themes/json/*.json`。
- `assets/fonts.css` 会读取 `assets/fonts/*` 字体文件。
- `patchs/main.js` 会读取并执行 `patchs/apps/patch.config.js` 中的补丁配置。
