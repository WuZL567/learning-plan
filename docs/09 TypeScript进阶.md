# TypeScript 进阶：从类型基础到 Vue3 实践的完整思考路径

## 核心策略：TypeScript 的 4 个套路

~~~
套路1：类型基础          → 基本类型 / 类型推断 / 类型断言 / 类型守卫
套路2：泛型与工具类型    → 泛型函数 / Partial / Pick / Omit / ReturnType
套路3：高级类型          → 联合类型 / 交叉类型 / 条件类型 / 模板字面量类型
套路4：工程实践          → TS 在 Vue3 中的实践 / 声明文件编写
~~~

---

## 套路一：类型基础

### TypeScript 的核心价值

~~~
TypeScript = JavaScript + 类型系统

解决什么问题？
  JavaScript 是动态类型 → 运行时才发现类型错误
  TypeScript 是静态类型 → 编译时就发现类型错误

  JavaScript：const 名字 = "红烧肉"; 名字 = 42; // 运行时不出错，但逻辑错了
  TypeScript：const 名字: string = "红烧肉"; 名字 = 42; // 编译时报错 ✅
~~~

### 基本类型

~~~javascript
// ========== 基本类型 ==========
let 名字: string = "红烧肉";
let 价格: number = 38;
let 是否辣: boolean = false;
let 空值: null = null;
let 未定义: undefined = undefined;
let 唯一值: symbol = Symbol("id");
let 大数: bigint = 100n;

// ========== 数组类型 ==========
let 菜品们: string[] = ["红烧肉", "麻婆豆腐"];
let 价格们: Array<number> = [38, 22];  // 泛型写法

// ========== 元组（固定长度和类型的数组） ==========
let 菜品元组: [string, number] = ["红烧肉", 38];

