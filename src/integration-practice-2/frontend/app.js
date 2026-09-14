/**
 * 整合练习二 · 里程碑 3：前端对话界面 + SSE 联调
 * 对应技术点：11.7.1 SSE 流式通信前端实现（P1，能写代码）
 *
 * ================================================================
 * 背景
 * ================================================================
 * 里程碑 2 你已经做出真流式后端：curl -N 能看到字一个一个往外冒。
 * 但那是在终端里看的。本里程碑把它搬进浏览器：
 * AI 说一个字，气泡里就多一个字。
 *
 * 接口（里程碑 2 写的，路由不用动）：
 *   POST http://127.0.0.1:8001/chat/stream
 *   请求体：{"message": "你的问题", "temperature": 0.7}
 *   返回：Content-Type: text/event-stream
 *
 *     data: 你
 *
 *     data: 好
 *
 *     ...
 *     data: [DONE]
 *
 * ================================================================
 * 任务清单
 * ================================================================
 *
 * 0a. 后端加 CORS（不做这步，浏览器一个请求都发不出去）
 *     - 用 FastAPI 的 CORSMiddleware，开发阶段 allow_origins 给 ["*"]
 *     - 为什么：前端跑在 5500 端口、后端在 8001 端口，端口不同就是跨域（模块 4 学过）。
 *       浏览器会先发一个 OPTIONS 预检请求，后端不放行就直接把请求拦掉，
 *       现象是 fetch 直接 reject，后端日志里干干净净什么都看不到。
 *
 * 0b. 收尾里程碑 2 的遗留问题
 *     - 把错误路径那行 `event: app_error: 服务暂时不可用，请稍后重试` 拆成三行：
 *       字段名 event / 事件名 app_error / 消息内容放 data:
 *     - 为什么现在才做：里程碑 2 时前端还不存在，那条消息"没人听"。这一轮前端要真的
 *       监听 app_error 事件，这个坑才闭环。
 *
 * 1. 找到页面元素
 *    - 输入框 #input、发送按钮 #send、消息列表 #messages
 *
 * 2. 写一个 addMessage(role, text) 函数
 *    - 往 #messages 里插一条气泡，**返回这个气泡元素**（等下要往里追加字）
 *    - role 区分 'user' / 'ai'，靠 class 控制样式（CSS 里已经写好 .msg.user / .msg.ai）
 *    - 插完把列表滚到底部，不然新消息在屏幕外面
 *
 * 3. 核心：sendMessage()
 *    a. 读输入框内容，空的直接不发
 *    b. 立刻插入"用户气泡"，再插入一个**空的** AI 气泡，拿到它的元素引用
 *    c. fetch 调 /chat/stream（POST + JSON body）
 *    d. 判断 response.ok —— 非 2xx 别硬读，直接进错误分支
 *    e. 把响应体当成"水管"来读（注意：不是 await response.text()，
 *       那是等全部读完才给你，等于把流式废掉）
 *    f. 边读边把二进制解码成字符串
 *    g. 从字符串里切出 SSE 帧，解析出 data: 后面的内容
 *    h. 把内容追加到 AI 气泡上（追加完记得滚到底部）
 *    i. 收到 [DONE] 就收工，停止渲染
 *    j. 出错要有提示：网络断了、后端 500、后端推的 app_error 事件，
 *       三种都要让用户在界面上看得见，不能静默失败
 *
 * 4. 绑定事件
 *    - 点 #send 触发 sendMessage
 *    - 在 #input 里按 Enter 也触发（Shift+Enter 换行，不发送）
 *    - 请求进行中把发送按钮禁用，防止连点
 *
 * ================================================================
 * 验收标准（满分 10 分）
 * ================================================================
 *
 * 1. 真流式渲染（4 分）
 *    点发送后，AI 气泡里的字是一个一个冒出来的，不是等几秒一次性出现
 *
 * 2. SSE 帧解析正确（3 分）
 *    气泡里不能出现 "data:" 前缀、不能出现空行残渣；中文不乱码；
 *    [DONE] 不会被当正文显示出来
 *
 * 3. 边界处理（2 分）
 *    空输入不发送；后端报错 / 网络断了 / 收到 app_error 事件时，
 *    界面要有明确提示（错误气泡或状态文字），不能白屏或者悄悄没反应
 *
 * 4. 注释用自己的话解释（1 分）
 *    说清楚"为什么这么写"，不复述代码
 *
 * ================================================================
 * 提示（卡住了再看，别提前看）
 * ================================================================
 *
 * ① 为什么不用 EventSource？
 *    去 MDN 查一下 EventSource 只支持哪种请求方法，再看看我们的接口是什么方法。
 *    真实 AI 应用要把对话内容 POST 过去，所以走的是 fetch + 读流这条路。
 *
 * ② fetch 怎么读流？
 *    response.body 上有个 getReader()，它给你一个"读卡器"：
 *    每次 read() 返回 { done, value } —— 和 curl -N 是同一个视角。
 *    value 是二进制字节，要靠 TextDecoder 解码成字符串。
 *
 * ③ 中文乱码 / 半截数据
 *    一个 UTF-8 中文字占 3 个字节，网络切片可能正好把一个字切成两半；
 *    SSE 两帧之间是"两个换行"，网络给的块也不一定正好切在帧边界上。
 *    所以大概率需要一个"缓冲区"变量，攒着还没切完的尾巴。
 *    （TextDecoder 有第二个参数能处理半截字节，去查一下它）
 *
 * ================================================================
 * 自测命令
 * ================================================================
 * 前端启动：在本目录下跑 python3 -m http.server 5500
 * 然后浏览器打开 http://127.0.0.1:5500
 *
 * 卡住了先确认后端还活着：
 * curl -N -X POST http://127.0.0.1:8001/chat/stream \
 *   -H "Content-Type: application/json" \
 *   -d '{"message": "用一句话解释什么是token"}'
 *
 * ================================================================
 * 你的代码从这里开始写
 * ================================================================
 */

