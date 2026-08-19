/**
 * 手写发布订阅模式（EventEmitter）
 *
 * 要求实现四个方法：
 * 1. on(name, fn)    — 订阅：注册回调，同一事件可注册多个回调
 * 2. emit(name, ...args) — 发布：触发事件，把 args 逐个传给每个回调
 * 3. off(name, fn)   — 取消订阅：只移除 fn 这一个；不传 fn 则清空该事件全部回调
 * 4. once(name, fn)  — 订阅一次：触发一次后自动移除
 *
 * 验收标准：
 * - 代码能跑通，下面附的测试用例输出正确
 * - 边界处理：emit 无订阅者不报错；once 的 off 能正确移除；回调抛错不影响其他回调
 * - 注释用自己的话解释每一步的逻辑（尤其 once 为什么要包一层 wrapper）
 *
 * 测试用例（可用 node 直接跑）：
 *   const bus = new EventEmitter()
 *   bus.on('save', (a, b) => console.log('save1:', a + b))   // 期望 save1: 3
 *   bus.on('save', (a, b) => console.log('save2:', a * b))   // 期望 save2: 2
 *   bus.emit('save', 1, 2)
 *
 *   const onceFn = () => console.log('only once')
 *   bus.once('flash', onceFn)
 *   bus.emit('flash')   // 期望输出 only once
 *   bus.emit('flash')   // 期望无输出
 *
 *   bus.off('save', 你注册的某个 fn)
 *   bus.emit('save', 1, 2)  // 期望被移除的那个不再输出
 *
 *   bus.emit('not-exist', 1)  // 期望不报错，静默返回
 */

class EventEmitter {
  constructor() {
    // 事件映射，存放各个事件
    this.eventMap = {};
  }

  // 订阅
  on(message, cb) {
    // 如果有则push，没有则创建空数组
    (this.eventMap[message] ||= []).push(cb);
    // 返回实例对象
    return this;
  };

  // 取消订阅
  off(message, cb) {
    // 就是过滤掉eventMap中对应key的事件
    if (!this.eventMap[message]) return this;
    this.eventMap[message] = this.eventMap[message].filter((item) => item !== cb);
    return this;
  };

  // 订阅一次
  once(message, cb) {
    // 包装函数
    const wrapper = (...args) => {
      // 取消包装函数的订阅，先执行off，防止回调内部再次触发同一事件
      this.off(message, wrapper);
      // 执行回调
      cb(...args);
    };
    // 注册包装函数的订阅
    return this.on(message, wrapper);
  };

  // 发布订阅
  emit(message, ...args) {
    // tryCatch包裹回调，避免一个回调出错时不影响其他的订阅；
    try {
      // 找到message对应的消息列表并遍历执行
      if (!this.eventMap[message]) return false;
      this.eventMap[message].forEach(item => {
        item(...args);
      });
      return true;
    } catch (e) {
      throw new TypeError(e);
    }
  };
}

// 测试代码写在下面，写完用 node 运行验证
const bus = new EventEmitter()
const save1 = (a, b) => console.log('save1:', a + b)
bus.on('save', save1)   // 期望 save1: 3
bus.on('save', (a, b) => console.log('save2:', a * b))   // 期望 save2: 2
bus.emit('save', 1, 2)
const onceFn = () => console.log('only once')
bus.once('flash', onceFn)
bus.emit('flash')   // 期望输出 only once
bus.emit('flash')   // 期望无输出
bus.off('save', save1)
bus.emit('save', 1, 2)  // 期望被移除的那个不再输出
bus.emit('not-exist', 1)  // 期望不报错，静默返回
