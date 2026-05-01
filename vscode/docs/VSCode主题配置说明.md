# VS Code 主题配置说明

## 📦 安装与使用

- 打开 VS Code，按下 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（Mac），输入 `Preferences: Open Settings (JSON)` 并回车。

- 将下方 **「分类配置代码」** 中的 `colors` 对象完整复制到 `settings.json` 中（若已有 `colors` 字段，直接替换即可）。

## 🎯 VSCode外观主题颜色配置

### 一、基础全局样式（跨界面通用的基础色）

#### 1.1 全局默认样式

```json
"foreground":               "#616161",  // 全局默认前景色
"focusBorder":              "#0090f1",  // 聚焦元素的边框色
"widget.shadow":            "#000000",  // 组件阴影色
"textLink.foreground":      "#006ab1"   // 所有文本链接的前景色
"selection.background":     "#b0daff",  // 通用选中背景色
"progressBar.background":   "#0e70c0",  // 进度条背景色
"commandCenter.foreground": "#616161",  // 命令中心前景色
```

### 二、顶部区域（标题栏 + 菜单栏 + 状态栏）

#### 2.1 标题栏

```json
"titleBar.border":              "#ffffff"   // 标题栏边框
"titleBar.activeBackground":    "#dddddd",  // 激活窗口的标题栏背景
"titleBar.activeForeground":    "#616161",  // 激活窗口的标题栏前景
"titleBar.inactiveBackground":  "#e0e0e0",  // 未激活窗口的标题栏背景
"titleBar.inactiveForeground":  "#888888",  // 未激活窗口的标题栏前景
```

#### 2.2 菜单栏

```json
"menu.border":                  "#cccccc"   // 下拉菜单边框
"menu.foreground":              "#616161",  // 下拉菜单前景
"menu.background":              "#ffffff",  // 下拉菜单背景
"menu.selectionBorder":         "#ffffff",  // 下拉菜单选中项边框
"menu.selectionForeground":     "#ffffff",  // 下拉菜单选中项前景
"menu.selectionBackground":     "#0060c0",  // 下拉菜单选中项背景
"menu.separatorBackground":     "#888888",  // 下拉菜单分隔线
"menubar.selectionForeground":  "#333333",  // 菜单栏选中项前景
"menubar.selectionBackground":  "#f0f0f0",  // 菜单栏选中项背景
```

#### 2.3 状态栏

```json
"statusBar.foreground":          "#ffffff",  // 状态栏前景
"statusBar.background":          "#007acc",  // 状态栏背景（有文件夹）
"statusBar.noFolderBackground":  "#68217a",  // 无文件夹时状态栏背景
"statusBar.noFolderForeground":  "#ffffff",  // 无文件夹时状态栏前景
"statusBarItem.hoverBackground": "#f0f0f0",  // 状态栏项悬停背景
"statusBar.debuggingBackground": "#cc6633",  // 调试时状态栏背景
"statusBar.debuggingForeground": "#ffffff",  // 调试时状态栏前景
"statusBarItem.remoteBackground":"#16825d",  // 远程连接时状态栏项背景
"statusBarItem.remoteForeground":"#ffffff",  // 远程连接时状态栏项前景
"statusBarItem.activeBackground":"#f5f5f5"   // 激活的状态栏项背景
```

### 三、左侧区域（活动栏 + 侧边栏 + 列表与树）

#### 3.1 活动栏（左侧最外层图标栏）

```json
"activityBar.foreground":         "#ffffff",  // 活动栏前景
"activityBar.background":         "#2c2c2c",  // 活动栏背景
"activityBarBadge.foreground":    "#ffffff",  // 活动栏徽章前景
"activityBarBadge.background":    "#007acc",  // 活动栏徽章背景
"activityBar.inactiveForeground": "#f0f0f0",  // 活动栏未激活项前景
```

#### 3.2 侧边栏（文件管理器 / 搜索等面板）

