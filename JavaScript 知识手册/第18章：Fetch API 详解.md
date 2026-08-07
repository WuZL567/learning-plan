# 第18章：Fetch API 详解

## 18.1 fetch 基本用法

**一句话解释：**
`fetch` 是浏览器内置的网络请求 API，用于向服务器发送请求并获取数据。它返回一个 Promise，用起来比老式的 XMLHttpRequest 简洁得多。

**餐厅比喻：**
`fetch` 就像你打电话给供应商订货——你说"我要38号食材"（发送请求），然后等着供应商回复（等待 Promise）。供应商可能会说"好的，马上送"（成功），也可能说"没货了"（失败），或者电话打不通（网络错误）。

~~~javascript
// ========== 最基本的 GET 请求 ==========
fetch("https://api.example.com/menu")
  .then(响应 => {
    console.log(响应);          // Response 对象
    return 响应.json();         // 把响应体解析成 JSON
  })
  .then(数据 => {
    console.log(数据);          // 解析后的数据
  })
  .catch(错误 => {
    console.log("请求失败：", 错误);
  });

// ========== 用 async/await 写法 ==========
async function 获取菜单() {
  try {
    const 响应 = await fetch("https://api.example.com/menu");
    const 数据 = await 响应.json();
    console.log(数据);
  } catch (错误) {
    console.log("请求失败：", 错误);
  }
}
获取菜单();
~~~

---

## 18.2 请求配置（method / headers / body）

**一句话解释：**
`fetch` 的第二个参数是一个配置对象，可以指定请求方法、请求头、请求体等。

**餐厅比喻：**
打电话订货时，你要告诉供应商：**订什么类型**（GET 查看 / POST 下单 / PUT 修改 / DELETE 取消）、**备注什么**（headers）、**附带什么资料**（body）。

~~~javascript
// ========== 完整配置 ==========
fetch("https://api.example.com/menu", {
  method: "POST",                    // 请求方法
  headers: {                         // 请求头
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  body: JSON.stringify({             // 请求体（POST/PUT 时使用）
    菜名: "红烧肉",
    价格: 38
  })
});

// ========== 常用配置项速查 ==========
fetch(url, {
  method: "GET",           // GET / POST / PUT / DELETE / PATCH
  headers: {},             // 请求头
  body: null,              // 请求体（GET 请求不能有 body）
  mode: "cors",            // cors / no-cors / same-origin
  credentials: "same-origin", // include / same-origin / omit
  cache: "default",        // default / no-cache / reload / force-cache
  signal: controller.signal  // 用于取消请求
});
~~~

---

## 18.3 Response 对象

**一句话解释：**
`fetch` 返回的 Promise resolve 后得到一个 Response 对象，它包含响应的状态、头部和数据。

**餐厅比喻：**
供应商送来的**包裹**（Response）——包裹外面贴着标签（status 状态码、headers 响应头），里面装着你要的东西（body 响应体）。你得**拆开包裹**（调用 .json() / .text() / .blob()）才能拿到里面的东西。

~~~javascript
const 响应 = await fetch("https://api.example.com/menu");

// ========== Response 常用属性 ==========
console.log(响应.status);     // 200（HTTP 状态码）
console.log(响应.ok);         // true（状态码 200-299 为 true）
console.log(响应.statusText); // "OK"
console.log(响应.headers);    // Headers 对象
console.log(响应.url);        // 最终请求的 URL（可能被重定向了）
console.log(响应.redirected); // 是否被重定向过
console.log(响应.type);       // "basic" / "cors" / "opaque"

// ========== 读取响应体（只能读一次！） ==========
// 响应体是流（Stream），只能读一次

// .json()   → 解析为 JSON 对象
const JSON数据 = await 响应.json();

// .text()   → 解析为纯文本字符串
// const 文本 = await 响应.text();

// .blob()   → 解析为 Blob（二进制大对象，用于图片、文件等）
// const 文件 = await 响应.blob();

// .arrayBuffer() → 解析为 ArrayBuffer（二进制数据）
// const 二进制 = await 响应.arrayBuffer();

// .formData() → 解析为 FormData
// const 表单数据 = await 响应.formData();

// ========== 读取响应头 ==========
console.log(响应.headers.get("Content-Type"));   // "application/json"
console.log(响应.headers.get("Cache-Control"));   // "max-age=3600"
~~~

---

## 18.4 错误处理

**一句话解释：**
`fetch` 只有在**网络错误**（请求发不出去、断网等）时才会 reject。HTTP 错误（404、500 等）**不会 reject**，需要手动检查 `response.ok`。

**餐厅比喻：**
- **网络错误** = 电话打不通（fetch reject）
- **HTTP 错误** = 电话打通了，但供应商说"没货"（404）或"仓库着火了"（500）——电话通话本身是成功的（fetch resolve），但业务上失败了

~~~javascript
// ========== 网络错误：fetch 会 reject ==========
try {
  const 响应 = await fetch("https://不存在的域名.com/api");
} catch (错误) {
  console.log("网络错误：", 错误);  // TypeError: Failed to fetch
}

// ========== HTTP 错误：fetch 不会 reject！ ==========
const 响应 = await fetch("https://api.example.com/不存在的菜品");
console.log(响应.status);  // 404
console.log(响应.ok);      // false
// 没有 catch 到错误！必须手动检查

// ========== 正确的错误处理模式 ==========
async function 安全请求(url, 配置) {
  try {
    const 响应 = await fetch(url, 配置);

    // 检查 HTTP 错误
    if (!响应.ok) {
      const 错误信息 = await 响应.text();
      throw new Error(`HTTP ${响应.status}: ${错误信息}`);
    }

    return await 响应.json();
  } catch (错误) {
    if (错误.name === "AbortError") {
      console.log("请求被取消了");
    } else {
      console.log("请求失败：", 错误.message);
    }
    throw 错误;  // 继续向外抛出
  }
}

// 使用
try {
  const 数据 = await 安全请求("https://api.example.com/menu");
  console.log(数据);
} catch (错误) {
  console.log("最终处理：", 错误.message);
}
~~~

---

## 18.5 GET / POST / PUT / DELETE 实战

~~~javascript
// ========== GET：获取数据 ==========
async function 获取菜品列表() {
  const 响应 = await fetch("https://api.example.com/menu");
  if (!响应.ok) throw new Error("获取失败");
  return await 响应.json();
}

// ========== POST：创建数据 ==========
async function 创建菜品(菜品数据) {
  const 响应 = await fetch("https://api.example.com/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(菜品数据)
  });
  if (!响应.ok) throw new Error("创建失败");
  return await 响应.json();
}

