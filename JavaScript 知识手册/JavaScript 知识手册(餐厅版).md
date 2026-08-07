# JavaScript 知识手册(餐厅版)

[第01章：JavaScript 基础概念](第01章：JavaScript%20基础概念.md)
  ├── ⭐ 函数优先
  ├── ⭐ 即时编译 JIT
  ├── ⭐⭐🔥 基于原型                        ← 面试高频：解释 JS 和 Java 的区别
  ├── ⭐ 多范式
  ├── ⭐⭐🔥 单线程                          ← 面试高频：和事件循环/Promise 紧密相关
  ├── ⭐ 面向对象 / 命令式 / 声明式
  ├── ⭐ ECMAScript 标准（ECMA-262 / ECMA-402）
  ├── ⭐ 浏览器实现 / 提案阶段（Stage 3/4）
  ├── ⭐ 对象标准库概览（22个内置对象，完整版）
  ├── ⭐ 核心语言元素 / 客户端JS / 服务器端JS / DOM
  └── ⭐ 动态特性（运行时对象构造/变量参数列表/函数变量/eval/枚举/源代码恢复）

[第02章：变量、作用域与变量提升](第02章：变量、作用域与变量提升.md)                          ← 🔥🔥🔥 整章都是面试高频
  ├── ⭐⭐⭐🔥 作用域（全局/模块/函数/块级）            ← 必背：四种作用域的区别
  ├── ⭐⭐ 全局变量 vs 局部变量
  ├── ⭐⭐⭐🔥 作用域链                                ← 面试：变量查找机制
  ├── ⭐⭐⭐🔥 变量提升（var/let/const 的提升行为）     ← 面试超高频：经典输出题
  ├── ⭐⭐⭐🔥 暂时性死区 TDZ                          ← 面试超高频：let/const 的 TDZ
  └── ⭐⭐ 全局变量深入（window挂载/隐式全局变量/globalThis）

[第03章：数据类型、字面量与类型判断](第03章：数据类型、字面量与类型判断.md)                        ← 🔥🔥🔥 基础中的基础
  ├── ⭐⭐⭐🔥 8种数据类型逐个详解                     ← 必背：基本类型 vs 引用类型
  ├── ⭐⭐⭐🔥 假值 Falsy Values（6个假值）            ← 面试超高频：[] 和 {} 是 truthy
  ├── ⭐⭐⭐🔥 typeof 运算符速查                       ← 面试高频：typeof null === "object"
  └── ⭐⭐ 字面量（所有类型的字面量写法）

[第04章：模板字符串与带标签的模板](第04章：模板字符串与带标签的模板.md)
  ├── ⭐⭐⭐💼 模板字符串                              ← 每天都用
  └── ⭐🆕 带标签的模板 Tagged Templates               ← 进阶：了解即可，特定场景才用

[第05章：流程控制（块语句与条件语句）](第05章：流程控制（块语句与条件语句）.md)
  ├── ⭐ 块语句 / 标签（Label）                        ← 了解即可
  └── 条件语句
      ├── ⭐⭐⭐ if / if...else                        ← 每天都用
      ├── ⭐⭐⭐ 三元运算符                            ← 每天都用
      ├── ⭐⭐ switch（break/穿透/严格相等）            ← 偶尔用
      └── ⭐⭐⭐🔥 逻辑短路（&& / || / ??）            ← 面试高频 + 每天都用，?? 是 ES2020

[第06章：循环与迭代](第06章：循环与迭代.md)
  ├── ⭐⭐⭐ for 循环                                 ← 基本功
  ├── ⭐⭐ while / do...while                         ← 偶尔用
  ├── ⭐⭐⭐🔥 for...in（遍历对象的键）                ← 面试高频：和 for...of 区别
  ├── ⭐⭐⭐🔥 for...of（遍历可迭代对象的值）          ← 面试高频：ES6 新增
  ├── ⭐⭐⭐🔥 for...in vs for...of 对比              ← 面试超高频对比题
  ├── ⭐ break / continue / 标签循环                   ← 了解即可
  └── ⭐⭐⭐💼 数组方法式遍历（forEach/map/filter/reduce）← 每天都用

