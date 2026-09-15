"""
整合练习二 · 最小 AI 问答 Demo —— 后端（FastAPI）

================================================================================
这个文件干什么
================================================================================

浏览器不能直接调 DeepSeek：API Key 会暴露在 Network 面板里，任何人 F12 就能抄走
刷爆你的额度。所以后端是"中转站"：

    浏览器 ──POST /chat/stream──▶ 本文件 ──HTTP+Key──▶ DeepSeek
       ▲                             │
       └────── SSE 流式吐字 ─────────┘

================================================================================
怎么读这个文件
================================================================================

    【1】配置区        —— 环境变量、模型参数。所有"魔法值"都提上来，改一处生效
    【2】应用与中间件   —— FastAPI 实例、CORS（不配浏览器一个请求都发不出去）
    【3】请求体模型     —— Pydantic 校验。脏数据在进业务代码之前就被拦掉
    【4】工具函数       —— 拼 messages、拼 SSE 帧。两个接口共用
    【5】三个接口       —— /health、/chat（非流式）、/chat/stream（流式）

================================================================================
几个"为什么"（面试常问，也最容易踩坑）
================================================================================

为什么用 SSE 而不是 WebSocket？
    AI 输出是单向的（服务器 → 浏览器），不需要双向通信。SSE 基于普通 HTTP，
    浏览器原生支持、自动重连、实现比 WebSocket 轻得多。WebSocket 适合聊天室这类
    双方都要随时发消息的场景。

为什么流式响应的错误只能在"流里面"告诉前端？
    HTTP 的状态码写在响应头里，而响应头在第一块数据之前就发出去了——发出去就收不回来。
    所以流到一半出错时，没法改成 500，只能在流里推一条自定义事件（event: app_error）。

为什么 SSE 的正文里不能直接出现换行符？
    SSE 用 "\n" 当行分隔符、"两个 \n"（空行）当消息分隔符——换行被"征用"成结构符号了。
    所以正文里的换行必须换一种表达方式：拆成多条 data: 行，接收端再用 "\n" 拼回去。
    类比 CSV：字段里本来就有逗号时，得用引号包起来，不能让逗号和分隔符混在一起。

为什么 [DONE] 这个哨兵不能省？
    流正常读完、后端进程被 kill、网线被拔——这三种情况在前端看来都是
    reader.read() 返回 { done: true }，一模一样。HTTP 层分不出来，
    只能在应用层加一个"我说完了"的信号。

为什么对话历史由前端传，后端不存？
    后端保持无状态，加机器就能水平扩展，不用考虑"这个用户的会话在哪台机器上"。
    演示项目够用；真要做多用户，历史该放 Redis / 数据库，用 session_id 关联。
"""

# ================================================================================
# 【1】配置区
# ================================================================================

import os
import logging
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel, Field

# 日志配置：用 logging 而不是 print
#   print    → 没有级别、没有时间戳、出异常时丢掉 traceback（只有一行 "IndexError: xxx"，
#              排查线上问题时"终端报错和用户现象对不上号"就是这么来的）
#   logging  → 有时间戳、有级别、logger.exception() 会自动带上完整调用栈
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("ai-demo")

# 用绝对路径定位 .env
#   写成 load_dotenv("./.env") 是相对"当前工作目录"的：在 backend/ 下启动没事，
#   从别的目录启动（比如 uvicorn backend.main:app）就读不到，然后在取 API Key 时
#   报一个很难懂的 KeyError。用 __file__ 定位，跟你在哪启动无关。
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH)

API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not API_KEY:
    # 启动时就报清楚，别拖到第一次请求才炸
    raise RuntimeError(
        f"没有读到 DEEPSEEK_API_KEY。\n"
        f"请确认文件存在：{ENV_PATH}\n"
        f"内容形如：DEEPSEEK_API_KEY=sk-xxxxxxxx"
    )

