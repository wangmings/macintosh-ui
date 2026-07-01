
const path = require('path')
const i18n = require('./lib/i18n')
const utils = require('./lib/utils')
const patch = require('./lib/patch')
const theme = require('./lib/theme')

// 插件初始化状态
let initStatus = false

// 获取当前语言的翻译对象
const { locale } = utils.locales()
const {messages, translate: tr } = i18n.loadLocale(locale)



// 应用路径对象
const app = {
  name: 'vscode',
  execFile: 'bin/code',
  inject: {
    dir: 'out/vscode',
    main: 'out/main.js',
    files: ['fonts.css', 'style.css', 'utils.js', 'fixes.js'],
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
  backupDir: 'macintosh-ui-bak',
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
  ext.vscodeDir = path.join(extRoot, ext.vscodeDir)
  ext.assetsDir = path.join(extRoot, ext.assetsDir)
  ext.themesDir = path.join(extRoot, ext.themesDir)
  ext.packageFile = path.join(extRoot, ext.packageFile)
  
  // 初始化备份目录
  const { json } = await utils.packageJSON(ext.packageFile)
  ext.backupDir = path.join(homeDir, `${ext.backupDir}-${json.version}`)
  
  
  
  // 初始化应用路径
  app.name = isTrae ? 'trae' : 'vscode'
  app.execFile = path.join(appRoot, app.execFile)
  app.inject.dir = path.join(appRoot, app.inject.dir)
  app.inject.main = path.join(appRoot, app.inject.main)
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
    await utils.safeModifyFile(isAdd, filePath, async (content) => {
      if (app.name == 'trae') {
        const { data, status } = patch.traeActivityBar(ext, content)
        if (status.fail.length > 0) {
          console.warn(tr('message.activityBar', { err: status }))
          utils.showMessage(tr('patch.activityBar'))
        } else {
          content = data
        }
      }
      if (isSetting) content = content.replaceAll(fonts.default, fonts.setting)
      return content
    })
  }



}




/**
 * 注入 HTML 代码
 * @param {string} type - 代码文件类型（'sessions' 或 'workbench'）
 * @param {string} content - HTML 文本内容
 * @returns {Promise<string | null>} - 注入后的 HTML 文本内容
 */
async function injectHtml(type, content, targetFile) {
  let injected = []
  const relatPath = utils.relativePath(app.inject.dir, targetFile)
  const injectTag = {
    '.js': `<script async src="${relatPath}/$file"></script>`,
    '.css': `<link async rel="stylesheet" href="${relatPath}/css/$file">`,
  }

  // 注入会话字体文件
  if (type === 'sessions') {
    const tag = injectTag['.css'].replace('$file', 'fonts.css') 
    injected.push(tag)
  }

  // 注入工作台代码文件
  if (type === 'workbench') {
    for (const file of app.inject.files) {
      const tag = injectTag[path.extname(file)]
      injected.push(tag.replace('$file', file))
    }
  }

  injected = ['', '<!-- Injected by Macintosh UI -->', ...injected]
  const code = injected.join('\n\t\t') + '\n\t</head>'
  return content.replaceAll('</head>', code)

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
    // 同步主题配置
    await theme.syncThemes(ext.themesDir, ext.packageFile)
    // 创建软链接
    await utils.symlink(ext.assetsDir, injectDir)
  }
  

  
  // 为应用添加或移除补丁
  await addApplyPatches(isAdd)

  // 会话字体配置
  if (app.name == 'vscode') {
    await utils.safeModifyFile(isAdd, sessionsHtml, async (content, targetFile) => {
      return await injectHtml('sessions', content, targetFile)
    })
  }



  
  // 应用注入的代码文件
  await utils.safeModifyFile(isAdd, workbenchHtml, async (content, targetFile) => {
    return await injectHtml('workbench', content, targetFile)
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
