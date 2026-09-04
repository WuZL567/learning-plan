/**
 * 5.5 XSS防御：输出转义
 *
 * 要求：
 * 1. 实现 escapeHTML 函数，转义 HTML 特殊字符：& < > " ' /
 * 2. 转义规则：
 *    & -> &amp;
 *    < -> &lt;
 *    > -> &gt;
 *    " -> &quot;
 *    ' -> &#x27;
 *    / -> &#x2F;
 *
 * 3. 测试用例：
 *    输入：'<script>alert("xss")</script>'
 *    输出：'&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 *
 * 验收标准：
 * - 代码能正确转义所有特殊字符
 * - 考虑边界情况（空字符串、null、undefined）
 * - 用注释解释为什么要转义这些字符
 */

function escapeHTML(str) {
  const strMap = new Map();
  strMap.set('&', '&amp;');
  strMap.set('<', '&lt;');
  strMap.set('>', '&gt;');
  strMap.set('"', '&quot;');
  strMap.set("'", '&#x27;');
  strMap.set('/', '&#x2F;');

  return str.replace(/[&<>"'\/]/g, char => strMap.get(char));
}

// 测试用例
console.log(escapeHTML('<script>alert("xss")</script>'));
// &lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;
console.log(escapeHTML('Hello & "World"'));
// Hello &amp; &quot;World&quot;
console.log(escapeHTML('<img src=x onerror=alert(1)>'));
// &lt;img src=x onerror=alert(1)&gt;
