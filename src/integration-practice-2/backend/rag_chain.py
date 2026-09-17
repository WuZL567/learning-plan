"""
整合练习二 · 里程碑 4B —— 把检索接进对话（手写版 RAG Chain）

================================================================================
先读这个：4A 修好的是半条链路，这个文件补另一半
================================================================================

里程碑 4A 你已经把「检索」这一段修好了：

    文档 ──切块──▶ chunk ──向量化──▶ 向量 ──存──▶ VectorStore ──查询──▶ top-k

但 top-k 现在只打印在终端里 —— 用户看不见，模型也用不上。
所以 RAG 的流程图还差后半截：

                                       ┌──▶ 系统提示词（模型看的那份）
    retrieve() ──▶【本文件】───────────┤
                                       └──▶ event: sources 帧（前端看的那份）

================================================================================
为什么同一批检索结果要分成「两份」走？
================================================================================

★ 引用信息绝不能"让模型转述"。

    模型可能会把文件名写错、甚至编一个根本不存在的来源。引用必须是检索结果的
    **原文照搬** —— 由后端直接结构化发给前端，不经过模型的嘴。

    模型那份（塞进 prompt 的）是为了让它"照着资料答"；
    前端那份（sources 帧）是为了让用户"验货"。
    目的不同，格式不同，所以走两条路。

================================================================================
你要做什么
================================================================================

实现下面 4 个函数（3 个必需 + 自测），然后 `python rag_chain.py` 跑自测。

    ① filter_by_threshold()    —— 阈值过滤（清单 11.4.16）
    ② build_rag_system_prompt()—— 把资料编成系统提示词
    ③ build_messages()         —— 拼出完整的 messages 数组
    ④ to_sources_frame()       —— 把检索结果编成 SSE 帧（清单 11.4.20）

================================================================================
验收标准
================================================================================

1. 【能跑通】`python rag_chain.py` 能打印出：过滤后的 chunk、system prompt、sources 帧
2. 【负例必须被拦】问"怎么做红烧肉"这类知识库里没有的问题 → 检索结果应被全部过滤掉
3. 【JSON 合法】sources 帧里 data 那行能被 json.loads 解析回去，中文不乱码
4. 【注释】写"为什么这么做"，不是复述代码在干什么

================================================================================
接线步骤（写完这个文件后，还要改两个地方）
================================================================================

【A】backend/main.py —— 把检索接进 /chat/stream

    改两处：

    1) 启动时建索引（**只建一次**）
       想想为什么不能每个请求建一次：build_index 要调 embedding API，
       实测一次 0.8 秒左右 —— 每次提问都重建，用户要白等 1 秒。
       提示：可以用 FastAPI 的 lifespan，或者模块级初始化一个全局变量。

    2) /chat/stream 的生成器里，在调模型之前按顺序做四件事：
       ① retrieve() 检索  ② filter_by_threshold() 过滤
       ③ build_messages() 拼 messages  ④ 先 yield 一条 sources 帧，再吐 token

       ★ 顺序不能反：sources 帧必须在第一个 token 之前发出去 ——
         前端要先拿到引用数据才能渲染引用区。

    （/chat 非流式接口要不要也接 RAG？可以，但不是必须的，自己决定。）

【B】frontend/app.js —— 渲染引用来源

    1) processEvent() 里加一个分支：type === "sources" 时调用 renderSources()
       ★ 别忘了 return —— 不然它会继续往下走，被当成正文拼进回答里
    2) 实现 renderSources(item, sources)（骨架已写在 app.js 里）

================================================================================
"""

import json
from pathlib import Path

from rag import build_index, retrieve, KNOWLEDGE_DIR, VectorStore

# ================================================================================
# 【0】配置区
# ================================================================================

TOP_K = 3

