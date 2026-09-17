/**
 * 整合练习二 · 最小 AI 问答 Demo —— 前端
 *
 * ================================================================================
 * 这个文件干什么
 * ================================================================================
 *
 * 把后端吐出来的 SSE 流，一个 token 一个 token 地渲染成聊天气泡。
 *
 *   点击发送 ──▶ fetch(POST) ──▶ 后端把响应体当"水管"慢慢给
 *                                    │
 *              reader.read() 一块一块读 ◀┘
 *                                    │
 *              TextDecoder 解码成字符串
 *                                    │
 *              按 "\n" 切行 → 攒出一条完整 SSE 帧 → 解析出正文
 *                                    │
 *              Markdown 渲染 + 追加到气泡
 *
 * ================================================================================
 * 怎么读这个文件（按顺序看这五块）
 * ================================================================================
 *
 *   【1】配置与 DOM      —— 接口地址、页面元素引用
 *   【2】全局状态         —— 五个变量，每个都标了它管什么、什么时候重置
 *   【3】渲染工具         —— addMessage / renderMarkdown / scrollToBottom
 *   【4】帧解析           —— processEvent：一条完整 SSE 帧到了该怎么处理
 *   【5】主流程           —— sendMessage：读流的主循环（本文件的重点）
 *
 * ================================================================================
 * 三个核心难点（面试也最爱问这三个）
 * ================================================================================
 *
 * 【难点一】为什么不用 EventSource？
 *     EventSource 只支持 GET 请求。而聊天必须把对话内容 POST 过去（还要带历史消息、
 *     temperature），所以真实 AI 应用走的都是 fetch + 手动解析 SSE 这条路。
 *     附带好处：EventSource 会自动重连，AI 场景里反而麻烦——你不想让它把同一个
 *     问题悄悄重问一遍、白烧一次 token。
 *
 * 【难点二】网络切片的边界 ≠ SSE 帧的边界
 *     后端发的是一帧一帧的（`data: 内容` + 空行），但网络给你的是随机的字节块：
 *
 *         后端发:   data: Token⏎⏎data:  是⏎⏎
 *         网络给:   "data: Token\n"  |  "\n"  |  "data:  是\n"  |  "\n"
 *                                  ↑ 帧的结束空行单独一块，完全可能
 *
 *     所以必须有两层"缓冲"，而且**都要声明在读取循环外面**：
 *         buffer     ── 兜住半截的「行」（一个中文字还可能被切成半个）
 *         dataLines  ── 兜住半截的「帧」（data 行在这一块、结束空行在下一块）
 *
 *     只要任一层写在循环里，跨块的那部分就会被丢掉。
 *     现象：整段回答一个字都不显示，而且时好时坏（取决于网关怎么切）。
 *
 * 【难点三】怎么知道"说完了"还是"断了"？
 *     HTTP 状态码在响应开始时就发出去了，之后改不了。所以：
 *       正常读完 / 后端进程被 kill / 网线被拔 —— 这三种情况在前端看来**完全一样**，
 *       都是 reader.read() 返回 { done: true }。
 *     唯一的判据是后端在应用层发的终止哨兵 data: [DONE]。
 *     循环结束后检查有没有见过它：没见过 = 回答中断。
 */

// ================================================================================
// 【1】配置与 DOM
// ================================================================================

const API_URL = "http://127.0.0.1:8001/chat/stream";

// 一次最多带多少条历史消息（要和后端 MAX_HISTORY_MESSAGES 对齐）
// messages 是全量塞进模型上下文窗口的：越堆越长 → 越慢越贵，超长还会直接报错
const MAX_HISTORY_MESSAGES = 20;

const msgBox = document.getElementById("messages");
const inputBox = document.getElementById("input");
const sendButton = document.getElementById("send");
const stopButton = document.getElementById("stop");

// ================================================================================
// 【2】全局状态
// ================================================================================

