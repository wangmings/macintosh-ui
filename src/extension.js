
const path = require('path')
const utils = require('./utils')
const i18n = require('./utils/i18n')
const patch = require('./utils/patch')
const theme = require('./utils/theme')

// 插件初始化状态
let initStatus = false

// 获取当前语言的消息对象
const { locale } = utils.getLocale()
const { messages, translate: tr } = i18n.loadLocale(locale)



// 应用路径对象
const app = {
  name: 'vscode',
  execFile: 'bin/code',
  inject: {
    dir: 'out/vscode',
    mainFile: 'out/main.js',
    sessionsHtml: 'out/vs/sessions/electron-browser/sessions.html',
    workbenchHtml: 'out/vs/code/electron-browser/workbench/workbench.html'
  },
  desktop: {
    workbench: {
      root: 'out/vs/workbench',
      files: ['workbench.desktop.main.js', 'workbench.desktop.main.css']
    },
    sessions: {
      root: 'out/vs/sessions',
      files: ['sessions.desktop.main.js', 'sessions.desktop.main.css']
    }
  }
}


// 插件配置对象
const ext = {
  backupDir: 'Macintosh-UI-Backup',
  vscodeDir: 'vscode',
  assetsDir: 'vscode/assets',
  themesDir: 'vscode/themes',
  packageFile: 'package.json'

}




/**
 * 初始化插件所有路径与目录结构（异步 ✅）
 * @param {*} ctx 扩展上下文
 */
async function initPlugin(ctx) {

  // 获取运行时基础路径
  const extRoot = ctx.extensionPath
  const { appRoot, homeDir } = utils.getPaths()
  const isTrae = appRoot.includes('Trae')
  
  // 初始化插件路径
  ext.backupDir = path.join(homeDir, ext.backupDir)
  ext.vscodeDir = path.join(extRoot, ext.vscodeDir)
  ext.assetsDir = path.join(extRoot, ext.assetsDir)
  ext.themesDir = path.join(extRoot, ext.themesDir)
  ext.packageFile = path.join(extRoot, ext.packageFile)
  
  // 初始化应用路径
  app.name = isTrae ? 'trae' : 'vscode'
  app.execFile = path.join(appRoot, app.execFile)
  app.inject.dir = path.join(appRoot, app.inject.dir)
  app.inject.mainFile = path.join(appRoot, app.inject.mainFile)
  app.inject.sessionsHtml = path.join(appRoot, app.inject.sessionsHtml)
  app.inject.workbenchHtml = path.join(appRoot, app.inject.workbenchHtml)
  app.desktop.sessions.root = path.join(appRoot, app.desktop.sessions.root)
  app.desktop.workbench.root = path.join(appRoot, app.desktop.workbench.root)

}





// 打开主题配置目录
function openThemeFolder() {
  const folder = ext.vscodeDir
  const status = utils.addWorkspace(folder)
  utils.showMessage(tr(`open.${status}`, { file: folder }))

}





/**
 * 为应用添加或移除补丁
 * @param {boolean} isAdd - 是否添加补丁
 * @returns {Promise<void>}
 */
async function addApplyPatches(isAdd) {
  const sessions = app.desktop.sessions
  const workbench = app.desktop.workbench
  const fonts = utils.getVSFonts()
  const isSetting = fonts.setting.length > 0 ? true : false

  // 给会话添加字体补丁
  if (app.name == 'vscode') {
    for (const file of sessions.files) {
      const filePath = path.join(sessions.root, file)
      await utils.safeModifyFile(isAdd, filePath, async (text) => {
        if (isSetting) {
          return text.replaceAll(fonts.default, fonts.setting)
        }
        return null
      })
    }
  }


  // 给应用添加活动栏补丁
  for (const file of workbench.files) {
    const ext = path.extname(file)
    const filePath = path.join(workbench.root, file)
    await utils.safeModifyFile(isAdd, filePath, async (text) => {
      if (app.name == 'trae') {
        const { data, status } = patch.traeActivityBar(ext, text)
        if (status.fail.length > 0) {
          console.warn(tr('message.activityBar', { err: status }))
          utils.showMessage(tr('patch.activityBar'))
        } else {
          text = data
        }
      }
      if (isSetting) text = text.replaceAll(fonts.default, fonts.setting)
      return text
    })
  }



}




