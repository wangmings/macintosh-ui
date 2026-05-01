# JavaScript 定制编码规范（V3.3 极简实战版）

> **核心灵魂**：逻辑平铺直叙、逻辑量负增长、调试解耦、类型透明。
> **修订说明 (V3.3.2)**：强制要求通过“助手化”实现逻辑减法，严禁通过拆分非必要中间变量导致代码量膨胀。

---

## 1. 核心准则：逻辑负增长

- **逻辑减法原则**：每次优化后，实际参与运行的逻辑代码量应原则上小于或等于原始版本。
- **助手化逻辑合并**：优先通过内部简易助手函数（如 `readJSON`）合并重复的 IO 与转换操作，以减少逻辑行数。
- **变量生命周期归一化**：对于本质相同的同一份数据，鼓励使用 `let` 进行变量复用，减少变量名泛滥，降低认知成本。

---

## 2. 模块引入与声明

- **解构引入**：统一使用 `const` 在顶部引入。异步文件操作直接从 `fs.promises` 解构。
- **物理隔离**：模块引入区与函数定义区、函数与函数之间、函数与模块导出之间，**强制保留 4 行空行**。
- **无分号**：全局不使用分号。

---

## 3. 极简命名规范 (Minimalist Naming)

- **全局命名平衡**：全局函数或变量名禁止使用超长命名，但严禁过度精简。
    - *正确*：`genThemeConfig`（适度精简，保留核心语义）。
- **后缀约束**：目录变量以 `Dir` 结尾，文件变量以 `File` 结尾。
- **语义平衡**：核心容器直接使用复数形式（如 `tasks`）；迭代项在循环中使用语义化的短词（如 `file`）。

---

## 4. 函数定义与逻辑编排

- **标准声明**：业务核心函数统一使用 `async function` 声明。
- **JSDoc 强制标注**：所有函数必须添加 JSDoc 注释，明确标注 `@param` 类型及 `@returns`。
- **禁止过度拆分**：严禁将简单的路径拼接或简单的逻辑转换拆分为独立的中间变量（如 `filePath`），除非该变量被多次引用。
- **变量视觉美学**：在循环或逻辑块内，优先将相关联的声明集中在顶部，确保视觉上的平衡感。

---

## 5. 调试与逻辑解耦 (核心实战)

- **异步分离**：`await` 的异步操作结果必须先赋值给具名变量，方便断点调试。
- **序列化解耦**：`JSON.stringify` 必须独立赋值（可复用变量），严禁作为参数内联在写入函数中。
- **精准赋值**：更新对象字段优先使用 `obj.prop = val`，避免使用展开运算符 `{...obj}`。
- **非阻塞 IO**：脚本末尾的写入操作（如 `writeFile`）若不影响后续流程，不加 `await` 以提升执行效率。

---

## 6. 异常处理与拦截 (Guard Clauses)

- **反向拦截**：严禁多层 `if/else` 嵌套。使用 `if (!condition) { ... continue/return }` 提前排除异常，确保主逻辑在一级缩进平铺。
- **逻辑空赋值**：利用 `||=` 运算符处理容器初始化。
- **单一入口捕获**：函数内部原则上仅保留最外层一个 `try/catch`块，负责统一容错并输出日志。

---

## 7. 注释与日志准则

- **步骤化意图**：注释仅针对核心意图，且必须使用 `1. 2. 3.` 进行步骤编号，使逻辑链路一目了然。
- **日志忠实度**：所有 `console` 输出的调试消息必须忠实于业务原始语境（如“跳过”、“更新”、“失败”）。

---

## 8. 标杆代码示例

```javascript
const path = require('path')
const { readdir, readFile, writeFile } = require('fs').promises




/**
 * 演示：扫描并同步配置
 * @param {string} srcDir - 源目录
 * @param {string} targetFile - 目标文件
 * @returns {Promise<Array>}
 */
async function syncTask(srcDir, targetFile) {
  const results = []
  const readJSON = async (p) => JSON.parse(await readFile(p, 'utf8'))

  try {
    // 1. IO 执行与结果分离：获取目标文件列表
    const rawFiles = await readdir(srcDir)
    const targetFiles = rawFiles.filter(f => f.endsWith('.json'))

    for (const file of targetFiles) {
      const data = await readJSON(path.join(srcDir, file))

      // 2. 异常拦截：保留必要提示并确保主逻辑不嵌套
      if (!data.id) {
        console.warn(`[Skip]: ${file} missing ID`)
        continue
      }

      results.push({ id: data.id, time: Date.now() })
    }

    // 3. 业务处理与变量复用：读取并更新目标配置
    let config = await readJSON(targetFile)
    config.list = results

    // 4. 序列化解耦与非阻塞写入
    config = JSON.stringify(config, null, 2)
    writeFile(targetFile, config) 

    console.log(`[Success]: 已同步 ${results.length} 项数据`)
  } catch (err) {
    console.error('[Sync Error]:', err)
  }

  return results
}




module.exports = { syncTask }
```