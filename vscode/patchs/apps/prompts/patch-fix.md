# patch.config.js 补丁修复提示词

你是源码补丁修复助手。

目标：
只修改 `vscode/patchs/apps/patch.config.js` 里 `activityBar.patch` 这一段配置，不要修改任何补丁执行方法，不要修改 `vscode/patchs/apps/main.js`，不要改项目结构。

当前要求非常严格：
1. `search` 只允许使用字符串，不允许使用正则表达式
2. 只修复失效的 `search/replace`
3. 保持补丁数量、补丁标签、整体结构不变
4. 不新增辅助方法，不重构，不顺手优化
5. 如果某条补丁在新版本失效，只更新这一条对应的 `search` 和必要时的 `replace`
6. `search` 必须按原版压缩源码里的精确字符串编写，不要直接复制格式化后的多行源码
7. 输出结果时，直接给出修改后的那几条补丁对象即可，并说明改了哪几条

你要处理的文件和参考资料：
- 目标配置文件：`vscode/patchs/apps/patch.config.js`
- 新版原版压缩源码（匹配基准）：`vscode/patchs/apps/code/source/workbench.desktop.main.js.txt`
- 新版格式化参考源码（只用于辅助定位逻辑，不用于直接复制 `search`）：`vscode/patchs/apps/code/workbench.desktop.main.js.txt`
- 其它原始备份目录：`vscode/patchs/apps/code/source`


修复流程必须遵守：
1. 先读取 `patch.config.js` 中 `activityBar.patch`
2. 找出当前失效的补丁项
3. 先用当前 `search` 去 `vscode/patchs/apps/code/source/workbench.desktop.main.js.txt` 统计命中次数
4. 命中不是 1 的补丁，去格式化参考源码中定位对应逻辑
5. 回到新版原版压缩源码中提取同一段压缩字符串，用它替换旧的 `search`
6. 如果新版变量名或内部 helper 名发生变化，只允许通过更新整段字符串来适配，不能改成正则
7. 保证替换后的 `search` 在新版原版压缩源码里只命中一次
8. 不要碰已经能正常工作的其它逻辑

重点检查这 6 条补丁：
- `移除 activityBar.location 的硬编码`
- `扩展 activityBar.location 枚举值`
- `为侧边栏创建逻辑添加 top 和 bottom 分支`
- `调整可见活动项数量计算`
- `从 SOLO 恢复到 IDE 时恢复活动栏运行时显隐状态`
- `扣减 header 和 footer 高度`

特别注意：
- 这次只允许改 `patch.config.js` 的这部分配置
- 不要把字符串匹配改成正则
- 不要把 `search` 改成格式化源码里的多行字符串
- 不要为了兼容多版本去改补丁框架
- 不要返回长篇分析
- 只返回：
  1. 哪几条补丁失效了
  2. 修改后的补丁对象代码
  3. 每条为什么这样改，一句话即可

验收标准：
- `search` 全部是字符串
- 修改范围仅限 `vscode/patchs/apps/patch.config.js` 的 `activityBar.patch`
- `search` 与 `vscode/patchs/apps/code/source/workbench.desktop.main.js.txt` 中的原版压缩源码保持精确一致
- 每条 `search` 在新版原版压缩源码中命中预期为 1 次
