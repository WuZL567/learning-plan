"""
练习 1：基础的 DeepSeek API 调用

任务：
1. 阅读下面的代码，理解每一行的作用
2. 对照 JS 版本，找出对应关系
3. 运行代码（如果没有 API Key，看注释理解即可）
4. 完成下面的练习题
"""

import requests  # 对应 JS 的 axios 或 fetch

# 1. 定义一个简单的函数
def call_deepseek_simple(prompt, temperature=0.7):
    """
    最简单的 DeepSeek API 调用

    参数：
        prompt: 用户输入的问题（字符串）

    返回：
        AI 的回复内容（字符串）
    """
    api_key = "sk-your-api-key"  # 替换成你的 API Key
    base_url = "https://api.deepseek.com/chat/completions"

    # 构造请求体（对应 JS 的 body）
    payload = {
        "model": "deepseek-chat",
        "temperature": temperature,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    # 构造请求头（对应 JS 的 headers）
    headers = {
        "Authorization": f"Bearer {api_key}",  # f'...' 是 Python 的模板字符串
        "Content-Type": "application/json"
    }

    # 发送 POST 请求
    response = requests.post(base_url, json=payload, headers=headers)

    # 解析响应
    data = response.json()  # 对应 JS 的 response.json()
    return data["choices"][0]["message"]["content"]


# 2. 使用函数
if __name__ == "__main__":  # 对应 JS 里直接执行的代码
    # 模拟调用（因为你可能没有 API Key）
    # result = call_deepseek_simple("用一句话解释什么是 Token")
    # print(result)

    # 如果没有 API Key，用 mock 数据
    mock_result = "Token 是 LLM 处理文本的最小单位，大约对应 0.75 个英文单词或半个中文字。"
    print("AI 回复:", mock_result)


"""
========== 练习题 ==========

对照上面的代码，回答以下问题（写在注释里）：

1. Python 的 def 对应 JS 的什么关键字？
答：function

2. Python 的 f'Bearer {api_key}' 对应 JS 的什么写法？
答：字符串模板，类似 `Bearer ${api_key}`;

3. Python 的字典 {"role": "user"} 和 JS 的对象 {role: 'user'} 有什么区别？
答：key要带上双引号，"role"

4. Python 的 if __name__ == "__main__": 是什么意思？（提示：类似 JS 模块的入口）
答：类似这个文件中的主函数，会自动执行后面的逻辑；


========== 动手练习 ==========

5. 修改 call_deepseek_simple 函数，增加一个参数 temperature，默认值 0.7
   提示：def call_deepseek_simple(prompt, temperature=0.7):

6. 在 payload 中加入 temperature 参数
   提示：payload = {"model": "...", "messages": [...], "temperature": temperature}

完成后保存文件，告诉我你完成了。
"""
