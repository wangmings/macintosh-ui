
const os = require('os')
const path = require('path')
const vscode = require('vscode')
const fs = require('fs/promises')
const child = require('child_process')



// 高频VSCode API变量定义
const homeDir = os.homedir()
const appRoot = vscode.env.appRoot
const execCommand = vscode.commands.executeCommand
const showMessage = vscode.window.showInformationMessage



/**
 * 检查路径是否存在（异步 ✅）
 * @param {string} path - 路径字符串
 * @returns {Promise<boolean>} 路径是否存在
 */
async function exists(path) {
  try {
    await fs.access(path, fs.constants.F_OK)
    return true
  } catch (err) { return false }
}



/**
 * 获取 VSCode 配置项（同步 ✅）
 * @param {string | null} key - 配置项键名
 * @returns {*} 配置项值或配置对象
 */
function getVScodeConfig(key = null) {
  const config = vscode.workspace.getConfiguration()
  return key ? config.get(key) : config
}





/**
 * 设置 VSCode 配置项（同步 ✅）
 * @param {string} key - 配置项键名
 * @param {*} val - 配置项值
 */
function setVScodeConfig(key, val) {
  return getVScodeConfig().update(key, val, vscode.ConfigurationTarget.Global)
}





/**
 * 注册插件所有命令（同步 ✅）
 * @param {*} ctx 扩展上下文
 * @param {*} command 命令对象，键为命令名，值为回调函数
 * @throws {Error} 参数 command 不是对象类型时抛出错误
 */
function registerCmd(ctx, command) {
  // 确保命令集合是对象类型
  if (typeof command !== 'object') throw new TypeError('command: must be an object')
  const keys = Object.keys(command)
  for (const key of keys) {
    const callback = command[key]
    ctx.subscriptions.push(vscode.commands.registerCommand(key, callback))
  }
}






/**
 * 获取扩展配置（异步 ✅）
 * @param {*} packFile package.json 文件路径
 * @returns {Promise<object>} 扩展配置对象
 */
async function packageJSON(packFile) {
  const pack = JSON.parse(await fs.readFile(packFile, 'utf8'))
  const extId = `${pack.publisher}.${pack.name}`
  const extension = vscode.extensions.getExtension(extId)
  // 确保当前 VS Code 运行时可以找到该扩展
  if (!extension) throw new Error(`extension not found: ${extId}`)
  return extension.packageJSON
}






/**
 * 获取 VS Code 字体族
 * @returns {{default: string, setting: string}} 字体族字符串对象或对象
 */
function getVScodeFonts() {
  const defaultFont = getVScodeConfig('default.ui.fontFamily')
  const settingFont = getVScodeConfig('setting.ui.fontFamily')
  return (!defaultFont || !settingFont)
    ? { default: '', setting: '' }
    : { default: defaultFont, setting: `${settingFont}, ${defaultFont}` }
}






/**
 * 添加目录到工作区
 * @param {string} folder 目录路径
 * @returns {string} 添加状态字符串
 */
function addWorkspace(folder) {
  const folderUri = vscode.Uri.file(folder)
  const currFolders = vscode.workspace.workspaceFolders || []
  const isExist = currFolders.some(f => f.uri.fsPath === folderUri.fsPath)
  if (isExist) return 'exist'
  const updated = vscode.workspace.updateWorkspaceFolders(currFolders.length, 0, { uri: folderUri })
  if (!updated) return 'fail'
  setTimeout(() => {
    execCommand('workbench.files.action.focusFilesExplorer')
    execCommand('revealInExplorer', folderUri)
  }, 500)

  return 'success'
}






/**
 * 重启 VS Code 应用（异步 ✅）
 * @param {string} execFile - 可执行文件路径
 */
async function restartVScodeApp(execFile) {
  const execCmd = {
    shell: '/bin/bash',
    args: ['-c', `sleep 2; "${execFile}"`]
  }

  // windows 平台的命令行参数与路径转义处理
  if (os.platform() === 'win32') {
    execCmd.shell = 'cmd.exe'
    execCmd.args = ['/c', `timeout /t 2 /nobreak & start "" /b "${execFile}"`]
  }

  // 启动新进程并断开与父进程的关联
  // 确保新进程在父进程退出后继续运行
  // 避免父进程退出时新进程被终止
  child.spawn(execCmd.shell, execCmd.args, { detached: true, stdio: 'ignore' })
    .on('error', (error) => showMessage(`重启应用失败: ${error}`))
    .unref()
  setTimeout(() => execCommand('workbench.action.quit'), 200)
}






