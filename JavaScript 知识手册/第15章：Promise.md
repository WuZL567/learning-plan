# 第15章：Promise

## 15.1 回调地狱问题

**一句话解释：**
当多个异步操作需要按顺序执行时，回调函数嵌套回调函数，形成金字塔结构，代码难以阅读和维护——这就是"回调地狱"。

**餐厅比喻：**
你跟服务员说"做好红烧肉叫我"，红烧肉做好了你说"再做麻婆豆腐做好叫我"，麻婆豆腐做好了你说"再做糖醋里脊做好叫我"……**每一层都要等上一层的结果，层层嵌套，像套娃一样。**

~~~javascript
// ========== 回调地狱 ==========

// 模拟三个异步操作
function 做红烧肉(回调) {
  setTimeout(() => {
    console.log("红烧肉做好了");
    回调("红烧肉");
  }, 1000);
}

function 做麻婆豆腐(菜名, 回调) {
  setTimeout(() => {
    console.log("麻婆豆腐做好了");
    回调(菜名 + " + 麻婆豆腐");
  }, 1000);
}

function 做糖醋里脊(菜名, 回调) {
  setTimeout(() => {
    console.log("糖醋里脊做好了");
    回调(菜名 + " + 糖醋里脊");
  }, 1000);
}

// 回调地狱：层层嵌套
做红烧肉((结果1) => {
  做麻婆豆腐(结果1, (结果2) => {
    做糖醋里脊(结果2, (结果3) => {
      console.log(`全部完成：${结果3}`);
      // 如果还要继续做更多的菜...
      // 嵌套会越来越深，代码变成金字塔
    });
  });
});
// 红烧肉做好了
// 麻婆豆腐做好了
// 糖醋里脊做好了
// 全部完成：红烧肉 + 麻婆豆腐 + 糖醋里脊
~~~

**回调地狱的问题：**

~~~
回调地狱的金字塔：

做红烧肉(结果1 => {
  做麻婆豆腐(结果2 => {
    做糖醋里脊(结果3 => {
      做第四道菜(结果4 => {
        做第五道菜(结果5 => {
          做第六道菜(结果6 => {
            // 越来越深...这叫"金字塔 of doom"
          });
        });
      });
    });
  });
});

问题：
1. 代码横向扩展，难以阅读
2. 错误处理困难（每一层都要单独处理错误）
3. 调试困难
4. 变量作用域混乱
~~~

---

## 15.2 Promise 三种状态

**一句话解释：**
Promise 是一个"承诺"对象，它代表一个**异步操作的最终结果**。有三种状态：`pending`（进行中）、`fulfilled`（已成功）、`rejected`（已失败）。状态一旦改变就不可逆。

**餐厅比喻：**
你去餐厅点了佛跳墙，服务员给你一张**取餐小票**（Promise）。小票有三种状态：
- **pending（等待中）**：厨师正在做，你等着
- **fulfilled（已成功）**：做好了，你拿到佛跳墙了
- **rejected（已失败）**：食材没了，做不了了

小票**从"等待中"变成"成功"或"失败"后，就不会再变了**。

~~~
Promise 的三种状态：

  pending（等待中）
      │
      ├──→ fulfilled（已成功）→ 有结果值
      │         不可逆，不能再变
      │
      └──→ rejected（已失败）→ 有错误原因
                不可逆，不能再变
~~~

---

## 15.3 new Promise / resolve / reject

**一句话解释：**
用 `new Promise()` 创建一个 Promise，接收一个执行器函数（executor），执行器有两个参数：`resolve`（成功时调用）和 `reject`（失败时调用）。

~~~javascript
// ========== 基本创建 ==========
const 小票 = new Promise((resolve, reject) => {
  // 这里写异步操作
  setTimeout(() => {
    const 成功 = true;

    if (成功) {
      resolve("佛跳墙做好了");   // 成功时调用，传入结果值
    } else {
      reject("食材没了，做不了"); // 失败时调用，传入错误原因
    }
  }, 2000);
});

console.log(小票);  // Promise {<pending>}（2秒内是 pending 状态）

// 2秒后：
// 如果 resolve → Promise {<fulfilled>: "佛跳墙做好了"}
// 如果 reject  → Promise {<rejected>: "食材没了，做不了"}
~~~

~~~javascript
// ========== resolve / reject 的参数 ==========
// 可以传任何值：字符串、数字、对象、数组、甚至另一个 Promise

// 传字符串
const 成功小票1 = Promise.resolve("红烧肉做好了");
console.log(成功小票1);  // Promise {<fulfilled>: "红烧肉做好了"}

// 传对象
const 成功小票2 = Promise.resolve({ 菜名: "红烧肉", 价格: 38 });
console.log(成功小票2);  // Promise {<fulfilled>: {菜名: "红烧肉", 价格: 38}}

