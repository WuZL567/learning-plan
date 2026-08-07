# 面试高频手写题大全（餐厅版·完整版）

## 目录速查

| 题号 | 题目 | 难度 | 面试频率 | 核心知识点 |
|---|---|---|---|---|
| 1 | 手写 typeof | ⭐⭐ | 🔥🔥🔥 | 底层类型标签 |
| 2 | 手写 new | ⭐⭐ | 🔥🔥🔥 | 原型链 |
| 3 | 手写 instanceof | ⭐⭐ | 🔥🔥🔥 | 原型链 |
| 4 | 手写 call / apply | ⭐⭐ | 🔥🔥🔥 | this 绑定 |
| 5 | 手写 bind | ⭐⭐⭐ | 🔥🔥🔥 | this + 闭包 |
| 6 | 手写 深拷贝 | ⭐⭐⭐ | 🔥🔥🔥 | 递归 + WeakMap |
| 7 | 手写 防抖 | ⭐⭐ | 🔥🔥🔥 | 闭包 + 定时器 |
| 8 | 手写 节流 | ⭐⭐ | 🔥🔥🔥 | 闭包 + 时间戳 |
| 9 | 手写 柯里化 | ⭐⭐⭐ | 🔥🔥 | 闭包 + 递归 |
| 10 | 手写 compose / pipe | ⭐⭐⭐ | 🔥🔥 | 函数组合 |
| 11 | 手写 Promise（A+） | ⭐⭐⭐⭐⭐ | 🔥🔥🔥 | 状态机 + 回调队列 |
| 12 | 手写 Promise.all | ⭐⭐⭐ | 🔥🔥🔥 | 并发计数 |
| 13 | 手写 Promise.race | ⭐⭐ | 🔥🔥 | 并发控制 |
| 14 | 手写 Promise.allSettled | ⭐⭐ | 🔥🔥 | 并发控制 |
| 15 | 手写 Promise.any | ⭐⭐ | 🔥🔥 | 并发控制 |
| 16 | 手写 发布订阅模式 | ⭐⭐⭐ | 🔥🔥🔥 | 观察者模式 |
| 17 | 手写 Object.create | ⭐⭐ | 🔥🔥 | 原型链 |
| 18 | 手写 Array.prototype.map | ⭐⭐ | 🔥🔥🔥 | 数组遍历 |
| 19 | 手写 Array.prototype.filter | ⭐⭐ | 🔥🔥🔥 | 数组遍历 |
| 20 | 手写 Array.prototype.reduce | ⭐⭐⭐ | 🔥🔥🔥 | 累积计算 |
| 21 | 手写 Array.flat | ⭐⭐ | 🔥🔥 | 递归 / 栈 |
| 22 | 手写 数组去重 | ⭐⭐ | 🔥🔥 | Set / filter |
| 23 | 手写 类型判断函数 | ⭐⭐ | 🔥🔥 | toString |
| 24 | 手写 寄生组合式继承 | ⭐⭐⭐ | 🔥🔥🔥 | 原型链 + 构造函数 |
| 25 | 手写 async/await | ⭐⭐⭐⭐ | 🔥🔥 | Generator + 自动执行器 |
| 26 | 手写 LRU 缓存 | ⭐⭐⭐ | 🔥🔥🔥 | Map + 链表 |
| 27 | 手写 并发控制器 | ⭐⭐⭐⭐ | 🔥🔥🔥 | Promise + 队列 |
| 28 | 手写 大数相加 | ⭐⭐⭐ | 🔥🔥 | 字符串运算 |

---

## 1. 手写 typeof

### 原理说明

`typeof` 不是通过检查值的内容来判断类型的，而是**直接读取值在内存中的类型标签**（Type Tag）。

JS 引擎在 V8 中，每个值的底层都用若干位来标记类型：

~~~
V8 底层类型标签（Smi / HeapObject）：

Smi（Small Integer）：直接存在寄存器中，最低位是 0
HeapObject：存在堆上，最低位是 1，通过 Map（隐藏类）确定具体类型

typeof 的判断逻辑（伪代码）：
  if (值 === undefined)         return "undefined"
  if (值 === null)              return "object"    ← 历史bug！
  if (值是数字)                 return "number"
  if (值是字符串)               return "string"
  if (值是布尔)                 return "boolean"
  if (值是函数)                 return "function"  ← 特殊：函数是对象的子类型
  if (值是 Symbol)              return "symbol"
  if (值是 BigInt)              return "bigint"
  其他                           return "object"
~~~

`typeof null === "object"` 的原因：JS 第一版用 32 位存储值，低位 3 位是类型标签，`000` 表示对象。null 被表示为全零（空指针），低位也是 `000`，所以被误判为 object。这个 bug 保留至今，因为修复会破坏大量线上代码。

### 代码实现

~~~javascript
function myTypeof(值) {
  // typeof 的本质是读底层标签，我们用 Object.prototype.toString 模拟（完全不依赖原生 typeof）
  if (值 === undefined) return "undefined";
  if (值 === null) return "object";         // 模拟历史bug，保持和原生一致

  // 用 Object.prototype.toString.call 获取精确类型
  const 类型标签 = Object.prototype.toString.call(值);  // "[object XXX]"
  const 类型名 = 类型标签.slice(8, -1);  // 提取 XXX

  // 映射成 typeof 的返回值
  const 映射表 = {
    "Number": "number",
    "String": "string",
    "Boolean": "boolean",
    "Symbol": "symbol",
    "BigInt": "bigint",
    "Function": "function",
    "Array": "object",      // typeof [] === "object"
    "Object": "object",
    "Date": "object",
    "RegExp": "object",
    "Map": "object",
    "Set": "object",
  };

  return 映射表[类型名] || "object";
}

// ========== 测试 ==========
console.log(myTypeof(42));              // "number"
console.log(myTypeof("红烧肉"));        // "string"
console.log(myTypeof(true));            // "boolean"
console.log(myTypeof(undefined));       // "undefined"
console.log(myTypeof(null));            // "object" ← 历史bug
console.log(myTypeof(Symbol()));        // "symbol"
console.log(myTypeof(42n));             // "bigint"
console.log(myTypeof([]));              // "object"
console.log(myTypeof({}));              // "object"
console.log(myTypeof(function(){}));    // "function"
~~~

---

## 2. 手写 new

### 原理说明

`new` 关键字做了 4 件事：

~~~
new 构造函数(参数) 的内部步骤：

第1步：创建一个全新的空对象 {}
第2步：把空对象的 __proto__ 指向构造函数的 prototype
第3步：执行构造函数，this 指向这个新对象
第4步：如果构造函数返回了一个对象，就用那个对象；
       否则返回这个新对象
~~~

关键点：第4步解释了为什么 `return 123` 会被忽略（不是对象），但 `return { a: 1 }` 会被采用（是对象）。

### 代码实现

~~~javascript
function myNew(构造函数, ...参数们) {
  // 第1步 + 第2步：创建空对象，设置原型链
  const 新对象 = Object.create(构造函数.prototype);

  // 第3步：执行构造函数，this 指向新对象
  const 结果 = 构造函数.apply(新对象, 参数们);

  // 第4步：判断返回值
  return 结果 !== null && (typeof 结果 === "object" || typeof 结果 === "function")
    ? 结果      // 构造函数返回了对象，用它
    : 新对象;   // 否则用新创建的对象
}

// ========== 测试 ==========
function 餐厅(名字, 城市) {
  this.名字 = 名字;
  this.城市 = 城市;
}
餐厅.prototype.报名 = function() {
  console.log(`欢迎来到${this.名字}，位于${this.城市}`);
};

const 店 = myNew(餐厅, "老王饭馆", "北京");
店.报名();                        // 欢迎来到老王饭馆，位于北京
console.log(店 instanceof 餐厅);   // true
console.log(店.名字);             // 老王饭馆
~~~

---

## 3. 手写 instanceof

### 原理说明

`instanceof` 不看对象的内容，而是**沿着原型链往上爬**，看 `构造函数.prototype` 是否在这条链上。

~~~
instanceof 的判断逻辑：

  对象.__proto__ === 构造函数.prototype  → true
  对象.__proto__.__proto__ === 构造函数.prototype  → true
  对象.__proto__.__proto__.__proto__ === ...  → 一直查
  查到 null 还没找到 → false

  原型链：
  小王.__proto__ → 学徒.prototype
                   学徒.prototype.__proto__ → 厨师.prototype  ← 找到了！
                   厨师.prototype.__proto__ → Object.prototype
                   Object.prototype.__proto__ → null（终点）
