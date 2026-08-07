# 第19章：Web Storage

## 19.1 localStorage（持久存储）

**一句话解释：**
`localStorage` 是浏览器提供的**持久存储**——数据存进去之后，关闭浏览器、重启电脑都不会丢，除非你手动清除。

**餐厅比喻：**
`localStorage` 就像餐厅的**档案柜**——你把资料锁进去，关了店门、甚至换了一批员工，资料还在柜子里。下次开店直接打开柜子就能用。

~~~javascript
// ========== 存储：setItem(键, 值) ==========
localStorage.setItem("餐厅名", "老王饭馆");
localStorage.setItem("日流水", "8500");
localStorage.setItem("营业时间", JSON.stringify({ 开门: "09:00", 打烊: "22:00" }));

// ========== 读取：getItem(键) ==========
const 餐厅名 = localStorage.getItem("餐厅名");
console.log(餐厅名);  // 老王饭馆

const 日流水 = localStorage.getItem("日流水");
console.log(typeof 日流水);  // "string"（localStorage 只能存字符串！）

// 读取对象（需要 JSON.parse 还原）
const 营业时间 = JSON.parse(localStorage.getItem("营业时间"));
console.log(营业时间.开门);  // 09:00

// ========== 删除：removeItem(键) ==========
localStorage.removeItem("日流水");

// ========== 清空所有 ==========
localStorage.clear();

// ========== 判断是否包含某个键 ==========
console.log(localStorage.getItem("餐厅名") !== null);  // true
console.log("餐厅名" in localStorage);  // ❌ 不能用 in，localStorage 不是普通对象

// ========== 获取存储数量 ==========
console.log(localStorage.length);  // 2（存了两项）
~~~

---

## 19.2 sessionStorage（会话存储）

**一句话解释：**
`sessionStorage` 是浏览器提供的**会话级存储**——数据只在**当前标签页**中有效，关闭标签页后数据就被清除。

**餐厅比喻：**
`sessionStorage` 就像餐厅的**临时便签**——你写在上面的信息只在**今天营业期间**有效，一关门就扔掉了。

~~~javascript
// ========== API 和 localStorage 完全一样 ==========
sessionStorage.setItem("当前桌号", "3");
sessionStorage.setItem("点菜记录", JSON.stringify(["红烧肉", "麻婆豆腐"]));

const 桌号 = sessionStorage.getItem("当前桌号");
console.log(桌号);  // 3

const 记录 = JSON.parse(sessionStorage.getItem("点菜记录"));
console.log(记录);  // ["红烧肉", "麻婆豆腐"]

sessionStorage.removeItem("当前桌号");
sessionStorage.clear();
console.log(sessionStorage.length);
~~~

---

## 19.3 两者区别

| | localStorage | sessionStorage |
|---|---|---|
| 生命周期 | **永久**，除非手动清除 | **标签页关闭即清除** |
| 作用范围 | **同源的所有标签页**共享 | **仅当前标签页** |
| 存储大小 | 约 5-10MB | 约 5-10MB |
| API | setItem / getItem / removeItem / clear | 完全相同 |
| 餐厅比喻 | 档案柜（永久保存） | 临时便签（营业期间有效） |
| 适用场景 | 用户偏好设置、缓存数据 | 表单暂存、当前会话状态 |

~~~javascript
// ========== 关键区别演示 ==========

// localStorage：同源的多个标签页共享
// 标签页A：
localStorage.setItem("共享数据", "来自标签页A");

// 标签页B（同一网站）：
console.log(localStorage.getItem("共享数据"));  // "来自标签页A" ← 能读到！

// sessionStorage：每个标签页独立
// 标签页A：
sessionStorage.setItem("独有数据", "标签页A的");

// 标签页B（同一网站）：
console.log(sessionStorage.getItem("独有数据"));  // null ← 读不到！
~~~

---

## 19.4 增删改查完整示例

~~~javascript
// ========== 封装一个存储工具类 ==========
class 存储管理器 {
  constructor(存储类型 = "local") {
    this.存储 = 存储类型 === "local" ? localStorage : sessionStorage;
  }

  // 存（自动 JSON 序列化）
  set(键, 值) {
    try {
      this.存储.setItem(键, JSON.stringify(值));
      return true;
    } catch (错误) {
      console.error("存储失败：", 错误);
      return false;
    }
  }

  // 取（自动 JSON 反序列化）
  get(键, 默认值 = null) {
    try {
      const 原始值 = this.存储.getItem(键);
      return 原始值 !== null ? JSON.parse(原始值) : 默认值;
    } catch (错误) {
      return 默认值;
    }
  }

  // 删
  remove(键) {
    this.存储.removeItem(键);
  }

  // 清空
  clear() {
    this.存储.clear();
  }

  // 判断是否包含
  has(键) {
    return this.存储.getItem(键) !== null;
  }

  // 获取所有键
  keys() {
    return Object.keys(this.存储);
  }

  // 更新（合并对象）
  update(键, 新数据) {
    const 旧数据 = this.get(键, {});
    this.set(键, { ...旧数据, ...新数据 });
  }
}

// ========== 使用 ==========
const 本地存储 = new 存储管理器("local");
const 会话存储 = new 存储管理器("session");

// 存储复杂数据
本地存储.set("用户偏好", {
  主题: "深色",
  字号: 16,
  语言: "中文"
});

