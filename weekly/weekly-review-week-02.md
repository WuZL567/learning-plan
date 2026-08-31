# 周复盘 Week 02（真题考察）

**考察范围**：冲刺块1 CSS（3.11-3.14 居中 + 选择器优先级）、冲刺块2 存储（6.1-6.9 Cookie/localStorage/sessionStorage/IndexedDB）
**预计用时**：40 分钟
**满分**：10 分（概念题 3 道 × 2 分 = 6 分，手写题 1 道 = 4 分）
**通过标准**：8 分及以上

**选题依据**（逐条引用 dialogue 薄弱点）：
- 6.2 验收：httpOnly 下 document.cookie 读写行为答反（写"能读取无法写入"，实际完全不可见）→ 题2
- 6.3 验收：CSRF Token 只答名目没答"攻击者为什么拿不到"；GET 能否发起 CSRF 不知道 → 题2
- 6.9 验收："sessionStorage 和 Cookie 的会话是同一个会话吗"答"是"——会话两种含义混淆（标签页会话 vs 浏览器进程会话）→ 题1
- 6.6 验收：会话 Cookie 串联没接住；容量"共享配额"答错 → 题1
- 3.11-3.13 验收：margin:auto 机制理解错误（"和父级的距离"），实际是平分剩余空间 → 手写题
- 3.14 验收：元素选择器归入第三级致两例全错；伪类(:hover) vs 伪元素(::before) 混淆 → 题3
- 6.4 验收：JWT 无状态横向扩展首次答不出（打回一次）→ 题1 串联

---

## 概念题

### 题目1 🗡️ 字节跳动 · 前端一面（2 分）

> 说一下 cookie、localStorage、sessionStorage 的区别？你项目里的登录 token 存在哪里，为什么？

**答题提示**：从容量、生命周期、作用域、携带方式四维展开（6.9 总纲：存哪 → 存多久 → 存多大 → 怎么带）。
**历史 bug 提醒**：⚠️ "会话"有两种含义——sessionStorage 的会话是**标签页会话**（关标签页就清），会话 Cookie 是**浏览器进程会话**（关标签页还在，关浏览器才清）。两者不是同一个会话。

cookie：～4KB，支持设置expires/max-age来设置生命周期，不设置则是会话Cookie，支持设置domain/path作用域，浏览器自动携带特性，存放Token，下发时自动携带，用户无感知；
localStorage：～5MB，持久型存储，不主动删除不会被清理，同源（同协议+同域名+同端口），不自动携带；
sessionStorage：～5MB，会话型存储，标签页关闭时被清理，同源（同协议+同域名+同端口）+ 单标签页，不自动携带；
会话型Cookie ≈ sessionStorage，持久型Cookie ≈ localStorage；

### 题目2 🗡️ 腾讯 · 前端一面（2 分）

> CSRF 攻击的原理是什么？如何防御？httpOnly 能防 CSRF 吗，为什么？

**答题提示**：攻击链路四步讲全（已登录 → 诱导 → 借自动携带 → 得手），防线按"源头断 / 服务端查来源 / Token 校验"三层讲。
**历史 bug 提醒**：⚠️ 两处——httpOnly 下的 Cookie 对 JS 完全不可见（读不到也写不了，别答反）；CSRF Token 必须讲清"攻击者的页面为什么拿不到 Token"（跨域读不到你页面内容），不能只报名字。

原理：受害者登录目标网站后，浏览器获取到你的Cookie并保存，然后引导受害者点击攻击网站的超链接，攻击网站会访问目标网站的接口请求，此时浏览器会自动携带目标网站的Cookie，所以可以伪造请求下发到目标网站达成攻击；

防御：SameSite：Lax/Strict/None，None是允许任何跨站请求携带Cookie，Strict禁止跨域接口请求，Lax则是允许跨域顶层导航的请求，但是还有风险，跨域顶层导航的GET请求还是携带Cookie；服务端校验Token，下发时携带服务端生成的随机Token，由服务端校验，因为跨域无法获取我的界面内容中的Token，所以无法伪造攻击；

httpOnly可以防止XSS攻击，没法防CSRF，因为httpOnly是避免读取和编写Cookie，但是CSRF并不需要知道你的Cookie，只是借助浏览器自动线携带Cookie的特性，用来伪造请求达到攻击的目的；

### 题目3 🗡️ 阿里 · 前端一面（2 分）

> 计算这两个选择器的优先级，并说说伪类（:hover）和伪元素（::before）在权重上有什么区别？
> `#app .box a:hover` 和 `div .nav ul li`

**答题提示**：四位计数 (内联, ID, 类·属性·伪类, 类型·伪元素)，逐位比较不进位。
**历史 bug 提醒**：⚠️ 类型选择器（div、li）在**第四级**，不在第三级——上轮把元素归错级导致两个例子全算错，这次别再错。

