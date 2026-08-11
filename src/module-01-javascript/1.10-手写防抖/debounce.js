/**
 * 1.10 手写防抖（debounce）
 *
 * 验收标准（满分10分）：
 * 1. 概念理解（4分）：用自己的注释解释防抖是什么，leading/trailing 参数的作用
 * 2. 代码正确性（3分）：以下测试用例全部通过
 * 3. 边界处理（2分）：处理 this 绑定、参数透传、cancel 方法、leading+trailing 组合
 * 4. 表达清晰度（1分）：注释用自己的话，不复制文档
 */

// 防抖就是为了防止用户频繁触发操作而出现的功能；
// 在指定的延迟时间delay内，leading：是否立即执行第一次，delay内多次触发都不执行；trailing：是否执行最后一次，默认是执行的；
function debounce(fn, delay, options = {}) {
    let timer = null;
    // 是否立即执行第一次，默认不执行
    const leadingParams = options?.leading ?? false;
    // 是否执行最后一次，默认执行
    const trailingParams = options?.trailing ?? true;

    // leading/trailing的三种场景：
    // leading：true，trailing：false； 立即执行第一次，总共执行一次；
    // leading：false，trailing：true； 不会立即执行第一次，delay结束后执行第一次，总共执行一次；
    // leading：true，trailing：true； 立即执行第一次，delay结束后执行第二次，总共执行二次；

    const debounced = function (...args) {
        // 是否立即执行第一次，当配置满足并且非执行中状态时，执行第一次；
        const leading = leadingParams && timer === null;
        // 清空定时器
        clearTimeout(timer);
        // 重新赋值
        timer = setTimeout(() => {
            // 执行回调之后，重置timer状态
            timer = null;

            if (trailingParams) {
                // 需要执行最后一次
                return fn.apply(this, args);
            }
        }, delay);

        if (leading) {
            // 立即执行
            return fn.apply(this, args);
        }
    };

    debounced.cancel = function () {
        // 清空定时器
        clearTimeout(timer);
        timer = null;
    }

    return debounced;
}

// 测试1：基础防抖 - 多次调用只执行最后一次
const fn1 = jest.fn()
const debouncedFn1 = debounce(fn1, 100)
debouncedFn1(); debouncedFn1(); debouncedFn1()
// 等待150ms后，fn1 应该只被调用1次

// 测试2：leading: true - 第一次立即执行
const fn2 = jest.fn()
const debouncedFn2 = debounce(fn2, 100, { leading: true, trailing: false })
debouncedFn2() // 立即执行
debouncedFn2() // 在100ms内再次调用，不执行
// fn2 应该只被调用1次（第一次立即执行的）

// 测试3：trailing: false - 不执行尾随
const fn3 = jest.fn()
const debouncedFn3 = debounce(fn3, 100, { trailing: false })
debouncedFn3()
// 等待150ms后，fn3 应该没有被调用（因为没有 leading，也没有 trailing）

// 测试4：cancel 方法
const fn4 = jest.fn()
const debouncedFn4 = debounce(fn4, 100)
debouncedFn4()
debouncedFn4.cancel()
// 等待150ms后，fn4 应该没有被调用

// 测试5：this 绑定和参数透传
const obj = { value: 42 }
obj.fn = debounce(function (x, y) { return this.value + x + y }, 100)
obj.fn(1, 2)
// 等待150ms后，返回值应该是 45