~~~

### 代码实现

~~~javascript
function myInstanceof(对象, 构造函数) {
  // 基本类型直接返回 false
  if (对象 === null || (typeof 对象 !== "object" && typeof 对象 !== "function")) {
    return false;
  }

  let 原型 = Object.getPrototypeOf(对象);

  while (原型 !== null) {
    if (原型 === 构造函数.prototype) return true;
    原型 = Object.getPrototypeOf(原型);
  }

  return false;
}

// ========== 测试 ==========
class 厨师 {}
class 学徒 extends 厨师 {}
const 小王 = new 学徒();

console.log(myInstanceof(小王, 学徒));     // true
console.log(myInstanceof(小王, 厨师));     // true
console.log(myInstanceof(小王, Object));   // true
console.log(myInstanceof(42, Number));     // false
~~~

---

## 4. 手写 call / apply

### 原理说明

`call` 的核心是**临时把函数变成目标对象的方法来执行**：

~~~
fn.call(obj, a, b) 的原理：

1. 把 fn 赋值为 obj 的一个临时方法：obj._temp = fn
2. 执行 obj._temp(a, b) → 此时 this 自然指向 obj
3. 删除临时方法：delete obj._temp
4. 返回执行结果

apply 和 call 的唯一区别：参数是数组 vs 逐个传
~~~

**餐厅比喻：**
call/apply 就像**临时借调厨师**——把别的餐厅的厨师叫到你这里来，用你的厨房（this）和食材（参数）做菜。区别是 `call` 是一个一个递食材，`apply` 是用一个托盘一次递完。

### 为什么需要 call/apply？

**核心问题：函数不认主人**

~~~javascript
const 老王饭馆 = {
  店名: "老王饭馆",
  做菜() {
    console.log(`${this.店名}在做菜`);
  }
};

老王饭馆.做菜();  // 老王饭馆在做菜  ← this 指向老王饭馆，没问题

const 做菜 = 老王饭馆.做菜;  // 把方法取出来，赋值给一个变量
做菜();  // undefined在做菜  ← this 丢了！不知道是谁在做菜
~~~

~~~
老王饭馆.做菜()    →  this = 老王饭馆  ✅  （通过对象调用，this 指向对象）
做菜()              →  this = undefined  ❌  （独立调用，this 丢失）
~~~

你手里有一个函数 `做菜`，你想**指定 this 让它执行**——这就是 call/apply 存在的原因。

### call 到底做了什么？（逐步拆解）

~~~javascript
// 语法：函数.call(this指向, 参数1, 参数2, 参数3)

老王饭馆.做菜.call(老张面馆, "红烧肉", "麻婆豆腐");
//       │          │        │         │
//       │          │        │         └── 第二个参数：菜2
//       │          │        └── 第一个参数：菜1
//       │          └── this 指向谁
//       └── 借用哪个函数
~~~

~~~
call 的执行过程（拆解）：

老王饭馆.做菜.call(老张面馆, "红烧肉", "麻婆豆腐")

实际上等于做了这几步：

第1步：把函数临时放到老张面馆身上
  老张面馆._临时函数 = 老王饭馆.做菜;

第2步：用老张面馆的身份执行（this 自然指向老张面馆）
  老张面馆._临时函数("红烧肉", "麻婆豆腐");

第3步：删掉临时函数（用完就扔）
  delete 老张面馆._临时函数;

本质：把函数挂到目标对象上，执行，再删掉
~~~

### call 和 apply 的唯一区别

~~~javascript
// call：参数逐个传
老王饭馆.做菜.call(老张面馆, "红烧肉", "麻婆豆腐");

// apply：参数用数组传
老王饭馆.做菜.apply(老张面馆, ["红烧肉", "麻婆豆腐"]);
//                                      ↑
//                                  数组包起来

// 输出完全一样：老张面馆做了红烧肉和麻婆豆腐
~~~

~~~
call 和 apply 的对比：

call(this指向, 参数1, 参数2, 参数3 )    ← 逐个传
apply(this指向, [参数1, 参数2, 参数3])    ← 数组传

为什么要有两个？因为有些场景用数组更方便
~~~

### apply 的经典用法

~~~javascript
// ========== 场景：参数已经是数组了 ==========

const 分数们 = [85, 92, 78, 96, 88];

// Math.max 不能直接接收数组
Math.max(85, 92, 78, 96, 88);   // 96 ✅
Math.max(分数们);                // NaN ❌

// 用 apply：把数组"展开"传给 Math.max
Math.max.apply(null, 分数们);    // 96 ✅
//              ↑ this指向无所谓，Math.max 不用 this

// 现代写法：展开运算符（更常用）
Math.max(...分数们);             // 96 ✅
~~~

### 真实使用场景

~~~javascript
// ========== 场景1：借用数组的方法操作类数组对象 ==========

function 做菜记录() {
  console.log(arguments);        // Arguments(3) ["红烧肉", "麻婆豆腐", "糖醋里脊"]
  console.log(Array.isArray(arguments));  // false，不是数组！

  // arguments 是类数组对象，有 length 但没有数组方法
  // 想用数组的 slice 方法？借用！

  const 菜单 = Array.prototype.slice.call(arguments);
  //                            │            │
  //                            │            └── this 指向 arguments
  //                            └── 借用数组的 slice 方法

  console.log(Array.isArray(菜单));  // true，变成真数组了！
}

做菜记录("红烧肉", "麻婆豆腐", "糖醋里脊");

// ========== 场景2：借用 toString 判断类型 ==========
const 类型 = Object.prototype.toString.call([]);  // "[object Array]"
// Object.prototype.toString 是最精确的类型判断方法
// 但需要通过 .call 让它以目标值作为 this 来执行
~~~

### 代码实现

~~~javascript
// ========== 手写 call ==========

Function.prototype.myCall = function(this指向, ...参数们) {
  // ① 处理 this 指向为 null/undefined 的情况（指向全局）
  this指向 = this指向 == null ? globalThis : Object(this指向);

  // ② 给目标对象添加一个临时方法（值为当前函数）
  const 唯一键 = Symbol();           // 用 Symbol 防止覆盖原有属性
  this指向[唯一键] = this;           // this 就是当前函数（谁调用 myCall，this 就是谁）

  // ③ 执行临时方法（此时 this 自然指向目标对象）
  const 结果 = this指向[唯一键](...参数们);

  // ④ 删除临时方法（用完就扔）
  delete this指向[唯一键];

  // ⑤ 返回结果
  return 结果;
};

// ========== 手写 apply ==========

// 和 call 的唯一区别：参数是数组

Function.prototype.myApply = function(this指向, 参数数组) {
  this指向 = this指向 == null ? globalThis : Object(this指向);

  const 唯一键 = Symbol();
  this指向[唯一键] = this;

  // 唯一区别：判断有没有参数数组
  let 结果;
  if (参数数组) {
    结果 = this指向[唯一键](...参数数组);  // 展开数组
  } else {
    结果 = this指向[唯一键]();           // 没传参数就直接执行
  }

  delete this指向[唯一键];
  return 结果;
};

// ========== 测试 ==========
function 点菜(菜1, 菜2) {
  return `${this.店名}做了${菜1}和${菜2}`;
}

const 老王饭馆 = { 店名: "老王饭馆" };

console.log(点菜.myCall(老王饭馆, "红烧肉", "麻婆豆腐"));
// 老王饭馆做了红烧肉和麻婆豆腐

console.log(点菜.myApply(老王饭馆, ["红烧肉", "麻婆豆腐"]));
// 老王饭馆做了红烧肉和麻婆豆腐
~~~

**每一步的餐厅比喻：**

~~~
myCall 执行过程：

1. this指向 = { 店名: "老王饭馆" }    → 目标餐厅
2. this指向[唯一键] = 做菜函数          → 把菜谱贴到目标餐厅墙上
3. this指向[唯一键]("红烧肉", "麻婆豆腐")  → 目标餐厅按菜谱做菜
4. delete this指向[唯一键]              → 把菜谱撕下来还回去
5. return 结果                          → 把做好的菜给你
~~~

---

## 5. 手写 bind

### 原理说明

`bind` 和 `call`/`apply` 的核心区别：**不立即执行，而是返回一个新函数**。

~~~
bind 的原理：

