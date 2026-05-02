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
 * @param {{desc: string, search?: string|RegExp, replace: string}} options - 替换配置
 * @throws {Error} 如果替换配置无效或未匹配到目标内容
 * @returns {string}
 */
function replaceMatch(text, options) {
  let count = 0
  const { desc, search, replace } = options

  if (search instanceof RegExp) {
    const matches = text.match(search)
    count = matches ? matches.length : 0
    if (count === 0) throw new Error(`应用补丁失败：${desc}，正则未匹配到目标内容`)
  } else if (typeof search === 'string' && search.length > 0) {
    count = countStringMatch(text, search)
    if (count !== 1) throw new Error(`应用补丁失败：${desc}，预期匹配 1 处，实际匹配 ${count} 处`)
  } else {
    throw new Error(`应用补丁失败：${desc}，search 必须提供字符串或正则表达式`)
  }

  return text.replace(search, replace)
}






// 测试 replaceMatch 函数
function test() {
  const stringResult = replaceMatch('hello world', {
    desc: '字符串替换测试',
    search: 'world',
    replace: 'macintosh'
  })

  const regexResult = replaceMatch('setBackgroundColor(window.theme);', {
    desc: '正则替换测试',
    search: /setBackgroundColor\([\w.]+\);/g,
    replace: 'setBackgroundColor("#00000000");'
  })

  console.log('字符串替换结果:', stringResult)
  console.log('正则替换结果:', regexResult)

}


// 测试示例
if (require.main === module) test()






module.exports = { replaceMatch }
