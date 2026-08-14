# 📝 周复盘 · 第 1 周

> 日期：2026-08-14
> 考察范围：模块1 JS核心 1.1 ~ 1.23（含 1.16 this、1.12~1.15 原型链、1.19 bind、1.20 事件循环、1.22/1.23 Promise）
> 预计用时：**40 分钟**
> 满分：**10 分**（概念题 3 道 × 2 分 + 手写题 1 道 × 4 分），8 分及以上通过

---

## 🎯 选题依据（逐条引用 dialogue 薄弱点）

| # | 薄弱点来源 | 对应题目 |
|---|-----------|---------|
| 1 | 1.16 this：8 道输出题第一轮错 3 道半（第 4/7/8 题），三轮才到 8.5 分；**且 1.23 手写 Promise 首轮崩溃的直接原因就是同一个 this 坑**（普通函数被独立调用 this=undefined）——唯一跨技术点复现的薄弱点 | 题 1 |
| 2 | 1.12 原型链图缺实例链扣 2 分；1.3 把 `arr instanceof Object` 写成 `arr.__proto__ === Object.prototype`（少一级）；1.13 把 super(name) 答成 `Object.setPrototypeOf(Animal.prototype)`（完全答错）；1.15 首轮 2.5 分唯一一次"重学" | 题 2 |
| 3 | 1.20 第 3、6 题同因连错（以为 async 函数调用是异步的）；"宏任务为什么一次取一个"首答"我没理解"；"DOM 更新 vs 渲染"混淆答"渲染 3 次" | 题 3 |
| 4 | 1.19 bind 三次迭代（4.8 → 7.8 → 9.5）、1.15 Object.create 三次迭代（2.5 → 6.5 → 9.3）——全程最惨的两个代码点；1.19 用 `Object.getPrototypeOf(originThis.prototype)` 丢掉原函数 prototype 导致双 bug | 题 4 |

---

## 📄 题目

### 题 1 🗡️ 字节跳动 · 二面（2 分）

> 手写 bind 的时候，为什么要处理 new 的情况？new 出来的实例和 bind 绑定的 this，谁优先级更高，为什么？另外，类组件里绑定方法时，"class field 箭头函数"和"constructor 里 bind"这两种方式有什么区别？

**⚠️ 历史 bug 提醒：** 你在 1.16 第 4 题漏了"`bound('张三')` 是普通调用、bind 正常生效"，第 8 题 class field 两问全反；1.23 手写 Promise 首轮 resolve/reject 用普通 function，this 丢失直接崩溃。

**答题要求：** 用自己的话说清三点——① bind 函数里怎么判断自己是被 new 调用的；② new 优先于 bind 的机制（构造后实例的属性从哪来）；③ class field 箭头函数与 constructor bind 在"函数存哪、何时绑定"上的区别。

1、因为bind返回了一个闭包函数，有可能会被new调用当作构造函数使用，bind函数内部通过判断调用返回的函数的this是不是instanceof bind内部返回出去的绑定函数；
2、new绑定this的优先级要高于bind这种显式绑定this的，因为new调用时底层先创建新对象，把构造函数的this指向它，bind的context没有机会；源码就是const truthThis = this instanceof bindFn ? this : context 这里；
3、class field箭头函数绑定和constructor里面bind绑定基本原理一致，箭头函数的this来自外层作用域上继承的this，而constructor则是在指定bind绑定到指定对象上。
class field箭头函数的函数只在实例子身上，而constructor的bind则是在原型上保留原始方法，每个实例多处一份副本；两者都在构造是绑定；

---

### 题 2 🗡️ 美团 · 一面（2 分）

> 判断以下每个输出是 true 还是 false，并画出这张图：实例 f 的完整原型链 + 构造函数 Foo 自己的原型链（两条链都要画）。
>
> ```js
> function Foo() {}
> const f = new Foo()
> console.log(f.__proto__ === Foo.prototype)          // ①
> console.log(Foo.__proto__ === Function.prototype)   // ②
> console.log(Foo.prototype.__proto__ === Object.prototype) // ③
> console.log(Object.__proto__ === Function.prototype)      // ④
> console.log(Function.prototype.__proto__ === Object.prototype) // ⑤
> ```

