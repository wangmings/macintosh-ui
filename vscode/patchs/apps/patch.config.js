
// 活动栏补丁配置
const activityBar = {
  patch: [
    {
      // 修复底层配置读取被硬编码为 default 的问题
      label: '移除 activityBar.location 的硬编码',
      search: 'switch(t){case"window.titleBarStyle":return"custom";case"workbench.activityBar.location":return"default"}const s=TJe(i)?i:TJe(e)?e:void 0;return this._configuration.getValue(t,s)}',
      replace: 'switch(t){case"window.titleBarStyle":return"custom"}const s=TJe(i)?i:TJe(e)?e:void 0;return this._configuration.getValue(t,s)}'
    },

    {
      // 扩展活动栏位置配置项，支持 top、bottom、hidden、default
      label: '扩展 activityBar.location 枚举值',
      search: '"workbench.activityBar.location":{type:"string",enum:["default"],default:"default",markdownDescription:u(4877,null),enumDescriptions:[u(4878,null),u(4879,null),u(4880,null),u(4881,null)]}',
      replace: '"workbench.activityBar.location":{type:"string",enum:["top","bottom","hidden","default"],default:"default",markdownDescription:u(4877,null),enumDescriptions:[u(4878,null),u(4879,null),u(4880,null),u(4881,null)]}'
    },

    {
      // 在侧边栏创建阶段接管 top 和 bottom 模式的内嵌路径
      label: '为侧边栏创建逻辑添加 top 和 bottom 分支',
      search: 'create(e){switch(this.paneCompositePart.partId){case"workbench.parts.sidebar":{if(this.layoutService.isSoloModeOrSoloLite)return this.compositeBar.create(e);const t=document.createElement("div");this.builtinCompositeBar?.create(t),this.options.enableBuiltinCompositeBar&&e.appendChild(t);const s=document.createElement("div");s.classList.add("icube-sidebar-separator"),e.appendChild(s);const n=document.createElement("div");return n.classList.toggle("third-party"),this.compositeBar.create(n),e.appendChild(n),e}}return this.compositeBar.create(e)}',
      replace: 'create(e){switch(this.paneCompositePart.partId){case"workbench.parts.sidebar":{if(this.layoutService.isSoloModeOrSoloLite)return this.compositeBar.create(e);const t=this.layoutService.configurationService.getValue("workbench.activityBar.location");if(t==="top"||t==="bottom")return this.compositeBar.create(e);const s=document.createElement("div");this.builtinCompositeBar?.create(s),this.options.enableBuiltinCompositeBar&&e.appendChild(s);const n=document.createElement("div");n.classList.add("icube-sidebar-separator"),e.appendChild(n);const r=document.createElement("div");return r.classList.toggle("third-party"),this.compositeBar.create(r),e.appendChild(r),e}}return this.compositeBar.create(e)}'
    },

    {
      // 调整可见活动项数量计算，为额外注入项预留位置
      label: '调整可见活动项数量计算',
      search: 'for(let d=0;d<s.length;d++){const h=this.compositeSizeInBar.get(s[d])+6;if(o+h>a){n=d;break}o+=h}for(r>n&&(s=s.slice(0,n)),this.model.activeItem&&s.every(d=>!!this.model.activeItem&&d!==this.model.activeItem.id)&&(o+=this.compositeSizeInBar.get(this.model.activeItem.id),s.push(this.model.activeItem.id));o>a&&s.length;){',
      replace: 'for(let d=0;d<s.length;d++){const h=this.compositeSizeInBar.get(s[d])+6;if(o+h>a){n=d;break}o+=h}if(n>0&&n<s.length)n++;for(r>n&&(s=s.slice(0,n)),this.model.activeItem&&s.every(d=>!!this.model.activeItem&&d!==this.model.activeItem.id)&&(o+=this.compositeSizeInBar.get(this.model.activeItem.id),s.push(this.model.activeItem.id));o>a&&s.length;){'
    },

    {
      // 在 SOLO 恢复到 IDE 时按运行时值恢复活动栏显隐状态
      label: '从 SOLO 恢复到 IDE 时恢复活动栏运行时显隐状态',
      search: 'this.stateModel.getRuntimeValue(ei.ACTIVITYBAR_HIDDEN,!0)||this.setActivityBarHidden(!1)',
      replace: 'this.setActivityBarHidden(this.stateModel.getRuntimeValue(ei.ACTIVITYBAR_HIDDEN,!0))'
    },

    {
      // 扣减 header 和 footer 高度，修复侧边栏内容区域布局
      label: '扣减 header 和 footer 高度',
      search: 'const l=new Oi(o-(this.options.horizontalPadding??0)*2,a-s.height-(this.options.verticalPadding??0)*2);',
      replace: 'const l=new Oi(o-(this.options.horizontalPadding??0)*2,a-s.height-n.height-r.height-(this.options.verticalPadding??0)*2);'
    }

  ],

  style: `
    /* 活动栏图标样式隐藏 */
    .monaco-workbench .part.sidebar .icube-sidebar-separator,
    .monaco-workbench .part.sidebar .composite-bar .actions-container .active-item-indicator {
      display: none;
    }

    /* 活动栏图标样式 */
    .monaco-workbench .part.sidebar>.header-or-footer>.composite-bar-container>.composite-bar>.monaco-action-bar .action-item.icon {
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 4px;
      margin-left: 3px;
      margin-right: 3px;
    }
    
    /* 活动栏图标选中样式 */
    .monaco-workbench .part.sidebar>.header-or-footer>.composite-bar-container>.composite-bar>.monaco-action-bar .action-item.icon.checked {
      background-color: var(--vscode-icube--bg-bg-overlay-l3);
    }
    
    /* 活动栏图标悬停样式 */
    .monaco-workbench .part.sidebar>.header-or-footer>.composite-bar-container>.composite-bar>.monaco-action-bar .action-item.icon:hover {
      background-color: var(--vscode-icube--bg-bg-overlay-l2);
    }
    
    /* 活动栏图标大小样式 */
    .monaco-workbench .part.sidebar .composite.has-composite-bar.header .composite-bar .action-label {
      font-size: 18px;
    }

    /* 活动栏图标布局样式 */
    .monaco-workbench .pane-composite-part>.header-or-footer .composite-bar-container {
      flex: 1;
      justify-content: left;
    }
  `
}