// ========== 对象类型 ==========
let 菜品: { 名字: string; 价格: number; 是否辣?: boolean } = {
  名字: "红烧肉",
  价格: 38
  // 是否辣 是可选的（? 表示可选）

// ========== 枚举 ==========
enum 菜品类型 {
  热菜 = "热菜",
  凉菜 = "凉菜",
  汤类 = "汤类"
}
let 类型: 菜品类型 = 菜品类型.热菜;

// ========== any / unknown / never / void ==========
let 任意值: any = "字符串";     // 任意类型（关闭类型检查，尽量少用）
let 未知值: unknown = "字符串"; // 未知类型（安全的 any，使用前必须类型检查）
let 永远不: never;              // 永远不会有值（函数抛异常或无限循环）
let 无返回: void;               // 函数没有返回值
~~~

### 类型推断

~~~
类型推断 = TypeScript 自动推断变量的类型，不需要手动标注

  const 名字 = "红烧肉";  // TS 自动推断为 string
  const 价格 = 38;         // TS 自动推断为 number
  const 菜品 = { 名字: "红烧肉", 价格: 38 };  // TS 自动推断为 { 名字: string; 价格: number }

什么时候需要手动标注？
  1. 函数参数（TS 无法推断参数类型）
  2. 函数返回值（复杂函数可能推断不准）
  3. 变量声明时没有立即赋值
~~~

### 类型断言

**手写口诀：类型断言 = 告诉 TS "我比你更清楚这个值的类型"**

~~~javascript
// ========== as 语法（推荐） ==========
const 输入框 = document.getElementById("搜索") as HTMLInputElement;
输入框.value = "红烧肉";  // TS 知道输入框有 value 属性

// ========== 尖括号语法（JSX 中不能用） ==========
const 输入框2 = <HTMLInputElement>document.getElementById("搜索");

// ========== 非空断言 ! ==========
const 元素 = document.getElementById("app")!;
// 告诉 TS：这个元素一定不是 null
// 如果真的是 null，运行时会报错

// ========== 类型断言 vs 类型守卫 ==========
// 类型断言（as）：强制告诉编译器类型，不做运行时检查
//   → 你对类型负责，如果错了运行时会出问题
//   → 适合你确定类型的情况（如 DOM 操作）

// 类型守卫：在运行时检查类型，编译器自动收窄类型
//   → 代码对类型负责，更安全
//   → 适合不确定类型的情况（如 API 返回值）
~~~

### 类型守卫

**手写口诀：在运行时检查类型，TS 自动收窄类型范围**

~~~javascript
// ========== typeof 类型守卫 ==========
function 处理值(值: string | number) {
  if (typeof 值 === "string") {
    // TS 知道这里 值 是 string
    console.log(值.toUpperCase());
  } else {
    // TS 知道这里 值 是 number
    console.log(值.toFixed(2));
  }
}

// ========== instanceof 类型守卫 ==========
function 处理日期(值: Date | string) {
  if (值 instanceof Date) {
    // TS 知道这里 值 是 Date
    console.log(值.getFullYear());
  } else {
    // TS 知道这里 值 是 string
    console.log(值.length);
  }
}

// ========== in 类型守卫 ==========
interface 菜品 { 名字: string; 价格: number; }
interface 饮品 { 名字: string; 容量: number; }

function 处理商品(商品: 菜品 | 饮品) {
  if ("价格" in 商品) {
    // TS 知道这里 商品 是 菜品
    console.log(商品.价格);
  } else {
    // TS 知道这里 商品 是 饮品
    console.log(商品.容量);
  }
}

// ========== 自定义类型守卫（类型谓词） ==========
function 是菜品(商品: 菜品 | 饮品): 商品 is 菜品 {
  return "价格" in 商品;
}

function 处理商品2(商品: 菜品 | 饮品) {
  if (是菜品(商品)) {
    console.log(商品.价格);  // TS 知道是 菜品
  }
}

// ========== 字面量类型守卫 ==========
type 结果 = { 状态: "成功"; 数据: string } | { 状态: "失败"; 错误: string };

function 处理结果(结果: 结果) {
  if (结果.状态 === "成功") {
    console.log(结果.数据);   // TS 知道有 数据 属性
  } else {
    console.log(结果.错误);   // TS 知道有 错误 属性
  }
}
~~~

### interface vs type

| | interface | type |
|---|---|---|
| 定义对象 | ✅ 推荐 | ✅ 可以 |
| 定义联合类型 | ❌ 不行 | ✅ 可以 |
| 定义基本类型别名 | ❌ 不行 | ✅ 可以（type ID = string） |
| 继承/扩展 | extends 继承 | & 交叉类型 |
| 声明合并 | ✅ 同名自动合并 | ❌ 不行 |
| 实现（implements） | ✅ 类可以实现 | ✅ 类可以实现 |

~~~javascript
// ========== interface ==========
interface 菜品 {
  名字: string;
  价格: number;
}

interface 特价菜品 extends 菜品 {
  折扣: number;
}

// 声明合并（同名 interface 自动合并）
interface 菜品 {
  描述?: string;  // 菜品 接口新增了 描述 属性
}

// ========== type ==========
type 菜品ID = string;  // 基本类型别名

type 菜品2 = {
  名字: string;
  价格: number;
};

type 结果 = 菜品2 | 饮品;  // 联合类型（interface 不行）

type 特价菜品2 = 菜品2 & { 折扣: number };  // 交叉类型
~~~

---

## 套路二：泛型与工具类型

### 泛型基础

**手写口诀：泛型 = 类型的"参数"，调用时再确定具体类型**

~~~javascript
// ========== 泛型函数 ==========
// 不用泛型：要为每种类型写一个函数
function 返回字符串(值: string): string { return 值; }
function 返回数字(值: number): number { return 值; }

// 用泛型：一个函数适用所有类型
function 返回值<T>(值: T): T { return 值; }

返回值<string>("红烧肉");  // T = string
返回值<number>(38);         // T = number
返回值("红烧肉");           // TS 自动推断 T = string

// ========== 泛型接口 ==========
interface API响应<T> {
  状态码: number;
  消息: string;
  数据: T;
}

const 菜品响应: API响应<菜品> = {
  状态码: 200,
  消息: "成功",
  数据: { 名字: "红烧肉", 价格: 38 }
};

const 列表响应: API响应<菜品[]> = {
  状态码: 200,
  消息: "成功",
  数据: [
    { 名字: "红烧肉", 价格: 38 },
    { 名字: "麻婆豆腐", 价格: 22 }
  ]
};

// ========== 泛型约束 ==========
function 获取长度<T extends { length: number }>(值: T): number {
  return 值.length;
}

获取长度("红烧肉");     // ✅ string 有 length
获取长度([1, 2, 3]);    // ✅ array 有 length
// 获取长度(38);        // ❌ number 没有 length

// ========== 多个泛型参数 ==========
function 合并<T, U>(对象1: T, 对象2: U): T & U {
  return { ...对象1, ...对象2 };
}

const 结果 = 合并({ 名字: "红烧肉" }, { 价格: 38 });
// 结果 的类型是 { 名字: string } & { 价格: number }
~~~

### 泛型函数实战

~~~typescript
// 场景1：通用的数据获取函数
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json() as Promise<T>;
}

