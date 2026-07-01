# vscode 目录说明

这个目录存放 VS Code / Trae CN 相关的界面样式、运行时补丁、字体资源、主题文件以及开发辅助工具。

## 目录结构

```text
vscode/
├── README.md               # 当前目录说明文档
├── assets/                 # 核心运行时资源：UI 注入、样式覆盖、字体配置
│   ├── css/                # 样式文件
│   │   ├── fonts.css       # 字体注册与全局字体栈配置
│   │   └── style.css       # 编辑器界面样式覆盖
│   ├── fonts/              # 字体资源目录
│   ├── fixes.js            # 浏览器端 UI 修复脚本
│   └── utils.js            # 浏览器端 DOM 工具函数
├── patches/                # 源码补丁模块
│   ├── activity-bar.js    # 活动栏补丁配置
│   └── refs/               # 源码参考与辅助工具
│       ├── sync.sh         # 宿主源码同步脚本
│       ├── sources/        # 同步下来的参考源码
│       └── prompt/         # 补丁提示词
│           └── activity-bar.md
└── themes/                 # 主题数据与文档
    ├── docs/               # 主题开发参考文档
    │   ├── scope.md        # Token / Scope 检查说明
    │   └── theme.md        # 主题颜色配置说明
    ├── dark-agola.json     # 深色主题
    ├── dark-deep-i.json    # 深色主题
    ├── dark-deep-ii.json   # 深色主题
    ├── dark-deep-iii.json  # 深色主题
    ├── dark-deep-iv.json   # 深色主题
    ├── dark-github.json    # 深色主题
    ├── dark-material.json  # 深色主题
    ├── dark-one.json       # 深色主题
    ├── dark-zed.json       # 深色主题
    ├── light-boxy.json     # 浅色主题
    ├── light-italic.json   # 浅色主题
    └── light-quiet.json    # 浅色主题
```

## 文件功能说明

### `assets/`

这一层主要负责编辑器的基础界面注入，包括字体、全局 CSS 和浏览器端运行脚本。

#### `assets/fixes.js`

浏览器端 UI 修复脚本，主要作用有：

- 监听 DOM 变化，修复界面显示问题。
- 修复 `.vscode-tokens-styles` 中语法高亮样式作用域不完整的问题，给 `.mtk` 规则补上 `.monaco-editor` 前缀。
- 在检测到 Trae CN 环境时，自动处理特定通知弹窗，例如扩展被修改、安装损坏提示。

#### `assets/utils.js`

浏览器端 DOM 工具函数模块，提供 `waitNode`、`observeNode` 等辅助函数，供 `fixes.js` 及其它浏览器端脚本使用。

#### `assets/css/style.css`

全局样式覆盖文件，主要负责：

- 调整 VS Code / Monaco 的字体抗锯齿表现。
- 优化列表和编辑器滚动条宽度、圆角、内边距。
- 统一部分标题、图标、折叠箭头、面包屑等控件的字号和显示效果。
- 处理背景透明、悬浮层、搜索框、分割线等界面细节。
- 补充 Trae CN 环境下的一些额外样式修正。

#### `assets/css/fonts.css`

字体注册与全局字体栈配置文件，主要作用：

- 通过 `@font-face` 注册 JetBrains Mono 全套字重与斜体。
- 注册 `TsangerJinKai02-W04` 中文字体。
- 注册 `Symbols Nerd Font Mono` 图标字体。
- 注册 `LXGW WenKai Mono` 中文字体。
- 注册 Zed Mono 系列字体。
- 通过全局 `font-family` 统一编辑器和界面的字体回退顺序。

#### `assets/fonts/`

字体资源目录，为 `fonts.css` 提供实际字体文件：

- `JetBrainsMono-*.woff2`：JetBrains Mono 字体（Regular / Italic / Medium / Bold / ExtraBold 及对应斜体）
- `SymbolsNerdFontMono-Regular.woff2`：Nerd Font 图标字体
- `TsangerJinKai02-W04.woff2`：中文楷体字体
- `LXGWWenKaiMono-Regular.woff2`：中文霞鹜文楷等宽字体
- `zed-mono-*.woff2`：Zed Mono 系列字体

### `patches/`

这一层负责对 VS Code / Trae CN 产物进行源码级补丁处理。

#### `patches/activity-bar.js`

活动栏补丁配置，主要职责：

- 定义 `activityBar` 补丁集合：扩展活动栏位置枚举、修复硬编码、添加 top/bottom 布局分支、调整可见项计算、扣减布局高度、SOLO 恢复活动栏显隐状态等。
- 提供 `activityBarStyle` CSS 补丁字符串，隐藏部分 Trae CN 特有元素并调整活动栏图标样式。
- 导出 `{ activityBar, activityBarStyle }`，供 `src/lib/patch.js` 调用。

#### `patches/refs/sync.sh`

宿主源码辅助脚本，用于定位并复制 Trae CN 应用里的目标源码文件，方便后续补丁匹配和调试。

#### `patches/refs/sources/`

同步下来的参考源码目录，保存压缩源码、格式化源码和 CSS 文件：

- `workbench.desktop.main.js`：活动栏补丁的原版压缩源码匹配基准。
- `workbench.desktop.main.fmt.js`：格式化后的辅助定位参考。
- `workbench.desktop.main.css`：活动栏样式补丁的目标 CSS 参考。
- `main.js` / `main.fmt.js`：主进程相关源码参考。

#### `patches/refs/prompt/activity-bar.md`

活动栏补丁提示词，用于指导源码补丁助手的修改流程和修复流程。

### `themes/`

主题 JSON 数据目录。每个 JSON 文件都是一个 VS Code 主题定义，由 `src/lib/theme.js` 扫描并注册到 `package.json`：

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

#### `themes/docs/`

主题开发参考文档：

- `theme.md`：主题颜色配置说明，介绍如何在 VS Code 中配置 `colors` 对象及常见主题色字段含义。
- `scope.md`：语法高亮作用域说明，介绍 Token、Scope 概念及如何使用 `Developer: Inspect Editor Tokens and Scopes` 检查作用域。

## 使用关系

几个目录之间的关系大致如下：

- `assets/` 负责运行时样式和字体注入。
- `patches/activity-bar.js` 提供补丁配置，由 `src/lib/patch.js` 读取并执行。
- `themes/` 存储主题 JSON 数据文件，由 `src/lib/theme.js` 扫描并生成主题注册配置。
- `assets/css/fonts.css` 引用 `assets/fonts/` 下的字体文件。
- `patches/refs/sync.sh` 从目标应用同步参考源码到 `patches/refs/sources/`。
