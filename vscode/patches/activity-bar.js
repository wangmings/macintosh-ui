

// 活动栏补丁配置
const activityBar = [
  {
    // 修复底层配置读取被硬编码为 default 的问题
    label: '移除 activityBar.location 的硬编码',
    search: 'switch(t){case"window.titleBarStyle":return"custom";case"workbench.activityBar.location":return"default"}const s=cXe(i)?i:cXe(e)?e:void 0;return this._configuration.getValue(t,s)}',
    replace: 'switch(t){case"window.titleBarStyle":return"custom"}const s=cXe(i)?i:cXe(e)?e:void 0;return this._configuration.getValue(t,s)}'
  },

  {
    // 扩展活动栏位置配置项，支持 top、bottom、hidden、default
    label: '扩展 activityBar.location 枚举值',
    search: '"workbench.activityBar.location":{type:"string",enum:["default"],default:"default",markdownDescription:u(4885,null),enumDescriptions:[u(4886,null),u(4887,null),u(4888,null),u(4889,null)]}',
    replace: '"workbench.activityBar.location":{type:"string",enum:["top","bottom","hidden","default"],default:"default",markdownDescription:u(4885,null),enumDescriptions:[u(4886,null),u(4887,null),u(4888,null),u(4889,null)]}'
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
    search: 'this.workbenchGrid.setViewVisible(this.soloTitleBarPartView,!1),this.setActivityBarHidden(!1),this.workbenchGrid.removeView(this.auxiliaryBarPartView),',
    replace: 'this.workbenchGrid.setViewVisible(this.soloTitleBarPartView,!1),this.setActivityBarHidden(this.stateModel.getRuntimeValue(ei.ACTIVITYBAR_HIDDEN,!0)),this.stateModel.getRuntimeValue(ei.ACTIVITYBAR_HIDDEN,!0)&&this.workbenchGrid.resizeView(this.activityBarPartView,{height:this.workbenchGrid.getViewSize(this.activityBarPartView).height,width:0}),this.workbenchGrid.removeView(this.auxiliaryBarPartView),'
  },

  {
    // 扣减 header 和 footer 高度，修复侧边栏内容区域布局
    label: '扣减 header 和 footer 高度',
    search: 'const l=new Oi(o-(this.options.horizontalPadding??0)*2,a-s.height-(this.options.verticalPadding??0)*2);',
    replace: 'const l=new Oi(o-(this.options.horizontalPadding??0)*2,a-s.height-n.height-r.height-(this.options.verticalPadding??0)*2);'
  }

]




// 活动栏图标样式隐藏
const activityBarStyle = `
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



module.exports = {
  activityBar,
  activityBarStyle
}