fn.bind(obj, a) 返回一个新函数：
  1. 用闭包记住 this 指向和预设参数
  2. 执行时合并预设参数和新参数
  3. 特殊情况：如果返回的新函数被 new 调用，this 应该是新创建的对象，不是 obj

闭包的作用：预设参数 和 this指向 被"保存"在返回的函数的闭包环境中
~~~

**餐厅比喻：**
`bind` 就像**签长期借调合同**——不是马上让厨师干活，而是先签好合同（绑定 this 和部分参数），等需要的时候再调他来（返回新函数）。

### 为什么需要 bind？（call/apply 的问题）

~~~javascript
// call/apply 是"用一次"
老王饭馆.做菜.call(老张面馆, "红烧肉", "麻婆豆腐");

// 如果老张面馆以后经常要做菜，每次都写 .call 太麻烦了
老王饭馆.做菜.call(老张面馆, "红烧肉", "麻婆豆腐");  // 第1次
老王饭馆.做菜.call(老张面馆, "糖醋里脊", "宫保鸡丁"); // 第2次
老王饭馆.做菜.call(老张面馆, "回锅肉", "水煮鱼");     // 第3次
// 每次都要写 .call，很烦
~~~

### bind 解决这个问题

~~~javascript
// bind 不是立即执行，而是返回一个新函数
// 新函数的 this 已经被"绑死"了

const 老张做菜 = 老王饭馆.做菜.bind(老张面馆, "红烧肉");
//                  │                │
//                  │                └── this 绑定到老张面馆
//                  └── 借用老王的做菜函数
//
// bind 返回一个新函数（不立即执行！）
// 这个新函数的 this 永远是老张面馆

// 以后直接调用这个新函数就行了
老张做菜("麻婆豆腐");     // 老张面馆做了红烧肉和麻婆豆腐
老张做菜("糖醋里脊");     // 老张面馆做了红烧肉和糖醋里脊
~~~

### bind 也可以预设参数

~~~javascript
// bind(第一个参数是this, 后面的参数会"预设"到函数里)

const 老张做红烧肉 = 老王饭馆.做菜.bind(老张面馆, "红烧肉");
//                                              ↑ 预设了第一个参数

// 调用时只需要传剩余参数
老张做红烧肉("麻婆豆腐");
// 等价于：老王饭馆.做菜.call(老张面馆, "红烧肉", "麻婆豆腐")
// 输出：老张面馆做了红烧肉和麻婆豆腐

// 预设更多参数
const 老张做红烧肉和麻婆豆腐 = 老王饭馆.做菜.bind(老张面馆, "红烧肉", "麻婆豆腐");
老张做红烧肉和麻婆豆腐();
// 输出：老张面馆做了红烧肉和麻婆豆腐
// 不需要传任何参数了
~~~

### 三者对比：一张图看懂

~~~
call：   借来用一次，参数逐个传
apply：  借来用一次，参数用数组传
bind：   不用，签长期合同，返回一个绑好 this 的新函数

时间线：

      调用 call/apply                调用 bind
           ↓                              ↓
      立即执行函数                   不执行，返回新函数
      输出结果                        ↓
                                   之后随时调用新函数
                                   this 已经绑死了
~~~

~~~javascript
const 老王饭馆 = { 店名: "老王饭馆" };

function 做菜(菜1, 菜2) {
  console.log(`${this.店名}做了${菜1}和${菜2}`);
}

// call：立即执行，参数逐个传
做菜.call(老王饭馆, "红烧肉", "麻婆豆腐");
// → 老王饭馆做了红烧肉和麻婆豆腐

// apply：立即执行，参数用数组传
做菜.apply(老王饭馆, ["红烧肉", "麻婆豆腐"]);
// → 老王饭馆做了红烧肉和麻婆豆腐

// bind：不执行，返回新函数
const 老王做菜 = 做菜.bind(老王饭馆);
老王做菜("红烧肉", "麻婆豆腐");
// → 老王饭馆做了红烧肉和麻婆豆腐

// bind 预设参数
const 老王做红烧肉 = 做菜.bind(老王饭馆, "红烧肉");
老王做红烧肉("麻婆豆腐");
// → 老王饭馆做了红烧肉和麻婆豆腐
~~~

### bind 的执行过程图解

~~~
bind 做了什么：

  做菜函数.bind(老王饭馆, "红烧肉")
      │           │        │
      │           │        └── 预设的参数（保存在闭包里）
      │           └── 绑定的 this（保存在闭包里）
      └── 原函数（保存在闭包里）

  返回 → 一个新函数 老王做红烧肉

  老王做红烧肉("麻婆豆腐")
      │
      └── 等价于：做菜.call(老王饭馆, "红烧肉", "麻婆豆腐")
                  │         │           │
                  │         │           └── 预设参数 + 新参数合并
                  │         └── 闭包保存的 this
                  └── 闭包保存的原函数

闭包里保存了三样东西：
  1. 原函数（this，也就是调用 bind 的那个函数）
  2. this指向（第一个参数）
  3. 预设参数（第一个参数之后的所有参数）
~~~

### 真实使用场景

~~~javascript
// ========== 场景1：回调函数中 this 丢失 ==========

const 老王饭馆 = {
  店名: "老王饭馆",
  开业() {
    console.log(`${this.店名}开业了`);
  }
};

// setTimeout 的回调中 this 丢失
setTimeout(老王饭馆.开业, 1000);
// 1秒后输出：undefined开业了  ← this 不是老王饭馆了！

// 为什么？因为 setTimeout 只是拿到了"开业"这个函数
// 调用时 this 已经和老王饭馆断开联系了

// ========== 用 bind 解决 ==========
setTimeout(老王饭馆.开业.bind(老王饭馆), 1000);
// 1秒后输出：老王饭馆开业了  ✅

// bind 返回一个新函数，this 已经绑死为老王饭馆
// setTimeout 调用这个新函数时，this 就是老王饭馆

// ========== 场景2：创建偏函数 ==========

function 点菜(餐厅, 菜名, 份数) {
  console.log(`${餐厅}做${菜名}${份数}份`);
}

// 预设餐厅为"老王饭馆"
const 老王点菜 = 点菜.bind(null, "老王饭馆");
//                                ↑ 预设第一个参数
//                        ↑ this不重要

老王点菜("红烧肉", 2);    // 老王饭馆做红烧肉2份
老王点菜("麻婆豆腐", 3);  // 老王饭馆做麻婆豆腐3份
~~~

### 代码实现（基础版）

~~~javascript
// ========== 基础版（不支持 new） ==========

Function.prototype.myBind = function(this指向, ...预设参数) {
  const 原函数 = this;  // 保存原函数（谁调用 myBind，this 就是谁）

  // 返回一个新函数
  return function(...新参数) {
    // 合并预设参数和新参数
    return 原函数.call(this指向, ...预设参数, ...新参数);
  };
};

// ========== 测试 ==========
function 做菜(菜1, 菜2, 菜3) {
  console.log(`${this.店名}做了${菜1}、${菜2}、${菜3}`);
}

const 老王饭馆 = { 店名: "老王饭馆" };

// 基本绑定 this
const 老王做菜 = 做菜.myBind(老王饭馆);
老王做菜("红烧肉", "麻婆豆腐", "糖醋里脊");
// 老王饭馆做了红烧肉、麻婆豆腐、糖醋里脊

// 预设部分参数
const 老王做红烧肉 = 做菜.myBind(老王饭馆, "红烧肉");
老王做红烧肉("麻婆豆腐", "糖醋里脊");
// 老王饭馆做了红烧肉、麻婆豆腐、糖醋里脊
~~~

### 代码实现（完整版，支持 new）

~~~javascript
// ========== 完整版（支持 new 调用） ==========

Function.prototype.myBind = function(this指向, ...预设参数) {
  const 原函数 = this;

  function 绑定函数(...后续参数) {
    // 关键：如果被 new 调用，this 是绑定函数的实例，不是 this指向
    const 实际this = this instanceof 绑定函数 ? this : this指向;
    return 原函数.apply(实际this, [...预设参数, ...后续参数]);
  }

  // 继承原函数的 prototype（让 new 能正确工作）
  if (原函数.prototype) {
    绑定函数.prototype = Object.create(原函数.prototype);
  }

  return 绑定函数;
};

// ========== 测试 ==========
function 餐厅(名字, 城市) {
  this.名字 = 名字;
  this.城市 = 城市;
}
餐厅.prototype.报名 = function() {
  console.log(`${this.名字}位于${this.城市}`);
};