let cooking = false;          // 当前有没有请求在跑。用来防连点
let isDone = false;           // 这一轮有没有正常收到 [DONE]。每次发送前置为 false
let currentAnswer = "";       // 本轮 AI 回答的**原文**（不是 HTML）。每次发送前置空
let currentController = null; // 本轮的 AbortController，用来掐断请求
const conversation = [];      // 多轮对话历史 [{role, content}]。只存"正常说完"的轮次

// ================================================================================
// 【3】渲染工具
// ================================================================================

/**
 * 往消息列表插一条气泡，返回这个气泡元素（后面要往里追加字）。
 *
 * 为什么用户消息用 textContent、AI 消息用 innerHTML：
 *   用户输入是**未经处理的用户数据**，塞进 innerHTML 就是 XSS（模块 5 学过）。
 *   AI 的回复要显示代码块/列表/加粗，必须走 HTML —— 所以它经过 DOMPurify 消毒。
 */
const addMessage = (role, text) => {
    const msgItem = document.createElement("div");
    msgItem.className = `msg ${role}`;
    msgItem.textContent = text ?? "";
    msgBox.appendChild(msgItem);
    scrollToBottom();
    return msgItem;
};

/**
 * 把累积的 Markdown 原文渲染进气泡。
 *
 * marked.parse() 负责 Markdown → HTML，DOMPurify.sanitize() 再洗一遍。
 *
 * ★ DOMPurify 这步不能省。
 *   AI 的输出是"外部输入"——它可能被提示注入控制，吐出 <img src=x onerror=...>。
 *   直接塞 innerHTML 就等于让 AI 在你的页面上执行脚本。
 *   原则：innerHTML 只配接"自己完全可控"的字符串；凡是要接外部内容，
 *        要么用 textContent，要么先过一遍消毒库。
 *
 * ★ 性能提示（不影响正确性）：
 *   每来一个 token 就把整段重新解析渲染一次，是 O(n²)。演示项目完全够用；
 *   生产里通常会按 requestAnimationFrame 节流，比如一帧最多渲染一次。
 */
const renderMarkdown = (item, raw) => {
    let contentEl = item.querySelector(".ai-content");
    if (!contentEl) {
        contentEl = document.createElement("div");
        contentEl.className = "ai-content";
        item.prepend(contentEl);  // 插到最前面
    }
    contentEl.innerHTML = DOMPurify.sanitize(marked.parse(raw));
};

const scrollToBottom = () => {
    msgBox.scrollTop = msgBox.scrollHeight;
};

/**
 * ★ 里程碑 4B 新增：渲染"引用来源"（清单 11.4.20）
 *
 * 后端在正文之前会先发一条 `event: sources` 帧，data 是这样一个 JSON：
 *
 *     {"sources":[{"index":1,"source":"01-SSE流式输出.md","score":0.87,"text":"全文……"}]}
 *
 * 你要把它渲染成气泡下方的一块"引用来源"区域。
 *
 * @param {Element} item     当前这条 AI 气泡（引用要挂在它下面）
 * @param {Array}   sources  解析出来的数组，可能为空数组（知识库里没检索到）
 *
 * 要做的事：
 *   1. 在 item 里建一个容器，挂引用卡片（别把引用和正文混在同一个 innerHTML 里 ——
 *      ★ 关键：renderMarkdown() 每次都整体重写 item.innerHTML，会把引用冲掉。
 *        所以引用必须挂在**另一个元素**上。）
 *   2. 每张卡片显示：编号 [1]、文件名、相似度分数、以及一段原文
 *   3. 原文给个"展开/收起"（细节多，做不做都行，先做出来再优化）
 *   4. sources 为空时：显示一句"未命中知识库，本条回答未使用检索资料"
 *      —— 这是 11.4.16 在前端的落点，得让用户看出来"这次没查资料"
 *
 * ★ XSS 提醒（模块 5 学过）：
 *   文件名和原文都来自知识库文档，虽然是你自己放的，但**别养成坏习惯**。
 *   能用 textContent 就别用 innerHTML；非要用 innerHTML 拼样式，也要先想清楚
 *   内容是从哪来的。这和 renderMarkdown 里 DOMPurify 那一步是同一个道理。
 *
 * 提示：DOM 结构和样式（卡片长什么样、分数怎么摆）自己定，index.html 的 <style>
 *       里加几条 CSS 就行，不难看即可。
 */