// 使用时指定返回类型
interface User { id: number; name: string; }
const user = await fetchData<User>('/api/user/1');
console.log(user.name); // 类型安全，TS 知道 user 是 User 类型

// 场景2：获取对象属性（类型安全的 lodash.get）
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: '老王', age: 25 };
getProperty(person, 'name'); // ✅ 返回类型是 string
getProperty(person, 'age');  // ✅ 返回类型是 number
// getProperty(person, 'email'); // ❌ 编译报错

// 场景3：交换两个值（约束两个参数类型必须相同）
function swap<T>(a: T, b: T): [T, T] {
  return [b, a];
}
swap(1, 2);           // ✅ [number, number]
swap('a', 'b');       // ✅ [string, string]
// swap(1, 'a');      // ❌ 类型不匹配
~~~

### 泛型默认值

~~~typescript
// 给泛型参数设置默认值（和函数参数默认值类似）
interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 不指定 T，用默认值 any
const res1: PaginatedResponse = { data: [1, 2, 3], total: 100, page: 1, pageSize: 10 };

// 指定 T
interface Dish { id: number; name: string; }
const res2: PaginatedResponse<Dish> = { data: [{ id: 1, name: "红烧肉" }], total: 50, page: 1, pageSize: 10 };
// res2.data[0].name // ✅ 类型安全

// 多个泛型参数，后面的有默认值
interface Cache<T, Meta = { timestamp: number }> {
  data: T;
  meta: Meta;
}
~~~

### 手写工具类型

**手写口诀：Partial 改可选，Readonly 改只读，Pick/Omit 取/删子集**

~~~javascript
// ========== Partial<T>：所有属性变可选 ==========
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

interface 菜品 {
  名字: string;
  价格: number;
  类型: string;
}

type 可选菜品 = MyPartial<菜品>;
// 等同于 { 名字?: string; 价格?: number; 类型?: string }

// 用途：更新操作只需要传变化的字段
function 更新菜品(id: string, 更新: MyPartial<菜品>) {
  // ...
}
更新菜品("1", { 价格: 45 });  // ✅ 只传要更新的字段

// ========== Readonly<T>：所有属性变只读 ==========
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type 只读菜品 = MyReadonly<菜品>;
const 菜品: 只读菜品 = { 名字: "红烧肉", 价格: 38, 类型: "热菜" };
// 菜品.名字 = "改了";  // ❌ 只读属性不能修改

// ========== Pick<T, K>：从 T 中选取部分属性 ==========
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type 菜品简要 = MyPick<菜品, "名字" | "价格">;
// 等同于 { 名字: string; 价格: number }

// ========== Omit<T, K>：从 T 中排除部分属性 ==========
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

type 菜品无类型 = MyOmit<菜品, "类型">;
// 等同于 { 名字: string; 价格: number }

// ========== Record<K, V>：构造一个属性名为 K、属性值为 V 的对象类型 ==========
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

type 菜品价格表 = MyRecord<string, number>;
// 等同于 { [key: string]: number }

const 价格表: 菜品价格表 = {
  红烧肉: 38,
  麻婆豆腐: 22
};

// ========== Exclude<T, U>：从联合类型 T 中排除可以赋值给 U 的类型 ==========
type MyExclude<T, U> = T extends U ? never : T;

type 类型 = "热菜" | "凉菜" | "汤类";
type 非汤类 = MyExclude<类型, "汤类">;
// 等同于 "热菜" | "凉类"

// ========== Extract<T, U>：从联合类型 T 中提取可以赋值给 U 的类型 ==========
type MyExtract<T, U> = T extends U ? T : never;

type 只要热菜 = MyExtract<类型, "热菜">;
// 等同于 "热菜"

// ========== NonNullable<T>：从 T 中排除 null 和 undefined ==========
type MyNonNullable<T> = T extends null | undefined ? never : T;

type 可能为空 = string | null | undefined;
type 不为空 = MyNonNullable<可能为空>;
// 等同于 string

// ========== ReturnType<T>：获取函数返回值类型 ==========
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function 获取菜品(): 菜品 {
  return { 名字: "红烧肉", 价格: 38, 类型: "热菜" };
}

type 菜品类型2 = MyReturnType<typeof 获取菜品>;
// 等同于 菜品

