
const os = require('os')
const fs = require('fs')
const path = require('path')
const vscode = require('vscode')
const { spawn } = require('child_process')
const { existsSync } = fs
const { readdir, copyFile, readFile, writeFile, mkdir, rm } = fs.promises


// 高频VSCode API变量定义
const homeDir = os.homedir()
const appRoot = vscode.env.appRoot
const vscodeExecCmd = vscode.commands.executeCommand
const vscodeShowMessage = vscode.window.showInformationMessage






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
 * @throws {Error} 无效命令或回调函数时抛出错误
 */
function registerCmd(ctx, command) {
  if (typeof command !== 'object') {
    throw new Error('无效命令：必须是对象')
  }

  const keys = Object.keys(command)
  for (const key of keys) {
    const callback = command[key]
    if (typeof callback !== 'function') {
      throw new Error(`无效回调：${key}，必须是函数`)
    }
    ctx.subscriptions.push(vscode.commands.registerCommand(key, callback))
  }
}






/**
 * 获取扩展配置（异步 ✅）
 * @param {*} packFile package.json 文件路径
 * @returns {Promise<object>} 扩展配置对象
 * @throws {Error} package.json 不存在时抛出错误
 */
async function packageJSON(packFile) {
  if (!existsSync(packFile)) throw new Error(`package.json 不存在：${packFile}`)
  const content = await readFile(packFile, 'utf8')
  const pack = JSON.parse(content)
  const extId = `${pack.publisher}.${pack.name}`
  const extension = vscode.extensions.getExtension(extId)
  if (!extension) throw new Error(`扩展未找到：${extId}`)
  return extension.packageJSON
}






/**
 * 获取 VS Code 字体族
 * @returns {{defaultFont: string, settingFont: string}} 字体族字符串对象或对象
 */
function getVScodeFont() {
  const defaultFont = getVScodeConfig('default.ui.fontFamily')
  const settingFont = getVScodeConfig('setting.ui.fontFamily')

  const fonts = (!defaultFont || !settingFont) 
    ? {defaultFont: '', settingFont: ''} 
    : {defaultFont, settingFont: `${settingFont}, ${defaultFont}`}
  return fonts
}






/**
 * 添加目录到工作区
 * @param {string} folder 目录路径
 * @param {function|null} callback 添加成功后的回调函数，默认null
 */
function addWorkspace(folder, callback = null) {
  if (!fs.existsSync(folder)) return callback?.('error')

  const folderUri = vscode.Uri.file(folder)
  const currFolders = vscode.workspace.workspaceFolders || []
  const isExist = currFolders.some(f => f.uri.fsPath === folderUri.fsPath)
  if (isExist) return callback?.('exist')

  const updated = vscode.workspace.updateWorkspaceFolders(currFolders.length, 0, { uri: folderUri })
  if (!updated) return callback?.('error')
  setTimeout(() => {
    vscodeExecCmd('workbench.files.action.focusFilesExplorer')
    vscodeExecCmd('revealInExplorer', folderUri)
  }, 500)

  callback?.('success')
}






/**
 * 重启 VS Code 应用（异步 ✅）
 * @param {string} execFile - 可执行文件路径
 * @throws {Error} 可执行文件不存在时抛出错误
 */
async function vscodeRestartApp(execFile) {
  const sys = os.platform()
  if (!existsSync(execFile)) throw new Error(`可执行文件不存在: ${execFile}`)

  let cmd = {
    shell: '/bin/bash',
    args: ['-c', `sleep 2; "${execFile}"`]
  }

  // windows 平台的命令行参数与路径转义处理
  if (sys === 'win32') {
    cmd.shell = 'cmd.exe'
    cmd.args = ['/c', `timeout /t 2 /nobreak & start "" /b "${execFile}"`]
  }

  // 启动新进程并断开与父进程的关联
  // 确保新进程在父进程退出后继续运行
  // 避免父进程退出时新进程被终止
  spawn(cmd.shell, cmd.args, { detached: true, stdio: 'ignore' })
    .on('error', (error) => vscodeShowMessage(`启动失败: ${error}`))
    .unref()
  setTimeout(() => vscodeExecCmd('workbench.action.quit'), 200)
}






/**
 * @param {string} targetPath - 目标路径
 * @param {'all'|'file'|'dirs'} fileType - 只获取哪种类型的文件
 * @returns {Promise<string[]>} 目录下的文件或目录名称数组
 * @throws {Error} 路径不存在时抛出错误
 */
async function getFolderItems(targetPath, fileType = 'all') {
  let entries = []
  if (!existsSync(targetPath)) throw new Error(`路径不存在: ${targetPath}`)
  entries = await readdir(targetPath, { withFileTypes: true })
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
  await mkdir(destDir, { recursive: true })
  const entries = await readdir(srcDir, { withFileTypes: true })
  // 通过并发 Promise.all 提升大规模文件拷贝的 IO 性能
  await Promise.all(entries.map(async e => {
    const srcPath = path.join(srcDir, e.name)
    const destPath = path.join(destDir, e.name)
    return e.isDirectory() ? copyFolder(srcPath, destPath) : copyFile(srcPath, destPath)
  }))
}





/**
 * 删除目录或文件（递归）
 * @param {string} path - 目录路径
 */
async function deleteFolder(path) {
  await rm(path, { recursive: true, force: true })
}





/**
 * @param {boolean} isBackup - 是否备份并写入文件
 * @param {string} targetFile - 目标文件路径
 * @param {function} callback - 文件内容修改回调函数，返回修改后字符串
 * @throws {Error} 目标文件不存在时抛出错误
 */
async function fileReadWriteBackup(isBackup, targetFile, callback) {
  const bakFile = `${targetFile}.bak`
  const hasBak = existsSync(bakFile)
  const hasTarget = existsSync(targetFile)
  if (!hasTarget) throw new Error(`目标文件不存在: ${targetFile}`)
  if (typeof callback !== 'function') throw new Error(`回调函数必须是函数类型: ${targetFile}`)

  if (isBackup) {
    if (!hasBak) await copyFile(targetFile, bakFile)
    let content = await readFile(bakFile, 'utf8')
    content = callback(content)
    if (typeof content !== 'string') throw new Error(`回调函数返回非字符串类型内容: ${targetFile}`)
    await writeFile(targetFile, content, 'utf8')
    
  } else if (hasBak) {
    await copyFile(bakFile, targetFile)
    await deleteFolder(bakFile)
  }
}






module.exports = {
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
  getVScodeConfig,
  vscodeRestartApp,
  vscodeShowMessage,
  fileReadWriteBackup,
}