# 相似度阈值 —— 低于这个分数的 chunk 直接扔掉，当成"知识库里没有"
#
# 为什么必须有这个值？（清单 11.4.16）
#   检索一定会返回 top-k：哪怕知识库里根本没有相关内容，它也会硬凑 3 条给你。
#   这些 0.3~0.4 分的垃圾塞进 prompt，模型会照着垃圾一本正经地编答案 ——
#   这是 RAG 幻觉的主要来源之一。
#
# 怎么定这个值？
#   没有标准答案，得拿一批真实问题跑一遍看分数分布。bge-m3 的分数整体偏高，
#   0.5 是个常见起点。先用 0.5 跑几个正例负例感受一下，再决定要不要调。
SIMILARITY_THRESHOLD = 0.5


# ================================================================================
# 【1】阈值过滤（清单 11.4.16）
# ================================================================================

def filter_by_threshold(chunks: list[dict], threshold: float = SIMILARITY_THRESHOLD) -> list[dict]:
    """
    把分数低于 threshold 的 chunk 扔掉。

    参数：chunks 是 retrieve() 的返回值 [{"source", "text", "score"}, ...]
    返回：同样格式的列表（可能比输入短，也可能是空的）

    边界要想到：
        - 全部低于阈值 → 返回 []，让调用方自己去决定"没检索到"该怎么办
          （是退化成普通对话，还是回一句"知识库里没有相关内容"）
        - chunks 是空列表 → 返回 []
        - 分数**刚好等于**阈值 → 留还是扔？想清楚再写，别两种写法混着来，
                                面试官追问"等于的时候呢"你要答得上来
    """
    if len(chunks) == 0:
        return []

    filtered = [item for item in chunks if item["score"] >= threshold]

    return filtered

# ================================================================================
# 【2】拼系统提示词
# ================================================================================

def build_rag_system_prompt(chunks: list[dict]) -> str:
    """
    把检索到的几块资料编成一段 system prompt。

    目标产物大概长这样（编号从 1 开始，和 sources 帧里的顺序**严格一致**）：

        【资料1】来源：01-SSE流式输出.md
        SSE 用 \\n 当行分隔符，两个 \\n 才是消息分隔……

        【资料2】来源：04-项目架构说明.md
        后端保持无状态，加机器就能水平扩展……

        请只根据以上资料回答问题，并在引用处标注编号，如 [1][2]。
        资料里找不到答案时，直接回答"知识库里没有相关内容"，不要编造。

    要写对，先想清楚这三条：
        1. 编号为什么必须从 1 开始、且和 sources 帧顺序一致？
           （提示：正文里的 [2] 要能被用户点开看到"到底是哪一块"）
        2. 为什么必须明确写"找不到就说找不到"？
           （提示：不写这句，模型宁可编 —— 它在训练里被奖励"给出答案"）
        3. 资料里为什么要把"来源：文件名"也一起给模型？
           （提示：模型被要求标注引用时，它引用的是什么信息？）

    返回：拼好的 system prompt 字符串。注意用 "\\n\\n" 把资料之间分开 ——
          全挤成一行模型也能读，但可读性差，调试时你也看不懂。

    边界：chunks 为空时，这个函数还应该被调用吗？
          （提示：调用方应该先判断 —— 空资源列表拼出来是一段"资料如下：\n\n\n"的空壳，
           模型看到会更懵。这个函数自己不用处理空列表，但要在注释里写清楚约定。）
    """
    if not chunks:
        return ""

    context = ""

    for index, item in enumerate(chunks):
        context += f"【资料{index + 1}】来源：{ item['source'] }\n{item['text']}\n"
    
    context += "请只根据以上资料回答问题，并在引用处标注编号，如 [1][2]。\n资料里找不到答案时，直接回答'知识库里没有相关内容'，禁止编造。"

    return context

