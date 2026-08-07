# 第17章：事件（Event）

## 17.1 addEventListener

**一句话解释：**
`addEventListener` 是给 DOM 元素**绑定事件监听器**的方法——当某个事件（点击、输入、滚动等）发生时，自动执行你指定的回调函数。

**餐厅比喻：**
你在厨房门口装了一个**感应门铃**（addEventListener），你说"只要有人推门进来（click 事件），就喊一声'欢迎光临'（回调函数）"。门铃不会主动响，只有**有人推门时才会触发**。

~~~javascript
// ========== 基本语法 ==========
// 元素.addEventListener(事件类型, 回调函数, 选项);

// 获取元素
const 按钮 = document.querySelector("#点菜按钮");

// 绑定点击事件
按钮.addEventListener("click", function(事件) {
  console.log("按钮被点了！");
});

// ========== 同一个元素可以绑定多个相同类型的事件 ==========
按钮.addEventListener("click", function() {
  console.log("第一个监听器执行了");
});

按钮.addEventListener("click", function() {
  console.log("第二个监听器也执行了");
});

// 点击按钮后，两个监听器都会执行：
// 第一个监听器执行了
// 第二个监听器也执行了

// ========== 箭头函数写法 ==========
按钮.addEventListener("click", (事件) => {
  console.log("箭头函数监听器");
});

// ========== 匿名函数 vs 具名函数 ==========
function 处理点击(事件) {
  console.log("点击了");
}

按钮.addEventListener("click", 处理点击);  // 具名函数（方便后面移除）
~~~

---

## 17.2 事件对象（Event Object）

**一句话解释：**
事件触发时，浏览器会自动创建一个**事件对象**，传给回调函数的第一个参数。它包含了这次事件的所有信息——在哪里点的、点了什么、鼠标位置等。

**餐厅比喻：**
门铃响了，同时掉出一张**事件报告单**——上面写着"几点几分、谁推的门、从哪个方向推的、推了多重"。你拿到报告单就能知道事件的全部细节。

~~~javascript
// ========== 事件对象的基本信息 ==========
const 按钮 = document.querySelector("#按钮");

按钮.addEventListener("click", function(事件) {
  // 事件类型
  console.log(事件.type);          // "click"

  // 触发事件的目标元素
  console.log(事件.target);        // <button id="按钮">

  // 绑定事件的元素（当前元素）
  console.log(事件.currentTarget); // <button id="按钮">

  // 鼠标位置
  console.log(事件.clientX);       // 鼠标相对于视口的X坐标
  console.log(事件.clientY);       // 鼠标相对于视口的Y坐标
  console.log(事件.pageX);         // 鼠标相对于页面的X坐标
  console.log(事件.pageY);         // 鼠标相对于页面的Y坐标

  // 鼠标按键
  console.log(事件.button);        // 0=左键, 1=中键, 2=右键

  // 事件发生的时间戳
  console.log(事件.timeStamp);     // 事件发生的时间
});

// ========== 键盘事件的事件对象 ==========
document.addEventListener("keydown", function(事件) {
  console.log(事件.key);           // 按下的键名："Enter"、"a"、"ArrowUp"
  console.log(事件.code);          // 按键代码："KeyA"、"Enter"、"ArrowUp"
  console.log(事件.ctrlKey);       // Ctrl 是否同时按下
  console.log(事件.shiftKey);      // Shift 是否同时按下
  console.log(事件.altKey);        // Alt 是否同时按下
  console.log(事件.metaKey);       // Meta(Cmd/Win) 是否同时按下

  // 组合键示例：Ctrl + S 保存
  if (事件.ctrlKey && 事件.key === "s") {
    事件.preventDefault();  // 阻止浏览器默认的保存行为
    console.log("自定义保存逻辑");
  }
});

// ========== 表单事件的事件对象 ==========
const 输入框 = document.querySelector("#搜索框");

输入框.addEventListener("input", function(事件) {
  console.log(事件.target.value);  // 输入框当前的值
});

输入框.addEventListener("change", function(事件) {
  console.log("值已确认改变：", 事件.target.value);
});
~~~

---

## 17.3 事件冒泡与捕获

**一句话解释：**
当一个嵌套元素触发事件时，事件会**从最外层一层层传到最内层（捕获阶段）**，再**从最内层一层层传回最外层（冒泡阶段）**。默认在冒泡阶段触发监听器。

**餐厅比喻：**
集团总部 → 分公司 → 部门 → 员工小王——小王被点了（click）：

~~~
事件的传播路径：

捕获阶段（从外到内）：        冒泡阶段（从内到外）：
  集团总部                     员工小王
    ↓                            ↑
  分公司                       部门
    ↓                            ↑
  部门                         分公司
    ↓                            ↑
  员工小王 ← 事件到达目标       集团总部
