/**
 * 应用修复
 * 修复默认语法高亮样式
 * 处理 Trae CN 通知弹窗
 */


// 应用修复
function applyFixes() {

  const DEBUG_ENABLE = true
  const DEBUG_NAME = 'VSCODE-FIX'
  const { debug, waitNodeLoad, observeNode, isTraeCN } = Utils
  const log = (...args) => debug({ enable: DEBUG_ENABLE || false, name: DEBUG_NAME }, ...args)

  // 脚本主逻辑入口
  log('用户自定义修复脚本已加载！')

  // 修复默认语法高亮样式
  waitNodeLoad('.vscode-tokens-styles', (styleNode) => {
    observeNode(styleNode, () => {
      if (!styleNode || !styleNode.textContent) return
      const css = styleNode.textContent
      if (css.includes('.monaco-editor')) return
      styleNode.textContent = css.replaceAll('\n.mtk', '\n.monaco-editor .mtk')
      log('已修复主题语法颜色不准确问题，添加 .monaco-editor 作用域')
    })
  })


  // 处理 Trae CN 通知弹窗
  if (isTraeCN()) {
    log('Trae CN 编辑器环境已检测到')
    waitNodeLoad('.notifications-toasts', (toastNode) => {
      traeNotification(toastNode)
      observeNode(toastNode, traeNotification(toastNode))
    })
  }



  // 处理 Trae CN 通知弹窗
  function traeNotification(toastNode) {
    const notices = [
      { text: '扩展在磁盘上已被修改', message: '已点击: 扩展在磁盘上已被修改。请重新加载窗口。'},
      { text: 'Trae CN 安装似乎损坏。请重新安装。', message: '已点击关闭：Trae CN 安装似乎损坏。请重新安装。'},
    ]

    const items = toastNode.querySelectorAll('.notification-toast-container')
    if (items.length === 0) return

    for (const item of items) {
      const content = item.innerText
      for (const notice of notices) {
        if (content.includes(notice.text) || content === notice.text) {
          item.style.width = '1px'
          item.querySelector('a').click()
          log(notice.message)
        }
      }
    }
  }


}



// 监听 DOM 加载完成事件
document.addEventListener('DOMContentLoaded', applyFixes)
