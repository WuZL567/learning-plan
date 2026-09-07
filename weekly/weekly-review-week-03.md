# 第三次周复盘（Week 3）

**日期：** 2026-09-07  
**考察范围：** 模块4 浏览器与网络（4.8-4.26）、模块5 Web安全（5.1-5.12）、模块7 Vue3（7.1-7.6）  
**预计用时：** 40 分钟  
**满分：** 10 分（概念题 3 题共 6 分 + 手写题 1 题 4 分）

---

## 选题依据（薄弱点分析）

根据本周 dialogue 记录，你的薄弱点主要集中在：

1. **transform vs left 的渲染流程差异**（4.24 dialogue）：首次回答"transform不触发回流"时未说出合成层机制
2. **DocumentFragment 回流次数计算**（4.24 dialogue）：回答1001次有误，实际1000次
3. **同站 vs 跨站概念边界**（5.10-5.12 dialogue）：对协议差异、公共后缀、子域名攻击场景判断错误2个
4. **ref 数据类型理解偏差**（7.4-7.6 dialogue）：认为"ref是基本数据类型，reactive是对象类型"
5. **watch 数据源写法**（7.4-7.6 dialogue）：三种写法答错
6. **watch 返回值用途**（7.4-7.6 dialogue）：不知道返回停止函数

---

## 题目

### 概念题1（2分）🗡️ 字节跳动 二面

> 面试官问：你提到用 `transform` 做动画性能更好，能具体说说为什么吗？浏览器的渲染流水线是怎么处理 `transform` 和 `left` 的？

**答题提示：** 回答时要说出完整的三阶段渲染流程，以及两者分别在哪个阶段处理。你之前说过"transform不触发回流"，但要讲清楚为什么不触发。

**你的回答：**
<!-- 在这里填写你的答案 -->

因为transform只在合成层Composite处理，跳过布局Layout和绘制Paint，但是left/top就会影响布局，然后绘制，最后合成；
正常的渲染流程是：Layout布局 -> Paint绘制 -> Composite合成；
transform只有Composite阶段处理，但是top/left就会改变布局；所以transform不会触发回流，top/left会触发回流；

---

### 概念题2（2分）🗡️ 阿里巴巴 三面

> 面试官问：你们项目用了 SameSite=Strict 防 CSRF，但有个场景：用户从支付宝支付成功后跳转回你们网站，结果显示"未登录"。你觉得是什么原因？怎么解决？另外，如果攻击者控制了你们的子域名 `ads.yoursite.com`，SameSite 还能防住吗？

**答题提示：** 第一问考察 SameSite 的三种模式区别，第二问考察"同站"的定义边界。你之前在场景E判断错了 `blog.github.io → docs.github.io` 是否同站。

**你的回答：**
<!-- 在这里填写你的答案 -->

SameSite=Strict，会禁止跨域请求携带Cookie，属于安全性最高的防范，也会导致从支付宝再回到自身网站时，不携带Cookie，所以无法登录；
可以换成Lax，能防住大部分CSRF，也支持从顶层导航跨域请求后携带Cookie，并且禁止表单POST请求携带Cookie；或者结合Cookie Token来使用；
SameSite只能防住跨站的CSRF，不能防住同站的CSRF。

---

### 概念题3（2分）🗡️ 腾讯 二面

> 面试官问：Vue3 的 `ref` 和 `reactive` 有什么区别？我看你代码里对一个对象用了 `ref`，为什么不用 `reactive`？另外，`watch` 监听一个 `ref` 和监听 `reactive` 对象的某个属性，写法有什么不同？

**答题提示：** 第一问你之前答错了"ref是基本数据类型，reactive是对象类型"。第二问考察 watch 数据源的三种写法，你之前写错了。

**你的回答：**
<!-- 在这里填写你的答案 -->

ref可以用在所有的类型，但是reactive只能用在对象/数组类型，ref定义的变量访问时需要.value访问，reactive不需要；
reactive解构后会丢失响应性，需要toRef/toRefs来保证响应性；
监听ref：直接传变量，或者()=>xxx.value;
监听reactive对象的某一个属性，()=>xxx.name;
监听整个reactive对象，直接传变量；

---

### 手写题（4分）🗡️ 美团 二面

> 面试官说：写一个函数 `batchInsertDOM(count)`，往页面插入 `count` 个 `<li>` 元素（内容是序号），要求只触发 **1 次回流**。然后再写一个 `startWatch()` 函数，用 Vue3 的 `watch` 监听一个 ref 变量 `counter`，每次 `counter` 变化时打印新旧值，并返回一个可以停止监听的函数。

**评分标准：**
- `batchInsertDOM` 正确使用 DocumentFragment（1.5分）
- `startWatch` 正确监听 ref 并拿到新旧值（1分）
- 返回停止函数（1分）
- 代码注释说明关键逻辑（0.5分）

**你的代码：**

```javascript
// ========== 任务1：批量插入DOM，只触发1次回流 ==========
function batchInsertDOM(count) {
    if (isNaN(count) || count <= 0) {
        return;
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const li = document.createElement('li');
        li.textContent = `Item ${i}`;
        fragment.appendChild(li);
    }

    document.querySelector('ul').appendChild(fragment);
}


// ========== 任务2：watch监听ref并返回停止函数 ==========
import { ref, watch } from 'vue'
const counter = ref(0);
const startWatch = () => {
    return watch(counter, (newVal, oldVal) => {
        console.log('新值: ', newVal);
        console.log('旧值: ', oldVal);
    });
};


// 测试代码（你可以保留或删除）
// batchInsertDOM(1000)
// const stop = startWatch()
// counter.value++  // 应该打印新旧值
// stop()           // 停止监听
// counter.value++  // 不再打印
```

---

## 评分表（由导师填写）

| 题目 | 得分 | 扣分原因 |
|------|------|----------|
| 概念题1 |  |  |
| 概念题2 |  |  |
| 概念题3 |  |  |
| 手写题 |  |  |
| **总分** |  |  |

---

## 导师总结（由导师填写）

**最扎实的一个点：**

**最薄弱的一个点：**

**改进建议：**