// ========== Parameters<T>：获取函数参数类型（元组） ==========
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

function 点菜(菜名: string, 数量: number): string {
  return `点了${数量}份${菜名}`;
}

type 点菜参数 = MyParameters<typeof 点菜>;
// 等同于 [菜名: string, 数量: number]

// ========== Required<T>：所有属性变必填 ==========
type MyRequired<T> = {
  [K in keyof T]-?: T[K]; // -? 移除可选修饰符
};

interface Options {
  timeout?: number;
  retries?: number;
  host?: string;
}
type RequiredOptions = MyRequired<Options>;
// { timeout: number; retries: number; host: string; }
~~~

### 条件类型

**手写口诀：T extends U ? X : Y — 如果 T 是 U 的子类型，返回 X，否则返回 Y**

~~~javascript
// ========== 基本条件类型 ==========
type 是字符串<T> = T extends string ? "是字符串" : "不是字符串";

type 测试1 = 是字符串<string>;   // "是字符串"
type 测试2 = 是字符串<number>;   // "不是字符串"
type 测试3 = 是字符串<"红烧肉">; // "是字符串"（字面量类型是 string 的子类型）

// ========== 条件类型 + infer ==========
// infer = 在条件类型中"推断"某个位置的类型

// 推断数组元素类型
type 数组元素<T> = T extends (infer U)[] ? U : never;
type 元素1 = 数组元素<string[]>;    // string
type 元素2 = 数组元素<number[]>;    // number

// 推断 Promise 的值类型
type Promise值<T> = T extends Promise<infer U> ? U : T;
type 值1 = Promise值<Promise<string>>;  // string
type 值2 = Promise值<number>;            // number（不是 Promise，直接返回）

// 推断函数返回值类型（前面写过了）
type 返回值<T> = T extends (...args: any[]) => infer R ? R : never;

// ========== 分布式条件类型 ==========
// 当 T 是联合类型时，条件类型会"分发"到每个成员

type 转字符串<T> = T extends string ? string : never;
type 结果 = 转字符串<string | number | boolean>;
// 等同于 转字符串<string> | 转字符串<number> | 转字符串<boolean>
// 等同于 string | never | never
// 等同于 string
~~~

### 分配条件类型（方括号阻止分配）

~~~typescript
// 如果不想分配，用方括号包起来
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]

// 对比分配版本：
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]

// 区别：
// 分配：string[] | number[]  → 要么是字符串数组，要么是数字数组
// 不分配：(string | number)[] → 一个数组里既有字符串又有数字
~~~

### infer 高级实战

~~~typescript
// 场景1：提取 Promise 内部类型（支持嵌套 Promise）
type DeepUnwrapPromise<T> = T extends Promise<infer U>
  ? DeepUnwrapPromise<U>  // 递归提取
  : T;

type D1 = DeepUnwrapPromise<Promise<string>>;                        // string
type D2 = DeepUnwrapPromise<Promise<Promise<number>>>;               // number
type D3 = DeepUnwrapPromise<Promise<Promise<Promise<boolean>>>>;     // boolean

// 场景2：提取构造函数的实例类型
type InstanceType2<T> = T extends new (...args: any[]) => infer R ? R : any;

class Restaurant { name = "老王饭馆"; }
type I1 = InstanceType2<typeof Restaurant>; // Restaurant

// 场景3：提取字符串模板的某一部分
type ExtractRoute<T> = T extends `/${infer Rest}` ? Rest : never;
type Route = ExtractRoute<"/users/123">; // "users/123"

// 场景4：提取函数第一个参数类型
type FirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type FP = FirstParam<(name: string, age: number) => void>; // string

// 场景5：提取 Vue3 Ref 的内部类型
type Unref<T> = T extends { value: infer V } ? V : T;
type VueRef = { value: string };
type U1 = Unref<VueRef>;  // string
~~~

**面试追问：** infer 和泛型参数有什么区别？→ 泛型参数是调用时"传入"类型，infer 是在条件类型中"推断"（提取）类型。泛型参数像函数参数（主动传入），infer 像解构赋值（被动提取）。

### 模板字面量类型

~~~javascript
// ========== 模板字面量类型 ==========
type 事件名 = "click" | "focus" | "blur";
type 事件处理器名 = `on${Capitalize<事件名>}`;
// 等同于 "onClick" | "onFocus" | "onBlur"