// 使用
const 新菜品 = await 创建菜品({ 名字: "红烧肉", 价格: 38 });
console.log("创建成功：", 新菜品);

// ========== PUT：更新数据（完整替换） ==========
async function 更新菜品(ID, 新数据) {
  const 响应 = await fetch(`https://api.example.com/menu/${ID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(新数据)
  });
  if (!响应.ok) throw new Error("更新失败");
  return await 响应.json();
}

// 使用
await 更新菜品(1, { 名字: "红烧肉", 价格: 42 });

// ========== PATCH：部分更新 ==========
async function 部分更新菜品(ID, 部分数据) {
  const 响应 = await fetch(`https://api.example.com/menu/${ID}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(部分数据)
  });
  if (!响应.ok) throw new Error("更新失败");
  return await 响应.json();
}

// 使用（只改价格）
await 部分更新菜品(1, { 价格: 42 });

// ========== DELETE：删除数据 ==========
async function 删除菜品(ID) {
  const 响应 = await fetch(`https://api.example.com/menu/${ID}`, {
    method: "DELETE"
  });
  if (!响应.ok) throw new Error("删除失败");
  return true;
}

// 使用
await 删除菜品(1);

// ========== 上传文件 ==========
async function 上传图片(文件) {
  const 表单数据 = new FormData();
  表单数据.append("image", 文件);

  const 响应 = await fetch("https://api.example.com/upload", {
    method: "POST",
    body: 表单数据  // 不需要手动设置 Content-Type，浏览器会自动设置
  });
  if (!响应.ok) throw new Error("上传失败");
  return await 响应.json();
}
~~~

---

## 18.6 并发请求（配合 Promise.all）

