/**
 * 1.14 手写 new 操作符
 *
 * 要求：实现 function myNew(constructor, ...args)
 * - 模拟原生 new 操作符的行为
 * - 处理构造函数的返回值（引用类型 vs 基本类型）
 * - 用你自己的话注释每一步
 *
 * 测试用例（请用 myNew 替换 new 并验证结果一致）：
 *
 *   function Person(name, age) {
 *     this.name = name;
 *     this.age = age;
 *   }
 *   Person.prototype.sayHi = function() { return `Hi, I'm ${this.name}`; };
 *   const p = myNew(Person, 'Alice', 25);
 *   console.log(p.name);        // 'Alice'
 *   console.log(p.age);         // 25
 *   console.log(p.sayHi());     // "Hi, I'm Alice"
 *   console.log(p instanceof Person); // true
 *
 * 返回值测试：
 *   function Foo() { this.a = 1; return { b: 2 }; }
 *   console.log(myNew(Foo));    // { b: 2 } —— 构造函数返回对象时用返回值
 *
 *   function Bar() { this.a = 1; return 42; }
 *   console.log(myNew(Bar));    // { a: 1 } —— 返回基本类型时忽略，用新对象
 *
 * 验收标准：myNew 的行为和原生 new 完全一致。
 */

// 在这里写你的实现：
function myNew(constructor, ...args) {
    // 创建基于构造函数原型生成的全新对象
    const newObj = Object.create(constructor.prototype);

    // 获取结果
    const result = constructor.apply(newObj, [...args]);

    // 判断结果是不是对象或函数，如果是则返回结果，如果不是则返回新对象
    return (result !== null && (typeof result === 'object' || typeof result === 'function')) ? result : newObj;
}
