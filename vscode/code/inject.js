// @ts-nocheck
/**
 * @fileOverview UIMonitor.js
 * @description 监听UI变化，自动修复样式与通知
 */


 /**
 * ## MutationObserver配置选项 ##
 * subtree: true                         监听整个子树（包括目标节点的所有子节点）
 * childList: true,                      监听子节点的添加和删除
 * attributes: true,                     监听属性的变化
 * characterData: true,                  监听文本节点内容的变化
 * attributeOldValue: true,              在属性变化时，记录变化前的旧值
 * characterDataOldValue: true,          在文本变化时，记录变化前的旧值
 * attributeFilter: ['style', 'class'],  监听与样式相关的属性
*/


(function () {

    // 调试模式开关
    const DEBUG = true

    // 监听 DOM 变化配置
    const obsConfig = { subtree: true, childList: true }

    // 安全选择 DOM 节点
    const node = (selector) => document.querySelector(selector)

    // 脚本主逻辑入口 
    prints('用户自定义脚本已加载！')
    const metaTag = node('head > meta:nth-child(2)')
    const isTraeCN = metaTag?.attributes?.content?.textContent?.includes('trae.ai')


    // 修复默认语法高亮样式
    waitNode('.vscode-tokens-styles', (styleNode) => {
        observeNode(styleNode, obsConfig, () => fixSyntaxStyle(styleNode))
    })


    if (isTraeCN) {
        prints('Trae CN 编辑器环境已检测到')

        // 关闭 “Trae CN 安装损坏” 警告通知
        waitNode('.notifications-toasts', (toastBox) => {
            handleTraeNotification(toastBox)
            observeNode(toastBox, obsConfig, () => handleTraeNotification(toastBox))
        })
    }



    
    // -------------------------- 辅助函数 -------------------------- //

    // 打印日志，用于调试
    function prints(...msgs) {
        if (!DEBUG) return
        const label = 'VSCODE-SCRIPT'
        const color1 = 'color:yellow;font-weight:bold'
        const color2 = 'color:greenyellow;font-weight:bold'
        console.log(`%c${label}: %c${msgs.join(' ')}\n`, color1, color2)
    }





    /**
     * 观察 DOM 节点变化
     * @param {Element} el - 目标节点
     * @param {object} opts - MutationObserver 配置
     * @param {function} onChange - 回调函数
     */
    function observeNode(el, opts, onChange) {
        if (!el) return
        const observer = new MutationObserver((mutations, obs) => {
            for (const mutation of mutations) {
                if (opts[mutation.type]) {
                    onChange(mutations, obs)
                    break
                }
            }
        })
        observer.observe(el, opts)
    }


    /**
     * 等待节点加载完成后执行
     * @param {string} selector - 目标节点选择器
     * @param {function} callback - 节点加载回调
     */
    function waitNode(selector, callback) {
        observeNode(document, obsConfig, (mutations, obs) => {
            const el = node(selector)
            if (el) {
                callback(el)
                obs.disconnect()
            }
        })
    }





    // 修复主题语法颜色不准确问题，添加 .monaco-editor 作用域
    function fixSyntaxStyle(styleNode) {
        if (!styleNode || !styleNode.textContent) return
        const css = styleNode.textContent
        if (css.includes('.monaco-editor')) return
        styleNode.textContent = css.replaceAll('\n.mtk', '\n.monaco-editor .mtk')
        prints('已修复主题语法颜色不准确问题，添加 .monaco-editor 作用域')
    }



    // 处理 Trae CN 通知弹窗
    function handleTraeNotification(container) {
        const notices = [
            { 
                text: '扩展在磁盘上已被修改', 
                log: '已点击: 扩展在磁盘上已被修改。请重新加载窗口。',
            },
            { 
                text: 'Trae CN 安装似乎损坏。请重新安装。', 
                log: '已点击关闭：Trae CN 安装似乎损坏。请重新安装。'
            }
        ]

        const items = container.querySelectorAll('.notification-toast-container')
        if (items.length === 0) return prints('未发现通知列表')

        for (const item of items) {
            const content = item.innerText
            for (const notice of notices) {
                if (content.includes(notice.text) || content === notice.text) {
                    item.style.width = '1px'
                    item.querySelector('a').click()
                    prints(notice.log)
                }
            }
        }
    }







})()