// 传错误对象
const 失败小票 = Promise.reject(new Error("食材过期"));
console.log(失败小票);  // Promise {<rejected>: Error: 食材过期}

// 传另一个 Promise（会等待那个 Promise 完成）
const 嵌套 = Promise.resolve(Promise.resolve("深层结果"));
嵌套.then(v => console.log(v));  // 深层结果
~~~

---

## 15.4 .then / .catch / .finally

**一句话解释：**
- `.then(成功回调)`：Promise 成功时执行
- `.catch(失败回调)`：Promise 失败时执行
- `.finally(回调)`：不管成功还是失败，最后都执行

~~~javascript
// ========== 基本用法 ==========
const 做菜 = new Promise((resolve, reject) => {
  setTimeout(() => {
    const 成功 = Math.random() > 0.3;  // 70% 概率成功
    if (成功) {
      resolve({ 菜名: "红烧肉", 价格: 38 });
    } else {
      reject(new Error("厨房着火了"));
    }
  }, 1000);
});

做菜
  .then(结果 => {
    console.log(`成功：${结果.菜名}，${结果.价格}元`);
  })
  .catch(错误 => {
    console.log(`失败：${错误.message}`);
  })
  .finally(() => {
    console.log("做菜流程结束（不管成功还是失败）");
  });

// ========== .then 的第二个参数也可以处理失败 ==========
做菜.then(
  结果 => console.log(`成功：${结果.菜名}`),   // 成功
  错误 => console.log(`失败：${错误.message}`)  // 失败
);

// ========== .catch vs .then 的第二个参数 ==========
// 推荐用 .catch，因为 .catch 能捕获 .then 里的错误
做菜
  .then(结果 => {
    console.log(结果.不存在的属性.xxx);  // 这里会出错
  })
  .catch(错误 => {
    console.log(`捕获到错误：${错误.message}`);  // ✅ 能捕获 .then 里的错误
  });
~~~

---

## 15.5 链式调用

**一句话解释：**
`.then()` 返回一个**新的 Promise**，所以可以一直链下去。每一步的结果传给下一步。

**餐厅比喻：**
厨师说"红烧肉做好了告诉你"，你拿到结果后说"再做麻婆豆腐做好了告诉我"，再拿到结果后说"再做糖醋里脊"……**每一步都是在上一步的结果基础上继续**，但不是嵌套，而是**像流水线一样平铺下去**。

~~~javascript
// ========== 回调地狱 → Promise 链 ==========

// 模拟三个异步操作（返回 Promise 版本）
function 做红烧肉() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("红烧肉做好了");
      resolve("红烧肉");
    }, 1000);
  });
}

function 做麻婆豆腐() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("麻婆豆腐做好了");
      resolve("麻婆豆腐");
    }, 1000);
  });
}

function 做糖醋里脊() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log("糖醋里脊做好了");
      resolve("糖醋里脊");
    }, 1000);
  });
}

// Promise 链式调用（告别回调地狱）
做红烧肉()
  .then(结果1 => {
    console.log(`${结果1}上桌了`);
    return 做麻婆豆腐();  // 返回新的 Promise，下一步等它完成
  })
  .then(结果2 => {
    console.log(`${结果2}上桌了`);
    return 做糖醋里脊();
  })
  .then(结果3 => {
    console.log(`${结果3}上桌了`);
    console.log("全部完成！");
  })
  .catch(错误 => {
    console.log(`出错了：${错误.message}`);
  });
// 红烧肉做好了 → 红烧肉上桌了
// 麻婆豆腐做好了 → 麻婆豆腐上桌了
// 糖醋里脊做好了 → 糖醋里脊上桌了 → 全部完成！
~~~

### .then 返回值的规则

~~~javascript
// ========== 规则1：.then 返回普通值 → 下一个 .then 收到这个值 ==========
Promise.resolve(1)
  .then(值 => {
    console.log(值);   // 1
    return 值 + 1;      // 返回普通值 2
  })
  .then(值 => {
    console.log(值);   // 2（收到上一步的返回值）
    return 值 + 1;      // 返回普通值 3
  })
  .then(值 => {
    console.log(值);   // 3
  });

// ========== 规则2：.then 返回 Promise → 下一个 .then 等这个 Promise 完成 ==========
function 做菜(菜名) {
  return new Promise(resolve => {
    setTimeout(() => resolve(`${菜名}做好了`), 500);
  });
}

做菜("红烧肉")
  .then(结果 => {
    console.log(结果);      // 红烧肉做好了
    return 做菜("麻婆豆腐"); // 返回新的 Promise
  })
  .then(结果 => {
    console.log(结果);      // 麻婆豆腐做好了（等上面的 Promise 完成才执行）
  });