// ========== 组合字符串字面量 ==========
type CSS属性 = `${"margin" | "padding"}-${"top" | "bottom" | "left" | "right"}`;
// 等同于 "margin-top" | "margin-bottom" | "margin-left" | "margin-right"
//      | "padding-top" | "padding-bottom" | "padding-left" | "padding-right"

// ========== 实际用途：Vue Router 路由类型 ==========
type 路由路径 = "/菜品" | "/关于" | "/登录";
type 路由名称 = `navigate${Capitalize<路由路径>}`;
// 可以自动生成路由方法名的类型
~~~

---

## 套路三：高级类型

### 联合类型与交叉类型

~~~javascript
// ========== 联合类型：A | B（或） ==========
type 菜品或饮品 = 菜品 | 饮品;
// 值可以是 菜品 或 饮品（二选一）

// ========== 交叉类型：A & B（且） ==========
type 带折扣的菜品 = 菜品 & { 折扣: number };
// 值必须同时满足 菜品 和 { 折扣: number }

// ========== 联合类型 vs 交叉类型 ==========
// 联合类型 | → 你给我 A 或 B 都行 → 范围更大
// 交叉类型 & → 你必须同时满足 A 和 B → 范围更小
~~~

### 字面量类型

~~~javascript
// ========== 字面量类型 ==========
type 菜名 = "红烧肉" | "麻婆豆腐" | "糖醋里脊";
// 只能是这三个字符串之一

let 我的菜: 菜名 = "红烧肉";   // ✅
// let 我的菜: 菜名 = "宫保鸡丁";  // ❌ 不在字面量类型中

// ========== const 断言 ==========
const 方向 = "东" as const;  // 类型是 "东"（字面量类型），不是 string
// 方向 = "西";  // ❌ 不能修改

const 配置 = { 端口: 3000, 主机: "localhost" } as const;
// 所有属性都变成 readonly + 字面量类型
// 配置.端口 = 4000;  // ❌ 只读
~~~

### 映射类型

**手写口诀：`{ [K in keyof T]: ... }` 遍历 T 的每个键，对值做变换**

~~~typescript
// ========== 基本映射类型 ==========
type Flags<T> = {
  [K in keyof T]: boolean;
};

interface User {
  name: string;
  age: number;
  email: string;
}

type UserFlags = Flags<User>;
// { name: boolean; age: boolean; email: boolean; }

// ========== 映射类型 + 修饰符 ==========
type MyPartial2<T> = { [K in keyof T]?: T[K]; };
type MyRequired2<T> = { [K in keyof T]-?: T[K]; };
type MyReadonly2<T> = { readonly [K in keyof T]: T[K]; };
type Mutable<T> = { -readonly [K in keyof T]: T[K]; };
~~~

### 映射类型 + Key Remapping（as）

~~~typescript
// TypeScript 4.1+ 支持用 as 子句重映射键名

type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

type PrefixedUser = Prefixed<User, "get">;
// { getName: string; getAge: number; getEmail: string; }

// 过滤掉某些键
type ExcludeByKey<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

type UserWithoutEmail = ExcludeByKey<User, "email">;
// { name: string; age: number; }
~~~

## 高级类型体操

### DeepPartial（深层可选）

~~~typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface Config {
  database: { host: string; port: number; credentials: { username: string; password: string; }; };
  cache: { ttl: number };
}

type PartialConfig = DeepPartial<Config>;
// database?.credentials?.username?  全部可选
~~~

### DeepReadonly（深层只读）

~~~typescript
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
~~~

### Tuple to Union（元组转联合类型）

~~~typescript
type TupleToUnion<T extends any[]> = T[number];
type T1 = TupleToUnion<[string, number, boolean]>; // string | number | boolean
~~~

### RequiredKeys / OptionalKeys

~~~typescript
type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

type RequiredKeys<T> = Exclude<keyof T, OptionalKeys<T>>;

interface User2 { name: string; age: number; email?: string; phone?: string; }
type OK = OptionalKeys<User2>;   // "email" | "phone"
type RK = RequiredKeys<User2>;   // "name" | "age"
~~~

### PathOf（获取对象所有路径）

~~~typescript
type PathOf<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends object ? `${K}` | `${K}.${PathOf<T[K]>}` : `${K}`
  : never;

interface Config2 { db: { host: string; port: number; }; cache: { ttl: number; }; debug: boolean; }
type ConfigPath = PathOf<Config2>;
// "db" | "db.host" | "db.port" | "cache" | "cache.ttl" | "debug"
~~~

---

## 套路四：工程实践

