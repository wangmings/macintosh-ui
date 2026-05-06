# Macintosh UI

一个偏 macOS 风格的 VS Code 主题扩展。它不只是提供配色，还会向工作台注入自定义 CSS、JS 和字体资源，用来调整界面字体、滚动条、透明背景、毛玻璃效果，以及部分宿主环境下的活动栏表现。

## 当前功能

- 内置 12 套主题，包含深色与浅色方案
- 首次启动自动检测注入状态，未注入时弹窗提示
- 通过右键菜单管理主题资源，无需手动改 VS Code 安装目录
- 支持将扩展内的 `vscode/` 资源目录直接加入工作区，方便继续自定义
- 支持一键注入、清理、备份主题资源
- 支持切换界面字体与编辑器字体
- 支持开启/关闭磨砂玻璃效果
- 内置 Trae CN 环境兼容处理
- 内置活动栏补丁逻辑，用于适配特定宿主环境的侧边栏布局

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
2. 第一次启动时，如果检测到脚本尚未注入，会提示是否注入主题脚本。
3. 选择 `YES` 后执行注入。
4. 根据提示选择 `重新加载` 或 `立即重启`，让修改生效。
5. 打开 `Preferences: Color Theme`，切换到任意 `Apple ...` 主题。

## 右键菜单

扩展会在编辑器右键菜单里提供 `「麦金塔界面」` 子菜单，包含这些命令：

- `启用磨砂玻璃`
- `关闭磨砂玻璃`
- `打开主题配置`
- `更新主题配置`
- `清除主题配置`
- `备份主题配置`

### 这些命令分别做什么

- `打开主题配置`：把扩展内的 [`vscode`](./vscode) 目录加入当前工作区，方便直接修改主题 JSON、注入 CSS/JS、字体资源
- `更新主题配置`：重新注入 HTML / JS / CSS / 字体资源，并同步 `vscode/theme/*.json` 到 `package.json` 的主题列表
- `清除主题配置`：恢复被注入前的文件内容，并删除注入目录
- `备份主题配置`：将扩展内的 [`vscode`](./vscode) 目录备份到 `~/Macintosh-UI-Backup`
- `启用/关闭磨砂玻璃`：写入 `workbench.colorCustomizations`，切换透明与磨砂相关配置

## 字体配置

扩展暴露了两个设置项：

- `setting.ui.fontFamily`
  默认值：`Symbols Nerd Font Mono, JetBrains Mono, TsangerJinKai02-W04`
- `default.ui.fontFamily`
  可选值：`-apple-system`、`SF Pro Text`

当你修改这些设置后，需要再次执行 `更新主题配置`，然后重载窗口或重启 VS Code，字体替换才会真正写入工作台文件。

## 磨砂玻璃与注入说明

这个项目的视觉效果并不完全依赖 VS Code 官方主题能力，而是通过注入方式实现额外 UI 定制，因此有几个特点需要提前说明：

- 会修改 VS Code 或宿主编辑器安装目录中的工作台文件
- 注入时会为目标文件生成 `.bak` 备份
- 清除主题配置时会基于备份恢复原文件
- 某些宿主环境可能在升级后导致补丁片段失效，需要重新适配

如果你使用的是 Trae CN，项目里还包含专门的通知处理和活动栏补丁逻辑。

## 项目结构

```text
macintosh-ui/
├── README.md               # 项目说明文档
├── package.json            # 扩展清单、命令注册、主题注册入口
├── src/                    # 扩展运行逻辑
│   ├── extension.js        # 扩展入口，注册命令与执行注入流程
│   └── utils.js            # 文件读写、备份、重启、配置读写等工具
├── vscode/                 # 注入资源与主题系统
│   ├── core/               # 核心运行时资源：UI 注入、样式覆盖、字体配置
│   ├── patch/              # 源码补丁模块：窗口效果、活动栏逻辑等
│   ├── theme/              # 主题系统：主题数据、生成脚本、开发文档
│   └── README.md           # vscode 子目录说明文档
├── icons/                  # 扩展图标资源目录
├── package.nls.json        # 默认语言文案
├── package.nls.zh-cn.json  # 中文文案
├── CHANGELOG.md            # 更新记录
├── FLOW.md                 # 项目流程/设计补充说明
├── LICENSE.md              # 许可证
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

主题文件位于 [`vscode/theme`](./vscode/theme)。执行 `更新主题配置` 时，扩展会通过 [`vscode/theme/main.js`](./vscode/theme/main.js) 扫描这个目录下的 `.json` 文件，并自动刷新 `package.json` 中的 `contributes.themes`。

如果你要调整语法高亮作用域，可以参考：

- [`vscode/README.md`](./vscode/README.md)
- [`vscode/theme/docs/scope.md`](./vscode/theme/docs/scope.md)
- [`vscode/theme/docs/theme.md`](./vscode/theme/docs/theme.md)

## 兼容性

- VS Code engine：`^1.87.0`
- 主要面向桌面版 VS Code / 基于 VS Code 的桌面宿主环境

## 仓库信息

- 作者：Wang Ming
- GitHub：https://github.com/wangmings/macintosh-ui
