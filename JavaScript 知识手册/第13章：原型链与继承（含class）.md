# 第13章：原型链与继承（含 class）

## 13.1 构造函数 / new 关键字的 4 步

**一句话解释：**
构造函数就是一个普通的函数，但用 `new` 关键字调用时，它会创建一个新对象并返回。`new` 做了 4 件事：创建空对象 → 绑定 this → 执行函数体 → 返回对象。

**餐厅比喻：**
你拿着一份**餐厅蓝图**（构造函数），说"**开一家新店！**"（`new`），于是：
1. 有人帮你找了一块**空地**（创建空对象）
2. 你站在空地上说"**我是这家店的老板**"（`this` 指向新对象）
3. 你按照蓝图**装修、挂招牌、招人**（执行函数体）
4. **新店开业了**（返回新对象）

~~~javascript
// ========== 普通函数 vs 构造函数 ==========
// 同一个函数，用不用 new 调用，效果完全不同

function 餐厅(名字, 地址) {
  this.名字 = 名字;
  this.地址 = 地址;
  this.报名 = function() {
    console.log(`欢迎来到${this.名字}，地址：${this.地址}`);
  };
}

// 不用 new：普通函数调用，this = window（或 undefined）
// const 结果 = 餐厅("老王饭馆", "北京");
// console.log(结果);  // undefined（没有 return，返回 undefined）

// 用 new：构造函数调用，this = 新对象
const 老王饭馆 = new 餐厅("老王饭馆", "北京朝阳区");
const 老李饭馆 = new 餐厅("老李饭馆", "上海浦东区");

老王饭馆.报名();  // 欢迎来到老王饭馆，地址：北京朝阳区
老李饭馆.报名();  // 欢迎来到老李饭馆，地址：上海浦东区

console.log(老王饭馆.名字);  // 老王饭馆
console.log(老李饭馆.名字);  // 老李饭馆

console.log(老王饭馆 instanceof 餐厅);  // true
~~~

### new 做了哪 4 步？

~~~javascript
// ========== new 的 4 步（伪代码） ==========
function 模拟new(构造函数, ...参数们) {
  // 第1步：创建一个空对象，它的 __proto__ 指向构造函数的 prototype
  const 新对象 = Object.create(构造函数.prototype);

  // 第2步：把 this 指向这个空对象，执行构造函数
  const 结果 = 构造函数.apply(新对象, 参数们);

  // 第3步：如果构造函数返回了一个对象，就用那个对象；否则用新对象
  return (结果 !== null && typeof 结果 === "object") ? 结果 : 新对象;
}

// 用模拟的 new 调用
const 老张饭馆 = 模拟new(餐厅, "老张饭馆", "广州天河区");
老张饭馆.报名();  // 欢迎来到老张饭馆，地址：广州天河区
~~~

### 构造函数的问题

~~~javascript
// ========== 问题：每个实例的方法都是独立的副本 ==========
function 餐厅(名字) {
  this.名字 = 名字;
  this.报名 = function() {  // 每次 new 都会创建一个新的函数
    console.log(this.名字);
  };
}

const 店1 = new 餐厅("老王饭馆");
const 店2 = new 餐厅("老李饭馆");

console.log(店1.报名 === 店2.报名);  // false（两个独立的函数副本！浪费内存）

// 100家店 = 100个一模一样的报名函数，太浪费了
// 解决方案：把方法放到 prototype 上（见下一节）
~~~

---

## 13.2 prototype / \_\_proto\_\_ / constructor

**一句话解释：**
- `prototype`：每个**函数**都有一个 `prototype` 属性，是给实例准备的"公共说明书"
- `__proto__`：每个**对象**都有一个 `__proto__` 隐形连线，指向创建它的构造函数的 `prototype`
- `constructor`：`prototype` 上有一个 `constructor` 属性，指回构造函数本身

**餐厅比喻：**
- `prototype` = 公司总部的**标准操作手册**（所有分店共享）
- `__proto__` = 每家分店前台的**隐形连线**，连着总部手册
- `constructor` = 手册封面写着"**本手册由XX公司出品**"（指回构造函数）

