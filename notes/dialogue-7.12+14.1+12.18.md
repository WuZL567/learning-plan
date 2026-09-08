# 对话记录：7.12 Composition API + 14.1 Git 四区 + 12.18 深拷贝

日期：2026-09-08

---

## 验收过程

### 学生提交内容

**7.12 笔记核心**：
- 一句话：按功能组织代码，将响应式状态、逻辑、副作用写在 setup 函数中
- 三大优势：代码组织更清晰、逻辑复用更优雅（Composables vs Mixin）、类型推导更友好
- 场景：任何项目都可以用，复杂逻辑拆分成 useXxxx.ts 文件

**14.1 笔记核心**：
- 四区：工作区 → 暂存区 → 本地仓库 → 远程仓库
- 流转命令：git add、git commit、git push
- 不确定点：撤销命令不熟悉，日常用 VScode 可视化操作

**12.18 代码核心**：
- 实现了完整版深拷贝，处理基本类型、对象、数组、循环引用、Date、RegExp、Map、Set
- 用 WeakMap 防止循环引用
- 用 Reflect.ownKeys 遍历所有自有属性（包括 Symbol key）
- 测试用例全部通过

---

## 三层追问记录

### 第一轮：白话复述

**追问 1：Composition API 是什么？为什么 Vue3 要推出它？**

学生回答：composition API 是按照功能逻辑组织代码的规则，Vue3 推出是为了功能逻辑的代码组织更清晰，类型推导更准确。

评判：✅ 正确。抓住了核心：按功能组织代码、类型推导更准确。

---

**追问 2：Git 四个工作区域分别是什么？它们之间怎么流转？**

学生回答：工作区、暂存区、本地仓库、远程仓库；工作区写代码，add 命令之后代码进入暂存区，暂存区执行 commit 提交到本地仓库，本地仓库通过 push 命令推送到远程仓库。

评判：✅ 正确。流转关系清晰。

---

**追问 3：深拷贝和浅拷贝的区别？深拷贝为什么要用 WeakMap？**

学生回答：深拷贝支持拷贝更复杂的多层次对象类型，拷贝不是复制引用地址，而是创建一个完全一样的完整的新对象，新旧对象互不影响；浅拷贝则是拷贝引用地址，新旧对象是同一个；深拷贝用 WeakMap 是为了内存更快地释放。

评判：✅ 正确。理解了深浅拷贝的本质区别，WeakMap 的作用也答对了。

---

### 第二轮：对比理解

**追问 4：Options API 也可以把相关逻辑写在相邻位置，为什么还需要 Composition API？核心痛点是什么？**

学生回答：支持将相关功能逻辑整合在一起后暴露给外边复用，类似 Hook；Options API 虽然可以写在相邻位置，但是 data 中不同功能的变量还是混在一起。

评判：✅ 正确。抓住了核心痛点：Options API 无法复用逻辑（Mixin 有命名冲突），Composition API 可以抽成 Composables。

---

**追问 5：工作区改了代码但还没 add，想撤销修改用什么命令？已经 add 到暂存区，想撤回工作区用什么命令？**

学生回答：我不知道，我都是用的 VScode 的可视化操作按钮。

评判：❌ 不会命令行撤销操作。

正确答案：
- 撤销工作区修改：`git checkout -- <file>` 或 `git restore <file>`
- 取消暂存：`git reset HEAD <file>` 或 `git restore --staged <file>`

---

**追问 6：你的代码里用了 `Reflect.ownKeys(obj)` 而不是 `for...in` 或 `Object.keys()`，为什么？这三者有什么区别？**

学生回答：Reflect.ownKeys 只会返回自身的 Key，不包含原型链上的；for...in 只能用在对象上，Object.keys 也是，无法用到数组类型上。

评判：⚠️ 部分正确。Reflect.ownKeys 返回自有属性（不含原型链）是对的，但"for...in 和 Object.keys 无法用到数组"是错的。

