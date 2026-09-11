# 对话记录：整合练习二 · 里程碑 1（10.10 FastAPI 基础 + 10.12 请求校验）

日期：2026-09-11
对应技术点：10.10 FastAPI 基础（P1，能写代码）、10.12 FastAPI 请求校验与响应模型（P1，能写代码）
产出文件：`src/integration-practice-2/backend/main.py`

---

## 一、教学过程

### 为什么需要后端

浏览器不能直接调 DeepSeek API——API Key 会暴露在 Network 面板，任何人 F12 就能抄走刷爆额度。所以必须有后端做中转站：

```
浏览器  ──①问题──▶  你的后端（持有 Key）  ──②带Key──▶  DeepSeek
浏览器  ◀──④回答──  你的后端            ◀──③回答────  DeepSeek
```

FastAPI 就是写这个中转站的框架，Python 生态里做 AI 应用后端的事实标准。

### Python vs JS 对照表（学生反馈"不会写 Python"，补充讲解）

| 前端世界 | FastAPI 世界 | 说明 |
|---------|-------------|------|
| Express / Koa | FastAPI | Web 框架本体 |
| `app.post('/chat', handler)` | `@app.post("/chat")` 装饰器 | 注册路由的方式 |
| Vite dev server | uvicorn | 开发服务器，负责跑起来 + 热重载 |
| `node_modules/` | `venv/` | 每个项目独立的依赖目录 |
| TS `interface` | Pydantic `BaseModel` | 定义数据结构（关键区别见下） |

**语法层面的对应：**

```python
from fastapi import FastAPI          →  const { FastAPI } = require('fastapi')
load_dotenv("./.env")                →  dotenv.config({ path: './.env' })
os.environ["DEEPSEEK_API_KEY"]       →  process.env.DEEPSEEK_API_KEY
```

```python
client = OpenAI(                     →  const client = new OpenAI({
   api_key=...,                          apiKey: ...,
   base_url=...,                         baseURL: ...,
)                                     →  })
```

`key=value` 是"关键字参数"，等价于 JS 的对象字面量，顺序无所谓。

### 三个关键区别

**区别一：装饰器就是"注册路由"**

```python
@app.post("/chat")     # 贴标签，把函数注册到 POST /chat
def chatRequest(data: ChatRequest): ...
```
```js
app.post('/chat', (req, res) => { ... })   // 传参
```
两种写法干同一件事，Python 选了装饰器语法。和 Vue 的 `@click="fn"` 是同一个东西。

**区别二：Pydantic 是"运行时真的会拦你"（面试高频）**

- **TS interface**：编译时检查，编译完就**没了**。运行时传 `{message: 123}`，TS 管不了，得自己写 `if` 判断。
- **Pydantic**：**运行时真的校验**。传错类型直接返回 422，业务函数**根本不会被调用**。

**区别三：`data: ChatRequest` 这行标注是魔法所在**

它告诉 FastAPI："把请求体 JSON 按 ChatRequest 的规则解析，校验通过后塞进 `data`"。校验不过函数不执行。

### 学生的 5 个问题（首次提交诊断）

| # | 问题 | 严重程度 |
|---|------|:--------:|
| 1 | `temperature = 0.7` 缺类型标注 → Pydantic 直接报错起不来 | 🔴 致命 |
| 2 | `base_url` 少了 `/v1` → 404 | 🔴 致命 |
| 3 | `stream=False` 却还在 for 循环遍历 response | 🔴 逻辑错 |
| 4 | 返回裸字符串，不是 `{"reply": ...}` | 🟡 |
| 5 | `except` 里 `return ""` | 🟡 |

**问题 3 的讲解方式（水龙头类比）：**
- `stream=True` 是**开水龙头**——水一点一点流出来，拿桶一块块接（for 循环遍历 chunk）
- `stream=False` 是**一桶水直接给你**——桶已经装满了，直接喝，没有"一块块接"这回事

学生从 11.1.10 的流式代码复制过来，只把 `stream=True` 改成 `False`，下面的处理逻辑没跟着改。

**中转站实测结果（导师验证）：**

| 地址 | 结果 |
|------|------|
| `https://api-cn.hi-code.cc/chat/completions` | ❌ 404 Not Found |
| `https://api-cn.hi-code.cc/v1/chat/completions` | ✅ 正常返回 |

模型名 `deepseek-v4.1-flash` 有效，Key 有效。

---

## 二、验收过程

### 实测结果（8 个测试用例）

| # | 测试项 | 结果 | 判定 |
|---|--------|------|:----:|
| 1 | 服务启动 | `Uvicorn running on http://127.0.0.1:8001` | ✅ |
| 2 | `GET /health` | `{"status":"ok"}` | ✅ |
| 3 | `POST /chat` 真实调用 | `{"reply":"Token 是语言模型处理文本时使用的最小单位..."}` | ✅ |
| 4 | 空 body `{}` | `422 Field required` | ✅ |
| 5 | `message` 传数字 | `422 Input should be a valid string` | ✅ |
| 6 | `temperature` 传字符串 | `422 Input should be a valid number` | ✅ |
| 7 | 不传 `temperature` | `200`，用默认值 0.7 | ✅ |
| 8 | `message` 传空字符串 `""` | `200`，AI 正常回答 | ⚠️ |