**⚠️ 历史 bug 提醒：** 1.12 原型链图只画了构造函数链、缺实例链（扣 2 分）；1.3 把 `arr instanceof Object` 写成 `arr.__proto__ === Object.prototype`，少了一级。

**答题要求：** 5 个判断 + 两条链图。图里要标清楚每个节点：实例 → 谁 → 谁 → null；Foo → 谁 → 谁。另外回答一句：`f instanceof Object` 是沿着哪条链、怎么逐级判断的。

1、true；
2、true；
3、true；
4、true；
5、true；

实例f的完整原型链：
f.__proto__ => Foo.prototype
               Foo.prototype.__proto__ => Object.prototype
                                          Object.prototype.__proto__ => null

构造函数Foo的原型链：
Foo.__proto__ => Function.prototype
                 Function.prototype.__proto__ => Object.prototype
                                                 Object.prototype.__proto__ => null

f instanceof Object 则是沿着实例f的完整原型链，一直走到 Object.prototype 来判断的；

---

### 题 3 🗡️ 滴滴 · 一面（2 分）

> 写出完整输出顺序，并逐步解释每一条输出的原因。
>
> ```js
> async function async1() {
>   console.log('async1 start')
>   await async2()
>   console.log('async1 end')
> }
> async function async2() {
>   console.log('async2')
> }
> console.log('script start')
> setTimeout(function() {
>   console.log('setTimeout')
> }, 0)
> async1()
> new Promise(function(resolve) {
>   console.log('promise1')
>   resolve()
> }).then(function() {
>   console.log('promise2')
> })
> console.log('script end')
> ```

**⚠️ 历史 bug 提醒：** 1.20 第 3、6 题都错在同一个点——"以为 async 函数调用是异步的"。记住：**await 右侧表达式是同步执行的，await 下一行开始的代码才是微任务**。

**答题要求：** 输出顺序 + 逐条解释。解释时要覆盖：① `await async2()` 的执行时机；② 微任务队列的入队顺序（async1 end 和 promise2 谁先谁后、为什么）；③ setTimeout 为什么最后。

输出顺序：script start -> async1 start -> async2 -> promise1 -> script end -> async1 end -> promise2 -> setTimeout
首先同步任务有：script start, async1 start, async2, promise1, script end，因为执行了async1函数时，里面的同步代码也要执行，所以async1 start是同步任务，而await async2则是考虑await的下一行为异步任务，但是await右侧表达式是同步执行的，所以在async2中，打印async2也是同步任务，而promise1则是注册Promise时的同步代码；
微任务有：async1 end, promise2，await async2()之后的代码是异步任务，也是微任务；而promise2在Promise.then()中，所以也是微任务；因为async1 end代码先执行，所以先于promise2；
宏任务有：setTimeout；

---

### 题 4 🗡️ 腾讯 · 一面（4 分，手写题，两个实现）

> 手写两个函数：
>
> ① **手写 Function.prototype.bind**（命名为 `myBind`），要求：普通调用绑定 this 和参数、支持 new 场景（new 时 this 绑定失效、实例原型链不断）。
>
> ② **手写 Object.create**（命名为 `myCreate`），要求：指定原型创建对象、原型传 null 时创建真正无原型对象（不落到 Object.prototype）、实现第二个参数 propertiesObject（属性描述符）。
>
> 写完后自己跑测试用例验证（bind 至少测：普通调用 / 参数合并 / new 场景 instanceof 和原型方法；myCreate 至少测：正常 / null / 类型校验报错 / propertiesObject）。

**⚠️ 历史 bug 提醒：** 1.19 你写 `bindFn.prototype = Object.getPrototypeOf(originThis.prototype)`——拿的是原函数 prototype 的**父级**，把原函数 prototype 本身丢了，导致普通调用被误判成 new、new 场景原型链断裂两个连锁 bug；1.15 首轮没做类型校验、propertiesObject 完全没写。另外 1.17/1.18/1.19 你连续三次不写测试用例就提交——这次**先测再交**。