const API_URL = 'http://127.0.0.1:8001/chat/stream'
const msgBox = document.getElementById("messages");
const inputBox = document.getElementById("input");
const sendButton = document.getElementById("send");
let cooking = false;
let isDone = false;

// 添加消息，插入消息到#messages元素中
const addMessage = (role, text) => {
    // 消息组的容器元素
    if (!msgBox) return;

    // 往容器内部插入一条气泡msg
    const msgItem = document.createElement('div');
    msgItem.className = `msg ${role}`;
    msgItem.textContent = text || "";

    msgBox.appendChild(msgItem);

    return msgItem;
}

// 发送消息
const sendMessage = async () => {
    if (cooking) return;
    // 获取输入框的内容，并判断是否存在输入内容
    if (!inputBox) return;
    const userText = inputBox.value?.trim();
    if (!userText) return;

    // 插入一个用户气泡；
    const userMsgItem = addMessage('user', userText);
    if (!userMsgItem) return;
    setTimeout(() => {
        // 清空用户输入框
        inputBox.value = "";
        // 自动滚动到底部
        msgBox.scrollTop = msgBox.scrollHeight;
    }, 0);

    // 插入一个空的AI气泡
    const aiMsgItem = addMessage('ai', "");
    if (!aiMsgItem) return;

    isDone = false;

    // 流开始时，禁用用户发送请求
    cooking = true;
    sendButton.disabled = true;
    // 请求接口数据
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText }),
        });

        if (!response.ok) {
            addMessage('error', `服务异常 ${response.status}`);
            return;
        };

        // 调用getReader函数
        const reader = response.body.getReader();

        // 解析二进制为字符串
        const decoder = new TextDecoder();
        // 缓存未处理完的数据
        let buffer = "";
        // 记录事件类型
        let eventType = "";
        // 记录所有 data 行
        let dataLines = [];

        while (true) {
            sendButton.disabled = true;
            // 这里要使用await调用read函数
            const { done, value } = await reader.read();
            // 流结束直接跳出循环；
            if (done) {
                cooking = false;
                sendButton.disabled = false;
                break;
            };
            // stream: true 让 decoder 自动缓存半截字节，下次收到剩余字节后拼起来输出。
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // 半截数据就放到下次再拼接
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith("event: ")) {
                    eventType = line.slice(7);
                }
                else if (line.startsWith("data: ")) {
                    dataLines.push(line.slice(6));
                }
                else if (line === "") {
                    // 空行 = 一条消息结束，处理
                    processEvent(eventType, dataLines, aiMsgItem);
                    eventType = "";
                    dataLines = [];
                }
            }
        }

        if (!isDone) {
            addMessage('error', `回答中断，请重试`);
        }
    } catch (error) {
        addMessage('error', `网络异常，请检查连接后重试: ${error}`);
    } finally {
        cooking = false;
        sendButton.disabled = false;
    }
}

const processEvent = (type, dataLines, item) => {
    // 错误事件
    if (type === "app_error") {
        addMessage('error', dataLines[0]);
        cooking = false;
        sendButton.disabled = false;
        return;
    }

    // 结束标记
    if (dataLines[0] === "[DONE]") {
        isDone = true;
        cooking = false;
        sendButton.disabled = false;
        return;
    }

    // 正常文本
    const content = dataLines.join("\n");
    // 逐字拼接显示到页面上
    item.textContent += content;
    // 自动滚动到底部
    msgBox.scrollTop = msgBox.scrollHeight;
}

const main = () => {
    // 注册监听事件
    sendButton.addEventListener("click", () => sendMessage());
    // 注册回车时间
    inputBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

main();
