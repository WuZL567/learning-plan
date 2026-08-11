/**
 * ==========================================
 * 1.9 手写柯里化（curry）
 * ==========================================
 *
 * 验收标准：
 * 1. 实现 curry(fn) 函数，能将多参数函数转为柯里化版本
 * 2. 参数数量达到原函数参数个数时，立即执行并返回结果
 * 3. 参数不够时，返回一个新函数继续收集剩余参数
 * 4. curry 调用时可以一次传多个参数，如 curry(fn, a, b)(c)
 * 5. 支持占位符（可选，加分项）：允许跳过某个参数位置
 *
 * 提示：
 * - fn.length 可以获取函数的参数个数
 * - 用闭包存储已经收集到的参数
 * - 用 rest 参数（...args）收集每次传入的参数
 * - 每次调用时，把新参数和旧参数合并，检查数量是否足够
 *
 * 测试用例（实现后取消注释来验证）：
 *
 * function add(a, b, c) {
 *   return a + b + c
 * }
 *
 * const curriedAdd = curry(add)
 * console.log(curriedAdd(1)(2)(3))       // 期望输出: 6
 * console.log(curriedAdd(1, 2)(3))       // 期望输出: 6
 * console.log(curriedAdd(1)(2, 3))       // 期望输出: 6
 * console.log(curriedAdd(1, 2, 3))       // 期望输出: 6
 * console.log(curry(add, 1, 2)(3))       // 期望输出: 6
 */

// ========== 在这里写你的实现 ==========

function curry(fn, ...args) {
  return function curried(...more) {
    // more是新添加的参数
    // 如果已经添加的参数大于等于fn函数的参数，则直接调用自身fn即可
    const all = [...args, ...more];
    if (all.length >= fn.length) {
      return fn.apply(this, all);
    }

    // 返回自身来继续递归收集参数
    return function (...otherArgs) {
      // otherArgs是剩余参数
      // 调用curried函数来继续传入，这里传more不传all，避免args的参数重复。
      return curried.apply(this, [...more, ...otherArgs]);
    }
  }
}

// ========== 测试用例 ==========

function add(a, b, c) {
  return a + b + c
}

const curriedAdd = curry(add)

console.log('测试1 - curriedAdd(1)(2)(3):', curriedAdd(1)(2)(3))       // 期望: 6
console.log('测试2 - curriedAdd(1, 2)(3):', curriedAdd(1, 2)(3))       // 期望: 6
console.log('测试3 - curriedAdd(1)(2, 3):', curriedAdd(1)(2, 3))       // 期望: 6
console.log('测试4 - curriedAdd(1, 2, 3):', curriedAdd(1, 2, 3))       // 期望: 6
console.log('测试5 - curry(add, 1, 2)(3):', curry(add, 1, 2)(3))       // 期望: 6

// 边界测试：无参函数
function noop() {
  return 'noop'
}
const curriedNoop = curry(noop)
console.log('边界1 - 无参函数:', curriedNoop())                        // 期望: 'noop'

// 边界测试：单参函数
function identity(x) {
  return x
}
const curriedIdentity = curry(identity)
console.log('边界2 - 单参函数:', curriedIdentity(42))                   // 期望: 42