正确答案：
- `for...in`：遍历可枚举属性（**包括原型链**），不包括 Symbol
- `Object.keys(obj)`：只返回**可枚举的 String key**，不包括 Symbol 和原型链
- `Reflect.ownKeys(obj)`：返回**所有自有属性的 key**（String + Symbol + 不可枚举），不包括原型链

你的选择是对的，用 `Reflect.ownKeys` 最全面。

---

### 第三轮：场景应用

**追问 7：电商项目有"购物车"和"用户信息"两个功能，用 Composition API 的 Composables 模式怎么组织代码？**

学生回答：先在上面写购物车的功能，const cartItems = ref({...})，然后写 addToCart() 函数；再下面定义 const userInfo = ref({...})，然后写 updateUser() 函数，最终 return 这些变量和函数；如果逻辑足够复杂，可以拆分两个 useXxxx.ts 的文件，里面分别写各自的变量、函数和逻辑，最后 return，在一个 vue 中进行引入使用。

评判：✅ 正确。理解了 Composables 模式的核心：按功能拆分成 `useCart.ts` 和 `useUser.ts`，在组件里引入复用。

---

**追问 8：工作区改了 3 个文件 A、B、C，全部 add 并 commit 后，发现文件 B 改错了，但 A 和 C 是对的。只撤销 B 的修改，但保留 A 和 C 的提交，怎么操作？**

学生回答：不知道呢，git reset HEAD ~？

评判：❌ 答不上来。

正确答案：
```bash
# 方案1：回退 commit，只撤销 B
git reset HEAD~1              # 回退 commit，保留工作区修改
git restore B.js              # 撤销 B 的修改
git add A.js C.js            # 只加 A 和 C
git commit -m "fix: 保留 A 和 C"

# 方案2：用 revert（更安全）
git revert <commitId>         # 生成一个新 commit 撤销之前的修改
```

---

**追问 9：深拷贝对象里有一个 Function 类型的属性（`obj.callback = () => {}`），你的代码会怎么处理？**

学生回答：貌似不会报错，刚才试了下，没有报错，并且和原对象的 Function 是 === 的；不知道原因。

评判：⚠️ 答对了现象（Function 是 ===），但不知道原理。

正确答案：
- Function 的 `typeof` 是 `'function'`，不是 `'object'`
- 你的代码会走到 `if (obj == null || typeof obj !== 'object') return obj;`，直接返回原函数引用
- 这是**符合预期的**，因为 Function 无法深拷贝（函数的闭包、作用域链无法复制）
- 深拷贝 Function 的标准做法就是**复制引用**

---

## 验收结论

**评分**：8 分 / 10 分

**判定**：通过

**扣分项**：
1. 14.1 Git 撤销命令不熟悉（扣 1 分）：追问 5 和追问 8 都答不上来撤销操作。需要补充 `git reset`、`git restore`、`git checkout` 的区别。
2. 12.18 深拷贝对 Function 类型理解不足（扣 1 分）：追问 9 答对了现象，但不知道为什么 Function 是浅拷贝。需要理解"Function 无法深拷贝，因为闭包和作用域链无法复制"。

**答对的部分**：
1. 7.12 Composition API 理解到位（满分）：三大优势、逻辑复用、Composables 模式都答对了
2. 12.18 深拷贝代码质量高（满分）：测试用例全部通过，处理了循环引用、特殊类型、Symbol key
3. 14.1 Git 四区基本概念清晰：工作区 → 暂存区 → 本地仓库 → 远程仓库流转正确

**改进建议**：
1. 补充 Git 命令知识：`git restore`、`git reset`、`git checkout` 的区别（14.11 会详细学）
2. 理解 Function 无法深拷贝的原因：闭包和作用域链无法复制，只能共享引用

**下一步动作**：
- 块5（7.1-7.9、7.12、14.1、12.18）全部完成
- **阶段一 P0 全过一遍已完成**
- 进入阶段二：AI 概念骨架
  - 11.1 LLM 基础（3 天）
  - 11.2 Prompt 工程（1 天）
  - 11.4 RAG 概念（1 天）
- 建议提交 git commit，然后开新会话说"继续学习"
