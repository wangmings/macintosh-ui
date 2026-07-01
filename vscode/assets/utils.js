// 工具函数
const Utils = new (class Utils {})()


/**
 * 查询 DOM 节点
 * @param {string} selector - 节点选择器
 * @returns {ElementList}  查询到的节点列表
 */
Utils.node = function (selector) {
  return document.querySelectorAll(selector)
}




// 打印日志，支持自定义颜色
Utils.debug = function (opts = {}, ...args) {
  const { enable = true, name = 'LOG', log = '#ffad42', str = "#0edaf0", num = "#f700ff" } = opts || {}
  if (!enable) return
  const t = `color:${log};font-weight:bold`, s = `color:${str}`, n = `color:${num}`
  let tp = `%c${name}:`; const arr = [t]
  args.forEach(i => { const ty = typeof i; ty === 'string' ? (tp += ' %c%s', arr.push(s, i)) : ty === 'number' ? (tp += ' %c%s', arr.push(n, i)) : (tp += ' %o', arr.push(i)) })
  console.log(tp, ...arr)
}




/**
 * 观察 DOM 节点变化
 * @param {Element|string} target - 目标节点或选择器字符串
 * @param {function} callback - 回调函数
 * @param {object} obsConfig - MutationObserver 配置
 * @MutationObserverConfig 
 *  - subtree: true,                        监听整个子树（包括目标节点的所有子节点）
 *  - childList: true,                      监听子节点的添加和删除
 *  - attributes: true,                     监听属性的变化
 *  - characterData: true,                  监听文本节点内容的变化
 *  - attributeOldValue: true,              在属性变化时，记录变化前的旧值
 *  - characterDataOldValue: true,          在文本变化时，记录变化前的旧值
 *  - attributeFilter: ['style', 'class'],  监听与样式相关的属性
 */
Utils.observeNode = function (target, callback, obsConfig) {
  target = typeof target === 'string' ? document.querySelector(target) : target
  if (!target) {console.warn('observeNode: 目标节点不存在!', target); return}
  obsConfig = obsConfig || { subtree: true, childList: true }
  const observer = new MutationObserver((mutations, obs) => {
    for (const mutation of mutations) {
      const enabled = obsConfig[mutation.type]
      if (!enabled) continue
      callback(mutations, obs)
      break 
    }
  })
  observer.observe(target, obsConfig)
}





/**
 * 等待节点加载完成
 * @param {string} selector - 目标节点选择器
 * @param {function} callback - 节点加载回调
 */
Utils.waitNodeLoad = function (selector, callback) {
  Utils.observeNode(document, (_, obs) => {
    const element = document.querySelector(selector)
    if (!element) return
    callback(element)
    obs.disconnect()
  })
}




// 检查是否为 TraeCN 环境
Utils.isTraeCN = function () {
  const target = document.querySelector('head > meta:nth-child(2)')
  return target?.attributes?.content?.textContent?.includes('trae.ai')
}




