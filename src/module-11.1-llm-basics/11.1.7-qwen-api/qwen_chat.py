"""
11.1.7 通义千问 API 调用练习

任务要求：
1. 安装 dashscope：pip install dashscope
2. 调用通义千问 API 完成一次对话
3. 打印返回的内容

验收标准：
- 代码能运行（如果没有 API Key，可以用 mock 数据模拟，在注释里说明）
- 正确处理 API 返回值
- 用注释解释通义千问 API 的调用格式与 DeepSeek 的差异

提示：
- 模型名用 "qwen-max" 或 "qwen-turbo"
- 返回格式参数是 result_format="message"
- 通义的返回结构是 response.output.choices[0].message.content
"""

# 在这里写你的代码

class QwenProvider:
    def __init__(self, api_key, base_url="https://qwen.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.model = "qwen-max"

    def chat(self, prompt):
        return f"['{self.model}' 模型]: 这是 '{prompt}' 的回复"
    
    def set_model(self, model_name):
        if model_name == 'qwen-max':
            self.model = 'qwen-max'
        elif model_name == 'qwen-turbo':
            self.model = 'qwen-turbo'
        else:
            self.model = 'qwen-max'

if __name__ == "__main__":
    # 模拟返回数据
    instance = QwenProvider()
    result = instance.chat("什么是Token？")
    print(result)