```json
"sideBar.background":              "#f3f3f3",  // 侧边栏背景
"sideBar.foreground":              "#616161",  // 侧边栏前景
"sideBarTitle.foreground":         "#6f6f6f",  // 侧边栏标题前景
"sideBar.dropBackground":          "#d6ebff",  // 侧边栏拖放背景
"sideBar.scrollbar.background":    "#f3f3f3",  // 侧边栏滚动条背景
"sideBarItem.hoverBackground":     "#e8e8e8"   // 侧边栏单项悬停背景
"sideBarSectionHeader.border":     "#e0e0e0",  // 侧边栏分区标题边框
"sideBarSectionHeader.background": "#ffffff",  // 侧边栏分区标题背景
"sideBarSectionHeader.foreground": "#616161",  // 侧边栏分区标题前景
```

#### 3.3 列表与树（面板中的列表组件）

```json
"list.focusOutline":                "#e8e8e8",  // 列表聚焦项轮廓
"list.dropBackground":              "#d6ebff",  // 列表拖放背景
"list.focusBackground":             "#d6ebff",  // 列表聚焦项背景
"list.focusForeground":             "#009688",  // 列表聚焦项前景
"list.hoverBackground":             "#e8e8e8",  // 列表项悬停背景
"list.hoverForeground":             "#1a85ff",  // 列表项悬停前景
"tree.indentGuidesStroke":          "#a9a9a9",  // 树组件的缩进线
"list.highlightForeground":         "#0066bf",  // 列表高亮项前景
"listFilterWidget.outline":         "#ffffff",  // 列表过滤框轮廓
"listFilterWidget.background":      "#efc1ad",  // 列表过滤框背景
"list.activeSelectionBackground":   "#e8e8e8",  // 聚焦列表的选中背景
"list.activeSelectionForeground":   "#1a85ff",  // 聚焦列表的选中前景
"list.inactiveSelectionBackground": "#e8e8e8",  // 未聚焦列表的选中背景
"list.inactiveSelectionForeground": "#1a85ff",  // 未聚焦列表的选中前景
"listFilterWidget.noMatchesOutline":"#be1100"   // 列表无匹配时过滤框轮廓
```

### 五、编辑器核心（代码编辑区域）

#### 5.1 编辑器基础

```json
"editor.background":                    "#ffffff",  // 编辑器背景
"editor.foreground":                    "#3ca7dd",  // 编辑器文本前景
"editorCursor.foreground":              "#000000",  // 编辑器光标前景
"editorCursor.background":              "#ffffff",  // 编辑器光标背景
"editorGutter.background":              "#ffffff",  // 编辑器gutter（行号区）背景
"editorLineHighlightBorder":            "#ffffff",  // 编辑器选中行边框
"editorOverviewRuler.border":           "#e0e0e0",  // 编辑器概览标尺边框
"editorLineNumber.foreground":          "#a1a0a0",  // 编辑器行号前景
"editorWhitespace.foreground":          "#e0e0e0",  // 编辑器空白字符前景
"editorLineHighlightBackground":        "#ffffff",  // 编辑器选中行背景
"editorOverviewRuler.background":       "#ffffff",  // 编辑器概览标尺背景
"editorLineNumber.activeForeground":    "#000000",  // 激活行的行号前景
"editorGutter.commentRangeForeground":  "#424242",  // gutter注释范围前景
"editorGutter.foldingControlForeground":"#424242",  // gutter折叠控件前景
```

#### 5.2 选中与高亮

```json
"editor.selectionBackground":           "#eeeeee",  // 编辑器选中背景
"editor.wordHighlightBackground":       "#e0e0e0",  // 编辑器单词高亮背景
"editor.selectionHighlightBorder":      "#ffffff",  // 编辑器选中高亮边框
"editor.hoverHighlightBackground":      "#e6f7ff",  // 编辑器悬停高亮背景
"editor.wordHighlightStrongBorder":     "#ffffff"   // 编辑器强单词高亮边框
"editor.inactiveSelectionBackground":   "#eeeeee",  // 未聚焦时编辑器选中背景
"editor.selectionHighlightBackground":  "#f0e68c",  // 编辑器选中高亮背景
"editor.wordHighlightStrongBackground": "#fffacd",  // 编辑器强单词高亮背景
```

