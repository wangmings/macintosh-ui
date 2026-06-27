
const os = require('os')
const path = require('path')
const fs = require('fs/promises')
const vscode = require('vscode')
const { spawn, execSync } = require('child_process')



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
 * @param {string} target - 路径字符串
 * @returns {Promise<boolean>} 路径是否存在
 */
async function exists(target) {
  try {
    await fs.access(target, fs.constants.F_OK)
    return true
  } catch { return false }
}



/**
 * 获取 VSCode 配置项（同步 ✅）
 * @param {string | null} key - 配置项键名
 * @returns {*} 配置项值或配置对象
 */
function getVSConfig(key = null) {
  const config = vscode.workspace.getConfiguration()
  return key ? config.get(key) : config
}





/**
 * 设置 VSCode 配置项（同步 ✅）
 * @param {string} key - 配置项键名
 * @param {*} val - 配置项值
 */
function setVSConfig(key, val) {
  return getVSConfig().update(key, val, vscode.ConfigurationTarget.Global)
}





/**
 * 注册插件所有命令（同步 ✅）
 * @param {*} ctx 扩展上下文
 * @param {*} command 命令对象，键为命令名，值为回调函数
 * @throws {Error} 参数 command 不是对象类型时抛出错误
 */
function regCommands(ctx, command) {
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
function getVSFonts() {
  const defaultFont = getVSConfig('default.ui.fontFamily').trim()
  const settingFont = getVSConfig('setting.ui.fontFamily').trim()
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
 * 执行Shell命令（异步 ✅）
 * @param {string} cmd - 要执行的Shell命令
 * @param {boolean} detached - 是否以分离模式执行，默认 false
 * @param {function} callback - 可选的错误函数，用于处理子进程错误
 * @returns {string | null} - 命令执行结果（成功时返回输出，失败时返回错误）
 */
function execShell(cmd, detached, callback) {
  const [sh, argv] = os.platform() === 'win32' ? ['cmd.exe', ['/c', cmd]] : ['/bin/bash', ['-c', cmd]]
  if (detached) {
    const p = spawn(sh, argv, { detached: true, stdio: 'ignore' })
    p.on('error', e => callback?.(e)).unref()
    return null
  }
  return execSync(cmd).toString().trim()
}




/**
 * 重启应用（异步 ✅）
 * @param {string} execFile - 可执行文件路径
 */
async function restartApp(execFile) {
  const cmd = os.platform() === 'win32' ? `timeout /t 2 /nobreak & start "" /b "${execFile}"` : `sleep 2; "${execFile}"`
  execShell(cmd, true, (error) => showMessage(`重启应用失败: ${error}`))
  setTimeout(() => execCommand('workbench.action.quit'), 200)
}






/**
 * 递归获取目录下的文件相对路径（异步 ✅）
 * @param {string} targetPath - 目标路径
 * @param {number} maxDepth - 递归层级，0=仅第一层，默认 Infinity 全部扫描
 * @returns {Promise<string[]>} 目录下的文件相对路径数组
 */
async function listFiles(targetPath, maxDepth = Infinity) {
  const results = []
  async function walk(dirPath, basePath = '', depth = 0) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    for (const item of entries) {
      const relPath = basePath ? path.join(basePath, item.name) : item.name
      const fullPath = path.join(dirPath, item.name)
      if (item.isDirectory()) {
        // 目录不加入结果，仅判断是否递归
        if (depth < maxDepth) await walk(fullPath, relPath, depth + 1)
      } else {
        // 只把文件存入数组
        results.push(relPath)
      }
    }
  }

  await walk(targetPath, '', 0)
  return results
}



/**
 * 递归拷贝目录条目
 * @param {string} srcDir - 源路径 
 * @param {string} destDir - 目标路径 
 */
async function copyDirs(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true })
  const entries = await fs.readdir(srcDir, { withFileTypes: true })
  // 通过并发 Promise.all 提升大规模文件拷贝的 IO 性能
  await Promise.all(entries.map(async e => {
    const srcPath = path.join(srcDir, e.name)
    const destPath = path.join(destDir, e.name)
    return e.isDirectory() ? copyDirs(srcPath, destPath) : fs.copyFile(srcPath, destPath)
  }))
}


/**
 * 删除目录或文件（递归） （异步 ✅）
 * @param {string} target - 目录路径
 */
async function rm(target) {
  await fs.rm(target, { recursive: true, force: true })
}


/**
 * 创建软链接（异步 ✅）
 * @param {string} src - 源路径
 * @param {string} dest - 目标路径
 */
async function symlink(src, dest) {
  await fs.symlink(src, dest)
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
function getLocale() {
  const language = vscode.env.language
  return {language, locale: language.split('-')[0]}
}









module.exports = {
  rm,
  exists,
  symlink,
  getPaths,
  copyDirs,
  execShell,
  getLocale,
  showMessage,
  regCommands,
  execCommand,
  packageJSON,
  addWorkspace,
  restartApp,
  listFiles,
  getVSFonts,
  setVSConfig,
  getVSConfig,  
  safeModifyFile,
}
