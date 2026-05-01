const os = require('os')
const path = require('path')
const { readdir, readFile, writeFile } = require('fs/promises')




/**
 * 更新 package.json 主题配置
 * @param {string} themesDir - 主题目录
 * @param {string} pkgFile - 配置文件
 * @returns {Promise<Array>}
 */
async function updateThemeConfig(themesDir, pkgFile) {
  const themes = []
  const sp = os.platform() === 'win32' ? '\\' : '/'
  const dir = themesDir.split(sp).slice(-2).join(sp)

  const readJSON = async (p) => JSON.parse(await readFile(p, 'utf8'))

  try {
    // 获取主题目录下的所有 JSON 文件
    const files = await readdir(themesDir)
    const jsonFiles = files.filter(f => f.endsWith('.json'))

    for (const file of jsonFiles) {
      

      // 读取 JSON 文件内容
      const item = await readJSON(path.join(themesDir, file))
      if (!item.name || !item.type) {
        console.warn(`[跳过]: 缺少(name, type)必要字段 ${file}`)
        continue
      }

      // 构建主题配置项
      themes.push({
        label: `Apple ${item.name}`,
        uiTheme: item.type === 'dark' ? 'vs-dark' : 'vs',
        path: `${dir}/${file}`,
      })
    }

    // 更新 package.json 主题配置
    let config = await readJSON(pkgFile)
    config.contributes ||= {}
    config.contributes.themes = themes

    // 写入更新后的 package.json
    config = JSON.stringify(config, null, 2)
    await writeFile(pkgFile, config)

    console.log(`[成功]: 已同步 ${themes.length} 个主题至 package.json`)
  } catch (err) {
    console.error('[同步失败]:', err)
  }

  return themes
}




module.exports = { updateThemeConfig }
