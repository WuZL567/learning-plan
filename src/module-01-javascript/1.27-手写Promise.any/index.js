/**
 * 1.27 手写 Promise.any（P0，能写代码，闭眼默写无 bug）
 *
 * 【要求】
 * 在下方实现 promiseAny(iterable) 函数，语义与 ES2021 原生 Promise.any 一致：
 * - 接收一个可迭代对象（数组/Set/类数组），返回一个新的 Promise
 * - 只要有一个输入项成功（fulfilled），整体就以【第一个成功的结果】resolve
 * - 所有输入项都失败，整体以 new AggregateError(errors, 'All promises were rejected') reject
 *   （AggregateError 的 errors 属性是包含所有失败原因的数组，顺序必须和输入顺序一致）
 * - 输入中的非 Promise 普通值，视为立即成功，用 Promise.resolve 包裹
 *
 * 【验收标准】
 * 1. 代码跑通，下面自测用例全部符合预期输出
 * 2. 边界：空数组立即 reject（AggregateError）；全失败时 errors 保序；普通值直接成功
 * 3. 注释用自己的话解释关键逻辑（尤其"成功分支为什么直接 resolve 就能提前退出"、
 *    "失败分支为什么只攒着不 reject"、"errors 为什么用下标写而不是 push"）
 * 4. 提交前自己跑一遍自测用例：node index.js
 *
 * 【提醒】
 * - 计数器检查必须放在回调内部，同步代码看不到微任务的成果（1.26 的教训）
 * - 空数组判断方向别写反：length === 0 才 reject
 * - 失败原因用下标写入 errors[i] 而不是 push，保证保序
 */
function promiseAny(iterable) {
    return new Promise((resolve, reject) => {
        const newArray = Array.from(iterable);
        const errors = new Array(newArray.length);
        let count = 0;

        if (newArray.length === 0) {
            // 直接reject空的AggregateError
            reject(new AggregateError([], "promise is empty!"));
            return;
        }

        newArray.forEach((item, index) => {
            Promise.resolve(item).then(
                value => {
                    resolve(value);
                },
                error => {
                    errors[index] = error;
                    count++;
                    if (count === newArray.length) {
                        reject(new AggregateError(errors, "all promises were rejected"));
                    }
                },
            );
        });
    });
}

// ==================== 自测用例（提交前跑一遍：node index.js） ====================
// case1: 有一个立即成功 → resolve 该值
promiseAny([Promise.reject(new Error('a')), Promise.resolve(1)]).then(
    v => console.log('case1 ✅ resolve:', v),
    e => console.log('case1 ❌ reject:', e.message)
);

// case2: 全部失败 → AggregateError，errors 保序
promiseAny([Promise.reject('x'), Promise.resolve(2).then(() => { throw 'y' })]).then(
    v => console.log('case2 ❌ resolve:', v),
    e => console.log('case2 ✅ reject: AggregateError =', e instanceof AggregateError, 'errors =', JSON.stringify(e.errors))
);

// case3: 空数组 → 立即 reject AggregateError
promiseAny([]).then(
    v => console.log('case3 ❌ resolve:', v),
    e => console.log('case3 ✅ reject: AggregateError =', e instanceof AggregateError, 'message =', e.message)
);

// case4: 普通值 → 直接成功（同时存在的失败不影响）
promiseAny([1, Promise.reject('slow')]).then(
    v => console.log('case4 ✅ resolve:', v),
    e => console.log('case4 ❌ reject:', e)
);

// case5: 第一个成功晚到 → 跳过先落定的失败，等成功的来
promiseAny([new Promise(res => setTimeout(() => res('fast'), 10)), Promise.reject('fail')]).then(
    v => console.log('case5 ✅ resolve:', v),
    e => console.log('case5 ❌ reject:', e)
);