### prototype（公共说明书）

~~~javascript
// ========== 把方法放到 prototype 上 ==========
function 餐厅(名字) {
  this.名字 = 名字;  // 每个实例独有的属性
}

// 所有实例共享的方法，放在 prototype 上
餐厅.prototype.报名 = function() {
  console.log(`欢迎来到${this.名字}`);
};

餐厅.prototype.类型 = "餐饮";  // 所有实例共享的属性

const 店1 = new 餐厅("老王饭馆");
const 店2 = new 餐厅("老李饭馆");

店1.报名();  // 欢迎来到老王饭馆
店2.报名();  // 欢迎来到老李饭馆

console.log(店1.报名 === 店2.报名);  // true（同一个函数！节省内存）
console.log(店1.类型);  // 餐饮
console.log(店2.类型);  // 餐饮
~~~

### \_\_proto\_\_（隐形连线）

~~~javascript
// ========== __proto__ 连接着构造函数的 prototype ==========
function 餐厅(名字) {
  this.名字 = 名字;
}
餐厅.prototype.报名 = function() { console.log(this.名字); };

const 老王饭馆 = new 餐厅("老王饭馆");

// 实例的 __proto__ 指向构造函数的 prototype
console.log(老王饭馆.__proto__ === 餐厅.prototype);  // true

// 调用方法时的查找过程：
老王饭馆.报名();
// 1. JS 引擎先在 老王饭馆 自身找 → 没有
// 2. 顺着 __proto__ 去 餐厅.prototype 上找 → 找到了！执行
~~~

### constructor（指回构造函数）

~~~javascript
// ========== prototype 上的 constructor 指回构造函数 ==========
console.log(餐厅.prototype.constructor === 餐厅);  // true

// 实例也能通过这个关系找到构造函数
console.log(老王饭馆.__proto__.constructor === 餐厅);  // true

// 实际用途：判断对象是用哪个构造函数创建的
console.log(老王饭馆.constructor === 餐厅);  // true
~~~

### 三者关系图解

~~~
┌─────────────────────────────┐
│        餐厅（构造函数）       │
│                             │
│  prototype ──────────┐      │
│                      │      │
│  function 餐厅(名字)  │      │
│    this.名字 = 名字;  │      │
│                      │      │
└──────────────────────│──────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │   餐厅.prototype        │
         │                         │
         │   constructor ──────────┼──→ 餐厅（指回构造函数）
         │                         │
         │   报名: function() {}   │
         │   类型: "餐饮"          │
         │                         │
         └────────────┬────────────┘
                      │
                      │  __proto__ 指向这里
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────┐          ┌──────────────┐
│ 老王饭馆      │          │ 老李饭馆      │
│              │          │              │
│ 名字: "老王" │          │ 名字: "老李" │
│              │          │              │
│ __proto__ ───┼──→ 餐厅.prototype      │
└──────────────┘          └──────────────┘
~~~

### 读写属性时原型链的行为

~~~javascript
// ========== 读属性：沿着原型链向上找 ==========
function 餐厅(名字) { this.名字 = 名字; }
餐厅.prototype.类型 = "餐饮";
餐厅.prototype.报名 = function() { console.log(this.名字); };

const 店 = new 餐厅("老王饭馆");

console.log(店.名字);  // "老王饭馆"  → 自身找到
console.log(店.类型);  // "餐饮"      → 自身没有，沿 __proto__ 找到 prototype
console.log(店.地址);  // undefined    → 自身和 prototype 都没有

// ========== 写属性：只在自身操作，不影响原型 ==========
店.类型 = "川菜";           // 在自身创建新属性（不会修改 prototype）
console.log(店.类型);       // "川菜"（自身找到，不再往上找）
console.log(餐厅.prototype.类型);  // "餐饮"（prototype 没被影响）

// ========== 修改引用类型的原型属性（陷阱！） ==========
餐厅.prototype.菜单 = ["红烧肉", "麻婆豆腐"];

const 店A = new 餐厅("A店");
const 店B = new 餐厅("B店");