// 读取
const 偏好 = 本地存储.get("用户偏好", { 主题: "浅色", 字号: 14 });
console.log(偏好.主题);  // 深色

// 更新（合并）
本地存储.update("用户偏好", { 字号: 18 });
console.log(本地存储.get("用户偏好"));
// { 主题: "深色", 字号: 18, 语言: "中文" }

// 判断
console.log(本地存储.has("用户偏好"));  // true
console.log(本地存储.has("不存在的"));  // false
~~~

---

## 19.5 存储事件（storage event）

**一句话解释：**
当一个标签页修改了 `localStorage` 时，**其他同源标签页**会收到一个 `storage` 事件通知。`sessionStorage` 不触发此事件。

**餐厅比喻：**
你在档案柜上放了一份新文件（修改 localStorage），**其他正在看档案柜的同事**会收到通知"档案柜有更新"。但临时便签（sessionStorage）的修改不会通知任何人。

~~~javascript
// ========== 监听存储变化 ==========
// 在标签页A中修改
localStorage.setItem("公告", "今日特价：红烧肉38元");

// 在标签页B中监听
window.addEventListener("storage", function(事件) {
  console.log("其他标签页修改了 localStorage：");
  console.log("键：", 事件.key);          // "公告"
  console.log("旧值：", 事件.oldValue);   // null（之前没有）
  console.log("新值：", 事件.newValue);   // "今日特价：红烧肉38元"
  console.log("URL：", 事件.url);         // 修改者的页面地址
});

// ========== 实际用途：多标签页同步登录状态 ==========
// 标签页A：用户登出
localStorage.setItem("登录状态", JSON.stringify({ 已登录: false }));

// 标签页B：收到通知，自动跳转到登录页
window.addEventListener("storage", (事件) => {
  if (事件.key === "登录状态") {
    const 状态 = JSON.parse(事件.newValue);
    if (!状态.已登录) {
      window.location.href = "/login";  // 跳转到登录页
    }
  }
});
~~~

---

## 19.6 存储限制与注意事项

~~~javascript
// ========== 1. 只能存字符串 ==========
localStorage.setItem("数字", 42);
console.log(typeof localStorage.getItem("数字"));  // "string"（被转成字符串了）

localStorage.setItem("布尔", true);
console.log(typeof localStorage.getItem("布尔"));  // "string"

localStorage.setItem("对象", { 名字: "红烧肉" });
console.log(localStorage.getItem("对象"));  // "[object Object]"（丢失了！）

// 正确做法：用 JSON 序列化
localStorage.setItem("对象", JSON.stringify({ 名字: "红烧肉" }));
console.log(JSON.parse(localStorage.getItem("对象")));  // { 名字: "红烧肉" }

// ========== 2. 存储容量限制 ==========
// localStorage 约 5-10MB（不同浏览器不同）
// sessionStorage 约 5-10MB

// 测试存储是否满了
function 测试存储容量() {
  let 已存储 = 0;
  try {
    while (true) {
      localStorage.setItem(`测试${已存储}`, "x".repeat(1024));  // 每次存1KB
      已存储++;
    }
  } catch (错误) {
    console.log(`存储满了！约 ${已存储}KB`);
    // 清理测试数据
    for (let i = 0; i < 已存储; i++) {
      localStorage.removeItem(`测试${i}`);
    }
  }
}

// ========== 3. 不要存敏感信息 ==========
// localStorage 容易被 XSS 攻击读取，不要存密码、token 等敏感信息
// ❌ localStorage.setItem("password", "123456");
// ❌ localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIs...");
// ✅ 敏感信息应该存在 httpOnly 的 Cookie 或内存中

// ========== 4. JSON.parse 的安全问题 ==========
// 读取时如果数据被篡改或损坏，JSON.parse 会报错
function 安全读取(键) {
  try {
    return JSON.parse(localStorage.getItem(键));
  } catch (错误) {
    return null;
  }
}

// ========== 5. 同源策略 ==========
// localStorage 按"协议 + 域名 + 端口"隔离
// http://localhost:3000 和 http://localhost:8080 的 localStorage 是分开的
// http://a.com 和 https://a.com 也是分开的（协议不同）
~~~

---

## 第19章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| localStorage | 持久存储，关闭浏览器数据还在 | 档案柜（永久保存） |
| sessionStorage | 会话存储，关闭标签页数据清除 | 临时便签（营业期间有效） |
| setItem | 存储数据 | 放进档案柜 |
| getItem | 读取数据 | 从档案柜取出 |
| removeItem | 删除指定数据 | 从档案柜拿掉一份文件 |
| clear | 清空所有数据 | 清空整个档案柜 |
| 只能存字符串 | 对象需要 JSON.stringify 序列化 | 东西都要翻译成文字才能放进去 |
| JSON.parse 还原 | 读取时用 JSON.parse 反序列化 | 取出来再翻译回来 |
| storage 事件 | localStorage 变化时通知其他标签页 | 档案柜更新了，其他同事收到通知 |
| 同源隔离 | 协议+域名+端口决定存储空间 | 每家餐厅各有各的档案柜 |
| 容量限制 | 约 5-10MB | 档案柜空间有限 |
| 不要存敏感信息 | 容易被 XSS 读取 | 机密文件不能放公共档案柜 |
| 封装工具类 | 统一封装增删改查 | 请一个档案管理员管理一切 |
