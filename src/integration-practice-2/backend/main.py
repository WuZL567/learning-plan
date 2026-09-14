"""
整合练习二 · 里程碑 2：SSE 流式输出

================================================================
里程碑 1 已完成（后端骨架 + 打通 DeepSeek，8.0 分）
下面是你自己写的 /health 和 /chat，不用动。
本里程碑只做一件事：再加一个流式接口。
================================================================

任务：新增接口 3
    POST /chat/stream
    请求体：{"message": "你的问题", "temperature": 0.7}   （和 /chat 一模一样）
    返回：SSE 流，一个字一个字往外吐

        data: Token
        data: 是
        data: 语言模型
        ...
        data: [DONE]

作用：把"等 AI 全部说完再一次性返回"改成"AI 说一个字前端显示一个字"

================================================================
验收标准（满分 10 分）
================================================================

1. 能真实流式返回（4 分）
   curl 加 -N 能看到内容一段一段往外冒，不是等 3 秒后一次性出现

2. SSE 格式正确（3 分）
   每条消息是 data: 内容 + 两个换行；最后有一条 data: [DONE] 作为结束信号

3. 边界处理（2 分）
   没有文字的空 chunk 不发出去；中途出错时也要给前端一个终止信号

4. 注释用自己的话解释（1 分）
   说清楚"为什么这么写"，不复述代码

================================================================
提示（卡住了再看，别提前看）
================================================================

- 流式响应用 FastAPI 的 StreamingResponse，它第一个参数要的是一个"生成器函数"
- Python 里函数体带 yield 就是生成器，类比 JS 的 function* / yield
- 流式 chunk 里取文字的路径和 /chat 不一样（不是 .message.content），自己打印一个 chunk 看看结构
- curl 测流式必须加 -N（关闭缓冲），不然看起来像"没有流式"

================================================================
你的代码从这里开始写
================================================================

"""

# 1. 导入依赖
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv("./.env")

# 2. 初始化 OpenAI 客户端（指向 DeepSeek）
client = OpenAI(
   # APIKEY
   api_key=os.environ["DEEPSEEK_API_KEY"],
   # 基本链接
   base_url="https://api-cn.hi-code.cc/v1",
   # 超时时间
   timeout=30,
   # 最大重试次数
   max_retries=2,
)

# 3. 定义请求体模型（Pydantic BaseModel）
app = FastAPI()

# 定义规则：请求必须长这样
class ChatRequest(BaseModel):
   message: str = Field(..., min_length=1, max_length=500) # ...表示必填，没有默认值；
   temperature: float = 0.7

# 4. 定义 GET /health 接口
@app.get("/health")
def getHealth():
   return {"status": "ok"}

# 5. 定义 POST /chat 接口
@app.post("/chat")
def chatRequest(data: ChatRequest):

   try:
      # 发起流式请求
      response = client.chat.completions.create(
         model="deepseek-v4.1-flash",
         messages=[
            {"role": "system", "content": "你是一个AI助手。"},
            {"role": "user", "content": data.message},
         ],
         stream=False, # False，非流式，等AI一次性说完再返回；
         temperature=data.temperature,
         max_tokens=1024,
      )

      return {"reply": response.choices[0].message.content}

   except Exception as e:
      print(f"[错误] {type(e).__name__}: {e}")
      return {"reply": "服务暂时不可用，请稍后重试"}

# 6. 启动入口（可选，用 uvicorn 命令行启动就不需要）

# 7. 定义 POST /chat/stream 接口 —— 里程碑 2，从下面开始写
#
#    要求：
#    - 路由用 @app.post("/chat/stream")，请求体直接复用 ChatRequest
#    - 返回的是流式响应，不是普通 dict
#    - 内部调 DeepSeek 时 stream=True，收到一块就往外推一块
#    - 每块拼成 SSE 格式：data: 内容  + 两个换行
#    - 全部说完后推一条 data: [DONE]  + 两个换行，作为结束信号
#
#    三个关键点：
#    ① 流式响应第一个参数要的是"生成器函数"本身，不是调用结果
#    ② 流式 chunk 取文字的路径和上面 /chat 不一样，先 print 一个看看
#    ③ 有些 chunk 是空的（没有文字），要先判断再发，否则会推出空包

def chatStreamRequest(data: ChatRequest):

   try:
      # 发起流式请求
      response = client.chat.completions.create(
         model="deepseek-v4.1-flash",
         messages=[
            {"role": "system", "content": "你是一个AI助手。"},
            {"role": "user", "content": data.message},
         ],
         stream=True, # 流式；
         temperature=data.temperature,
         max_tokens=1024,
      )

      for chunk in response:
         if not chunk.choices:
            return

         else:
            # content就是AI需要回答的部分；
            content = chunk.choices[0].delta.content
            # 通过判断finish_reason是否为'stop'来判断是否已结束
            isFinish = chunk.choices[0].finish_reason == 'stop'

            # 没有结束，则继续判断是否有内容；
            if isFinish is False:
               if content is not None:
                  yield f"data: {content}\n\n"
            else:
               # 已结束，直接返回data: [DONE]，无需处理content为''；
               yield "data: [DONE]\n\n"

   except Exception as e:
      print(f"[服务端错误] {type(e).__name__}: {e}")
      # API错误时，通过data: [DONE]\n\n告知前端已经结束；
      yield "event: app_error\ndata: 服务暂时不可用，请稍后重试\ndata: [DONE]\n\n"
      return

@app.post("/chat/stream")
def stream(data: ChatRequest):
    return StreamingResponse(chatStreamRequest(data), media_type="text/event-stream")
