# 项目实现流程图

下面的流程图基于当前仓库实现整理，覆盖扩展启动、主题注入、清理、备份与毛玻璃开关几个主流程。

```mermaid
flowchart TD
    A[VS Code 启动扩展] --> B[activate ctx]
    B --> C[initPlugin]
    C --> D{injectDir 已存在?}

    D -- 否 --> E[弹窗询问注入]
    D -- 是 --> H[注册右键菜单]
    E --> H
    E -- YES --> F[applyThemeConfig true]
    E -- NO --> G[等待手动命令]

    H --> I1[open theme]
    H --> I2[update theme]
    H --> I3[clean theme]
    H --> I4[backup theme]
    H --> I5[on frostedGlass]
    H --> I6[off frostedGlass]

    I1 --> J1[openThemeFolder]
    I2 --> K[applyThemeConfig true]
    I3 --> L[applyThemeConfig false]
    I4 --> M[createThemeBackup]
    I5 --> N[applyFrostedGlass true]
    I6 --> O[applyFrostedGlass false]
    M --> M1[复制 vscode 到备份目录]
    N --> N1[写入 workbench.colorCustomizations]
    O --> O1[清空 workbench.colorCustomizations]

    subgraph P[注入/清理主流程]
        P1[applyActivityBar]
        P2[扫描 vscode/code 文件]
        P3[修改 workbench.html]
        P4[修改 main.js]
        P5{isAdd?}
        P6[updateThemeConfig]
        P7[复制 code 和 font]
        P8[删除 injectDir]
        P9[弹窗重启]
    end

    K --> P1
    L --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P5 -- 是 --> P6
    P6 --> P7
    P7 --> P9
    P5 -- 否 --> P8
    P8 --> P9

    subgraph Q[活动栏补丁]
        Q1[读取字体]
        Q2[遍历文件]
        Q3[备份修改]
        Q4{包含 Trae?}
        Q5[特殊处理]
        Q6[替换字体]
    end

    P1 --> Q1
    Q1 --> Q2
    Q2 --> Q3
    Q3 --> Q4
    Q4 -- 是 --> Q5
    Q4 -- 否 --> Q6
    Q5 --> Q6

    subgraph R[HTML/JS注入]
        R1[读取 code 资源]
        R2[向 workbench.html 注入 script 和 link 标签]
        R3[setFrostedGlass]
        R4[向 main.js 附加 frostedGlass 参数]
        R5[替换透明背景]
    end

    P2 --> R1
    P3 --> R2
    P4 --> R3
    R3 --> R4
    R4 --> R5

    subgraph S[主题同步]
        S1[扫描主题]
        S2[读取信息]
        S3[生成配置]
        S4[回写 package.json]
    end

    P6 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> S4

    P9 --> T{用户选择}
    T -- Reload --> T1[刷新窗口]
    T -- Restart --> T2[重启软件]
    T2 --> T3[退出当前进程]
```

## 模块关系

- `src/extension.js`：扩展入口，负责初始化、注册命令、执行注入/清理/备份流程。
- `src/utils.js`：提供文件备份恢复、目录复制、配置读写、工作区添加、应用重启等通用能力。
- `src/theme.js`：扫描 `vscode/theme/*.json`，动态刷新 `package.json` 里的主题列表。
- `vscode/code/`：真正注入到宿主工作台里的 CSS/JS。
- `vscode/font/`：注入后的字体资源目录。
- `vscode/patch/activityBar.js`：Trae CN 宿主的活动栏补丁。
- `vscode/patch/frostedGlass.js`：毛玻璃配置和宿主 `main.js` 补丁逻辑。

## 关键实现特点

- 扩展不只是“切换主题”，还会直接修改宿主安装目录下的工作台文件。
- 每次写入前会先生成 `.bak` 备份，清理时再从备份恢复。
- 主题列表不是纯静态配置，而是由 `vscode/theme` 目录扫描后同步到 `package.json`。
- 菜单里的 `on/off frostedGlass` 只修改 VS Code 配色配置；宿主 `main.js` 的毛玻璃参数注入发生在 `applyThemeConfig` 阶段。
- 注入时会复制 `vscode/code` 和 `vscode/font`；清理时当前实现只删除 `injectDir`，不会额外删除 `injectFontDir`。
