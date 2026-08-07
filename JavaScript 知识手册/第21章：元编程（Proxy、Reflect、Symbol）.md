# 第21章：元编程（Proxy、Reflect、Symbol）

## 21.1 Proxy

**一句话解释：**
创建一个对象的"代理"，所有对这个对象的操作（读取、设置、删除、遍历……）都会先经过你定义的"拦截器"，你可以在拦截器里做任何事——记录、修改、拒绝、甚至完全替换行为。

**餐厅比喻：**
你在厨房门口装了一个**智能门禁系统**（Proxy）。任何人想进厨房拿东西（读属性）、往厨房放东西（写属性）、扔东西（删属性），门禁系统都会**先拦截**，然后你可以选择：放行、拒绝、偷偷换东西。

~~~javascript
// ========== 普通对象：操作直接生效 ==========
const 原始菜单 = { 红烧肉: 38, 麻婆豆腐: 22 };

原始菜单.红烧肉;      // 直接读
原始菜单.糖醋里脊 = 45; // 直接写
delete 原始菜单.红烧肉; // 直接删
// 没有任何拦截，无法知道发生了什么

// ========== Proxy 对象：所有操作都被拦截 ==========
const 被监控的菜单 = new Proxy(原始菜单, {
  // 拦截"读取属性"
  get(目标, 属性名) {
    console.log(`📖 有人读取了"${属性名}"`);

    if (!(属性名 in 目标)) {
      console.log(`⚠️ "${属性名}"不存在`);
      return undefined;
    }

    return 目标[属性名];
  },

  // 拦截"设置属性"
  set(目标, 属性名, 新值) {
    if (新值 < 0) {
      console.log(`❌ "${属性名}"的价格不能为负数！`);
      return false;  // 拒绝设置
    }

    console.log(`✏️ "${属性名}"改为${新值}元`);
    目标[属性名] = 新值;
    return true;  // 允许设置
  },

  // 拦截"删除属性"
  deleteProperty(目标, 属性名) {
    console.log(`🗑️ 有人要删除"${属性名}"`);
    delete 目标[属性名];
    return true;
  },

  // 拦截"检查属性是否存在"
  has(目标, 属性名) {
    console.log(`🔍 有人在查"${属性名}"存不存在`);
    return 属性名 in 目标;
  }
});

// ========== 测试所有拦截 ==========

被监控的菜单.红烧肉;
// 📖 有人读取了"红烧肉"
// 38

被监控的菜单.龙虾;
// 📖 有人读取了"龙虾"
// ⚠️ "龙虾"不存在
// undefined

被监控的菜单.糖醋里脊 = 45;
// ✏️ "糖醋里脊"改为45元

被监控的菜单.红烧肉 = -10;
// ❌ "红烧肉"的价格不能为负数！

delete 被监控的菜单.麻婆豆腐;
// 🗑️ 有人要删除"麻婆豆腐"

"红烧肉" in 被监控的菜单;
// 🔍 有人在查"红烧肉"存不存在
// true
~~~

### Proxy 的 13 种拦截操作

~~~javascript
const handler = {
  // ========== 属性相关 ==========
  get(目标, 属性名, 代理) {},          // 读取属性
  set(目标, 属性名, 值, 代理) {},      // 设置属性
  has(目标, 属性名) {},                // in 操作符
  deleteProperty(目标, 属性名) {},    // delete 操作符
  ownKeys(目标) {},                   // Object.keys / for...in

  // ========== 属性描述符相关 ==========
  getOwnPropertyDescriptor(目标, 属性名) {},
  defineProperty(目标, 属性名, 描述符) {},

  // ========== 原型相关 ==========
  getPrototypeOf(目标) {},
  setPrototypeOf(目标, 原型) {},
  isExtensible(目标) {},
  preventExtensions(目标) {},

  // ========== 函数/构造器相关 ==========
  apply(目标, this值, 参数们) {},      // 函数调用
  construct(目标, 参数们, 新对象) {},  // new 操作符
};
~~~