// 窗口模糊效果配置
const windowBlur = {
  patch: [],

  // 窗口玻璃效果配置
  frostedGlass: {
    "frame": true,                        // 窗口是否显示边框
    "transparent": false,                 // 窗口是否透明
    "vibrancy": "under-window",           // 窗口下模糊效果类型  fullscreen-ui, sidebar, under-window
    "visualEffectState": "active",        // 窗口下模糊效果状态
    "backgroundMaterial": "acrylic",      // 窗口下模糊效果材质
    "backgroundColor": "#00000000",     // 窗口下模糊效果背景颜色
  },


  // 工作台自定义颜色配置
  workbenchCustomColors: {
    // 一、编辑器核心基础配置
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

    // 滚动阴影
    "scrollbar.shadow": "#1d1c1ef0",                        // 滚动条阴影
    "editorStickyScroll.shadow": "#1d1c1ef0",               // 编辑器粘性滚动阴影

    // 二、所有边框类配置【集中归类 重点】
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


    // 三、标签栏/编辑器分组头配置
    "tab.hoverBackground": "#1d1c1ef0",                     // 鼠标悬浮标签页背景
    "tab.activeBackground": "#00000000",                    // 活动状态标签页背景
    "tab.inactiveBackground": "#00000000",                  // 非活动状态标签页背景
    "tab.unfocusedActiveBackground": "#00000000",           // 非当前窗口的活动标签页背景
    "tab.unfocusedInactiveBackground": "#00000000",         // 非当前窗口的非活动标签页背景
    "editorGroupHeader.tabsBackground": "#00000000",        // 标签栏整体背景
    "editorGroupHeader.noTabsBackground": "#00000000",      // 关闭标签栏时编辑器分组头背景

    // 四、左侧边栏/活动栏配置
    "sideBar.background": "#00000000",                      // 侧边栏整体背景
    "activityBar.background": "#00000000",                  // 活动栏整体背景
    "activityBar.inactiveForeground": "#00000000",          // 活动栏非激活状态图标文字颜色
    "sideBarSectionHeader.background": "#00000000",         // 侧边栏分组标题背景
    "sideBarStickyScroll.background": "#1d1c1ef0",          // 侧边栏粘性滚动背景

    // 五、底部面板/终端配置
    "panel.background": "#00000000",                        // 底部面板整体背景
    "terminal.background": "#00000000",                     // 终端面板内部背景
    "terminalStickyScroll.background": "#1d1c1ef0",         // 终端粘性滚动背景

    // 六、状态栏配置
    "statusBar.background": "#00000000",                    // 打开文件夹时状态栏背景
    "statusBar.focusBorder": "#00000000",                   // 状态栏聚焦边框
    "statusBar.noFolderBackground": "#00000000",            // 未打开文件夹时状态栏背景
    "statusBar.debuggingBackground": "#00000000",           // 调试运行时状态栏背景

    // 七、欢迎页/引导页配置
    "welcomePage.background": "#00000000",                  // 欢迎页整体背景
    "walkThrough.embeddedEditorBackground": "#00000000",    // 引导页内嵌编辑器背景

    // 八、弹窗/下拉框/菜单配置
    "dropdown.background": "#00000000",                     // 下拉选择框背景
    "quickInput.background": "#1d1c1e",                     // 快速选择/命令面板背景
    "notifications.background": "#1d1c1ef0",                // 通知弹窗背景
    "minimap.background": "#1d1c1ef0",                      // 迷你地图背景

    // Trae CN：基础背景颜色
    "icube--bg-bg-base-default": "#00000000",               // 基础背景颜色

  }

}


// 窗口玻璃效果配置
windowBlur.patch = [
  {
    label: '设置窗口玻璃效果',
    search: 'experimentalDarkMode:!0',
    replace: `experimentalDarkMode:!0,${JSON.stringify(windowBlur.frostedGlass).slice(1, -1)}`
  },
  {
    label: '设置窗口玻璃效果,替换背景颜色',
    search: /setBackgroundColor\([\w.]+\);/g,
    replace: `setBackgroundColor("${windowBlur.frostedGlass.backgroundColor}");`
  }
]




// console.log(windowBlur.patch)


module.exports = { 
  windowBlur,
  activityBar 
}
