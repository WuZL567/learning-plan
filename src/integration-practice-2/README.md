> ⚠️ **本目录是学习阶段的历史快照**（2026-09-18 定格，不再更新）
>
> 项目已抽出为**独立仓库** `../../../ai-knowledge-qa/`（保留完整 commit 历史）。
> **后续演进在独立仓库进行**，本目录只作为对话记录引用的存档（notes 里大量引用此路径）。

---

# 整合练习二：最小 AI 问答 Demo

> FastAPI + DeepSeek API + SSE 流式输出 + 前端对话界面
> 一个能跑通完整链路的 AI 问答 Demo：多轮对话、流式逐字渲染、Markdown 展示、中途停止。

## 目录结构

```
src/integration-practice-2/
├── README.md                # 本文件
├── backend/
│   ├── main.py              # FastAPI 后端：/health、/chat、/chat/stream
│   ├── rag.py               # 文档加载，文本切块，文本向量化，余弦相似度计算，向量库存储，建立文档索引，问题在线索引
│   ├── rag_chain.py         # 阈值过滤，拼接系统提示词，拼接消息数组，检索结果拼接成SSE帧
│   ├── requirements.txt
│   ├── .env                 # 你的 API Key（不入 git）
│   ├── .env.example         # 模板
│   └── venv/
├── knowledge/               # 知识库：4 篇 .md 学习笔记（不在 backend 下）
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
  │                                │  Pydantic 校验 ─┐                │
  │                                │                │ 401/422 早退    │
  │                                │  1、检索内容：retrieve            │
  │                                │  2、过滤低分：filter_by_threshold │
  │                                │  3、拼接消息：build_messages      │
  │                                │  4、发送引用帧：                  │
  │  渲染引用：renderSources() ◀─────│     yield to_sources_frame()    │
  │                                │  5、调用模型：                    │
  │                                │  client.chat.completions.create │
  │                                │      │── messages=message       │
  │                                │      └── stream=True ──────────▶│
  │                                │                                 │
  │                                │  for chunk in response:         │
  │                                │      delta.content ◀────────────│ 一块一块
  │                                │  yield to_sse_frame(content)    │
  │  ◀── StreamingResponse flush ──┤            │                    │
  │  response.body.getReader()     │            │                    │
  │  new TextDecoder() 解码         │            │                    │
  │  reader.read() 一块一块收        │            │  流结束之后          │
  │  decoder.decode()              │            │                    │
  │  切行 → 存储 → 处理              │            │                    │
  │  processEvent()                │            │                    │
  │    │── app_error: addMessage   │            │                    │
  │    │── [DONE]: 对话结束         │            │                    │
  │    │── sources: renderSources  │            │                    │
  │    └── 正文: renderMarkdown     │            │                    │
  │                                │  yield "data: [DONE]" ← 循环外   │
  │  try/finally 解锁 ──────────────┘                                 │
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
| RAG 增强 | —— | 11.4.7 / 11.4.16 / 11.4.20 | ✅ 已验收 |

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
**RAG 相关（面试更爱问这几条）：**

- **向量库在内存里，重启就没了**：每次启动都要重新加载文档 + 重新调 embedding API 建索引，白花钱也白等。生产做法是向量持久化（FAISS index 文件 / pgvector），启动时先读，并**用文件 hash 判断内容有没有变**，只重建变了的文档。
- **只有单路向量检索，没有 rerank**：现在是"向量召回 top-k → 阈值过滤"一条路。改进方向是加 rerank（先召回 top-20，再精排取 top-3——**召回负责"别漏"，精排负责"别错"**），以及混合检索（向量 + BM25，补上专有名词/报错码这类词的短板）。
- **没有评测集，阈值 0.5 是"常见起点"不是"我的数据的答案"**：生产做法是建正例/负例评测集，用 `recall@k`、`MRR` 量化，或上 RAGAS 做端到端忠实度评估。**没有评测，所有调参都是拍脑袋。**
