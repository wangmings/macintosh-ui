
const os = require('os')
const path = require('path')
const vscode = require('vscode')
const fs = require('fs/promises')
const child = require('child_process')



// 高频VSCode API变量定义
const execCommand = vscode.commands.executeCommand
const showMessage = vscode.window.showInformationMessage



/**
 * 获取插件运行时基础路径（同步 ✅）
 * @returns {{homeDir: string, appRoot: string}} 包含用户主目录和VSCode应用根目录的对象
 */
function getPaths() {
  return {
    homeDir: os.homedir(),
    appRoot: vscode.env.appRoot,
  }
}


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
  const defaultFont = getVScodeConfig('default.ui.fontFamily').trim()
  const settingFont = getVScodeConfig('setting.ui.fontFamily').trim()
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
 * 重启应用（异步 ✅）
 * @param {string} execFile - 可执行文件路径
 */
async function restartApps(execFile) {
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
 * 安全修改文件（异步 ✅）
 * @param {boolean} isBackup - 是否备份并写入文件
 * @param {string} targetFile - 目标文件路径
 * @param {function} callback - 文件内容修改回调函数，返回修改后字符串
 */
async function safeModifyFile(isBackup, targetFile, callback) {
  const bakFile = `${targetFile}.bak`
  const hasBak = await exists(bakFile)

  if (isBackup) {
    if (!hasBak) await fs.copyFile(targetFile, bakFile)
    const content = await fs.readFile(bakFile, 'utf8')
    const newContent = await callback(content)
    if (typeof newContent === 'string' && newContent.trim().length > 0) {
      await fs.writeFile(targetFile, newContent, 'utf8')
    }
  } else if (hasBak) {
    await fs.copyFile(bakFile, targetFile)
    await fs.unlink(bakFile)
  }
}





/**
 * 获取当前语言
 * @returns {{language: string, locale: string}} 当前语言，'zh' 或 'en'
 */
function getLanguage() {
  const language = vscode.env.language
  return {language, locale: language.split('-')[0]}
}









module.exports = {
  exists,
  getPaths,
  getLanguage,
  showMessage,
  execCommand,
  registerCmd,
  packageJSON,
  addWorkspace,
  copyFolder,
  restartApps,
  deleteFolder,
  safeModifyFile,
  getFolderItems,
  getVScodeFonts,
  setVScodeConfig,
  getVScodeConfig,
}
