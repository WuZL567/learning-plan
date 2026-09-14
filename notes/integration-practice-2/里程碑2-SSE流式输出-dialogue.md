# 对话记录：整合练习二 · 里程碑 2（10.20 FastAPI SSE 流式输出）

日期：2026-09-14
对应技术点：10.20 FastAPI SSE 流式输出（P1，能写代码）
产出文件：`src/integration-practice-2/backend/main.py`（新增 `/chat/stream` 接口）
验收轮次：5 轮迭代（4 次打回 + 1 次通过）

---

## 一、教学过程

### 为什么需要它

里程碑 1 的 `/chat` 是非流式的：用户敲完问题，前端干等 3 秒白屏，然后一整段答案砸出来。

同样是 3 秒生成完，"一次性返回"像页面卡死，"逐字返回"像它在思考、在打字——**同样的耗时，体感差一个数量级**。面试官问"你的 AI demo 有什么亮点"时，"我做了 SSE 流式输出，首 Token 延迟从 3 秒降到 400 毫秒"就是标准答案。

### 一句话说清楚

后端不再等 AI 全部说完再打包返回，而是边从 DeepSeek 接字、边往前端送，每收到一小块就立刻推给浏览器。

### 核心原理

**水龙头类比（接上一里程碑）**：

- `stream=False`：DeepSeek 给你一整桶水，你端着这桶水回前端（用户干等）
- `stream=True`：DeepSeek 打开水龙头，水一滴滴来——但里程碑 1 里是把水滴攒在桶里，攒满才端回去
- 里程碑 2：**把桶扔掉，接到一滴就往后送一滴**

**谁来负责"送一滴"**：

```python
@app.post("/chat")
def chatRequest(data: ChatRequest):
    return {"reply": "..."}     # 函数跑完 → 打包成 JSON → 一次性发出
```

流式接口换成 `StreamingResponse`，逻辑完全变了：

```
你的生成器函数 ──yield 一块──▶ StreamingResponse ──立刻 flush──▶ 浏览器
                ──yield 一块──▶                  ──立刻 flush──▶ 浏览器
                ──生成器结束──▶                   ──关闭连接──▶  浏览器
```

关键差异：**普通接口返回的是 dict，FastAPI 帮你序列化；流式接口返回的是一段一段的字符串，拼格式的活儿归你自己干。**

**yield 是什么（学生的唯一语法障碍）**：

Python 里函数体里有 `yield`，它就是生成器函数，和 JS 生成器是同一个东西：

```python
def generate():          # 类比 JS: function* generate()
    yield "第一块"        # 类比 JS: yield "第一块"
    yield "第二块"
```

调用 `generate()` 不执行函数体，只是返回一个"可以反复问它'下一块是什么'"的对象。`StreamingResponse` 在那儿反复问，问一块发一块，问到没了就关连接。

**拼格式的规矩（4.20 学过，现在自己动手拼）**：

```
data: 你好

data: 世界

```

每条消息以 `data: ` 开头，以**两个换行**结束（一个换行只是行内分隔，两个才是一条完整消息）。最后推一条 `data: [DONE]`——OpenAI 定的业界约定，让前端明确知道"说完了，别等了"。

### 练习任务

在 `src/integration-practice-2/backend/main.py` 末尾新增 `POST /chat/stream` 接口。脚手架已给出文件头的要求、验收标准和提示，代码全部由学生手写。

自测命令：

```bash
curl -N -X POST http://127.0.0.1:8001/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "用一句话解释什么是token"}'
```

---

## 二、验收过程

### 第 1 轮提交：完全没有流式

**学生代码（核心部分）**：

```python
@app.post("/chat/stream")
def chatRequest(data: ChatRequest):
   full_response = []
   try:
      response = client.chat.completions.create(..., stream=True)
      for chunk in response:
         delta = chunk.choices[0].delta
         token = delta.content
         if token is not None:
            print(token, end="", flush=True)
            full_response.append(token)
      return "".join(full_response)
   except Exception as e:
      print(f"[错误] {type(e).__name__}: {e}")
      return {"reply": "服务暂时不可用，请稍后重试"}
```

**导师实测**：

```
content-type: application/jsonl          ← 不是 text/event-stream
总耗时 = 3.19s                            ← 全部攒完才发
响应体: "data: '三个字'\n\n"  ← 外面套了 JSON 引号
```

**导师诊断（三条）**：

