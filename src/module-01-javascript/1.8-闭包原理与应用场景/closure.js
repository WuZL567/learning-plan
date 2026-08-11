/**
 * ============================================================
 * 1.8 闭包原理与应用场景 - 代码练习
 * ============================================================
 *
 * 验收标准：
 * 1. 所有函数能正常运行，输出正确
 * 2. 闭包保护的变量不能被外部直接访问
 * 3. 考虑边界 case（如非法参数类型）
 * 4. 用自己的话写注释解释为什么这里形成了闭包
 *
 * 完成以下三个练习后，告诉导师文件路径即可提交验收。
 * ============================================================
 */

// ============================================================
// 练习一：createCounter（闭包实现私有计数器）
// ============================================================
// 要求：
// - 返回 { increment, decrement, getCount } 三个方法
// - count 变量不能被外部直接访问或修改
// - increment() 返回 count+=1
// - decrement() 返回 count-=1
// - getCount() 返回当前 count 值
// - 注释中说明：为什么 count 是"私有"的？闭包在这里起了什么作用？
//
// 示例：
// const counter = createCounter()
// counter.increment() // 1
// counter.increment() // 2
// counter.decrement() // 1
// counter.getCount()  // 1
// console.log(counter.count) // undefined（因为 count 是私有的）

function createCounter() {
    let count = 0;

    const increment = function() {
        return count+=1;
    };

    const decrement = function() {
        return count-=1;
    };

    const getCount = function() {
        return count;
    };

    // 返回对象中不直接暴露count变量，形成私有。
    // 而increment, decrement, getCount三个函数形成闭包函数是因为使用到了count变量；外部调用时可以访问到内部的count；
    return { increment, decrement, getCount };
}

// ============================================================
// 练习二：once(fn)（闭包实现"只执行一次"）
// ============================================================
// 要求：
// - 传入一个函数 fn，返回一个新函数
// - 新函数第一次调用时执行 fn 并返回结果
// - 后续调用直接返回第一次的结果，不再执行 fn
// - 如果传入的不是 function 类型，抛出 TypeError
//
// 示例：
// const fn = once((x) => x * 2)
// fn(3)  // 6（执行了 fn）
// fn(4)  // 6（没有执行 fn，返回缓存结果）
// fn(5)  // 6（同上）

function once(fn) {
    // 这里做类型判断；
    if (typeof fn !== 'function') throw new TypeError("fn必须是一个函数！");

    // 用did表示是否执行过；
    let did = false;
    // 用result记录执行结果；
    let result;

    // 返回函数形成闭包，调用时访问到了did和result变量。
    return function(...args) {
        if (did) return result;

        did = true;
        result = fn(...args);
        return result;
    };
}

// ============================================================
// 练习三：createUser(name)（闭包实现模块模式）
// ============================================================
// 要求：
// - 传入 name 字符串，返回一个对象
// - 对象有 getName() 和 setName(newName) 两个方法
// - name 变量不能被外部直接访问
// - 如果传入的不是 string 类型，抛出 TypeError
//
// 示例：
// const user = createUser('张三')
// user.getName()    // '张三'
// user.setName('李四')
// user.getName()    // '李四'
// console.log(user.name) // undefined（私有变量）

function createUser(name) {
    // 类型判断是否为string类型
    if (typeof name !== 'string') throw new TypeError('name必须为string类型！');

    // 保存传入的值；
    let curName = name;

    const getName = function() {
        return curName;
    };

    const setName = function(newName) {
        if (typeof newName !== 'string') throw new TypeError('name必须为string类型！');
        curName = newName;
    };

    // 返回对象包括getName和setName的闭包函数，因为调用时可以访问和编辑哪步的curName变量；
    return {
        getName,
        setName,
    }
}


// ============================================================
// 测试代码（写完实现后取消注释来验证）
// ============================================================

// --- 练习一测试 ---
const counter = createCounter();
console.log('=== createCounter 测试 ===');
console.log('increment:', counter.increment()); // 1
console.log('increment:', counter.increment()); // 2
console.log('decrement:', counter.decrement()); // 1
console.log('getCount:', counter.getCount());   // 1
console.log('直接访问count:', counter.count);    // undefined
console.log('私有性检查通过:', counter.count === undefined);

// --- 练习二测试 ---
console.log('\n=== once 测试 ===');
let callCount = 0;
const fn = once((x) => { callCount++; return x * 2; });
console.log('第一次调用:', fn(3));  // 6
console.log('第二次调用:', fn(4));  // 6（不执行原函数）
console.log('第三次调用:', fn(5));  // 6（不执行原函数）
console.log('原函数只执行了1次:', callCount === 1);
try {
  once('not a function');
  console.log('类型检查未通过 - 应该抛出 TypeError');
} catch (e) {
  console.log('类型检查通过:', e instanceof TypeError);
}

// --- 练习三测试 ---
console.log('\n=== createUser 测试 ===');
const user = createUser('张三');
console.log('getName:', user.getName()); // 张三
console.log('直接访问name:', user.name);  // undefined
user.setName('李四');
console.log('改名后:', user.getName());  // 李四
try {
  createUser(123);
  console.log('类型检查未通过 - 应该抛出 TypeError');
} catch (e) {
  console.log('类型检查通过:', e instanceof TypeError);
}