~~~javascript
// ========== 拦截函数调用：apply ==========
function 做菜(菜名) {
  return `${菜名}做好了`;
}

const 被监控的做菜 = new Proxy(做菜, {
  apply(目标, this值, 参数们) {
    console.log(`📞 有人调用了做菜，参数：${参数们}`);
    const 结果 = 目标.apply(this值, 参数们);
    console.log(`📞 返回了：${结果}`);
    return 结果;
  }
});

被监控的做菜("红烧肉");
// 📞 有人调用了做菜，参数：红烧肉
// 📞 返回了：红烧肉做好了

// ========== 拦截 new 操作：construct ==========
class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }
}

const 被监控的餐厅 = new Proxy(餐厅, {
  construct(目标, 参数们, 新对象) {
    console.log(`🏗️ 有人要开新餐厅，名字：${参数们[0]}`);
    const 实例 = new 目标(...参数们);
    console.log(`🏗️ "${参数们[0]}"开业了！`);
    return 实例;
  }
});

const 新店 = new 被监控的餐厅("老王饭馆");
// 🏗️ 有人要开新餐厅，名字：老王饭馆
// 🏗️ "老王饭馆"开业了！
~~~

### Proxy 的实际应用场景

~~~javascript
// ========== 场景1：数据验证 ==========
function 创建验证对象(对象, 规则) {
  return new Proxy(对象, {
    set(目标, 属性名, 值) {
      const 验证规则 = 规则[属性名];

      if (验证规则) {
        if (验证规则.类型 && typeof 值 !== 验证规则.类型) {
          throw new TypeError(`${属性名}必须是${验证规则.类型}类型`);
        }
        if (验证规则.最小值 !== undefined && 值 < 验证规则.最小值) {
          throw new RangeError(`${属性名}不能小于${验证规则.最小值}`);
        }
        if (验证规则.最大值 !== undefined && 值 > 验证规则.最大值) {
          throw new RangeError(`${属性名}不能大于${验证规则.最大值}`);
        }
      }

      目标[属性名] = 值;
      return true;
    }
  });
}

const 菜品 = 创建验证对象({}, {
  名字: { 类型: "string" },
  价格: { 类型: "number", 最小值: 0, 最大值: 999 },
  数量: { 类型: "number", 最小值: 1 }
});

菜品.名字 = "红烧肉";      // ✅
菜品.价格 = 38;             // ✅
菜品.价格 = -10;            // ❌ RangeError: 价格不能小于0
菜品.价格 = 1000;           // ❌ RangeError: 价格不能大于999
菜品.名字 = 123;            // ❌ TypeError: 名字必须是string类型
~~~

~~~javascript
// ========== 场景2：属性默认值（类似 Python 的 defaultdict） ==========
function 创建有默认值的对象(默认值工厂) {
  return new Proxy({}, {
    get(目标, 属性名) {
      if (!(属性名 in 目标)) {
        目标[属性名] = 默认值工厂(属性名);
        console.log(`🆕 自动创建了"${属性名}"，默认值：${目标[属性名]}`);
      }
      return 目标[属性名];
    }
  });
}

const 库存 = 创建有默认值的对象(() => 0);

console.log(库存.红烧肉);  // 🆕 自动创建了"红烧肉"，默认值：0 → 0
console.log(库存.红烧肉);  // 0（第二次直接返回，不创建了）
库存.红烧肉 = 10;
console.log(库存.红烧肉);  // 10
~~~

~~~javascript
// ========== 场景3：访问日志/调试 ==========
function 记录访问(对象, 名称) {
  return new Proxy(对象, {
    get(目标, 属性名, 代理) {
      const 值 = Reflect.get(目标, 属性名, 代理);
      console.log(`[${名称}] 读取 ${String(属性名)} → ${值}`);
      return 值;
    },
    set(目标, 属性名, 值, 代理) {
      console.log(`[${名称}] 修改 ${String(属性名)}: ${目标[属性名]} → ${值}`);
      return Reflect.set(目标, 属性名, 值, 代理);
    }
  });
}

const 配置 = 记录访问({ 主题: "深色", 字号: 16, 语言: "中文" }, "APP配置");