1. **根本没流式**：循环里 `print` 打的是**服务器终端**，和 HTTP 响应是两条输出通道。类比：在后厨炒菜时自己尝一口说"嗯不错"，客人听不见。循环和 print 都发生在响应返回之前，浏览器一个字节都收不到。
2. **IndexError 真身**：实测该网关的流，**最后一块 `choices` 是空列表**（只携带元信息，没有正文）。`chunk.choices[0]` 走到这块就炸，异常被自己的 except 兜住，返回了假的"服务暂时不可用"。
3. **缺少 StreamingResponse**：`return "".join(...)` 还是里程碑 1 的形状。

**导师做的实验（证明 FastAPI 如何对待生成器）**：

```python
from fastapi.encoders import jsonable_encoder
def g():
    yield 'data: A\n\n'
    yield 'data: B\n\n'
jsonable_encoder(g())    # → ['data: A\n\n', 'data: B\n\n']  生成器被吃成了 list
```

FastAPI 把生成器整个遍历完变成 list，发现是 list 就用 `application/jsonl` 返回，一行一个 JSON 字符串——所以既没有流式，每条外面还被套了 JSON 引号。

### 第 2 轮提交：生成器写对了，但没人负责发送

**学生改动**：`yield` 用上了、函数改名 `chatStreamRequest`、用 `finish_reason == 'stop'` 判结束、加了 `[DONE]`、单引号还在。

```python
for chunk in response:
   content = chunk.choices[0].delta.content
   isFinish = chunk.choices[0].finish_reason == 'stop'
   if isFinish is False:
      if content is not None:
         yield f"data: '{content}'\n\n"
   else:
      yield "data: [DONE]\n\n"
return ""
```

**导师实测**：仍然 `content-type: application/jsonl`，仍然一次性返回。

**导师诊断**：

1. 生成器只负责**产生**，`StreamingResponse` 才负责**发送**——这两件事学生只做了前一件
2. `data: '{content}'` 里那对单引号会原样发给前端，用户会看到 `'你好'`
3. **生成器里的 `return 值`，那个"值"是被丢弃的**——`return` 在生成器里唯一的作用是结束生成。所以 except 里的 `return {"reply": ...}` 前端永远收不到，流会无声无息地断掉，`EventSource` 会当成网络抖动自动重连，用户看到 AI 重复回答
4. 实测确认：第 54 块 `content=''` 且 `finish_reason='stop'`（学生的 `isFinish` 判断歪打正着挡住了空串），第 55 块 `choices` 长度 0

### 第 3 轮提交：真流式了，但判断条件写错

**学生改动**：加了 `StreamingResponse`、去掉引号、错误路径改成 `yield`。

```python
for chunk in response:
   if chunk.choices is None:
      yield "data: [DONE]\n\n"
   else:
      content = chunk.choices[0].delta.content
      ...

@app.post("/chat/stream")
def stream(data: ChatRequest):
    return StreamingResponse(chatStreamRequest(data), media_type="text/plain")
```

**导师实测**：

```
首字节 = 0.002s   总耗时 = 6.63s     ← 真流式 ✅
content-type: text/plain              ← ❌
结尾: data: [服务暂时不可用，请稍后重试]  ← ❌ 正确答案后面跟了一句假错误
```

**导师诊断**：

1. **`is None` 判断错了对象**——空的是「列表里没东西」不是「列表是 None」，`[] is None` 是 `False`。类比 JS：`[] === null` 是 `false`，判空得用 `arr.length`
2. **`media_type="text/plain"` 不对**——`EventSource` 会检查 `Content-Type`，不是 `text/event-stream` 就判连接失败。curl 不看类型所以测不出来，但里程碑 3 前端一接就死
3. **这个 bug 最坑的地方**：AI 已完整正确回答完，用户却在末尾看到"服务暂时不可用"，看起来像回答的一部分。而服务器终端只打印 `[错误] IndexError`——**终端报错和用户现象对不上号**，这是排查线上问题最典型的困境

### 第 4 轮提交：格式全对了

**学生改动**：`if not chunk.choices: return`（正确的判空）、`media_type="text/event-stream"`。

**导师实测**：

```
首字节 = 0.0019s  总耗时 = 6.63s
content-type: text/event-stream; charset=utf-8   ← ✅
IndexError 消失                                    ← ✅
结尾: event: error / data: 空                      ← ❌ 每次成功请求都挂一条假错误
```

### 三层追问（第 4 轮后）

**第一层 · 白话复述**

> 导师：从 DeepSeek 吐出来的第一块数据，到你 curl 终端里看到的第一行 `data:`，中间经过了哪些环节？每一环各自负责什么？