~~~javascript
// ========== 同时发起多个请求 ==========
async function 获取餐厅全部数据(餐厅ID) {
  const [菜单, 员工, 评价] = await Promise.all([
    fetch(`/api/${餐厅ID}/menu`).then(r => r.json()),
    fetch(`/api/${餐厅ID}/staff`).then(r => r.json()),
    fetch(`/api/${餐厅ID}/reviews`).then(r => r.json())
  ]);

  return { 菜单, 员工, 评价 };
}

// ========== 带超时的请求 ==========
function 带超时的fetch(url, 配置, 超时毫秒 = 5000) {
  const 控制器 = new AbortController();

  const 超时Promise = new Promise((_, reject) => {
    setTimeout(() => {
      控制器.abort();
      reject(new Error(`请求超时（${超时毫秒}ms）`));
    }, 超时毫秒);
  });

  const 请求Promise = fetch(url, {
    ...配置,
    signal: 控制器.signal
  });

  return Promise.race([请求Promise, 超时Promise]);
}

// 使用
try {
  const 响应 = await 带超时的fetch("https://api.example.com/slow", {}, 3000);
  const 数据 = await 响应.json();
} catch (错误) {
  console.log(错误.message);  // 请求超时（3000ms）
}

// ========== 取消请求 ==========
const 控制器 = new AbortController();

fetch("https://api.example.com/large-file", {
  signal: 控制器.signal
})
  .then(响应 => 响应.json())
  .then(数据 => console.log(数据))
  .catch(错误 => {
    if (错误.name === "AbortError") {
      console.log("请求被用户取消了");
    }
  });

// 用户点击取消按钮时
// 控制器.abort();
~~~

---

## 18.7 fetch vs XMLHttpRequest 对比

| | fetch | XMLHttpRequest |
|---|---|---|
| 语法 | 简洁（Promise + async/await） | 写法（回调 + 事件） |
| Promise | ✅ 原生支持 | ❌ 需要手动包装 |
| 请求/响应分离 | ✅ Request / Response 对象 | ❌ 一体式 |
| 流式读取 | ✅ 支持 ReadableStream | ❌ 不支持 |
| 取消请求 | AbortController | .abort() |
| 进度监控 | ❌ 不支持（需第三方库） | ✅ 支持 upload.onprogress |
| 浏览器支持 | 现代浏览器全支持 | 所有浏览器 |
| 餐厅比喻 | 现代化的电话订货系统 | 老式的对讲机订货系统 |

~~~javascript
// ========== XMLHttpRequest 写法（对比） ==========
const xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.example.com/menu");
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      const 数据 = JSON.parse(xhr.responseText);
      console.log(数据);
    } else {
      console.log("请求失败");
    }
  }
};
xhr.send();

// ========== fetch 写法（简洁得多） ==========
const 响应 = await fetch("https://api.example.com/menu");
if (响应.ok) {
  const 数据 = await 响应.json();
  console.log(数据);
}
~~~

---

## 第18章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| fetch | 浏览器内置的网络请求 API | 电话订货系统 |
| method | 请求方法：GET/POST/PUT/DELETE | 查看/下单/修改/取消 |
| headers | 请求头，传递额外信息 | 订货时的备注信息 |
| body | 请求体，传递数据 | 附带的资料 |
| Response | 响应对象，包含状态和数据 | 供应商送来的包裹 |
| response.ok | 状态码 200-299 为 true | 包裹正常送达 |
| response.status | HTTP 状态码 | 供应商的回复码 |
| response.json() | 把响应体解析为 JSON | 拆开包裹取东西 |
| response.text() | 把响应体解析为文本 | 拆开包裹读文字 |
| 网络错误 | fetch reject，电话打不通 | 电话打不通 |
| HTTP 错误 | fetch resolve，但业务失败 | 电话打通了但没货 |
| 检查 response.ok | 手动判断 HTTP 错误 | 检查供应商回复码 |
| POST | 创建数据 | 下新订单 |
| PUT | 完整更新数据 | 整个订单重做 |
| PATCH | 部分更新数据 | 订单改一个菜 |
| DELETE | 删除数据 | 取消订单 |
| FormData | 表单数据，用于文件上传 | 寄送包裹用的快递单 |
| AbortController | 取消请求 | 取消订货电话 |
| Promise.all + fetch | 并发请求多个接口 | 同时给三家供应商打电话 |
| fetch vs XMLHttpRequest | 现代 vs 老式 | 电话订货 vs 对讲机订货 |
