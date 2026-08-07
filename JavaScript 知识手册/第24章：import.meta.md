# 第24章：import.meta

## 24.1 import.meta 是什么

**一句话解释：**
`import.meta` 是一个对象，包含了**当前这个模块文件自身的一些信息**——比如这个文件的 URL 地址、路径等。它不是你传进去的，而是 JS 引擎自动帮你填好的。

**餐厅比喻：**
每家分店的前台都放着一本**"本店信息手册"**，上面写着：本店地址在哪（文件的 URL）、本店叫什么（文件名）、本店的上级是谁（所在目录）。你不需要自己去查——**手册是自动放在那里的**，你翻开就能看到。`import.meta` 就是这本"本店信息手册"。

~~~javascript
// ========== import.meta 是一个对象，包含当前模块的元信息 ==========

console.log(import.meta);
// 浏览器中输出类似：
// {
//   url: "http://localhost:3000/src/菜单.js",
//   resolve: [Function: resolve]
// }

// Node.js 中输出类似：
// {
//   url: "file:///D:/项目/src/菜单.js",
//   resolve: [Function: resolve]
// }
~~~

---

## 24.2 import.meta.url

**一句话解释：**
`import.meta.url` 是一个字符串，表示**当前模块文件的完整 URL 地址**。

**餐厅比喻：**
你翻开前台的"本店信息手册"，第一行写着：**"本店地址：北京市朝阳区建国路88号"**。这就是 `import.meta.url`——你的文件在网络上的完整地址。

~~~javascript
// ========== 在 src/菜单.js 文件中 ==========

console.log(import.meta.url);
// 浏览器：http://localhost:3000/src/菜单.js
// Node.js：file:///D:/我的项目/src/菜单.js

// ========== 获取当前文件的目录路径 ==========

const 当前URL = new URL(import.meta.url);

console.log(当前URL.href);      // 完整URL：http://localhost:3000/src/菜单.js
console.log(当前URL.origin);    // 协议+域名：http://localhost:3000
console.log(当前URL.pathname);  // 路径：/src/菜单.js

// 获取当前文件所在目录
const 当前目录 = new URL(".", import.meta.url);
console.log(当前目录.href);     // http://localhost:3000/src/
~~~

~~~javascript
// ========== 实际用途：加载当前目录下的其他文件 ==========

// 在 src/pages/订单.js 中，想加载同目录下的 模板.html
const 模板路径 = new URL("./模板.html", import.meta.url);
console.log(模板路径.href);
// http://localhost:3000/src/pages/模板.html

// 用 fetch 加载
const 响应 = await fetch(模板路径);
const 模板内容 = await 响应.text();
~~~

~~~javascript
// ========== 实际用途：动态加载图片/资源 ==========

// 在 src/components/菜品卡片.js 中
const 图片路径 = new URL("../assets/红烧肉.jpg", import.meta.url);
console.log(图片路径.href);
// http://localhost:3000/src/assets/红烧肉.jpg

// 在 DOM 中使用
const img = document.createElement("img");
img.src = 图片路径.href;
document.body.appendChild(img);
~~~

---

## 24.3 import.meta.resolve()

**一句话解释：**
给一个模块标识符（比如 `"./utils.js"`），`import.meta.resolve()` 返回它的**完整 URL**——告诉你这个模块实际在网络上的地址是哪。

**餐厅比喻：**
你问前台："我要找**甜品部**，具体地址在哪？"前台翻开手册，查到甜品部在"本店三楼右侧"，把这个完整地址告诉你。`import.meta.resolve()` 就是这个"查地址"的功能。

~~~javascript
// ========== 基本用法 ==========

const 完整路径 = import.meta.resolve("./utils.js");
console.log(完整路径);
// "file:///D:/项目/src/utils.js"（Node.js）
// "http://localhost:3000/src/utils.js"（浏览器）

const npm路径 = import.meta.resolve("lodash");
console.log(npm路径);
// "file:///D:/项目/node_modules/lodash/lodash.js"（Node.js）
~~~