> 学生：用户调用接口 POST /chat/stream，传入对应参数，后端通过 OpenAI + FastAPI 请求 AI 输出，获取到内容块之后，通过 yield 逐步返回。

**评判**：答对一半。头尾对，但**链路里没有"发送者"**——学生把 `yield` 直接等同于"返回给前端"，而 `yield` 只是产生，浏览器根本看不见。

**正确答案（五环，学生少了一环）**：

```
① Pydantic 校验请求体
② stream=True 让 DeepSeek 用 SSE 返回，OpenAI SDK 把 SSE 解析成 chunk 对象
③ 你的生成器：取 delta.content → 拼成 "data: xxx\n\n" → yield   ← 产生，不发送
④ StreamingResponse：从生成器一块块取 → 一块块 flush 给浏览器   ← 这才是发送
⑤ 浏览器 EventSource 解析 data 行
```

**第 ④ 环是这个技术点的题眼。** 第一版代码就是漏了它——生成器写得好好的，但没有任何东西负责"送出去"。

---

**第二层 · 对比理解**

> 导师：你 `/chat` 里的 `return {"reply": ...}` 和 `/chat/stream` 里的 `StreamingResponse`，FastAPI 在背后做的事有什么本质区别？为什么非流式的接口不能用 `StreamingResponse`？

> 学生：本质区别是 chat 一次性返回内容，而 chat/stream 是持续输出，非流式的接口不用 StreamingResponse 是因为不需要用到，直接返回就好。

**评判**：基本没答上。学生答的是"现象"（一次性 vs 持续），不是"机制"。

**正确答案**：

| | `/chat`（普通返回） | `/chat/stream`（StreamingResponse） |
|---|---|---|
| 函数什么时候返回 | 等活儿干完才返回 | **立刻返回**（返回的是响应对象，不是数据） |
| FastAPI 拿到什么 | 一个 dict | 一个能持续产出的数据源 |
| FastAPI 做什么 | 序列化成 JSON，一次性发完 | 循环取一块发一块，取到没了关连接 |
| 数据传输 | `Content-Length` 定长 | `Transfer-Encoding: chunked` 分块 |

关键认知：**StreamingResponse 的本质是"函数提前交差"**——它不交出数据，交出的是"一个还能继续出数据的东西"。非流式接口的数据在返回那一刻就已经齐了，没有"持续产出"这回事，StreamingResponse 要的输入它根本给不出来。

---

**第三层 · 场景应用**

> 导师：AI 说到一半，DeepSeek 那边的连接断了。你的代码会发生什么？前端会看到什么？

> 学生：代码走到 except 中，前端显示服务暂时不可用，请稍后重试。

**评判**：答错了。前端实际**什么都看不到**，三个原因叠加：

1. **消息写在 `event:` 字段里了**——那个字段装的是「事件名」，不是给人看的消息。前端用 `onmessage` 只能收没有 `event:` 字段的默认消息，这条被路由到一个叫"服务暂时不可用"的自定义事件上，没人监听 → 消息被丢弃
2. 就算监听了，`data: 空` 的字面内容是"空"这个字
3. **没有 `[DONE]`** → `EventSource` 自动重连 → 把同一个问题再问一遍 → 用户看到 AI 重复回答

**附带知识点**：`error` 是 `EventSource` 的**内置事件名**（连接失败时触发）。业务消息也叫 `error`，前端就无法区分"AI 报错了"还是"网络断了"。

---

**加试 · 关于末尾的 `event: error`**

> 导师：你本来想让它表达什么？它实际表达的是什么？

> 学生：event: error 是为了让前端能支持处理这些报错的东西，但是这里好像没有区分是结束了还是报错了。

**评判**：**这一问答得最好** ✅ 学生自己发现了问题。

**正确答案**：最后那个空 `choices` 的块**不是错误，是「流到头了」**——就像读文件读到 EOF，这是正常收尾。贴 `event: error` 标签，导致每个成功回答末尾都挂一条假错误。

### 第 5 轮提交：通过

**学生改动**：空 `choices` 分支改成裸 `return`；错误路径改为 `yield "event: app_error: 服务暂时不可用，请稍后重试\ndata: [DONE]\n\n"`；加了一句"为什么"注释。

**导师实测**：

```
=== 正常路径 ===
data: 你好
data: 呀
data: [DONE]
[首字节 = 0.0128s  总耗时 = 3.52s]        ← 完美 ✅

=== 错误路径（temperature=99.9 触发）===
event: app_error: 服务暂时不可用，请稍后重试
data: [DONE]                              ← 终止信号有了 ✅
```