#### 5.3 查找与范围

```json
"editor.findMatchBorder":              "#eeae34",  // 编辑器查找匹配边框
"editor.findMatchBackground":          "#eeae34",  // 编辑器查找匹配背景
"editor.rangeHighlightBorder":         "#ffffff"   // 编辑器自定义范围边框
"editor.findMatchHighlightBorder":     "#ffffff",  // 编辑器查找次要匹配边框
"editor.findRangeHighlightBorder":     "#ffffff",  // 编辑器查找范围边框
"editor.rangeHighlightBackground":     "#dcdcdc",  // 编辑器自定义范围背景
"editor.findRangeHighlightBackground": "#e0e0e0",  // 编辑器查找范围背景
"editor.findMatchHighlightBackground": "#f8d7da",  // 编辑器查找次要匹配背景
```

#### 5.4 折叠与缩进

```json
"editor.foldBackground":                "#e6f7ff",  // 编辑器折叠区域背景
"editor.foldWidget.foreground":         "#a1a0a0",  // 编辑器折叠箭头前景
"editorIndentGuide.background":         "#e0e0e0",  // 编辑器缩进线背景
"editorIndentGuide.activeBackground":   "#f5871f"   // 激活行缩进线背景
"editor.foldWidget.selectedForeground": "#007acc",  // 选中行折叠箭头前景
```

#### 5.5 语法与错误提示

```json
"editorInfo.border":           "#ffffff",  // 编辑器信息边框
"editorError.border":          "#ffffff",  // 编辑器错误边框
"editorWarning.border":        "#ffffff",  // 编辑器警告边框
"editorInfo.foreground":       "#75beff",  // 编辑器信息文本前景
"editorInfo.background":       "#ffffff",  // 编辑器信息背景
"editorError.foreground":      "#e51400",  // 编辑器错误文本前景
"editorError.background":      "#ffffff",  // 编辑器错误背景
"editorWarning.foreground":    "#e9a700",  // 编辑器警告文本前景
"editorWarning.background":    "#ffffff",  // 编辑器警告背景
"editorCodeLens.foreground":   "#929292",  // 编辑器CodeLens前景
"editorLink.activeForeground": "#ff2342"   // 编辑器内链接激活前景
```

#### 5.6 括号匹配

```json
"editorBracketMatch.border":    "#f5871f"   // 编辑器括号匹配边框
"editorBracketMatch.background":"#fee8cc",  // 编辑器括号匹配背景
```

#### 5.7 语义高亮（可选，需启用语义高亮功能）

```json
"editor.semanticTokenColors": {
  "namespace": "#006ab1",   // 命名空间语义颜色
  "type":      "#009688",   // 类型语义颜色
  "enum":      "#009688",   // 枚举语义颜色
  "class":     "#009688",   // 类语义颜色
  "method":    "#3ca7dd",   // 方法语义颜色
  "variable":  "#616161",   // 变量语义颜色
  "function":  "#3ca7dd",   // 函数语义颜色
  "interface": "#009688",   // 接口语义颜色
  "parameter": "#616161"    // 参数语义颜色
}
```

### 六、编辑器辅助功能（嵌入提示、标记导航等）

#### 6.1 嵌入提示（Inlay Hints）

```json
"editorInlayHint.background":          "#f0f0f0",  // 嵌入提示背景
"editorInlayHint.foreground":          "#8a8a8a",  // 嵌入提示前景
"editorInlayHint.typeForeground":      "#6b7280",  // 类型嵌入提示前景
"editorInlayHint.parameterForeground": "#007acc",  // 参数嵌入提示前景
```

