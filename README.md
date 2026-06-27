# Macintosh UI

一个偏 macOS 风格的 VS Code 主题扩展。它不只是提供配色，还会向工作台注入自定义 CSS、JS 和字体资源，用来调整界面字体、滚动条，以及部分宿主环境下的活动栏表现。

## 当前功能

- 内置 12 套主题，覆盖深色与浅色方案
- 首次启动自动检测注入状态，未注入时弹窗提示
- 通过编辑器右键菜单管理主题资源，无需手动改 VS Code 安装目录
- 支持一键注入、更新、清理、备份主题资源
- 支持切换界面字体与编辑器字体
- 内置 Trae CN 环境兼容处理（通知屏蔽、活动栏补丁）
- 支持中 / 英文双语界面提示

## 内置主题

### 深色

- Apple Zed Agola
- Apple Deep I
- Apple Deep II
- Apple Deep III
- Apple Deep IV
- Apple GitHub Dark
- Apple Material Dark
- Apple One Dark Pro
- Apple Zed Andromeda

### 浅色

- Apple Boxy Yesterday
- Apple Zed Italic
- Apple Quiet VSC

## 安装后怎么用

1. 安装扩展并启动 VS Code。
2. 首次启动时，如果检测到脚本尚未注入，会弹出提示询问是否注入。
3. 选择 `确认` 后执行注入。
4. 根据提示选择 `重新加载` 或 `立即重启`，让修改生效。
5. 打开 `Preferences: Color Theme`，切换到任意 `Apple ...` 主题。

## 右键菜单

扩展会在编辑器右键菜单里提供 `「麦金塔界面」` 子菜单，包含这些命令：

- `打开配置`
- `更新配置`
- `清除配置`
- `备份配置`
- `导入配置`

### 这些命令分别做什么

- `打开配置`：把扩展内的 [`vscode`](./vscode) 目录加入当前工作区，方便直接修改主题 JSON、注入 CSS/JS 和字体资源
- `更新配置`：通过软链接注入 `vscode/assets` 中的 CSS / JS / 字体资源，并扫描 `vscode/themes/*.json` 同步主题列表到 `package.json`
- `清除配置`：恢复被注入前的文件内容，并删除注入软链接
- `备份配置`：将扩展内的 [`vscode`](./vscode) 目录备份到 `~/Macintosh-UI-Backup`
- `导入配置`：从备份目录导入主题配置

## 字体与语言配置

扩展暴露了两个设置项：

- `setting.ui.fontFamily`：自定义界面字体栈，默认值为 `Symbols Nerd Font Mono, JetBrains Mono, TsangerJinKai02-W04`
- `default.ui.fontFamily`：系统默认字体，可选 `-apple-system` 或 `SF Pro Text`

修改设置后需要执行 `更新主题配置`，然后重载窗口或重启 VS Code，字体替换才会真正写入工作台文件。

扩展会根据 VS Code 当前显示语言自动切换中文或英文提示文案，语言包为 [`package.nls.json`](./package.nls.json) 和 [`package.nls.zh-cn.json`](./package.nls.zh-cn.json)。

## 磨砂玻璃与注入说明

这个项目的视觉效果并不完全依赖 VS Code 官方主题能力，而是通过注入方式实现额外 UI 定制：

- 会修改 VS Code 或宿主编辑器安装目录中的工作台文件
- 注入时会为目标文件生成 `.bak` 备份
- 清除主题配置时会基于备份恢复原文件
- 某些宿主环境可能在升级后导致补丁片段失效，需要重新适配

如果你使用的是 Trae CN，扩展会自动处理特定通知弹窗，并应用活动栏布局补丁。

## 项目结构

```text
macintosh-ui/
├── README.md               # 项目说明文档
├── package.json            # 扩展清单、命令注册、主题注册入口
├── src/                    # 扩展运行逻辑
│   ├── extension.js        # 扩展入口，注册命令与执行注入流程
│   ├── utils/              # 工具模块
│   │   ├── index.js        # 文件读写、备份、重启、配置读写等工具
│   │   ├── i18n.js         # 国际化语言切换模块
│   │   ├── patch.js        # 补丁执行入口
│   │   └── theme.js        # 扫描主题 JSON 并同步到 package.json
├── vscode/                 # 注入资源与主题系统
│   ├── assets/             # 运行时注入资源：CSS、JS、字体文件
│   │   ├── css/            # 样式文件
│   │   ├── fonts/          # 字体文件
│   │   └── index.js        # 浏览器端 UI 脚本
│   ├── patches/            # 源码补丁模块
│   │   ├── activityBar.js  # 活动栏补丁配置
│   │   └── refs/           # 源码参考与辅助脚本
│   ├── themes/             # 12 套主题定义文件
│   │   └── docs/           # 主题开发参考文档
│   └── README.md           # vscode 子目录详细说明
├── icon/                   # 扩展图标资源
├── package.nls.json        # 默认语言文案（命令标题）
├── package.nls.zh-cn.json  # 中文文案
├── FLOW.md                 # 项目流程与模块关系说明
└── jsconfig.json           # JS 项目配置
```

## 开发说明

### 本地调试

```bash
pnpm install
```

按 `F5` 启动扩展开发宿主进行调试。

### 可用脚本

```bash
pnpm run lint
pnpm run test
```

### 主题开发

主题文件位于 [`vscode/themes/`](./vscode/themes)。执行 `更新主题配置` 时，扩展会通过 [`src/utils/theme.js`](./src/utils/theme.js) 扫描该目录下的 `.json` 文件，并自动刷新 `package.json` 中的 `contributes.themes`。

每个主题 JSON 文件通过 `name` 和 `type` 字段定义显示名称和深浅色类型，最终会生成 `Apple ${name}` 格式的标签。

如果你要调整语法高亮作用域，可以参考：

- [`vscode/README.md`](./vscode/README.md)
- [`vscode/themes/docs/scope.md`](./vscode/themes/docs/scope.md)
- [`vscode/themes/docs/theme.md`](./vscode/themes/docs/theme.md)

## 兼容性

- VS Code engine：`^1.87.0`
- 主要面向桌面版 VS Code 及基于 VS Code 的桌面宿主环境（含 Trae CN）

## 仓库信息

- 作者：Wang Ming
- GitHub：https://github.com/wangmings/macintosh-ui
