# CSS 核心：从盒模型到层叠上下文的完整思考路径

## 核心策略：CSS 的 5 个套路

~~~
套路1：盒模型          → 标准盒模型 vs 怪异盒模型 / margin 合并 / BFC
套路2：布局体系        → Flex / Grid / 定位 / 浮动
套路3：层叠与选择器    → z-index / 层叠上下文 / 选择器优先级
套路4：响应式与动画    → 媒体查询 / 过渡 / 动画 / 变换
套路5：CSS 新特性      → 变量 / contain / aspect-ratio / clamp
~~~

---

## 套路一：盒模型

### 什么是盒模型？

~~~
每个 HTML 元素都是一个"盒子"，由 4 层组成：

  ┌─────────────────────────── margin（外边距）──────────────────────────┐
  │ ┌──────────────────────── border（边框）──────────────────────────┐  │
  │ │ ┌───────────────────── padding（内边距）─────────────────────┐  │  │
  │ │ │ ┌────────────────── content（内容）─────────────────────┐  │  │  │
  │ │ │ │                                                      │  │  │  │
  │ │ │ │              实际的内容（文字、图片等）                  │  │  │  │
  │ │ │ │                                                     │  │  │  │
  │ │ │ └─────────────────────────────────────────────────────┘  │  │  │
  │ │ └──────────────────────────────────────────────────────────┘  │  │
  │ └───────────────────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────────────────┘
~~~

### 标准盒模型 vs 怪异盒模型

**手写口诀：标准 width 只含 content，怪异 width 含 content + padding + border**

~~~
标准盒模型（content-box）：
  元素实际占用宽度 = width + padding + border + margin
  width 只包含内容区域

怪异盒模型（border-box）：
  元素实际占用宽度 = width + margin
  width 包含 content + padding + border

切换方式：
  box-sizing: content-box;   → 标准（默认）
  box-sizing: border-box;    → 怪异
~~~

#### 测试

~~~javascript
/* ========== 标准盒模型 ========== */
.标准 {
  box-sizing: content-box;  /* 默认 */
  width: 200px;
  padding: 20px;
  border: 5px solid red;
  margin: 10px;
}

/* 元素实际占用宽度 = 200 + 20*2 + 5*2 + 10*2 = 270px */
/* 内容区域 = 200px */

/* ========== 怪异盒模型 ========== */
.怪异 {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid red;
  margin: 10px;
}

/* 元素实际占用宽度 = 200 + 10*2 = 220px */
/* 内容区域 = 200 - 20*2 - 5*2 = 150px */

/* ========== 为什么推荐 border-box？ ========== */
/* 1. 设置 width: 100% 时，不会超出父元素 */
/* 2. padding 和 border 不会改变元素宽度 */
/* 3. 更符合直觉（你设了 200px，它就是 200px） */
~~~

### 重置盒模型（最佳实践）

~~~css
/* ========== 全局重置 ========== */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 这样所有元素都用怪异盒模型 */
/* 不用担心 padding 和 border 影响布局 */
~~~

### margin 合并（外边距塌陷）

**手写口诀：相邻兄弟的垂直 margin 取大值，父子的垂直 margin 也会合并**

~~~
margin 合并的两种情况：

情况1：相邻兄弟元素
  元素A margin-bottom: 30px
  元素B margin-top: 20px
  实际间距 = max(30, 20) = 30px（不是 30+20=50px）

情况2：父子元素
  父元素没有 border/padding/overflow 时
  子元素的 margin-top 会"穿透"到父元素外面
  看起来像是父元素有了 margin-top
~~~

#### 测试

~~~css
/* ========== 相邻兄弟 margin 合并 ========== */
.兄弟A { margin-bottom: 30px; }
.兄弟B { margin-top: 20px; }
/* 间距 = 30px（取最大值） */

/* ========== 父子 margin 合并 ========== */
.父 {
  background: lightblue;
  /* 没有 border、padding、overflow */
}
.子 {
  margin-top: 50px;
  /* 这个 margin-top 会"穿透"到父元素外面 */
  /* 看起来像是父元素有了 margin-top: 50px */
}

/* ========== 解决 margin 合并的方法 ========== */
/* 方法1：给父元素加 overflow: hidden（创建 BFC） */
.父1 { overflow: hidden; }