#### 6.2 标记导航（错误 / 警告快速跳转）

```json
"editorMarkerNavigation.background":        "#ffffff",  // 标记导航背景
"editorMarkerNavigationInfo.background":    "#75beff",  // 信息标记导航背景
"editorMarkerNavigationError.background":   "#e51400",  // 错误标记导航背景
"editorMarkerNavigationWarning.background": "#e9a700",  // 警告标记导航背景
```

#### 6.3 编辑器组（多标签编辑区）

```json
"editorGroup.border":                "#e7e7e7",  // 编辑器组边框
"editorGroup.emptyBackground":       "#ffffff",  // 空编辑器组背景
"editorGroupHeader.tabsBackground":  "#f3f3f3"   // 编辑器组标签栏背景
```

### 七、标签页（编辑器 / 面板的标签）

```json
"tab.border":                        "#f3f3f3",  // 标签通用边框
"tab.activeBorder":                  "#ffffff",  // 激活标签边框
"tab.inactiveBorder":                "#f3f3f3",  // 未激活标签边框
"tab.hoverForeground":               "#1a85ff",  // 标签悬停前景
"tab.activeBorderTop":               "#ffffff",  // 激活标签顶部边框
"tab.activeForeground":              "#1a85ff",  // 激活标签前景
"tab.activeBackground":              "#ffffff",  // 激活标签背景
"tab.inactiveForeground":            "#888888",  // 未激活标签前景
"tab.inactiveBackground":            "#ececec",  // 未激活标签背景
"tab.unfocusedActiveForeground":     "#80bfff",  // 未聚焦窗口的激活标签前景
"tab.unfocusedActiveBackground":     "#ffffff",  // 未聚焦窗口的激活标签背景
"tab.unfocusedInactiveForeground":   "#b3b3b3",  // 未聚焦窗口的未激活标签前景
"tab.unfocusedInactiveBackground":   "#ececec"   // 未聚焦窗口的未激活标签背景
```

### 八、底部面板（终端 / 问题 / 输出等）

```json
"panel.border":                  "#e0e0e0",  // 面板边框
"panel.background":              "#ffffff",  // 面板背景
"panelSection.border":           "#e0e0e0",  // 面板分区边框
"panelTitle.activeBorder":       "#424242",  // 激活面板标题边框
"panelTitle.activeForeground":   "#424242",  // 激活面板标题前景
"panelTitle.activeBackground":   "#f3f3f3",  // 激活面板标题背景
"panelTitle.inactiveForeground": "#888888",  // 未激活面板标题前景
"panelTitle.inactiveBackground": "#f5f5f5"   // 未激活面板标题背景
```

### 九、终端（面板中的终端组件）

#### 9.1 终端基础样式

```json
"terminal.border":                      "#e0e0e0",  // 终端边框
"terminal.foreground":                  "#333333",  // 终端文本前景
"terminal.background":                  "#ffffff",  // 终端背景
"terminal.hoverForeground":             "#333333",  // 终端文本悬停前景
"terminal.hoverBackground":             "#e8e8e8",  // 终端文本悬停背景
"terminalCursor.foreground":            "#ffffff",  // 终端光标前景
"terminalCursor.background":            "#0087FF",  // 终端光标背景
"terminal.selectionBackground":         "#e0e0e0",  // 终端选中背景
"terminal.inactiveSelectionBackground": "#f0f0f0",  // 未聚焦终端选中背景
```

#### 9.2 终端 ANSI 颜色（控制终端内的彩色输出）

