/**
 * 1.25 手写 Promise.race
 *
 * 验收标准：
 * 1. promiseRace(iterable) 接收一个可迭代对象（数组），返回一个新的 Promise
 * 2. 第一个落定的 promise 决定整体结果：第一个 resolve → 整体 resolve；第一个 reject → 整体 reject
 * 3. 输入为空数组时，返回一个永远 pending 的 promise（和 Promise.all 不同！）
 * 4. 非 promise 值（普通值）立即视为已落定，第一个普通值直接胜出
 * 5. 用你自己的话写注释，解释每一步为什么这么做
 *
 * 提示：
 * - 回忆一下 Promise 状态机的特性：状态一旦落定，后续操作全部无效
 * - race 不需要计数器，也不需要结果数组——它只做"转发"这件事
 * - 想想：怎么把每个输入项的结果转发给外层 promise？
 *
 * 自测用例（可直接在 node 里跑）：
 *   输入 [Promise.resolve(1), new Promise(() => {})] // -> 立即 resolve 1（第二个永远 pending 也不影响）
 *   输入 [new Promise((_, rej) => setTimeout(() => rej('too slow'), 100)), Promise.resolve('fast')]
 *     // -> resolve 'fast'（虽然第一个最终会 reject，但它是慢的那个，结果作废）
 *   输入 [] // -> 永远 pending，不会 resolve 也不会 reject
 *   输入 [1, 2] // -> 立即 resolve 1（普通值直接胜出）
 */

function promiseRace(iterable) {
  return new Promise((resolve, reject) => {
    const newArray = Array.from(iterable);
    newArray.forEach((item, index) => {
      // 无论是resolve或reject，谁先完成就返回谁，利用Promise状态不可逆的机制，直接转发就实现了race；
      Promise.resolve(item).then(
        (value) => resolve(value),
        (error) => reject(error),
      );
    });
  });
}

promiseRace([Promise.resolve(1), new Promise(() => {})]).then(v => console.log(v));
promiseRace([new Promise((_, rej) => setTimeout(() => rej('too slow'), 100)), Promise.resolve('fast')]).then(v => console.log(v));
promiseRace([]).then(v => console.log("打印了吗？"));
promiseRace([1, 2]).then(v => console.log(v));
promiseRace([Promise.reject(new Error('boom')), Promise.resolve(1)]).catch(e => console.log(`REJECT: ${e}`));

module.exports = promiseRace