~~~javascript
// ========== 实际用途：动态确定模块路径 ==========

const 配置 = {
  数据源: "./data/菜单.json",
  模板: "./templates/菜单.html",
};

const 数据源路径 = import.meta.resolve(配置.数据源);
const 模板路径 = import.meta.resolve(配置.模板);

console.log(数据源路径);
// "file:///D:/项目/src/data/菜单.json"

console.log(模板路径);
// "file:///D:/项目/src/templates/菜单.html"
~~~

~~~javascript
// ========== import.meta.resolve vs new URL ==========

// import.meta.resolve：解析"模块标识符"（可以是 npm 包名）
import.meta.resolve("./utils.js")     // ✅ 相对路径
import.meta.resolve("lodash")          // ✅ npm 包名 → 实际文件路径

// new URL：解析"URL 相对路径"（不能解析 npm 包名）
new URL("./utils.js", import.meta.url) // ✅ 相对路径
new URL("lodash", import.meta.url)      // ❌ 不知道 npm 包在哪
~~~

---

## 24.4 不同环境下的 import.meta

`import.meta` 的内容**取决于你在什么环境运行**。不同环境会往这个对象上挂不同的属性。

~~~javascript
// ========== 浏览器环境 ==========
console.log(import.meta);
// {
//   url: "http://localhost:3000/src/菜单.js"
// }

// ========== Node.js 环境 ==========
console.log(import.meta);
// {
//   url: "file:///D:/项目/src/菜单.js",
//   resolve: [Function]
// }

// ========== Vite 项目中（开发环境） ==========
console.log(import.meta);
// {
//   url: "http://localhost:5173/src/App.vue",
//   hot: { ... },           ← Vite 热更新对象
//   env: { ... },           ← Vite 环境变量
//   glob: [Function],       ← Vite 的 import.meta.glob
//   resolve: [Function]
// }

// ========== Webpack 项目中 ==========
console.log(import.meta.url);
// "webpack:///./src/菜单.js"
~~~

---

## 24.5 Vite 中的 import.meta（.env / .glob / .hot）

Vite 在 `import.meta` 上挂了很多实用的功能，这是日常开发中最常遇到的。

### import.meta.env——环境变量

~~~javascript
// Vite 自动提供的环境变量
console.log(import.meta.env.MODE);        // "development" 或 "production"
console.log(import.meta.env.BASE_URL);    // "/"
console.log(import.meta.env.PROD);        // false（开发环境）
console.log(import.meta.env.DEV);         // true（开发环境）
console.log(import.meta.env.SSR);         // false（是否服务端渲染）

// 自定义环境变量（必须以 VITE_ 开头）
// .env 文件中：VITE_API_URL=http://localhost:3000
console.log(import.meta.env.VITE_API_URL);  // "http://localhost:3000"
~~~

### import.meta.glob——批量导入文件

~~~javascript
// 自动导入 src/pages/ 下的所有 .vue 文件
const 页面们 = import.meta.glob("./pages/*.vue");
console.log(页面们);
// {
//   "./pages/首页.vue": () => import("./pages/首页.vue"),
//   "./pages/菜单.vue": () => import("./pages/菜单.vue"),
//   "./pages/订单.vue": () => import("./pages/订单.vue")
// }

// 遍历使用
for (const [路径, 导入函数] of Object.entries(页面们)) {
  const 模块 = await 导入函数();
  console.log(`${路径}:`, 模块.default);
}

// ========== import.meta.globEager——立即导入（不懒加载） ==========
const 立即导入们 = import.meta.globEager("./components/*.js");
// 直接就是模块内容，不是函数
~~~

### import.meta.hot——热更新（HMR）

~~~javascript
if (import.meta.hot) {
  // 当前模块被更新时，执行自定义逻辑
  import.meta.hot.accept((新模块) => {
    console.log("模块更新了！", 新模块);
  });

  // 当前模块被卸载时，清理资源
  import.meta.hot.dispose(() => {
    console.log("模块被卸载，清理资源");
  });
}
~~~

---

