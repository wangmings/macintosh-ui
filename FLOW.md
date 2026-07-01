# 项目实现流程图

下面的流程图基于当前仓库实现整理，覆盖扩展启动、主题注入、清理、备份与毛玻璃开关几个主流程。

```mermaid
flowchart TD
    A[VS Code 启动扩展] --> B[activate ctx]
    B --> C{initStatus 是否为 false}
    C -- 是 --> D[initPlugin]
    C -- 否 --> E[跳过初始化]
    D --> F[标记 initStatus=true]
    E --> F
    F --> G{injectDir 软链接是否存在}

    G -- 否 --> H[弹窗询问是否注入]
    G -- 是 --> J[注册右键菜单命令]
    H --> J
    H -- 确认 --> I[applyThemeConfig true]
    H -- 取消 --> K[等待手动命令]

    J --> L1[menu.open.config]
    J --> L2[menu.update.config]
    J --> L3[menu.clean.config]
    J --> L4[menu.backup.config]

    L1 --> M1[openThemeFolder]
    L2 --> N1[applyThemeConfig true]
    L3 --> N2[applyThemeConfig false]
    L4 --> O1[createThemeBackup]
    O1 --> O2[复制整个 vscode 扩展目录到备份目录]

    subgraph Q[applyThemeConfig 主流程]
        Q0[清理已有软链接 rm injectDir]
        Q1{isAdd?}
        Q2[theme.updateThemes]
        Q3[创建软链接 assetsDir → injectDir]
        Q4[addApplyPatchs]
        Q5[injectHtml 注入 sessions/workbench HTML]
        Q6[弹窗提示 restart/cancel]
    end

    I --> Q0
    N1 --> Q0
    N2 --> Q0
    Q0 --> Q1
    Q1 -- 是 --> Q2
    Q2 --> Q3
    Q3 --> Q4
    Q1 -- 否 --> Q4
    Q4 --> Q5
    Q5 --> Q6

    subgraph R[addApplyPatchs 补丁流程]
        R1[读取 sessions 桌面端文件列表]
        R2[遍历 sessions.desktop.* 替换字体]
        R3[读取 workbench 桌面端文件列表]
        R4[遍历 workbench.desktop.* 处理 activityBar/字体补丁]
    end

    Q4 --> R1
    R1 --> R2
    R2 --> R3
    R3 --> R4

    subgraph S[主题同步流程]
        S1[扫描 vscode/themes]
        S2[读取主题 name/type]
        S3[生成 Apple 主题注册项]
        S4[回写 package.json contributes.themes]
    end

    Q2 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4

    subgraph T[HTML 注入流程]
        T1[递归扫描 injectDir 下文件列表]
        T2[按扩展名过滤并生成 script/link 标签]
        T3[替换 sessions.html 和 workbench.html 的 head 结束标签]
    end

    Q5 --> T1
    T1 --> T2
    T2 --> T3

    Q6 --> U{用户选择}
    U -- Restart --> U1[执行 restart 应用]
    U -- Cancel --> U2[保持当前状态]
```

## 模块关系

几个目录和文件之间的关系大致如下：

- `src/extension.js` — 扩展入口，负责注册命令、初始化路径、编排注入与补丁流程
- `src/lib/utils.js` — 通用工具集：文件读写、备份、重启、配置读写、目录扫描等
- `src/lib/i18n.js` — 国际化模块：读取 `package.nls.json` / `package.nls.zh-cn.json` 并提供翻译函数
- `src/lib/patch.js` — 补丁执行入口：读取 `vscode/patches/activity-bar.js` 配置并执行 `traeActivityBar()` 补丁
- `src/lib/theme.js` — 主题构建：扫描 `vscode/themes/` 下的 JSON 文件，生成 `package.json` 中的 `contributes.themes`
- `vscode/assets/` — 运行时注入资源：`css/` 样式文件、`fonts/` 字体文件、`fixes.js` 浏览器端 UI 修复脚本、`utils.js` DOM 工具函数
- `vscode/patches/activity-bar.js` — 活动栏补丁配置（search/replace 规则和 CSS 样式字符串）
- `vscode/patches/refs/` — 源码参考与辅助工具：`sync.sh` 同步脚本、`sources/` 参考源码、`prompt/` 补丁提示词

## 关键实现特点

- **注入 ≠ 拷贝**：当前采用软链接（`utils.symlink`）方式注入资源，避免重复拷贝大量字体文件，清理时用 `utils.rm` 删除软链接
- **安全修改**：`safeModifyFile` 会在每次修改前自动创建 `.bak` 备份，清理时基于备份恢复原文件
- **双向平台支持**：兼容 VSCode 标准版和 Trae CN 宿主环境，通过 `app.name` 区分执行分支
- **自动语言切换**：根据 VS Code 当前显示语言自动加载 `package.nls.zh-cn.json` 或 `package.nls.json`，命令提示支持中/英文
- **主题自适应**：`src/lib/theme.js` 扫描所有主题 JSON，自动读取 `name` 和 `type` 字段，按 `Apple ${name}` 格式注册到 `package.json`
- **补丁可配置**：活动栏补丁的 search/replace 规则全部集中在 `vscode/patches/activity-bar.js`，支持按字符串精确匹配，不依赖正则
- **防重复初始化**：通过 `initStatus` 全局标志确保 `initPlugin` 只在首次激活时运行