**答题位置：** 创建 `weekly/week-01-code.js`，代码写在里面。答题时告诉我路径。

---

## 📊 评分表

| 题号 | 题型 | 分值 | 得分 | 扣分原因 |
|------|------|:---:|:---:|---------|
| 1 | 概念 · this 与 bind | 2 | 2 | 补点后：②机制答对、③区别点答对且通过追问验证 ✓ |
| 2 | 概念 · 原型链两条链 | 2 | 2 | 补点后：实例链图改对（"prototype 其实是对象"理解到位）✓ |
| 3 | 概念 · 事件循环输出 | 2 | 1.6 | 输出全对；"setTimeout 为什么最后"只答"宏任务"，未答"微任务清空后才取宏任务"机制（-0.4） |
| 4 | 手写 · myBind + myCreate | 4 | 3.9 | myCreate 测试缺"类型校验报错"和"propertiesObject"两项要求用例（-0.1） |
| **总分** | | **10** | **9.5** | ✅ **通过**（第一轮 7.9 补点后 9.5） |

### 评分维度说明

- **概念题每题 2 分**：白话解释 0.5 + 追问/对比 0.5 + 深挖/写代码 1
- **手写题 4 分**：代码正确性 2 + 边界处理 1 + 对比总结/注释 1（两个实现按实际占比拆分：myBind 2.5 分 + myCreate 1.5 分）
- **8 分及以上通过**，不通过则针对薄弱题补练后重考

---

## 🧑‍🏫 导师总结（由导师批改后填写）

### 批改详情（2026-08-14 第一轮）

**题 1（1.2/2）**

- ① ✓ 正确：bind 返回的绑定函数可能被 new 调用，用 `this instanceof bindFn` 判断。
- ② 半对：优先级答对（new > bind）。但"为什么"停在代码实现层（"代码里先判断"）——这是循环论证：代码先判断 new，是因为规范要求 new 优先，不是反过来。**机制**：new 调用时引擎先创建新对象、把构造函数的 this 硬指向它，bind 绑定的 context 根本没机会上场；实例的属性来自 `originThis.apply(新实例, 合并参数)` 时构造函数里 `this.xxx` 的赋值。
- ③ 半对：方向对（都能钉死 this），但区别点没抓到。真正的区别——**函数存哪**：class field 箭头函数是构造时在实例自身上新建的函数，prototype 上没有（子类 super.xxx 拿不到）；constructor bind 是原型上保留原始方法、每个实例上多一份绑定副本。**何时绑定**：两者都是构造时锁定（你 1.16 二轮曾答错成"bind 是调用时确定"）。

**题 2（1.2/2）**

- 5 个判断全对 ✓（含 ③）
- 构造函数链图对 ✓
- 实例链图错 ✗：`Foo.prototype.__proto__` 画成了 `Function.prototype`，正确是 `Object.prototype`。判断 ③ 自己答了 true、图里却写 Function.prototype——自相矛盾，说明判断记住了、链的直觉没建立。**Foo.prototype 是谁造的？** 它是 `new Object()` 造出来的普通对象，所以它的 `__proto__` 指向 Object.prototype。Function.prototype 只出现在"函数对象"的链上（Foo 本身、Function 本身）。
- 正确实例链：`f → Foo.prototype → Object.prototype → null`
- `f instanceof Object` 解释 ✓

**题 3（1.6/2）**

- 输出顺序 8 条全对 ✓
- "await 右侧表达式同步执行"明确答出 ✓——1.20 第 3、6 题的同款 bug 这次避开了
- 微任务顺序 async1 end → promise2 及原因（先入队先执行）✓
- 扣 0.4：setTimeout 为什么最后只说"宏任务"，没答机制——同步代码跑完 → **微任务队列清空** → 才从宏任务队列取一个执行。这是 1.20 追问里你答"我没理解"的点，方向对了，机制要能说出口。

**题 4（3.9/4）**

