/**
 * 4.20 SSE 流式通信 - 前后端示例代码
 *
 * 验收标准：
 * 1. 能写出前端 EventSource 完整用法（监听 message、error、自定义事件）
 * 2. 能写出后端 SSE 响应的标准格式（Content-Type、消息格式）
 * 3. 能解释 SSE 的自动重连机制
 * 4. 能对比 SSE 和 WebSocket 的使用场景
 *
 * 要求：
 * - 实现一个模拟 AI 流式输出的场景
 * - 前端用 EventSource 接收服务器推送的消息
 * - 后端用标准的 SSE 格式推送消息（data: 开头）
 */

// ========== 前端代码（浏览器）==========
// 使用 EventSource API 连接 SSE 端点并接收消息

// 1. 创建 SSE 连接
const eventSource = new EventSource('http://localhost:3000/sse');

// 2. 监听服务器推送的消息（默认事件类型 message）
eventSource.onmessage = (event) => {
  console.log('收到消息:', event.data);
  // 场景：AI 流式输出，每次收到一个 token 就追加到页面
  document.getElementById('output').textContent += event.data;
};

// 3. 监听自定义事件类型（如果后端发送了 event: customEvent）
eventSource.addEventListener('customEvent', (event) => {
  console.log('收到自定义事件:', event.data);
});

// 4. 监听连接打开事件
eventSource.onopen = () => {
  console.log('SSE 连接已建立');
};

// 5. 监听错误事件（连接断开、网络错误等）
eventSource.onerror = (error) => {
  console.error('SSE 连接错误:', error);
  // 浏览器会自动重连，默认重连间隔 3 秒
  // 如果不想重连，可以手动关闭
  // eventSource.close();
};

// 6. 手动关闭连接（比如用户点击停止按钮）
document.getElementById('stopBtn').onclick = () => {
  eventSource.close();
  console.log('SSE 连接已关闭');
};

/**
 * EventSource 特性：
 * 1. 自动重连：断线后浏览器会自动发起新请求，默认 3 秒间隔
 * 2. Last-Event-ID：重连时浏览器会发送 Last-Event-ID 请求头，告诉服务器上次收到的消息 ID
 * 3. 只能 GET 请求：EventSource 只支持 GET，如果需要发送数据要用其他方式（如先 POST 创建会话）
 * 4. 跨域支持：需要后端配置 CORS 头
 */


// ========== 后端代码（Node.js Express）==========
// 后端推送 SSE 消息的实现

const express = require('express');
const app = express();

// CORS 配置（允许跨域）
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  next();
});

app.get('/sse', (req, res) => {
  // 1. 设置 SSE 必需的响应头
  res.setHeader('Content-Type', 'text/event-stream');  // 告诉浏览器这是 SSE 流
  res.setHeader('Cache-Control', 'no-cache');          // 禁用缓存
  res.setHeader('Connection', 'keep-alive');           // 保持长连接

  // 2. 模拟 AI 流式输出：每隔 500ms 推送一个字
  const message = '你好，我是 AI 助手，这是流式输出的演示。';
  let index = 0;

  const timer = setInterval(() => {
    if (index < message.length) {
      // SSE 消息格式：data: 内容\n\n（两个换行符表示消息结束）
      res.write(`data: ${message[index]}\n\n`);
      index++;
    } else {
      // 推送完毕，发送结束标记（可选）
      res.write('data: [DONE]\n\n');
      clearInterval(timer);
      res.end();  // 关闭连接
    }
  }, 500);

  // 3. 客户端断开连接时清理定时器
  req.on('close', () => {
    clearInterval(timer);
    console.log('客户端断开连接');
  });
});

app.listen(3000, () => {
  console.log('SSE 服务运行在 http://localhost:3000');
});

/**
 * SSE 消息格式：
 *
 * 1. 基本格式（默认事件类型 message）：
 *    data: 这是消息内容\n\n
 *
 * 2. 多行消息：
 *    data: 第一行\n
 *    data: 第二行\n\n
 *
 * 3. 自定义事件类型：
 *    event: customEvent\n
 *    data: 消息内容\n\n
 *
 * 4. 消息 ID（用于断线重连）：
 *    id: 123\n
 *    data: 消息内容\n\n
 *
 * 5. 重连间隔（单位毫秒）：
 *    retry: 5000\n\n
 */


// ========== 后端代码（Python FastAPI）==========
/**
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def event_generator():
    """模拟 AI 流式输出"""
    message = "你好，我是 AI 助手，这是流式输出的演示。"
    for char in message:
        yield f"data: {char}\n\n"  # SSE 格式：data: 内容\n\n
        await asyncio.sleep(0.5)   # 每 500ms 推送一个字
    yield "data: [DONE]\n\n"       # 推送完毕标记

@app.get("/sse")
async def sse_endpoint():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",  # SSE 必需的 Content-Type
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# 运行：uvicorn main:app --reload
*/
