/**
 * 1.24 手写 Promise.all
 *
 * 验收标准：
 * 1. Promise.all(iterable) 接收一个可迭代对象（数组），返回一个新的 Promise
 * 2. 所有 promise 都成功时，resolve 一个数组，顺序与输入一致（不是完成顺序！）
 * 3. 任何一个 promise 失败，整体立即 reject，携带第一个失败的原因
 * 4. 输入为空数组时，resolve 空数组
 * 5. 非 promise 值（普通值）直接视为已成功
 * 6. 用你自己的话写注释，解释每一步为什么这么做
 *
 * 提示：
 * - 可以用你自己写的 Promise 实现，也可以用原生 Promise 验证
 * - 想想：怎么记录结果？怎么计数？结果数组的顺序怎么保证？
 *
 * 自测用例（可直接在 node 里跑）：
 *   Promise.all([Promise.resolve(1), 2, Promise.resolve(3)]) // -> [1, 2, 3]
 *   Promise.all([]) // -> []
 *   Promise.all([Promise.reject(new Error('boom')), Promise.resolve(1)]) // -> reject 'boom'
 */

function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    // 可迭代对象数组；
    const newArray = Array.from(iterable);
    // 长度为传入数组的长度的空数组
    const result = new Array(newArray.length);
    // 计数器
    let len = 0;

    // 判断参数，如果为空则直接返回空数组
    if (newArray.length === 0) {
      resolve([]);
      return;
    }

    // 遍历数组，通过index来定位，将数据插入到result中
    newArray.forEach((item, index) => {
      // 如果item是promise，则执行resolve之后的值传给then，如果item是普通值，则执行resolve后还是自身，传给then
      Promise.resolve(item).then(
        (value) => {
          result[index] = value;
          len++;
          // 全部成功执行后，直接resolve所有的结果；
          if (len === result.length) {
            resolve(result);
          }
        },
        // 任意失败直接reject。
        (error) => reject(error),
      )
    });
  });
}

promiseAll([Promise.resolve(1), 2, Promise.resolve(3)]).then((v) => console.log(v));
promiseAll([]).then(v => console.log(v));
promiseAll([Promise.reject(new Error('boom')), Promise.resolve(1)]).catch(e => console.log('捕获到失败:', e.message));

module.exports = promiseAll