- **myBind 2.5/2.5 满分**：跑通验证，7 个场景全对。1.19 用 `Object.getPrototypeOf(originThis.prototype)` 丢掉原函数 prototype 的坑，这次 `Object.create(originThis.prototype)` 用对了；null/undefined 处理、原始类型包装、参数合并、new 场景（instanceof ✓ 原型方法 ✓）全对；测试这次写了 ✓（普通调用/参数合并/new 三场景）。
- **myCreate 1.4/1.5**：实现全对（类型校验、null 无原型分支、new F() 经典做法、defineProperties）。扣 0.1：题目要求至少测 4 项，测了 2 项——类型校验报错和 propertiesObject 没测。实现了但没验证。进步：1.15 首轮 propertiesObject 完全没写、这次写出来了；但测试习惯还差一点。

### 最扎实的点

代码执行能力：题 4 两个手写实现全部跑通、一次过，1.19/1.23 踩过的原型链坑和 this 坑都没有再犯；题 3 输出题全对。

### 最薄弱的点

概念机制的深度：题 1 的"为什么"和题 2 的图都暴露同一个模式——**结果记住了、机制没建立**（判断③答 true 但图里画错、new 优先级答对但讲不出原因）。面试官会顺着答案往下追问机制，答不出"为什么"等于没答。

### 补点要求（修改后重新提交，只重评题 1、题 2）

1. **题 2**：重画实例链图（改对 `Foo.prototype.__proto__` 指向），并写一句：Foo.prototype 为什么指向 Object.prototype（它是谁造出来的）。
2. **题 1**：补答 ② 的机制（new 调用时实例的属性到底从哪来、bind 的 context 为什么失效）+ ③ 的区别（class field 箭头函数和 constructor bind，各自"函数存在哪、什么时候绑定"）。

### 第二轮批改（补点后）

**题 1 → 2/2** ✓

- ② 修改后机制答对：new 调用时底层先创建新对象、把构造函数的 this 指向它，bind 的 context 没有机会上场，并联系到自己代码里的 `truthThis = this instanceof bindFn ? this : context`。
- ③ 修改后区别点答对：class field 箭头函数只在实例自身上、prototype 上没有；constructor bind 是原型上保留原始方法、每个实例多一份绑定副本；两者都是构造时锁定。
- 学生口头说"两者都是构造时锁定这句话还是没怎么理解"——**没有让他糊弄过去**。导师用"出生证 vs 护照复印件"类比拆解（锁定发生在 new 的那一刻，不是调用时），然后追问验证：
  - 问：`a1.handle === a2.handle`？答：false，每个 new 都创建了一个新的箭头函数 ✓
  - 问：`A.prototype.handle` 是什么？答：undefined，因为 class field 不在原型上 ✓
  - 两问全对，判定真懂，不是背答案。

**题 2 → 2/2** ✓

- 实例链图改对：`f → Foo.prototype → Object.prototype → null`。
- 学生口头补充领悟："是我忘记了，prototype 其实是对象"——一句话说清了根因：Foo.prototype 是 new Object() 造出来的普通对象，所以它的 `__proto__` 指向 Object.prototype，与函数对象链无关。

### 最终结论

**总分 9.5/10，通过。** 第一轮 7.9（差 0.1）→ 补点两题 → 9.5。

- **最扎实的点**：代码执行能力。题 4 两个手写实现一次跑通（1.19/1.15 踩过的坑全部避开），题 3 输出题全对，1.20 的老 bug 没再犯。
- **最薄弱的点**：概念机制的深度——但补点过程中展现了正确的学习姿态：主动说"这句话没怎么理解"而不是装懂，追问验证两问全对后机制真正落地。保持这个习惯：**面试答案里每个名词都要能经得起一句"为什么"**。
- **下一步**：周复盘通过，学习天数计数器重新起算。回到主线继续 1.24 手写 Promise.all（P0 | 能写代码，闭眼默写无 bug）。1.24-1.27 是 Promise 静态方法四连，结构相似，学完 1.24 后可尝试 1.25-1.27 一起完成一起提交。
