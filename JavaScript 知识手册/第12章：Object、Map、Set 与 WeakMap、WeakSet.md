# 第12章：Object、Map、Set 与 WeakMap、WeakSet

## 12.1 Object 详解

**一句话解释：**
Object 是 JS 中最基本的键值对数据结构，几乎所有复杂数据都基于它。键是字符串（或 Symbol），值可以是任何类型。

**餐厅比喻：**
Object 就像一张**手写的便签纸**——你可以随意在上面写标签和内容，但标签只能是文字（字符串），而且你得自己数一数上面写了多少条、挨个翻才能找。

### 增删改查

~~~javascript
// ========== 创建 ==========
const 菜品 = {
  名字: "红烧肉",
  价格: 38,
  类型: "热菜"
};

// ========== 读取 ==========
console.log(菜品.名字);         // 红烧肉（点语法）
console.log(菜品["价格"]);      // 38（方括号语法）
const 属性名 = "类型";
console.log(菜品[属性名]);      // 热菜（方括号可以用变量）

// 访问不存在的属性
console.log(菜品.厨师);         // undefined

// ========== 添加 / 修改 ==========
菜品.厨师 = "张师傅";           // 添加新属性
菜品.价格 = 42;                 // 修改已有属性
菜品["是否推荐"] = true;       // 方括号添加

// ========== 删除 ==========
delete 菜品.是否推荐;
console.log(菜品.是否推荐);     // undefined

// ========== 判断属性是否存在 ==========
console.log("名字" in 菜品);              // true
console.log("toString" in 菜品);          // true（原型链上的也算）
console.log(菜品.hasOwnProperty("名字"));  // true（只检查自身）
console.log(Object.hasOwn(菜品, "名字"));  // true（ES2022 推荐写法）
~~~

### 遍历

~~~javascript
const 菜品 = { 名字: "红烧肉", 价格: 38, 类型: "热菜" };

// ========== Object.keys：所有键名（数组） ==========
console.log(Object.keys(菜品));     // ["名字", "价格", "类型"]

// ========== Object.values：所有值（数组） ==========
console.log(Object.values(菜品));   // ["红烧肉", 38, "热菜"]

// ========== Object.entries：所有键值对（二维数组） ==========
console.log(Object.entries(菜品));
// [["名字", "红烧肉"], ["价格", 38], ["类型", "热菜"]]

// ========== 遍历方式对比 ==========

// for...in（会遍历原型链）
for (const 键 in 菜品) {
  if (菜品.hasOwnProperty(键)) {  // 需要手动过滤原型属性
    console.log(`${键}: ${菜品[键]}`);
  }
}

// Object.entries + for...of（推荐）
for (const [键, 值] of Object.entries(菜品)) {
  console.log(`${键}: ${值}`);
}
// 名字: 红烧肉
// 价格: 38
// 类型: 热菜
~~~

### Object 常用方法

~~~javascript
// ========== Object.assign：合并对象 ==========
const 基础信息 = { 名字: "红烧肉" };
const 价格信息 = { 价格: 38 };
const 附加信息 = { 厨师: "张师傅", 评分: 4.8 };

const 完整信息 = Object.assign({}, 基础信息, 价格信息, 附加信息);
console.log(完整信息);
// { 名字: "红烧肉", 价格: 38, 厨师: "张师傅", 评分: 4.8 }

// 展开运算符（更常用，效果一样）
const 完整信息2 = { ...基础信息, ...价格信息, ...附加信息 };

// ========== Object.fromEntries：entries 的逆操作 ==========
const 键值对 = [["名字", "红烧肉"], ["价格", 38], ["类型", "热菜"]];
const 还原对象 = Object.fromEntries(键值对);
console.log(还原对象);
// { 名字: "红烧肉", 价格: 38, 类型: "热菜" }

// ========== Object.freeze：冻结对象（不能增删改） ==========
const 固定菜单 = Object.freeze({ 红烧肉: 38, 麻婆豆腐: 22 });
固定菜单.红烧肉 = 100;     // 静默失败（严格模式下报错）
固定菜单.新菜 = 50;        // 静默失败
console.log(固定菜单.红烧肉); // 38（没变）

// ========== Object.seal：封闭对象（不能增删，但能改现有属性） ==========
const 封闭菜单 = Object.seal({ 红烧肉: 38 });
封闭菜单.红烧肉 = 42;       // ✅ 可以改
封闭菜单.新菜 = 50;          // ❌ 不能加新属性
delete 封闭菜单.红烧肉;      // ❌ 不能删
console.log(封闭菜单.红烧肉); // 42（被改了）