// 读取菜单：两个店读到的是同一个数组（prototype 上的）
console.log(店A.菜单 === 店B.菜单);  // true（同一个引用）

// 修改菜单：会影响所有实例！
店A.菜单.push("糖醋里脊");
console.log(店B.菜单);  // ["红烧肉", "麻婆豆腐", "糖醋里脊"] ← B店也受影响！
~~~

---

## 13.3 原型链完整机制

### 属性遮蔽（Shadowing）

**一句话解释：**
当实例自身有某个属性，而原型上也有同名属性时，实例自身的属性会**遮蔽**原型上的——优先使用自己的。

**餐厅比喻：**
公司总部规定"所有分店统一装修风格：中式"（prototype）。但老王饭馆觉得自己的风格更好，自己**单独贴了一张"本店风格：日式"**。以后来老王饭馆的顾客看到的都是"日式"，但去其他分店看到的还是"中式"。

~~~javascript
// ========== 属性遮蔽 ==========
function 餐厅(名字) { this.名字 = 名字; }

餐厅.prototype.装修风格 = "中式";
餐厅.prototype.评分 = 4.5;

const 店1 = new 餐厅("老王饭馆");
const 店2 = new 餐厅("老李饭馆");

// 店1 自身没有"装修风格"，从原型上找 → "中式"
console.log(店1.装修风格);  // 中式

// 店1 自己定义了"装修风格"（属性遮蔽）
店1.装修风格 = "日式";

// 店1 现在用自己的 → "日式"
console.log(店1.装修风格);  // 日式

// 店2 还是从原型上找 → "中式"
console.log(店2.装修风格);  // 中式

// 原型没被影响
console.log(餐厅.prototype.装修风格);  // 中式

// ========== 删除实例属性后，重新露出原型属性 ==========
delete 店1.装修风格;
console.log(店1.装修风格);  // 中式（遮蔽被移除，原型属性露出来了）
~~~

### hasOwnProperty vs in 操作符

~~~javascript
function 餐厅(名字) { this.名字 = 名字; }
餐厅.prototype.类型 = "餐饮";

const 店 = new 餐厅("老王饭馆");
店.地址 = "北京";

// ========== hasOwnProperty：只检查自身属性 ==========
console.log(店.hasOwnProperty("名字"));    // true（自身有）
console.log(店.hasOwnProperty("类型"));    // false（在原型上，不是自身）
console.log(店.hasOwnProperty("地址"));    // true（自身有）
console.log(店.hasOwnProperty("toString")); // false（在 Object.prototype 上）

// ========== in 操作符：沿着原型链检查 ==========
console.log("名字" in 店);       // true
console.log("类型" in 店);       // true（原型上也有）
console.log("地址" in 店);       // true
console.log("toString" in 店);   // true（Object.prototype 上也有）

// ========== 区别速查 ==========
// hasOwnProperty → "这是你自己的东西吗？"
// in → "你能访问到这个东西吗？（不管是不是自己的）"

// ========== 推荐用 Object.hasOwn()（ES2022） ==========
console.log(Object.hasOwn(店, "名字"));     // true
console.log(Object.hasOwn(店, "类型"));     // false
// Object.hasOwn 比 hasOwnProperty 更安全（不会被对象自身的同名属性覆盖）
~~~

### 原型链终点 null

~~~javascript
// ========== 原型链的尽头是 null ==========
function 餐厅(名字) { this.名字 = 名字; }
const 店 = new 餐厅("老王饭馆");

// 顺着原型链一直往上找：
console.log(店.__proto__);                    // 餐厅.prototype
console.log(店.__proto__.__proto__);          // Object.prototype
console.log(店.__proto__.__proto__.__proto__); // null（到头了）

// 完整原型链：
// 店 → 餐厅.prototype → Object.prototype → null

// 查找属性时，到 null 还找不到就返回 undefined
console.log(店.不存在的属性);  // undefined