### TS 在 Vue3 中的实践

**手写口诀：defineProps 泛型定义类型，defineEmits 泛型定义事件**

~~~javascript
// ========== defineProps + 泛型 ==========
<script setup lang="ts">
interface 菜品Props {
  名字: string;
  价格: number;
  类型?: "热菜" | "凉菜" | "汤类";
  标签?: string[];
}

// 方式1：泛型参数（推荐）
const props = defineProps<菜品Props>();

// 方式2：withDefaults 设置默认值
const props2 = withDefaults(defineProps<菜品Props>(), {
  类型: "热菜",
  标签: () => []  // 引用类型必须用函数返回
});
</script>

// ========== defineEmits + 泛型 ==========
<script setup lang="ts">
// 方式1：类型声明
const emit = defineEmits<{
  (事件: "点菜", 菜名: string): void;
  (事件: "取消", 原因: string): void;
}>();

// 方式2：简写（Vue 3.3+）
const emit2 = defineEmits<{
  点菜: [菜名: string];
  取消: [原因: string];
}>();

// 触发事件
emit("点菜", "红烧肉");  // ✅ 类型检查
// emit("点菜", 38);     // ❌ 参数类型不对
// emit("不存在");        // ❌ 事件名不对
</script>

// ========== ref 泛型 ==========
<script setup lang="ts">
import { ref, computed } from "vue";

// 指定 ref 的类型
const 名字 = ref<string>("红烧肉");
const 价格 = ref<number>(38);
const 菜品们 = ref<菜品[]>([]);

// 复杂对象
interface 菜品 {
  id: number;
  名字: string;
  价格: number;
  标签: string[];
}

const 当前菜品 = ref<菜品 | null>(null);

// computed 返回值类型自动推断
const 总价 = computed(() => 菜品们.value.reduce((和, 菜) => 和 + 菜.价格, 0));
// TS 自动推断 总价 的类型是 ComputedRef<number>
</script>

// ========== computed 显式类型 ==========
// 自动推导（大多数情况够用）
const 总价2 = computed(() => 菜品们.value.reduce((和, 菜) => 和 + 菜.价格, 0));

// 显式指定（复杂逻辑时建议指定）
const 格式化价格 = computed<string>(() => {
  return `¥${价格.value.toFixed(2)}`;
});

// ========== reactive 泛型 ==========
<script setup lang="ts">
import { reactive } from "vue";

interface 表单数据 {
  名字: string;
  价格: number;
  描述: string;
}

const 表单 = reactive<表单数据>({
  名字: "",
  价格: 0,
  描述: ""
});
</script>

// ========== useRoute / useRouter 类型 ==========
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// 路由参数类型
const id = route.params.id as string;  // 需要断言，或用路由的 props

// 自定义路由类型（用 vue-router 的类型扩展）
// router/index.ts
import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    需要登录?: boolean;
    标题?: string;
  }
}
</script>
~~~

#### 自定义 Composable 的完整 TS 类型

~~~typescript
import { ref, Ref } from "vue";

interface UseFetchReturn<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  refresh: () => Promise<void>;
}

function useFetch<T>(url: string): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(url);
      data.value = await response.json();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  refresh();
  return { data, loading, error, refresh };
}

// 使用
interface Dish { id: number; name: string; price: number; }
const { data: dishes, loading, error } = useFetch<Dish[]>("/api/dishes");
~~~

#### Pinia Store 的完整 TS 类型

~~~typescript
import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface Dish {
  id: number;
  name: string;
  price: number;
  type: "热菜" | "凉菜" | "汤";
}

export const useMenuStore = defineStore("menu", () => {
  const dishes = ref<Dish[]>([]);
  const currentFilter = ref<Dish["type"] | "all">("all");

  const filteredDishes = computed(() => {
    if (currentFilter.value === "all") return dishes.value;
    return dishes.value.filter(d => d.type === currentFilter.value);
  });

  const totalPrice = computed(() => {
    return dishes.value.reduce((sum, d) => sum + d.price, 0);
  });

  function addDish(dish: Omit<Dish, "id">) {
    const newId = Math.max(0, ...dishes.value.map(d => d.id)) + 1;
    dishes.value.push({ ...dish, id: newId });
  }

  async function fetchDishes() {
    const response = await fetch("/api/dishes");
    dishes.value = await response.json();
  }

  return { dishes, currentFilter, filteredDishes, totalPrice, addDish, fetchDishes };
});
~~~