// 基本绑定
const 老王点菜 = 餐厅.myBind(null, "老王饭馆");
const 店 = new 老王点菜("北京");
店.报名();  // 老王饭馆位于北京

// 支持 new
console.log(店 instanceof 餐厅);  // true
~~~

### this 在 bind 内部的追踪

~~~
做菜.myBind(老王饭馆, "红烧肉", "麻婆豆腐")
│    │      │          │
│    │      │          └── 预设参数 = ["红烧肉", "麻婆豆腐"]
│    │      └── this指向 = 老王饭馆
│    └── myBind 内部：this = 做菜函数（谁调用 myBind，this 就是谁）
└── 调用者

在 myBind 函数体内：
  this      = 做菜函数        ← 谁调用了 myBind（通过 做菜.xxx 的形式调用）
  this指向   = 老王饭馆        ← 第一个参数（不是 this！是闭包中保存的变量）
  预设参数   = ["红烧肉", "麻婆豆腐"]  ← 剩余参数

在返回的新函数体内：
  原函数.call(this指向, ...预设参数, ...新参数)
  ↓
  做菜.call(老王饭馆, "红烧肉", "麻婆豆腐", "糖醋里脊")
~~~

## 6. 手写深拷贝

### 原理说明

~~~
深拷贝需要解决的核心问题：

1. 递归复制：对象可能嵌套任意层，需要递归处理
2. 循环引用：对象可能引用自己（obj.self = obj），需要记录已复制的对象
3. 特殊类型：Date、RegExp、Map、Set 等不能用普通方式复制
4. 基本类型：直接返回值

算法：
  用一个 Map 记录「原始对象 → 拷贝对象」的映射
  递归时先检查 Map 里有没有 → 有就直接返回拷贝对象（解决循环引用）
  没有就创建新对象，存入 Map，再递归复制每个属性
~~~

### 代码实现

~~~javascript
function deepClone(对象, 引用映射 = new WeakMap()) {
  // 基本类型直接返回
  if (对象 === null || typeof 对象 !== "object") return 对象;

  // 循环引用：已经复制过了，直接返回
  if (引用映射.has(对象)) return 引用映射.get(对象);

  // 特殊类型
  if (对象 instanceof Date)   return new Date(对象);
  if (对象 instanceof RegExp) return new RegExp(对象.source, 对象.flags);
  if (对象 instanceof Map) {
    const 拷贝 = new Map();
    引用映射.set(对象, 拷贝);
    对象.forEach((值, 键) => 拷贝.set(deepClone(键, 引用映射), deepClone(值, 引用映射)));
    return 拷贝;
  }
  if (对象 instanceof Set) {
    const 拷贝 = new Set();
    引用映射.set(对象, 拷贝);
    对象.forEach(值 => 拷贝.add(deepClone(值, 引用映射)));
    return 拷贝;
  }

  // 普通对象/数组
  const 拷贝 = Array.isArray(对象) ? [] : {};
  引用映射.set(对象, 拷贝);  // 先存，再递归（防止循环引用）

  for (const 键 of Reflect.ownKeys(对象)) {
    拷贝[键] = deepClone(对象[键], 引用映射);
  }

  return 拷贝;
}

// ========== 测试 ==========
// 测试1：基本对象和循环引用
const 菜品 = {
  名字: "红烧肉",
  配料: ["五花肉", "酱油"],
  厨师: { 名字: "张师傅" },
  时间: new Date(),
};
菜品.自己 = 菜品;  // 循环引用

const 拷贝 = deepClone(菜品);
拷贝.厨师.名字 = "李师傅";
console.log(菜品.厨师.名字);  // 张师傅（不受影响）
console.log(拷贝.自己 === 拷贝);  // true（循环引用正确处理）

// 测试2：数组深拷贝
const 菜单 = [
  { 名字: "红烧肉", 价格: 38 },
  { 名字: "麻婆豆腐", 价格: 22 },
  { 名字: "糖醋里脊", 价格: 45 }
];
菜单.推荐 = 菜单[0];  // 数组中的循环引用

const 菜单拷贝 = deepClone(菜单);
菜单拷贝[0].价格 = 40;
console.log(菜单[0].价格);  // 38（原数组不受影响）
console.log(菜单拷贝[0] === 菜单拷贝.推荐);  // true（数组循环引用正确处理）

// 测试3：特殊类型（Date、RegExp、Map、Set）
const 特殊对象 = {
  日期: new Date("2023-01-01"),
  正则: /abc/gi,
  地图: new Map([["key1", "value1"], ["key2", "value2"]]),
  集合: new Set([1, 2, 3, 4]),
  函数: function() { return "hello"; }
};

const 特殊拷贝 = deepClone(特殊对象);
console.log(特殊拷贝.日期 instanceof Date);  // true
console.log(特殊拷贝.正则.source === "abc");  // true
console.log(特殊拷贝.地图 instanceof Map);  // true
console.log(特殊拷贝.集合 instanceof Set);  // true
console.log(特殊拷贝.函数 === 特殊对象.函数);  // true（函数直接返回原函数）

// 测试4：嵌套对象深拷贝
const 嵌套对象 = {
  一层: {
    二层: {
      三层: {
        值: "深度嵌套"
      }
    }
  },
  数组: [1, [2, [3, [4]]]]
};

const 嵌套拷贝 = deepClone(嵌套对象);
嵌套拷贝.一层.二层.三层.值 = "修改后的值";
嵌套拷贝.数组[1][1][1][0] = 100;

console.log(嵌套对象.一层.二层.三层.值);  // "深度嵌套"（原对象不受影响）
console.log(嵌套对象.数组[1][1][1][0]);  // 4（原数组不受影响）

// 测试5：基本类型和null
const 基本类型 = {
  数字: 123,
  字符串: "hello",
  布尔: true,
  空值: null,
  未定义: undefined,
  符号: Symbol("sym"),
  大整数: 123n
};

const 基本拷贝 = deepClone(基本类型);
console.log(基本拷贝.数字 === 123);  // true
console.log(基本拷贝.字符串 === "hello");  // true
console.log(基本拷贝.布尔 === true);  // true
console.log(基本拷贝.空值 === null);  // true
console.log(基本拷贝.未定义 === undefined);  // true
console.log(基本拷贝.符号 === 基本类型.符号);  // true（Symbol是唯一标识）
console.log(基本拷贝.大整数 === 123n);  // true

// 测试6：复杂循环引用
const 复杂循环 = {
  a: { b: 1 },
  c: [2, 3]
};
复杂循环.a.d = 复杂循环;
复杂循环.c.push(复杂循环.a);

const 复杂拷贝 = deepClone(复杂循环);
console.log(复杂拷贝.a.d === 复杂拷贝);  // true（对象循环引用）
console.log(复杂拷贝.c[2] === 复杂拷贝.a);  // true（数组中的对象引用）
~~~

---

## 7. 手写防抖（debounce）

### 原理说明

~~~
防抖的核心思想：事件触发后等待 N 毫秒，如果这期间又触发了，重新计时。

原理：闭包 + 定时器
  - 闭包保存定时器 ID（timer）
  - 每次触发时：clearTimeout(timer) → 重新 setTimeout
  - 只有最后一次触发后等够 N 毫秒，回调才执行

时间线：
  触发 → clearTimeout → setTimeout(300ms)
  触发 → clearTimeout → setTimeout(300ms)
  触发 → clearTimeout → setTimeout(300ms)
  ────── 300ms 无人触发 ──────
  执行回调 ✅
~~~

### 代码实现

~~~javascript
function debounce(回调, 延迟) {
  let 定时器 = null;

  return function(...参数) {
    clearTimeout(定时器);  // 每次清除上一个定时器

    定时器 = setTimeout(() => {
      回调.apply(this, 参数);  // 用 apply 保持 this（调用 debounce 返回的函数时的 this 上下文传递给回调函数）
    }, 延迟);
  };
}

// ========== 带"立即执行"选项的完整版 ==========
function debounceFull(回调, 延迟, 立即执行 = false) {
  let 定时器 = null;

  return function(...参数) {
    const 需要立即 = 立即执行 && 定时器 === null;

    clearTimeout(定时器);

    定时器 = setTimeout(() => {
      定时器 = null;
      if (!立即执行) 回调.apply(this, 参数);
    }, 延迟);

    if (需要立即) 回调.apply(this, 参数);
  };
}