// ========== Object.create：创建以指定对象为原型的新对象 ==========
const 总店 = { 品牌: "老王饭馆" };
const 分店 = Object.create(总店);
分店.名字 = "北京店";
console.log(分店.品牌);      // 老王饭馆（从原型上找到的）

// ========== Object.groupBy：ES2024，按条件分组 ==========
const 所有菜 = [
  { 名字: "红烧肉", 类型: "热菜" },
  { 名字: "拍黄瓜", 类型: "凉菜" },
  { 名字: "麻婆豆腐", 类型: "热菜" }
];
const 分组 = Object.groupBy(所有菜, 菜 => 菜.类型);
console.log(分组);
// { 热菜: [{...}, {...}], 凉菜: [{...}] }
~~~

---

## 12.2 Map 详解

**一句话解释：**
Map 是键值对集合，**任何类型的值都可以做键**（对象、函数、数字、字符串……），并且**记住插入顺序**。

**餐厅比喻：**
Map 就像一个**高级对应板**——桌号可以是数字（`1`），可以是文字（`VIP包间`），甚至可以是一个**真实桌子的引用**（对象）。不管用什么做标签，都能对应到负责的服务员。

### 基本操作

~~~javascript
// ========== 创建 ==========
const 桌号服务员 = new Map();

// ========== set(键, 值)：添加/修改 ==========
桌号服务员.set(1, "小王")
          .set(2, "小李")
          .set("VIP包间", "小张")
          .set(true, "今日值班经理");  // 键可以是布尔值！
// 支持链式调用

// ========== get(键)：获取值 ==========
console.log(桌号服务员.get(1));          // 小王
console.log(桌号服务员.get("VIP包间"));  // 小张
console.log(桌号服务员.get(999));         // undefined（不存在的键）

// ========== has(键)：包含这个键吗？ ==========
console.log(桌号服务员.has(1));           // true
console.log(桌号服务员.has(999));          // false

// ========== delete(键)：删除 ==========
桌号服务员.delete(2);                     // true（返回是否删除成功）

// ========== size：大小 ==========
console.log(桌号服务员.size);             // 3

// ========== clear：清空 ==========
桌号服务员.clear();
console.log(桌号服务员.size);             // 0
~~~

### 对象做键

~~~javascript
// ========== Map 的核心优势：任何类型都能做键 ==========
const 包间A = { 名字: "牡丹厅" };
const 包间B = { 名字: "玫瑰厅" };

const 预约信息 = new Map();
预约信息.set(包间A, { 客人: "张先生", 时间: "18:00" });
预约信息.set(包间B, { 客人: "李女士", 时间: "19:00" });

console.log(预约信息.get(包间A));  // { 客人: "张先生", 时间: "18:00" }
console.log(预约信息.get(包间B));  // { 客人: "李女士", 时间: "19:00" }

// ========== 函数做键 ==========
const 处理函数 = new Map();
处理函数.set("红烧肉", function(份量) { return `做${份量}份红烧肉`; });
处理函数.set("麻婆豆腐", function(份量) { return `做${份量}份麻婆豆腐`; });

const 做红烧肉 = 处理函数.get("红烧肉");
console.log(做红烧肉(3));  // 做3份红烧肉
~~~

### 遍历

~~~javascript
const 菜品价格 = new Map([
  ["红烧肉", 38],
  ["麻婆豆腐", 22],
  ["糖醋里脊", 45]
]);

// ========== forEach ==========
菜品价格.forEach((价格, 菜名) => {
  console.log(`${菜名}：${价格}元`);
});

// ========== for...of（Map 自带迭代器） ==========
for (const [菜名, 价格] of 菜品价格) {
  console.log(`${菜名}：${价格}元`);
}
// 红烧肉：38元
// 麻婆豆腐：22元
// 糖醋里脊：45元

// ========== keys / values / entries ==========
console.log([...菜品价格.keys()]);     // ["红烧肉", "麻婆豆腐", "糖醋里脊"]
console.log([...菜品价格.values()]);   // [38, 22, 45]
console.log([...菜品价格.entries()]);  // [["红烧肉", 38], ...]
~~~

---

## 12.3 Set 详解

**一句话解释：**
Set 是**值的集合**，特点是**自动去重**——同一个值只能出现一次。