[第07章：函数基础](第07章：函数基础.md)
  ├── ⭐⭐⭐🔥 函数声明 / 函数表达式 / 箭头函数        ← 面试高频：区别 + 箭头函数 this
  ├── ⭐⭐⭐ 参数 / 默认参数 / 剩余参数                ← 每天都用
  ├── ⭐⭐⭐ 返回值 return
  ├── ⭐⭐🔥 arguments 对象                            ← 面试偶尔考：和剩余参数的区别，⚠️ 箭头函数没有
  ├── ⭐⭐⭐🔥 函数声明的提升                          ← 面试高频：var 变量提升 vs 函数提升
  ├── ⭐⭐⭐💼 回调函数                                ← 每天都用
  ├── ⭐⭐🆕 纯函数 vs 非纯函数                        ← 面试偶尔考
  ├── ⭐⭐🔥 IIFE（立即执行函数）                      ← 面试偶尔考：闭包/模块化的前驱
  └── ⭐ 预定义函数（parseInt/parseFloat/isNaN/eval）  ← eval 过时危险，其他了解即可

[第08章：this 绑定规则与 call/apply/bind](第08章：this%20绑定规则与%20call、apply、bind.md)                  ← 🔥🔥🔥 面试最最高频章节之一
  ├── ⭐⭐⭐🔥 this 是什么                             ← 必背
  ├── ⭐⭐⭐🔥 默认绑定（独立函数调用）
  ├── ⭐⭐⭐🔥 隐式绑定（对象方法调用）
  ├── ⭐⭐⭐🔥 显式绑定（call / apply / bind 详解）    ← 面试必问：三者区别
  ├── ⭐⭐⭐🔥 new 绑定
  ├── ⭐⭐⭐🔥 箭头函数的 this                         ← 面试超高频：没有自己的 this
  ├── ⭐⭐⭐🔥 优先级规则（new > 显式 > 隐式 > 默认）  ← 面试：说出优先级
  └── ⭐⭐⭐🔥 常见 this 陷阱与解决方案

[第09章：函数栈、递归、闭包与柯里化](第09章：函数栈、递归、闭包与柯里化.md)                       ← 🔥🔥🔥 面试最最高频章节之一
  ├── ⭐⭐ 函数栈（调用栈）
  ├── ⭐⭐ 栈溢出
  ├── 递归
  │   ├── ⭐⭐⭐ 基准情况 / 递归情况                   ← 基本功
  │   ├── ⭐⭐⭐ 阶乘 / 斐波那契 / 深拷贝 / 树形遍历   ← 面试手写高频
  │   ├── ⭐⭐🆕 记忆化（memoization）                 ← 面试优化题
  │   └── ⭐⭐ 递归 vs 循环
  ├── 闭包                                               ← 🔥🔥🔥 面试必问
  │   ├── ⭐⭐⭐🔥 核心概念（内部函数记住外部环境）     ← 必背
  │   ├── ⭐⭐⭐🔥💼 私有变量 / 函数工厂 / 防抖 / 缓存 ← 每天都在用
  │   ├── ⭐⭐⭐🔥 循环陷阱（var vs let）              ← 经典面试题
  │   ├── ⭐⭐⭐🔥 内存泄漏                            ← 面试常问
  │   └── ⭐⭐ 闭包的完整生命周期图
  ├── ⭐⭐🆕💼 Vue Hook 与闭包                         ← Vue 开发者必看
  └── 柯里化
      ├── ⭐⭐🔥 概念                                  ← 面试偶尔考
      ├── ⭐⭐ 手写柯里化函数（逐步拆解）               ← 面试手写题
      └── ⭐ 柯里化 vs 偏函数

[第10章：迭代器与生成器](第10章：迭代器与生成器.md)
  ├── ⭐⭐🆕🔥 可迭代协议（Iterable Protocol）         ← 面试：for...of 的底层原理
  ├── ⭐⭐🆕🔥 迭代器协议（Iterator Protocol）         ← 面试：手写 iterator
  ├── ⭐⭐🆕 for...of 的底层机制
  ├── ⭐⭐🆕 生成器（function* / yield）               ← 了解概念，面试偶尔考
  ├── ⭐🆕 yield* 委托                                ← 进阶
  └── ⭐ 生成器的实际应用（惰性求值、异步流程控制）     ← 进阶