```json
"terminal.ansiRed":           "#cd3131",  // 终端ANSI红色
"terminal.ansiBlue":          "#0451a5",  // 终端ANSI蓝色
"terminal.ansiCyan":          "#0598bc",  // 终端ANSI青色
"terminal.ansiWhite":         "#555555",  // 终端ANSI白色
"terminal.ansiGreen":         "#00bc00",  // 终端ANSI绿色
"terminal.ansiBlack":         "#000000",  // 终端ANSI黑色
"terminal.ansiYellow":        "#949800",  // 终端ANSI黄色
"terminal.ansiMagenta":       "#bc05bc",  // 终端ANSI品红色
"terminal.ansiBrightRed":     "#cd3131",  // 终端ANSI亮红色
"terminal.ansiBrightCyan":    "#0598bc"   // 终端ANSI亮青色
"terminal.ansiBrightBlue":    "#0451a5",  // 终端ANSI亮蓝色
"terminal.ansiBrightBlack":   "#666666",  // 终端ANSI亮黑色
"terminal.ansiBrightGreen":   "#14ce14",  // 终端ANSI亮绿色
"terminal.ansiBrightWhite":   "#a5a5a5",  // 终端ANSI亮白色
"terminal.ansiBrightYellow":  "#b5ba00",  // 终端ANSI亮黄色
"terminal.ansiBrightMagenta": "#bc05bc",  // 终端ANSI亮品红色
```

### 十、输入与按钮（表单类组件）

#### 10.1 输入控件（文本框、复选框、下拉框）

```json
"input.border":                 "#ffffff",  // 输入框边框
"checkbox.border":              "#ffffff",  // 复选框边框
"dropdown.border":              "#ffffff"   // 下拉框边框
"input.foreground":             "#616161",  // 输入框前景
"input.background":             "#ffffff",  // 输入框背景
"checkbox.background":          "#ffffff",  // 复选框背景
"checkbox.foreground":          "#616161",  // 复选框前景
"dropdown.background":          "#ffffff",  // 下拉框背景
"dropdown.foreground":          "#616161",  // 下拉框前景
"inputOption.activeBorder":     "#ffffff",  // 单选/复选框激活边框
"input.placeholderForeground":  "#767676",  // 输入框占位文本前景
"inputOption.activeBackground": "#e6f7ff",  // 单选/复选框激活背景
"inputOption.activeForeground": "#000000",  // 单选/复选框激活前景
```

#### 10.2 按钮

```json
"button.background":                 "#007acc",  // 主按钮背景
"button.foreground":                 "#ffffff",  // 主按钮前景
"button.hoverBackground":            "#0062a3",  // 主按钮悬停背景
"button.secondaryBackground":        "#5f6a79",  // 次要按钮背景
"button.secondaryForeground":        "#ffffff",  // 次要按钮前景
"button.secondaryHoverBackground":   "#4c5561"   // 次要按钮悬停背景
```

### 十一、编辑器弹窗与提示（代码提示、悬浮窗等）

#### 11.1 代码提示（Suggest Widget）

```json
"editorSuggestWidget.border":             "#ececec", // 代码提示边框
"editorSuggestWidget.background":         "#eeeeee", // 代码提示背景
"editorSuggestWidget.foreground":         "#000000", // 代码提示前景
"editorSuggestWidget.selectedBackground": "#d3d3d3"  // 代码提示选中项背景
"editorSuggestWidget.highlightForeground":"#f5871f", // 代码提示高亮项前景
```

#### 11.2 悬浮提示（Hover Widget）

```json
"editorHoverWidget.border":     "#c8c8c8"   // 悬浮提示边框
"editorHoverWidget.foreground": "#616161",  // 悬浮提示前景
"editorHoverWidget.background": "#f3f3f3",  // 悬浮提示背景
```

#### 11.3 Peek 视图（代码跳转预览）