**餐厅比喻：**
Set 就像一个**自动去重的签到表**——同一个人签到10次，名单上也只会出现一次。

### 基本操作

~~~javascript
// ========== 创建 ==========
const 食材集合 = new Set(["猪肉", "豆腐", "辣椒", "猪肉", "豆腐"]);
console.log(食材集合);  // Set { "猪肉", "豆腐", "辣椒" }（自动去重了）

// ========== add(值)：添加 ==========
食材集合.add("花椒");
食材集合.add("猪肉");  // 重复添加，无效
console.log(食材集合);   // Set { "猪肉", "豆腐", "辣椒", "花椒" }

// ========== has(值)：包含吗？ ==========
console.log(食材集合.has("猪肉"));   // true
console.log(食材集合.has("龙虾"));   // false

// ========== delete(值)：删除 ==========
食材集合.delete("辣椒");

// ========== size：大小 ==========
console.log(食材集合.size);          // 3

// ========== clear：清空 ==========
食材集合.clear();
~~~

### 数组去重

~~~javascript
// ========== Set 最常见的用法：数组去重 ==========
const 重复 = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
const 去重 = [...new Set(重复)];
console.log(去重);  // [1, 2, 3, 4]

const 重复菜名 = ["红烧肉", "麻婆豆腐", "红烧肉", "糖醋里脊", "麻婆豆腐"];
const 去重菜名 = [...new Set(重复菜名)];
console.log(去重菜名);  // ["红烧肉", "麻婆豆腐", "糖醋里脊"]
~~~

### 集合运算

~~~javascript
const A = new Set([1, 2, 3, 4]);
const B = new Set([3, 4, 5, 6]);

// ========== 交集（两个都有的） ==========
const 交集 = new Set([...A].filter(x => B.has(x)));
console.log(交集);  // Set { 3, 4 }

// ========== 并集（合在一起去重） ==========
const 并集 = new Set([...A, ...B]);
console.log(并集);  // Set { 1, 2, 3, 4, 5, 6 }

// ========== 差集（A有B没有） ==========
const 差集 = new Set([...A].filter(x => !B.has(x)));
console.log(差集);  // Set { 1, 2 }

// ========== 对称差集（只在一个里的） ==========
const 对称差集 = new Set(
  [...A].filter(x => !B.has(x)).concat([...B].filter(x => !A.has(x)))
);
console.log(对称差集);  // Set { 1, 2, 5, 6 }

// ========== 实际应用：查重 ==========
const 今日已点 = new Set(["红烧肉", "麻婆豆腐"]);
const 新点的菜 = "红烧肉";

if (今日已点.has(新点的菜)) {
  console.log(`"${新点的菜}"已经点过了！`);
} else {
  今日已点.add(新点的菜);
  console.log(`已添加"${新点的菜}"`);
}
// "红烧肉"已经点过了！
~~~

### 遍历

~~~javascript
const 食材 = new Set(["猪肉", "豆腐", "辣椒", "花椒"]);

// for...of
for (const 值 of 食材) {
  console.log(值);
}
// 猪肉
// 豆腐
// 辣椒
// 花椒

// forEach
食材.forEach((值) => {
  console.log(值);
});

// keys / values / entries
console.log([...食材.keys()]);    // ["猪肉", "豆腐", "辣椒", "花椒"]
console.log([...食材.values()]);  // ["猪肉", "豆腐", "辣椒", "花椒"]（key 和 value 一样）
console.log([...食材.entries()]); // [["猪肉","猪肉"], ["豆腐","豆腐"], ...]
~~~

---

## 12.4 三者全面对比

| | Object | Map | Set |
|---|---|---|---|
| 存储内容 | 键值对 | 键值对 | 只存值（自动去重） |
| 键的类型 | 字符串 / Symbol | **任何类型** | 无键（只有值） |
| 遍历顺序 | 不保证（非数字键按插入顺序） | **保证插入顺序** | **保证插入顺序** |
| 大小 | `Object.keys(obj).length` | `map.size` | `set.size` |
| 遍历 | `for...in` / `Object.keys` | `for...of` / `.forEach` | `for...of` / `.forEach` |
| 查找性能 | 慢（需要遍历） | **快**（哈希表） | **快**（哈希表） |
| 可序列化 | ✅ `JSON.stringify` | ❌ 需手动转换 | ❌ 需手动转换 |
| 原型链 | 有（可能被污染） | **没有** | **没有** |
| 餐厅比喻 | 手写便签纸 | 高级对应板 | 自动去重签到表 |

