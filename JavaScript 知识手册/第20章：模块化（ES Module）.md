# 第20章：模块化（ES Module）

## 20.1 为什么需要模块化

**一句话解释：**
模块化就是把代码**拆成一个个独立的文件**，每个文件负责一个功能，文件之间通过 `import` / `export` 互相引用。解决了"所有代码堆在一个文件里"的混乱问题。

**餐厅比喻：**
没有模块化 = 整个餐厅的所有事情（接单、做菜、收银、采购、清洁）全写在**一张纸上**，乱成一团。模块化 = 把每件事分到**不同的本子**上——接单本、菜谱本、账本、采购单，各管各的，需要的时候互相引用。

~~~
模块化之前（所有代码堆在一起）：
┌──────────────────────────────┐
│ 一个巨大的 main.js            │
│ 变量冲突、函数找不到、几千行  │
│ 维护噩梦                      │
└──────────────────────────────┘

模块化之后（拆分成独立文件）：
┌─────────┐  ┌─────────┐  ┌─────────┐
│ 接单.js  │  │ 菜谱.js  │  │ 收银.js  │
│         │  │         │  │         │
│ import  │  │ export  │  │ import  │
│ 菜谱    │  │ 菜品    │  │ 接单    │
└─────────┘  └─────────┘  └─────────┘
    ↓             ↓             ↓
┌──────────────────────────────┐
│        main.js（入口）        │
│  组合所有模块，启动应用       │
└──────────────────────────────┘
~~~

模块化的好处：
- **避免命名冲突**：每个模块有自己的作用域
- **代码复用**：写一次，到处 import
- **按需加载**：用到才加载，提升性能
- **依赖清晰**：谁依赖谁，一目了然
- **便于维护**：改一个模块不影响其他

---

## 20.2 export（命名导出 / 默认导出）

### 命名导出（Named Export）

**一句话解释：**
用 `export` 关键字把变量、函数、类**按名字**导出。导入时必须用**相同的名字**（或用 `as` 重命名）。

~~~javascript
// ========== 菜谱.js：逐个导出 ==========
export const 菜品列表 = ["红烧肉", "麻婆豆腐", "糖醋里脊"];

export function 计算价格(菜名) {
  const 价格表 = { "红烧肉": 38, "麻婆豆腐": 22, "糖醋里脊": 45 };
  return 价格表[菜名];
}

export const 最低消费 = 50;

// ========== 菜谱.js：统一导出（推荐，一目了然） ==========
const 菜品列表 = ["红烧肉", "麻婆豆腐", "糖醋里脊"];

function 计算价格(菜名) {
  const 价格表 = { "红烧肉": 38, "麻婆豆腐": 22, "糖醋里脊": 45 };
  return 价格表[菜名];
}

const 最低消费 = 50;

export { 菜品列表, 计算价格, 最低消费 };

// ========== 重命名导出 ==========
export { 计算价格 as getPrice };
~~~

### 默认导出（Default Export）

**一句话解释：**
每个模块只能有**一个**默认导出。导入时可以**任意命名**。

~~~javascript
// ========== 餐厅.js：默认导出 ==========
export default class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }
  报名() {
    console.log(`欢迎来到${this.名字}`);
  }
}

// ========== 也可以这样写 ==========
class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }
}
export default 餐厅;

// ========== 默认导出 + 命名导出混用 ==========
export default class 餐厅 { }

export const 品牌名 = "老王饭馆";
export const 成立年份 = 2020;
~~~

---

## 20.3 import（命名导入 / 默认导入 / 重命名 / 整体导入）

~~~javascript
// ========== 导入命名导出 ==========
import { 菜品列表, 计算价格, 最低消费 } from "./菜谱.js";

console.log(菜品列表);           // ["红烧肉", "麻婆豆腐", "糖醋里脊"]
console.log(计算价格("红烧肉")); // 38

// ========== 导入默认导出（可以任意命名） ==========
import 餐厅 from "./餐厅.js";
import 老王饭馆 from "./餐厅.js";   // 都行，名字随便起

const 店 = new 餐厅("老王饭馆");
店.报名();

// ========== 同时导入默认导出和命名导出 ==========
import 餐厅, { 品牌名, 成立年份 } from "./餐厅.js";
import 默认餐厅, { 品牌名 as 品牌, 成立年份 as 年份 } from "./餐厅.js";

// ========== 重命名导入 ==========
import { 计算价格 as getPrice } from "./菜谱.js";
console.log(getPrice("红烧肉"));  // 38

// ========== 整体导入（导入模块的所有导出） ==========
import * as 菜谱模块 from "./菜谱.js";