~~~

~~~javascript
// ========== 事件冒泡演示 ==========
const 外层 = document.querySelector("#外层");
const 中层 = document.querySelector("#中层");
const 内层 = document.querySelector("#内层");

// 默认在冒泡阶段触发（从内到外）
外层.addEventListener("click", () => console.log("外层被点了"));
中层.addEventListener("click", () => console.log("中层被点了"));
内层.addEventListener("click", () => console.log("内层被点了"));

// 点击内层后，输出：
// 内层被点了     ← 目标元素
// 中层被点了     ← 冒泡到中层
// 外层被点了     ← 冒泡到外层

// ========== 阻止冒泡 ==========
内层.addEventListener("click", (事件) => {
  console.log("内层被点了");
  事件.stopPropagation();  // 阻止事件继续冒泡
});

// 点击内层后，输出：
// 内层被点了     ← 只有内层触发，不会冒泡到中层和外层

// ========== 捕获阶段触发 ==========
// 第三个参数传 true，监听器在捕获阶段触发
外层.addEventListener("click", () => console.log("外层（捕获）"), true);
中层.addEventListener("click", () => console.log("中层（捕获）"), true);
内层.addEventListener("click", () => console.log("内层（捕获）"), true);

// 点击内层后，输出：
// 外层（捕获）   ← 捕获阶段：从外到内
// 中层（捕获）
// 内层（捕获）

// ========== 捕获 + 冒泡混合 ==========
外层.addEventListener("click", () => console.log("外层（捕获）"), true);
外层.addEventListener("click", () => console.log("外层（冒泡）"), false);
中层.addEventListener("click", () => console.log("中层（冒泡）"), false);
内层.addEventListener("click", () => console.log("内层（冒泡）"), false);

// 点击内层后，输出：
// 外层（捕获）   ← 捕获阶段：从外到内
// 内层（冒泡）   ← 到达目标
// 中层（冒泡）   ← 冒泡阶段：从内到外
// 外层（冒泡）
~~~

---

## 17.4 事件委托（Event Delegation）

**一句话解释：**
不给每个子元素单独绑定事件，而是**把事件绑定在父元素上**，利用冒泡机制，通过 `event.target` 判断是哪个子元素触发的。

**餐厅比喻：**
你不给每张桌子都配一个服务员，而是在**大门口放一个服务员**，谁有需求举手（点击），服务员看是哪张桌子举的（`event.target`），再过去服务。

~~~javascript
// ========== 问题：给每个子元素都绑事件 ==========
// 假设有100道菜的列表
const 菜品列表 = document.querySelectorAll(".菜品");
菜品列表.forEach(菜品 => {
  菜品.addEventListener("click", function() {
    console.log(`你点了：${this.textContent}`);
  });
});
// 问题1：绑了100个监听器，内存占用大
// 问题2：动态新增的菜不会自动有事件

// ========== 解决：事件委托（推荐） ==========
const 菜单容器 = document.querySelector("#菜单");

菜单容器.addEventListener("click", function(事件) {
  // 判断点击的是不是 .菜品 元素
  if (事件.target.matches(".菜品")) {
    console.log(`你点了：${事件.target.textContent}`);
  }
});

// 优点：
// 1. 只绑定一个监听器，节省内存
// 2. 动态新增的菜自动有事件（因为事件绑在父元素上）

// ========== 更精细的委托 ==========
菜单容器.addEventListener("click", function(事件) {
  // 查找最近的匹配元素（支持嵌套元素点击）
  const 菜品元素 = 事件.target.closest(".菜品");
  if (!菜品元素) return;

  const 菜名 = 菜品元素.dataset.菜名;
  const 价格 = 菜品元素.dataset.价格;
  console.log(`你点了：${菜名}，${价格}元`);
});

// HTML 结构：
// <div id="菜单">
//   <div class="菜品" data-菜名="红烧肉" data-价格="38">
//     <span>红烧肉</span>
//     <span>38元</span>
//   </div>
//   <div class="菜品" data-菜名="麻婆豆腐" data-价格="22">
//     ...
//   </div>
// </div>
~~~

---

## 17.5 常见事件类型

### 鼠标事件

~~~javascript
const 按钮 = document.querySelector("#按钮");

按钮.addEventListener("click", () => console.log("单击"));
按钮.addEventListener("dblclick", () => console.log("双击"));
按钮.addEventListener("mousedown", () => console.log("鼠标按下"));
按钮.addEventListener("mouseup", () => console.log("鼠标抬起"));
按钮.addEventListener("mouseenter", () => console.log("鼠标进入（不冒泡）"));
按钮.addEventListener("mouseleave", () => console.log("鼠标离开（不冒泡）"));
按钮.addEventListener("mouseover", () => console.log("鼠标进入（冒泡）"));
按钮.addEventListener("mouseout", () => console.log("鼠标离开（冒泡）"));
按钮.addEventListener("mousemove", () => console.log("鼠标移动"));
按钮.addEventListener("contextmenu", () => console.log("右键菜单"));
~~~