~~~javascript
// ========== Object vs Map：什么时候用谁？ ==========

// 用 Object：简单的键值对、需要 JSON 序列化
const 配置 = { 主题: "深色", 字号: 16 };
const JSON字符串 = JSON.stringify(配置);  // ✅

// 用 Map：键不是字符串、需要频繁增删、需要知道大小
const 用户会话 = new Map();
const 用户对象 = { 名字: "小李" };
用户会话.set(用户对象, { 登录时间: Date.now() });  // ✅ 对象做键
用户会话.size;  // ✅ 直接知道大小
用户会话.delete(用户对象);  // ✅ 高效删除
~~~

### Map/Object 互转 / Set/Array 互转

~~~javascript
// ========== Map ↔ Object ==========
const 映射 = new Map([["红烧肉", 38], ["麻婆豆腐", 22]]);

// Map → Object
const 对象 = Object.fromEntries(映射);
console.log(对象);  // { 红烧肉: 38, 麻婆豆腐: 22 }

// Object → Map
const 映射2 = new Map(Object.entries(对象));
console.log(映射2);  // Map { "红烧肉" => 38, "麻婆豆腐" => 22 }

// ========== Set ↔ Array ==========
const 集合 = new Set([1, 2, 3, 4, 5]);

// Set → Array
const 数组 = [...集合];
console.log(数组);  // [1, 2, 3, 4, 5]

// Array → Set
const 集合2 = new Set([1, 2, 2, 3, 3]);
console.log(集合2);  // Set { 1, 2, 3 }
~~~

---

## 12.5 WeakMap / WeakSet

**一句话解释：**
WeakMap 和 WeakSet 的键（WeakMap）或值（WeakSet）是**弱引用**——如果没有其他地方引用这个对象，垃圾回收器会**自动回收**它，WeakMap/WeakSet 里的对应记录也会消失。用来**防止内存泄漏**。

**餐厅比喻：**
- **普通 Map** = 用铁钉把便利贴钉在桌子上——桌子搬走了，便利贴还在
- **WeakMap** = 用磁铁把便利贴吸在冰箱上——冰箱搬走了，便利贴**自动掉落**

### WeakMap

~~~javascript
// ========== 基本用法 ==========
const 餐厅信息 = new WeakMap();

const 老王饭馆 = { 名字: "老王饭馆" };
const 老李饭馆 = { 名字: "老李饭馆" };

餐厅信息.set(老王饭馆, { 日流水: 8500, 员工数: 12 });
餐厅信息.set(老李饭馆, { 日流水: 6200, 员工数: 8 });

console.log(餐厅信息.get(老王饭馆));  // { 日流水: 8500, 员工数: 12 }
console.log(餐厅信息.has(老李饭馆));  // true

// ========== WeakMap 的限制 ==========
// 1. 键必须是对象
// 餐厅信息.set("字符串键", {});  // ❌ TypeError: Invalid value used as weak map key

// 2. 不能遍历（没有 keys/values/entries/forEach/size）
// for (const x of 餐厅信息) {}  // ❌ TypeError
// 餐厅信息.size                  // undefined

// 3. 只有 get/set/has/delete 四个方法
~~~

### WeakMap 的实际应用

~~~javascript
// ========== 应用1：给对象附加额外数据（不修改对象本身） ==========
const 菜品状态 = new WeakMap();

function 标记已售完(菜品) {
  菜品状态.set(菜品, { 售完时间: new Date(), 原因: "食材用完" });
}

function 是否售完(菜品) {
  return 菜品状态.has(菜品);
}

const 红烧肉 = { 名字: "红烧肉", 价格: 38 };
标记已售完(红烧肉);
console.log(是否售完(红烧肉));  // true

// 当红烧肉对象不再被引用时，WeakMap 中的记录会自动被垃圾回收

// ========== 应用2：缓存计算结果（对象被回收时缓存自动清理） ==========
function 创建缓存(fn) {
  const 缓存 = new WeakMap();  // WeakMap 做缓存

  return function(对象参数) {
    if (缓存.has(对象参数)) {
      return 缓存.get(对象参数);  // 有缓存直接返回
    }
    const 结果 = fn(对象参数);
    缓存.set(对象参数, 结果);     // 没有缓存就计算并存起来
    return 结果;
  };
}