console.log(菜谱模块.菜品列表);            // ["红烧肉", "麻婆豆腐", "糖醋里脊"]
console.log(菜谱模块.计算价格("红烧肉"));  // 38
console.log(菜谱模块.最低消费);            // 50

// ========== 只执行模块代码，不导入任何东西 ==========
import "./初始化.js";  // 执行 初始化.js 中的代码（如全局配置）
~~~

---

## 20.4 重导出（export from）

**一句话解释：**
从另一个模块导入后**立刻再导出**，常用于创建"统一出口文件"（index.js），让外部只需要从一个地方导入。

**餐厅比喻：**
餐厅前台是一个**统一窗口**——客人不用自己去厨房、收银台、仓库分别问，前台把所有服务集中在一起，客人从一个窗口就能拿到所有东西。

~~~javascript
// ========== 菜品/index.js：统一导出入口 ==========

// 直接重新导出（不赋值给变量）
export { 菜品列表, 计算价格 } from "./菜谱.js";
export { 默认 as 餐厅类 } from "./餐厅.js";

// 重命名后导出
export { 计算价格 as getPrice } from "./菜谱.js";

// 导出默认导出为命名导出
export { default as 餐厅 } from "./餐厅.js";

// ========== 外部使用时只需要从一个地方导入 ==========
import { 菜品列表, 计算价格, 餐厅 } from "./菜品/index.js";
// 不需要分别从 菜谱.js、餐厅.js 各导入一次
~~~

~~~javascript
// ========== 实际项目中的典型结构 ==========
// src/utils/index.js
export { formatPrice } from "./价格.js";
export { formatDate } from "./日期.js";
export { debounce } from "./防抖.js";

// 使用时：
import { formatPrice, formatDate, debounce } from "@/utils";
// 干净整洁，不需要知道具体文件在哪
~~~

---

## 20.5 动态导入（import()）

**一句话解释：**
`import()` 是一个函数，可以在**代码运行时**按需加载模块，返回一个 Promise。适合**懒加载**、**条件加载**等场景。

**餐厅比喻：**
普通 `import` 就像**餐厅一开门就把所有食材全部搬进来**——不管你用不用，先搬进来占地方。`import()` 就像**等客人点了某道菜，才临时去买那个食材**——省地方，按需采购。

~~~javascript
// ========== 基本用法 ==========
// 静态导入（编译时确定，始终加载）
// import { 菜品列表 } from "./菜谱.js";

// 动态导入（运行时按需加载）
const 菜谱模块 = await import("./菜谱.js");
console.log(菜谱模块.菜品列表);  // ["红烧肉", "麻婆豆腐", "糖醋里脊"]
console.log(菜谱模块.计算价格("红烧肉"));  // 38

// ========== 返回 Promise ==========
import("./菜谱.js")
  .then(模块 => {
    console.log(模块.菜品列表);
  })
  .catch(错误 => {
    console.log("加载失败：", 错误.message);
  });

// ========== 条件加载 ==========
async function 加载配置(环境) {
  if (环境 === "生产") {
    const 模块 = await import("./配置.生产.js");
    return 模块.default;
  } else {
    const 模块 = await import("./配置.开发.js");
    return 模块.default;
  }
}

// ========== 懒加载页面（Vue/React 路由常用） ==========
// Vue Router 中的懒加载：
// const 路由 = [
//   { path: "/菜单", component: () => import("./views/菜单.vue") },
//   { path: "/订单", component: () => import("./views/订单.vue") },
// ];

// ========== 按需加载大型库 ==========
async function 生成图表(数据) {
  // 只在用户需要看图表时才加载 echarts
  const echarts = await import("echarts");
  const 图表 = echarts.init(document.getElementById("图表"));
  图表.setOption(数据);
}

// ========== 错误处理 ==========
try {
  const 模块 = await import("./可能不存在的模块.js");
} catch (错误) {
  console.log("模块加载失败，使用降级方案");
  // 使用降级方案...
}
~~~

---

## 20.6 ES Module vs CommonJS

| | ES Module (ESM) | CommonJS (CJS) |
|---|---|---|
| 标准 | ECMAScript 官方标准 | Node.js 社区规范 |
| 语法 | `import` / `export` | `require()` / `module.exports` |
| 加载时机 | 编译时静态分析 | 运行时动态加载 |
| 值的关系 | **活绑定**（引用原始值） | **值的拷贝** |
| this | `undefined` | `module.exports` |
| 适用环境 | 浏览器 + Node.js（现代） | 主要 Node.js |
| 在 HTML 中 | `<script type="module">` | 不支持（需要打包工具） |
| 严格模式 | 默认严格模式 | 非严格模式 |
| 餐厅比喻 | 现代化智能厨房 | 传统手工作坊 |