```json
"peekView.border":                         "#007acc", // Peek视图边框
"peekViewTitle.background":                "#ffffff", // Peek视图标题栏背景
"peekViewResult.background":               "#f3f3f3", // Peek视图结果列表背景
"peekViewEditor.background":               "#f2f8fc", // Peek视图编辑器背景
"peekViewResult.fileForeground":           "#1e1e1e", // Peek视图结果文件名前景
"peekViewResult.lineForeground":           "#646465", // Peek视图结果行号前景
"peekViewTitleLabel.foreground":           "#333333", // Peek视图标题文本前景
"peekViewEditorGutter.background":         "#f2f8fc", // Peek视图编辑器gutter背景
"peekViewResult.selectionBackground":      "#e6f7ff", // Peek视图结果选中背景
"peekViewResult.selectionForeground":      "#6c6c6c", // Peek视图结果选中前景
"peekViewEditor.matchHighlightBorder":     "#fff8e1", // Peek视图匹配高亮边框
"peekViewTitleDescription.foreground":     "#888888", // Peek视图标题描述前景
"peekViewEditor.matchHighlightBackground": "#fff8e1", // Peek视图匹配高亮背景
"peekViewResult.matchHighlightBackground": "#fee8cc", // Peek视图结果匹配高亮背景
```

### 十二、快速选择器（Ctrl+P / 搜索等弹窗）

```json
"quickInput.border":              "#e7e7e7",  // 快速选择器边框
"pickerGroup.border":             "#cccedb",  // 选择器分组边框
"quickInput.background":          "#ffffff",  // 快速选择器背景
"quickInput.foreground":          "#616161",  // 快速选择器前景
"pickerGroup.foreground":         "#0066bf"   // 选择器分组标题前景
"quickInputList.focusBackground": "#d6ebff",  // 快速选择器列表选中背景
"quickInputList.focusForeground": "#009688",  // 快速选择器列表选中前景
```

### 十三、通知与提示（右上角通知 / 通知中心）

#### 13.1 基础通知样式

```json
"notifications.border":        "#e7e7e7",  // 通知边框
"notificationToast.border":    "#d5d5d5",  // Toast通知边框
"notifications.foreground":    "#616161",  // 通知前景
"notifications.background":    "#f3f3f3",  // 通知背景
"notificationLink.foreground": "#006ab1"   // 通知内链接前景
```

#### 13.2 通知图标与中心

```json
"notificationCenter.border":           "#d5d5d5",  // 通知中心边框
"notificationsInfoIcon.foreground":    "#75beff",  // 信息通知图标前景
"notificationsErrorIcon.foreground":   "#e51400",  // 错误通知图标前景
"notificationsWarningIcon.foreground": "#e9a700",  // 警告通知图标前景
"notificationCenterHeader.foreground": "#616161",  // 通知中心标题前景
"notificationCenterHeader.background": "#e7e7e7"   // 通知中心标题背景
```

### 十四、调试相关（调试工具栏 / 断点等）

#### 14.1 调试工具栏与异常提示

```json
"debugToolBar.border":               "#d5d5d5",  // 调试工具栏边框
"debugToolBar.background":           "#f3f3f3",  // 调试工具栏背景
"debugExceptionWidget.border":       "#d5d5d5"   // 调试异常提示框边框
"debugExceptionWidget.background":   "#f3f3f3",  // 调试异常提示框背景
```

#### 14.2 断点样式

```json
"debugBreakpoint.foreground":                 "#e51400",  // 普通断点颜色
"debugBreakpoint.enabledForeground":          "#e51400",  // 启用的断点颜色
"debugBreakpoint.unverifiedForeground":       "#e9a700",  // 未验证断点颜色
"debugBreakpoint.currentStackFrameForeground":"#007acc"   // 当前栈帧断点颜色
```

### 十五、Git 相关（版本控制装饰器）

#### 15.1 文本装饰器（文件名颜色）

```json
"gitDecoration.addedResourceForeground":         "#587c0c", // 新增文件前景
"gitDecoration.deletedResourceForeground":       "#ad0707", // 删除文件前景
"gitDecoration.ignoredResourceForeground":       "#8e8e90", // 忽略文件前景
"gitDecoration.modifiedResourceForeground":      "#895503", // 修改文件前景
"gitDecoration.submoduleResourceForeground":     "#1258a7", // 子模块文件前景
"gitDecoration.untrackedResourceForeground":     "#007100", // 未跟踪文件前景
"gitDecoration.conflictingResourceForeground":   "#6c6cc4", // 冲突文件前景
"gitDecoration.stageDeletedResourceForeground":  "#ad0707", // 暂存删除文件前景
"gitDecoration.stageModifiedResourceForeground": "#895503", // 暂存修改文件前景
```

