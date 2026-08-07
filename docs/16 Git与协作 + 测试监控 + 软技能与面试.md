# Git与协作 + 测试监控 + 软技能与面试

## 一、Git 核心操作

### 1.1 Git 四个工作区

~~~
工作区（Working Directory）
  → 你正在编辑的文件
  → 类比：你面前的桌子

暂存区（Staging Area / Index）
  → git add 之后的文件
  → 类比：打包台，准备装箱的物品

本地仓库（Local Repository）
  → git commit 之后的文件
  → 类比：你家的仓库

远程仓库（Remote Repository）
  → git push 之后的文件
  → 类比：公司的共享仓库（GitHub/GitLab）

完整流程：
  修改文件 → git add → 暂存区 → git commit → 本地仓库 → git push → 远程仓库
~~~

### 1.2 日常高频命令

~~~bash
# ========== 基础操作
git init                              # 初始化仓库
git clone <地址>                       # 克隆远程仓库
git status                            # 查看状态（哪些文件改了/暂存了）
git diff                              # 查看具体改了什么
git log --oneline --graph             # 查看提交历史（一行一个，带分支图）

# ========== 提交流程（最常用）
git add .                             # 暂存所有修改
git add 文件名                         # 暂存指定文件
git commit -m "feat: 新增菜品搜索功能"  # 提交（Conventional Commits 格式）
git push origin main                  # 推送到远程

# ========== 分支操作
git branch                            # 查看本地分支
git branch -a                         # 查看所有分支（含远程）
git branch 新分支名                    # 创建分支
git checkout 新分支名                  # 切换分支
git checkout -b 新分支名               # 创建并切换（上面两条合并）
git merge 目标分支                     # 合并目标分支到当前分支
git branch -d 分支名                   # 删除已合并的分支
git branch -D 分支名                   # 强制删除未合并的分支

# ========== 暂存（Stash）— 临时保存工作区
git stash                             # 暂存当前修改（工作区变干净）
git stash list                        # 查看暂存列表
git stash pop                         # 恢复最近一次暂存并删除
git stash apply                       # 恢复最近一次暂存（不删除）
# 场景：正在改功能A，突然要切分支修 bug → stash → 切分支 → 修完切回来 → stash pop

# ========== 撤销操作
git checkout -- 文件名                  # 撤销工作区的修改（回到上次 commit 的状态）
git reset HEAD 文件名                   # 从暂存区移除（不删除修改）
git reset --soft HEAD~1                # 撤销最近一次 commit，保留修改在暂存区
git reset --mixed HEAD~1               # 撤销最近一次 commit，保留修改在工作区
git reset --hard HEAD~1                # 撤销最近一次 commit，删除所有修改（危险！）

# ========== 回退（Revert）— 安全地撤销某个 commit
git revert <commit-hash>               # 创建一个新 commit 来"抵消"指定 commit
# 和 reset 的区别：revert 不改变历史，适合已经 push 的 commit
~~~

### 1.3 Rebase vs Merge

~~~
merge（合并）：
  git merge feature-branch
  特点：保留完整分支历史，生成一个"合并 commit"
  历史图：有分叉和汇合

  main:    A --- B --- C --- F (merge commit)
                    \     /
  feature:           D --- E

rebase（变基）：
  git checkout feature-branch
  git rebase main
  特点：把 feature 的 commit "移植"到 main 的最新节点后面
  历史图：一条直线，更干净

  main:    A --- B --- C
                        \
  feature:               D' --- E'

选择建议：
  团队协作 → merge（保留历史，方便回溯）
  个人分支同步主分支 → rebase（保持历史干净）
  已经 push 到远程的分支 → 不要 rebase（会改变历史，影响他人）
~~~

### 1.4 分支策略