[第11章：异常处理](第11章：异常处理.md)
  ├── ⭐⭐⭐ throw（主动抛出错误）                      ← 必会
  ├── ⭐⭐⭐💼 try...catch...finally                   ← 每天都用
  ├── ⭐⭐🔥 Error 对象 / 错误类型                     ← 面试：区分 TypeError/RangeError/ReferenceError
  ├── ⭐🆕 自定义错误类型（extends Error）              ← 项目中常用
  └── ⭐⭐🔥 try...catch 只能捕获同步错误               ← 面试高频坑点

[第12章：Object / Map / Set 与 WeakMap/WeakSet](第12章：Object、Map、Set%20与%20WeakMap、WeakSet.md)            ← 🔥🔥 整章都重要
  ├── ⭐⭐⭐🔥💼 Object 详解                           ← 每天都用
  ├── ⭐⭐⭐🆕💼 Map 详解                              ← 面试高频：和 Object 区别
  ├── ⭐⭐⭐🆕💼 Set 详解                              ← 面试高频：去重 + 集合运算
  ├── ⭐⭐⭐🔥 三者全面对比                            ← 面试高频对比题
  ├── ⭐⭐ Map与Object互转 / Set与Array互转
  └── ⭐⭐🆕🔥 WeakMap / WeakSet                      ← 面试常问：弱引用、防止内存泄漏

[第13章：原型链与继承（含class）](第13章：原型链与继承（含class）.md)                           ← 🔥🔥🔥 面试最最高频章节之一
  ├── ⭐⭐⭐🔥 构造函数 / new 关键字的4步              ← 面试必问：手写 new
  ├── ⭐⭐⭐🔥 prototype（公共说明书）                 ← 必背
  ├── ⭐⭐⭐🔥 __proto__（隐形连线）                   ← 必背
  ├── ⭐⭐⭐🔥 prototype.constructor                   ← 必背
  ├── 原型链完整机制
  │   ├── ⭐⭐⭐🔥 属性遮蔽（Shadowing）
  │   ├── ⭐⭐⭐🔥 hasOwnProperty vs in 操作符         ← 面试高频
  │   └── ⭐⭐⭐🔥 原型链终点 null                     ← 面试经典：Object.prototype.__proto__ === null
  ├── 继承6种方式                                       ← 🔥🔥🔥 面试超高频
  │   ├── ⭐⭐🔥 原型链继承                            ← 面试：说出缺点
  │   ├── ⭐⭐🔥 借用构造函数继承                      ← 面试：说出缺点
  │   ├── ⭐⭐🔥 组合继承                              ← 面试：说出缺点
  │   ├── ⭐ 原型式继承
  │   ├── ⭐⭐🔥 寄生组合式继承                        ← 面试高频：最优方案
  │   └── ⭐⭐⭐🔥🆕 ES6 class 继承                    ← 现代JS，必会
  ├── class 详解
  │   ├── ⭐⭐⭐🔥🆕 constructor                       ← 每天都用
  │   ├── ⭐⭐⭐🆕💼 实例方法 / 实例属性
  │   ├── ⭐⭐⭐🆕 getter / setter                     ← 面试 + 项目都常用
  │   ├── ⭐⭐🆕 静态属性 / 静态方法                   ← 面试偶尔考
  │   ├── ⭐⭐🆕🔥 私有属性 / 私有方法（#）            ← ES2022，越来越重要
  │   └── ⭐⭐⭐🔥 class 本质是语法糖                  ← 面试必问
  ├── ⭐⭐⭐🔥 extends / super / 方法重写              ← 面试必问
  ├── ⭐🆕 Mixin（多重继承替代方案）
  └── ⭐⭐⭐🔥 instanceof（沿原型链检查）              ← 面试高频

[第14章：同步异步与事件循环](第14章：同步异步与事件循环.md)                                ← 🔥🔥🔥 面试最最高频章节之一
  ├── ⭐⭐⭐🔥 同步（Synchronous）
  ├── ⭐⭐⭐🔥 异步（Asynchronous）
  └── ⭐⭐⭐🔥💼 事件循环（Event Loop）/ 主线程 / 回调队列 ← 面试必问：输出顺序题