// 图解：
// ┌──────────┐
// │   店      │  自身属性：名字
// │ __proto__ ┼──→
// └──────────┘
//                ┌─────────────────┐
//                │ 餐厅.prototype   │  属性：类型、报名...
//                │ __proto__ ───────┼──→
//                └─────────────────┘
//                                  ┌──────────────────┐
//                                  │ Object.prototype  │  属性：toString、hasOwnProperty...
//                                  │ __proto__ ────────┼──→
//                                  └──────────────────┘
//                                                    ┌──────┐
//                                                    │ null │  ← 到头了
//                                                    └──────┘
~~~

---

## 13.4 继承 6 种方式

### 13.4.1 原型链继承

~~~javascript
// 原理：把子构造函数的 prototype 指向父构造函数的实例
function 动物(名字) {
  this.名字 = 名字;
  this.爱好 = ["吃", "睡"];
}
动物.prototype.打招呼 = function() {
  console.log(`我是${this.名字}`);
};

function 猫(名字) {
  this.名字 = 名字;
}

// 关键：猫的 prototype 是一个动物实例
猫.prototype = new 动物();
猫.prototype.constructor = 猫;

const 小花 = new 猫("小花");
小花.打招呼();  // 我是小花
console.log(小花.爱好);  // ["吃", "睡"]

// ❌ 问题1：引用类型的属性被所有实例共享
const 小黑 = new 猫("小黑");
小花.爱好.push("抓老鼠");
console.log(小黑.爱好);  // ["吃", "睡", "抓老鼠"] ← 小黑也被影响了！

// ❌ 问题2：创建子类实例时不能向父类构造函数传参
~~~

### 13.4.2 借用构造函数继承

~~~javascript
// 原理：在子构造函数中用 call/apply 调用父构造函数
function 动物(名字, 寿命) {
  this.名字 = 名字;
  this.寿命 = 寿命;
  this.爱好 = ["吃", "睡"];
}

function 猫(名字, 寿命, 毛色) {
  动物.call(this, 名字, 寿命);  // 借用父构造函数
  this.毛色 = 毛色;
}

const 小花 = new 猫("小花", 5, "橘色");
const 小黑 = new 猫("小黑", 3, "黑色");

console.log(小花.名字, 小花.毛色);  // 小花 橘色
console.log(小黑.名字, 小黑.毛色);  // 小黑 黑色

// ✅ 解决了引用类型共享问题
小花.爱好.push("抓老鼠");
console.log(小黑.爱好);  // ["吃", "睡"] ← 小黑不受影响

// ❌ 问题：方法不能复用，每次创建实例都会创建新的函数
// 动物.prototype 上的方法，猫的实例访问不到
// 小花.打招呼();  // ❌ TypeError
~~~

### 13.4.3 组合继承

~~~javascript
// 原理：原型链继承（方法复用）+ 借用构造函数继承（属性独立）
function 动物(名字, 寿命) {
  this.名字 = 名字;
  this.寿命 = 寿命;
  this.爱好 = ["吃", "睡"];
}
动物.prototype.打招呼 = function() {
  console.log(`我是${this.名字}`);
};

function 猫(名字, 寿命, 毛色) {
  动物.call(this, 名字, 寿命);  // 第1次调用动物
  this.毛色 = 毛色;
}

猫.prototype = new 动物();        // 第2次调用动物（多余！）
猫.prototype.constructor = 猫;
猫.prototype.抓老鼠 = function() {
  console.log(`${this.名字}在抓老鼠`);
};

const 小花 = new 猫("小花", 5, "橘色");
小花.打招呼();  // 我是小花
小花.抓老鼠();  // 小花在抓老鼠

// ✅ 方法可以复用
// ✅ 引用类型不共享
// ✅ 可以向父类传参

// ❌ 问题：父构造函数被调用了两次（一次在 call，一次在赋值 prototype）
~~~

### 13.4.4 原型式继承

~~~javascript
// 原理：Object.create 的手动实现版
function 创建对象(父对象) {
  function 临时构造函数() {}
  临时构造函数.prototype = 父对象;
  return new 临时构造函数();
}

