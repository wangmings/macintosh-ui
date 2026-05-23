
const path = require('path')
const utils = require('./utils')
const i18n = require('./locales/il8n')
const patch = require('../vscode/patchs/patch')
const theme = require('../vscode/themes/theme')



// 插件初始化状态
let initStatus = false


// 获取当前语言的消息对象
const { locale } = utils.getLanguage()
const { messages, translate:t } = i18n.setLanguage(locale)



// 应用路径对象
const app = {
  execFile: 'bin/code',
  inject: {
    dir: 'out/vs/_vscode',
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
  themesDir: 'vscode/themes/json',
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

  // 初始化插件路径
  ext.backupDir = path.join(homeDir, ext.backupDir)
  ext.vscodeDir = path.join(extRoot, ext.vscodeDir)
  ext.assetsDir = path.join(extRoot, ext.assetsDir)
  ext.themesDir = path.join(extRoot, ext.themesDir)
  ext.packageFile = path.join(extRoot, ext.packageFile)

  // 初始化应用路径
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
  utils.showMessage(t(`open.${status}`, { file: folder }))

}





/**
 * 为VSCode添加补丁
 * @param {boolean} isAdd - 是否添加补丁
 * @returns {Promise<void>}
 */
async function addPatchVSCode(isAdd) {
  const sessions = app.desktop.sessions
  const workbench = app.desktop.workbench
  const isTrae = workbench.root.includes('Trae')
  const fonts = utils.getVScodeFonts()
  const isSetting = fonts.setting.length > 0 ? true : false
  
  // 给会话添加字体补丁
  for (const file of sessions.files) {
    const filePath = path.join(sessions.root, file)
    // @ts-ignore
    await utils.readWriteBackupFile(isAdd, filePath, async (text) => {
      if (isSetting){
        return text.replaceAll(fonts.default, fonts.setting)
      }
      return null
    })
  }


  // 给应用添加活动栏补丁
  for (const file of workbench.files) {
    const ext = path.extname(file)
    const filePath = path.join(workbench.root, file)
    // @ts-ignore
    await utils.readWriteBackupFile(isAdd, filePath, async (text) => {
      if (isTrae) {
        const { data, status } = patch.activityBar(ext, text)
        if (status.fail.length > 0) {
          console.warn('活动栏补丁失败：', status)
          utils.showMessage(t('patch.activityBar'))
        } else {
          text = data
        }
      }
      if (isSetting) text = text.replaceAll(fonts.default, fonts.setting)
      return text
    })
  }


  // 给应用添加玻璃效果补丁
  // @ts-ignore
  await utils.readWriteBackupFile(isAdd, app.inject.mainFile, async (text) => {
    const { data, status } = patch.frostedGlass(text)
    if (status.fail.length > 0) {
      console.warn(t('message.glass', { err: status }))
      utils.showMessage(t('patch.glass'))
    } else {
      text = data
    }
    return text
  })

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
  


  // 为VSCode添加补丁
  await addPatchVSCode(isAdd)

  if (isAdd) {
    // 更新主题配置
    await theme.updateThemeConfig(ext.themesDir, ext.packageFile)
    // 复制代码文件到应用目录
    await utils.copyFolder(ext.assetsDir, injectDir)
  } else {
    // 清理应用目录
    await utils.deleteFolder(injectDir)
  }


  const injectFiles = await utils.getFolderItems(injectDir, 'file')
  if (injectFiles.length > 0) {
    const dirs = path.basename(injectDir)
    const injectArr = ['', '<!-- Injected by Macintosh UI -->']

    // 应用字体配置
    // @ts-ignore
    await utils.readWriteBackupFile(isAdd, sessionsHtml, async (text) => {
      const fontsUrl = `../../${dirs}/fonts.css`
      let injected = [...injectArr, `<link async rel="stylesheet" href=${fontsUrl}>`]
      // @ts-ignore
      injected = injected.join('\n\t\t') + '\n\t</head>'
      return text.replaceAll('</head>', injected)
    })



    // 应用注入的代码文件
    // @ts-ignore
    await utils.readWriteBackupFile(isAdd, workbenchHtml, async (text) => {
      const tags = injectFiles.map(file => {
        const url = `../../../${dirs}/${file}`
        return {
          '.js': `<script async src=${url}></script>`,
          '.css': `<link async rel="stylesheet" href=${url}>`
        }[path.extname(file)] || ''
      })
      let injected = [...injectArr, ...tags]
      // @ts-ignore
      injected = injected.join('\n\t\t') + '\n\t</head>'
      return text.replaceAll('</head>', injected)
    })

  }





  // 提示用户重启应用或重新加载窗口
  const restart = t('button.restart')
  const reload = t('button.reload')
  const message = isAdd ? t('theme.update') : t('theme.clean')
  utils.showMessage(message, reload, restart).then(opt => {
    if (opt === restart) utils.restartVScodeApp(app.execFile)
    else if (opt === reload) utils.execCommand('workbench.action.reloadWindow')
  })

}






/**
 * 创建主题备份
 */
async function createThemeBackup() {
  await utils.copyFolder(ext.vscodeDir, ext.backupDir)
  utils.showMessage(t('theme.backup', { file: ext.backupDir }))
}





/**
 * 应用玻璃效果
 * @param {boolean} enabled - 是否启用玻璃效果 
 */
function applyFrostedGlass(enabled) {
  const config = enabled ? patch.window.workbenchCustomColors : {}
  utils.setVScodeConfig('workbench.colorCustomizations', config)
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
    const message = t('inject.message')
    const confirm = t('button.confirm')
    const cancel = t('button.cancel')
    utils.showMessage(message, confirm, cancel).then(async (opt) => {
      if (opt === confirm) await applyThemeConfig(true)
    })
  }

  // 注册所有菜单命令
  utils.registerCmd(ctx, {
    'menu.open.theme': () => openThemeFolder(),
    'menu.update.theme': () => applyThemeConfig(true),
    'menu.clean.theme': () => applyThemeConfig(false),
    'menu.backup.theme': () => createThemeBackup(),
    'menu.glass.enable': () => applyFrostedGlass(true),
    'menu.glass.disable': () => applyFrostedGlass(false)
  })

}




module.exports = {
  activate,
  deactivate: () => console.log('扩展已停用')
}
