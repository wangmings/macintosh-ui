
/**
 * 统计目标片段在文本中的出现次数
 * @param {string} text - 原始文本
 * @param {string} search - 目标片段
 * @returns {number}
 */
function countMatch(text, search) {
  if (!search) return 0
  let count = 0
  let index = 0
  while (true) {
    index = text.indexOf(search, index)
    if (index === -1) return count
    count += 1
    index += search.length
  }
}





/**
 * 执行一次精确替换
 * @param {string} text - 原始文本
 * @param {string} from - 待替换片段
 * @param {string} to - 替换后的片段
 * @param {string} label - 替换标识
 * @throws {Error} 如果替换片段出现次数不是 1 次
 * @returns {string}
 */
function replaceOne(text, from, to, label) {
  const count = countMatch(text, from)
  if (count !== 1) throw new Error(`${label} expected 1 match, got ${count}`)
  return text.replace(from, to)
}







/**
 * 对目标源码应用活动栏补丁
 * @param {string} text - 目标源码文本
 * @returns {string} 应用补丁后的文本
 */
function activityBar(text) {

  // 修复底层配置读取被硬编码为 default 的问题
  text = replaceOne(
    text,
    'switch(t){case"window.titleBarStyle":return"custom";case"workbench.activityBar.location":return"default"}const s=GYe(i)?i:GYe(e)?e:void 0;return this.m.getValue(t,s)}',
    'switch(t){case"window.titleBarStyle":return"custom"}const s=GYe(i)?i:GYe(e)?e:void 0;return this.m.getValue(t,s)}',
    'remove hardcoded activityBar.location'
  )

  // 扩展活动栏位置配置项，支持 top、bottom、hidden、default
  text = replaceOne(
    text,
    '"workbench.activityBar.location":{type:"string",enum:["default"],default:"default",markdownDescription:d(4838,null),enumDescriptions:[d(4839,null),d(4840,null),d(4841,null),d(4842,null)]}',
    '"workbench.activityBar.location":{type:"string",enum:["top","bottom","hidden","default"],default:"default",markdownDescription:d(4838,null),enumDescriptions:[d(4839,null),d(4840,null),d(4841,null),d(4842,null)]}',
    'extend activityBar.location enum'
  )

  // 在侧边栏创建阶段接管 top 和 bottom 模式的内嵌路径
  text = replaceOne(
    text,
    'create(e){switch(this.q.partId){case"workbench.parts.sidebar":{if(this.C.isSoloMode)return this.g.create(e);const t=document.createElement("div");this.f?.create(t),this.m.enableBuiltinCompositeBar&&e.appendChild(t);const s=document.createElement("div");s.classList.add("icube-sidebar-separator"),e.appendChild(s);const n=document.createElement("div");return n.classList.toggle("third-party"),this.g.create(n),e.appendChild(n),e}}return this.g.create(e)}',
    'create(e){switch(this.q.partId){case"workbench.parts.sidebar":{if(this.C.isSoloMode)return this.g.create(e);const t=this.q.Yc.getValue("workbench.activityBar.location");if(t==="top"||t==="bottom")return this.g.create(e);const s=document.createElement("div");this.f?.create(s),this.m.enableBuiltinCompositeBar&&e.appendChild(s);const n=document.createElement("div");n.classList.add("icube-sidebar-separator"),e.appendChild(n);const r=document.createElement("div");return r.classList.toggle("third-party"),this.g.create(r),e.appendChild(r),e}}return this.g.create(e)}',
    'sidebar create top-bottom branch'
  )

  // 调整可见活动项数量计算，为额外注入项预留位置
  text = replaceOne(
    text,
    'for(let h=0;h<s.length;h++){const u=this.J.get(s[h])+6;if(o+u>a){n=h;break}o+=u}for(r>n&&(s=s.slice(0,n)),this.w.activeItem&&s.every(h=>!!this.w.activeItem&&h!==this.w.activeItem.id)&&(o+=this.J.get(this.w.activeItem.id),s.push(this.w.activeItem.id));o>a&&s.length;){',
    'for(let h=0;h<s.length;h++){const u=this.J.get(s[h])+6;if(o+u>a){n=h;break}o+=u}if(n>0&&n<s.length)n++;for(r>n&&(s=s.slice(0,n)),this.w.activeItem&&s.every(h=>!!this.w.activeItem&&h!==this.w.activeItem.id)&&(o+=this.J.get(this.w.activeItem.id),s.push(this.w.activeItem.id));o>a&&s.length;){',
    'visible items count adjustment'
  )

  // 在 SOLO 恢复到 IDE 时按运行时值恢复活动栏显隐状态
  text = replaceOne(
    text,
    'this.workbenchGrid.setViewVisible(this.J,!1),this.nc(!1),this.workbenchGrid.removeView(this.Q),',
    'this.workbenchGrid.setViewVisible(this.J,!1),this.nc(this.zb.getRuntimeValue(Zt.ACTIVITYBAR_HIDDEN,!0)),this.workbenchGrid.removeView(this.Q),',
    'solo to ide restore activitybar hidden runtime'
  )

  // 扣减 header 和 footer 高度，修复侧边栏内容区域布局
  text = replaceOne(
    text,
    'const c=new Pi(o-(this.e.horizontalPadding??0)*2,a-s.height-(this.e.verticalPadding??0)*2);',
    'const c=new Pi(o-(this.e.horizontalPadding??0)*2,a-s.height-n.height-r.height-(this.e.verticalPadding??0)*2);',
    'content height deduction with header and footer'
  )

  return text
}





/**
 * 对目标源码应用活动栏样式补丁
 * @param {string} text - 目标源码文本
 * @returns {string} 应用补丁后的文本
 */
function activityBarStyle(text) {
  let style = `
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
  
  // style = style
  //   .replace(/\s+/g, ' ')
  //   .replace(/\s*([{}:;,>])\s*/g, '$1')
  //   .trim()

  return `${text}\n${style}`
}



/**
 * 对目标源码应用活动栏补丁
 * @param {string} type - 补丁类型，'js' 或 'css'
 * @param {string} text - 目标源码文本
 * @returns {string} 应用补丁后的文本
 */
function traeActivityBar(type, text) {
  if(type === '.js'){
    text = activityBar(text)
  }else if(type === '.css'){
    text = activityBarStyle(text)
  }
  return text
}




module.exports = { traeActivityBar }
