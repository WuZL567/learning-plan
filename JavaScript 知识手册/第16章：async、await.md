# 第16章：async / await

## 16.1 async 函数

**一句话解释：**
`async` 加在函数前面，让这个函数**总是返回一个 Promise**。函数里 `return` 的值会自动包装成 `Promise.resolve(值)`。

**餐厅比喻：**
`async` 函数就像一个**总给取餐小票的流程**——不管你做的是什么菜，最后顾客拿到的永远是一张小票（Promise），而不是直接拿到菜。顾客要用 `.then` 或 `await` 才能拿到菜。

~~~javascript
// ========== 没有 async：直接返回值 ==========
function 普通做菜() {
  return "红烧肉";
}
console.log(普通做菜());  // "红烧肉"（普通字符串）

// ========== 有 async：自动包装成 Promise ==========
async function 异步做菜() {
  return "红烧肉";
}
console.log(异步做菜());  // Promise { "红烧肉" }（是 Promise！）

// 要拿到值，需要用 .then 或 await
异步做菜().then(结果 => console.log(结果));  // 红烧肉

// ========== async 函数里 throw → 自动变成 rejected Promise ==========
async function 做菜失败() {
  throw new Error("厨房着火了");
  // 等价于：return Promise.reject(new Error("厨房着火了"));
}

做菜失败()
  .then(结果 => console.log(结果))
  .catch(错误 => console.log(`失败：${错误.message}`));  // 失败：厨房着火了
~~~

---

## 16.2 await 关键字

**一句话解释：**
`await` 用在 `async` 函数内部，用来**等待一个 Promise 完成**并拿到结果值。写法像同步，但**不会阻塞主线程**。

**餐厅比喻：**
`await` 就像厨师说"**这道菜等好了叫我，我先不傻等**"——表面上厨师在等（代码看起来像同步），但厨房其他人可以继续工作（主线程不卡住）。等菜做好了，厨师再回来继续做下一道。

