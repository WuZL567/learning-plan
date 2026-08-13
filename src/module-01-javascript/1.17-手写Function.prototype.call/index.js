/**
 * 1.17 手写 Function.prototype.call（P0 · 能写代码）
 *
 * 任务：实现 Function.prototype.myCall，让任意函数都能用 fn.myCall(context, ...args) 的方式
 * 以指定的 this 值立即执行，和原生 call 行为一致。
 *
 * 要求：
 * 1. 在 Function.prototype 上挂 myCall，不要直接调用原生 call 来实现
 * 2. 返回函数执行的结果
 * 3. 参数要透传给原函数（从第二个参数开始是函数的实参）
 *
 * 验收标准（满分 10 分）：
 * - 概念理解 4 分：注释里用自己的话解释「myCall 内部的 this 是谁」「为什么把函数挂到
 *   context 上就能改 this」（提示：回忆 1.16 的隐式绑定规则）
 * - 代码正确性 3 分：下面所有测试用例输出正确
 * - 边界处理 2 分：
 *   a. context 为 null / undefined 时，非严格模式下 this 应指向全局对象
 *      （浏览器是 window，Node 是 globalThis），不能报错
 *   b. context 是原始类型（数字、字符串、布尔、Symbol）时，要能正常装箱执行
 *   c. 临时挂到 context 上的属性名不能和 context 已有的属性冲突（提示：用 Symbol 当 key）
 *   d. 执行完后要删除临时属性，不能让 context 被污染
 * - 表达清晰度 1 分：注释是自己的话，不是复述代码
 *
 * 自己写测试用例覆盖：普通调用、传参、返回值、null/undefined、原始类型、属性名冲突。
 */

// ========== 在这里手写你的实现，写完在下方补充测试用例 ==========
Function.prototype.myCall = function (context, ...args) {
    // myCall 内部的 this 是调用它的那个函数本身（因为 fn.myCall() 中 myCall 是作为 fn 的方法被调用的，this 指向 fn）
    // 把函数挂在context上，就等于是通过context来调用这个函数，符合隐式绑定this的逻辑，谁调用，this就指向谁；

    // context是null/undefined的时候，使用全局的this
    context = context == null ? globalThis : context;

    // 如果context是原始类型，则需要用Object包裹；
    if (typeof context !== 'object' && typeof context !== 'function') {
        context = Object(context);
    }

    // 唯一属性
    const sId = Symbol('id');

    // 把原函数的当作属性放在context中
    context[sId] = this;

    // 执行原函数获取返回值
    const result = context[sId](...args);

    // 删除context中的原函数属性
    delete context[sId];

    // 返回结果
    return result;
}

// ========== 测试用例 ==========

let passCount = 0;
let failCount = 0;
function assert(name, actual, expected) {
    const ok = typeof expected === 'function' ? expected(actual) : actual === expected;
    const show = v => { try { return String(v); } catch { return typeof v; } };
    if (ok) { passCount++; console.log(`✓ ${name}`); }
    else { failCount++; console.log(`✗ ${name} — 期望 ${show(expected)}，实际 ${show(actual)}`); }
}

const person = { name: '小明' };
function greet(greeting, punctuation) {
    return `${greeting}，我是${this.name}${punctuation}`;
}
function whoAmI() { return this; }
function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }

// 1. 普通调用 + 传参 + 返回值
assert('普通调用+传参+返回值', greet.myCall(person, '你好', '！'), '你好，我是小明！');

// 2. 多参数透传
assert('多参数透传', sum.myCall(null, 1, 2, 3, 4), 10);

// 3. this 指向 context
assert('this 指向 context', whoAmI.myCall(person), person);

// 4. context 为 null / undefined → 全局对象
assert('null → globalThis', whoAmI.myCall(null), globalThis);
assert('undefined → globalThis', whoAmI.myCall(undefined), globalThis);

// 5. 原始类型装箱：返回包装对象，拆箱后等于原值
assert('数字装箱', whoAmI.myCall(5).valueOf() === 5 && typeof whoAmI.myCall(5) === 'object', true);
assert('字符串装箱', whoAmI.myCall('hi').valueOf() === 'hi', true);
assert('布尔装箱', whoAmI.myCall(true).valueOf() === true, true);
const sym = Symbol('x');
assert('Symbol装箱', whoAmI.myCall(sym).valueOf() === sym, true);

// 6. 属性名冲突：context 已有 Symbol('id') 属性不受影响
const obj = {};
const existingKey = Symbol('id');
obj[existingKey] = '原有数据';
whoAmI.myCall(obj);
assert('不覆盖已有同名Symbol属性', obj[existingKey], '原有数据');

// 7. 执行后不污染 context
const clean = {};
whoAmI.myCall(clean);
assert('执行后无残留Symbol属性', Object.getOwnPropertySymbols(clean).length, 0);

console.log(`\n通过 ${passCount} 个，失败 ${failCount} 个`);

/*
 * 执行结果（2026-08-13，node v22）：
 *
 * ✓ 普通调用+传参+返回值
 * ✓ 多参数透传
 * ✓ this 指向 context
 * ✓ null → globalThis
 * ✓ undefined → globalThis
 * ✓ 数字装箱
 * ✓ 字符串装箱
 * ✓ 布尔装箱
 * ✓ Symbol装箱
 * ✓ 不覆盖已有同名Symbol属性
 * ✓ 执行后无残留Symbol属性
 *
 * 通过 11 个，失败 0 个
 */