// 等价于：
const 动物模板 = {
  名字: "未知",
  爱好: ["吃", "睡"],
  打招呼() { console.log(`我是${this.名字}`); }
};

const 小花 = Object.create(动物模板);
小花.名字 = "小花";
小花.打招呼();  // 我是小花

// 适合：你只有一个对象，想以它为基础创建新对象，不需要构造函数
~~~

### 13.4.5 寄生组合式继承（最佳方案）

~~~javascript
// 原理：借用构造函数 + 用 Object.create 建立原型链（不调用父构造函数）
function 继承(子构造函数, 父构造函数) {
  子构造函数.prototype = Object.create(父构造函数.prototype);
  子构造函数.prototype.constructor = 子构造函数;
}

function 动物(名字, 寿命) {
  this.名字 = 名字;
  this.寿命 = 寿命;
  this.爱好 = ["吃", "睡"];
}
动物.prototype.打招呼 = function() {
  console.log(`我是${this.名字}`);
};

function 猫(名字, 寿命, 毛色) {
  动物.call(this, 名字, 寿命);  // 只调用一次
  this.毛色 = 毛色;
}

继承(猫, 动物);  // 建立原型链，不调用动物

猫.prototype.抓老鼠 = function() {
  console.log(`${this.名字}在抓老鼠`);
};

const 小花 = new 猫("小花", 5, "橘色");
小花.打招呼();  // 我是小花
小花.抓老鼠();  // 小花在抓老鼠

// ✅ 父构造函数只调用了一次
// ✅ 原型链正确
// ✅ 引用类型不共享
// ✅ 可以传参
// ⭐ 这是 ES6 class 之前的最佳继承方案
~~~

### 13.4.6 ES6 class 继承

~~~javascript
// 语法糖，本质还是寄生组合式继承
class 动物 {
  constructor(名字, 寿命) {
    this.名字 = 名字;
    this.寿命 = 寿命;
    this.爱好 = ["吃", "睡"];
  }
  打招呼() {
    console.log(`我是${this.名字}`);
  }
}

class 猫 extends 动物 {
  constructor(名字, 寿命, 毛色) {
    super(名字, 寿命);  // 调用父类构造函数
    this.毛色 = 毛色;
  }
  抓老鼠() {
    console.log(`${this.名字}在抓老鼠`);
  }
}

const 小花 = new 猫("小花", 5, "橘色");
小花.打招呼();  // 我是小花
小花.抓老鼠();  // 小花在抓老鼠
console.log(小花 instanceof 猫);    // true
console.log(小花 instanceof 动物);  // true
~~~

### 6 种继承方式对比

| 方式 | 方法复用 | 引用类型独立 | 传参 | 父构造调用次数 | 推荐度 |
|---|---|---|---|---|---|
| 原型链继承 | ✅ | ❌ 共享 | ❌ | 1 | ⭐ |
| 借用构造函数 | ❌ | ✅ 独立 | ✅ | 1 | ⭐ |
| 组合继承 | ✅ | ✅ 独立 | ✅ | 2（多余） | ⭐⭐ |
| 原型式继承 | ✅ | ❌ 共享 | ❌ | 0 | ⭐ |
| 寄生组合式 | ✅ | ✅ 独立 | ✅ | 1 | ⭐⭐⭐⭐ |
| ES6 class | ✅ | ✅ 独立 | ✅ | 1 | ⭐⭐⭐⭐⭐ |

---

## 13.5 class 详解

### constructor

~~~javascript
class 餐厅 {
  // constructor：构造方法，new 时自动调用
  constructor(名字, 地址) {
    this.名字 = 名字;    // 实例属性
    this.地址 = 地址;
    this.菜单 = [];      // 每个实例独立的数组
  }
}

const 店1 = new 餐厅("老王饭馆", "北京");
const 店2 = new 餐厅("老李饭馆", "上海");
console.log(店1.菜单 === 店2.菜单);  // false（独立的）

// 不写 constructor 时，JS 会自动添加一个空的：
// constructor() {}
~~~

### 实例方法

