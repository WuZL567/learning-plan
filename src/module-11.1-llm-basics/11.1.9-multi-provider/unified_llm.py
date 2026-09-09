"""
11.1.9 多 Provider 统一调用封装

任务要求：
1. 定义统一的基类 LLMProvider，包含 chat() 方法
2. 实现三个子类：DeepSeekProvider、QwenProvider、ClaudeProvider
3. 实现工厂函数 get_provider(provider_name)，根据名称返回对应 Provider 实例
4. 写一个测试代码，演示切换 Provider 只需要改配置

验收标准：
- 统一输入格式：所有 Provider 的 chat() 方法接收相同参数（messages, temperature, max_tokens）
- 统一输出格式：所有 Provider 返回统一的字典结构 {"content": "...", "usage": {...}}
- 业务代码不感知底层 Provider 类型
- 用注释解释适配器模式在这里的应用

提示：
- 如果没有 API Key,可以在子类里 mock 返回值
- 重点是封装设计,不是 API 调用本身
- 参考前端的 API 封装思路
"""

# 在这里写你的代码

# 1. 定义基类
class LLMProvider:
    def __init__(self, api_key):
        self.api_key = api_key

    def chat(self, prompt):
        raise NotImplementedError("子类必须有chat函数")

# 2. 实现子类适配器
class DeepSeekProvider(LLMProvider):
    def __init__(self, api_key):
        super().__init__(api_key)
        self.model = "deepseek-chat"
    
    def chat(self, prompt):
        return f"[deepSeek 回复]： 这是'{prompt}'的回复"

class QwenProvider(LLMProvider):
    def __init__(self, api_key):
        super().__init__(api_key)
        self.model = "qwen-max"
    
    def chat(self, prompt):
        return f"[qwen 回复]： 这是'{prompt}'的回复"

class ClaudeProvider(LLMProvider):
    def __init__(self, api_key):
        super().__init__(api_key)
        self.model = "claude-3-5-sonnet"
    
    def chat(self, prompt):
        return f"[claude 回复]： 这是'{prompt}'的回复"

# 3. 工厂函数
def get_provider(provider_name: str, api_key) -> LLMProvider:
    if provider_name == "deepseek":
        return DeepSeekProvider(api_key)
    elif provider_name == "qwen":
        return QwenProvider(api_key)
    elif provider_name == "claude":
        return ClaudeProvider(api_key)
    else:
        raise ValueError(f"不支持的 Provider: {provider_name}")

# 4. 测试代码
if __name__ == "__main__":
    PROVIDER_NAME = "deepseek"  # 可以改成 "qwen" 或 "claude"
    API_KEY = "sk-xxx"

    provider = get_provider(PROVIDER_NAME, API_KEY)

    result = provider.chat("什么是 Token")
    print(result)

    print("\n--- 切换到通义千问 ---")
    provider = get_provider("qwen", API_KEY)
    result = provider.chat("什么是 Token")
    print(result)

    print("\n--- 切换到 Claude ---")
    provider = get_provider("claude", API_KEY)
    result = provider.chat("什么是 Token")
    print(result)
