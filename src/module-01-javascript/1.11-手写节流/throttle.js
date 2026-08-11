/**
 * 1.11 手写节流（throttle）
 *
 * ============================================================
 * 验收标准（满分 10 分）：
 *
 * 维度一：概念理解（4分）
 *   - 能用自己的话解释节流和防抖的区别
 *   - 用代码注释说明你的理解
 *
 * 维度二：代码正确性（3分）
 *   - throttle 函数能正常运行
 *   - 支持 leading 和 trailing 两个参数
 *   - leading=true 时首次触发立即执行
 *   - trailing=true 时冷却结束后执行最后一次
 *
 * 维度三：边界处理（2分）
 *   - 处理 leading 和 trailing 同时为 false 的情况
 *   - this 指向正确
 *   - 参数传递正确
 *
 * 维度四：表达清晰度（1分）
 *   - 用自己的话写注释，不要复述代码
 *
 * ============================================================
 * 提示：
 * - 思路一：时间戳法（timestamp）实现 leading 行为
 * - 思路二：定时器法（timer）实现 trailing 行为
 * - 完整版需要结合两种思路
 * - 写之前想想：leading=false 且 trailing=true 时，第一次触发应该做什么？
 * - 想想：leading=true 且 trailing=true 时，连续触发后冷却结束，要不要补一次 trailing？
 * ============================================================
 */

// 防抖是在delay范围内，等用户停下来再执行；
// 节流则是在delay范围内，按照delay的间隔来生效，无论用户多频繁的触发；
function throttle(fn, delay, options = {}) {
  // options.leading  默认 true  —— 第一次触发是否立即执行
  // options.trailing 默认 true  —— 冷却结束后是否执行最后一次
  // leading=true，trailing=true：立即触发第一次，delay后又触发最后一次，总共2次；
  // leading=true，trailing=false：立即触发第一次，delay后不再触发最后一次，总共1次；
  // leading=false，trailing=true：不立即触发第一次，delay后触发第一次，总共1次；
  // leading=false，trailing=false：不立即触发第一次，delay后也不触发第一次，总共0次；

  // 上一次执行时间
  let lastTime = 0;
  // 定时器
  let timer = null;

  const leadingParams = options?.leading ?? true;
  const trailingParams = options?.trailing ?? true;

  return function (...args) {
    // 当前时间
    const nowTime = Date.now();
    // 满足时间间隔 且 立即执行第一次
    if ((nowTime - lastTime) >= delay && leadingParams) {
        // 更新上次执行时间
        lastTime = nowTime;
        // 清空定时器
        clearTimeout(timer);
        timer = null;
        return fn.apply(this, args);
    } else {
      // 用户在delay期间触发都应该在上一次生效时间内计算剩余时间，而不是delay；
      // 比如说上一次触发成功执行后，用户在50ms之后触发了最后一次，则应该在delay(200ms)的期间减去50ms的时间后触发training
      // 如果是第一次（lastTime==0且leading===false）则用当前时间，避免remaining是错误的值；
      if (lastTime === 0 && !leadingParams) lastTime = Date.now();
      const remaining = delay - (nowTime - lastTime);
      clearTimeout(timer);
      timer = setTimeout(() => {
        // remaining后需要执行最后一次
        if (trailingParams) {
          fn.apply(this, args)
          lastTime = Date.now();
        };
      }, remaining);
    }
  }
}

// ============================================================
// 测试用例（写完实现后取消下面的注释来验证）
// ============================================================

/*
function testThrottle() {
  const results = [];

  // 模拟连续触发 10 次，间隔 50ms
  // delay 设为 200ms
  const throttled = throttle((val) => {
    results.push({ val, time: Date.now() });
  }, 200, { leading: true, trailing: true });

  let count = 0;
  const startTime = Date.now();
  const timer = setInterval(() => {
    count++;
    throttled(count);
    if (count === 10) {
      clearInterval(timer);
      // 等 trailing 执行完
      setTimeout(() => {
        console.log('触发次数:', count);
        console.log('实际执行次数:', results.length);
        console.log('执行记录:', results.map(r => ({
          值: r.val,
          相对时间: r.time - startTime
        })));
        console.log('预期: 约5次执行（每200ms一次 + 可能的trailing）');
      }, 500);
    }
  }, 50);
}

testThrottle();
*/