/* 方法2：给父元素加 border */
.父2 { border: 1px solid transparent; }

/* 方法3：给父元素加 padding */
.父3 { padding: 1px; }

/* 方法4：给父元素加 display: flow-root（纯 BFC） */
.父4 { display: flow-root; }
~~~

---

## 套路二：布局体系

### Flex 布局（一维布局）

**手写口诀：父容器设 display:flex，子元素自动排列**

~~~
主轴（默认水平方向）：flex-direction 控制
交叉轴（默认垂直方向）：和主轴垂直

父容器属性（6 个）：
  flex-direction → 主轴方向（row/column）
  flex-wrap      → 是否换行
  justify-content → 主轴对齐方式
  align-items    → 交叉轴对齐方式（单行）
  align-content  → 交叉轴对齐方式（多行）
  gap            → 子元素间距

子元素属性（6 个）：
  flex-grow   → 放大比例（默认 0，不放大）
  flex-shrink → 缩小比例（默认 1，可缩小）
  flex-basis  → 初始大小（默认 auto）
  flex        → 简写（grow shrink basis）
  align-self  → 单独设置交叉轴对齐
  order       → 排列顺序（默认 0）
~~~

#### 测试

~~~css
/* ========== 父容器：水平居中 ========== */
.父 {
  display: flex;
  justify-content: center;     /* 主轴居中 */
  align-items: center;         /* 交叉轴居中 */
  height: 100vh;
}

/* ========== 父容器：两端对齐 ========== */
.导航 {
  display: flex;
  justify-content: space-between; /* 两端对齐，中间均匀分布 */
  align-items: center;
}

/* ========== 父容器：均匀分布 ========== */
.菜单 {
  display: flex;
  justify-content: space-around;  /* 每个元素两侧间距相等 */
  /* 或 */
  justify-content: space-evenly;  /* 所有间距完全相等 */
}

/* ========== 子元素：flex 三件套 ========== */
.侧边栏 {
  flex: 0 0 200px;    /* 不放大，不缩小，固定 200px */
}
.主内容 {
  flex: 1;            /* 放大比例 1，占满剩余空间 */
}
.小部件 {
  flex: 0 0 auto;     /* 不放大，不缩小，自适应内容大小 */
}

/* ========== 经典布局：圣杯布局 ========== */
.页面 {
  display: flex;
  min-height: 100vh;
}
.头部 { flex: 0 0 auto; }     /* 固定高度 */
.内容区域 {
  display: flex;
  flex: 1;                      /* 占满剩余空间 */
}
.左边栏 { flex: 0 0 200px; }   /* 固定宽度 */
.主内容 { flex: 1; }           /* 自适应 */
.右边栏 { flex: 0 0 200px; }   /* 固定宽度 */
.底部 { flex: 0 0 auto; }     /* 固定高度 */
~~~

### Grid 布局（二维布局）

**手写口诀：父容器设 display:grid，定义行列，子元素自动填充**

~~~
父容器属性：
  grid-template-columns → 定义列
  grid-template-rows    → 定义行
  grid-template-areas   → 命名区域
  gap                   → 间距
  justify-items         → 水平对齐
  align-items           → 垂直对齐

子元素属性：
  grid-column → 跨列
  grid-row    → 跨行
  grid-area   → 指定区域名
~~~

#### 测试

~~~css
/* ========== 基本网格 ========== */
.网格 {
  display: grid;
  grid-template-columns: 200px 1fr 200px;  /* 3列：固定 自适应 固定 */
  grid-template-rows: 60px 1fr 40px;       /* 3行：固定 自适应 固定 */
  gap: 10px;
  min-height: 100vh;
}

/* ========== fr 单位 ========== */
.grid1 {
  grid-template-columns: 1fr 2fr 1fr;  /* 三列，中间是两边的2倍 */
}
.grid2 {
  grid-template-columns: repeat(3, 1fr);  /* 3列等宽 */
}
.grid3 {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));  /* 自适应列数 */
}

