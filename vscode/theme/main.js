const os = require('os')
const path = require('path')
const fs = require('fs/promises')




/**
 * 更新插件包主题配置
 * @param {string} themeDir - 主题目录
 * @param {string} pkgFile - package.json 配置文件
 * @param {boolean} debug - 是否开启调试模式
 * @returns {Promise<string>} - 更新后的主题配置字符串
 */
async function updateThemeConfig(themeDir, pkgFile, debug = false) {
  const themes = []
  const sp = os.platform() === 'win32' ? '\\' : '/'
  const dir = themeDir.split(sp).slice(-3).join('/')

  // 获取主题目录下的所有 JSON 文件
  const files = await fs.readdir(themeDir)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  for (const file of jsonFiles) {
    const themeFile = path.join(themeDir, file)
    const theme = JSON.parse(await fs.readFile(themeFile, 'utf8'))
    if (!theme.name || !theme.type) {
      console.warn(`[跳过]: 缺少(name, type)必要字段 ${file}`)
      continue
    }

    // 构建主题配置项
    themes.push({
      label: `Apple ${theme.name}`,
      uiTheme: theme.type === 'dark' ? 'vs-dark' : 'vs',
      path: `${dir}/${file}`,
    })
  }

  // 确保至少存在一个有效主题配置
  if (!debug && themes.length > 0){
    const pkg = JSON.parse(await fs.readFile(pkgFile, 'utf8'))
    pkg.contributes ||= {}
    pkg.contributes.themes = themes
  
    // 写入更新后的 package.json
    const updatedJSON = JSON.stringify(pkg, null, 2)
    await fs.writeFile(pkgFile, updatedJSON, 'utf8')

  } 

  return JSON.stringify(themes, null, 2)

}





// 测试更新主题配置
async function test() {
  const baseDir = path.join(__dirname, '..')
  const themesDir = path.join(__dirname, 'json')
  const pkgFile = path.join(path.dirname(baseDir), 'package.json')
 
  console.log('===== 测试更新主题配置 =====')
  const themes = await updateThemeConfig(themesDir, pkgFile, true)
  if (themes.trim().length === 0) console.error('未找到有效主题配置')
  console.log(themes)
  
  
  
}





// 测试更新主题配置
if (require.main === module) test()

module.exports = { updateThemeConfig }
