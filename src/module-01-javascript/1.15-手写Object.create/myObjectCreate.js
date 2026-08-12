/*
 * ============================================================
 * 技术点：1.15 手写 Object.create
 * 优先级：P0
 * 掌握程度：能写代码（闭眼默写无bug）
 * ============================================================
 *
 * 任务：实现 myObjectCreate(proto, propertiesObject)
 *
 * 要求：
 * 1. 实现基础功能：传入一个对象作为原型，返回一个以该对象为原型的新对象
 * 2. 实现第二个可选参数 propertiesObject，用法和 Object.create 的第二个参数一致
 *    （即通过属性描述符定义新对象的自有属性）
 * 3. 处理边界情况：
 *    - proto 为 null：返回一个没有原型的纯空对象（类似 Object.create(null)）
 *    - proto 不是对象且不是 null，抛出 TypeError
 *
 * 验收标准：
 * - 概念理解（4分）：能用自己的话解释 Object.create 的原理和用途
 * - 代码正确性（3分）：代码能跑通，输出正确
 * - 边界处理（2分）：处理 proto=null、proto 不合法类型
 * - 表达清晰度（1分）：注释用自己的话解释逻辑
 *
 * 提示：
 * - 思考 Object.create 和 new 的本质区别是什么？
 * - Object.create(null) 创建的对象有什么特点？能用 hasOwnProperty 吗？
 * - 第二个参数 propertiesObject 格式是什么样的？如何应用到新对象上？
 */

function myObjectCreate(proto, propertiesObject) {
    // proto必须是对象或null，否则抛出错误
    if (typeof proto !== 'object' && proto !== null) throw new TypeError("必须是对象或null");

    let newObj;

    // 判断proto是否为null，为null则返回原型为null的对象
    if (proto === null) {
        newObj = {};
        // 设置新对象的原型为null，真正做到空对象；
        newObj.__proto__ = null;
    } else {
        // proto为对象
        const Foo = function () { };
        // 新函数原型指向传入的构造函数
        Foo.prototype = proto;
        newObj = new Foo();
    }

    if (propertiesObject !== undefined) {
        Object.defineProperties(newObj, propertiesObject);
    }

    return newObj;
}

// --- 测试用例（你自己跑一下验证） ---
// const obj1 = myObjectCreate({ a: 1 });
// console.log(obj1.a);          // 1 (从原型继承)
// console.log(obj1.hasOwnProperty('a')); // false
// console.log(Object.getPrototypeOf(obj1) === { a: 1 }); // 需要考虑引用...

// const obj2 = myObjectCreate(null);
// console.log(Object.getPrototypeOf(obj2)); // null
// console.log(obj2.hasOwnProperty); // undefined

// try { myObjectCreate(123); } catch(e) { console.log(e.message); } // 应抛出 TypeError

module.exports = myObjectCreate;