// ========== 测试 ==========
const 搜索 = debounce((词) => console.log(`搜索：${词}`), 300);
搜索("红"); 搜索("红烧"); 搜索("红烧肉");
// 300ms 后只输出一次：搜索：红烧肉
~~~

---

## 8. 手写节流（throttle）

### 原理说明

~~~
节流的核心思想：不管触发多频繁，每隔 N 毫秒最多执行一次。

原理：闭包 + 时间戳
  - 闭包保存上次执行时间
  - 每次触发时：当前时间 - 上次时间 >= 间隔 → 执行并更新时间
  - 否则不执行

防抖 vs 节流：
  防抖：等你停下来才执行（最后一次触发后等 N ms）
  节流：固定频率执行（每 N ms 最多执行一次）

餐厅比喻：
  防抖 = 顾客疯狂按门铃，等他停了300ms才开门
  节流 = 不管按多快，每300ms最多开一次门
~~~

### 代码实现

~~~javascript
function throttle(回调, 间隔) {
  let 上次时间 = 0;

  return function(...参数) {
    const 现在 = Date.now();

    if (现在 - 上次时间 >= 间隔) {
      上次时间 = 现在;
      回调.apply(this, 参数);
    }
  };
}

// ========== 测试 ==========
let 次数 = 0;
const 节流函数 = throttle(() => {
  次数++;
  console.log(`执行第${次数}次`);
}, 300);

// 快速连续调用
for (let i = 0; i < 5; i++) 节流函数();
// 只输出：执行第1次
~~~

---

## 9. 手写柯里化

### 原理说明

~~~
柯里化的核心思想：把多参数函数变成一系列单参数函数。

原理：闭包 + 递归
  - 闭包收集已传入的参数
  - 每次调用检查参数是否够了（参数数量 >= 原函数的 length）
  - 够了 → 执行原函数
  - 不够 → 返回新函数，继续收集参数

函数.length：函数定义时的形参个数
~~~

### 代码实现

~~~javascript
function curry(原函数) {
  return function curried(...已收参数) {
    if (已收参数.length >= 原函数.length) {
      return 原函数.apply(this, 已收参数);
    }

    return function(...新参数) {
      return curried.apply(this, [...已收参数, ...新参数]);
    };
  };
}

// ========== 测试 ==========
function 做菜(菜名, 份数, 打包) {
  return `${菜名}做${份数}份，${打包 ? "打包" : "堂食"}`;
}

const 柯里化做菜 = curry(做菜);

console.log(柯里化做菜("红烧肉")(2)(true));     // 红烧肉做2份，打包
console.log(柯里化做菜("红烧肉", 2)(true));     // 红烧肉做2份，打包
console.log(柯里化做菜("红烧肉", 2, true));     // 红烧肉做2份，打包

const 做红烧肉 = 柯里化做菜("红烧肉");
console.log(做红烧肉(2, true));                  // 红烧肉做2份，打包
~~~

---

## 10. 手写 compose / pipe

### 原理说明

~~~
compose 和 pipe 的核心：把多个函数串成一条流水线。

compose：从右到左执行（数学中的 f(g(x))）
pipe：从左到右执行（更符合阅读习惯）

原理：
  compose(f, g, h) 返回一个新函数
  新函数执行时：先执行 h，结果传给 g，结果传给 f
  即：f(g(h(值)))

  reduce 的妙用：把函数数组从右到左依次"包"起来

餐厅比喻：
  compose = 厨师说"先切菜，再炒，再装盘"，你传入食材，按反序执行
  pipe = "先切菜，再炒，再装盘"，从左到右依次执行
~~~

### 代码实现

~~~javascript
// ========== compose（从右到左） ==========
function compose(...函数们) {
  return function(初始值) {
    return 函数们.reduceRight((累加, 当前函数) => {
      return 当前函数(累加);
    }, 初始值);
  };
}

// ========== pipe（从左到右） ==========
function pipe(...函数们) {
  return function(初始值) {
    return 函数们.reduce((累加, 当前函数) => {
      return 当前函数(累加);
    }, 初始值);
  };
}

// ========== 测试 ==========
const 加盐 = (菜) => `${菜}+盐`;
const 加糖 = (菜) => `${菜}+糖`;
const 加醋 = (菜) => `${菜}+醋`;

const 调味compose = compose(加盐, 加糖, 加醋);
console.log(调味compose("红烧肉"));
// 红烧肉+醋+糖+盐（从右到左：先加醋，再加糖，最后加盐）

const 调味pipe = pipe(加盐, 加糖, 加醋);
console.log(调味pipe("红烧肉"));
// 红烧肉+盐+糖+醋（从左到右：先加盐，再加糖，最后加醋）

// ========== 实际用途：数据处理流水线 ==========
const 去空格 = (s) => s.trim();
const 转小写 = (s) => s.toLowerCase();
const 加前缀 = (s) => `搜索：${s}`;

const 处理搜索词 = pipe(去空格, 转小写, 加前缀);
console.log(处理搜索词("  红烧肉  "));  // 搜索：红烧肉
~~~

---

## 11. 手写 Promise（A+ 规范简化版）

### 原理说明

~~~
Promise 的核心机制：

1. 状态机：三种状态 pending → fulfilled / rejected，状态只能变一次
2. 回调队列：pending 时把 .then 的回调存起来，状态变化时依次执行
3. 链式调用：.then() 返回一个新的 Promise，实现链式调用
4. 值穿透：.then 里不传回调，结果会传给下一个 .then

关键细节：
  - .then 的回调必须异步执行（微任务）
  - .then 回调的返回值如果是 Promise，需要等待它完成
  - .then 回调的返回值如果不是 Promise，直接 resolve
  - .catch 后继续链式调用时，状态是 fulfilled（不是 rejected）
~~~

### 代码实现

~~~javascript
const PENDING = "pending", FULFILLED = "fulfilled", REJECTED = "rejected";

class myPromise {
  constructor(执行器) {
    this.状态 = PENDING;
    this.值 = undefined;
    this.原因 = undefined;
    this.成功队列 = [];
    this.失败队列 = [];

    const resolve = (值) => {
      if (this.状态 !== PENDING) return;
      if (值 instanceof myPromise) { 值.then(resolve, reject); return; }
      this.状态 = FULFILLED;
      this.值 = 值;
      this.成功队列.forEach(fn => fn(值));
    };

    const reject = (原因) => {
      if (this.状态 !== PENDING) return;
      this.状态 = REJECTED;
      this.原因 = 原因;
      this.失败队列.forEach(fn => fn(原因));
    };

    try { 执行器(resolve, reject); } catch (e) { reject(e); }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : v => v;
    onRejected = typeof onRejected === "function" ? onRejected : e => { throw e; };

    const p2 = new myPromise((resolve, reject) => {
      const 处理 = (回调, 值) => {
        queueMicrotask(() => {
          try {
            const r = 回调(值);
            if (r === p2) throw new TypeError("循环引用");
            r instanceof myPromise ? r.then(resolve, reject) : resolve(r);
          } catch (e) { reject(e); }
        });
      };

      if (this.状态 === FULFILLED)  处理(onFulfilled, this.值);
      else if (this.状态 === REJECTED) 处理(onRejected, this.原因);
      else {
        this.成功队列.push(v => 处理(onFulfilled, v));
        this.失败队列.push(e => 处理(onRejected, e));
      }
    });

    return p2;
  }

  catch(fn) { return this.then(null, fn); }

  finally(fn) {
    return this.then(
      v => myPromise.resolve(fn()).then(() => v),
      e => myPromise.resolve(fn()).then(() => { throw e; })
    );
  }

  static resolve(v) { return v instanceof myPromise ? v : new myPromise(r => r(v)); }
  static reject(e)  { return new myPromise((_, r) => r(e)); }

  static all(arr) {
    return new myPromise((resolve, reject) => {
      const 结果 = []; let 计数 = 0;
      if (arr.length === 0) return resolve([]);
      arr.forEach((item, i) => {
        myPromise.resolve(item).then(v => {
          结果[i] = v; if (++计数 === arr.length) resolve(结果);
        }, reject);
      });
    });
  }

  static race(arr) {
    return new myPromise((resolve, reject) => {
      arr.forEach(item => myPromise.resolve(item).then(resolve, reject));
    });
  }
}

// ========== 测试 ==========
new myPromise(r => setTimeout(() => r("红烧肉"), 500))
  .then(v => { console.log(v); return "麻婆豆腐"; })
  .then(v => { console.log(v); return new myPromise(r => setTimeout(() => r("糖醋里脊"), 300)); })
  .then(v => console.log(v));