// ========== 规则3：.then 不返回值 → 下一个 .then 收到 undefined ==========
Promise.resolve("值")
  .then(值 => {
    console.log(值);    // 值
    // 没有 return → 返回 undefined
  })
  .then(值 => {
    console.log(值);    // undefined
  });

// ========== 规则4：.then 里抛出错误 → 被最近的 .catch 捕获 ==========
Promise.resolve("开始")
  .then(() => {
    throw new Error("出错了");
  })
  .then(() => {
    console.log("不会执行");  // 跳过了
  })
  .catch(错误 => {
    console.log(`捕获：${错误.message}`);  // 捕获：出错了
  });
~~~

---

## 15.6 Promise.resolve / Promise.reject

~~~javascript
// ========== Promise.resolve：创建一个立即成功的 Promise ==========
const 成功 = Promise.resolve("成功了");
成功.then(v => console.log(v));  // 成功了

// 等价于
const 成功2 = new Promise(resolve => resolve("成功了"));

// ========== Promise.reject：创建一个立即失败的 Promise ==========
const 失败 = Promise.reject("失败了");
失败.catch(v => console.log(v));  // 失败了

// 等价于
const 失败2 = new Promise((_, reject) => reject("失败了"));

// ========== Promise.resolve 的特殊行为：如果参数是 Promise，直接返回它 ==========
const 原始 = new Promise(resolve => setTimeout(() => resolve("原始结果"), 1000));
const 同一个 = Promise.resolve(原始);
console.log(原始 === 同一个);  // true（同一个 Promise，不会包装两层）
~~~

---

## 15.7 Promise.all / allSettled / race / any

### Promise.all

**一句话解释：**
所有 Promise **全部成功**才算成功，返回所有结果的数组。只要**有一个失败**就立即失败。

**餐厅比喻：**
你点了三道菜，**全部做好了才一起上桌**。如果有一道做砸了，那整桌都不上了。

~~~javascript
// ========== Promise.all：全部成功才成功 ==========
const 做菜A = new Promise(r => setTimeout(() => r("红烧肉"), 1000));
const 做菜B = new Promise(r => setTimeout(() => r("麻婆豆腐"), 2000));
const 做菜C = new Promise(r => setTimeout(() => r("糖醋里脊"), 1500));

Promise.all([做菜A, 做菜B, 做菜C])
  .then(结果们 => {
    console.log(结果们);  // ["红烧肉", "麻婆豆腐", "糖醋里脊"]
    // 结果的顺序和传入的顺序一致，不受完成先后影响
  })
  .catch(错误 => {
    console.log(`有一道菜做砸了：${错误.message}`);
  });
// 等了2秒（最慢的），然后三个结果一起返回

// ========== 有一个失败就立即失败 ==========
const 快的 = Promise.resolve("做完了");
const 慢的 = new Promise(r => setTimeout(() => r("慢的"), 3000));
const 会失败 = Promise.reject(new Error("做砸了"));

Promise.all([快的, 慢的, 会失败])
  .then(结果们 => console.log(结果们))
  .catch(错误 => console.log(`失败：${错误.message}`));
// 失败：做砸了（不会等慢的那个，因为已经有一个失败了）
~~~

### Promise.allSettled

**一句话解释：**
等所有 Promise **全部完成**（不管成功还是失败），返回每个结果的状态和值。

**餐厅比喻：**
你点了三道菜，**不管做好了还是做砸了，你都要知道每一道的情况**。

~~~javascript
const 做菜A = Promise.resolve("红烧肉做好了");
const 做菜B = Promise.reject(new Error("麻婆豆腐做砸了"));
const 做菜C = Promise.resolve("糖醋里脊做好了");

Promise.allSettled([做菜A, 做菜B, 做菜C])
  .then(结果们 => {
    结果们.forEach(结果 => {
      if (结果.status === "fulfilled") {
        console.log(`✅ ${结果.value}`);
      } else {
        console.log(`❌ ${结果.reason.message}`);
      }
    });
  });
// ✅ 红烧肉做好了
// ❌ 麻婆豆腐做砸了
// ✅ 糖醋里脊做好了

// 每个结果的格式：
// 成功：{ status: "fulfilled", value: 成功值 }
// 失败：{ status: "rejected", reason: 失败原因 }
~~~

### Promise.race

**一句话解释：**
**谁快用谁**——第一个完成的 Promise 的结果（成功或失败）就是最终结果。

**餐厅比喻：**
你同时向三家供应商下单买猪肉，**谁先送到就用谁的**，其他两家送到也不要了。

~~~javascript
// ========== 谁快用谁 ==========
const 供应商A = new Promise(r => setTimeout(() => r("A的猪肉"), 3000));
const 供应商B = new Promise(r => setTimeout(() => r("B的猪肉"), 1000));
const 供应商C = new Promise(r => setTimeout(() => r("C的猪肉"), 2000));