const 计算统计 = 创建缓存(function(数据对象) {
  console.log("执行了一次复杂计算");
  return 数据对象.values.reduce((a, b) => a + b, 0);
});

const 数据 = { values: [10, 20, 30, 40, 50] };
console.log(计算统计(数据));  // 执行了一次复杂计算 → 150
console.log(计算统计(数据));  // 150（直接从缓存取，不重新计算）

// 当 数据 不再被引用时，WeakMap 中的缓存会自动被垃圾回收
~~~

### WeakSet

~~~javascript
// ========== 基本用法 ==========
const 已检查 = new WeakSet();

const 菜品1 = { 名字: "红烧肉" };
const 菜品2 = { 名字: "麻婆豆腐" };

已检查.add(菜品1);
已检查.add(菜品2);
已检查.add(菜品1);  // 重复添加，无效

console.log(已检查.has(菜品1));  // true
console.log(已检查.has(菜品2));  // true

// ========== WeakSet 的限制 ==========
// 1. 值必须是对象
// 已检查.add("字符串");  // ❌ TypeError

// 2. 不能遍历，没有 size
// for (const x of 已检查) {}  // ❌

// 3. 只有 add/has/delete 三个方法

// ========== 实际应用：标记已处理的对象 ==========
const 已出餐 = new WeakSet();

function 出餐处理(订单) {
  if (已出餐.has(订单)) {
    console.log("这个订单已经出过了！");
    return;
  }
  已出餐.add(订单);
  console.log(`${订单.菜品}出餐完成`);
}

const 订单1 = { 桌号: 3, 菜品: "红烧肉" };
const 订单2 = { 桌号: 5, 菜品: "麻婆豆腐" };

出餐处理(订单1);  // 红烧肉出餐完成
出餐处理(订单2);  // 麻婆豆腐出餐完成
出餐处理(订单1);  // 这个订单已经出过了！

// 订单1 被回收后，WeakSet 中的标记自动消失，不会造成内存泄漏
~~~

### WeakMap/WeakSet vs Map/Set 对比

| | Map / Set | WeakMap / WeakSet |
|---|---|---|
| 键/值的类型 | 任何类型 | **必须是对象** |
| 引用方式 | 强引用（阻止垃圾回收） | **弱引用（不阻止垃圾回收）** |
| 可遍历 | ✅ 可以 | ❌ 不可以 |
| 有 size | ✅ 有 | ❌ 没有 |
| 方法 | 全套（forEach/keys/values...） | 只有基础（get/set/has/delete） |
| 内存泄漏风险 | 有（忘记删除会一直占内存） | **没有（自动回收）** |
| 餐厅比喻 | 铁钉钉的便利贴 | 磁铁吸的便利贴 |
| 适合场景 | 需要遍历、需要知道大小 | 给对象附加数据、缓存、标记 |

---

## 第12章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| Object | 基本键值对，键是字符串/Symbol | 手写便签纸 |
| Object.keys/values/entries | 获取键名/值/键值对数组 | 翻看便签上的标签/内容/全部 |
| Object.assign / 展开运算符 | 合并对象 | 把几张便签合并成一张 |
| Object.freeze | 冻结（不能增删改） | 用玻璃封起来 |
| Object.seal | 封闭（不能增删，能改） | 用胶带封口，能改但不能加减 |
| Object.fromEntries | entries 的逆操作 | 从清单还原成便签 |
| Map | 键值对，任何类型都能做键，保证顺序 | 高级对应板 |
| Map.set/get/has/delete/size | 基本操作 | 写/读/查/删/数 |
| Map vs Object | Map 更灵活，Object 更通用 | 高级对应板 vs 手写便签 |
| Set | 值的集合，自动去重 | 自动去重签到表 |
| Set.add/has/delete/size | 基本操作 | 签到/查/删/数 |
| Set 去重 | `[...new Set(数组)]` | 名字重复只留一个 |
| 集合运算 | 交集/并集/差集 | 两份名单取共同/合并/差异 |
| WeakMap | 弱引用键值对，键必须是对象 | 磁铁吸的便利贴，冰箱搬走自动掉 |
| WeakSet | 弱引用集合，值必须是对象 | 自动消失的签到记录 |
| WeakMap/WeakSet 优势 | 自动垃圾回收，不内存泄漏 | 东西没了记录就自动消失 |
| WeakMap 应用 | 附加数据、缓存、标记 | 给对象挂不修改自身的额外信息 |