### 键盘事件

~~~javascript
document.addEventListener("keydown", (事件) => {
  console.log(`按下：${事件.key}`);
});

document.addEventListener("keyup", (事件) => {
  console.log(`抬起：${事件.key}`);
});

// 监听回车键
document.addEventListener("keydown", (事件) => {
  if (事件.key === "Enter") {
    console.log("用户按了回车，提交搜索");
  }
});

// 监听 ESC 键
document.addEventListener("keydown", (事件) => {
  if (事件.key === "Escape") {
    console.log("关闭弹窗");
  }
});
~~~

### 表单事件

~~~javascript
const 输入框 = document.querySelector("#输入框");
const 表单 = document.querySelector("#表单");

// input：每次输入都触发
输入框.addEventListener("input", (事件) => {
  console.log("当前值：", 事件.target.value);
});

// change：失焦后值改变才触发
输入框.addEventListener("change", (事件) => {
  console.log("最终值：", 事件.target.value);
});

// focus：获得焦点
输入框.addEventListener("focus", () => console.log("输入框获得焦点"));

// blur：失去焦点
输入框.addEventListener("blur", () => console.log("输入框失去焦点"));

// submit：表单提交
表单.addEventListener("submit", (事件) => {
  事件.preventDefault();  // 阻止默认的表单提交行为
  console.log("表单提交了，用 JS 处理数据");
});

// select：文本被选中
输入框.addEventListener("select", (事件) => {
  console.log("文本被选中了");
});
~~~

### 其他常用事件

~~~javascript
// ========== 滚动事件 ==========
window.addEventListener("scroll", () => {
  console.log("页面滚动了，当前位置：", window.scrollY);
});

// ========== 窗口大小变化 ==========
window.addEventListener("resize", () => {
  console.log(`窗口大小：${window.innerWidth} × ${window.innerHeight}`);
});

// ========== 页面加载完成 ==========
window.addEventListener("load", () => {
  console.log("所有资源（图片、样式等）都加载完了");
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM 解析完了（比 load 更早）");
});

// ========== 复制 / 粘贴 / 剪切 ==========
输入框.addEventListener("copy", () => console.log("复制了"));
输入框.addEventListener("paste", (事件) => {
  console.log("粘贴了：", 事件.clipboardData.getData("text"));
});
~~~

---

## 17.6 removeEventListener

**一句话解释：**
`removeEventListener` 移除之前绑定的事件监听器。**必须传入和绑定时完全相同的函数引用**才能移除。

**餐厅比喻：**
你之前在门口装了门铃（addEventListener），现在想拆掉它（removeEventListener）。你必须指明**拆的是哪一个门铃**——如果你当时用的是匿名函数，就找不回"同一个"门铃来拆了。

~~~javascript
// ========== 基本用法 ==========
const 按钮 = document.querySelector("#按钮");

function 处理点击() {
  console.log("按钮被点了");
}

// 绑定
按钮.addEventListener("click", 处理点击);

// 移除（必须传同一个函数引用）
按钮.removeEventListener("click", 处理点击);  // ✅ 成功移除

// ========== 匿名函数无法移除 ==========
按钮.addEventListener("click", function() {
  console.log("匿名函数");
});

// 想移除？没门——找不到"同一个"匿名函数了
按钮.removeEventListener("click", function() {
  console.log("匿名函数");  // ❌ 这是一个新的匿名函数，和上面那个不是同一个
});

// ========== 箭头函数也无法移除 ==========
const 箭头回调 = () => console.log("箭头");
按钮.addEventListener("click", 箭头回调);
按钮.removeEventListener("click", 箭头回调);  // ✅ 可以，因为是同一个引用

// ========== 只触发一次的事件 ==========
按钮.addEventListener("click", function() {
  console.log("只触发一次！");
}, { once: true });  // once: true 表示触发一次后自动移除
~~~

---

## 17.7 自定义事件（CustomEvent / dispatchEvent）

**一句话解释：**
你可以自己**创建事件**并**手动触发**它。用 `new CustomEvent()` 创建，用 `element.dispatchEvent()` 触发。用于组件之间的通信。

**餐厅比喻：**
正常情况下，门铃是顾客推门才响。但你可以**自己按门铃**（dispatchEvent），模拟有人推门的场景。你甚至可以发明一种**新型门铃**（CustomEvent），专门在"厨师做完菜"时响，传递做好的菜名。

~~~javascript
// ========== 基本自定义事件 ==========
const 菜品元素 = document.querySelector("#菜品");