// 500ms后：红烧肉 → 麻婆豆腐 → 300ms后：糖醋里脊
~~~

---

## 12. 手写 Promise.all

### 原理说明

~~~
Promise.all 的核心机制：

1. 接收一个可迭代对象（通常是数组）
2. 创建一个计数器，初始为 0
3. 遍历每个 Promise，成功时把结果存到对应索引位置，计数器 +1
4. 当计数器 === 数组长度 → 全部成功 → resolve(结果数组)
5. 任何一个 reject → 立即 reject

关键：结果按索引存（结果[i] = 值），不是按完成顺序，保证结果顺序和输入一致
~~~

### 代码实现

~~~javascript
function promiseAll(数组) {
  return new Promise((resolve, reject) => {
    const 结果们 = [];
    let 完成数 = 0;
    const 总数 = 数组.length;

    if (总数 === 0) return resolve([]);

    数组.forEach((项, 索引) => {
      Promise.resolve(项).then(
        值 => {
          结果们[索引] = 值;   // 按索引存，保证顺序
          if (++完成数 === 总数) resolve(结果们);
        },
        原因 => reject(原因)
      );
    });
  });
}
~~~

---

## 13. 手写 Promise.race

### 原理说明

~~~
Promise.race 的核心：谁先完成（成功或失败）就用谁的结果。

原理：遍历所有 Promise，每个都注册 .then(resolve, reject)
     第一个完成的会调用 resolve 或 reject，后面的再调也没用（状态已变）
~~~

~~~javascript
function promiseRace(数组) {
  return new Promise((resolve, reject) => {
    数组.forEach(项 => Promise.resolve(项).then(resolve, reject));
  });
}
~~~

---

## 14. 手写 Promise.allSettled

### 原理说明

~~~
Promise.allSettled 的核心：等所有 Promise 都完成（不管成功失败），收集每个的状态。

和 Promise.all 的区别：
  - all：有一个 reject 就立即 reject，不等其他的
  - allSettled：永远不 reject，等全部完成，每个结果带上 status

结果格式：
  成功：{ status: "fulfilled", value: 成功值 }
  失败：{ status: "rejected", reason: 失败原因 }
~~~

~~~javascript
function promiseAllSettled(数组) {
  return new Promise((resolve) => {
    const 结果们 = [];
    let 完成数 = 0;
    const 总数 = 数组.length;

    if (总数 === 0) return resolve([]);

    数组.forEach((项, 索引) => {
      Promise.resolve(项).then(
        值 => {
          结果们[索引] = { status: "fulfilled", value: 值 };
          if (++完成数 === 总数) resolve(结果们);
        },
        原因 => {
          结果们[索引] = { status: "rejected", reason: 原因 };
          if (++完成数 === 总数) resolve(结果们);
        }
      );
    });
  });
}
~~~

---

## 15. 手写 Promise.any

### 原理说明

~~~
Promise.any 的核心：第一个成功的结果就 resolve，全部失败才 reject。

和 Promise.race 的区别：
  - race：谁快用谁（成功或失败都算）
  - any：谁成功用谁（忽略失败，只看成功）

全部失败时，reject 一个 AggregateError，包含所有错误原因
~~~

~~~javascript
function promiseAny(数组) {
  return new Promise((resolve, reject) => {
    const 错误们 = [];
    let 失败数 = 0;
    const 总数 = 数组.length;

    if (总数 === 0) return reject(new AggregateError([], "All promises were rejected"));

    数组.forEach((项, 索引) => {
      Promise.resolve(项).then(
        值 => resolve(值),    // 有一个成功就立即 resolve
        原因 => {
          错误们[索引] = 原因;
          if (++失败数 === 总数) {
            reject(new AggregateError(错误们, "All promises were rejected"));
          }
        }
      );
    });
  });
}
~~~

---

## 16. 手写发布订阅模式（EventEmitter）

### 原理说明

~~~
发布订阅的核心：事件名 → 回调数组的映射。

原理：
  - on(事件名, 回调)：把回调 push 到对应事件名的数组里
  - emit(事件名, ...参数)：找到这个事件名的回调数组，依次执行
  - off(事件名, 回调)：从数组中 filter 掉这个回调
  - once(事件名, 回调)：包装一层，执行一次后自动 off

发布订阅 vs 观察者模式：
  发布订阅：有一个"调度中心"（EventEmitter），发布者和订阅者不直接通信
  观察者：观察者直接注册到目标对象上，目标直接通知观察者
~~~

### 代码实现

~~~javascript
class EventEmitter {
  constructor() {
    this.事件映射 = {};
  }

  on(事件名, 回调) {
    (this.事件映射[事件名] ||= []).push(回调);
    return this;
  }

  off(事件名, 回调) {
    if (!this.事件映射[事件名]) return this;
    this.事件映射[事件名] = this.事件映射[事件名].filter(cb => cb !== 回调);
    return this;
  }

  once(事件名, 回调) {
    const 包装 = (...args) => { 回调(...args); this.off(事件名, 包装); };
    return this.on(事件名, 包装);
  }

  emit(事件名, ...参数) {
    if (!this.事件映射[事件名]) return false;
    this.事件映射[事件名].forEach(cb => cb(...参数));
    return true;
  }
}

// ========== 测试 ==========
const 广播 = new EventEmitter();
广播.on("菜做好了", (菜名) => console.log(`上菜：${菜名}`));
广播.once("打烊", () => console.log("打烊了"));
广播.emit("菜做好了", "红烧肉");   // 上菜：红烧肉
广播.emit("菜做好了", "麻婆豆腐"); // 上菜：麻婆豆腐
广播.emit("打烊");                 // 打烊了
广播.emit("打烊");                 // （没反应，once 已取消）
~~~

---

## 17. 手写 Object.create

### 原理说明

~~~
Object.create(proto) 的原理：
  创建一个新对象，新对象的 __proto__ 指向 proto

实现方式：
  创建一个空构造函数
  把它的 prototype 设为传入的 proto
  用 new 创建实例 → 实例.__proto__ 自然指向 proto
~~~

~~~javascript
function objectCreate(原型对象, 属性描述符们) {
  function F() {}
  F.prototype = 原型对象;
  const 新对象 = new F();
  if (属性描述符们) Object.defineProperties(新对象, 属性描述符们);
  return 新对象;
}

// ========== 测试 ==========
const 菜谱 = { 做菜() { console.log(`做${this.名字}`); } };
const 红烧肉 = objectCreate(菜谱, {
  名字: { value: "红烧肉", writable: true, enumerable: true, configurable: true }
});
红烧肉.做菜();  // 做红烧肉
console.log(Object.getPrototypeOf(红烧肉) === 菜谱);  // true
~~~

---

## 18. 手写 Array.prototype.map

### 原理说明

~~~
map 的核心：遍历数组，对每个元素调用回调，返回新数组。

原理：
  创建一个和原数组等长的新数组
  遍历原数组，对每个元素执行 回调(元素, 索引, 原数组)
  把回调的返回值存到新数组对应位置
  返回新数组（不修改原数组）
~~~

~~~javascript
Array.prototype.myMap = function(回调, thisArg) {
  const 结果 = [];

  for (let i = 0; i < this.length; i++) {
    // 只处理存在的索引（跳过稀疏数组的空位）
    if (i in this) {
      结果[i] = 回调.call(thisArg, this[i], i, this);
    }
  }

  return 结果;
};

// ========== 测试 ==========
const 菜单 = ["红烧肉", "麻婆豆腐", "糖醋里脊"];
const 带价格 = 菜单.myMap((菜名, i) => `${i + 1}. ${菜名}`);
console.log(带价格);  // ["1. 红烧肉", "2. 麻婆豆腐", "3. 糖醋里脊"]
~~~

---

## 19. 手写 Array.prototype.filter

### 原理说明

~~~
filter 的核心：遍历数组，回调返回 true 的元素放进新数组。

原理：
  创建空数组
  遍历原数组，执行 回调(元素, 索引, 原数组)
  返回 truthy → push 到新数组
  返回 falsy → 跳过
~~~

~~~javascript
Array.prototype.myFilter = function(回调, thisArg) {
  const 结果 = [];

  for (let i = 0; i < this.length; i++) {
    if (i in this && 回调.call(thisArg, this[i], i, this)) {
      结果.push(this[i]);
    }
  }

  return 结果;
};