~~~javascript
class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }

  // 实例方法（写在 prototype 上）
  报名() {
    console.log(`欢迎来到${this.名字}`);
  }

  添加菜品(菜名, 价格) {
    this.菜单.push({ 菜名, 价格 });
  }
}

const 店 = new 餐厅("老王饭馆");
店.报名();  // 欢迎来到老王饭馆

// 实例方法在 prototype 上
console.log(店.hasOwnProperty("报名"));     // false（不在自身）
console.log(餐厅.prototype.hasOwnProperty("报名")); // true（在 prototype 上）
~~~

### getter / setter

~~~javascript
class 菜品 {
  constructor(名字, 价格) {
    this.名字 =名字;
    this._价格 = 价格;  // 约定用下划线前缀表示"内部属性"
  }

  // getter：读取属性时自动调用
  get 价格() {
    console.log("有人在读价格");
    return `¥${this._价格.toFixed(2)}`;
  }

  // setter：设置属性时自动调用
  set 价格(新价格) {
    if (新价格 < 0) {
      throw new Error("价格不能为负数");
    }
    console.log(`价格从${this._价格}改为${新价格}`);
    this._价格 = 新价格;
  }
}

const 红烧肉 = new 菜品("红烧肉", 38);
console.log(红烧肉.价格);    // 有人在读价格 → ¥38.00（getter 被触发）
红烧肉.价格 = 42;            // 价格从38改为42（setter 被触发）
红烧肉.价格 = -10;           // ❌ Error: 价格不能为负数
~~~

### 静态属性 / 静态方法

~~~javascript
class 餐厅 {
  static 总数 = 0;       // 静态属性：属于类本身，不属于实例
  static 创建默认() {     // 静态方法：通过类名调用
    return new 餐厅("默认餐厅");
  }

  constructor(名字) {
    this.名字 = 名字;
    餐厅.总数++;  // 每创建一个实例，总数加1
  }

  报名() {
    console.log(this.名字);
  }
}

// 静态属性/方法通过类名访问
console.log(餐厅.总数);  // 0

const 店1 = new 餐厅("老王饭馆");
const 店2 = new 餐厅("老李饭馆");
console.log(餐厅.总数);  // 2

const 默认店 = 餐厅.创建默认();
默认店.报名();  // 默认餐厅

// 实例访问不到静态成员
// 店1.总数;          // undefined
// 店1.创建默认();    // TypeError
~~~

### 私有属性 / 私有方法（#）

~~~javascript
class 收银台 {
  #余额;       // 私有属性：只能在类内部访问

  constructor(初始金额) {
    this.#余额 = 初始金额;
  }

  // 私有方法
  #记录交易(类型, 金额) {
    console.log(`${类型}：¥${金额}，余额：¥${this.#余额}`);
  }

  存款(金额) {
    this.#余额 += 金额;
    this.#记录交易("存款", 金额);
  }

  取款(金额) {
    if (金额 > this.#余额) {
      console.log("余额不足");
      return;
    }
    this.#余额 -= 金额;
    this.#记录交易("取款", 金额);
  }

  get 查余额() {
    return `¥${this.#余额}`;
  }
}

const 收银 = new 收银台(1000);
收银.存款(500);      // 存款：¥500，余额：¥1500
收银.取款(200);      // 取款：¥200，余额：¥1300
console.log(收银.查余额);  // ¥1300

// 外部无法访问私有成员
// console.log(收银.#余额);         // ❌ SyntaxError
// 收银.#记录交易("测试", 0);       // ❌ SyntaxError
~~~

### class 本质是语法糖

~~~javascript
// ========== ES6 class ==========
class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }
  报名() {
    console.log(this.名字);
  }
}
餐厅.总数 = 0;

// ========== 等价的 ES5 写法 ==========
function 餐厅ES5(名字) {
  this.名字 = 名字;
}
餐厅ES5.prototype.报名 = function() {
  console.log(this.名字);
};
餐厅ES5.总数 = 0;

// 验证：
console.log(typeof 餐厅);            // "function"（class 就是函数！）
console.log(餐厅 === 餐厅.prototype.constructor);  // true
console.log(Object.getPrototypeOf(餐厅.prototype) === Object.prototype);  // true
~~~