# 模型参数集中放这里：想换模型 / 调长度只改这一处
MODEL = "deepseek-v4.1-flash"
BASE_URL = "https://api-cn.hi-code.cc/v1"
MAX_TOKENS = 1024
SYSTEM_PROMPT = "你是一个AI助手。请用简洁清晰的中文回答。"

# 前端一次最多带多少条历史消息（user + assistant 合计）
# 为什么要限制：messages 是全部塞进上下文窗口的，越堆越长 → 越贵、越慢，
# 而且超过窗口长度会直接报错。真实产品里还会做"摘要压缩"（把早期对话压成一段摘要）。
MAX_HISTORY_MESSAGES = 20

client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL,
    timeout=30,        # 单次请求超时（秒）
    max_retries=2,     # 网络抖动 / 5xx 时自动重试次数
)

# ================================================================================
# 【2】应用与中间件
# ================================================================================

app = FastAPI(title="AI 问答 Demo")

# CORS（跨域资源共享）
#   前端跑在 :5500、后端跑在 :8001 —— 端口不同就是跨域。浏览器会先发一个 OPTIONS
#   预检请求问"你允许这个来源吗"，后端不放行就直接拦掉：现象是 fetch 直接 reject，
#   而后端日志里干干净净什么都看不到（因为请求根本没到业务代码）。
#
#   allow_origins=["*"] 只适用于开发！上线要写死具体域名，
#   否则任何网站都能拿你的后端当免费代理刷 API 额度。
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================================================================
# 【3】请求体模型（Pydantic）
# ================================================================================

# Pydantic 的价值：请求体在进业务代码之前就被校验。脏数据（空消息、超长文本、
# 温度 99.9）在这里就被拦成 422，业务代码里不用再写一堆 if 判断。
#
# Field 的三个常用参数：
#   ...           表示必填（没有默认值）
#   min_length    字符串最小长度 / 列表最少元素个数
#   max_length    字符串最大长度 / 列表最多元素个数
#   ge / le       greater/less than or equal，数值上下界


class ChatMessage(BaseModel):
    """一条历史消息。role 只允许 user / assistant——Literal 会把别的值直接判 422。"""

    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)   # 本轮问题
    history: list[ChatMessage] = Field(default_factory=list, max_length=MAX_HISTORY_MESSAGES)
    temperature: float = Field(0.7, ge=0, le=2)               # 0=最稳定，2=最发散


# ================================================================================
# 【4】工具函数（两个接口共用）
# ================================================================================