Promise.race([供应商A, 供应商B, 供应商C])
  .then(结果 => console.log(结果));  // B的猪肉（B最快，1秒）

// ========== 竞速失败 ==========
const 慢成功 = new Promise(r => setTimeout(() => r("成功"), 3000));
const 快失败 = Promise.reject(new Error("快速失败"));

Promise.race([慢成功, 快失败])
  .then(v => console.log(v))
  .catch(e => console.log(e.message));  // 快速失败（失败的那个更快）

// ========== 实际用途：请求超时 ==========
function 带超时的请求(请求Promise, 超时毫秒) {
  const 超时 = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`请求超时（${超时毫秒}ms）`)), 超时毫秒);
  });

  return Promise.race([请求Promise, 超时]);
}

const 慢请求 = new Promise(r => setTimeout(() => r("数据"), 5000));

带超时的请求(慢请求, 2000)
  .then(数据 => console.log(数据))
  .catch(错误 => console.log(错误.message));  // 请求超时（2000ms）
~~~

### Promise.any

**一句话解释：**
**谁成功用谁**——第一个成功的结果就是最终结果。只有**全部失败**才失败。

**餐厅比喻：**
你向三家供应商买猪肉，**谁先有货就用谁**。如果三家都没货（全部失败），那你才买不到。

~~~javascript
// ========== 谁成功用谁 ==========
const 供应商A = Promise.reject(new Error("A没货"));
const 供应商B = new Promise(r => setTimeout(() => r("B的猪肉"), 1000));
const 供应商C = new Promise(r => setTimeout(() => r("C的猪肉"), 2000));

Promise.any([供应商A, 供应商B, 供应商C])
  .then(结果 => console.log(结果));  // B的猪肉（第一个成功的）

// ========== 全部失败才失败 ==========
const 全失败A = Promise.reject(new Error("A没货"));
const 全失败B = Promise.reject(new Error("B没货"));
const 全失败C = Promise.reject(new Error("C没货"));

Promise.any([全失败A, 全失败B, 全失败C])
  .then(v => console.log(v))
  .catch(错误 => {
    console.log(`全部失败：${错误.message}`);  // All promises were rejected
    console.log(错误.errors);  // [Error: A没货, Error: B没货, Error: C没货]
  });
~~~

### 四种并发方法对比

| | 全部成功才算成功 | 有一个失败就失败 | 谁快用谁 | 谁成功用谁 |
|---|---|---|---|---|
| 方法 | `Promise.all` | ❌ | ❌ | ❌ |
| 方法 | ❌ | ❌ | `Promise.race` | ❌ |
| 方法 | `Promise.allSettled` | ❌ | ❌ | ❌ |
| 方法 | ❌ | ❌ | ❌ | `Promise.any` |

| 方法 | 成功条件 | 失败条件 | 返回值 | 餐厅比喻 |
|---|---|---|---|---|
| `Promise.all` | 全部成功 | 有一个失败 | 所有结果的数组 | 全做好了才上桌 |
| `Promise.allSettled` | 永远不reject | 永远不reject | 每个的状态和值 | 不管好坏，每道都报告 |
| `Promise.race` | 最快的成功 | 最快的失败 | 第一个完成的结果 | 谁快用谁 |
| `Promise.any` | 有一个成功 | 全部失败 | 第一个成功的结果 | 谁有货用谁 |

---

## 第15章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| 回调地狱 | 回调层层嵌套，难以维护 | 每做一道菜都要等上一道，嵌套套娃 |
| Promise | 异步操作的"承诺"，代表未来的值 | 取餐小票 |
| pending | 进行中，还没出结果 | 厨师正在做 |
| fulfilled | 已成功，有结果值 | 做好了，可以取餐 |
| rejected | 已失败，有错误原因 | 食材没了，做不了 |
| 状态不可逆 | pending → fulfilled 或 rejected 后不能再变 | 小票状态只能变一次 |
| new Promise | 创建 Promise，接收 executor | 发小票 |
| resolve | 成功时调用 | 做好了通知你 |
| reject | 失败时调用 | 做不了通知你 |
| .then | 成功时执行的回调 | 做好了来取餐 |
| .catch | 失败时执行的回调 | 做不了来退款 |
| .finally | 不管成功失败都执行 | 无论如何流程结束 |
| 链式调用 | .then 返回新 Promise，可以一直链下去 | 流水线平铺，不嵌套 |
| .then 返回值规则 | 普通值→传给下一步；Promise→等它完成 | 拿到结果继续下一步 |
| Promise.all | 全部成功才成功 | 全做好了才上桌 |
| Promise.allSettled | 等全部完成，不管成功失败 | 每道菜都报告结果 |
| Promise.race | 谁快用谁 | 谁先送到用谁的 |
| Promise.any | 谁成功用谁 | 谁有货用谁的 |