/* ========== 命名区域布局（最直观） ========== */
.页面 {
  display: grid;
  grid-template-areas:
    "头部 头部 头部"
    "左边 主内容 右边"
    "底部 底部 底部";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 40px;
  gap: 10px;
  min-height: 100vh;
}
.头部   { grid-area: 头部; }
.左边栏 { grid-area: 左边; }
.主内容 { grid-area: 主内容; }
.右边栏 { grid-area: 右边; }
.底部   { grid-area: 底部; }

/* ========== Grid vs Flex ========== */
/* Flex → 一维布局（一行或一列） */
/* Grid → 二维布局（同时控制行和列） */
/* 实际开发中：Grid 做整体页面布局，Flex 做组件内部布局 */
~~~

### 定位（Position）

**手写口诀：relative 相对自己偏移，absolute 相对最近定位祖先，fixed 相对视口**

| 值 | 参考点 | 是否脱离文档流 | 是否占位 |
|---|---|---|---|
| static | 无（默认） | 否 | 是 |
| relative | 自己原来的位置 | 否 | 是（原来的位置保留） |
| absolute | 最近的定位祖先 | 是 | 否 |
| fixed | 视口 | 是 | 否 |
| sticky | 最近的滚动祖先 | 否 | 是（到达阈值后脱离） |

#### 测试

~~~css
/* ========== relative：相对自己偏移 ========== */
.相对 {
  position: relative;
  top: 20px;       /* 向下偏移 20px */
  left: 30px;      /* 向右偏移 30px */
  /* 原来的位置仍然保留（其他元素不受影响） */

/* ========== absolute：相对最近定位祖先 ========== */
.父 {
  position: relative;  /* 创建定位上下文 */
}
.子 {
  position: absolute;
  top: 0;
  right: 0;
  /* 相对于父元素的右上角定位 */
}

/* ========== fixed：相对视口 ========== */
.固定头部 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* 固定在页面顶部，滚动时不动 */
}

/* ========== sticky：粘性定位 ========== */
.粘性标题 {
  position: sticky;
  top: 0;  /* 滚动到视口顶部时"粘住" */
  /* 常用于表格标题、分组标题 */
}

/* ========== 水平垂直居中（5种方式） ========== */