/**
 * @param {string} targetPath - 目标路径
 * @param {'all'|'file'|'dirs'} fileType - 只获取哪种类型的文件
 * @returns {Promise<string[]>} 目录下的文件或目录名称数组
 */
async function getFolderItems(targetPath, fileType = 'all') {
  let entries = []
  entries = await fs.readdir(targetPath, { withFileTypes: true })
  return entries.filter(item => {
    if (fileType === 'file') return item.isFile()
    if (fileType === 'dirs') return item.isDirectory()
    return true
  }).map(item => item.name)

}




/**
 * 递归拷贝目录条目
 * @param {string} srcDir - 源路径 
 * @param {string} destDir - 目标路径 
 */
async function copyFolder(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true })
  const entries = await fs.readdir(srcDir, { withFileTypes: true })
  // 通过并发 Promise.all 提升大规模文件拷贝的 IO 性能
  await Promise.all(entries.map(async e => {
    const srcPath = path.join(srcDir, e.name)
    const destPath = path.join(destDir, e.name)
    return e.isDirectory() ? copyFolder(srcPath, destPath) : fs.copyFile(srcPath, destPath)
  }))
}





/**
 * 删除目录或文件（递归）
 * @param {string} path - 目录路径
 */
async function deleteFolder(path) {
  await fs.rm(path, { recursive: true, force: true })
}





/**
 * 读写备份文件（异步 ✅）
 * @param {boolean} isBackup - 是否备份并写入文件
 * @param {string} targetFile - 目标文件路径
 * @param {function} callback - 文件内容修改回调函数，返回修改后字符串
 */
async function readWriteBackupFile(isBackup, targetFile, callback) {
  const bakFile = `${targetFile}.bak`
  const hasBak = await exists(bakFile)

  if (isBackup) {
    if (!hasBak) await fs.copyFile(targetFile, bakFile)
    const content = await callback(await fs.readFile(bakFile, 'utf8'))
    if (typeof content === 'string' && content.trim().length > 0) {
      await fs.writeFile(targetFile, content, 'utf8')
    }
  } else if (hasBak) {
    await fs.copyFile(bakFile, targetFile)
    await fs.unlink(bakFile)
  }
}







// 获取当前语言的消息
function getMessages() {
  const messages = {
    // 英文
    en_us: {
      open: {
        fail: 'Failed to add to workspace: %path%',
        exist: 'Already in workspace: %path%',
        success: 'Added to workspace: %path%'
      },
      patch: {
        bar: '[TraeCN]: Failed to apply activity bar patch. Please update the patch code for this version.',
        glass: 'Failed to apply frosted glass patch. Please update the patch code for this version.'
      },
      theme: {
        update: 'Theme settings updated. Restart to apply changes?',
        clean: 'Settings cleared. Restart to clear cache?',
        backup: 'Settings backed up to: %path%',
        import: 'Theme settings imported successfully'
      },
      button: {
        theme:{
          restart: 'Restart Now',
          reload: 'Reload'
        },
        inject:{
          confirm: 'Yes',
          cancel: 'No'
        }
      },
      inject: 'Macintosh UI: Script not injected. Inject now?'
    },


    // 中文
    zh_cn: {
      open: {
        fail: '添加到工作区失败：%path%',
        exist: '已在工作区：%path%',
        success: '已添加到工作区：%path%'
      },
      patch: {
        bar: '[TraeCN]: 活动栏添加补丁失败！当前版本不支持，请更新补丁代码。',
        glass: '应用玻璃效果补丁失败！当前版本不支持，请更新补丁代码。'
      },
      theme: {
        update: '已更新主题配置，是否重启以生效？',
        clean: '已清除配置，是否重启清理缓存？',
        backup: '已备份配置：%path%',
        import: '已导入主题配置'
      },
      button: {
        theme:{
          restart: '立即重启',
          reload: '重新加载'
        },
        inject:{
          confirm: '确认',
          cancel: '取消'
        }
      },
      inject: '麦金塔界面：脚本未注入，是否注入脚本？'
    }
  }
  const locale = vscode.env.language.toLowerCase()
  return locale.startsWith('zh') ? messages.zh_cn : messages.en_us
}









module.exports = {
  homeDir,
  appRoot,
  exists,
  getMessages,
  showMessage,
  execCommand,
  registerCmd,
  packageJSON,
  addWorkspace,
  copyFolder,
  deleteFolder,
  getFolderItems,
  getVScodeFonts,
  setVScodeConfig,
  getVScodeConfig,
  restartVScodeApp,
  readWriteBackupFile,
}