#### 15.2 背景装饰器（文件名背景）

```json
"gitDecoration.modifiedResourceBackground": "#fff8e1", // 修改文件背景
"gitDecoration.untrackedResourceBackground":"#e8f5e9"  // 未跟踪文件背景
```

### 十六、合并与比较（diff 视图）

#### 16.1 Diff 编辑器基础

```json
"diffEditor.border":                "#d7d7d7"    // Diff编辑器边框
"diffEditor.removedTextBackground": "#f29e9e",   // 删除文本背景
"diffEditor.insertedTextBackground":"#fcff9c",   // 新增文本背景
"diffEditor.removedTextBorder":     "#f29e9e",   // 删除文本边框
```

#### 16.2 合并冲突视图

```json
"merge.commonHeaderBackground":   "#BFBFBF",  // 公共部分标题背景
"merge.currentHeaderBackground":  "#A4E3D6",  // 当前分支标题背景
"merge.commonContentBackground":  "#E5E5E5"   // 公共部分内容背景
"merge.currentContentBackground": "#DBF4EF",  // 当前分支内容背景
"merge.incomingHeaderBackground": "#A6CFFF",  // 传入分支标题背景
"merge.incomingContentBackground":"#DBECFF",  // 传入分支内容背景
```

### 十七、小地图（Minimap）

#### 17.1 小地图基础样式

```json
"minimap.background":         "#ffffff",  // 小地图背景
"minimap.errorHighlight":     "#e51400",  // 小地图错误区域高亮
"minimap.warningHighlight":   "#e9a700"   // 小地图警告区域高亮
"minimap.findMatchHighlight": "#eeae34",  // 小地图查找匹配高亮
"minimap.selectionHighlight": "#eeeeee",  // 小地图选中区域高亮
```

#### 17.2 小地图 Gutter（与编辑器 Gutter 对应）

```json
"minimapGutter.addedBackground":     "#81b88b",  // 小地图新增行背景
"minimapGutter.deletedBackground":   "#ca4b51"， // 小地图删除行背景
"minimapGutter.modifiedBackground":  "#66afe0",  // 小地图修改行背景
```

### 十八、扩展市场（Extensions）

```json
"extensionIcon.starForeground":            "#e9a700",  // 扩展星级评分颜色
"extensionButton.prominentBackground":     "#007acc",  // 扩展市场主按钮背景
"extensionButton.prominentForeground":     "#ffffff",  // 扩展市场主按钮前景
"extensionButton.prominentHoverBackground":"#0062a3"   // 扩展市场主按钮悬停背景
```

### 十九、通用 UI 元素（徽章、图标等）

```json
"icon.foreground":  "#616161"   // 全局图标默认前景色
"badge.background": "#c4c4c4",  // 徽章背景（如通知数量）
"badge.foreground": "#333333",  // 徽章前景
```

### 二十、滚动条（跨组件通用）

```json
"scrollbar.shadow":                 "#dddddd",  // 滚动条阴影
"scrollbarSlider.background":       "#a0a0a0",  // 滚动条滑块默认背景
"scrollbarSlider.hoverBackground":  "#808080",  // 滚动条滑块悬停背景
"scrollbarSlider.activeBackground": "#606060"   // 滚动条滑块激活背景
```

### 二十一、设置页面（Settings）

```json
"settings.headerForeground":     "#616161",  // 设置页面标题前景
"settings.focusedRowBackground": "#f0f0f0"   // 设置页面聚焦行背景
```

### 二十二、引导页面（Walkthrough）

```json
"walkThrough.embeddedEditorBackground": "#e0e0e0",  // 引导页嵌入编辑器背景
```