const renderSources = (item, sources) => {
    // 创建引用容器（独立于正文，不会被 renderMarkdown 冲掉）
    const container = document.createElement("div");
    container.className = "sources-container";
    item.appendChild(container);

    // 没有命中知识库
    if (!sources || sources.length === 0) {
        const empty = document.createElement("div");
        empty.className = "sources-empty";
        empty.textContent = "未命中知识库，本条回答未使用检索资料";
        container.appendChild(empty);
        return;
    }

    // 标题
    const title = document.createElement("div");
    title.className = "sources-title";
    title.textContent = "引用来源";
    container.appendChild(title);

    // 每张引用卡片
    sources.forEach((s) => {
        const card = document.createElement("div");
        card.className = "source-card";
        container.appendChild(card);

        // 头部：编号 + 文件名 + 分数
        const header = document.createElement("div");
        header.className = "source-header";
        card.appendChild(header);

        const index = document.createElement("span");
        index.className = "source-index";
        index.textContent = `[${s.index}]`;
        header.appendChild(index);

        const filename = document.createElement("span");
        filename.className = "source-filename";
        filename.textContent = s.source;  // textContent 防 XSS
        header.appendChild(filename);

        const score = document.createElement("span");
        score.className = "source-score";
        score.textContent = `相关度: ${(s.score * 100).toFixed(1)}%`;
        header.appendChild(score);

        // 原文（默认收起）
        const textContainer = document.createElement("div");
        textContainer.className = "source-text-container";
        card.appendChild(textContainer);

        const text = document.createElement("div");
        text.className = "source-text source-text-collapsed";
        text.textContent = s.text;  // textContent 防 XSS
        textContainer.appendChild(text);

        // 展开/收起按钮
        const toggle = document.createElement("button");
        toggle.className = "source-toggle";
        toggle.textContent = "展开";
        textContainer.appendChild(toggle);

        toggle.addEventListener("click", () => {
            const isCollapsed = text.classList.contains("source-text-collapsed");
            if (isCollapsed) {
                text.classList.remove("source-text-collapsed");
                text.classList.add("source-text-expanded");
                toggle.textContent = "收起";
            } else {
                text.classList.remove("source-text-expanded");
                text.classList.add("source-text-collapsed");
                toggle.textContent = "展开";
            }
        });
    });
};

/**
 * 切换"发送中"的按钮形态：生成时把发送换成停止。
 * 顺便统一在这里管按钮的禁用状态——避免禁用/启用逻辑散落在四五个地方打架。
 */
const setGenerating = (on) => {
    sendButton.hidden = on;
    stopButton.hidden = !on;
};

// ================================================================================
// 【4】帧解析：一条完整的 SSE 帧到了，该怎么处理
// ================================================================================

/**
 * @param {string}   type       event: 字段的值，没有就是 ""（默认事件）
 * @param {string[]} dataLines  这条帧里所有 data: 行的内容
 * @param {Element}  item       要渲染进哪个气泡
 *
 * ★ 注意这个函数**不碰** cooking / 按钮状态。
 *   加锁解锁只有 finally 一个负责人——之前散在四个地方改，改一个漏一个，
 *   出现过"空输入一次，整个页面永久卡死"的 bug。
 */
