const fs = require('fs')
const path = require('path')


// 语言文件映射
const languageMap = {
  en: 'package.nls.json',
  zh: 'package.nls.zh-cn.json',
}



/**
 * 加载国际化语言环境
 * @param {string} locale - 语言代码，默认值为 'zh'
 * @returns {{ messages: object, translate: function }}  当前消息对象, 如果语言文件不存在则返回空对象
 */
function loadLocale(locale = 'zh') {
  let name = languageMap[locale]
  if (!name) {
    console.warn(`未找到“${locale}”语言对应的文件，使用默认语言`)
    name = languageMap['en']
  }

  const file = path.join(__dirname, `../../${name}`)
  const content = fs.readFileSync(file, 'utf8')
  const messages = JSON.parse(content)
 
  // 翻译函数
  const translate = (key, params = {}) => {
    let text = messages[key]
    if (!text) throw new Error(`翻译键不存在: ${key}`)
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k])
    })
    return text
  }

  return { messages, translate }
}






// 测试代码
if (require.main === module) {
  const { messages,translate:tr} = loadLocale()
  const openFail = tr('open.fail', { file: '/to/workspace' })
  const themeBackup = tr('theme.backup', { file: '/to/workspace.json' })
  console.log(messages)
  console.log(openFail)
  console.log(themeBackup)
}



module.exports = { loadLocale }