def build_messages(data: ChatRequest) -> list[dict]:
    """
    把「系统提示 + 历史对话 + 本轮问题」拼成 OpenAI 要求的 messages 数组。

    这就是"多轮对话"的全部秘密：模型本身没有记忆，它每次都是无状态的。
    所谓"记得上文"，不过是把之前的对话原样再发一遍给它。
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [m.model_dump() for m in data.history]
    messages.append({"role": "user", "content": data.message})
    return messages


def to_sse_frame(content: str) -> str:
    """
    把一段正文编码成一条合法的 SSE 消息。

    规则：正文里的每一行发一条 `data:` 行，最后补一个空行表示"这条消息结束了"。

        data: 第一行
        data: 第二行
        ⏎                    ← 空行 = 这条消息结束

    为什么不能直接写 f"data: {content}\\n\\n"：
        正文里若含换行符，那个换行会被接收端当成"一条 data 行的结束"，
        紧跟在换行后面的文字既不以 data: 开头、也不是空行，接收端按规范会
        当成未知字段直接忽略 —— 现象就是"AI 回答里某几个字凭空消失"。
    """
    return "".join(f"data: {line}\n" for line in content.split("\n")) + "\n"


# ================================================================================
# 【5】接口
# ================================================================================


@app.get("/health")
def getHealth():
    """健康检查：部署时用来看服务活没活（K8s / Docker healthcheck 就靠它）。"""
    return {"status": "ok"}


@app.post("/chat")
def chatRequest(data: ChatRequest):
    """
    非流式接口：等 AI 全部说完，一次性返回。

    现在还留着它，是为了和 /chat/stream 做对比——面试时可以说
    "我先写了同步版，再加的流式版，能讲清两者在 FastAPI 里有什么本质区别"。

    注意错误是怎么返回的：
        之前这里是 `return {"reply": "服务暂时不可用"}` —— 这等于把错误伪装成
        一条正常的 AI 回答（HTTP 200 + 200 里写着"服务不可用"）。调用方根本分不清
        "AI 真的这么答" 和 "服务挂了"。正确的做法是抛 HTTPException，
        HTTP 状态码本身就把错误说清楚了。
    """
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=build_messages(data),
            stream=False,
            temperature=data.temperature,
            max_tokens=MAX_TOKENS,
        )
        return {"reply": response.choices[0].message.content}

    except Exception as e:
        # logger.exception 会自动带上完整 traceback —— 排查问题全靠它
        logger.exception("调用 /chat 失败: %s", e)
        raise HTTPException(status_code=502, detail="上游模型服务暂时不可用，请稍后重试")


def chatStreamRequest(data: ChatRequest):
    """
    流式接口的核心：一个生成器函数。

    Python 里函数体带 yield 就是生成器，和 JS 的 function* / yield 是同一个东西。
    调用它不会执行函数体，只返回一个"可以反复问它'下一块是什么'"的对象；
    StreamingResponse 在那边反复问，问一块发一块（flush），问到没了就关连接。

    ★ 最容易搞混的一点：生成器负责「产生」，StreamingResponse 负责「发送」。
      只写生成器、不交给 StreamingResponse，浏览器一个字节都收不到。
    """
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=build_messages(data),
            stream=True,                 # 让 DeepSeek 也用 SSE 返回，SDK 会把流解析成 chunk 对象
            temperature=data.temperature,
            max_tokens=MAX_TOKENS,
        )

        for chunk in response:
            # 流的最后一块只带元信息，choices 是空列表（不是 None！）。
            # 直接取 chunk.choices[0] 会 IndexError —— 里程碑 2 就栽在这。
            if not chunk.choices:
                continue

            content = chunk.choices[0].delta.content

            # content 可能是 None（元信息块）或 ""（空内容），都跳过，免得推出空包
            if content:
                yield to_sse_frame(content)

        # ★ 终止信号放在循环外面，而不是靠判断 finish_reason == 'stop'
        #
        #   之前写成"最后一块的 finish_reason 是 stop 才发 [DONE]"，有个隐蔽的坑：
        #   finish_reason 除了 'stop'（正常说完），还可能是 'length'（撞到 max_tokens
        #   被截断）等其它值。一旦出现非 'stop' 的结束原因，就永远不发 [DONE]，
        #   前端会以为"回答中断了"，每次长回答都误报一次。
        #
        #   更稳的思路：不管中间发生什么，只要循环活着走完了，就说明后端说完了 ——
        #   这里才是"说完了"唯一正确的判定位置。
        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.exception("调用 /chat/stream 失败: %s", e)
        # 流式接口的错误只能在流里告诉前端：响应头早就以 200 发出去了，改不了状态码。
        # 约定：event: app_error 是业务错误事件，data: 里放给人看的文案，
        #       最后仍然补一条 [DONE] —— 否则前端的 EventSource 会当网络抖动自动重连。
        yield "event: app_error\ndata: 服务暂时不可用，请稍后重试\ndata: [DONE]\n\n"


@app.post("/chat/stream")
def stream(data: ChatRequest):
    """
    路由层：只做一件事——把生成器交给 StreamingResponse。

    第一参数要的是「生成器函数本身」，不是调用结果（写 chatStreamRequest(data) 就错了，
    那样会被当成一个普通返回值一次性发出去）。

    media_type 必须是 text/event-stream：浏览器 EventSource 会检查这个头，
    写成 text/plain 时 curl 测着一切正常，但一接前端就死 —— 里程碑 2 踩过这个坑。
    """
    return StreamingResponse(chatStreamRequest(data), media_type="text/event-stream")
