const path = require('path')
const msg = require('./message')
const utils = require('./utils')
const patch = require('../vscode/patch/main')



// 插件配置对象
const plugin = {
  message: {},
  vscode: {
    main: '$app/out/main.js',
    workbench: {
      dir: '$app/out/vs/code/electron-browser/workbench',
      html: 'workbench.html',
    },
    desktop: {
      dir: '$app/out/vs/workbench',
      files: ['workbench.desktop.main.js', 'workbench.desktop.main.css'],
    },
  },

  execFile: '$app/bin/code',
  packFile: '$ext/package.json',
  backupDir: '$home/Macintosh-UI-Backup',


  vscodeDir: '$ext/vscode',
  codeDir: '$ext/vscode/code',
  fontDir: '$ext/vscode/font',
  themeDir: '$ext/vscode/theme',
  injectDir: '$workbench/vscode',
  injectFontDir: '$workbench/vscode/font',

}





/**
 * 初始化插件所有路径与目录结构（异步 ✅）
 * @param {*} ctx 扩展上下文
 */
async function initPlugin(ctx) {
  let workbenchDir = null
  let extRoot = ctx.extensionPath

  // 解析路径中的特殊变量
  const parsePath = (paths) => {
    return path.normalize(paths
      .replaceAll('$ext', extRoot)
      .replaceAll('$app', utils.appRoot)
      .replaceAll('$home', utils.homeDir)
      .replaceAll('$workbench', workbenchDir)
    )
  }


  // 初始化消息
  plugin.message = msg.getMessages()

  // 解析 VS Code 核心路径
  plugin.vscode.main = parsePath(plugin.vscode.main)
  plugin.vscode.workbench.dir = workbenchDir = parsePath(plugin.vscode.workbench.dir)
  plugin.vscode.desktop.dir = parsePath(plugin.vscode.desktop.dir)
  plugin.vscode.workbench.html = path.join(workbenchDir, plugin.vscode.workbench.html)
  plugin.execFile = parsePath(plugin.execFile)

  // 解析扩展配置路径
  plugin.packFile = parsePath(plugin.packFile)
  plugin.backupDir = parsePath(plugin.backupDir)


  // 初始化插件基础目录
  plugin.vscodeDir = parsePath(plugin.vscodeDir)
  plugin.codeDir = parsePath(plugin.codeDir)
  plugin.fontDir = parsePath(plugin.fontDir)
  plugin.themeDir = parsePath(plugin.themeDir)

  // 初始化注入相关目录
  plugin.injectDir = parsePath(plugin.injectDir)
  plugin.injectFontDir = parsePath(plugin.injectFontDir)
}







// 打开主题配置目录
function openThemeFolder() {
  const folder = plugin.vscodeDir
  const status = utils.addWorkspace(folder)
  const message = {
    fail: plugin.message.open.fail,
    exist: plugin.message.open.exist,
    success: plugin.message.open.success,
  }
  utils.showMessage(message[status]?.replace('%path%', folder))

}





/**
 * 按应用路径执行活动栏补丁
 * @param {boolean} isAdd - 是否添加补丁
 * @returns {Promise<void>}
 */
async function applyActivityBar(isAdd) {
  const { dir, files } = plugin.vscode.desktop
  const { defaultFont, settingFont } = utils.getVScodeFonts()
  const isTrae = dir.includes('Trae')
  for (const file of files) {
    const ext = path.extname(file)
    const filePath = path.join(dir, file)
    await utils.readWriteBackupFile(isAdd, filePath, (text) => {
      if (isTrae) {
        try {
          text = patch.traeActivityBar(ext, text)
        } catch (err) {
          utils.showMessage(plugin.message.patch.bar)
          console.error(err.message)
        }
      }
      if (settingFont.length > 0) text = text.replaceAll(defaultFont, settingFont)
      return text
    })
  }

}







/**
 * 应用主题配置
 * @param {boolean} isAdd - 是否添加主题配置
 * @returns {Promise<void>}
 */
async function applyThemeConfig(isAdd) {

  // 从插件配置中获取必要路径
  const { vscode, packFile, codeDir, fontDir, themeDir, injectDir, injectFontDir } = plugin

  // 应用活动栏补丁
  await applyActivityBar(isAdd)

  // 应用玻璃效果补丁
  await utils.readWriteBackupFile(isAdd, vscode.main, (text) => {
    try {
      return patch.frostedGlass(text)
    } catch (err) {
      utils.showMessage(plugin.message.patch.glass)
      console.error(err.message)
    }
  })

  // 应用注入的代码文件
  await utils.readWriteBackupFile(isAdd, vscode.workbench.html, async (text) => {
    let files = await utils.getFolderItems(codeDir, 'file')
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
    await patch.updateThemeConfig(themeDir, packFile)
    // 复制代码文件到应用目录
    await utils.copyFolder(codeDir, injectDir)
    // 复制字体文件到应用目录
    await utils.copyFolder(fontDir, injectFontDir)

  } else {
    // 清理应用目录
    await utils.deleteFolder(injectDir)
  }

  // 提示用户重启应用或重新加载窗口
  const { update, clean } = plugin.message.theme
  const { reload, restart } = plugin.message.button
  const message = isAdd ? update : clean
  utils.showMessage(message, reload, restart).then(opt => {
    if (opt === restart) utils.restartVScodeApp(plugin.execFile)
    else if (opt === reload) utils.execCommand('workbench.action.reloadWindow')
  })

}






/**
 * 创建主题备份
 */
async function createThemeBackup() {
  await utils.copyFolder(plugin.vscodeDir, plugin.backupDir)
  utils.showMessage(plugin.message.theme.backup.replace('%path%', plugin.backupDir))
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
  if (!await utils.exists(plugin.injectDir)) {
    utils.showMessage(plugin.message.script, 'YES', 'NO').then(opt => {
      if (opt === 'YES') applyThemeConfig(true)
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