// 监听自定义事件
菜品元素.addEventListener("菜做好了", function(事件) {
  console.log(`通知：${事件.detail.菜名}做好了！价格：${事件.detail.价格}元`);
});

// 创建并触发自定义事件
const 事件 = new CustomEvent("菜做好了", {
  detail: {                          // detail：传递自定义数据
    菜名: "红烧肉",
    价格: 38,
    厨师: "张师傅"
  },
  bubbles: true,                     // 允许冒泡
  cancelable: true                   // 允许取消
});

菜品元素.dispatchEvent(事件);
// 通知：红烧肉做好了！价格：38元

// ========== 用自定义事件实现组件通信 ==========
// 厨房组件
function 厨房做菜(菜名, 价格) {
  console.log(`厨房开始做${菜名}`);

  setTimeout(() => {
    // 做好了，广播事件
    const 做好了事件 = new CustomEvent("菜做好了", {
      detail: { 菜名, 价格 },
      bubbles: true
    });
    document.dispatchEvent(做好了事件);
  }, 1000);
}

// 前厅组件（监听事件）
document.addEventListener("菜做好了", (事件) => {
  console.log(`前厅收到通知：${事件.detail.菜名}，${事件.detail.价格}元，准备上菜！`);
});

// 结账组件（也监听同一个事件）
document.addEventListener("菜做好了", (事件) => {
  console.log(`结账系统记录：${事件.detail.菜名}，${事件.detail.价格}元`);
});

// 触发做菜
厨房做菜("红烧肉", 38);
// 厨房开始做红烧肉
// （1秒后）
// 前厅收到通知：红烧肉，38元，准备上菜！
// 结账系统记录：红烧肉，38元

// ========== 事件总线模式 ==========
class 事件总线 {
  constructor() {
    this.目标 = document.createElement("div");
  }

  监听(事件名, 回调) {
    this.目标.addEventListener(事件名, 回调);
  }

  触发(事件名, 数据) {
    this.目标.dispatchEvent(new CustomEvent(事件名, { detail: 数据 }));
  }

  移除(事件名, 回调) {
    this.目标.removeEventListener(事件名, 回调);
  }
}

const 总线 = new 事件总线();

总线.监听("新订单", (事件) => {
  console.log(`新订单：${事件.detail.菜名}`);
});

总线.监听("新订单", (事件) => {
  console.log(`厨房收到：开始做${事件.detail.菜名}`);
});

总线.触发("新订单", { 菜名: "麻婆豆腐" });
// 新订单：麻婆豆腐
// 厨房收到：开始做麻婆豆腐
~~~

---

## 第17章 总结

| 术语 | 一句话解释 | 餐厅比喻关键词 |
|---|---|---|
| addEventListener | 给元素绑定事件监听器 | 在门口装感应门铃 |
| 事件对象 | 包含事件所有信息的对象 | 门铃响时掉出的事件报告单 |
| event.target | 触发事件的目标元素 | 谁推的门 |
| event.type | 事件类型 | 什么类型的事件 |
| event.preventDefault() | 阻止浏览器默认行为 | 拦住门不让自动关 |
| 事件冒泡 | 事件从目标元素向上传播 | 小王举手→部门→分公司→总部 |
| 事件捕获 | 事件从最外层向下传播 | 总部→分公司→部门→小王 |
| stopPropagation() | 阻止事件继续传播 | 到部门就停，不往上传了 |
| 事件委托 | 事件绑在父元素，通过 target 判断子元素 | 大门口放一个服务员，看谁举手 |
| click | 单击事件 | 顾客按门铃 |
| dblclick | 双击 | 顾客连按两下 |
| mousedown/up | 鼠标按下/抬起 | 手指按下/抬起 |
| mouseenter/leave | 鼠标进入/离开（不冒泡） | 顾客进门/出门 |
| keydown/keyup | 键盘按下/抬起 | 顾客在键盘上按了什么 |
| input | 输入框每次输入都触发 | 每打一个字都通知 |
| change | 输入框失焦后值改变才触发 | 填完确认了才通知 |
| submit | 表单提交 | 顾客交表格 |
| scroll | 页面滚动 | 餐厅楼层之间的移动 |
| resize | 窗口大小变化 | 餐厅扩建/缩小 |
| load / DOMContentLoaded | 页面加载完成 | 餐厅装修完成 |
| removeEventListener | 移除事件监听器 | 拆掉门铃 |
| once: true | 只触发一次就自动移除 | 一次性门铃 |
| 匿名函数无法移除 | 必须传同一个函数引用 | 找不回同一个门铃来拆 |
| CustomEvent | 自定义事件 | 发明新型门铃 |
| dispatchEvent | 手动触发事件 | 自己按门铃 |
| 事件总线 | 集中管理事件的发布和订阅 | 餐厅的广播系统 |