/* 方式1：flex */
.居中1 {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 方式2：absolute + transform */
.居中2 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 方式3：absolute + margin: auto */
.居中3 {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  margin: auto;
  width: 200px;  /* 必须有明确的宽高 */
  height: 100px;
}

/* 方式4：grid */
.居中4 {
  display: grid;
  place-items: center;  /* 一行搞定 */
}

/* 方式5：grid + margin: auto */
.居中5 {
  display: grid;
  margin: auto;  /* grid 的子元素可以用 margin: auto 居中 */
}
~~~

### 浮动（Float）——了解即可

~~~
浮动的历史：
  CSS 早期没有 Flex 和 Grid
  布局全靠浮动（float: left/right）
  现在基本被 Flex 和 Grid 取代

浮动的问题：
  1. 父元素高度塌陷（浮动元素不占高度）
  2. 需要 clearfix 清除浮动
  3. 布局代码复杂、不直观

清除浮动的方法：
  1. overflow: hidden（创建 BFC）
  2. ::after 伪元素 clear: both
  3. 父元素也浮动（不推荐）
  4. display: flow-root（最干净）
~~~

~~~css
/* ========== 清除浮动 ========== */
.父::after {
  content: "";
  display: block;
  clear: both;
}

/* 或者最简单的 */
.父 {
  display: flow-root;  /* 创建 BFC，自动包含浮动子元素 */
}
~~~

---

## BFC（块级格式化上下文）

**手写口诀：BFC 是一个独立的渲染区域，内部不受外部影响，外部也不受内部影响**

### 什么会创建 BFC？

~~~
1. html 根元素
2. float 不为 none
3. position 为 absolute 或 fixed
4. overflow 不为 visible（常用 hidden 或 auto）
5. display 为 inline-block / flex / grid / table / flow-root
~~~

### BFC 能解决什么问题？

~~~
1. margin 合并（父子/兄弟的 margin 塌陷）
2. 浮动元素高度塌陷
3. 浮动元素和普通元素重叠
~~~

#### 测试

~~~css
/* ========== 问题1：margin 合并 ========== */
.父 { overflow: hidden; }  /* 创建 BFC → 子元素的 margin 不会穿透 */

/* ========== 问题2：浮动高度塌陷 ========== */
.父 { display: flow-root; }  /* 创建 BFC → 父元素包含浮动子元素 */

/* ========== 问题3：浮动元素重叠 ========== */
.普通元素 { overflow: hidden; }  /* 创建 BFC → 不会和浮动元素重叠 */
/* BFC 区域不会和浮动元素重叠 */
/* 所以文字不会跑到图片下面（经典两栏布局） */
~~~

---

## 套路三：层叠与选择器

### 选择器优先级

**手写口诀：!important > 行内 > ID > 类/伪类/属性 > 标签/伪元素 > 通配符**

~~~
优先级（从高到低）：
  !important          → 最高（尽量不用）
  行内样式             → 1000
  #id                 → 100
  .class / :hover / [attr]  → 10
  tag / ::before      → 1
  * / 继承的           → 0

计算方式：
  从左到右比较，高位相同才比较低位
  (行内, ID, 类, 标签)

  #nav .item       → (0, 1, 1, 0) = 110
  .menu li.active  → (0, 0, 2, 1) = 21
  div p            → (0, 0, 0, 2) = 2
  #nav             → (0, 1, 0, 0) = 100
~~~

#### 测试

~~~css
/* ========== 优先级示例 ========== */
p { color: black; }              /* (0,0,0,1) = 1 */
.intro p { color: blue; }       /* (0,0,1,1) = 11 */
#content p { color: red; }      /* (0,1,0,1) = 101 */
p { color: green !important; }  /* !important 最高 */

/* 结果：green（!important） */

/* ========== 特殊情况 ========== */
/* 1. 相同优先级 → 后写的覆盖先写的（层叠规则） */
.a { color: red; }
.b { color: blue; }
/* 元素同时有 class="a b" → blue（.b 在后面） */

/* 2. 继承的样式优先级为 0 */
.parent { color: red; }      /* 优先级 0 */
.child { color: blue; }      /* 优先级 10 */
/* .child 的颜色是 blue（优先级更高） */

/* 3. :not() 不增加优先级，但括号里的选择器增加 */
.item:not(.active) { color: red; }
/* 优先级 = .item + .active = (0,0,2,0) = 20 */
~~~

### 层叠上下文

**手写口诀：层叠上下文像"小世界"，内部元素的 z-index 只在自己的世界里比较**

~~~
什么会创建层叠上下文？
  1. html 根元素
  2. position 不是 static + z-index 不是 auto
  3. opacity < 1
  4. transform 不是 none
  5. filter 不是 none
  6. flex/grid 容器的子元素 + z-index 不是 auto
  7. isolation: isolate
  8. will-change 指定某些属性
~~~

#### 测试

~~~css
/* ========== 层叠顺序（从低到高） ========== */
/*
  1. 层叠上下文的背景和边框
  2. z-index < 0（负值）
  3. 块级盒子（普通文档流中的元素）
  4. 浮动盒子
  5. 行内盒子（文字等）
  6. z-index: 0 / auto
  7. z-index > 0（正值）
*/

/* ========== 经典面试题 ========== */
<div class="A" style="position:relative; z-index:1;">
  <div class="a1" style="position:relative; z-index:999;">A的子元素</div>
</div>
<div class="B" style="position:relative; z-index:2;">
  <div class="b1" style="position:relative; z-index:1;">B的子元素</div>
</div>

/* 问：a1 和 b1 谁在上面？ */
/* 答：b1 在上面！ */

/* 为什么？ */
/* A 的 z-index=1 创建了一个层叠上下文 */
/* B 的 z-index=2 创建了一个层叠上下文 */
/* a1 的 z-index=999 只在 A 的"小世界"里有效 */
/* 但 A 的"小世界"整体 z-index=1，比 B 的"小世界" z-index=2 低 */
/* 所以 B 的"小世界"里的所有东西都在 A 的"小世界"上面 */

/* ========== 图解 ========== */
/*
  层叠顺序：
    A（z-index:1）→ a1 的 z-index:999 只在 A 内有效
    B（z-index:2）→ B 在 A 上面
    B 的子元素 b1（z-index:1）→ 在 B 内部，自然在 A 的所有子元素上面

  结论：b1 > a1（即使 a1 的 z-index=999）
*/
~~~

---

## 套路四：响应式与动画

### 媒体查询

**手写口诀：@media 根据屏幕宽度切换样式**

~~~css
/* ========== 移动端优先（min-width 从小到大） ========== */
/* 基础样式（移动端） */
.容器 {
  padding: 10px;
  font-size: 14px;
}

/* 平板 */
@media (min-width: 768px) {
  .容器 {
    padding: 20px;
    font-size: 16px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .容器 {
    padding: 30px;
    font-size: 18px;
    max-width: 960px;
  }
}

/* 大屏 */
@media (min-width: 1440px) {
  .容器 {
    max-width: 1200px;
  }
}

/* ========== 常见断点 ========== */
/* 手机：< 768px */
/* 平板：768px - 1024px */
/* 桌面：1024px - 1440px */
/* 大屏：> 1440px */
~~~

### CSS 过渡（Transition）

**手写口诀：transition 指定属性 + 时长 + 缓动**

~~~css
/* ========== 基本过渡 ========== */
.按钮 {
  background: #333;
  color: white;
  transition: all 0.3s ease;
}
.按钮:hover {
  background: #e74c3c;
  transform: translateY(-2px);
}

/* ========== 精确控制 ========== */
.卡片 {
  transition-property: transform, box-shadow;  /* 只过渡这两个属性 */
  transition-duration: 0.3s;                    /* 时长 */
  transition-timing-function: ease-out;         /* 缓动 */
  transition-delay: 0.1s;                       /* 延迟 */
}

/* 简写 */
.卡片 {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
}

/* ========== 常用缓动函数 ========== */
ease         /* 先慢后快再慢（默认） */
linear       /* 匀速 */
ease-in      /* 先慢后快 */
ease-out     /* 先快后慢 */
ease-in-out  /* 和 ease 类似但更明显 */
cubic-bezier(0.68, -0.55, 0.265, 1.55)  /* 自定义贝塞尔曲线 */
~~~

### CSS 动画（Animation）

**手写口诀：@keyframes 定义关键帧，animation 应用动画**

~~~css
/* ========== 基本动画 ========== */
@keyframes 淡入 {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.元素 {
  animation: 淡入 0.5s ease forwards;
  /* forwards = 动画结束后保持最终状态 */
}

/* ========== 多关键帧 ========== */
@keyframes 弹跳 {
  0%   { transform: translateY(0); }
  40%  { transform: translateY(-30px); }
  60%  { transform: translateY(-15px); }
  80%  { transform: translateY(-5px); }
  100% { transform: translateY(0); }
}

.球 {
  animation: 弹跳 1s ease-in-out infinite;  /* infinite = 无限循环 */
}

/* ========== animation 属性详解 ========== */
.元素 {
  animation-name: 淡入;           /* 动画名 */
  animation-duration: 0.5s;      /* 时长 */
  animation-timing-function: ease; /* 缓动 */
  animation-delay: 0.1s;         /* 延迟 */
  animation-iteration-count: 1;   /* 次数（infinite = 无限） */
  animation-direction: normal;    /* 方向（alternate = 来回） */
  animation-fill-mode: forwards;  /* 结束状态（forwards/backwards/both） */
  animation-play-state: running;  /* 播放状态（paused = 暂停） */
}

/* 简写 */
.元素 {
  animation: 淡入 0.5s ease 0.1s 1 normal forwards;
}
~~~

#### 测试

~~~css
/* ========== 性能优化：只动画 transform 和 opacity ========== */
/* ❌ 性能差（触发重排） */
@keyframes 移动 {
  from { left: 0; }
  to   { left: 100px; }
}

/* ✅ 性能好（只触发合成） */
@keyframes 移动 {
  from { transform: translateX(0); }
  to   { transform: translateX(100px); }
}

/* ========== CSS 动画 vs JS 动画 ========== */
/* CSS 动画： */
/*   简单动画用 CSS（性能好，浏览器优化） */
/*   浏览器可以跳过不可见元素的动画 */

/* JS 动画： */
/*   复杂动画用 JS（更灵活，可以动态控制） */
/*   requestAnimationFrame 和屏幕刷新率同步 */
/*   可以实现复杂的物理效果 */
~~~

### CSS 变换（Transform）

~~~css
/* ========== 2D 变换 ========== */
.元素 {
  transform: translateX(50px);       /* 水平移动 */
  transform: translateY(50px);       /* 垂直移动 */
  transform: translate(50px, 100px); /* 水平+垂直 */

  transform: rotate(45deg);          /* 旋转 */
  transform: scale(1.5);             /* 放大 */
  transform: scaleX(2);              /* 水平放大 */
  transform: skewX(10deg);           /* 倾斜 */
}

/* ========== 3D 变换 ========== */
.元素 {
  transform: perspective(1000px) rotateY(45deg);  /* 透视 + Y轴旋转 */
  transform: rotate3d(1, 1, 0, 45deg);            /* 任意轴旋转 */
}

/* ========== 变换原点 ========== */
.元素 {
  transform-origin: center center;  /* 默认：中心点 */
  transform-origin: left top;       /* 左上角 */
  transform-origin: 50px 50px;      /* 自定义坐标 */
}

/* ========== 多个变换组合 ========== */
.元素 {
  transform: translateX(50px) rotate(45deg) scale(1.2);
  /* 顺序很重要：先平移，再旋转，再缩放 */
  /* 变换顺序不同，结果不同 */
}
~~~

---

## 套路五：CSS 新特性

### CSS 变量（Custom Properties）

**手写口诀：-- 定义变量，var() 使用变量，:root 设全局变量**

~~~css
/* ========== 定义全局变量 ========== */
:root {
  --主色: #e74c3c;
  --主色-浅: #fadbd8;
  --字体-大: 18px;
  --字体-中: 14px;
  --间距: 16px;
  --圆角: 8px;
  --阴影: 0 2px 8px rgba(0,0,0,0.1);
}

/* ========== 使用变量 ========== */
.按钮 {
  background: var(--主色);
  color: white;
  font-size: var(--字体-中);
  padding: var(--间距);
  border-radius: var(--圆角);
  box-shadow: var(--阴影);
}

.按钮:hover {
  background: var(--主色-浅);
}

/* ========== 局部变量 ========== */
.卡片 {
  --卡片背景: white;
  background: var(--卡片背景);
}

/* ========== JS 操作 CSS 变量 ========== */
/* 读取 */
const 主色 = getComputedStyle(document.documentElement).getPropertyValue('--主色');

/* 修改 */
document.documentElement.style.setProperty('--主色', '#3498db');

/* ========== 变量和媒体查询结合（主题切换） ========== */
:root {
  --背景: white;
  --文字: #333;
}

[data-theme="dark"] {
  --背景: #1a1a1a;
  --文字: #f0f0f0;
}

body {
  background: var(--背景);
  color: var(--文字);
}

/* 切换主题 */
document.documentElement.setAttribute("data-theme", "dark");
~~~

### clamp / min / max

~~~css
/* ========== clamp(最小值, 首选值, 最大值) ========== */
.标题 {
  font-size: clamp(16px, 4vw, 32px);
  /* 最小 16px，首选 4vw（视口宽度的4%），最大 32px */
  /* 响应式字体，不用媒体查询 */
}

.容器 {
  width: clamp(300px, 80%, 1200px);
  /* 最小 300px，首选 80%，最大 1200px */
}

/* ========== min() ========== */
.元素 {
  width: min(80%, 600px);
  /* 取两者中较小的 */
}

/* ========== max() ========== */
.元素 {
  padding: max(16px, 2vw);
  /* 取两者中较大的 */
}
~~~

### aspect-ratio

~~~css
/* ========== 宽高比 ========== */
.视频容器 {
  width: 100%;
  aspect-ratio: 16 / 9;  /* 宽高比 16:9 */
}

.正方形 {
  width: 200px;
  aspect-ratio: 1;  /* 正方形（等同于 1/1） */
}

/* 替代以前的 padding-top hack */
/* 旧写法：padding-top: 56.25%; (9/16 = 0.5625) */
~~~

### contain

~~~css
/* ========== contain：限制元素的影响范围 ========== */
.独立组件 {
  contain: layout style paint;
  /* layout：布局变化不影响外部 */
  /* style：计数器等不影响外部 */
  /* paint：溢出内容不绘制 */

  /* 或者简写 */
  contain: strict;  /* = layout style paint size */
  contain: content; /* = layout style paint */
}

/* 性能优化：告诉浏览器这个元素是独立的 */
/* 浏览器可以跳过不可见的 contained 元素的渲染 */
~~~

### object-fit

~~~css
/* ========== 图片/视频自适应容器 ========== */
.图片容器 {
  width: 200px;
  height: 200px;
}

.图片 {
  width: 100%;
  height: 100%;
  object-fit: cover;    /* 裁剪填满容器 */
  object-fit: contain;  /* 完整显示，可能有留白 */
  object-fit: fill;     /* 拉伸填满（默认，可能变形） */
  object-fit: none;     /* 原始大小 */
  object-position: center; /* 定位 */
}
~~~

---

## 高频面试题

### 题目1：隐藏元素的 3 种方式

| 方式 | 是否占据空间 | 是否可点击 | 是否可读屏 |
|---|---|---|---|
| display: none | ❌ 不占 | ❌ 不可 | ❌ 不读 |
| visibility: hidden | ✅ 占位 | ❌ 不可 | ✅ 读 |
| opacity: 0 | ✅ 占位 | ✅ 可点击 | ✅ 读 |

### 题目2：1px 边框问题（移动端）

~~~
问题：在高 DPR（设备像素比）屏幕上
  CSS 的 1px 实际上是 2px 或 3px 物理像素
  看起来比设计稿粗

解决方案：
  1. transform: scale(0.5) 缩放
  2. 0.5px 边框（部分浏览器支持）
  3. border-image
  4. box-shadow
  5. viewport 缩放（postcss-px-to-viewport）
~~~

~~~css
/* ========== transform 缩放方案 ========== */
.细边框 {
  position: relative;
}
.细边框::after {
  content: "";
  position: absolute;
  left: 0; top: 0;
  width: 200%;
  height: 200%;
  border: 1px solid #ccc;
  transform: scale(0.5);
  transform-origin: 0 0;
}
~~~

### 题目3：CSS 三角形

~~~css
/* ========== 纯 CSS 三角形 ========== */
.三角形 {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-bottom-color: red;  /* 只显示底部边框 → 向上的三角形 */
}

/* 向上：border-bottom-color */
/* 向下：border-top-color */
/* 向左：border-right-color */
/* 向右：border-left-color */
~~~

---

## 终极记忆卡片

~~~
套路1：盒模型
  content-box → width 只含 content
  border-box  → width 含 content + padding + border
  margin 合并 → 取最大值（相邻兄弟）/ 穿透（父子）
  BFC 解决 margin 合并 + 浮动塌陷 + 重叠

套路2：布局
  Flex → 一维布局，justify-content + align-items
  Grid → 二维布局，grid-template-columns/rows + grid-area
  定位 → relative 相对自己、absolute 相对祖先、fixed 相对视口、sticky 粘性
  居中 → flex + place-items:center / absolute + translate / margin:auto

套路3：层叠与选择器
  优先级 → !important > 行内 > ID > 类 > 标签 > 通配符
  层叠上下文 → z-index 只在自己的"小世界"里有效
  创建层叠上下文 → 定位+z-index / opacity<1 / transform / filter

套路4：响应式与动画
  媒体查询 → @media (min-width) 移动端优先
  过渡 → transition: 属性 时长 缓动
  动画 → @keyframes + animation
  变换 → transform: translate/rotate/scale
  性能 → 只动画 transform 和 opacity（触发合成，不触发重排）

套路5：新特性
  CSS 变量 → --变量名 定义，var() 使用，:root 全局
  clamp → clamp(最小, 首选, 最大) 响应式值
  aspect-ratio → 宽高比（替代 padding-top hack）
  contain → 限制元素影响范围（性能优化）
  object-fit → 图片自适应容器

高频面试题
  隐藏元素 → display:none / visibility:hidden / opacity:0
  1px 边框 → transform:scale(0.5) 方案
  三角形 → border + transparent
  垂直居中 → flex / absolute+transform / grid
~~~
