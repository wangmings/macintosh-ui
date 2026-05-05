const vscode = require('vscode')


// 插件消息对象
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
      restart: 'Restart Now',
      reload: 'Reload'
    },
    script: 'Macintosh UI: Script not injected. Inject now?'
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
      restart: '立即重启',
      reload: '重新加载'
    },
    script: '麦金塔界面：脚本未注入，是否注入脚本？'
  }
}



// 获取当前语言的消息
function getMessages() {
  const locale = vscode.env.language.toLowerCase()
  return locale.startsWith('zh') ? messages.zh_cn : messages.en_us
}




module.exports = {
  getMessages
}
