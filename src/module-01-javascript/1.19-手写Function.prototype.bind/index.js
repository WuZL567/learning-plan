/**
 * 1.19 手写 Function.prototype.bind（P0 · 能写代码）
 *
 * 任务：实现 Function.prototype.myBind，让任意函数都能用 fn.myBind(context, ...args) 的方式
 * 得到一个永久绑定 this 的新函数，和原生 bind 行为一致。
 *
 * 要求：
 * 1. 在 Function.prototype 上挂 myBind，不要直接调用原生 bind 来实现
 * 2. myBind 不立即执行函数，返回一个新函数（可用 1.18 的 myApply 或 1.17 的 myCall 帮忙执行）
 * 3. 支持柯里化：绑定时的参数和调用时的参数要拼接
 * 4. 返回的新函数被 new 调用时，this 必须指向 new 出来的新实例（new 优先级高于 bind）
 *
 * 验收标准（满分 10 分）：
 * - 概念理解 4 分：注释里用自己的话解释
 *   a. 「myBind 为什么返回新函数而不是立即执行，和 myCall/myApply 的本质区别是什么」
 *   b. 「new 场景下为什么 this 要指向新实例，怎么用 instanceof 判断自己是不是被 new 调用的」
 *   c. 「bind 时的参数和调用时的参数是怎么拼到一起的」
 * - 代码正确性 3 分：下面所有测试用例输出正确
 * - 边界处理 2 分：
 *   a. context 为 null / undefined 时，非严格模式下 this 应指向全局对象，不能报错
 *   b. context 是原始类型（数字、字符串、布尔、Symbol）时，要能正常装箱执行
 *   c. 只绑定不传参、只调用时传参、两边都传参，三种情况结果都正确
 *   d. 绑定函数被 new 调用：new 出来的实例 instanceof 原函数为 true；
 *      实例能访问原函数 prototype 上的方法；原函数的属性正常赋值到实例上
 *   e. 绑定函数被 new 调用时，绑定参数要拼上 new 时的参数（提示：回忆 1.14 手写 new）
 *   f. 不能污染 context（不要真的往 context 上挂属性，或挂了要清理）
 * - 表达清晰度 1 分：注释是自己的话，不是复述代码
 *
 * 自己写测试用例覆盖：普通绑定、返回值、柯里化两次传参、null/undefined 的 context、
 * 原始类型 context、new 绑定场景（含 instanceof 和原型方法访问）、只绑不传参。
 *
 * 提示 1：判断「自己是不是被 new 调用的」——new 出来的实例原型链上能找到原函数的
 * prototype，即 this instanceof fBound（前提是 fBound.prototype 继承了原函数的 prototype，
 * 回忆 1.15 的 Object.create）。
 * 提示 2：被 new 调用时，参数怎么传给原函数？回忆 1.14 里 new 是怎么把 arguments 传给构造函数的。
 * 提示 3：Symbol 类型装箱的 Symbol() 需要 new，和 Object(Symbol) 行为不一样，测试时可以避开。
 */

// ========== 在这里手写你的实现，写完在下方补充测试用例 ==========
Function.prototype.myBind = function (context, ...args) {
    // bind和call/apply的区别在于，bind返回一个闭包函数，后续使用不用每次都call/apply来绑定this；
    // 保存原始函数的this
    const originThis = this;

    // context是否为null/undefined，是则使用全局this
    context = context == null ? globalThis : context;

    if (typeof context !== 'object' && typeof context !== 'function') {
        context = Object(context);
    }

    // 绑定函数
    const bindFn = function (...otherArgs) {
        // 判断是否被new调用
        // 普通调用：当前函数的this instanceof bindFn时为false
        // new调用：当前函数的this instanceof bindFn时为true
        // new的时候this指向实例化对象，new绑定的优先级高于其他的绑定this方式；
        const truthyThis = this instanceof bindFn ? this : context;
        // args是初始化的预设参数，otherArgs是后面传入的参数，所以这里拼接先传入预设参数
        return originThis.apply(truthyThis, [...args, ...otherArgs]);
    }

    // 如果被new调用，处理原型链指向
    if (originThis.prototype) {
        bindFn.prototype = Object.create(originThis.prototype);
    }

    return bindFn;
}

// 测试用例
function makeFood(f1, f2) {
    console.log(`${this.name}做了${f1}和${f2}`);
}

// 普通绑定
const Wang = { name: "老王饭馆" };
const WangMakeFood = makeFood.myBind(Wang, "红烧肉");
WangMakeFood("麻婆豆腐");
// 老王饭馆做了红烧肉和麻婆豆腐 ✅

// 柯里化
const WangMakeMeet = makeFood.myBind(Wang, "红烧肉");
WangMakeMeet("麻婆豆腐");
WangMakeMeet("糖醋里脊");

// new调用
function canteen(name,city) {
    this.name = name;
    this.city = city;
}
canteen.prototype.sayHi = function () {
    console.log(`欢迎来到${this.name}，位于${this.city}`);
};

const newCanteen = canteen.myBind({ name: "假对象" }, "老王饭馆");
const bjCanteen = new newCanteen("北京");
console.log(bjCanteen.name);
console.log(bjCanteen.city);
bjCanteen.sayHi();
console.log(bjCanteen instanceof canteen);
console.log(Object.getPrototypeOf(newCanteen.prototype) === canteen.prototype);
