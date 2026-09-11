"""
整合练习二 · 里程碑 1：FastAPI 后端骨架 + 打通 DeepSeek

================================================================
任务说明（读完再动手）
================================================================

目标：写一个能跑起来的后端服务，提供两个接口。

接口 1：健康检查
    GET /health
    返回：{"status": "ok"}
    作用：确认服务活着（后面联调时先打这个，能通再查业务）

接口 2：AI 问答（先做非流式的）
    POST /chat
    请求体：{"message": "你的问题", "temperature": 0.7}
    返回：{"reply": "AI 的回答"}
    作用：接收前端问题 → 转发给 DeepSeek → 把回答返回

================================================================
验收标准（满分 10 分）
================================================================

1. 服务能启动（2 分）
   uvicorn 能跑起来，终端打印出监听地址

2. GET /health 返回正确（1 分）
   {"status": "ok"}

3. POST /chat 能真实调用 DeepSeek 并返回回答（3 分）
   用 curl 能拿到真实 AI 回复，不是 mock 数据

4. 请求体校验生效（2 分）
   用 Pydantic 模型定义请求体；传空 message 或错误类型时
   返回 422 错误（FastAPI 自动处理，你要做的是把模型定义对）

5. 代码注释用自己的话解释（2 分）
   不要复述代码，要说清楚"为什么这么写"

================================================================
提示（卡住了再看，别提前看）
================================================================

- FastAPI 的路由用装饰器注册，类比 Express 的 app.get / app.post
- 请求体校验用 Pydantic 的 BaseModel，类比 TS 的 interface（但运行时真的校验）
- 启动命令：./venv/bin/uvicorn main:app --reload
- DeepSeek 调用逻辑直接复用你 11.1.10 写的 stream_chat，去掉 stream 部分
- API Key 从环境变量读，不要硬编码在代码里（.env 文件我已经建好了模板）

================================================================
你的代码从这里开始写
================================================================

"""

# 1. 导入依赖
from fastapi import FastAPI
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

   return {'reply': ""}

# 6. 启动入口（可选，用 uvicorn 命令行启动就不需要）