// ========== 测试 ==========
const 菜品们 = [
  { 名字: "红烧肉", 价格: 38 },
  { 名字: "麻婆豆腐", 价格: 22 },
  { 名字: "糖醋里脊", 价格: 45 },
];
const 贵菜 = 菜品们.myFilter(菜 => 菜.价格 > 30);
console.log(贵菜);  // [{红烧肉}, {糖醋里脊}]
~~~

---

## 20. 手写 Array.prototype.reduce

### 原理说明

~~~
reduce 的核心：从左到右遍历数组，用一个"累加器"把数组"浓缩"成一个值。

原理：
  累加器 = 初始值（如果有的话）或数组第一个元素
  遍历数组（如果没传初始值就从第1个开始，传了从第0个开始）
  每次：累加器 = 回调(累加器, 当前元素, 当前索引, 原数组)
  最后返回累加器
~~~

~~~javascript
Array.prototype.myReduce = function(回调, 初始值) {
  let 累加器;
  let 起始索引;

  if (初始值 !== undefined) {
    累加器 = 初始值;
    起始索引 = 0;
  } else {
    // 没传初始值，用第一个元素（数组为空会报错）
    if (this.length === 0) throw new TypeError("Reduce of empty array with no initial value");
    累加器 = this[0];
    起始索引 = 1;
  }

  for (let i = 起始索引; i < this.length; i++) {
    if (i in this) {
      累加器 = 回调(累加器, this[i], i, this);
    }
  }

  return 累加器;
};

// ========== 测试 ==========
const 价格们 = [38, 22, 45];
const 总价 = 价格们.myReduce((总和, 价格) => 总和 + 价格, 0);
console.log(总价);  // 105

// 用 reduce 实现分组
const 菜品们 = [
  { 名字: "红烧肉", 类型: "热菜" },
  { 名字: "拍黄瓜", 类型: "凉菜" },
  { 名字: "麻婆豆腐", 类型: "热菜" },
];
const 分组 = 菜品们.myReduce((结果, 菜) => {
  (结果[菜.类型] ||= []).push(菜);
  return 结果;
}, {});
console.log(分组);  // { 热菜: [{红烧肉}, {麻婆豆腐}], 凉菜: [{拍黄瓜}] }
~~~

---

## 21-28 题：（Array.flat / 数组去重 / 类型判断 / 寄生组合继承 / async-await / LRU / 并发控制器 / 大数相加）

这 8 道题的**原理说明 + 代码实现**见下：

---

## 21. 手写 Array.flat

### 原理说明

~~~
flat 的核心：递归展开嵌套数组。

原理：
  遍历数组的每个元素
  如果元素是数组且深度 > 0 → 递归展开（深度 - 1）
  如果元素不是数组 → 直接放进结果

栈迭代法（不用递归）：
  把数组压入栈，从后往前取
  取到数组 → 展开后压回栈
  取到值 → 放进结果
~~~

~~~javascript
// 递归版
function flat(数组, 深度 = 1) {
  return 数组.reduce((结果, 项) => {
    return 结果.concat(Array.isArray(项) && 深度 > 0 ? flat(项, 深度 - 1) : 项);
  }, []);
}

// 栈迭代版
function flatStack(数组) {
  const 栈 = [...数组], 结果 = [];
  while (栈.length) {
    const 项 = 栈.pop();
    Array.isArray(项) ? 栈.push(...项) : 结果.unshift(项);
  }
  return 结果;
}

console.log(flat([1, [2, [3, [4]]]], Infinity));  // [1, 2, 3, 4]
~~~

---

## 22. 手写数组去重

### 原理说明

~~~
三种思路：
  1. Set：利用 Set 自动去重的特性（最简洁）
  2. filter + indexOf：保留"第一次出现"的元素
  3. Map：处理对象引用去重的场景
~~~

~~~javascript
// 方法1：Set
const unique1 = arr => [...new Set(arr)];

// 方法2：filter + indexOf
const unique2 = arr => arr.filter((v, i) => arr.indexOf(v) === i);

// 方法3：Map（能区分对象）
function unique3(arr) {
  const map = new Map();
  return arr.filter(v => {
    const key = typeof v + JSON.stringify(v);
    if (map.has(key)) return false;
    map.set(key, true);
    return true;
  });
}

console.log(unique1([1, 2, 2, 3, 3]));  // [1, 2, 3]
~~~

---

## 23. 手写类型判断函数

### 原理说明

~~~
精确类型判断的原理：

typeof 的问题：null 返回 "object"，数组/Date/RegExp 都返回 "object"
instanceof 的问题：不能判断基本类型，跨窗口失效

最佳方案：Object.prototype.toString.call(值)
  返回 "[object 类型名]" 格式的字符串
  slice(8, -1) 提取类型名

为什么 Object.prototype.toString 能精确判断？
  因为每个内置对象都重写了 toStringTag（Symbol.toStringTag）
  Object.prototype.toString 会读取这个标签
~~~

~~~javascript
function typeOf(值) {
  if (值 === null) return "null";
  if (Array.isArray(值)) return "array";
  const t = typeof 值;
  if (t !== "object" && t !== "function") return t;
  return Object.prototype.toString.call(值).slice(8, -1).toLowerCase();
}

console.log(typeOf(null));        // "null"
console.log(typeOf([]));          // "array"
console.log(typeOf(new Date()));  // "date"
console.log(typeOf(new Map()));   // "map"
console.log(typeOf(/abc/));       // "regexp"
~~~

---

## 24. 手写寄生组合式继承

### 原理说明

~~~
为什么需要寄生组合式继承？

组合继承的缺点：父类构造函数被调用了两次（new 一次 + call 一次）
寄生组合继承：只调用一次父类构造函数

原理：
  子类.prototype = Object.create(父类.prototype)
  这样做的好处：
  1. 子类原型指向父类原型的副本（不影响父类原型）
  2. 不调用父类构造函数（不创建多余实例属性）
  3. 原型链正确：子类实例 instanceof 父类 === true
  4. 修复 constructor 指向
~~~

~~~javascript
function 寄生组合继承(子类, 父类) {
  子类.prototype = Object.create(父类.prototype);
  子类.prototype.constructor = 子类;
}

// ========== 测试 ==========
function 父餐厅(名字) { this.名字 = 名字; }
父餐厅.prototype.报名 = function() { console.log(this.名字); };

function 子餐厅(名字, 特色) {
  父餐厅.call(this, 名字);  // 只在这里调一次
  this.特色 = 特色;
}

寄生组合继承(子餐厅, 父餐厅);

const 店 = new 子餐厅("老王饭馆", "红烧肉");
店.报名();                         // 老王饭馆
console.log(店 instanceof 子餐厅);  // true
console.log(店 instanceof 父餐厅);  // true
console.log(店.constructor === 子餐厅); // true
~~~

---

## 25. 手写 async/await

### 原理说明

~~~
async/await 的本质是 Generator + 自动执行器的语法糖。

Generator 的工作方式：
  function* 生成器函数遇到 yield 就暂停
  调用 .next() 恢复执行，可以把值传回去
  yield 后面跟一个 Promise

自动执行器的工作方式：
  1. 调用生成器得到迭代器
  2. 调用 .next() 拿到第一个 yield 的值（是一个 Promise）
  3. 等这个 Promise 完成
  4. 把结果通过 .next(结果) 传回生成器
  5. 继续下一步，直到 done === true
~~~

~~~javascript
function 自动执行器(生成器函数) {
  return new Promise((resolve, reject) => {
    const 迭代器 = 生成器函数();

    function 下一步(上次值) {
      const { value, done } = 迭代器.next(上次值);
      if (done) return resolve(value);

      Promise.resolve(value).then(
        值 => 下一步(值),
        错误 => {
          try { 迭代器.throw(错误); }
          catch (e) { reject(e); }
        }
      );
    }

    下一步();
  });
}

// ========== 测试 ==========
function* 做菜流程() {
  const 菜1 = yield new Promise(r => setTimeout(() => r("红烧肉"), 500));
  console.log(菜1);

  const 菜2 = yield new Promise(r => setTimeout(() => r("麻婆豆腐"), 300));
  console.log(菜2);

  return "全部完成";
}

自动执行器(做菜流程).then(console.log);
// 500ms后：红烧肉
// 300ms后：麻婆豆腐
// 全部完成
~~~

---

## 26. 手写 LRU 缓存（最近最少使用）

### 原理说明