配置.主题;           // [APP配置] 读取 主题 → 深色
配置.字号 = 20;      // [APP配置] 修改 字号: 16 → 20
配置.语言;           // [APP配置] 读取 语言 → 中文
~~~

~~~javascript
// ========== 场景4：负索引数组（像 Python 一样用 arr[-1]） ==========
function 创建负索引数组(...元素) {
  const 数组 = [...元素];

  return new Proxy(数组, {
    get(目标, 属性名) {
      const 索引 = Number(属性名);

      if (Number.isInteger(索引) && 索引 < 0) {
        return 目标[目标.length + 索引];
      }

      return 目标[属性名];
    }
  });
}

const 菜单 = 创建负索引数组("红烧肉", "麻婆豆腐", "糖醋里脊", "宫保鸡丁");

console.log(菜单[0]);    // 红烧肉
console.log(菜单[-1]);   // 宫保鸡丁（最后一个）
console.log(菜单[-2]);   // 糖醋里脊（倒数第二个）
~~~

---

## 21.2 Reflect

**一句话解释：**
Reflect 提供了一套**标准化的静态方法**来操作对象——读取、设置、删除、判断，每个操作都有对应的方法。跟 Proxy 的拦截方法**一一对应**。

**餐厅比喻：**
如果 Proxy 是厨房门口的**保安**，那 Reflect 就是保安手里的**标准操作手册**。保安拦截到操作后，可以按手册上的标准流程执行，也可以自己决定怎么做。

~~~javascript
const 菜品 = { 名字: "红烧肉", 价格: 38 };

// ========== Reflect.get：读取属性 ==========
Reflect.get(菜品, "名字")             // "红烧肉"
// 等价于：菜品.名字 或 菜品["名字"]

// ========== Reflect.set：设置属性 ==========
Reflect.set(菜品, "价格", 42)
// 等价于：菜品.价格 = 42

// ========== Reflect.has：判断属性是否存在 ==========
Reflect.has(菜品, "名字")             // true
Reflect.has(菜品, "龙虾")             // false
// 等价于："名字" in 菜品

// ========== Reflect.deleteProperty：删除属性 ==========
Reflect.deleteProperty(菜品, "价格")
// 等价于：delete 菜品.价格

// ========== Reflect.ownKeys：获取所有自有属性键 ==========
Reflect.ownKeys(菜品)                 // ["名字"]

// ========== Reflect.apply：调用函数 ==========
function 加(甲, 乙) { return 甲 + 乙; }
Reflect.apply(加, null, [3, 5])       // 8
// 等价于：加.apply(null, [3, 5])

// ========== Reflect.construct：用 new 调用构造函数 ==========
class 餐厅 { constructor(名) { this.名 = 名; } }
const 店 = Reflect.construct(餐厅, ["老王饭馆"]);
// 等价于：new 餐厅("老王饭馆")

// ========== Reflect.getOwnPropertyDescriptor：获取属性描述符 ==========
Reflect.getOwnPropertyDescriptor(菜品, "名字")
// { value: "红烧肉", writable: true, enumerable: true, configurable: true }

// ========== Reflect.isExtensible：对象是否可扩展 ==========
Reflect.isExtensible(菜品)            // true

// ========== Reflect.preventExtensions：阻止扩展 ==========
Reflect.preventExtensions(菜品)
Reflect.isExtensible(菜品)            // false
~~~

### Reflect + Proxy 配合使用

~~~javascript
// ========== 为什么需要 Reflect？ ==========

// ❌ 不用 Reflect 的 Proxy（可能会出问题）
const 不好的代理 = new Proxy({}, {
  get(目标, 属性名) {
    return 目标[属性名];  // 如果目标有 getter，this 会指向错误
  }
});

// ✅ 用 Reflect 的 Proxy（推荐）
const 好的代理 = new Proxy({}, {
  get(目标, 属性名, 代理) {
    return Reflect.get(目标, 属性名, 代理);  // 正确传递 this
  }
});

