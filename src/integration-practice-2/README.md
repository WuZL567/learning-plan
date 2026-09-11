# 整合练习二：最小 AI 问答 Demo

目标：FastAPI 后端 + DeepSeek API + SSE 流式输出 + 前端对话界面

## 里程碑进度

| # | 里程碑 | 状态 | 对应技术点 |
|---|--------|:----:|-----------|
| 1 | FastAPI 后端骨架 + 打通 DeepSeek | 🔄 进行中 | 10.10 FastAPI 基础、10.12 请求校验 |
| 2 | SSE 流式输出 | ⬜ 未开始 | 10.20 FastAPI SSE 流式输出 |
| 3 | 前端对话界面 + 联调 | ⬜ 未开始 | 11.7.1 SSE 流式通信前端实现 |
| 4 | （可选）RAG 增强 | ⬜ 未开始 | 11.4 RAG |

## 目录结构

```
src/integration-practice-2/
├── README.md           # 本文件
├── backend/
│   ├── main.py         # FastAPI 主文件（你要写的）
│   ├── requirements.txt
│   ├── .env.example    # API Key 模板
│   └── venv/           # 虚拟环境（已装好，不入 git）
└── frontend/           # 里程碑 3 再建
```

## 启动方式

```bash
cd src/integration-practice-2/backend

# 首次使用：复制 .env.example 为 .env，填入你的 DeepSeek API Key
cp .env.example .env

# 启动服务
./venv/bin/uvicorn main:app --reload
```

启动后访问：
- http://127.0.0.1:8000/health —— 健康检查
- http://127.0.0.1:8000/docs —— FastAPI 自动生成的 API 文档（Swagger UI）

## 为什么需要后端

浏览器不能直接调 DeepSeek API：API Key 会暴露在 Network 面板，任何人 F12 就能抄走刷爆你的额度。
所以后端要做"中转站"：前端 → 后端（带 Key）→ DeepSeek → 后端 → 前端。