#### storeToRefs 的类型安全使用

~~~typescript
import { storeToRefs } from "pinia";

const menu = useMenuStore();

// ✅ 用 storeToRefs 保持响应式（类型也正确保留）
const { dishes, totalPrice } = storeToRefs(menu);
// dishes 的类型是 Ref<Dish[]>
// totalPrice 的类型是 ComputedRef<number>

// actions 不需要用 storeToRefs
const { addDish } = menu;
addDish({ name: "宫保鸡丁", price: 35, type: "热菜" }); // ✅ 参数类型安全
~~~

#### Vue3 常用的 TS 类型导入

~~~typescript
import type {
  Ref, ComputedRef, WritableComputedRef, UnwrapRef,
  ToRef, ToRefs, PropType, Component, VNode, EmitsOptions, InjectionKey,
} from "vue";

// InjectionKey 示例：让 provide/inject 类型安全
import { provide, inject } from "vue";

const ThemeKey: InjectionKey<Ref<string>> = Symbol("theme");
provide(ThemeKey, ref("dark"));
const theme = inject(ThemeKey); // 类型是 Ref<string> | undefined
~~~

### 声明文件（.d.ts）

**手写口诀：declare 声明类型，让 TS 认识没有类型的 JS 库**

~~~
为什么需要声明文件？
  很多 JS 库没有 TypeScript 类型
  声明文件告诉 TS "这个库有哪些类型"
  不影响运行时，只影响编译时的类型检查
~~~

~~~javascript
// ========== 为第三方 JS 库写声明 ==========

// 场景：有一个 JS 库 utils.js，没有类型
// utils.js
export function 做菜(菜名, 价格) { return `${菜名}做好了，${价格}元`; }
export const 版本 = "1.0.0";

// 声明文件：utils.d.ts
declare module "utils" {
  export function 做菜(菜名: string, 价格: number): string;
  export const 版本: string;
}

// 现在 TS 就认识这个库了
import { 做菜 } from "utils";
做菜("红烧肉", 38);  // ✅ 类型检查通过
// 做菜(38, "红烧肉");  // ❌ 参数类型不对

// ========== 为全局变量写声明 ==========

// env.d.ts
declare const API_URL: string;
declare const APP_VERSION: string;

// 使用
console.log(API_URL);  // ✅
// console.log(不存在的变量);  // ❌ 报错

// ========== 为 window 上的自定义属性写声明 ==========

// global.d.ts
declare global {
  interface Window {
    __APP_CONFIG__: {
      API_URL: string;
      DEBUG: boolean;
    };
  }
}

// 使用
console.log(window.__APP_CONFIG__.API_URL);  // ✅

// ========== 第三方库自带类型 ==========
// 有些库自带类型（如 vue、vue-router），不需要声明文件
// 安装库时会自动获得类型：
//   npm install vue  → 自带 vue/dist/vue.d.ts

// 有些库没有自带类型，社区提供了：
//   npm install @types/lodash  → 安装 lodash 的类型声明
//   @types 包放在 node_modules/@types/ 下，TS 自动识别

// 有些库既没有自带类型，也没有 @types 包：
//   需要自己写声明文件（如上面的 utils.d.ts）
~~~

### 常见的 TS 配置