def build_messages(question: str, chunks: list[dict], history: list[dict]) -> list[dict]:
    """
    拼出完整的 messages 数组：system（含资料）+ 历史对话 + 本次问题。

    ★ 这就是"接入对话"的全部意思 —— 检索结果不是单独发给模型的，
      它是**塞进 system prompt** 的。

    提示：main.py 里已经有一个 build_messages 了（system + history + user），
          可以先看一眼它的形状。但别 import main —— 那会把 FastAPI 实例、
          环境变量校验一起拖进来，还会造成循环依赖。自己拼三行就够。

    参数：
        question  str          本轮问题
        chunks    list[dict]   已过滤的检索结果（**可能为空**）
        history   list[dict]   [{"role": "user"/"assistant", "content": "..."}]，已是 dict

    要想清楚的一个点：
        chunks 为空时，system prompt 该长什么样？
        （不能是空壳资料段。这里正是 11.4.16 的落点：没检索到的时候，
          让模型知道"没有资料"，它才会老实说"知识库里没有相关内容"；
          给它一段空资料，它反而会开始编。）
    """
    systemPrompt = ""
    if not chunks:
        systemPrompt = "你是一个AI助手。当前用户的没有找到相关资料，直接告知用户：知识库中没有相关内容！"
    else:
        ragSysPrompt = build_rag_system_prompt(chunks=chunks)
        systemPrompt = "你是项目知识库助手。根据以下参考资料回答用户问题。如果参考资料不足以回答，请如实说明'知识库中没有相关信息'。\n"
        systemPrompt += ragSysPrompt

    messages = [{"role": "system", "content": systemPrompt}]
    # model_dump是为了将 Pydantic 对象显示转成字典
    messages += [m.model_dump() for m in history]
    messages.append({"role": "user", "content": question})

    return messages

# ================================================================================
# 【3】拼 sources 帧（清单 11.4.20）
# ================================================================================

def to_sources_frame(chunks: list[dict]) -> str:
    """
    把检索结果编成一条 SSE 帧，事件名是 sources：

        event: sources
        data: {"sources":[{"index":1,"source":"01-SSE流式输出.md","score":0.87,"text":"……"}]}
        ⏎                      ← 空行，一条帧结束

    提示：用 json.dumps(payload, ensure_ascii=False)。
          不加 ensure_ascii=False，中文会变成 \\uXXXX —— JSON 仍然合法、前端也能解析，
          但用 curl 调试时满屏乱码，排查和演示都会很难受。

    三个要想清楚的地方：
        1. payload 里为什么要带下标 index？
           （提示：前端渲染出的 [1] 要和正文里的 [1] 对上）
        2. text 给全文还是截断？帧太大会有什么后果？
           （提示：一份知识库文档几百字，3 块就是近千字 —— 想想这个帧有多重）
        3. 为什么单开一个 sources 事件，而不是用事件名 message？
           （提示：前端是按事件类型分发的，正文和引用是两套完全不同的处理逻辑）

    顺带想一个"意外的好处"：
        JSON 会把正文里的换行转义成 \\n（两个字符，不是真的换行），
        所以 JSON 永远是**一行** —— main.py 里 to_sse_frame 那个"正文换行要拆多条
        data: 行"的麻烦，在这里天然不存在。想想为什么？
    """
    sources = []
    for i, chunk in enumerate(chunks):
        sources.append({
            "index": i + 1,
            "source": chunk["source"],
            "score": chunk["score"],
            "text": chunk["text"][:200],
        })

    payload = {"sources": sources}
    data = json.dumps(payload, ensure_ascii=False)

    return f"event: sources\ndata: {data}\n\n"


# ================================================================================
# 自测
# ================================================================================