/**
 * 注入 HTML 代码
 * @param {string} type - 代码文件类型（'sessions' 或 'workbench'）
 * @param {string} text - HTML 文本内容
 * @returns {Promise<string | null>} - 注入后的 HTML 文本内容
 */
async function injectHtml(type, text) {
  let injected = []
  const injectDir = app.inject.dir
  const dirs = path.basename(injectDir)
  const injectTag = {
    '.js': '<script async src="{url}"></script>',
    '.css': '<link async rel="stylesheet" href="{url}">',
  }

  if (type === 'sessions') {
    const url = `../../../${dirs}/css/fonts.css`
    const tag = injectTag['.css'].replace('{url}', url)
    injected.push(tag)
  }
  
  if (type === 'workbench') {
    const files = await utils.listFiles(injectDir)
    for (const file of files) {
      const ext = path.extname(file)
      const tag = injectTag[ext]
      if (tag) {
        const url = `../../../../${dirs}/${file}`
        injected.push(tag.replace('{url}', url))
      }
    }
  }

  const title = ['', '<!-- Injected by Macintosh UI -->']
  injected.unshift(...title)
  injected = injected.join('\n\t\t') + '\n\t</head>'
  return text.replaceAll('</head>', injected)

}







/**
 * 应用主题配置
 * @param {boolean} isAdd - 是否添加主题配置
 * @returns {Promise<void>}
 */
async function applyThemeConfig(isAdd) {
  const injectDir = app.inject.dir
  const sessionsHtml = app.inject.sessionsHtml
  const workbenchHtml = app.inject.workbenchHtml

  // 清理已有软链接
  await utils.rm(injectDir)

  if (isAdd) {
    // 更新主题配置
    await theme.updateThemes(ext.themesDir, ext.packageFile)
    // 创建软链接
    await utils.symlink(ext.assetsDir, injectDir)
  }
  

  
  // 为应用添加或移除补丁
  await addApplyPatches(isAdd)

  // 会话字体配置
  if (app.name == 'vscode') {
    await utils.safeModifyFile(isAdd, sessionsHtml, async (text) => {
      return await injectHtml('sessions', text)
    })
  }



  
  // 应用注入的代码文件
  await utils.safeModifyFile(isAdd, workbenchHtml, async (text) => {
    return await injectHtml('workbench', text)
  })


  // 提示用户重启应用或重新加载窗口
  const restart = tr('button.restart')
  const cancel = tr('button.cancel')
  const message = isAdd ? tr('theme.update') : tr('theme.clean')
  utils.showMessage(message, restart, cancel).then(opt => {
    if (opt === restart) utils.restartApp(app.execFile)
  })

}






/**
 * 创建主题备份
 */
async function createThemeBackup() {
  await utils.copyDirs(ext.vscodeDir, ext.backupDir)
  utils.showMessage(tr('theme.backup', { file: ext.backupDir }))
}








/**
 * @param {*} ctx 扩展上下文
 */
async function activate(ctx) {

  // 初始化插件路径
  if (!initStatus) await initPlugin(ctx)
  initStatus = true
  console.log('插件已激活', { ext, app, messages })

  // 检查注入目录是否存在
  if (!await utils.exists(app.inject.dir)) {
    const message = tr('message.inject')
    const confirm = tr('button.confirm')
    const cancel = tr('button.cancel')
    utils.showMessage(message, confirm, cancel).then(async (opt) => {
      if (opt === confirm) await applyThemeConfig(true)
    })
  }

  // 注册所有菜单命令
  utils.regCommands(ctx, {
    'menu.open.config': () => openThemeFolder(),
    'menu.update.config': () => applyThemeConfig(true),
    'menu.clean.config': () => applyThemeConfig(false),
    'menu.backup.config': () => createThemeBackup(),
  })

}




module.exports = {
  activate,
  deactivate: () => console.log('扩展已停用')
}
