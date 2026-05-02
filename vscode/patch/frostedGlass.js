
// Frosted Glass 磨砂玻璃效果配置
const vscodeConfig = {

  "frostedGlass": {
    "frame": true,                        // 窗口是否显示边框
    "transparent": false,                 // 窗口是否透明
    "vibrancy": "under-window",           // 窗口下模糊效果类型  fullscreen-ui, sidebar, under-window
    "visualEffectState": "active",        // 窗口下模糊效果状态
    "backgroundMaterial": "acrylic",      // 窗口下模糊效果材质
    "backgroundColor": "#00000000",     // 窗口下模糊效果背景颜色
  },

  "workbench.colorCustomizations": {
    // ===================== 一、编辑器核心基础配置 =====================
    "editor.background": "#00000000",                       // 编辑器主背景
    "editor.compositionBorder": "#00000000",                // 编辑器输入法组合输入边框
    "editor.lineHighlightBorder": "#00000000",              // 编辑器选中行边框高亮
    "editorGroup.emptyBackground": "#00000000",             // 无文件打开时编辑器空白背景
    "editor.lineHighlightBackground": "#00000000",          // 编辑器选中行背景高亮
    "editor.selectionHighlightBorder": "#00000000",         // 编辑器选中内容关联高亮边框
    "editorWidget.background": "#1d1c1ef0",                 // 编辑器搜索替换浮窗背景
    "editorHoverWidget.background": "#1d1c1ef0",            // 编辑器悬浮提示框背景
    "editorSuggestWidget.background": "#1d1c1ef0",          // 编辑器代码提示框背景
    "editorStickyScroll.background": "#1d1c1ef0",           // 编辑器粘性滚动背景
    "editorStickyScrollGutter.background": "#1d1c1ef0",     // 编辑器粘性滚动行号区背景
    "editorCursor.foreground": "#76ff67",                   // 编辑器光标颜色
    "editorLineNumber.activeForeground": "#76ff67",         // 编辑器当前行号颜色

    // ===================== 滚动阴影 =====================
    "scrollbar.shadow": "#1d1c1ef0",                        // 滚动条阴影
    "editorStickyScroll.shadow": "#1d1c1ef0",               // 编辑器粘性滚动阴影

    // ===================== 二、所有边框类配置【集中归类 重点】 =====================
    "focusBorder": "#FF678100",                             // 全局聚焦元素外边框
    "tab.border": "#00000000",                              // 标签页之间的分割边框
    "panel.border": "#00000000",                            // 底部面板与编辑器分割边框
    "sideBar.border": "#00000000",                          // 侧边栏与编辑器分割边框
    "titleBar.border": "#00000000",                         // 标题栏与下方内容分割边框
    "statusBar.border": "#00000000",                        // 状态栏与底部面板分割边框
    "editorGroup.border": "#00000000",                      // 编辑器分栏分割边框
    "activityBar.border": "#00000000",                      // 活动栏与侧边栏分割边框
    "sideBarSectionHeader.border": "#00000000",             // 侧边栏分组标题下边框
    "editorGroupHeader.tabsBorder": "#00000000",            // 标签栏与编辑器分割边框
    "sideBarActivityBarTop.border": "#00000000",            // 活动栏与侧边栏顶部分割边框
    "editorWidget.border": "#76ff67",                       // 编辑器搜索替换浮窗边框
    "notifications.border": "#76ff67",                      // 通知弹窗边框
    "editorHoverWidget.border": "#76ff67",                  // 编辑器悬浮提示框边框


    // ===================== 三、标签栏/编辑器分组头配置 =====================
    "tab.hoverBackground": "#1d1c1ef0",                     // 鼠标悬浮标签页背景
    "tab.activeBackground": "#00000000",                    // 活动状态标签页背景
    "tab.inactiveBackground": "#00000000",                  // 非活动状态标签页背景
    "tab.unfocusedActiveBackground": "#00000000",           // 非当前窗口的活动标签页背景
    "tab.unfocusedInactiveBackground": "#00000000",         // 非当前窗口的非活动标签页背景
    "editorGroupHeader.tabsBackground": "#00000000",        // 标签栏整体背景
    "editorGroupHeader.noTabsBackground": "#00000000",      // 关闭标签栏时编辑器分组头背景

    // ===================== 四、左侧边栏/活动栏配置 =====================
    "sideBar.background": "#00000000",                      // 侧边栏整体背景
    "activityBar.background": "#00000000",                  // 活动栏整体背景
    "activityBar.inactiveForeground": "#00000000",          // 活动栏非激活状态图标文字颜色
    "sideBarSectionHeader.background": "#00000000",         // 侧边栏分组标题背景
    "sideBarStickyScroll.background": "#1d1c1ef0",          // 侧边栏粘性滚动背景

    // ===================== 五、底部面板/终端配置 =====================
    "panel.background": "#00000000",                        // 底部面板整体背景
    "terminal.background": "#00000000",                     // 终端面板内部背景
    "terminalStickyScroll.background": "#1d1c1ef0",         // 终端粘性滚动背景

    // ===================== 六、状态栏配置 =====================
    "statusBar.background": "#00000000",                    // 打开文件夹时状态栏背景
    "statusBar.focusBorder": "#00000000",                   // 状态栏聚焦边框
    "statusBar.noFolderBackground": "#00000000",            // 未打开文件夹时状态栏背景
    "statusBar.debuggingBackground": "#00000000",           // 调试运行时状态栏背景

    // ===================== 七、欢迎页/引导页配置 =====================
    "welcomePage.background": "#00000000",                  // 欢迎页整体背景
    "walkThrough.embeddedEditorBackground": "#00000000",    // 引导页内嵌编辑器背景

    // ===================== 八、弹窗/下拉框/菜单配置 =====================
    "dropdown.background": "#00000000",                     // 下拉选择框背景
    "quickInput.background": "#1d1c1e",                     // 快速选择/命令面板背景
    "notifications.background": "#1d1c1ef0",                // 通知弹窗背景
    "minimap.background": "#1d1c1ef0",                      // 迷你地图背景

    // ===================== Trae CN：基础背景颜色 =====================
    "icube--bg-bg-base-default": "#00000000",               // 基础背景颜色

  }

}



const { replaceMatch } = require('./utils')


/**
 * 设置窗口玻璃效果
 * @param {string} text - 要修改的文本
 * @returns {string} - 修改后的文本
 */
function setFrostedGlass(text) {
  const glass = vscodeConfig.frostedGlass
  const bgColor = glass.backgroundColor
  const glassOptions = JSON.stringify(glass).slice(1, -1)
  
  text = replaceMatch(text, {
    desc: '设置窗口玻璃效果',
    search: 'experimentalDarkMode:!0',
    replace: `experimentalDarkMode:!0,${glassOptions}`
  })

  text = replaceMatch(text, {
    desc: '设置窗口玻璃效果,替换背景颜色',
    search: /setBackgroundColor\([\w.]+\);/g,
    replace: `setBackgroundColor("${bgColor}");`
  })
  
  return text
}






module.exports = { 
  vscodeConfig,
  setFrostedGlass 
}