### 三层追问完整记录

**第一层 · 白话复述**

> 导师：用你自己的话讲，FastAPI 是什么？它在你这个 demo 里扮演什么角色？

> 学生：FastAPI 是 Python 的一个框架，用于处理 HTTP 请求，返回 JSON；扮演了中转站的角色。

**评判**：对——框架、处理 HTTP、返回 JSON、中转站，四个点都对。
**漏**：FastAPI 最值钱的两个卖点没提——① Pydantic 自动校验 ② 自动生成 API 文档（`/docs`）。面试时这两点必须说出来，否则就变成"又一个 Web 框架"。

---

**第二层 · 对比理解**

> 导师：Pydantic 的 BaseModel 和 TS 的 interface，最大的区别是什么？为什么这个区别对 AI 应用特别值钱？

> 学生：最大的区别是 BaseModel 支持校验，等在函数中执行的第一行就是校验通过了的；TypeScript 需要额外的逻辑代码来校验；避免不受控制的格式来攻击。

**评判**：答得好 ✅
- **"在函数中执行的第一行就是校验通过了的"** —— 这句话说得很准。校验发生在业务函数**被调用之前**，所以函数体里可以放心用 `data.message`，不用写 `if (!data.message) return`。
- **小修正**："避免不受控制的格式来攻击" —— 方向对，但主要收益是**防止脏数据打崩业务逻辑**，安全是附带收益。面试时说"防脏数据"比"防攻击"更准确。

---

**第三层 · 场景应用**

> 导师：现在有个新需求——限制用户输入不能超过 500 字，超了就返回错误。你会怎么改？

> 学生：直接增加 `message: str = Field(..., max_length=500)`

**评判**：完全正确 ✅ 写法标准，`Field` 和 `...` 都用对了。`...` 表示"必填，无默认值"。

**导师补充**：加上 `min_length=1` 正好解决测试用例 8 挂掉的问题：
```python
message: str = Field(..., min_length=1, max_length=500)
```
一个约束同时解决"空输入"和"超长输入"，这才是生产级写法。

---

## 三、验收结论

**评分：8.0 分 ｜ 判定：通过 ✅**

| 维度 | 得分 | 说明 |
|------|:----:|------|
| 概念理解 | 3.5 / 4 | 三层追问全答对，第三层答得很准；第一层漏了 FastAPI 的核心卖点 |
| 代码正确性 | 3 / 3 | 8 个测试用例 7 个通过，核心链路完全跑通 |
| 边界处理 | 1 / 2 | 空字符串没拦住、错误时返回空串 |
| 表达清晰度 | 0.5 / 1 | 注释错误且无自己的解释 |

### 扣分项

1. **-1 分**：空字符串 `""` 没拦住（`message: str` 不拦空串，需 `min_length`）
2. **-1 分**：注释还是错的 —— `stream=False # 流式模式`，自相矛盾，反映"照着提示改"而非"理解着改"
3. **-0.5 分**：`except` 里返回 `""`，前端无法区分"出错"和"AI 没说话"
4. **-0.5 分**：`load_dotenv("./.env")` 相对路径，换目录启动就失效

### 需要修改的地方（改完直接进里程碑 2，不用重新验收）

```python
# ① 注释改对——别把自相矛盾的注释带进简历项目
stream=False,   # 改成"非流式：等 AI 说完一次性返回"

# ② 请求体加约束
from pydantic import BaseModel, Field
message: str = Field(..., min_length=1, max_length=500)

# ③ 错误返回可读信息
except Exception as e:
    print(f"[错误] {type(e).__name__}: {e}")
    return {"reply": "服务暂时不可用，请稍后重试"}

# ④ 路径健壮性（可选）
load_dotenv()   # 不传参数，自动找当前目录的 .env
```

验证方式：`curl -d '{"message": ""}'` 看到 **422** 即第 ② 条生效。

### 下一步动作

**里程碑 2：SSE 流式输出**（对应技术点 10.20 FastAPI SSE 流式输出，P1）

把现在的"等 AI 全部说完再返回"改成"AI 说一个字前端显示一个字"。这是 AI 应用的核心体验，也是面试必问点。

---

## 四、面试话术沉淀

**问：你们后端为什么用 FastAPI？**

> 三个原因。第一，它自带 Pydantic 校验，请求体定义成模型后，运行时自动校验，脏数据根本进不了业务逻辑，我不用手写一堆 if 判断。第二，它自动生成 API 文档（/docs），前后端联调时前端直接看着文档调，省掉很多沟通成本。第三，原生支持 async 和流式响应，AI 应用要的 SSE 流式输出写起来很自然。

**问：Pydantic 和 TypeScript 的类型校验有什么区别？**

> TS 是编译时的，编译完类型信息就没了，运行时传错类型它管不了，得自己写校验逻辑。Pydantic 是运行时的，请求进来先过一遍模型校验，不通过直接返回 422，业务函数根本不会被调用。对 AI 应用特别重要，因为输入全是用户随便打的字，没有这层校验后端很容易被打崩。
