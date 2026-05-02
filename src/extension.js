
const fs = require('fs')
const path = require('path')
const theme = require('./theme')
const utils = require('./utils.js')
const activityBar = require('../vscode/patch/activityBar')
const frostedGlass = require('../vscode/patch/frostedGlass')

const { existsSync } = fs
const { updateThemeConfig } = theme
const { traeActivityBar } = activityBar
const { vscodeConfig, setFrostedGlass } = frostedGlass
const {
  homeDir,
  appRoot,
  vscodeExecCmd,
  registerCmd,
  packageJSON,
  addWorkspace,
  copyFolder,
  deleteFolder,
  getFolderItems,
  getVScodeFont,
  setVScodeConfig,
  vscodeRestartApp,
  vscodeShowMessage,
  fileReadWriteBackup,
} = utils






// 插件配置对象
const plugin = {
  messages: {},
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
      .replaceAll('$app', appRoot)
      .replaceAll('$home', homeDir)
      .replaceAll('$workbench', workbenchDir)
    )
  }



  // 解析 VS Code 核心路径
  plugin.vscode.main = parsePath(plugin.vscode.main)
  plugin.vscode.workbench.dir = workbenchDir = parsePath(plugin.vscode.workbench.dir)
  plugin.vscode.desktop.dir = parsePath(plugin.vscode.desktop.dir)
  plugin.vscode.workbench.html = path.join(workbenchDir, plugin.vscode.workbench.html)
  plugin.execFile = parsePath(plugin.execFile)

  // 解析扩展配置路径
  plugin.packFile = parsePath(plugin.packFile)
  plugin.backupDir = parsePath(plugin.backupDir)

  const messages = await packageJSON(plugin.packFile)
  plugin.messages = messages?.contributes?.messages || {}

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
  addWorkspace(folder, (status) => {
    const msg = {
      error: `无效路径: ${folder}`,
      exist: `已在工作区: ${folder}`,
      success: `已添加到工作区: ${folder}`,
    }
    vscodeShowMessage(msg[status])
  })
}





/**
 * 按应用路径执行活动栏补丁
 * @param {boolean} isAdd - 是否添加补丁
 * @returns {Promise<void>}
 */
async function applyActivityBar(isAdd) {
  const {dir, files} = plugin.vscode.desktop
  const {defaultFont, settingFont} = getVScodeFont()
  const isTrae = dir.includes('Trae')
  for (const file of files) {
    const ext = path.extname(file)
    const filePath = path.join(dir, file)
    await fileReadWriteBackup(isAdd, filePath, (text) => {
      if (isTrae) {
        try{
          text = traeActivityBar(ext, text)  
        }catch(err){
          vscodeShowMessage('[TraeCN]: 活动栏补丁添加失败! 当前版本不支持！ 请更新补丁代码!')
          console.error(`[TraeCN]: 活动栏补丁添加失败! ${err.message}`)
        }
      }
      if (settingFont.length > 0) text = text.replaceAll(defaultFont, settingFont)
      return text
    })
  }

}







// 应用主题配置
async function applyThemeConfig(isAdd) {
  // 从插件配置中获取必要路径
  const {vscode, packFile, codeDir, fontDir, themeDir, injectDir, injectFontDir} = plugin

  // 应用活动栏补丁
  await applyActivityBar(isAdd)

  // 获取所有代码文件
  let codeFiles = await getFolderItems(codeDir, 'file')

  // 将配置添加到应用中的HTML文件
  await fileReadWriteBackup(isAdd, vscode.workbench.html, (text) => {
    const tags = codeFiles.map(file => {
      const ext = path.extname(file)
      return {
        '.js': `<script async src=./vscode/${file}></script>`,
        '.css': `<link async rel="stylesheet" href=./vscode/${file}>`
      }[ext] || ''
    })
    const injected = ['', '<!-- Injected by Macintosh UI -->', ...tags].join('\n\t\t') + '\n\t</head>'
    return text.replaceAll('</head>', injected)
  })

  // 应用玻璃效果
  await fileReadWriteBackup(isAdd, vscode.main, (text) => { 
    return setFrostedGlass(text)
  })


  if (isAdd) {
    // 更新主题配置
    await updateThemeConfig(themeDir, packFile)
    // 复制代码文件到应用目录
    await copyFolder(codeDir, injectDir)
    // 复制字体文件到应用目录
    await copyFolder(fontDir, injectFontDir)

  } else {
    // 清理应用目录
    await deleteFolder(injectDir)
  }

  // 提示用户重启应用或重新加载窗口
  const {update, clean, reload, restart} = plugin.messages
  const message = isAdd ? update : clean
  vscodeShowMessage(message, reload, restart).then(opt => {
    if (opt === restart) vscodeRestartApp(plugin.execFile)
    else if (opt === reload) vscodeExecCmd('workbench.action.reloadWindow')
  })

}






/**
 * 创建主题备份
 */
async function createThemeBackup() {
  await copyFolder(plugin.vscodeDir, plugin.backupDir)
  vscodeShowMessage(plugin.messages.backup.replace('%path%', plugin.backupDir))
}





/**
 * 应用玻璃效果
 * @param {boolean} enabled - 是否启用玻璃效果 
 */
function applyFrostedGlass(enabled) {
  const config = enabled ? vscodeConfig["workbench.colorCustomizations"] : {}
  setVScodeConfig('workbench.colorCustomizations', config)
}




/**
 * @param {*} ctx 扩展上下文
 */
async function activate(ctx) {
  try {
    
    // 初始化插件路径
    await initPlugin(ctx)

    // 检查注入目录是否存在
    if (!existsSync(plugin.injectDir)) {
      vscodeShowMessage(plugin.messages.script, 'YES', 'NO').then(opt => {
        if (opt === 'YES') applyThemeConfig(true)
      })
    }

    // 注册所有菜单命令
    registerCmd(ctx, {
      'menu.open.theme': () => openThemeFolder(),
      'menu.update.theme': () => applyThemeConfig(true),
      'menu.clean.theme': () => applyThemeConfig(false),
      'menu.backup.theme': () => createThemeBackup(),
      'menu.on.frostedGlass': () => applyFrostedGlass(true),
      'menu.off.frostedGlass': () => applyFrostedGlass(false)
    })

  } catch (err) {
    console.error('[MACINTOSH-UI]: ', err)
  }
}




module.exports = {
  activate,
  deactivate: () => console.log('扩展已停用')
}