内联，ID，类/属性选择器/伪类，元素/伪元素
`#app .box a:hover`：内联（0）ID（1）类/属性选择器/伪类（2）元素/伪元素（1）-> 0,1,2,1(大)
`div .nav ul li`：   内联（0）ID（0）类/属性选择器/伪类（1）元素/伪元素（3）-> 0,0,1,3(小)

伪类（:hover）和伪元素（::before）的权重区别：伪类权重大于伪元素权重；

---

## 手写题

### 题目4 🗡️ 字节跳动 · 二面（4 分）

> 两个小实现，总用时约 15 分钟：
>
> 1. 用**两种方案**写一个子元素在父容器中水平垂直居中（子元素高度不确定），写出 HTML + CSS。
> 2. 写一个 cookie 工具函数：`setCookie(name, value, days)`、`getCookie(name)`、`delCookie(name, path)`。

**答题提示**：居中方案优先 absolute+transform 和 grid 的 place-items（各自一句话说清原理）；cookie 删除的标准写法是"让 Cookie 立即过期"，注意 path 必须与设置时一致。
**历史 bug 提醒**：⚠️ margin:auto 是**自动平分剩余空间**，不是"和父级的距离"；删 cookie 必须带 path；httpOnly 的 cookie JS 删不了（说明原因即可，不用写代码处理）。

#### 1.1 水平垂直居中方案1
<div class="parent">
    <div class="child"></div>
</div>
<style>
    .parent {
        // 父级相对定位
        position: relative;
        width: 600px;
        height: 400px;
    }
    .child {
        // 子级绝对定位
        position: absolute;
        top: 50%;
        left: 50%;
        // 反向偏移自身宽度和高度的一半；
        transform: translate(-50%, -50%);
    }
</style>

#### 1.2 水平垂直居中方案2
<div class="parent">
    <div class="child"></div>
</div>
<style>
    .parent {
        width: 600px;
        height: 400px;
        // 父级采用表格布局
        display: grid;
        // 采用place-items，是align-items和justify-items的共同效果；
        place-items: center;
    }
</style>

#### 2 cookie工具函数
// 设置了httpOnly的cookie无法读取和修改；
class cookie {
    function getCookie(name) {
        // 当前的cookie字符串
        const curCookieStr = document.cookie;
        // 解构成对象
        const cookieObj = curCookieStr.split('; ').map(i => i.split('=')).reduce((result, item) => {
            result[item[0]] = item[1];
            return result;
        }, {});
        return cookieObj[name] || '';
    };
    function setCookie(name, value, days) {
        const time = days * 24 * 60 * 60;
        // 直接接到尾部
        document.cookie = `${name}=${value}; max-age=${time}`;
    };
    function delCookie(name, path) {
        // 没有删除cookie的API，但是可以设置过期时间，浏览器检查到过期时间主动清理的，带上name和path是为了定位到具体是哪一条；
        document.cookie = `${name}=""; path=${path || '/'}; max-age=0`;
    };
}

**评分表（导师填写）**：

| 题号 | 分值 | 得分 | 扣分原因 |
|:---:|:---:|:---:|---------|
| 题1 | 2 | 1.5 | 深挖不足 -0.5：Token 存放只答了"自动携带无感知"的便利性，没讲安全权衡 |
| 题2 | 2 | 2 | 复验通过（SameSite 三值 + Secure 真实作用修正） |
| 题3 | 2 | 2 | 复验通过（0,0,1,3 修正） |
| 题4 | 4 | 4 | 复验通过（place-items 移位 + cookie 三函数重写正确） |
| **总分** | **10** | **9.5** | **✅ 通过（≥8）** |

**复验记录（2026-08-31）**：题2/题3/题4 全部修正通过。delCookie 第三轮修正：name 变量插值（`${name}`）、path 去引号（`path=${path || '/'}`，引号会破坏与设置时的一致性）、注释讲清"浏览器主动清理 + name/path 定位"机制。getCookie 与 delCookie 都犯过"变量名当字面量"的错误，已第二次修正，需警惕。

小瑕疵（不计分）：getCookie 对 value 含 `=` 的值会截断（Base64 padding 场景，可只切第一个 `=`）；setCookie 注释"直接接到尾部"为旧话未更新。

---

## 批改明细

### 题1：1.5/2

**✅ 对的部分**：
- 四维展开（容量/生命周期/作用域/携带方式）全部正确
- **历史 bug 修复成功**：会话概念没再混淆——"会话型 Cookie ≈ sessionStorage，持久型 Cookie ≈ localStorage"的类比正确（只是类比，没说是同一个会话）