---

## 13.6 extends / super / 方法重写

### extends

~~~javascript
class 动物 {
  constructor(名字) {
    this.名字 = 名字;
  }
  打招呼() {
    console.log(`我是${this.名字}`);
  }
}

// extends 建立继承关系
class 猫 extends 动物 {
  constructor(名字, 毛色) {
    super(名字);  // 必须先调用 super
    this.毛色 = 毛色;
  }
}

const 小花 = new 猫("小花", "橘色");
小花.打招呼();  // 我是小花（继承自动物）
~~~

### super

~~~javascript
// ========== super 的两种用法 ==========

// 1. super()：调用父类构造函数（只能在 constructor 中使用）
class 子类 extends 父类 {
  constructor() {
    super();  // 必须在使用 this 之前调用
    this.自己的属性 = "值";
  }
}

// 2. super.方法()：调用父类的方法
class 父类 {
  做菜() {
    console.log("父类的做菜方法");
  }
}

class 子类 extends 父类 {
  做菜() {
    super.做菜();  // 先调用父类的做菜
    console.log("子类的做菜方法");
  }
}

const 实例 = new 子类();
实例.做菜();
// 父类的做菜方法
// 子类的做菜方法

// ========== super 的注意事项 ==========
class 动物 {
  constructor(名字) {
    this.名字 = 名字;
  }
}

class 猫 extends 动物 {
  constructor(名字, 毛色) {
    // ❌ 不调用 super 就用 this 会报错
    // this.毛色 = 毛色;  // ReferenceError

    super(名字);  // ✅ 先调用 super
    this.毛色 = 毛色;  // ✅ 现在可以用 this 了
  }
}

// 不写 constructor 时，JS 自动添加：
// constructor(...参数) { super(...参数); }
~~~

### 方法重写（Override）

~~~javascript
class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }
  报名() {
    console.log(`欢迎来到${this.名字}`);
  }
  今日推荐() {
    console.log("今日推荐：红烧肉");
  }
}

class 高级餐厅 extends 餐厅 {
  // 方法重写：子类定义同名方法，覆盖父类的
  报名() {
    console.log(`欢迎尊贵的客人来到${this.名字}，为您安排VIP包间`);
  }

  // 想在重写的方法中调用父类原版？
  今日推荐() {
    super.今日推荐();  // 先执行父类的
    console.log("本店还推荐：龙虾刺身");  // 再补充子类的
  }
}

const 普通店 = new 餐厅("老王饭馆");
普通店.报名();  // 欢迎来到老王饭馆

const 高级店 = new 高级餐厅("老王高级餐厅");
高级店.报名();  // 欢迎尊贵的客人来到老王高级餐厅，为您安排VIP包间

高级店.今日推荐();
// 今日推荐：红烧肉（父类的）
// 本店还推荐：龙虾刺身（子类追加的）
~~~

---

## 13.7 Mixin（多重继承替代方案）

**一句话解释：**
JS 的 class 只支持单继承（一个类只能 extends 一个父类）。Mixin 是一种模式——把一组功能方法打包成一个对象，然后**混入**到多个类中，实现类似多重继承的效果。

~~~javascript
// ========== 定义 Mixin（一组可复用的功能） ==========
const 打折功能 = {
  打折(折扣) {
    this.当前折扣 = 折扣;
    console.log(`${this.名字}开启${折扣 * 10}折优惠`);
  },
  计算折后价(原价) {
    return 原价 * (this.当前折扣 || 1);
  }
};

const 外卖功能 = {
  开通外卖(平台) {
    this.外卖平台 = 平台;
    console.log(`${this.名字}已在${平台}上线`);
  },
  配送费(距离) {
    return 距离 * 2;
  }
};

// ========== 定义 Mixin 混入函数 ==========
function 混入(目标类, ...来源们) {
  for (const 来源 of 来源们) {
    for (const [键, 值] of Object.entries(来源)) {
      目标类.prototype[键] = 值;
    }
  }
}