// ========== 完整示例：Proxy + Reflect ==========

const 原始菜单 = { 红烧肉: 38, 麻婆豆腐: 22 };

const 智能菜单 = new Proxy(原始菜单, {
  get(目标, 属性名, 代理) {
    const 值 = Reflect.get(目标, 属性名, 代理);

    if (值 === undefined) {
      console.log(`❌ "${属性名}"不在菜单上`);
      return "没有这道菜";
    }

    console.log(`📖 查询"${属性名}"：${值}元`);
    return 值;
  },

  set(目标, 属性名, 值, 代理) {
    if (typeof 值 !== "number" || 值 <= 0) {
      console.log(`❌ 价格必须是正数`);
      return false;
    }

    const 旧值 = Reflect.get(目标, 属性名, 代理);
    const 结果 = Reflect.set(目标, 属性名, 值, 代理);

    console.log(`✏️ "${属性名}"：${旧值} → ${值}元`);
    return 结果;
  },

  has(目标, 属性名) {
    console.log(`🔍 检查"${属性名}"是否在菜单上`);
    return Reflect.has(目标, 属性名);
  }
});

智能菜单.红烧肉;            // 📖 查询"红烧肉"：38元
智能菜单.龙虾;               // ❌ "龙虾"不在菜单上
智能菜单.红烧肉 = 42;       // ✏️ "红烧肉"：38 → 42元
智能菜单.红烧肉 = -10;      // ❌ 价格必须是正数
"麻婆豆腐" in 智能菜单;     // 🔍 检查"麻婆豆腐"是否在菜单上
~~~

---

## 21.3 Symbol 元编程属性

**一句话解释：**
Symbol 的特殊属性（如 `Symbol.iterator`、`Symbol.toPrimitive`）可以让你**重写 JS 的底层行为**——比如决定对象怎么被遍历、怎么被转成数字/字符串。

**餐厅比喻：**
你给餐厅装了一套**自定义操作系统**——你可以决定：顾客按什么顺序参观（`Symbol.iterator` → 遍历顺序）、顾客问"你们多少钱"时怎么回答（`Symbol.toPrimitive` → 类型转换）、保安怎么判断"这个人是不是你们家的"（`Symbol.hasInstance` → instanceof）。

### Symbol.iterator——让对象可以用 for...of 遍历

~~~javascript
// ========== 默认情况下，普通对象不能用 for...of ==========
const 菜品 = { 名字: "红烧肉", 价格: 38, 类型: "热菜" };

// for (const 值 of 菜品) {}  // ❌ TypeError: 菜品 is not iterable

// ========== 给对象实现 Symbol.iterator，让它变得可遍历 ==========

class 菜单 {
  constructor() {
    this.菜品们 = [
      { 名字: "红烧肉", 价格: 38 },
      { 名字: "麻婆豆腐", 价格: 22 },
      { 名字: "糖醋里脊", 价格: 45 },
    ];
  }