## 24.6 Node.js 中的 import.meta（fileURLToPath / \_\_dirname 替代）

~~~javascript
// ========== 在 Node.js ESM 模块中 ==========

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

// import.meta.url → 完整的 file:// URL
console.log(import.meta.url);
// "file:///D:/项目/src/菜单.js"

// 转成文件系统路径（Node.js 的 fs、path 模块需要文件路径，不是 URL）
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
// "D:\项目\src\菜单.js"（Windows）
// "/home/用户/项目/src/菜单.js"（Linux/Mac）

// 获取当前文件所在目录（等价于 CommonJS 的 __dirname）
const __dirname = dirname(__filename);
console.log(__dirname);
// "D:\项目\src"

// 拼接路径：加载当前目录下的 数据.json
const 数据路径 = join(__dirname, "数据.json");
const 数据 = JSON.parse(readFileSync(数据路径, "utf-8"));
console.log(数据);
~~~

~~~javascript
// ========== 简洁写法 ==========

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 之后就可以像 CommonJS 一样用 __dirname
const 配置文件路径 = join(__dirname, "config.json");
~~~

---

## 24.7 Vue 项目中的典型用法

~~~javascript
// ========== 1. 在 Vue 组件中加载本地资源 ==========

// ❌ 错误：Vite 不知道你在引用什么
// const 图片 = "/src/assets/logo.png";

// ✅ 正确：用 import.meta.url 让打包工具知道
const 图片URL = new URL("../assets/logo.png", import.meta.url).href;
~~~

~~~javascript
// ========== 2. 动态导入图片 ==========
const getImageUrl = (name) => {
  return new URL(`../assets/${name}.png`, import.meta.url).href;
};

// <img :src="getImageUrl('红烧肉')" />
// <img :src="getImageUrl('麻婆豆腐')" />
~~~

~~~javascript
// ========== 3. 根据环境变量切换配置 ==========

// .env.development
// VITE_API_BASE=http://localhost:3000/api

// .env.production
// VITE_API_BASE=https://api.example.com

const API地址 = import.meta.env.VITE_API_BASE;

const 响应 = await fetch(`${API地址}/menu`);
const 菜单数据 = await 响应.json();

// 开发环境 → http://localhost:3000/api/menu
// 生产环境 → https://api.example.com/menu
~~~

~~~javascript
// ========== 4. 判断是否在 SSR 环境 ==========

if (import.meta.env.SSR) {
  console.log("我在服务器上运行");
} else {
  console.log("我在浏览器中运行");
}
~~~

---

## 第24章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| import.meta | 当前模块的"信息手册" | 每家分店前台的"本店信息手册" |
| import.meta.url | 当前模块文件的完整 URL 地址 | 本店地址：北京市朝阳区建国路88号 |
| import.meta.resolve() | 把模块标识符解析成完整 URL | 查某个部门的具体地址 |
| import.meta.env | Vite 的环境变量对象 | 本店的经营配置表 |
| .env.MODE | 当前模式（development/production） | "白天营业"还是"夜间营业" |
| .env.PROD / .env.DEV | 是否生产/开发环境 | 是不是正式营业 |
| .env.VITE_* | 自定义环境变量 | 你自己贴在手册上的特殊配置 |
| .glob() | Vite 批量导入文件（懒加载） | 把某个楼层的菜单全拿过来，需要时再翻 |
| .globEager() | Vite 批量导入文件（立即） | 把某个楼层的菜单全拿过来，立刻看 |
| .hot | Vite 热更新接口 | 菜品实时更新系统 |
| Node.js fileURLToPath | 把 file:// URL 转成文件路径 | 把快递地址翻译成实际门牌号 |
| Node.js __dirname 替代 | 用 fileURLToPath + dirname 替代 __dirname | ESM 中获取当前文件所在目录 |
| Vue 中加载资源 | 用 new URL(路径, import.meta.url) | 让打包工具知道资源在哪 |
| Vue 中环境变量 | import.meta.env.VITE_* | 根据经营配置切换方案 |
