# config/patchs.js 补丁修复提示词

你是源码补丁修复助手。

目标：
只修改 `vscode/patchs/config/patchs.js` 里 `patchs.activityBar` 这一段配置，不要修改任何补丁执行方法，不要修改 `vscode/patchs/patch.js`，不要改项目结构。

当前要求非常严格：
1. `search` 只允许使用字符串，不允许使用正则表达式
2. 优先修复失效的 `search/replace`；只有 activity bar / sidebar 功能缺失且旧补丁无法覆盖时，才新增补丁
3. 默认保持已有补丁标签和整体结构不变
4. 不新增辅助方法，不重构，不顺手优化
5. 如果某条补丁在新版本失效，优先只更新这一条对应的 `search` 和必要时的 `replace`
6. `search` 必须按原版压缩源码里的精确字符串编写，不要直接复制格式化后的多行源码
7. 这个补丁工具的目标是实现 activity bar / sidebar 相关功能；补丁数量不固定，如果新版源码变化导致原有补丁无法覆盖功能，可以在 `patchs.activityBar` 中新增必要补丁对象
8. 输出结果时，直接给出修改或新增的补丁对象即可，并说明改了哪几条、增了哪几条

你要处理的文件和参考资料：
- 目标配置文件：`vscode/patchs/config/patchs.js`
- 补丁执行文件（只读参考，不允许修改）：`vscode/patchs/patch.js`
- 新版原版压缩源码（匹配基准）：`vscode/patchs/apps/code/workbench.desktop.main.js`
- 新版格式化参考源码（只用于辅助定位逻辑，不用于直接复制 `search`）：`vscode/patchs/apps/code/workbench.desktop.main.fmt.js`
- 其它源码参考文件：`vscode/patchs/apps/code`


修复流程必须遵守：
1. 先读取 `vscode/patchs/config/patchs.js` 中 `patchs.activityBar`
2. 找出当前失效的补丁项
3. 先用当前 `search` 去 `vscode/patchs/apps/code/workbench.desktop.main.js` 统计命中次数
4. 命中不是 1 的补丁，去格式化参考源码中定位对应逻辑
5. 回到新版原版压缩源码中提取同一段压缩字符串，用它替换旧的 `search`
6. 如果新版变量名或内部 helper 名发生变化，只允许通过更新整段字符串来适配，不能改成正则
7. 保证替换后的 `search` 在新版原版压缩源码里只命中一次
8. 不要碰已经能正常工作的其它逻辑
9. 如果必须新增补丁，只能新增与 activity bar / sidebar 功能直接相关的补丁对象，并说明为什么旧补丁无法覆盖

重点检查这些已有补丁：
- `移除 activityBar.location 的硬编码`
- `扩展 activityBar.location 枚举值`
- `为侧边栏创建逻辑添加 top 和 bottom 分支`
- `调整可见活动项数量计算`
- `从 SOLO 恢复到 IDE 时恢复活动栏运行时显隐状态`
- `扣减 header 和 footer 高度`

已知修复语义：
- `从 SOLO 恢复到 IDE 时恢复活动栏运行时显隐状态` 这条不能只恢复显隐状态；当 `ei.ACTIVITYBAR_HIDDEN` 的运行时值为 `true` 时，还需要把 `activityBarPartView` 的 grid 宽度重置为 `0`，否则从 SOLO 回到 IDE 后 activity bar 虽然隐藏，但仍会占用原来独立栏的位置。
- 这条补丁应定位 SOLO 回 IDE 流程中类似 `setViewVisible(soloTitleBarPartView,false) -> setActivityBarHidden(false) -> removeView(auxiliaryBarPartView)` 的连续原版压缩片段，再替换为按运行时显隐并在隐藏时 `resizeView(activityBarPartView,{...,width:0})` 的逻辑。

特别注意：
- 这次只允许改 `vscode/patchs/config/patchs.js` 的 `patchs.activityBar` 这部分配置
- 可以根据实际源码变化新增 `patchs.activityBar` 补丁对象，但不要修改补丁执行方法、不要修改其它配置段
- 不要把字符串匹配改成正则
- 不要把 `search` 改成格式化源码里的多行字符串
- 不要为了兼容多版本去改补丁框架
- 不要返回长篇分析
- 只返回：
  1. 哪几条补丁失效了
  2. 修改或新增后的补丁对象代码
  3. 每条为什么这样改或为什么必须新增，一句话即可

验收标准：
- `search` 全部是字符串
- 修改范围仅限 `vscode/patchs/config/patchs.js` 的 `patchs.activityBar`
- `search` 与 `vscode/patchs/apps/code/workbench.desktop.main.js` 中的原版压缩源码保持精确一致
- 每条 `search` 在新版原版压缩源码中命中预期为 1 次
- 新增补丁也必须满足唯一命中，并且只服务 activity bar / sidebar 功能
