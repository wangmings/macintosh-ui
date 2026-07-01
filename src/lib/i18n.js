const fs = require('fs')
const path = require('path')


// 语言文件映射
const languageMap = {
  en: 'package.nls.json',
  zh: 'package.nls.zh-cn.json',
}



// 加载国际化语言环境的翻译对象
function loadLocale(locale = 'zh') {
  let name = languageMap[locale]
  if (!name) {
    console.log(`对应语言的文件不存在: ${locale}`)
    name = languageMap['en']
  }

  const file = path.join(__dirname, `../../${name}`)
  const content = fs.readFileSync(file, 'utf8')
  const messages = JSON.parse(content)

  const translate = (key, params) => {
    return messages[key].replace(/{(.*?)}/g, (match, p) => params[p] || match)
  }

  return { messages, translate }
}






// 测试代码
if (require.main === module) {
  const { messages, translate } = loadLocale('zh')
  console.log(messages)
  console.log(translate('open.fail', { file: 'test' }))
  console.log(translate('theme.backup', { file: 'test' }))
}



module.exports = { loadLocale }
