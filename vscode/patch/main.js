const { updateThemeConfig } = require('./themes.js')
const { windowBlur, activityBar } = require('./config.js')


/**
 * 统计目标片段在文本中的出现次数
 * @param {string} text - 原始文本
 * @param {string} search - 目标片段
 * @returns {number}
 */
function countStringMatch(text, search) {
  if (!search) return 0
  let count = 0
  let index = text.indexOf(search)
  while (index !== -1) {
    count += 1
    index = text.indexOf(search, index + search.length)
  }
  return count
}





/**
 * 按匹配项替换文本中的目标内容
 * @param {string} text - 原始文本
 * @param {{label: string, search?: string|RegExp, replace: string}} patch - 替换配置
 * @throws {Error} 如果替换配置无效或未匹配到目标内容
 * @returns {string}
 */
function replaceMatch(text, patch) {
  let count = 0
  const { label, search, replace } = patch

  if (search instanceof RegExp) {
    const matches = text.match(search)
    count = matches ? matches.length : 0
    if (count === 0) throw new Error(`正则匹配：未匹配到内容，标识：${label}`)
  } else if (typeof search === 'string' && search.length > 0) {
    count = countStringMatch(text, search)
    if (count !== 1) throw new Error(`字符匹配：期待匹配 1 次，实际匹配 ${count} 次，标识：${label}`)
  } else {
    throw new Error('search：必须是字符串或正则表达式')
  }

  return text.replace(search, replace)
}





/**
 * Trae CN 活动栏补丁
 * @param {string} type - 补丁类型，'js' 或 'css'
 * @param {string} text - 目标源码文本
 * @returns {string} 应用补丁后的文本
 */
function traeActivityBar(type, text) {
  if (type === '.js') {
    for (const patch of activityBar.patch) {
      text = replaceMatch(text, patch)
    }
  } else if (type === '.css') {
    text = `${text}\n${activityBar.style}`
  }
  return text
}





/**
 * 窗口玻璃效果
 * @param {string} text - 要修改的文本
 * @returns {string} - 修改后的文本
 */
function frostedGlass(text) {
  for (const patch of windowBlur.patch) {
    text = replaceMatch(text, patch)
  }
  return text
}







module.exports = {
  windowBlur,
  traeActivityBar,
  frostedGlass,
  updateThemeConfig
}
