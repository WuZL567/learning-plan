"""
11.1.10 LLM 流式输出 - 代码练习

要求：
1. 使用 DeepSeek API 实现流式调用
2. 逐 token 输出到终端（不是一次性返回全部内容）
3. 处理连接中断或超时的情况

验收标准：
- 代码能跑通，能看到逐字输出的效果（3 分）
- 处理了 stream=True 参数和逐块解析（4 分）
- 处理了异常情况（连接中断、超时、API 错误）（2 分）
- 代码注释用自己的话解释了流式输出的逻辑（1 分）

提示：
- 使用 openai 库（DeepSeek 兼容 OpenAI SDK）
- 设置 stream=True
- 用 for chunk in response 逐块读取
- 用 try-except 捕获异常

你的实现：
"""

# 在这里写你的代码

from openai import OpenAI

client = OpenAI(
    api_key="xxx-xxx",
    base_url="https://api.deepseek.com",
    timeout=30,
    max_retries=2,
)

def stream_chat(prompt: str, model: str = "deepseek-chat") -> str:
    full_response = [] # 拼接所有片段，最终返回完整文本

    try:
        # 发起流式请求
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "你是一个AI助手。"},
                {"role": "user", "content": prompt},
            ],
            stream=True, # 开启流式模式
            temperature=0.7,
            max_tokens=1024,
        )

        for chunk in response:
            delta = chunk.choices[0].delta
            token = delta.content  # 这一个 chunk 产生的文本片段

            if token is not None:
                print(token, end="", flush=True)
                full_response.append(token)

        print()  # 输出完成后换行

        return "".join(full_response)

    except Exception as e:
        print(f"\n[错误] 发生未知异常：{type(e).__name__}: {e}")

    return ""

if __name__ == "__main__":
    print("\n🤖 DeepSeek 回复：\n")
    result = stream_chat("什么是量子纠缠？")
    print(result)
