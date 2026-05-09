const path = require('path')
const utils = require('./utils')
const patch = require('../vscode/patchs/main')
const theme = require('../vscode/themes/main')

// 插件初始化状态
let initStatus = false

// 插件消息对象
const messages = utils.getMessages()


// 应用路径对象
const app = {
  execFile: 'bin/code',
  mainFile: 'out/main.js',
  workbench: {
    rootDir: 'out/vs/code/electron-browser/workbench',
    htmlFile: 'workbench.html',
    injectDir: 'vscode'
  },
  desktop: {
    rootDir: 'out/vs/workbench',
    files: ['workbench.desktop.main.js', 'workbench.desktop.main.css']
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
  const appRoot = utils.appRoot
  const homeDir = utils.homeDir

  // 初始化插件路径
  ext.backupDir = path.join(homeDir, ext.backupDir)
  ext.vscodeDir = path.join(extRoot, ext.vscodeDir)
  ext.assetsDir = path.join(extRoot, ext.assetsDir)
  ext.themesDir = path.join(extRoot, ext.themesDir)
  ext.packageFile = path.join(extRoot, ext.packageFile)

  // 初始化应用路径
  app.execFile = path.join(appRoot, app.execFile)
  app.mainFile = path.join(appRoot, app.mainFile)
  app.desktop.rootDir = path.join(appRoot, app.desktop.rootDir)
  app.workbench.rootDir = path.join(appRoot, app.workbench.rootDir)
  app.workbench.htmlFile = path.join(app.workbench.rootDir, app.workbench.htmlFile)
  app.workbench.injectDir = path.join(app.workbench.rootDir, app.workbench.injectDir)


}





// 打开主题配置目录
function openThemeFolder() {
  const folder = ext.vscodeDir
  const status = utils.addWorkspace(folder)
  utils.showMessage(messages.open[status]?.replace('%path%', folder))

}





/**
 * 为VSCode添加补丁
 * @param {boolean} isAdd - 是否添加补丁
 * @returns {Promise<void>}
 */
async function addPatchVSCode(isAdd) {
  const { rootDir: desktopDir, files: desktopFiles } = app.desktop
  const isTrae = desktopDir.includes('Trae')
  const fonts = utils.getVScodeFonts()
  const isSetting = fonts.setting.length > 0 ? true : false

  // 给应用添加活动栏补丁
  for (const file of desktopFiles) {
    const ext = path.extname(file)
    const filePath = path.join(desktopDir, file)
    await utils.readWriteBackupFile(isAdd, filePath, async (text) => {
      if (isTrae) {
        const { data, status } = patch.traeActivityBar(ext, text)
        if (status.fail.length > 0) {
          console.warn('活动栏补丁失败：', status)
          utils.showMessage(messages.patch.bar)
        } else {
          text = data
        }
      }
      if (isSetting) text = text.replaceAll(fonts.default, fonts.setting)
      return text
    })
  }


  // 给应用添加玻璃效果补丁
  await utils.readWriteBackupFile(isAdd, app.mainFile, async (text) => {
    const { data, status } = patch.frostedGlass(text)
    if (status.fail.length > 0) {
      console.warn('玻璃效果补丁失败：', status)
      utils.showMessage(messages.patch.glass)
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
  const { injectDir, htmlFile } = app.workbench

  // 从插件配置中获取必要路径
  const injectDirName = path.basename(injectDir)

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



  // 应用注入的代码文件
  await utils.readWriteBackupFile(isAdd, htmlFile, async (text) => {
    const files = await utils.getFolderItems(injectDir, 'file')
    if (files.length === 0) return null
    const tags = files.map(file => {
      const url = `./${injectDirName}/${file}`
      return {
        '.js': `<script async src=${url}></script>`,
        '.css': `<link async rel="stylesheet" href=${url}>`
      }[path.extname(file)] || ''
    })
    const injected = ['', '<!-- Injected by Macintosh UI -->', ...tags].join('\n\t\t') + '\n\t</head>'
    return text.replaceAll('</head>', injected)
  })





  // 提示用户重启应用或重新加载窗口
  const { restart, reload } = messages.button.themes
  const message = isAdd ? messages.theme.update : messages.theme.clean
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
  utils.showMessage(messages.theme.backup.replace('%path%', ext.backupDir))
}





/**
 * 应用玻璃效果
 * @param {boolean} enabled - 是否启用玻璃效果 
 */
function applyFrostedGlass(enabled) {
  const config = enabled ? patch.windowBlur.workbenchCustomColors : {}
  utils.setVScodeConfig('workbench.colorCustomizations', config)
}






/**
 * @param {*} ctx 扩展上下文
 */
async function activate(ctx) {

  // 初始化插件路径
  if (!initStatus) await initPlugin(ctx)
  initStatus = true
  console.log('插件已激活', {ext, app, messages})

  // 检查注入目录是否存在
  if (!await utils.exists(app.workbench.injectDir)) {
    const { confirm, cancel } = messages.button.inject
    utils.showMessage(messages.inject, confirm, cancel).then(async (opt) => {
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
