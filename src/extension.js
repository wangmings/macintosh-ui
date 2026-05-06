const path = require('path')
const utils = require('./utils')
const patch = require('../vscode/patch/main')
const theme = require('../vscode/theme/main')



// 插件配置对象
const plugin = {
  message: {},
  backup: 'Macintosh-UI-Backup',

  // 扩展路径
  ext: {
    vscode: 'vscode',
    core: 'vscode/core',
    theme: 'vscode/theme/json',
    package: 'package.json'
  },

  // 应用路径
  app: {
    exec: 'bin/code',
    main: 'out/main.js',
    workbench: {
      dir: 'out/vs/code/electron-browser/workbench',
      file: 'workbench.html',
      inject: 'vscode'
    },
    desktop: {
      dir: 'out/vs/workbench',
      files: ['workbench.desktop.main.js', 'workbench.desktop.main.css']
    }
  }
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
  const { app, ext } = plugin

  // 初始化消息
  plugin.message = utils.getMessages()
  // 拼接备份路径
  plugin.backup = path.join(homeDir, plugin.backup)

  // 拼接 VS Code 应用路径
  app.exec = path.join(appRoot, app.exec)
  app.main = path.join(appRoot, app.main)
  app.workbench.dir = path.join(appRoot, app.workbench.dir)
  app.desktop.dir = path.join(appRoot, app.desktop.dir)

  // 拼接工作台文件与注入路径
  const workbenchDir = app.workbench.dir
  app.workbench.file = path.join(workbenchDir, app.workbench.file)
  app.workbench.inject = path.join(workbenchDir, app.workbench.inject)

  // 拼接扩展内部路径
  ext.vscode = path.join(extRoot, ext.vscode)
  ext.core = path.join(extRoot, ext.core)
  ext.theme = path.join(extRoot, ext.theme)
  ext.package = path.join(extRoot, ext.package)

  
}





// 打开主题配置目录
function openThemeFolder() {
  const folder = plugin.ext.vscode
  const status = utils.addWorkspace(folder)
  const message = {
    fail: plugin.message.open.fail,
    exist: plugin.message.open.exist,
    success: plugin.message.open.success,
  }
  utils.showMessage(message[status]?.replace('%path%', folder))

}





/**
 * 为VSCode添加补丁
 * @param {boolean} isAdd - 是否添加补丁
 * @returns {Promise<void>}
 */
async function addPatchVSCode(isAdd) {
  const { app, message } = plugin
  const isTrae = app.desktop.dir.includes('Trae')
  const fonts = utils.getVScodeFonts()
  const isSetting = fonts.setting.trim().length > 0 ? true : false

  // 给应用添加活动栏补丁
  for (const file of app.desktop.files) {
    const ext = path.extname(file)
    const filePath = path.join(app.desktop.dir, file)
    await utils.readWriteBackupFile(isAdd, filePath, async (text) => {
      if (isTrae) {
        try {
          text = await patch.traeActivityBar(ext, text)
        } catch (err) {
          console.error(err.message)
          utils.showMessage(message.patch.bar)
        }
      }
      if (isSetting) text = text.replaceAll(fonts.default, fonts.setting)
      return text
    })
  }


  // 给应用添加玻璃效果补丁
  await utils.readWriteBackupFile(isAdd, app.main, async (text) => {
    try {
      return await patch.frostedGlass(text)
    } catch (err) {
      utils.showMessage(message.patch.glass)
      console.error(err.message)
    }
  })

}







/**
 * 应用主题配置
 * @param {boolean} isAdd - 是否添加主题配置
 * @returns {Promise<void>}
 */
async function applyThemeConfig(isAdd) {
  // 从插件配置中获取必要路径
  const { app, ext } = plugin

  // 为VSCode添加补丁
  await addPatchVSCode(isAdd)

  // 应用注入的代码文件
  await utils.readWriteBackupFile(isAdd, app.workbench.file, async (text) => {
    let files = await utils.getFolderItems(ext.core, 'file')
    const tags = files.map(file => {
      const ext = path.extname(file)
      return {
        '.js': `<script async src=./vscode/${file}></script>`,
        '.css': `<link async rel="stylesheet" href=./vscode/${file}>`
      }[ext] || ''
    })
    const injected = ['', '<!-- Injected by Macintosh UI -->', ...tags].join('\n\t\t') + '\n\t</head>'
    return text.replaceAll('</head>', injected)
  })



  if (isAdd) {
    // 更新主题配置
    await theme.updateThemeConfig(ext.theme, ext.package)
    // 复制代码文件到应用目录
    await utils.copyFolder(ext.core, app.workbench.inject)
  } else {
    // 清理应用目录
    await utils.deleteFolder(app.workbench.inject)
  }

  // 提示用户重启应用或重新加载窗口
  const { reload, restart } = plugin.message.button.theme
  const { update, clean } = plugin.message.theme
  const message = isAdd ? update : clean
  utils.showMessage(message, reload, restart).then(opt => {
    if (opt === restart) utils.restartVScodeApp(plugin.app.exec)
    else if (opt === reload) utils.execCommand('workbench.action.reloadWindow')
  })

}






/**
 * 创建主题备份
 */
async function createThemeBackup() {
  const { ext, backup, message } = plugin
  await utils.copyFolder(ext.vscode, backup)
  utils.showMessage(message.theme.backup.replace('%path%', backup))
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
  await initPlugin(ctx)
  console.log('插件已激活', plugin)

  // 检查注入目录是否存在
  if (!await utils.exists(plugin.app.workbench.inject)) {
    const { confirm, cancel } = plugin.message.button.inject
    utils.showMessage(plugin.message.inject, confirm, cancel).then(opt => {
      if (opt === confirm) applyThemeConfig(true)
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