  // 实现 Symbol.iterator：定义"怎么遍历我"
  [Symbol.iterator]() {
    let 索引 = 0;
    const 菜品们 = this.菜品们;

    return {
      next() {
        if (索引 < 菜品们.length) {
          return { value: 菜品们[索引++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

const 今日菜单 = new 菜单();

// 现在可以用 for...of 了！
for (const 菜 of 今日菜单) {
  console.log(`${菜.名字}：${菜.价格}元`);
}
// 红烧肉：38元
// 麻婆豆腐：22元
// 糖醋里脊：45元

// 展开运算符也能用了！
console.log([...今日菜单]);

// 解构也能用！
const [第一道, 第二道] = 今日菜单;
console.log(第一道.名字);  // 红烧肉

// ========== 更简洁的写法：用 generator 函数 ==========

class 菜单2 {
  constructor() {
    this.菜品们 = ["红烧肉", "麻婆豆腐", "糖醋里脊"];
  }

  *[Symbol.iterator]() {
    for (const 菜 of this.菜品们) {
      yield 菜;
    }
  }
}
~~~

### Symbol.toPrimitive——控制类型转换

~~~javascript
// ========== 控制对象转成数字/字符串/默认值时的行为 ==========

class 价格 {
  constructor(数值) {
    this.数值 = 数值;
  }

  [Symbol.toPrimitive](hint) {
    console.log(`转换提示：${hint}`);

    if (hint === "number") {
      return this.数值;
    }
    if (hint === "string") {
      return `¥${this.数值}`;
    }
    return this.数值;
  }
}

const 红烧肉价格 = new 价格(38);

// 转数字（hint = "number"）
console.log(+红烧肉价格);            // 转换提示：number → 38
console.log(红烧肉价格 * 2);        // 转换提示：number → 76

// 转字符串（hint = "string"）
console.log(`${红烧肉价格}`);        // 转换提示：string → ¥38
console.log(String(红烧肉价格));     // 转换提示：string → ¥38

// 默认转换（hint = "default"）
console.log(红烧肉价格 + 10);       // 转换提示：default → 48
console.log(红烧肉价格 == 38);      // 转换提示：default → true
~~~

### Symbol.hasInstance——控制 instanceof

~~~javascript
// ========== 自定义 instanceof 的判断逻辑 ==========

class 有经验的厨师 {
  static [Symbol.hasInstance](对象) {
    return typeof 对象.经验年数 === "number" && 对象.经验年数 >= 3;
  }
}

const 老张 = { 名字: "老张", 经验年数: 10 };
const 小李 = { 名字: "小李", 经验年数: 1 };
const 学徒 = { 名字: "学徒" };

console.log(老张 instanceof 有经验的厨师);  // true
console.log(小李 instanceof 有经验的厨师);  // false
console.log(学徒 instanceof 有经验的厨师);  // false
~~~

### Symbol.toStringTag——控制 toString 的结果

~~~javascript
// ========== 自定义 Object.prototype.toString.call 的结果 ==========

class 餐厅 {
  constructor(名字) {
    this.名字 = 名字;
  }

  get [Symbol.toStringTag]() {
    return `餐厅:${this.名字}`;
  }
}

const 老王饭馆 = new 餐厅("老王饭馆");
console.log(Object.prototype.toString.call(老王饭馆));
// "[object 餐厅:老王饭馆]"  ← 不再是 "[object Object]"
~~~

### Symbol.species——控制派生对象的构造函数

~~~javascript
// ========== 控制 map/filter 等方法返回什么类型的对象 ==========

class 特殊数组 extends Array {
  static get [Symbol.species]() {
    return Array;  // 告诉 JS："我派生出来的东西用 Array 构造"
  }
}

const 列表 = new 特殊数组(1, 2, 3, 4, 5);

const 过滤结果 = 列表.filter(x => x > 3);
console.log(过滤结果);                     // [4, 5]
console.log(过滤结果 instanceof 特殊数组);  // false（是普通 Array）
console.log(过滤结果 instanceof Array);     // true
~~~

### Symbol.isConcatSpreadable——控制 concat 是否展开

~~~javascript
// ========== 默认：数组在 concat 时会被展开 ==========
const A = [1, 2];
const B = [3, 4];
console.log(A.concat(B));  // [1, 2, 3, 4]

// ========== 设置为 false：不展开 ==========
const C = [5, 6];
C[Symbol.isConcatSpreadable] = false;
console.log(A.concat(C));  // [1, 2, [5, 6]]

// ========== 对象也可以被 concat（设置为 true） ==========
const 类数组 = {
  0: "红烧肉",
  1: "麻婆豆腐",
  length: 2,
  [Symbol.isConcatSpreadable]: true
};

console.log([].concat(类数组));  // ["红烧肉", "麻婆豆腐"]
~~~

---

## 21.4 实战：用 Proxy + Reflect 实现响应式系统

~~~javascript
// ========== 用 Proxy + Reflect 实现 Vue 风格的响应式 ==========

function 创建响应式(对象, 回调) {
  return new Proxy(对象, {
    get(目标, 属性名, 代理) {
      const 值 = Reflect.get(目标, 属性名, 代理);

      // 如果值是对象，递归代理（深度响应式）
      if (值 !== null && typeof 值 === "object") {
        return 创建响应式(值, 回调);
      }

      return 值;
    },

    set(目标, 属性名, 值, 代理) {
      const 旧值 = Reflect.get(目标, 属性名, 代理);
      const 结果 = Reflect.set(目标, 属性名, 值, 代理);

      // 值变了才触发回调
      if (旧值 !== 值) {
        回调(属性名, 值, 旧值);
      }

      return 结果;
    }
  });
}

// 使用
const 状态 = 创建响应式(
  {
    菜名: "红烧肉",
    价格: 38,
    库存: {
      猪肉: 50,
      酱油: 20
    }
  },
  (属性名, 新值, 旧值) => {
    console.log(`🔄 数据变了：${String(属性名)}: ${旧值} → ${新值}`);
  }
);

状态.菜名;                    // 读取，不触发回调
状态.价格 = 42;               // 🔄 数据变了：价格: 38 → 42
状态.价格 = 42;               // 值没变，不触发回调
状态.库存.猪肉 = 45;          // 🔄 数据变了：猪肉: 50 → 45（深度响应式！）
状态.新属性 = "测试";          // 🔄 数据变了：新属性: undefined → 测试
~~~

---

## 21.5 所有 Symbol 元编程属性速查表

| Symbol 属性 | 作用 | 拦截什么 | 餐厅比喻 |
|---|---|---|---|
| `Symbol.iterator` | 定义遍历行为 | `for...of`、展开 `...`、解构 | 规定顾客参观厨房的路线 |
| `Symbol.toPrimitive` | 定义类型转换行为 | `+`、`==`、模板字符串 | 规定"你们多少钱"的回答方式 |
| `Symbol.hasInstance` | 定义 instanceof 行为 | `instanceof` | 规定"是不是自己人"的判断标准 |
| `Symbol.toStringTag` | 定义 toString 结果 | `Object.prototype.toString` | 规定"你们是谁"的回答方式 |
| `Symbol.species` | 定义派生对象的构造函数 | `map`、`filter`等返回值 | 规定"复制出来的东西用什么模具" |
| `Symbol.isConcatSpreadable` | 定义 concat 是否展开 | `concat()` | 规定"拼盘时你是一道菜还是一组菜" |

---

## 第21章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| 元编程 | 写代码来控制代码本身的行为 | 给厨房装监控系统，拦截和控制一切操作 |
| Proxy | 给对象套一层拦截器 | 厨房门口的智能门禁系统 |
| Proxy get | 拦截读取属性 | 有人来查看食材，保安先拦截 |
| Proxy set | 拦截设置属性 | 有人来放东西，保安先检查 |
| Proxy has | 拦截 in 操作符 | 有人问有没有这个食材 |
| Proxy apply | 拦截函数调用 | 有人要借厨师，保安先登记 |
| Proxy construct | 拦截 new 操作符 | 有人要开新分店，保安先登记 |
| Reflect | 标准化的对象操作方法 | 保安手里的标准操作手册 |
| Reflect.get/set/has | 标准化操作，与 Proxy 一一对应 | 手册上的标准流程 |
| Proxy + Reflect | 配合使用，正确传递 this | 保安按手册操作，不出错 |
| 响应式系统 | Proxy 监控数据变化，自动触发更新 | 菜单价格一改，所有屏幕自动更新 |
| Symbol.iterator | 让对象可以被 for...of 遍历 | 规定顾客参观厨房的路线 |
| Symbol.toPrimitive | 控制对象转成基本类型的行为 | 规定"多少钱"的回答方式 |
| Symbol.hasInstance | 控制 instanceof 的行为 | 规定"是不是自己人"的判断标准 |
| Symbol.toStringTag | 控制 toString 的结果 | 规定"你们是谁"的回答方式 |
| Symbol.species | 控制派生对象的构造函数 | 规定复制出来的东西用什么模具 |
| Symbol.isConcatSpreadable | 控制 concat 是否展开 | 拼盘时你是一道菜还是一组菜 |
