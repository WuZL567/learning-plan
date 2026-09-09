"""
练习 2：用类封装 DeepSeek API 调用

任务：
1. 理解 Python 类的写法
2. 对照 JS 的 class，找出对应关系
3. 完成练习题
"""

import requests

# Python 类的定义（对应 JS 的 class）
class DeepSeekClient:
    """DeepSeek API 客户端"""

    # 构造函数（对应 JS 的 constructor）
    def __init__(self, api_key, base_url="https://api.deepseek.com"):
        """
        初始化客户端

        参数：
            api_key: API 密钥
            base_url: API 地址（默认值）
        """
        self.api_key = api_key      # self = JS 的 this
        self.base_url = base_url
        self.model = "deepseek-chat"

    # 实例方法（对应 JS 的类方法）
    def chat(self, prompt, temperature=0.7):
        """
        发送聊天请求

        参数：
            prompt: 用户输入
            temperature: 温度参数（默认 0.7）

        返回：
            AI 的回复内容
        """
        url = f"{self.base_url}/chat/completions"  # 使用 self 访问实例属性

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        return data["choices"][0]["message"]["content"]

    # 另一个方法：获取模型信息
    def get_model_info(self):
        """返回当前使用的模型名称"""
        return f"当前模型: {self.model}"

    # 修改 self.model 的值
    def set_model(self, model_name):
        self.model = model_name
        pass

# 使用类
if __name__ == "__main__":
    # 创建实例（注意：Python 不需要 new 关键字）
    client = DeepSeekClient("sk-your-api-key")

    # 调用方法
    # result = client.chat("用一句话解释什么是 Temperature")
    # print(result)

    # Mock 数据
    mock_result = "Temperature 控制输出的随机性，0 表示确定性输出，1 表示更随机。"
    print(mock_result)

    # 调用另一个方法
    print(client.get_model_info())


    # 调用设置模型的函数
    client.set_model("deepseek-coder")
    print(client.get_model_info())

"""
========== JS vs Python 类对照 ==========

JavaScript 版本：

class DeepSeekClient {
  constructor(apiKey, baseURL = "https://api.deepseek.com") {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = "deepseek-chat";
  }

  async chat(prompt, temperature = 0.7) {
    const url = `${this.baseURL}/chat/completions`;
    // ... fetch 请求
  }

  getModelInfo() {
    return `当前模型: ${this.model}`;
  }
}

const client = new DeepSeekClient("sk-xxx");
const result = await client.chat("...");


========== 练习题 ==========

1. Python 的 __init__ 对应 JS 的什么？
答：JS的class中的constructor函数；

2. Python 的 self 对应 JS 的什么？
答：对应this；

3. Python 创建实例为什么不需要 new 关键字？
答：（这是语言设计差异，记住即可）语言设计差异

4. Python 的方法定义 def chat(self, prompt) 中，为什么第一个参数必须是 self？
答：self 是实例方法的第一个参数，用于访问实例属性和方法。


========== 动手练习 ==========

5. 给 DeepSeekClient 类增加一个方法 set_model(self, model_name)
   功能：修改 self.model 的值

   def set_model(self, model_name):
       # 在这里写代码
       pass

6. 在 if __name__ == "__main__": 里调用这个方法
   client.set_model("deepseek-coder")
   print(client.get_model_info())

完成后保存文件，告诉我你完成了。
"""