~~~javascript
// ========== ES Module 写法 ==========
// 导出
export const 菜名 = "红烧肉";
export function 做菜() { }

// 导入
import { 菜名, 做菜 } from "./菜谱.js";

// ========== CommonJS 写法 ==========
// 导出
const 菜名 = "红烧肉";
function 做菜() { }
module.exports = { 菜名, 做菜 };

// 导入
const { 菜名, 做菜 } = require("./菜谱.js");

// ========== 关键区别：活绑定 vs 值拷贝 ==========

// ES Module：活绑定（导入的是引用）
// counter.js
export let 计数 = 0;
export function 增加() { 计数++; }

// main.js
import { 计数, 增加 } from "./counter.js";
console.log(计数);  // 0
增加();
console.log(计数);  // 1（活绑定！值自动更新了）

// CommonJS：值拷贝
// counter.js
let 计数 = 0;
function 增加() { 计数++; }
module.exports = { 计数, 增加 };

// main.js
const { 计数, 增加 } = require("./counter.js");
console.log(计数);  // 0
增加();
console.log(计数);  // 0（值拷贝！不会更新）
~~~

---

## 20.7 模块的加载机制

### 静态分析

~~~javascript
// ES Module 在编译阶段就能确定模块的依赖关系
// 所以可以在编译时做"树摇"（Tree Shaking）——把没用到的代码删掉

// 菜谱.js
export function 红烧肉() { return "红烧肉"; }
export function 麻婆豆腐() { return "麻婆豆腐"; }
export function 糖醋里脊() { return "糖醋里脊"; }

// main.js（只导入了红烧肉）
import { 红烧肉 } from "./菜谱.js";
// 打包工具发现 麻婆豆腐 和 糖醋里脊 没被用到，打包时会把它们删掉
~~~

### 模块是单例

~~~javascript
// 同一个模块只会被执行一次，不管被 import 多少次
// counter.js
console.log("模块被执行了");
export let 计数 = 0;
export function 增加() { 计数++; }

// main.js
import { 计数 as a, 增加 as 增加A } from "./counter.js";
import { 计数 as b, 增加 as 增加B } from "./counter.js";

// "模块被执行了" 只打印了一次（单例）
增加A();
console.log(b);  // 1（a 和 b 是同一个计数，活绑定）

// main2.js
import { 计数 } from "./counter.js";
// 不会再打印"模块被执行了"（已经执行过了，直接用缓存的结果）
~~~

### 在 HTML 中使用 ES Module

~~~html
<!-- 必须加 type="module" -->
<script type="module" src="./main.js"></script>

<!-- 内联模块 -->
<script type="module">
  import { 菜品列表 } from "./菜谱.js";
  console.log(菜品列表);
</script>

<!-- 注意事项：
  1. 模块自动启用严格模式
  2. 模块有自己的作用域（不是全局）
  3. 模块默认是 defer 的（等 HTML 解析完再执行）
  4. 跨域请求需要服务器支持 CORS
  5. 不支持 file:// 协议（需要起一个本地服务器）
-->
~~~

---

## 第20章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| 模块化 | 把代码拆成独立文件，互相引用 | 每件事分到不同本子上 |
| export 命名导出 | 按名字导出变量/函数/类 | 按名字公开菜谱 |
| export default | 默认导出，每个模块只能一个 | 主打菜品单独推荐 |
| import 命名导入 | 按名字导入 | 按名字点菜 |
| import 默认导入 | 导入默认导出，名字随便起 | 点主打菜，随便叫什么 |
| import * | 整体导入模块所有导出 | 把整个菜谱搬过来 |
| 重命名 as | 导入/导出时换名字 | 给菜起个别名 |
| 重导出 export from | 导入后立刻再导出 | 前台统一窗口 |
| 动态导入 import() | 运行时按需加载模块 | 点了菜才去买食材 |
| 懒加载 | 用到时才加载 | 按需采购 |
| ES Module | 官方标准模块系统 | 现代化智能厨房 |
| CommonJS | Node.js 社区模块系统 | 传统手工作坊 |
| 活绑定 | 导入的是引用，原值变了跟着变 | 看的是同一份菜谱原件 |
| 值拷贝 | 导入的是拷贝，原值变了不跟着变 | 看的是菜谱复印件 |
| 单例 | 同一模块只执行一次 | 同一本菜谱只印刷一次 |
| 静态分析 | 编译时确定依赖关系 | 开门之前就知道今天要做什么菜 |
| Tree Shaking | 删掉没用到的导出代码 | 没人点的菜不备料 |
| type="module" | HTML 中使用 ES Module 的标记 | 告诉浏览器"这是模块化代码" |
