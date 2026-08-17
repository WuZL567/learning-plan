/**
 * 1.26 手写 Promise.allSettled
 *
 * 验收标准：
 * 1. promiseAllSettled(iterable) 接收一个可迭代对象（数组），返回一个新的 Promise
 * 2. 等所有输入 promise 全部落定后才 resolve，不管成功还是失败，永不 reject
 * 3. 返回结果是一个数组，每个元素形如 { status: 'fulfilled', value } 或 { status: 'rejected', reason }
 * 4. 输入为空数组时，立即 resolve 一个空数组
 * 5. 非 promise 值（普通值）视为已 fulfilled
 * 6. 结果数组的元素顺序必须与输入顺序一致，与落定先后无关
 * 7. 用你自己的话写注释，解释每一步为什么这么做
 *
 * 提示：
 * - 和 all 的区别在哪？all 是"一票否决"，allSettled 是"等全班交卷，好坏都记录"
 * - 需要一个计数器记录"还剩几个没落定"，用下标直接写结果数组
 * - 注意：每个输入项的状态要分类处理，fulfilled 存 value，rejected 存 reason
 *
 * 自测用例（可直接在 node 里跑）：
 *   输入 [Promise.resolve(1), Promise.reject(new Error('boom'))]
 *     // -> 结果为 [{status:'fulfilled',value:1},{status:'rejected',reason:Error}]
 *   输入 [Promise.reject('a'), Promise.resolve(2), 3]
 *     // -> 顺序不能乱：rejected 的排最前面，普通值 3 是 fulfilled
 *   输入 [] // -> 立即 resolve []
 *   输入 [new Promise((res) => setTimeout(() => res('slow'), 500)), Promise.resolve('fast')]
 *     // -> 最终两个结果都在，slow 在后（顺序 = 输入顺序）
 */

function promiseAllSettled(iterable) {
    return new Promise((resolve, reject) => {
        const newArray = Array.from(iterable);
        // 结果是对象数组
        const result = new Array(newArray.length);
        // 计时器
        let count = 0;

        // 空数组直接resolve([])
        if (newArray.length === 0) {
            resolve([]);
            return;
        }

        newArray.forEach((item, index) => {
            // 直接处理item，是Promise则获取resolve之后的值，是原始值则返回原始值；
            Promise.resolve(item).then(
                // 成功：按index插入result中，status为fulfilled；
                value => {
                    result[index] = { status: "fulfilled", value: value };
                    count++;
                    // 全部执行完成之后，resolve所有的结果；
                    if (count === newArray.length) {
                        resolve(result);
                    }
                },
                // 失败：按index插入result中，status为rejected；
                error => {
                    result[index] = { status: "rejected", reason: error};
                    count++;
                    // 全部执行完成之后，resolve所有的结果；
                    if (count === newArray.length) {
                        resolve(result);
                    }
                },
            );
        });
    });
};

promiseAllSettled([Promise.resolve(1), Promise.reject(new Error('boom'))]).then(v => console.log(v));
promiseAllSettled([Promise.reject('a'), Promise.resolve(2), 3]).then(v => console.log(v));
promiseAllSettled([]).then(v => console.log(v));
promiseAllSettled([new Promise((res) => setTimeout(() => res('slow'), 500)), Promise.resolve('fast')]).then(v => console.log(v));

module.exports = promiseAllSettled
