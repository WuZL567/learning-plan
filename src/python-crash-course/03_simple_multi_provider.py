"""
练习 3：简单的多 Provider 封装

任务：
1. 理解继承和多态的基本概念
2. 实现一个简化版的多 Provider 封装
3. 完成练习题
"""

# 基类（抽象类）- 对应 JS 的抽象基类
class LLMProvider:
    """LLM Provider 基类"""

    def __init__(self, api_key):
        self.api_key = api_key

    def chat(self, prompt):
        """
        所有子类必须实现这个方法
        如果子类不实现，调用时会报错
        """
        raise NotImplementedError("子类必须实现 chat 方法")


# 子类 1：DeepSeek
class DeepSeekProvider(LLMProvider):
    """DeepSeek Provider"""

    def __init__(self, api_key):
        super().__init__(api_key)  # 调用父类的 __init__（对应 JS 的 super()）
        self.model = "deepseek-chat"

    def chat(self, prompt):
        """实现父类的 chat 方法"""
        # 这里应该调用真实的 API，我们用 mock 数据
        return f"[DeepSeek 回复] 这是对 '{prompt}' 的回答"


# 子类 2：通义千问（mock 版本）
class QwenProvider(LLMProvider):
    """通义千问 Provider"""

    def __init__(self, api_key):
        super().__init__(api_key)
        self.model = "qwen-max"

    def chat(self, prompt):
        """实现父类的 chat 方法"""
        return f"[通义千问 回复] 这是对 '{prompt}' 的回答"


# 子类 3：Claude（mock 版本）
class ClaudeProvider(LLMProvider):
    """Claude Provider"""

    def __init__(self, api_key):
        super().__init__(api_key)
        self.model = "claude-3-5-sonnet"

    def chat(self, prompt):
        """实现父类的 chat 方法"""
        return f"[Claude 回复] 这是对 '{prompt}' 的回答"

# 子类 4：GPT
class GPTProvider(LLMProvider):
    """GPT Provider"""

    def __init__(self, api_key):
        super().__init__(api_key)
        self.model = "gpt-4"

    def chat(self, prompt):
        return f"[GPT 回复] 这是对 '{prompt}' 的回复"

# 工厂函数：根据名称创建对应的 Provider
def get_provider(provider_name, api_key):
    """
    工厂函数（对应 JS 的工厂模式）

    参数：
        provider_name: "deepseek" | "qwen" | "claude"
        api_key: API 密钥

    返回：
        对应的 Provider 实例
    """
    if provider_name == "deepseek":
        return DeepSeekProvider(api_key)
    elif provider_name == "qwen":
        return QwenProvider(api_key)
    elif provider_name == "claude":
        return ClaudeProvider(api_key)
    elif provider_name == "gpt":
        return GPTProvider(api_key)
    else:
        raise ValueError(f"不支持的 Provider: {provider_name}")


# 使用示例
if __name__ == "__main__":
    # 切换 Provider 只需要改这一行配置
    PROVIDER_NAME = "deepseek"  # 可以改成 "qwen" 或 "claude"
    API_KEY = "sk-xxx"

    # 获取 Provider 实例
    provider = get_provider(PROVIDER_NAME, API_KEY)

    # 业务代码保持不变
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

    print("\n--- 切换到 GPT ---")
    provider = get_provider("gpt", API_KEY)
    result = provider.chat("什么是 Token")
    print(result)


"""
========== JS 对照版本 ==========

JavaScript 版本：

class LLMProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  chat(prompt) {
    throw new Error("子类必须实现 chat 方法");
  }
}

class DeepSeekProvider extends LLMProvider {
  constructor(apiKey) {
    super(apiKey);
    this.model = "deepseek-chat";
  }

  chat(prompt) {
    return `[DeepSeek 回复] 这是对 '${prompt}' 的回答`;
  }
}

function getProvider(providerName, apiKey) {
  switch(providerName) {
    case "deepseek": return new DeepSeekProvider(apiKey);
    case "qwen": return new QwenProvider(apiKey);
    case "claude": return new ClaudeProvider(apiKey);
    default: throw new Error(`不支持的 Provider: ${providerName}`);
  }
}

// 使用
const PROVIDER_NAME = "deepseek";
const provider = getProvider(PROVIDER_NAME, "sk-xxx");
const result = provider.chat("什么是 Token");


========== 练习题 ==========

1. Python 的 super().__init__(api_key) 对应 JS 的什么？
答：对应JS中子级继承父级的时候，constructor函数中的第一行的super()函数；

2. 为什么所有 Provider 的 chat 方法签名必须一致？
答：为了统一，保证都支持chat函数？

3. 工厂函数 get_provider 的作用是什么？
答：根据不同的名称和API来调用对应的类；

4. 如果要增加一个新的 Provider（比如 GPT），需要改哪些地方？
答：首先新增一个子类GPT：
class GPTProvider(LLMProvider):
    def __init__(self, api_key):
        super().__init__(api_key)
        self.model = "GPT-chat"

    def chat(self, prompt):
        return f"[GPT 回复] 这是对 '{prompt}' 的回答"
然后修改get_provider函数，在里面增加一个：
elif provider_name == "gpt":
    return GPTProvider(api_key)
最后需要在 if __name__ == "__main__": 中调用即可；

========== 动手练习 ==========

5. 增加一个 GPTProvider 类，继承自 LLMProvider
   要求：
   - model 为 "gpt-4"
   - chat 方法返回 "[GPT 回复] ..."

   class GPTProvider(LLMProvider):
       # 在这里写代码
       pass

6. 在 get_provider 函数里增加对 "gpt" 的支持
   elif provider_name == "gpt":
       return GPTProvider(api_key)

7. 测试切换到 GPT
   provider = get_provider("gpt", API_KEY)
   print(provider.chat("什么是 Token"))

完成后保存文件，告诉我你完成了。
"""
