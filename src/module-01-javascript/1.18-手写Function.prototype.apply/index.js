/**
 * 1.18 手写 Function.prototype.apply（P0 · 能写代码）
 *
 * 任务：实现 Function.prototype.myApply，让任意函数都能用 fn.myApply(context, argsArray) 的方式
 * 以指定的 this 值立即执行，和原生 apply 行为一致。
 *
 * 要求：
 * 1. 在 Function.prototype 上挂 myApply，不要直接调用原生 apply 来实现
 * 2. 返回函数执行的结果
 * 3. 参数从第二个参数（一个数组）中取出，展开后传给原函数
 *
 * 验收标准（满分 10 分）：
 * - 概念理解 4 分：注释里用自己的话解释「myApply 和 1.17 的 myCall 实现上的唯一区别是什么」
 *   「argsArray 里的参数是怎么进到原函数手里的」（提示：回忆展开运算符）
 * - 代码正确性 3 分：下面所有测试用例输出正确
 * - 边界处理 2 分：
 *   a. context 为 null / undefined 时，非严格模式下 this 应指向全局对象，不能报错
 *   b. context 是原始类型（数字、字符串、布尔、Symbol）时，要能正常装箱执行
 *   c. 第二个参数为 null / undefined 时，等价于不传任何参数，不能报错
 *   d. 第二个参数不是数组（比如数字、对象）时，非严格模式下等价于不传参数
 *   e. 临时挂到 context 上的属性名不能和 context 已有的属性冲突（提示：用 Symbol 当 key）
 *   f. 执行完后要删除临时属性，不能让 context 被污染
 * - 表达清晰度 1 分：注释是自己的话，不是复述代码
 *
 * 自己写测试用例覆盖：普通调用、数组传参、返回值、null/undefined 的 context、
 * 原始类型 context、第二参数为 null/undefined、第二参数非数组、属性名冲突。
 * 提示：Math.max 不能直接吃数组，但 Math.max.myApply(null, [1, 5, 3]) 应该返回 5。
 */

// ========== 在这里手写你的实现，写完在下方补充测试用例 ==========
Function.prototype.myApply = function (context, argsArray) {
    // myApply和myCall的唯一区别在于传入的参数，除了context之外的参数，apply需要的是数组形式，而call则是一个个参数的传递；
    // 判断context是否为null/undefined，是则使用全局this；
    context = context == null ? globalThis : context;

    // 如果context是原始类型，则需要用Object包裹；
    if (typeof context !== 'object' && typeof context !== 'function') {
        context = Object(context);
    }

    const sid = Symbol("id");

    context[sid] = this;

    let result;

    // 判断argsArray是否存在且为数组类型，如果是则正常请求，否则当作未传入参数
    if (argsArray && Array.isArray(argsArray) && argsArray.length > 0) {
        result = context[sid](...argsArray);
    } else {
        result = context[sid]();
    }

    delete context[sid];

    return result;
}

// ========== 测试用例（导师补充，2026-08-13） ==========
// 注意：练习要求中包含「自己写测试用例」，本次由导师代写留档，验收已扣 1 分。
// 1.19 手写 bind 请务必自己写测试用例。

let passCount = 0;
let failCount = 0;
function assert(name, actual, expected) {
    if (Object.is(actual, expected)) {
        passCount++;
        console.log('  ✓ ' + name + ' → ' + JSON.stringify(actual));
    } else {
        failCount++;
        console.log('  ✗ ' + name + ' → 期望 ' + JSON.stringify(expected) + '，实际 ' + JSON.stringify(actual));
    }
}

// 1. 普通调用 + 数组传参
function greet(prefix, name) { return prefix + this.salutation + name; }
const person = { salutation: '你好，' };
assert('greet.myApply(person, ["Hi,", "WZL"])', greet.myApply(person, ['Hi,', 'WZL']), 'Hi,你好，WZL');

// 2. 返回值 + Math.max
assert('Math.max.myApply(null, [1,5,3])', Math.max.myApply(null, [1, 5, 3]), 5);
function sum(a, b, c) { return a + b + c; }
assert('sum.myApply(null, [1,2,3])', sum.myApply(null, [1, 2, 3]), 6);

// 3. context 为 null / undefined（与原生 apply 对比）
assert('greet.myApply(null) 不报错', greet.myApply(null, ['Hi,']) === greet.apply(null, ['Hi,']), true);
assert('greet.myApply(undefined) 不报错', greet.myApply(undefined, ['Hi,']) === greet.apply(undefined, ['Hi,']), true);

// 4. context 原始类型装箱
assert('数字 context', (function () { return typeof this; }).myApply(123, []), 'object');
assert('字符串 context', (function () { return this.toString(); }).myApply('abc', []), 'abc');
assert('布尔 context', (function () { return typeof this; }).myApply(true, []), 'object');
assert('Symbol context', (function () { return typeof this; }).myApply(Symbol('s'), []), 'object');

// 5. 第二参数 null / undefined / 非数组 → 等价于不传参
assert('第二参数 null', (function () { return arguments.length; }).myApply({}, null), 0);
assert('第二参数 undefined', (function () { return arguments.length; }).myApply({}, undefined), 0);
assert('第二参数数字', (function () { return arguments.length; }).myApply({}, 123), 0);
assert('第二参数对象', (function () { return arguments.length; }).myApply({}, { 0: 'a' }), 0);
assert('第二参数空数组', (function () { return arguments.length; }).myApply({}, []), 0);

// 6. 属性名冲突 + context 不被污染
const obj = { id: 'original' };
function readThis() { return this.id; }
assert('Symbol key 不冲突', readThis.myApply(obj, []), 'original');
assert('执行后无残留属性', Object.getOwnPropertySymbols(obj).length, 0);

// 7. 多参数顺序正确
assert('参数顺序', (function (a, b, c) { return [a, b, c].join('-'); }).myApply({}, ['x', 'y', 'z']), 'x-y-z');

console.log('\n通过 ' + passCount + ' 个，失败 ' + failCount + ' 个');