const processEvent = (type, dataLines, item) => {
    // ① 后端自定义的错误事件（event: app_error）
    if (type === "app_error") {
        addMessage("error", dataLines[0]);
        // ★ 标记"这条流已经有结局了"。
        //   少了这一句，主循环结束后的 isDone 检查会再补一条"回答中断"，
        //   用户就看到两条错误提示。
        isDone = true;
        return;
    }

    // ② 终止哨兵：后端说"我说完了"
    if (dataLines[0] === "[DONE]") {
        isDone = true;
        return;
    }

    // ②.5 ★ 里程碑 4B 新增：引用来源帧（event: sources）
    //
    //     dataLines[0] 是一行 JSON，解析出来交给 renderSources。
    //     ★ 两个坑：
    //       1. 必须 return —— 忘了 return 它会继续往下走，被当成正文拼进回答里，
    //          用户会在答案里看到一坨 JSON
    //       2. JSON.parse 要 try/catch —— 万一流被截断、JSON 是半截的，
    //          不捕获就会抛出异常，把整个读流循环带崩（连带 finally 解锁）
    //
    //     写完后自己验证：故意把后端发的内容改成半截 JSON，看页面会不会崩。
    if (type === "sources") {
        try {
            const payload = JSON.parse(dataLines[0]);
            renderSources(item, payload.sources);
        } catch (e) {
            console.error("解析 sources 帧失败:", e);
        }
        return;
    }

    // ③ 正常正文
    //    一条帧里可能有多条 data 行（后端把正文里的换行拆成了多条 data 行），
    //    按 SSE 规范要用 "\n" 拼回去——拼成空字符串的话，换行就丢了。
    const content = dataLines.join("\n");
    if (!content) return;      // 空帧（心跳、纯元信息）直接跳过

    // 先攒原文，再整体重渲染
    //   currentAnswer 是"原文"，有两个用处：渲染 Markdown；存进对话历史。
    //   存历史一定要存原文而不是渲染后的 HTML——下次发给模型的是纯文本上下文。
    currentAnswer += content;
    renderMarkdown(item, currentAnswer);
    scrollToBottom();
};

// ================================================================================
// 【5】主流程：读流
// ================================================================================