if __name__ == "__main__":
    # 【1】建索引拿真数据（会调 embedding API，约 1 秒）
    #
    # 【2】跑三个查询，重点看**负例**：
    #       "SSE 的正文里能不能直接放换行符"   → 正例，应有 1~3 条在阈值以上
    #       "为什么对话历史由前端传"           → 正例，应命中 04-项目架构说明.md
    #       "怎么做红烧肉"                     → 负例，应该被全部过滤掉
    #
    #     负例才是这次的重点 —— 它们验证阈值真的在干活。
    #     每个查询打印：原始分数 → 过滤后剩几条
    #
    # 【3】打印 build_rag_system_prompt 的结果前 300 字，肉眼检查格式对不对
    #
    # 【4】打印 to_sources_frame 的结果，把那行 data 复制出来手动 json.loads 一遍，
    #      看能不能解析回去、中文有没有乱码
    #
    # 顺序建议：先单独测每个函数，最后再串起来 —— 4A 的教训别忘。

    # 【1】建索引
    print("=" * 60)
    print("【1】建索引")
    print("=" * 60)

    store = build_index(KNOWLEDGE_DIR)
    print(f"向量库已加载，共 {len(store.texts)} 个文本块")

    # 【2】三个查询测试（重点看负例）
    print()
    print("=" * 60)
    print("【2】查询测试（重点看阈值过滤）")
    print("=" * 60)
    
    THRESHOLD = 0.5

    test_queries = [
        # 正例：应该命中
        {"question": "SSE 的正文里能不能直接放换行符", "type": "正例"},
        {"question": "为什么对话历史由前端传", "type": "正例"},
        {"question": "怎么防止 XSS 注入", "type": "正例"},
        {"question": "流式输出怎么发给前端", "type": "正例"},

        # 负例：应该被过滤
        {"question": "怎么做红烧肉", "type": "负例"},
        {"question": "今天天气怎么样", "type": "负例"},
        {"question": "什么是人工智能", "type": "负例"},

        # 边界：相关但不完全相关
        {"question": "Python 的装饰器怎么用", "type": "边界"},
        {"question": "什么是微服务架构", "type": "边界"},
    ]

    # 问题: SSE 的正文里能不能直接放换行符
    # 期望: 正例
    # 高分: 0.683

    # 问题: 为什么对话历史由前端传
    # 期望: 正例
    # 高分: 0.697

    # 问题: 怎么防止 XSS 注入
    # 期望: 正例
    # 高分: 0.683

    # 问题: 流式输出怎么发给前端
    # 期望: 正例
    # 高分: 0.681

    # 问题: 怎么做红烧肉
    # 期望: 负例
    # 高分: 0.388

    # 问题: 今天天气怎么样
    # 期望: 负例
    # 高分: 0.408

    # 问题: 什么是人工智能
    # 期望: 负例
    # 高分: 0.461

    # 问题: Python 的装饰器怎么用
    # 期望: 边界
    # 高分: 0.447

    # 问题: 什么是微服务架构
    # 期望: 边界
    # 高分: 0.513

    for item in test_queries:
        question = item["question"]
        print(f"\n问题: {question}")
        print(f"期望: {item['type']}")

        # 先不过滤，看原始分数
        raw_results = retrieve(question, store, k=3)
        print("原始分数:")
        for r in raw_results:
            marker = "✅" if r["score"] >= THRESHOLD else "❌ 低于阈值"
            print(f"  {marker}  source={r['source']}, score={r['score']:.3f}")

        # 过滤后
        filtered = filter_by_threshold(raw_results, THRESHOLD)
        print(f"过滤后剩: {len(filtered)} 条")

        # 负例验证
        if not filtered:
            print("✅ 全部被过滤，阈值生效！")
        print("-" * 60)

    # 【3】build_rag_system_prompt 测试
    print()
    print("=" * 60)
    print("【3】RAG Prompt 前 300 字")
    print("=" * 60)

    # 用正例查询的结果
    sample_results = retrieve("SSE 的正文里能不能直接放换行符", store, k=3)
    prompt = build_rag_system_prompt(sample_results)
    print(prompt[:300])
    print("...")

    # 【4】to_sources_frame 测试
    print()
    print("=" * 60)
    print("【4】to_sources_frame 结果")
    print("=" * 60)

    frame = to_sources_frame(sample_results)
    print("SSE 帧内容:")
    print(frame)

    # 手动验证：提取 data 行，json.loads 解析
    data_line = None
    for line in frame.split("\n"):
        if line.startswith("data: "):
            data_line = line[6:]

    if data_line:
        print("手动解析 data 行:")
        parsed = json.loads(data_line)
        print(f"  sources 数量: {len(parsed['sources'])}")
        for s in parsed["sources"]:
            print(f"  [{s['index']}] source={s['source']}, score={s['score']}")
            print(f"       text前50字={s['text'][:50]}...")
        print("✅ JSON 解析成功，中文无乱码")
    else:
        print("❌ 没找到 data 行")