// ========== 使用 ==========
class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }
  报名() {
    console.log(this.名字);
  }
}

// 把功能混入餐厅类
混入(餐厅, 打折功能, 外卖功能);

const 老王饭馆 = new 餐厅("老王饭馆");
老王饭馆.报名();          // 老王饭馆
老王饭馆.打折(0.8);       // 老王饭馆开启8折优惠
老王饭馆.开通外卖("美团"); // 老王饭馆已在美团上线
console.log(老王饭馆.计算折后价(100));  // 80
console.log(老王饭馆.配送费(5));        // 10

// 可以混入多个功能，不受单继承限制
// 但要注意命名冲突——后面混入的会覆盖前面的
~~~

---

## 13.8 instanceof

**一句话解释：**
`instanceof` 沿着对象的原型链检查——`a instanceof B` 就是看 `B.prototype` 是否在 `a` 的原型链上。

~~~javascript
class 动物 {}
class 猫 extends 动物 {}
class 狗 extends 动物 {}

const 小花 = new 猫();
const 小黑 = new 狗();

// ========== 沿原型链检查 ==========
console.log(小花 instanceof 猫);     // true（猫.prototype 在小花的原型链上）
console.log(小花 instanceof 动物);   // true（动物.prototype 也在小花的原型链上）
console.log(小花 instanceof 狗);     // false（狗.prototype 不在小花的原型链上）

// ========== 图解原型链 ==========
// 小花.__proto__ === 猫.prototype          → true
// 猫.prototype.__proto__ === 动物.prototype → true
// 动物.prototype.__proto__ === Object.prototype → true
// Object.prototype.__proto__ === null → 到头了

// 小花 的原型链：小花 → 猫.prototype → 动物.prototype → Object.prototype → null
// 猫.prototype 在链上？ ✅
// 动物.prototype 在链上？ ✅
// 狗.prototype 在链上？ ❌
~~~

---

## 第13章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| 构造函数 | 用 new 调用的函数，创建新实例 | 餐厅蓝图 |
| new 的 4 步 | 创建空对象→绑定 this→执行函数→返回对象 | 空地→我是老板→装修→开业 |
| prototype | 函数上的"公共说明书"，给实例共享用 | 公司总部标准操作手册 |
| \_\_proto\_\_ | 对象上的隐形连线，指向构造函数的 prototype | 分店前台连着总部手册的线 |
| constructor | prototype 上指回构造函数的属性 | 手册封面"XX公司出品" |
| 属性遮蔽 | 实例自身属性优先于原型同名属性 | 分店自定风格优先于总部统一风格 |
| hasOwnProperty | 只检查自身属性 | "这是你自己的东西吗？" |
| in 操作符 | 沿原型链检查（含原型） | "你能访问到这个东西吗？" |
| 原型链终点 | null | 找到头了，没了 |
| 原型链继承 | 子 prototype = 父实例 | 照着第一家店开分店 |
| 借用构造函数 | 子中 call 父构造函数 | 借父类的装修方案 |
| 组合继承 | 原型链 + 借用构造函数 | 两种方式一起用 |
| 寄生组合式 | Object.create + call（最佳方案） | 高效照抄 + 独立装修 |
| ES6 class | 语法糖，本质还是原型链 | 现代化蓝图写法 |
| constructor | class 的构造方法 | 装修入场的第一步 |
| getter/setter | 属性读写时自动触发 | 有人问价格/改价格时的通知 |
| 静态属性/方法 | 属于类本身，不属于实例 | 公司总部的数据，不属于分店 |
| 私有属性 # | 只能在类内部访问 | 保险箱只有自己能开 |
| extends | 建立继承关系 | 子承父业 |
| super | 调用父类构造函数或方法 | 请教父亲/调用总部方案 |
| 方法重写 | 子类覆盖父类同名方法 | 分店改了总部的菜谱 |
| Mixin | 把功能混入多个类 | 给多家餐厅都装上打折系统 |
| instanceof | 沿原型链检查类型 | 查家谱看是不是自己人 |
