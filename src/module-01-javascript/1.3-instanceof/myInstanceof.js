// 要求：
// - 实现 myInstanceof(left, right) 函数，用注释解释每一步在做什么
// - 至少写 5 个测试用例覆盖正常情况（数组、自定义类、Object、Date、原始值等）
// - 处理边界情况（left 为 null/undefined、right 不是函数等）

function myInstanceof(left, right) {
    // 基本类型的对象直接返回false
    if (left === null || (typeof left !== 'object' && typeof left !== 'function')) {
        return false;
    }

    // 如果right不是函数，则抛出错误
    if (typeof right !== 'function') {
        throw new TypeError("right必须为函数")
    }

    // 获取原对象的原型
    let leftOrigin = Object.getPrototypeOf(left);

    // 循环一级一级的向上找
    while (leftOrigin !== null) {
        // 如果找到原对象的原型等于构造函数的prototype，则为true
        if (leftOrigin === right.prototype) {
            return true;
        }
        // 否则继续向上查找
        leftOrigin = Object.getPrototypeOf(leftOrigin);
    }

    return false;
}

// true
console.log(myInstanceof([], Array));
// true
console.log(myInstanceof([], Object));
// true
console.log(myInstanceof(new Date(), Date));
// false
console.log(myInstanceof(123, Number));
// false
console.log(myInstanceof(null, Object));
// true
const num = new Number(123);
console.log(myInstanceof(num, Number));