[第15章：Promise](第15章：Promise.md)                                          ← 🔥🔥🔥 面试超高频
  ├── ⭐⭐🔥 回调地狱问题                              ← 理解为什么需要 Promise
  ├── ⭐⭐⭐🔥 三种状态（pending/fulfilled/rejected）   ← 必背
  ├── ⭐⭐⭐🔥 new Promise / resolve / reject          ← 每天都用
  ├── ⭐⭐⭐🔥💼 .then / .catch / .finally             ← 每天都用
  ├── ⭐⭐⭐🔥 链式调用（.then 返回新 Promise 的规则）  ← 面试高频：返回值规则
  ├── ⭐⭐ Promise.resolve / Promise.reject
  └── ⭐⭐⭐🔥💼 Promise.all / allSettled / race / any  ← 面试高频 + 每天都用

[第16章：async / await](第16章：async、await.md)                                    ← 🔥🔥🔥 面试超高频 + 每天都用
  ├── ⭐⭐⭐🔥💼 async 函数（总是返回 Promise）
  ├── ⭐⭐⭐🔥💼 await 关键字（暂停函数，不阻塞主线程）
  ├── ⭐⭐⭐🔥 await 的真正机制详解                    ← 面试高频：暂停谁？阻塞谁？
  ├── ⭐⭐⭐🔥💼 错误处理（try...catch）
  ├── ⭐⭐⭐🔥💼 async/await + Promise.all（并行执行） ← 每天都用
  └── ⭐⭐⭐🔥 回调 → Promise → async/await 演进对比   ← 面试经典对比题

[第17章：事件（Event）](第17章：事件（Event）.md)                                    ← 🔥🔥 DOM 核心
  ├── ⭐⭐⭐🔥💼 addEventListener                      ← 每天都用
  ├── ⭐⭐🔥 事件对象（Event Object）
  ├── ⭐⭐⭐🔥 事件冒泡与捕获（Bubbling vs Capturing）  ← 面试高频：三个阶段
  ├── ⭐⭐⭐🔥💼 事件委托（Event Delegation）          ← 面试高频 + 每天都用
  ├── ⭐⭐💼 常见事件类型（click/input/submit/keydown/scroll等）
  ├── ⭐⭐ removeEventListener
  └── ⭐🆕 自定义事件（CustomEvent / dispatchEvent）   ← 组件通信场景

[第18章：Fetch API 详解](第18章：Fetch%20API%20详解.md)                                   ← 🔥🔥🔥 每天都用
  ├── ⭐⭐⭐🔥💼 fetch 基本用法                        ← 每天都用
  ├── ⭐⭐⭐💼 请求配置（method/headers/body）
  ├── ⭐⭐🔥 Response 对象（status/ok/headers/body）
  ├── ⭐⭐⭐🔥💼 错误处理（网络错误 vs HTTP错误）      ← 面试高频：fetch 不 reject 404
  ├── ⭐⭐⭐💼 GET / POST / PUT / DELETE 实战          ← 每天都用
  ├── ⭐⭐💼 并发请求（配合 Promise.all）
  └── ⭐⚠️ fetch vs XMLHttpRequest 对比               ← XHR 已过时，了解即可

[第19章：Web Storage](第19章：Web%20Storage.md)
  ├── ⭐⭐⭐💼 localStorage                            ← 每天都用
  ├── ⭐⭐ sessionStorage                              ← 偶尔用
  ├── ⭐⭐⭐🔥 两者区别                                ← 面试常考对比题
  ├── ⭐⭐💼 增删改查
  ├── ⭐🆕 存储事件（storage event）                   ← 多标签页同步场景
  ├── ⭐⭐ 存储限制与注意事项                           ← 面试：容量限制、不要存敏感信息
  └── ⭐⭐💼 JSON 存取复杂数据

[第20章：模块化（ES Module）](第20章：模块化（ES%20Module）.md)                               ← 🔥🔥🔥 现代 JS 核心
  ├── ⭐⭐ 为什么需要模块化
  ├── ⭐⭐⭐🔥🆕💼 export（命名导出 / 默认导出）       ← 每天都用
  ├── ⭐⭐⭐🔥🆕💼 import（命名导入 / 默认导入 / 重命名）← 每天都用
  ├── ⭐⭐🆕💼 重导出（export { } from）              ← 项目中常用
  ├── ⭐⭐🆕🔥 动态导入（import()）                    ← 面试：懒加载原理
  ├── ⭐⭐⭐🔥 ES Module vs CommonJS 对比              ← 面试高频：活绑定 vs 值拷贝
  └── ⭐⭐🆕 模块的加载机制（静态分析 / 单例 / 活绑定）← 面试：Tree Shaking 原理