~~~javascript
// ========== 基本用法 ==========
function 延时(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function 做菜流程() {
  console.log("开始做红烧肉");
  await 延时(2000);               // 等2秒（函数暂停，主线程不卡）
  console.log("红烧肉做好了");

  console.log("开始做麻婆豆腐");
  await 延时(1500);               // 再等1.5秒
  console.log("麻婆豆腐做好了");

  console.log("开始做糖醋里脊");
  await 延时(1000);               // 再等1秒
  console.log("糖醋里脊做好了");
}

做菜流程();
console.log("主线程继续干别的");  // 不等！立即执行

// 输出时间线：
// 0ms   → 开始做红烧肉
// 0ms   → 主线程继续干别的     ← 不等！主线程没被卡住！
// 2000ms → 红烧肉做好了
// 2000ms → 开始做麻婆豆腐
// 3500ms → 麻婆豆腐做好了
// 3500ms → 开始做糖醋里脊
// 4500ms → 糖醋里脊做好了
~~~

~~~javascript
// ========== await 拿到 Promise 的结果值 ==========
function 查询价格(菜名) {
  return new Promise(resolve => {
    setTimeout(() => {
      const 菜单 = { "红烧肉": 38, "麻婆豆腐": 22, "糖醋里脊": 45 };
      resolve(菜单[菜名]);
    }, 500);
  });
}

async function 显示价格() {
  const 价格 = await 查询价格("红烧肉");  // 等待 Promise 完成，拿到 38
  console.log(`红烧肉的价格：${价格}元`);  // 红烧肉的价格：38元
}

显示价格();

// ========== await 后面不是 Promise 也行 ==========
async function 测试() {
  const 值1 = await 42;             // 普通值，自动包装成 Promise.resolve(42)
  const 值2 = await "红烧肉";       // 字符串也行
  console.log(值1, 值2);            // 42 红烧肉
}
测试();
~~~

---

## 16.3 await 的真正机制详解

**关键问题：await 到底阻塞了谁？**

~~~
await "暂停"的是 async 函数内部的执行，不是主线程！

时间线：

主线程：
  做菜流程()         → 启动 async 函数
  "主线程继续干别的"  → 立即执行！不等 async 函数！

做菜流程（async 函数内部）：
  "开始做菜"          → 立即执行
  await Promise...    → 暂停！把控制权还给主线程
                       （此时厨师去干别的了）
                       （2秒后 Promise 完成，函数恢复执行）
  "红烧肉好了"        → 2秒后执行
  "继续下一道"        → 继续
~~~

**餐厅比喻：**

场景：厨师做菜流程里有一道"炖汤2小时"

~~~
同步（没有 await）：
  厨师：炖汤 →（盯着锅2小时，什么都不做）→ 汤好了 → 切菜
  整个厨房停了2小时 ❌

async/await：
  厨师：炖汤 →（表面上在等，但厨房其他人可以继续工作）→ 汤好了 → 继续切菜
  代码写得像同步，实际是异步 ✅

  厨师本人（async 函数）是"暂停"了，但餐厅（主线程）没有停。
~~~

~~~javascript
// ========== 完整演示：async 函数暂停，主线程不卡 ==========

async function 做三道菜() {
  console.log("🍳 开始做红烧肉");
  await 延时(2000);
  console.log("✅ 红烧肉好了");

  console.log("🍳 开始做麻婆豆腐");
  await 延时(1500);
  console.log("✅ 麻婆豆腐好了");

  console.log("🍳 开始做糖醋里脊");
  await 延时(1000);
  console.log("✅ 糖醋里脊好了");
}

function 延时(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 启动做菜
做三道菜();

// 主线程完全没被卡住！
console.log("👋 主线程：我还能干别的！");
console.log("📋 主线程：我去接新订单了");

// 输出时间线：
// 0ms   → 🍳 开始做红烧肉
// 0ms   → 👋 主线程：我还能干别的！
// 0ms   → 📋 主线程：我去接新订单了
// 2000ms → ✅ 红烧肉好了
// 2000ms → 🍳 开始做麻婆豆腐
// 3500ms → ✅ 麻婆豆腐好了
// 3500ms → 🍳 开始做糖醋里脊
// 4500ms → ✅ 糖醋里脊好了
~~~

---

## 16.4 错误处理

~~~javascript
// ========== 方式1：try...catch（最常用） ==========
async function 点餐() {
  try {
    const 菜 = await 查询菜品("龙虾");
    const 结果 = await 做菜(菜);
    console.log(`✅ ${结果}`);
  } catch (错误) {
    console.log(`❌ ${错误.message}`);
  } finally {
    console.log("📋 服务结束");
  }
}

// ========== 方式2：.catch ==========
async function 点餐2() {
  const 菜 = await 查询菜品("龙虾").catch(错误 => {
    console.log(`❌ ${错误.message}`);
    return null;
  });

  if (!菜) return;

  const 结果 = await 做菜(菜);
  console.log(`✅ ${结果}`);
}

// ========== 方式3：统一错误处理函数 ==========
function 包装(异步函数) {
  return async function(...参数) {
    try {
      return [null, await 异步函数(...参数)];
    } catch (错误) {
      return [错误, null];
    }
  };
}

const 安全点餐 = 包装(async function(菜名) {
  const 菜 = await 查询菜品(菜名);
  return await 做菜(菜);
});

const [错误, 结果] = await 安全点餐("红烧肉");
if (错误) {
  console.log(`❌ ${错误.message}`);
} else {
  console.log(`✅ ${结果}`);
}
~~~

---

## 16.5 async/await + Promise.all（并行执行）

~~~javascript
// ========== 问题：多个 await 串行执行 ==========
async function 串行做菜() {
  const 菜1 = await 做菜("红烧肉");    // 等1秒
  const 菜2 = await 做菜("麻婆豆腐");  // 再等1秒（串行）
  const 菜3 = await 做菜("糖醋里脊");  // 再等1秒（串行）
  return [菜1, 菜2, 菜3];
}
// 总时间：3秒（串行等待）

// ========== 解决：用 Promise.all 并行执行 ==========
async function 并行做菜() {
  const [菜1, 菜2, 菜3] = await Promise.all([
    做菜("红烧肉"),
    做菜("麻婆豆腐"),
    做菜("糖醋里脊")
  ]);
  return [菜1, 菜2, 菜3];
}
// 总时间：1秒（同时做，取最慢的）

// ========== 串行 vs 并行的选择 ==========
// 串行：下一步依赖上一步的结果
async function 串行() {
  const 用户 = await 获取用户();            // 先获取用户
  const 订单 = await 获取订单(用户.ID);    // 再根据用户获取订单
  const 详情 = await 获取详情(订单.ID);    // 再根据订单获取详情
}

// 并行：多个请求之间没有依赖关系
async function 并行() {
  const [菜单, 公告, 活动] = await Promise.all([
    获取菜单(),
    获取公告(),
    获取活动()
  ]);
}
~~~

---

## 16.6 回调 → Promise → async/await 演进对比

~~~javascript
// ========== 同一个需求的三种写法：依次做三道菜 ==========

// 写法1：回调地狱
做红烧肉(结果1 => {
  做麻婆豆腐(结果1, 结果2 => {
    做糖醋里脊(结果2, 结果3 => {
      console.log(结果3);
    });
  });
});

// 写法2：Promise 链
做红烧肉()
  .then(结果1 => 做麻婆豆腐(结果1))
  .then(结果2 => 做糖醋里脊(结果2))
  .then(结果3 => console.log(结果3))
  .catch(错误 => console.log(错误));

// 写法3：async/await
async function 做完所有菜() {
  try {
    const 结果1 = await 做红烧肉();
    const 结果2 = await 做麻婆豆腐(结果1);
    const 结果3 = await 做糖醋里脊(结果2);
    console.log(结果3);
  } catch (错误) {
    console.log(错误);
  }
}
~~~

### 三种方式对比

| | 回调 | Promise | async/await |
|---|---|---|---|
| 写法风格 | 嵌套 | 链式 | 同步风格 |
| 可读性 | 差（金字塔） | 好 | 最好 |
| 错误处理 | 每层单独处理 | .catch 统一处理 | try...catch |
| 调试 | 困难 | 一般 | 容易 |
| 链式传值 | 手动回调传参 | .then 自动传 | 变量赋值 |
| 并行 | 困难 | Promise.all | Promise.all |
| 餐厅比喻 | 每道菜都要等上一道，嵌套套娃 | 流水线平铺 | 一步步做，像同步一样自然 |

---

## 第16章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| async 函数 | 总是返回 Promise 的函数 | 总给取餐小票的流程 |
| await | 等待 Promise 完成，拿到结果值 | 菜好了叫我，我先不傻等 |
| await 暂停谁 | 只暂停 async 函数内部，不阻塞主线程 | 厨师暂停了，但餐厅照常营业 |
| await + 普通值 | 自动包装成 Promise.resolve(值) | 直接给结果也行 |
| async 里 throw | 自动变成 rejected Promise | 做不了就自动通知失败 |
| try...catch | async/await 的错误处理方式 | 出了问题走应急预案 |
| await + Promise.all | 并行等待多个异步操作 | 三道菜同时做，全部好了再一起上 |
| 串行 vs 并行 | 有依赖就串行，没依赖就并行 | 有先后顺序就一步步来，没有就同时做 |
| 回调 → Promise → async/await | 异步编程的演进 | 从套娃到流水线到自然语言 |