const sendMessage = async () => {
    if (cooking) return;                       // 防连点（同步判断，不会和下面的置位错开）

    const userText = inputBox.value.trim();
    if (!userText) return;                     // 空输入直接不发

    // ---- 先把界面准备好 ----
    addMessage("user", userText);
    inputBox.value = "";
    scrollToBottom();
    const aiMsgItem = addMessage("ai", "");

    // ---- 重置本轮状态 ----
    isDone = false;
    currentAnswer = "";

    // ---- 上锁 ----
    // 从这里到 finally 之间，无论走哪条路（正常结束 / return / 抛异常），
    // 都由 finally 负责解锁。这就是 try/finally 存在的意义：
    // 一个函数有 5 条出口，靠手动配对迟早漏掉一条。
    cooking = true;
    setGenerating(true);
    currentController = new AbortController();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userText,
                // 多轮对话的全部秘密：模型是无状态的，"记得上文"不过是把历史再发一遍。
                // slice 只带最近 N 条，防止上下文无限增长。
                history: conversation.slice(-MAX_HISTORY_MESSAGES),
            }),
            signal: currentController.signal,   // 用户点"停止"时靠它掐断
        });

        // 非 2xx：后端连流都没开始（比如 422 参数校验失败），别硬读
        if (!response.ok) {
            console.error("接口返回非 2xx:", response.status, await response.text());
            addMessage("error", `服务异常（${response.status}），请稍后重试`);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // ★★ 这三个状态必须住在循环外面 ★★
        //     buffer    —— 半截的「行」：一个中文字的 UTF-8 是 3 字节，可能被切成两半
        //     eventType —— 半截的「帧」：event: 行在这一块
        //     dataLines —— 半截的「帧」：data: 行在这一块，结束空行在下一块
        //
        //     只要写在循环内部，每次 read() 都会把它们重置一次，跨块的那半截就丢了。
        //     现象是"整段回答一个字都不显示"，而且取决于网关怎么切片——时好时坏。
        let buffer = "";
        let eventType = "";
        let dataLines = [];

        while (true) {
            const { done, value } = await reader.read();

            // 这里只负责跳出循环。"正常读完"和"连接断了"在这一层分不出来，
            // 判据是后面的 isDone —— 见下方收尾检查。
            if (done) break;

            // stream: true 让解码器自己缓存"半个字符"，等下一块的剩余字节到了再拼起来。
            // 不加这个参数，中文在块边界处会变成乱码 。
            buffer += decoder.decode(value, { stream: true });

            // 按行切开。切出来的最后一段可能是半截行（后面还没到），
            // 先塞回 buffer 留着，下一轮拼上。
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (const line of lines) {
                if (line.startsWith("event: ")) {
                    eventType = line.slice(7);
                } else if (line.startsWith("data: ")) {
                    dataLines.push(line.slice(6));
                } else if (line === "") {
                    // 空行 = 一条 SSE 消息结束 → 交给 processEvent
                    // （SSE 规范：一个 \n 是行分隔，两个 \n 才是消息分隔）
                    processEvent(eventType, dataLines, aiMsgItem);
                    eventType = "";
                    dataLines = [];
                }
                // 其它行（注释行 ":" 开头、未知字段）按规范直接忽略
            }
        }

        // ---- 收尾：把流末尾的残留处理干净 ----
        // 网络流不一定以换行结尾，buffer 里可能还压着最后一截。不做这一步，
        // 最后几个字会凭空消失（而且同样是"时好时坏"，最难查）。
        buffer += decoder.decode();          // 冲掉解码器里可能残留的半个字符
        if (buffer.startsWith("data: ")) {
            dataLines.push(buffer.slice(6));
        }
        // 正常流程里这里什么都不做（后端最后一定发了空行）；
        // 只有流被截断时，才需要把没结算的帧交出去。
        if (dataLines.length > 0) {
            processEvent(eventType, dataLines, aiMsgItem);
        }

        // ---- 结算这一轮 ----
        if (!isDone) {
            // 循环跑完了，却从没见过 [DONE] → 后端半路没了
            addMessage("error", "回答中断，请重试");
        } else if (currentAnswer) {
            // ★ 只有"正常说完 + 有内容"的回答才进历史。
            //   半截的回答存进去会污染后续上下文，模型会以为那就是完整的上一轮。
            //   空回答也挡掉：后端 ChatMessage 有 min_length=1，
            //   存空串进去会让下一轮请求直接 422。
            conversation.push({ role: "user", content: userText });
            conversation.push({ role: "assistant", content: currentAnswer });
        }
    } catch (error) {
        // 用户主动点"停止"也会走到这里，但那不是故障，别吓唬用户
        if (error.name === "AbortError") {
            addMessage("info", "已停止生成");
        } else {
            console.error("请求失败:", error);      // 原始错误留给控制台
            addMessage("error", "网络异常，请检查连接后重试");
        }
    } finally {
        // ★ 唯一的解锁处：不管上面是正常结束、return 掉、还是抛异常，这里一定执行。
        cooking = false;
        currentController = null;
        setGenerating(false);
    }
};

/**
 * 停止生成。
 *
 * abort() 到底做了什么：
 *   浏览器这一侧立刻停止读取、连接关闭。后端 uvicorn 检测到断连会取消这次响应，
 *   所以不会把整个回答生成完。
 *
 * 但有个细节容易被面试官追问：**它不是"立刻"停的**。
 *   本项目后端用的是同步的 OpenAI 客户端，FastAPI 会把它丢到线程池里跑。
 *   取消只能作用于"正在 await 的那个协程"，而线程池里那个线程如果正卡在
 *   next(response) 等着 DeepSeek 的下一块（网络读），是打断不了的 ——
 *   得等这一块回来，取消才轮到生效。所以最多会多读一块。
 *
 * 想让"停止"更精确、更省额度：后端换成 AsyncOpenAI，在循环里
 * await request.is_disconnected()，发现浏览器走了就立刻 return。
 * 这是后面进阶要做的（11.7.11 的完整版）。
 */
const stopGenerating = () => {
    if (!currentController) return;
    currentController.abort();
};

// ================================================================================
// 事件绑定
// ================================================================================

const main = () => {
    sendButton.addEventListener("click", sendMessage);
    stopButton.addEventListener("click", stopGenerating);

    // Enter 发送，Shift+Enter 换行（聊天框的通用约定）
    inputBox.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
};

main();
