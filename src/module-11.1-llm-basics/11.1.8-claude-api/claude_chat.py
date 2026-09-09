"""
11.1.8 Claude API 调用练习

任务要求：
1. 安装 anthropic：pip install anthropic
2. 调用 Claude API 完成一次对话
3. 打印返回的内容

验收标准：
- 代码能运行（如果没有 API Key，可以用 mock 数据模拟，在注释里说明）
- 正确处理 API 返回值
- 用注释解释 Claude API 的特殊之处（system 参数、返回结构）

提示：
- 模型名用 "claude-3-5-sonnet-20241022"
- system prompt 是单独的参数，不在 messages 里
- 返回结构是 message.content[0].text
- max_tokens 是必填参数
"""

# 在这里写你的代码

class ClaudeProvider:
    def __init__(self, api_key, base_url="https://claude.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.model = "claude-3-5-sonnet-20241022"

    def chat(self, prompt):
        return f"['{self.model}' 模型]: 这是 '{prompt}' 的回复"
    
if __name__ == "__main__":
    # 模拟返回数据
    instance = ClaudeProvider()
    result = instance.chat("什么是Token？")
    print(result)
