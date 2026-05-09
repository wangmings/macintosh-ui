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
    F --> G{injectDir 是否存在}

    G -- 否 --> H[弹窗询问是否注入]
    G -- 是 --> J[注册右键菜单命令]
    H --> J
    H -- 确认 --> I[applyThemeConfig true]
    H -- 取消 --> K[等待手动命令]

    J --> L1[menu.open.theme]
    J --> L2[menu.update.theme]
    J --> L3[menu.clean.theme]
    J --> L4[menu.backup.theme]
    J --> L5[menu.glass.enable]
    J --> L6[menu.glass.disable]

    L1 --> M1[openThemeFolder]
    L2 --> N1[applyThemeConfig true]
    L3 --> N2[applyThemeConfig false]
    L4 --> O1[createThemeBackup]
    L5 --> P1[applyFrostedGlass true]
    L6 --> P2[applyFrostedGlass false]
    O1 --> O2[复制整个 vscode 到备份目录]
    P1 --> P3[写入 workbench.colorCustomizations]
    P2 --> P4[清空 workbench.colorCustomizations]

    subgraph Q[applyThemeConfig 主流程]
        Q1[addPatchVSCode]
        Q2{isAdd?}
        Q3[updateThemeConfig]
        Q4[复制 vscode/assets 到 injectDir]
        Q5[删除 injectDir]
        Q6[修改 workbench.html 注入标签或恢复备份]
        Q7[弹窗提示 reload / restart]
    end

    I --> Q1
    N1 --> Q1
    N2 --> Q1
    Q1 --> Q2
    Q2 -- 是 --> Q3
    Q3 --> Q4
    Q4 --> Q6
    Q2 -- 否 --> Q5
    Q5 --> Q6
    Q6 --> Q7

    subgraph R[addPatchVSCode 补丁流程]
        R1[读取桌面端工作台文件列表]
        R2[读取字体配置]
        R3[遍历 workbench.desktop.main.js / css]
        R4[readWriteBackupFile 生成或恢复 bak]
        R5{是否 Trae 环境}
        R6[应用 traeActivityBar 补丁]
        R7[替换默认 UI 字体]
        R8[处理 out/main.js 的 frostedGlass 补丁]
    end

    Q1 --> R1
    R1 --> R2
    R2 --> R3
    R3 --> R4
    R4 --> R5
    R5 -- 是 --> R6
    R5 -- 否 --> R7
    R6 --> R7
    R7 --> R8

    subgraph S[主题同步流程]
        S1[扫描 vscode/themes/json]
        S2[读取每个主题的 name / type]
        S3[生成 Apple 主题注册项]
        S4[回写 package.json contributes.themes]
    end

    Q3 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4

    subgraph T[HTML 注入流程]
        T1[读取 injectDir 下文件列表]
        T2[按扩展名生成 script / link 标签]
        T3[替换 workbench.html 里的 head 结束标签]
    end

    Q6 --> T1
    T1 --> T2
    T2 --> T3

    Q7 --> U{用户选择}
    U -- Reload --> U1[执行 workbench.action.reloadWindow]
    U -- Restart --> U2[重启应用并退出当前进程]
```

## 模块关系

- `src/extension.js`：扩展入口，负责初始化、注册命令、执行注入/清理/备份流程。
- `src/utils.js`：提供运行时提示文案、语言切换、文件备份恢复、目录复制、配置读写、工作区添加、应用重启等通用能力。
- `vscode/assets/`：真正注入到宿主工作台里的 CSS、JS 和字体资源。
- `vscode/patchs/apps/patch.config.js`：活动栏补丁配置与毛玻璃配置。
- `vscode/patchs/main.js`：补丁执行入口，负责活动栏与毛玻璃文本替换。
- `vscode/themes/main.js`：扫描 `vscode/themes/json/*.json`，动态刷新 `package.json` 里的主题列表。

## 关键实现特点

- 扩展不只是“切换主题”，还会直接修改宿主安装目录下的工作台文件。
- 每次写入前会先生成 `.bak` 备份，清理时再从备份恢复。
- 主题列表不是纯静态配置，而是由 `vscode/themes/json` 目录扫描后通过 `vscode/themes/main.js` 同步到 `package.json`。
- 菜单里的 `glass enable/disable` 只修改 VS Code 配色配置；宿主 `main.js` 的毛玻璃参数注入发生在 `applyThemeConfig` 阶段。
- 当前 `glass enable/disable` 的实现会直接写入 `workbench.colorCustomizations`，不会合并已有的用户自定义颜色配置。
- 注入时会复制整个 `vscode/assets` 到宿主工作台的 `injectDir`；清理时会直接删除该注入目录。