~~~
Git Flow（适合大项目/发版制）：
  main      → 生产环境代码，只接受 merge
  develop   → 开发主线
  feature/* → 功能分支（从 develop 创建，完成后合并回 develop）
  release/* → 预发布分支（从 develop 创建，测试完合并到 main 和 develop）
  hotfix/*  → 紧急修复（从 main 创建，修完合并到 main 和 develop）

  main:      ──●─────────────●─────────────●──
                \           /↑ \           /↑
  develop:  ──●──●──●──●──●──●──●──●──●──●──
              ↑       ↑       ↑       ↑
  feature:    └─A─┘   └─B─┘   └─C─┘   └─D─┘

GitHub Flow（适合小团队/持续部署）：
  main     → 永远可部署
  feature/* → 从 main 创建，完成后通过 PR 合并回 main
  更简单，没有 develop 分支
~~~

### 1.5 Cherry-pick 与冲突解决

~~~bash
# ========== Cherry-pick（摘樱桃）— 把某个 commit 单独应用到当前分支
git cherry-pick <commit-hash>
# 场景：feature-A 的某个 commit 也想应用到 release 分支

# ========== 冲突解决
# 冲突标志（手动编辑冲突文件）：
# <<<<<<< HEAD
# 当前分支的内容
# =======
# 要合并的分支的内容
# >>>>>>> feature-branch

# 解决步骤：
# 1. 编辑文件，保留想要的内容，删除冲突标志
# 2. git add 冲突文件
# 3. git commit（自动生成合并信息）
# 4. git push

# ========== 工具辅助
git mergetool                         # 用配置的合并工具解决冲突
# VS Code 内置了很好的冲突解决 UI（推荐）
~~~

### 1.6 Conventional Commits 规范

~~~
格式：<类型>(<范围>): <描述>

类型：
  feat:     新功能
  fix:      修复 bug
  docs:     文档修改
  style:    代码格式（不影响逻辑）
  refactor: 重构（不是新功能也不是修 bug）
  perf:     性能优化
  test:     添加测试
  chore:    构建/工具/依赖修改

示例：
  feat(菜品): 新增菜品搜索功能
  fix(订单): 修复订单总价计算错误
  docs: 更新 README
  refactor(工具类): 抽取公共校验函数
  chore: 升级 vue 到 3.4
~~~

---

## 二、测试基础

### 2.1 为什么要写测试

~~~
没有测试的代码：
  改了一个函数 → 不确定有没有影响其他功能 → 手动点一遍 → 费时且容易漏

有测试的代码：
  改了一个函数 → 运行测试 → 全绿就没问题 → 红了就知道哪里坏了

测试金字塔（从下到上，数量递减，成本递增）：
  ┌─────────────────────┐
  │    E2E 测试（少量）   │  → Playwright，模拟真实用户操作
  ├─────────────────────┤
  │   集成测试（适量）    │  → 测试多个模块协作
  ├─────────────────────┤
  │   单元测试（大量）    │  → Vitest，测试单个函数/组件
  └─────────────────────┘
~~~

### 2.2 Vitest 单元测试

~~~bash
# 安装
npm install -D vitest
~~~

**配置 `vitest.config.ts`：**

~~~typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,          // 全局 API（describe/it/expect 不用导入）
    environment: 'jsdom',   // 模拟浏览器环境
  },
})
~~~

**第一个测试文件 `src/utils/__tests__/价格计算.test.ts`：**

~~~typescript
// ========== 价格计算的测试
import { describe, it, expect } from 'vitest'
import { 计算总价, 计算折扣 } from '../价格计算'

// describe = 一组相关的测试（测试套件）
// it / test = 一个测试用例
// expect = 断言（判断结果是否符合预期）

describe('计算总价', () => {
  it('正常计算', () => {
    expect(计算总价(38.5, 2)).toBe(77)       // 等于
  })

  it('数量为0返回0', () => {
    expect(计算总价(38.5, 0)).toBe(0)
  })

  it('处理浮点精度', () => {
    expect(计算总价(0.1, 0.2)).toBeCloseTo(0.3)  // 浮点近似等于
  })
})

describe('计算折扣', () => {
  it('银卡打9折', () => {
    expect(计算折扣('银卡', 100)).toBe(90)
  })

  it('金卡打85折', () => {
    expect(计算折扣('金卡', 100)).toBe(85)
  })

  it('未知会员不打折', () => {
    expect(计算折扣('未知', 100)).toBe(100)
  })
})
~~~

**常用断言方法：**

~~~typescript
expect(值).toBe(值)                  // 严格相等 ===
expect(值).toEqual(对象)              // 深度相等（比较对象内容）
expect(值).toBeTruthy()               // 真值
expect(值).toBeFalsy()                // 假值
expect(值).toBeNull()                 // null
expect(值).toBeUndefined()            // undefined
expect(值).toContain(子串)            // 包含
expect(数组).toHaveLength(3)          // 长度
expect(函数).toThrow()                // 抛出异常
expect(值).toBeGreaterThan(5)         // 大于
expect(值).toBeCloseTo(0.3)          // 浮点近似相等
~~~

### 2.3 Vue3 组件测试

~~~bash
npm install -D @vue/test-utils jsdom
~~~

**组件测试示例：**

~~~typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import 菜品卡片 from '../菜品卡片.vue'

describe('菜品卡片', () => {
  const 菜品数据 = {
    名称: '宫保鸡丁',
    价格: 38.5,
    辣度: 3,
  }

  it('正确显示菜品名称', () => {
    const wrapper = mount(菜品卡片, {
      props: { 菜品: 菜品数据 },
    })

    expect(wrapper.text()).toContain('宫保鸡丁')
    expect(wrapper.text()).toContain('38.5')
  })

  it('点击触发点单事件', async () => {
    const wrapper = mount(菜品卡片, {
      props: { 菜品: 菜品数据 },
    })

    // 模拟点击
    await wrapper.find('[data-testid="点单按钮"]').trigger('click')

    // 验证事件被触发
    expect(wrapper.emitted('点单')).toBeTruthy()
    expect(wrapper.emitted('点单')![0]).toEqual([菜品数据])
  })

  it('售罄状态显示灰色', () => {
    const wrapper = mount(菜品卡片, {
      props: { 菜品: { ...菜品数据, 售罄: true } },
    })

    expect(wrapper.find('.菜品卡片').classes()).toContain('售罄')
  })
})
~~~

### 2.4 E2E 测试（Playwright）

~~~bash
npm init playwright@latest
~~~

**E2E 测试示例：**

~~~typescript
import { test, expect } from '@playwright/test'

test('点餐流程', async ({ page }) => {
  // 1. 打开首页
  await page.goto('http://localhost:5173')

  // 2. 看到菜品列表
  await expect(page.locator('.菜品卡片')).toHaveCount(6)

  // 3. 点击宫保鸡丁的点单按钮
  await page.locator('[data-testid="点单-宫保鸡丁"]').click()

  // 4. 购物车中出现宫保鸡丁
  await expect(page.locator('.购物车')).toContainText('宫保鸡丁')

  // 5. 点击结账
  await page.locator('button:has-text("结账")').click()

  // 6. 看到订单确认页
  await expect(page.locator('.订单确认')).toContainText('下单成功')
})
~~~

### 2.5 运行测试

~~~bash
# 运行所有测试
npx vitest

# 运行一次（不 watch）
npx vitest run

# 只运行某个文件
npx vitest run src/utils/__tests__/价格计算.test.ts

# 查看覆盖率
npx vitest run --coverage

# E2E 测试
npx playwright test
~~~

---

## 三、前端监控

### 3.1 Web Vitals（5 个核心指标）

~~~
Google 定义的 5 个用户体验指标：

┌────────┬──────────────────────────────────┬─────────┐
│ 指标    │ 含义                             │ 好/差    │
├────────┼──────────────────────────────────┼─────────┤
│ LCP    │ 最大内容绘制时间（首屏主要元素出现）│ <2.5s 好│
│ FID    │ 首次输入延迟（点击到响应）          │ <100ms 好│
│ CLS    │ 累积布局偏移（页面是否抖动）        │ <0.1 好 │
│ FCP    │ 首次内容绘制（第一个像素出现）      │ <1.8s 好│
│ TTFB   │ 首字节时间（服务器响应速度）        │ <800ms 好│
└────────┴──────────────────────────────────┴─────────┘

简单记忆：
  LCP = 页面加载完了吗？（Loading）
  FID = 页面能响应操作了吗？（Interactivity）
  CLS = 页面会不会乱跳？（Visual Stability）
~~~

### 3.2 Performance API

~~~javascript
// ========== 测量页面加载性能
const 导航计时 = performance.getEntriesByType('navigation')[0];
console.log({
  DNS查询: 导航计时.domainLookupEnd - 导航计时.domainLookupStart,
  TCP连接: 导航计时.connectEnd - 导航计时.connectStart,
  首字节:  导航计时.responseStart - 导航计时.requestStart,
  DOM解析: 导航计时.domContentLoadedEventEnd - 导航计时.responseStart,
  页面完全加载: 导航计时.loadEventEnd - 导航计时.startTime,
});

// ========== 测量某个操作的耗时
performance.mark('搜索开始');
// ... 执行搜索操作
performance.mark('搜索结束');
performance.measure('搜索耗时', '搜索开始', '搜索结束');
const 测量结果 = performance.getEntriesByName('搜索耗时')[0];
console.log(`搜索耗时: ${测量结果.duration}ms`);
~~~

### 3.3 错误监控

~~~javascript
// ========== 捕获全局错误
window.onerror = (消息, 文件, 行号, 列号, 错误) => {
  console.error('JS 错误:', { 消息, 文件, 行号, 列号 });
  // 上报到监控平台
  上报错误({ 类型: 'JS错误', 消息, 文件, 行号, 堆栈: 错误?.stack });
};

// ========== 捕获未处理的 Promise 异常
window.addEventListener('unhandledrejection', (事件) => {
  console.error('未处理的 Promise 异常:', 事件.reason);
  上报错误({ 类型: 'Promise异常', 消息: String(事件.reason) });
});

// ========== 捕获资源加载错误
window.addEventListener('error', (事件) => {
  if (事件.target.tagName) {
    console.error('资源加载失败:', 事件.target.src || 事件.target.href);
    上报错误({ 类型: '资源错误', 资源: 事件.target.src });
  }
}, true);  // 注意：必须是 true（捕获阶段）

// ========== Vue3 错误处理
// app.config.errorHandler = (错误, 组件, 信息) => {
//   上报错误({ 类型: 'Vue错误', 错误, 组件: component?.$options.name, 信息 });
// };
~~~

### 3.4 Sentry 接入（生产环境推荐）

~~~bash
npm install @sentry/vue
~~~

~~~typescript
// main.ts
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: 'https://你的dsn@sentry.io/项目id',
  integrations: [
    Sentry.browserTracingIntegration({ router }),
  ],
  tracesSampleRate: 0.1,  // 采集 10% 的性能数据
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,  // 出错时 100% 录屏
});
~~~

---

## 四、软技能与面试

### 4.1 STAR 法则（回答项目问题的万能公式）

~~~
S = Situation（背景）  → 项目的背景和挑战是什么
T = Task（任务）       → 你负责什么
A = Action（行动）     → 你做了什么（技术方案 + 具体实施）
R = Result（结果）     → 取得了什么成果（量化！）

模板：
  "在 [S: 项目背景] 中，我负责 [T: 你的任务]。
   我通过 [A: 技术方案和实施过程]，
   最终实现了 [R: 量化的结果]。"

示例：
  ❌ "我做了个前端项目"（太笼统）
  ✅ "在公司内部管理系统中（S），我负责菜品管理模块的前端开发（T）。
     我用 Vue3 + TypeScript + Pinia 搭建了整个模块，用虚拟列表优化了
     大量菜品数据的渲染性能（A），将页面加载时间从 3 秒降到 0.8 秒，
     组件单元测试覆盖率做到了 85%（R）。"
~~~

### 4.2 项目经历 3 条量化亮点

~~~
亮点1：性能优化
  "负责某产品的前端性能优化，通过代码分割 + 路由懒加载 + 图片懒加载，
   首屏加载时间从 4.2s 降到 1.5s，Lighthouse 评分从 45 提升到 92。"

亮点2：工程化建设
  "搭建了前端 Monorepo 工程体系（pnpm workspace + Turborepo），
   统一了 5 个子项目的构建流程和代码规范，开发效率提升约 30%。"

亮点3：技术方案
  "主导了从 Vue2 到 Vue3 的技术迁移，制定了渐进式迁移方案，
   在不影响业务迭代的前提下，3 个月完成全部迁移，
   包体积减少 20%，TypeScript 覆盖率从 0% 到 90%。"

每个亮点的结构：做了什么 → 怎么做的 → 量化结果
~~~

### 4.3 项目讲解（8 分钟版）

~~~
结构（按时间分配）：

1. 项目背景（1分钟）
   → 公司是做什么的，这个项目解决什么问题
   → 用户是谁，日活多少

2. 技术架构（1分钟）
   → 技术栈选择及原因
   → 项目结构（前端/后端/部署）

3. 你的职责（1分钟）
   → 你负责哪些模块
   → 团队规模和你的角色

4. 技术亮点（3分钟，挑 2-3 个展开）
   → 用 STAR 法则讲每个亮点
   → 重点讲"你做了什么"而不是"项目有什么"

5. 遇到的挑战（1分钟）
   → 遇到了什么困难
   → 你是怎么解决的
   → 学到了什么

6. 总结（1分钟）
   → 项目成果（量化）
   → 你的成长
~~~

### 4.4 薪资谈判（3万 Offer 话术）

~~~
核心原则：
  1. 先了解市场行情，再报价
  2. 报一个范围而不是精确数字
  3. 强调你的价值，而不是你需要多少钱

话术模板：

Q: "你的期望薪资是多少？"

A: "基于我 5 年的前端开发经验，以及最近深入学习 AI 应用开发的技术栈
   （Python + FastAPI + RAG + Agent），我认为我的能力可以在
   前端 + AI 应用方向为团队创造价值。结合市场行情，我的期望是 25K-35K，
   具体可以根据岗位职责和团队情况进一步沟通。"

要点：
  → 报范围，上沿比实际期望高一些（35K）
  → 强调经验 + 新技能（AI 方向加薪的筹码）
  → 留谈判空间

Q: "你目前薪资多少？"

A: "我目前在 xxx 的综合年收入是 XX 万。因为我在前端基础上
   新增了 AI 应用开发能力，我认为这是一个价值提升，
   所以期望有合理的涨幅。"

Q: "我们只能给到 25K"

A: "感谢 offer。考虑到这个岗位涉及 AI 应用开发，
   我需要投入额外的学习和实践成本。如果 base 能到 28K，
   我可以今天就确认。或者我们也可以讨论一下试用期后的调薪机制。"

核心策略：
  → 不要第一个报价（先了解岗位预算）
  → 不要说"随便"或"都可以"
  → 拿到 offer 后再谈（你有谈判筹码）
  → AI 技能是差异化竞争点，要突出
~~~

### 4.5 面试复盘模板

~~~
每次面试后立即记录：

┌─────────────────────────────────────────┐
│ 日期：2024-XX-XX                        │
│ 公司：XXX                               │
│ 岗位：前端/AI应用开发                    │
│ 轮次：第 X 轮（技术面/主管面/HR面）      │
├─────────────────────────────────────────┤
│ 答得好的题：                             │
│   - Vue3 响应式原理（讲得很流畅）        │
│   - RAG 流程（面试官说讲得清晰）         │
│                                         │
│ 答得不好的题：                           │
│   - webpack 的 tree shaking 原理没讲清楚 │
│   - 算法题：LRU 缓存写了一半             │
│                                         │
│ 被问到但没准备的题：                     │
│   - 微前端方案了解吗？                   │
│   - 如何设计一个组件库？                 │
│                                         │
│ 下一步改进：                             │
│   - 复习 webpack 原理                    │
│   - 手写 LRU 直到闭眼能写               │
│   - 了解微前端 qiankun                   │
└─────────────────────────────────────────┘
~~~

### 4.6 技术选型能力（面试常问）

~~~
Q: "为什么选 Vue3 不选 React？"

回答框架：需求分析 → 方案对比 → 选择理由

A: "我两个都用过。选择 Vue3 主要看三点：
   1. 团队情况：团队成员 Vue 经验更丰富，学习成本低
   2. 项目需求：管理系统类项目，Vue 的单文件组件 + Composition API
      开发效率更高
   3. 生态：Vue3 + Vite + Pinia + Vue Router 这套组合非常成熟

   如果是大型 C 端项目或需要 React Native，我会选 React。
   技术选型没有绝对的对错，关键是匹配团队和项目。"

常见技术选型对比（准备好）：
  Vue3 vs React → 看团队和项目类型
  Vite vs Webpack → 新项目选 Vite
  Pinia vs Vuex → Vue3 选 Pinia
  Tailwind vs CSS Modules → 看团队习惯
  PostgreSQL vs MySQL → AI 项目选 PG（pgvector 支持）
  FastAPI vs Express → Python AI 生态选 FastAPI
~~~

### 4.7 系统设计思维

~~~
Q: "如果让你设计一个 AI 点餐系统，你会怎么做？"

回答框架（5 步）：

1. 需求分析（1分钟）
   → 用户是谁？（顾客、服务员、厨师、老板）
   → 核心功能？（AI 推荐、点餐、下单、流式对话）
   → 非功能需求？（并发量、响应时间、可用性）

2. 技术架构（2分钟）
   → 前端：Vue3 + SSE 流式接收
   → 后端：FastAPI + Function Calling + RAG
   → 数据库：PostgreSQL + pgvector（存向量）
   → 部署：Docker + Nginx

3. 核心模块设计（3分钟）
   → AI 对话模块：SSE 流式 + Function Calling 调工具
   → RAG 知识库：菜品文档切块 → Embedding → ChromaDB
   → 订单模块：Pydantic 校验 → SQLAlchemy → PostgreSQL
   → 记忆系统：对话历史 + 摘要压缩

4. 难点与解决方案（2分钟）
   → SSE 长连接超时 → Nginx proxy_read_timeout
   → AI 响应慢 → 流式输出给用户即时反馈
   → 并发点餐 → 数据库事务 + 乐观锁

5. 扩展性（1分钟）
   → 支持多餐厅 → 多租户架构
   → 支持语音 → Whisper API
   → 支持图片识别 → GPT-4V 识别菜品图片
~~~

---

## 终极记忆卡片

### Git
1. **四区** → 工作区 → add → 暂存区 → commit → 本地仓库 → push → 远程仓库
2. **分支** → feature/\* 开功能，hotfix/\* 修 bug，main 只接受 merge
3. **merge vs rebase** → merge 保留分支历史，rebase 变成直线（已 push 不要 rebase）
4. **stash** → 临时保存修改，切分支前用
5. **Conventional Commits** → feat/fix/docs/refactor + 描述

### 测试
6. **Vitest** → describe + it + expect，单元测试首选
7. **Vue Test Utils** → mount 组件 → find 元素 → trigger 事件 → 检查 emitted
8. **Playwright** → page.goto → locator → click → expect
9. **Web Vitals** → LCP < 2.5s，FID < 100ms，CLS < 0.1
10. **错误监控** → onerror + unhandledrejection + 资源 error → 上报 Sentry

### 面试
11. **STAR** → 背景 → 任务 → 行动 → 量化结果
12. **项目讲解** → 背景1分 + 架构1分 + 职责1分 + 亮点3分 + 挑战1分 + 总结1分
13. **薪资** → 报范围（25-35K），强调 AI 差异化，拿到 offer 再谈
14. **技术选型** → 需求分析 → 方案对比 → 选择理由（没有绝对对错）
15. **系统设计** → 需求分析 → 架构 → 核心模块 → 难点 → 扩展