[第21章：元编程（Proxy / Reflect / Symbol）](第21章：元编程（Proxy、Reflect、Symbol）.md)                ← 🔥🔥 面试加分项
  ├── Proxy
  │   ├── ⭐⭐🔥 Proxy 13种拦截操作                   ← 面试偶尔考
  │   └── ⭐⭐🔥💼 4个实际应用场景（数据验证/默认值/响应式）← Vue 3 原理
  ├── Reflect
  │   ├── ⭐⭐ 标准化对象操作方法
  │   └── ⭐⭐ 与 Proxy 配合使用
  └── Symbol 元编程属性
      ├── ⭐⭐🆕🔥 Symbol.iterator（自定义遍历）       ← 面试：for...of 原理
      ├── ⭐⭐🆕 Symbol.toPrimitive（类型转换）        ← 面试加分
      ├── ⭐🆕 Symbol.hasInstance / toStringTag / species / isConcatSpreadable ← 了解即可
  └── ⭐⭐🔥💼 实战：用 Proxy + Reflect 实现响应式系统 ← Vue 3 核心原理

[第22章：内存管理与垃圾回收](第22章：内存管理与垃圾回收.md)                                ← 🔥🔥 面试常考
  ├── ⭐⭐ 为什么需要垃圾回收
  ├── ⭐⚠️ 引用计数（Reference Counting）              ← 已淘汰，了解缺点即可
  ├── ⭐⭐⭐🔥 标记清除（Mark and Sweep）              ← 面试高频：主流方案
  ├── ⭐⭐🔥 V8 引擎的垃圾回收策略（分代收集）          ← 面试加分
  ├── ⭐⭐⭐🔥 内存泄漏的常见原因                      ← 面试高频 + 每天都要避免
  ├── ⭐🆕 WeakRef / FinalizationRegistry              ← 了解即可
  └── ⭐⭐⭐💼 如何避免内存泄漏的最佳实践              ← 每天都要注意

[第23章：装饰器模式](第23章：装饰器模式.md)                                       ← ⭐ 了解即可（大部分开发者日常不用）
  ├── ⭐⭐ 概念（不修改原函数，增加新功能）             ← 设计模式面试偶尔考
  ├── ⭐⭐ 函数装饰器（高阶函数实现）                   ← 防抖/节流本质就是装饰器
  ├── ⭐ 方法装饰器
  ├── ⭐ 类装饰器
  ├── ⭐🆕 TC39 装饰器提案语法（@decorator）           ← Stage 3，TypeScript/Angular 用
  ├── ⭐ TypeScript 中的装饰器                          ← TS 项目才用
  └── ⭐ Vue/React 中的装饰器应用场景

[第24章：import.meta](第24章：import.meta.md)                                      ← ⭐ 了解即可（特定工具链才用）
  ├── ⭐ import.meta 是什么
  ├── ⭐⭐🆕 import.meta.url（当前模块的完整URL）       ← 项目中偶尔用
  ├── ⭐🆕 import.meta.resolve()（解析模块路径）
  ├── ⭐ 不同环境下的 import.meta
  ├── ⭐⭐🆕💼 Vite 中的 import.meta（.env / .glob）  ← Vite 项目必会
  └── ⭐🆕 Node.js 中的 import.meta（fileURLToPath）

[第25章：常用方法速查手册](第25章：常用方法速查手册.md)                                  ← ⭐⭐⭐💼 工具章节，天天查
  ├── ⭐⭐⭐💼 String 方法
  ├── ⭐⭐⭐💼 Number 方法与 Math
  ├── ⭐⭐⭐🔥💼 Array 方法                            ← 面试手写 map/filter/reduce
  ├── ⭐⭐⭐🔥💼 Object 方法
  ├── ⭐⭐⭐🆕💼 Map 方法
  ├── ⭐⭐⭐🆕💼 Set 方法（含集合运算）
  ├── ⭐⭐💼 Date 方法
  ├── ⭐⭐⭐💼 JSON 方法
  ├── ⭐⭐⭐🔥💼 Promise 方法
  ├── ⭐⭐💼 RegExp 方法
  ├── ⭐⭐⭐🔥 类型判断速查                             ← 面试高频
  ├── ⭐⭐⭐🔥 类型转换速查                             ← 面试高频
  └── ⭐⭐⭐🔥💼 展开运算符                            ← 每天都用
