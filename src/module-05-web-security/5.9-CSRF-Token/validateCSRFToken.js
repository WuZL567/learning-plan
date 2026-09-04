/**
 * 5.9 CSRF防御：CSRF Token方案
 *
 * 场景：模拟后端校验 CSRF Token 的逻辑
 *
 * 要求：
 * 1. 实现 validateCSRFToken 函数
 * 2. 函数接收两个参数：
 *    - tokenFromRequest: 前端请求中携带的 Token
 *    - tokenInSession: 服务器 Session 中存储的 Token
 * 3. 返回值：
 *    - 如果两个 Token 相等，返回 { valid: true }
 *    - 如果不相等或任一为空，返回 { valid: false, reason: '具体原因' }
 *
 * 4. 需要考虑的边界情况：
 *    - Token 为 null/undefined/空字符串
 *    - Token 不匹配
 *
 * 验收标准：
 * - 代码逻辑正确，能通过所有测试用例
 * - 用注释解释为什么要对比两个 Token
 * - 用注释解释为什么 Token 为空时要拒绝请求
 */

function validateCSRFToken(tokenFromRequest, tokenInSession) {
  // 提示：先检查 Token 是否为空，再检查是否相等
  if (tokenFromRequest == null || tokenFromRequest === '') {
    return { valid: false, reason: "request的Token为空！" };
  }

  if (tokenInSession == null || tokenInSession === '') {
    return { valid: false, reason: "session的Token为空！" };
  }

  if (tokenFromRequest === tokenInSession) {
    return { valid: true };
  }

  return { valid: false, reason: "前端Token和后端Token不一致！" };
}

// 测试用例
console.log('=== 测试用例 ===');

// 用例1：Token 匹配，应该通过
console.log('用例1（Token匹配）:', validateCSRFToken('abc123', 'abc123'));
// 期望输出：{ valid: true }

// 用例2：Token 不匹配，应该拒绝
console.log('用例2（Token不匹配）:', validateCSRFToken('abc123', 'xyz789'));
// 期望输出：{ valid: false, reason: 'Token不匹配' }

// 用例3：请求中没有 Token，应该拒绝
console.log('用例3（请求Token为空）:', validateCSRFToken('', 'abc123'));
// 期望输出：{ valid: false, reason: '请求中缺少Token' }

// 用例4：Session 中没有 Token，应该拒绝
console.log('用例4（Session Token为空）:', validateCSRFToken('abc123', null));
// 期望输出：{ valid: false, reason: 'Session中缺少Token' }

// 用例5：都为空，应该拒绝
console.log('用例5（都为空）:', validateCSRFToken(null, undefined));
// 期望输出：{ valid: false, reason: '请求中缺少Token' }
