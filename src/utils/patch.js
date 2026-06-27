const { activityBar, activityBarStyle } = require('../../vscode/patches/activityBar')



/**
 * 获取文本中所有匹配项
 * @param {string} text - 原始文本
 * @param {string|RegExp} pattern - 匹配模式：普通字符串 / 正则表达式
 * @returns {string[]} 匹配结果数组，无匹配返回空数组
 */
function getAllMatches(text, pattern) {
  let regex = pattern
  if (regex instanceof RegExp) {
    const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g'
    regex = new RegExp(regex.source, flags)
  }

  if (typeof regex === 'string') {
    const escaped = regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    regex = new RegExp(escaped, 'g')
  }

  return text.match(regex) || []
}





/**
 * Trae CN 活动栏补丁
 * @param {string} type - 补丁类型，'js' 或 'css'
 * @param {string} text - 目标源码文本
 * @returns {{data: string, status: { fail: string[], success: string[] }}} - 包含应用补丁后的文本和失败补丁列表的对象
 */
function traeActivityBar(type, text) {
  const status = { fail: [], success: []}
  if (type === '.js') {
    for (const patch of activityBar) {
      const matches = getAllMatches(text, patch.search)
      if (matches.length == 1) {
        text = text.replace(patch.search, patch.replace)
        status.success.push(patch.label)
      } else {
        status.fail.push(patch.label)
      }
    }
  } else if (type === '.css') {
    text = `${text}\n${activityBarStyle}`
  }
  return { data: text, status }
}




module.exports = {
  traeActivityBar
}