**遗留小问题**：`event: app_error: 服务暂时不可用，请稍后重试` 里出现了**两个冒号**。SSE 规范中**一行只有第一个冒号是分隔符**，所以浏览器解析出的事件名是整串 `'app_error: 服务暂时不可用，请稍后重试'`，前端得写 `addEventListener('app_error: 服务暂时不可用，请稍后重试')` 才收得到——等于收不到。

```
字段名 = 'event'
浏览器解析出的事件名 = 'app_error: 服务暂时不可用，请稍后重试'
```

**正确结构**：字段名永远是 `event`，事件名放第一个冒号后面，消息内容永远放 `data:`。

```
event: app_error
data: 服务暂时不可用，请稍后重试

data: [DONE]
```

---

## 三、验收结论

**评分：8.0 分 ｜ 判定：通过 ✅**

| 维度 | 得分 | 说明 |
|------|:----:|------|
| 概念理解 | 3 / 4 | 加试那问自行发现问题；三层追问中两层停在"描述现象"层 |
| 代码正确性 | 3 / 3 | 核心链路完全正确，实测首字节 0.0128s / 总耗时 3.52s |
| 边界处理 | 1.5 / 2 | 空 chunk 处理满分；错误路径终止信号已补，但错误文案前端读不到 |
| 表达清晰度 | 0.5 / 1 | 新增了一句"为什么"注释，其余仍是复述代码 |

### 扣分项

1. **-1 分**：错误路径的 `event:` 行多了一个冒号，事件名变成了整句话，前端读不到错误文案
2. **-0.5 分**：三层追问的第一、二层停在"描述现象"，没到"讲清机制"
3. **-0.5 分**：注释只有一句解释了"为什么"，其余仍是复述代码

### 5 轮迭代路线图（本次的核心收获）

| 轮次 | 状态 | 关键认知 |
|:---:|------|---------|
| 1 | 完全没有流式 | `print` 到终端 ≠ 发给浏览器；生成器直接 return 会被 jsonable_encoder 吃成 list |
| 2 | 生成器写对，无发送者 | 生成器负责「产生」，StreamingResponse 负责「发送」；生成器里的 `return 值` 会被丢弃 |
| 3 | 真流式，判空写错 | 空的是「列表没元素」不是「None」；Content-Type 必须是 `text/event-stream` |
| 4 | 格式全对，语义搞反 | 空 `choices` 是正常收尾，不是错误；`event:` 装的是事件名 |
| 5 | 通过 | SSE 一行只有第一个冒号是分隔符 |

### 需要修改的地方（改完直接进里程碑 3，不用重新验收）

把错误路径那一行拆成三行：字段名 `event`、事件名 `app_error`、消息放 `data:`。

---

## 四、面试话术沉淀

**问：你的 AI 应用为什么用 SSE？怎么实现的？**

> 因为 AI 生成是"流式产出"的，用 SSE 能让用户边生成边看到字，首 Token 延迟从 3 秒降到几百毫秒，体感差一个数量级。实现上是三段分工：OpenAI SDK 用 `stream=True` 拿到 chunk 流，我在生成器里把每个 `delta.content` 拼成 `data: xxx\n\n` 的 SSE 格式，再交给 FastAPI 的 `StreamingResponse`，它从生成器里取一块 flush 一块。关键是理解生成器和 StreamingResponse 的分工——生成器只负责「产生」，StreamingResponse 才负责「发送」。

**问：为什么不用 WebSocket？**

> AI 输出是单向的，服务器推给前端就够了，不需要前端频繁发消息。SSE 基于 HTTP，浏览器原生 `EventSource` 支持，自动重连，实现比 WebSocket 轻量得多。WebSocket 适合双向实时通信，比如聊天室。

**问：流式输出怎么处理异常？**

> 流式接口的难点是响应头已经以 200 发出去了，出错改不了状态码，只能靠流里的内容告诉前端。所以我在生成器的 except 里发一条自定义事件（`event: app_error`）带上错误文案，再补一条 `data: [DONE]` 作为终止信号——这个终止信号很重要，不然前端 `EventSource` 会以为网络抖动自动重连，把同一个问题重问一遍。

**问：流式接口的边界情况你踩过哪些坑？**

> 两个。第一，流的最后一块 `choices` 是空列表（只带元信息），直接 `chunk.choices[0]` 会 IndexError。第二，`Content-Type` 必须是 `text/event-stream`，写成 `text/plain` 时 curl 测着正常，但浏览器 `EventSource` 会直接判连接失败——这种 bug 后端日志干干净净，最费时间。