**❌ 扣 0.5**：深挖不足。题目问"Token 存在哪里，为什么"，你只答了便利性（自动携带、用户无感知），没答**安全权衡**。面试官真正想听的是这个对比：
- 存 **httpOnly Cookie**：JS 读不到（防 XSS 偷），但浏览器自动携带 → 有 CSRF 风险，要靠 SameSite + CSRF Token 兜底
- 存 **localStorage**：防 CSRF（请求头手动带，攻击者页面带不了），但 XSS 一注入就一读就走，无 httpOnly 防线

### 题2：1.5/2

**✅ 对的部分**：
- 攻击链路四步完整正确
- **历史 bug 修复成功**：CSRF Token 讲清了"跨域无法获取我界面内容中的 Token，所以无法伪造"——上轮只报名字，这轮讲了原理
- httpOnly 与 CSRF 的关系完全正确："CSRF 不需要知道 Cookie 内容，只借浏览器自动携带"

**❌ 扣 0.5**：SameSite 取值写串了。你写 "SameSite：Lax/Secure"——SameSite 只有三个值：**Strict / Lax / None**。Secure 是独立的另一个属性，只管"仅 HTTPS 携带"，跟跨域没关系。你说"Secure 禁止跨域接口请求"是错的，正确说法是 **SameSite=None** 允许跨站携带（且必须配 Secure）。Lax 的行为你说对了（跨站顶层导航带，iframe/fetch 不带）。

### 题3：1.5/2

**✅ 对的部分**：
- **历史 bug 修复成功**：四位分类这次全对（内联 / ID / 类·属性·伪类 / 元素·伪元素），元素选择器正确归入第四级
- `#app .box a:hover` = 0,1,2,1 ✅ 正确
- 伪类（第三级）> 伪元素（第四级）✅ 正确

**❌ 扣 0.5**：`div .nav ul li` 数错了。你写 0,0,2,3——.nav 是**唯一的类**，哪里来的 2 个？正确：div（第四级）+ .nav（第三级）+ ul（第四级）+ li（第四级）= **(0, 0, 1, 3)**。虽然两个选择器谁大谁小的结论没受影响（第一位 ID 已定胜负），但计数错误面试官一定追问。

### 题4：2.25/4（CSS 1.5/2 + cookie 0.75/2）

**CSS 部分**：
- 方案1（absolute + translate）✅ 完整正确，注释"反向偏移自身宽度和高度的一半"讲清了参照物
- 方案2 ❌：**place-items 写错元素了**。place-items 是网格**容器**（父级）的属性，作用于子元素——正确写法是 `.parent { display: grid; place-items: center; }`。写在 .child 上不产生居中效果，代码跑不出来。注释（align-items + justify-items 简写）是对的

**cookie 部分**：
- getCookie：思路对（解析 document.cookie 成对象），但 **`cookieObj.name` 应为 `cookieObj[name]`**——name 是传入的变量，用点号等于永远取键名为 "name" 的 cookie，任何参数都取不到。变量取键必须括号访问
- setCookie：**max-age 单位错**——max-age 单位是秒，days 天应换算 `days * 24 * 60 * 60`。你写 `days / 24 / 60 / 60` 算了个没用上的变量，又直接把 days 当天数塞进 max-age（设 7 天实际 7 秒过期）。另外赋值不用拼 `document.cookie; ` 前缀，直接写即可
- delCookie：**全错**。① cookie 的 path 属性**不会出现在 document.cookie 字符串里**，getCookie('path') 拿不到任何东西，这个判断逻辑不存在；② 删除标准写法：让 Cookie 立即过期并**带上 name 和一致的 path**——`document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + (path || '/')`；③ 你的写法既没用到 name 参数，expires 格式也不对
- 语法错误：`class cookie { const getCookie = ... }`——class 里不能直接放 const 箭头函数（要写方法或 static），这段代码**直接报错跑不了**
- ✅ httpOnly 注释这次对了（6.2 答反过的点修复成功）

---

## 导师总结

**最扎实的一个点**：概念理解修复率高——会话概念（题1）、CSRF Token 原理（题2）、httpOnly 读写行为（题4 注释）三个历史薄弱点全部修复，且不是背答案（题2 的 Token 原理用自己的话讲了完整机制）。

**最薄弱的一个点**：手写代码。cookie 工具三个函数几乎全错（变量取键、单位换算、删除逻辑），还叠了一个 class 语法错误——概念能说清，一动手就露馅。这正是冲刺阶段三 AI demo（9/19 起写代码）的最大隐患。CSS 方案2 的 place-items 位置也是同一类问题：知道概念，落笔时元素搞反。

**修改要求**（改完重新提交，全部自己重写）：
1. 题3：重算 `div .nav ul li` 的优先级
2. 题2：重写 SameSite 防御那一段（三值 + 各自行为 + Secure 的真实作用）
3. 题4：方案2 修正 place-items 位置；cookie 工具三个函数重写（getCookie 用变量取键、setCookie 正确换算天数、delCookie 用标准过期写法 + path 默认值），注释讲清每步逻辑



