# 整合练习二：最小 AI 问答 Demo

> FastAPI + DeepSeek API + SSE 流式输出 + 前端对话界面
> 一个能跑通完整链路的 AI 问答 Demo：多轮对话、流式逐字渲染、Markdown 展示、中途停止。

## 目录结构

```
src/integration-practice-2/
├── README.md                # 本文件
├── backend/
│   ├── main.py              # FastAPI 后端：/health、/chat、/chat/stream
│   ├── requirements.txt
│   ├── .env                 # 你的 API Key（不入 git）
│   ├── .env.example         # 模板
│   └── venv/
└── frontend/
    ├── index.html           # 对话界面（HTML + CSS）
    ├── app.js               # SSE 接收 + 解析 + 渲染（核心）
    └── vendor/              # 本地依赖，不走 CDN（断网也能演示）
        ├── marked.min.js    # Markdown → HTML
        └── purify.min.js    # DOMPurify，消毒 AI 输出的 HTML
```

## 启动方式

```bash
# 后端（终端 1）
cd src/integration-practice-2/backend
cp .env.example .env          # 首次：填入你的 DeepSeek API Key
./venv/bin/uvicorn main:app --reload --port 8001

# 前端（终端 2）
cd src/integration-practice-2/frontend
python3 -m http.server 5500
```

浏览器打开 http://127.0.0.1:5500

- http://127.0.0.1:8001/health —— 健康检查
- http://127.0.0.1:8001/docs —— FastAPI 自动生成的 API 文档

> 两个端口不同 = 跨域，所以后端配了 CORSMiddleware。开发阶段 `allow_origins=["*"]`，
> 上线必须写死具体域名。

## 数据流

```
浏览器                          后端 (main.py)                     DeepSeek
  │                                │                                 │
  │  POST /chat/stream             │                                 │
  │  {message, history}  ─────────▶│                                 │
  │                                │  Pydantic 校验 ─┐               │
  │                                │                 │ 401/422 早退  │
  │                                │  build_messages()               │
  │                                │      │                          │
  │                                │      └── stream=True ──────────▶│
  │                                │                                 │
  │                                │  for chunk in response:         │
  │                                │    delta.content ◀──────────────│ 一块一块
  │                                │    to_sse_frame() ─┐            │
  │  ◀── StreamingResponse flush ──┤                    │            │
  │                                │                    │            │
  │  reader.read() 一块一块收       │                                 │
  │  TextDecoder 解码              │                                 │
  │  切行 → 攒帧 → 解析             │                                 │
  │  Markdown 渲染 → 追加气泡       │                                 │
  │                                │  yield "data: [DONE]" ← 循环外   │
  │                                │                                 │
  │  try/finally 解锁 ─────────────┘                                 │
```

## 已实现的能力

| 能力 | 实现位置 | 对应清单技术点 | 状态 |
|------|---------|--------------|:----:|
| 后端骨架 + 参数校验 | `main.py` Pydantic 模型 | 10.10 / 10.12 | ✅ 已验收 8.0 |
| SSE 流式输出 | `main.py` `chatStreamRequest` | 10.20 | ✅ 已验收 8.0 |
| 前端流式接收与渲染 | `app.js` `sendMessage` | 11.7.1 | ✅ 已验收 8.0 |
| 多轮对话历史 | `main.py` `build_messages` + `app.js` `conversation` | 11.7.7 | ⚠️ 已实现，未验收 |
| Markdown 流式渲染 | `app.js` `renderMarkdown` | 11.7.2 | ⚠️ 已实现，未验收 |
| 停止生成 | `app.js` `stopGenerating` | 11.7.11 | ⚠️ 已实现，未验收 |
| RAG 增强 | —— | 11.4 | ⬜ 未开始 |

> "已实现，未验收"的意思是：代码在跑，但还没经过"自己写 + 三层追问"的验收流程。
> 面试前要把这几个点的原理自己讲一遍（对话记录里有话术模板）。

## 代码阅读顺序

想搞懂原理的话，按这个顺序看最省力：

1. **`backend/main.py` 文件头** —— 五个"为什么"（为什么用 SSE、为什么错误只能在流里发、为什么正文不能直接带换行……）
2. **`backend/main.py` 的 `to_sse_frame()`** —— SSE 帧格式的全部规则就这 8 行
3. **`frontend/app.js` 文件头** —— 三个核心难点（为什么不用 EventSource、网络切片 ≠ 帧边界、怎么知道"说完了"）
4. **`frontend/app.js` 的读流循环** —— 本项目的技术核心，注意三个"必须住在循环外面"的状态变量
5. **`frontend/app.js` 的 `stopGenerating()`** —— 停止生成的边界（它其实不是"立刻"停的）

## 踩过的坑（都在对话记录里）

| 坑 | 现象 | 根因 |
|----|------|------|
| `print` 到终端 ≠ 发给浏览器 | 完全没有流式 | 循环里的 print 是服务器的输出通道，和 HTTP 响应是两回事 |
| 生成器写对但没有发送者 | 完全没有流式 | 生成器负责「产生」，`StreamingResponse` 负责「发送」 |
| `if not chunk.choices` 写成 `is None` | 回答末尾冒出一句假错误 | 空的是「列表没元素」(`[]`)，不是 `None` |
| `media_type="text/plain"` | curl 测着正常，一接前端就死 | `EventSource` 会检查 `Content-Type` |
| `setAttribute('disabled', false)` | 发完第一条消息后按钮永久锁死 | HTML 布尔属性只要存在就是 true，得用 property |
| `innerHTML` 渲染 AI 输出 | 回答里的尖括号凭空消失 | 被当成 HTML 解析了，还有 XSS 面 |
| 帧状态写在读流循环里 | 整段回答一个字都不显示，时好时坏 | 帧的边界和网络块的边界没有任何关系 |
| `finish_reason == 'stop'` 才发 `[DONE]` | 长回答误报"回答中断" | 撞到 `max_tokens` 时 `finish_reason` 是 `'length'` |

## 已知限制（面试被问到可以主动说）

- **后端无状态**：对话历史由前端传，没做多设备同步。真要做多用户得配 session_id + Redis。
- **停止生成不是立刻的**：后端用同步 OpenAI 客户端跑在线程池，取消要等当前那次网络读返回。生产做法是 `AsyncOpenAI` + `request.is_disconnected()`。
- **没有上下文摘要压缩**：历史只按条数截断（最近 20 条），长对话会丢早期信息。
- **没有做限流 / 鉴权**：谁都能调你的接口刷额度。
