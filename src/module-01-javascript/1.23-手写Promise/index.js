/**
 * 1.23 手写 Promise（P0 | 能写代码）
 *
 * 任务：实现基础版 MyPromise，把 1.22 学到的状态机翻译成代码。
 *
 * 必须实现：
 * 1. 三个状态：PENDING / FULFILLED / REJECTED
 * 2. resolve / reject 只生效一次（状态锁定，不可逆）
 * 3. then 返回新的 MyPromise，支持链式调用
 * 4. then 回调异步执行（用 setTimeout 模拟微任务）
 * 5. catch = then(undefined, onRejected) 语法糖
 * 6. 支持两种场景：executor 同步 resolve、异步 resolve（如 setTimeout 里 resolve）
 *
 * 验收标准（提交后我会跑以下用例）：
 * - 链式调用：resolve(1) 的 then 里 return v + 1，链上最终输出 3
 * - 状态锁定：resolve(1) 之后再 reject(2)，最终状态仍是 fulfilled、值仍是 1
 * - 异步 resolve：setTimeout 里才 resolve，then 回调仍能拿到值
 * - 错误传递：then 里 throw，链尾 catch 能接住
 * - 状态跟随：then 里 return 一个新的 MyPromise，链上拿到它的 resolve 值（值解包）
 *
 * 写之前想清楚三件事（1.22 都讲过）：
 * - 状态、值、失败原因存在哪？回调队列存在哪？
 * - then 被调用时，状态可能还是 PENDING，回调该放哪里？
 * - then 返回的新 Promise 什么时候被 resolve？由谁触发？
 */

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    // 状态，初始状态为pending
    this.status = PENDING;
    // 成功的值
    this.value = undefined;
    // 失败原因
    this.reason = undefined;
    // 成功状态回调函数列表
    this.fulfilledList = [];
    // 失败状态回调函数列表
    this.rejectedList = [];

    // resolve函数
    const resolve = (v) => {
      // 已经改变状态则不处理
      if (this.status !== PENDING) return;
      // 该状态为fulfilled
      this.status = FULFILLED;
      // 赋值操作
      this.value = v;
      // 处理回调列表中的回调函数
      this.fulfilledList.forEach(fn => fn(v));
    };

    // reject函数
    const reject = (e) => {
      // 已经改变状态则不处理
      if (this.status !== PENDING) return;
      // 该状态为rejected
      this.status = REJECTED;
      // 赋值操作
      this.reason = e;
      // 处理回调列表中的回调函数
      this.rejectedList.forEach(fn => fn(e));
    };

    // 立即执行执行器函数
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    // TODO: 返回新的 MyPromise。根据当前状态决定：立即执行回调，还是把回调存入队列
    // 首先处理回调函数的参数透传
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e };

    const newPromise = new MyPromise((res, rej) => {
      // 处理函数
      const handleFoo = (callback, value) => {
        // 在微任务队列中执行
        queueMicrotask(() => {
          try {
            const result = callback(value);
            // 如果等于自身，则抛出错误
            if (result === newPromise) throw new TypeError("循环引用错误！");
            // 如果上一个then返回promise，则回调参数是resolve的值，否则就是自身
            result instanceof MyPromise ? result.then(res, rej) : res(result);
          } catch (e) {
            rej(e)
          }
        });
      }

      // 判断上一次的状态，是立即执行还是存入回调列表
      if (this.status === FULFILLED) {
        // 已完成，立即执行
        handleFoo(onFulfilled, this.value);
      } else if (this.status === REJECTED) {
        // 已拒绝，立即执行
        handleFoo(onRejected, this.reason);
      } else {
        // pending，放到回调列表中
        this.fulfilledList.push(v => handleFoo(onFulfilled, v));
        this.rejectedList.push(e => handleFoo(onRejected, e));
      }
    });

    return newPromise;
  }

  catch(callback) {
    return this.then(null, callback);
  }

  finally(callback) {
    return this.then(
      v => MyPromise.resolve(callback()).then(() => v),
      e => MyPromise.resolve(callback()).then(() => { throw e }),
    );
  }

  // 静态方法
  static resolve(v) {
    return v instanceof MyPromise ? v : new MyPromise((res) => res(v));
  };

  static reject(e) {
    return new MyPromise((_, rej) => rej(e));
  };
}

// 下方可写测试用例自测（提交前自己跑一遍上面的验收标准）
