
const fs = require('fs')
const path = require('path')



/**
 * 初始化国际化语言环境
 * @param {string} lang - 语言代码，默认值为 'zh'
 * @throws {Error} 如果语言文件不存在
 * @returns {{language: string, messages: object, translate: function}} 当前语言、消息对象和翻译函数
 * @example
 * const { language, messages, translate } = setLanguage('en')
 * const openFail = translate('open.fail', { file: '/to/workspace' })
 * console.log(openFail) // 输出：Failed to add to workspace: /to/workspace
 */
function setLanguage(lang = 'zh') {
  const filePath = path.join(__dirname, `./i18n/${lang}.json`)
  if (!fs.existsSync(filePath)) throw new Error(`语言文件不存在：${filePath}`)
  const content = fs.readFileSync(filePath, 'utf8')
  const messages = JSON.parse(content)

  // 翻译函数
  // @ts-ignore
  const translate = (key, params = {}) => {
    let text = messages[key] || null
    if (!text) throw new Error(`翻译键不存在：${key}`)
    Object.keys(params).forEach(k => {
      // @ts-ignore
      text = text.replace(`{${k}}`, params[k])
    })
    return text
  }

  // 返回当前语言、消息对象和翻译函数
  return {language: lang, messages, translate} 
}






// 测试代码
if (require.main === module) {
  const {language, messages, translate} = setLanguage()
  const openFail = translate('open.fail', { file: '/to/workspace' })
  const themeBackup = translate('theme.backup', { file: '/to/workspace.json' })

  console.log('当前语言:', language)
  console.log('消息对象:', messages)
  console.log('打开失败:', openFail)
  console.log('主题备份:', themeBackup)
}



module.exports = { setLanguage }