~~~javascript
// ========== tsconfig.json 重要配置 ==========
{
  "compilerOptions": {
    // 编译目标
    "target": "ES2020",           // 编译成什么版本的 JS
    "module": "ESNext",           // 模块系统（ESNext = 支持 import/export）
    "lib": ["ES2020", "DOM"],     // 包含哪些类型库

    // 路径别名
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    // 严格模式（推荐全部开启）
    "strict": true,               // 等同于下面几个全部开启
    "noImplicitAny": true,        // 不允许隐式 any
    "strictNullChecks": true,     // 严格 null 检查
    "strictFunctionTypes": true,  // 严格函数类型检查

    // 其他
    "esModuleInterop": true,      // 允许 CJS 和 ESM 互操作
    "skipLibCheck": true,         // 跳过 node_modules 的类型检查（加速）
    "forceConsistentCasingInFileNames": true,  // 文件名大小写一致
    "declaration": true,          // 生成 .d.ts 声明文件
    "sourceMap": true             // 生成 Source Map
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
~~~

---

## 高频面试题

### 题目1：type 和 interface 的区别

~~~
interface：
  专用于定义对象和类的结构
  支持 extends 继承
  支持声明合并（同名自动合并）
  不能定义联合类型和基本类型别名

type：
  可以定义任何类型（对象、联合、交叉、基本类型别名）
  支持 & 交叉类型
  支持条件类型和映射类型
  不支持声明合并

实际开发建议：
  定义对象结构 → 用 interface（可以继承、可以合并）
  定义联合类型/类型别名 → 用 type
  Vue3 的 Props/Emits → 用 interface（更清晰）
~~~

### 题目2：any、unknown、never、void 的区别

| | any | unknown | never | void |
|---|---|---|---|---|
| 含义 | 任意类型 | 未知类型 | 永远不会有值 | 没有返回值 |
| 赋值 | 可以赋值给任何类型 | 只能赋值给 unknown/any | 不能赋值给任何类型 | 只能赋值给 undefined |
| 使用 | 直接使用 | 必须类型检查后使用 | 不可能到达的代码 | 函数无返回值 |
| 安全性 | 不安全（关闭检查） | 安全（强制检查） | - | - |
| 推荐 | ❌ 尽量少用 | ✅ 替代 any | 用于不可能的分支 | 用于无返回值函数 |

### 题目3：泛型是什么？解决什么问题？

~~~
泛型 = 类型的"参数"

问题：写一个函数，要支持多种类型
  不用泛型：要么写多个函数，要么用 any（丢失类型信息）
  用泛型：一个函数 + 类型参数 = 适用所有类型 + 保留类型信息

核心语法：
  <T> → 声明类型参数
  T extends U → 泛型约束（T 必须是 U 的子类型）
  infer → 在条件类型中推断某个位置的类型
~~~

### 题目4：如何用条件类型实现 ReturnType？

~~~javascript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 理解：
// T extends (...args: any[]) => infer R
//   → 如果 T 是一个函数类型
//   → infer R 推断出返回值类型，赋值给 R
// ? R
//   → 返回 R（函数的返回值类型）
// : never
//   → 如果 T 不是函数类型，返回 never

function 获取菜品(): 菜品 { return { 名字: "红烧肉", 价格: 38, 类型: "热菜" }; }
type 菜品类型 = ReturnType<typeof 获取菜品>;  // = 菜品
~~~

### 题目5：类型断言和类型守卫的区别

~~~
类型断言（as）：
  编译时操作，告诉编译器"我比你更清楚"
  不做运行时检查
  如果断言错误，运行时会出问题
  适合：确定类型时（如 DOM 操作）

类型守卫：
  运行时操作，通过 typeof/instanceof/in 自定义函数检查类型
  编译器自动收窄类型范围
  更安全，代码自证
  适合：不确定类型时（如 API 返回值、联合类型）
~~~

---

## 终极记忆卡片

~~~
套路1：类型基础
  基本类型 → string/number/boolean/null/undefined/symbol/bigint
  类型推断 → TS 自动推断，函数参数需要手动标注
  类型断言 → as / ! 非空断言（编译时，不检查）
  类型守卫 → typeof/instanceof/in/自定义类型谓词（运行时，安全）
  interface vs type → interface 定义对象+继承+合并 / type 定义任何类型

套路2：泛型与工具类型
  泛型 → <T> 类型参数，调用时确定类型
  Partial<T> → 所有属性变可选（更新操作）
  Readonly<T> → 所有属性变只读
  Pick<T,K> → 从 T 中选取部分属性
  Omit<T,K> → 从 T 中排除部分属性
  Record<K,V> → 构造对象类型
  ReturnType<T> → 获取函数返回值类型
  条件类型 → T extends U ? X : Y
  infer → 在条件类型中推断类型

套路3：高级类型
  联合类型 → A | B（或，范围更大）
  交叉类型 → A & B（且，范围更小）
  字面量类型 → "红烧肉" | "麻婆豆腐"（精确值）
  模板字面量类型 → `${A}-${B}`（字符串组合）

套路4：工程实践
  Vue3 Props → defineProps<类型>() + withDefaults
  Vue3 Emits → defineEmits<{ 事件名: [参数类型] }>()
  声明文件 → .d.ts + declare module / declare global
  tsconfig → strict: true + 路径别名 + 目标版本

高频面试题
  type vs interface → type 更灵活 / interface 可继承可合并
  any vs unknown → any 不安全 / unknown 安全（必须检查）
  泛型 → 类型参数 + 约束 + infer
  ReturnType → 条件类型 + infer 推断返回值
  类型断言 vs 类型守卫 → 编译时强制 vs 运行时检查
~~~