~~~
LRU（Least Recently Used）的核心思想：
  缓存满了时，删除"最久没被使用的"那条数据。

实现原理：Map 的插入顺序特性
  Map 的 .get() 和 .set() 会把键移到最新位置
  所以 Map 的"第一个键"就是最久没用的
  缓存满了 → 删除 Map 的第一个键

餐厅比喻：
  菜单板上只能放 5 道菜
  每次有客人点某道菜，就把那道菜移到最前面
  菜单满了要加新菜 → 把排在最后的（最没人点的）删掉
~~~

~~~javascript
class LRUCache {
  constructor(容量) {
    this.容量 = 容量;
    this.缓存 = new Map();
  }

  get(键) {
    if (!this.缓存.has(键)) return -1;

    // 把访问的键移到最新位置
    const 值 = this.缓存.get(键);
    this.缓存.delete(键);
    this.缓存.set(键, 值);
    return 值;
  }

  put(键, 值) {
    if (this.缓存.has(键)) {
      this.缓存.delete(键);  // 先删旧的
    }

    this.缓存.set(键, 值);  // 插到最新位置

    // 超出容量 → 删除最久没用的（Map 的第一个）
    if (this.缓存.size > this.容量) {
      const 最久没用的键 = this.缓存.keys().next().value;
      this.缓存.delete(最久没用的键);
    }
  }
}

// ========== 测试 ==========
const 缓存 = new LRUCache(3);
缓存.put("红烧肉", 38);
缓存.put("麻婆豆腐", 22);
缓存.put("糖醋里脊", 45);
console.log(缓存.get("红烧肉"));  // 38（红烧肉被移到最新）
缓存.put("宫保鸡丁", 35);         // 超出容量，删除最久没用的（麻婆豆腐）
console.log(缓存.get("麻婆豆腐"));  // -1（已被删除）
~~~

---

## 27. 手写并发控制器（限制并发数）

### 原理说明

~~~
并发控制器的核心：同时最多执行 N 个异步任务，有任务完成后再从队列中取下一个。

原理：
  维护一个任务队列和一个"正在执行"的计数器
  每次执行任务时计数器 +1
  任务完成（成功或失败）后计数器 -1，然后尝试执行队列中的下一个
  如果计数器 < 最大并发数 → 立即执行
  如果计数器 >= 最大并发数 → 放入队列等待

餐厅比喻：
  厨房只有 3 个灶台（最大并发数 = 3）
  来了 10 个订单（任务队列）
  前 3 个直接上灶台做
  做完一个，第 4 个上灶台，以此类推
~~~

~~~javascript
class 并发控制器 {
  constructor(最大并发数) {
    this.最大并发数 = 最大并发数;
    this.正在执行数 = 0;
    this.等待队列 = [];
  }

  async 添加任务(异步任务) {
    if (this.正在执行数 >= this.最大并发数) {
      // 灶台满了，排队等
      await new Promise(resolve => this.等待队列.push(resolve));
    }

    this.正在执行数++;
    try {
      return await 异步任务();
    } finally {
      this.正在执行数--;
      // 有空灶台了，让队列中第一个任务开始执行
      if (this.等待队列.length > 0) {
        this.等待队列.shift()();
      }
    }
  }
}

// ========== 测试 ==========
const 控制器 = new 并发控制器(3);  // 最多同时3个

function 做菜(菜名, 耗时) {
  return () => new Promise(resolve => {
    console.log(`开始做${菜名}`);
    setTimeout(() => {
      console.log(`✅ ${菜名}做好了`);
      resolve(菜名);
    }, 耗时);
  });
}

// 同时提交 6 个任务，但最多 3 个并发
const 任务们 = [
  控制器.添加任务(做菜("红烧肉", 1000)),
  控制器.添加任务(做菜("麻婆豆腐", 500)),
  控制器.添加任务(做菜("糖醋里脊", 800)),
  控制器.添加任务(做菜("宫保鸡丁", 600)),
  控制器.添加任务(做菜("回锅肉", 700)),
  控制器.添加任务(做菜("水煮鱼", 900)),
];

Promise.all(任务们).then(结果们 => console.log("全部完成：", 结果们));
// 前3个立即开始
// 麻婆豆腐先完成 → 宫保鸡丁开始
// 糖醋里脊完成 → 回锅肉开始
// 宫保鸡丁完成 → 水煮鱼开始
// ...
~~~

---

## 28. 手写大数相加

### 原理说明

~~~
大数相加的问题：JavaScript 的 Number 精度只有 2^53
超过这个范围的整数相加会丢失精度。

例如：9007199254740992 + 1 === 9007199254740992（精度丢失！）

原理：模拟小学竖式加法
  1. 把两个数转成字符串（字符串没有精度限制）
  2. 从末尾开始逐位相加，记录进位
  3. 倒序拼接结果

  1 2 3
+    9 9
--------
    2 2 2

  从右往左：3+9=12，写2进1；2+9+1=12，写2进1；1+0+1=2
~~~

~~~javascript
function bigAdd(字符串A, 字符串B) {
  let 结果 = "";
  let 进位 = 0;
  let i = 字符串A.length - 1;
  let j = 字符串B.length - 1;

  while (i >= 0 || j >= 0 || 进位) {
    const 数字A = i >= 0 ? parseInt(字符串A[i]) : 0;
    const 数字B = j >= 0 ? parseInt(字符串B[j]) : 0;

    const 和 = 数字A + 数字B + 进位;
    结果 = (和 % 10) + 结果;  // 当前位
    进位 = Math.floor(和 / 10); // 进位

    i--;
    j--;
  }

  return 结果;
}

// ========== 测试 ==========
console.log(bigAdd("9007199254740993", "1"));
// "9007199254740994"（精确！原生加会丢精度）

console.log(bigAdd("999", "1"));       // "1000"
console.log(bigAdd("123456789", "987654321"));  // "1111111110"
~~~

---

## 原理总结

| 题号 | 题目 | 核心原理 | 用了什么 JS 知识 |
|---|---|---|---|
| 1 | typeof | 读底层类型标签 | 数据类型底层 |
| 2 | new | 创建空对象→设原型→执行构造函数→判断返回 | 原型链 + this |
| 3 | instanceof | 沿原型链往上找 prototype | 原型链 |
| 4 | call/apply | 函数挂到目标对象上执行再删除 | this 绑定 |
| 5 | bind | 闭包保存 this + 参数，返回新函数 | 闭包 + this |
| 6 | 深拷贝 | 递归 + WeakMap 记录已复制对象 | 递归 + WeakMap |
| 7 | 防抖 | 闭包保存定时器，每次清除重置 | 闭包 + setTimeout |
| 8 | 节流 | 闭包保存上次时间，间隔够才执行 | 闭包 + Date.now |
| 9 | 柯里化 | 闭包收参数，够了执行不够继续返回函数 | 闭包 + 递归 + length |
| 10 | compose/pipe | reduce/reduceRight 串联函数 | 高阶函数 + reduce |
| 11 | Promise | 状态机 + 回调队列 + 微任务 | 状态机 + 异步 |
| 12 | Promise.all | 计数器 + 按索引存结果 | Promise + 计数 |
| 13 | Promise.race | 每个都 then，第一个完成的生效 | Promise |
| 14 | allSettled | 永不 reject，等全部完成 | Promise |
| 15 | Promise.any | 第一个成功 resolve，全失败 reject | Promise |
| 16 | EventEmitter | 事件名→回调数组映射 | 发布订阅模式 |
| 17 | Object.create | 空构造函数.prototype = 原型 | 原型链 |
| 18 | map | 遍历+回调+存新数组 | 数组遍历 |
| 19 | filter | 遍历+回调返回true就push | 数组遍历 |
| 20 | reduce | 累加器从左到右累积 | 累积计算 |
| 21 | flat | 递归展开子数组 / 栈迭代 | 递归 / 栈 |
| 22 | 去重 | Set / filter+indexOf | Set / 数组 |
| 23 | 类型判断 | Object.prototype.toString.call | toString |
| 24 | 寄生组合继承 | Object.create(父.prototype) | 原型链 + 继承 |
| 25 | async/await | Generator + 自动执行器 | 生成器 + Promise |
| 26 | LRU | Map 插入顺序特性 | Map |
| 27 | 并发控制 | 计数器 + 等待队列 | Promise + 队列 |
| 28 | 大数相加 | 竖式逐位相加 + 进位 | 字符串运算 |
