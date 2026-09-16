"""
整合练习二 · 里程碑 4A —— RAG 检索链路

================================================================================
先读这个：RAG 到底是什么
================================================================================

大模型的知识在训练完那一刻就冻结了，而且它不知道的时候不会说"不知道"，
会一本正经地编 —— 这就是幻觉。

RAG（检索增强生成）= 给模型开卷考试：提问时先去知识库检索出最相关的几段资料，
把资料和问题一起交给模型，让它照着资料回答，并告诉你答案从哪来。

    微调 = 让学生背书（贵、慢、知识更新要重训）
    RAG  = 开卷考试（便宜、实时、可溯源）

完整流程分两个阶段、四步：

    【离线·建索引，进程启动时做一次】
      知识库文档 ──①切块──▶ 一堆 chunk ──②向量化──▶ 向量 ──③存进向量库

    【在线·每次提问】
      用户问题 ──②向量化──▶ 问题向量 ──④和库里所有向量算余弦相似度──▶ top-k
                                          │
                    把 top-k 拼进 prompt ◀─┘
                                          │
                    调 DeepSeek 流式生成 ──▶ SSE 吐给前端（附带引用来源）

================================================================================
你要做什么
================================================================================

实现下面 6 个东西，然后 `python rag.py` 跑自测。

本文件只写了「要做什么」和「坑在哪」，没有任何实现代码 —— 代码你自己写。

================================================================================
验收标准
================================================================================

1. 【能跑通】`python rag.py` 能跑出检索结果，且相关 chunk 排在前面（看 score 从高到低）
2. 【手写余弦】cosine_similarity 必须自己用 Python 内置写，不许 import numpy / 现成库
3. 【边界】空目录 / 空查询 / chunk_size <= overlap / 向量长度不一致 —— 都要有处理
4. 【注释】用自己的话写"为什么这么做"，不是复述代码在干什么
"""

import os
import math
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# ================================================================================
# 【0】配置区
# ================================================================================

#   坑1：用 Path(__file__).resolve().parent / ".env" 定位，别写 "./.env"
#        （相对路径跟"从哪个目录启动"绑定，换个目录启动就读不到 —— 里程碑 1 踩过）
#   坑2：读不到 Key 时，启动就报清楚，别拖到第一次请求才炸 KeyError
#
#   提示：embedding 走的是另一家服务商（硅基流动），和对话用的 DeepSeek 不是一个 Key，
#        所以这里要单独建一个 client

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH)

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY")
if not SILICONFLOW_API_KEY:
    raise RuntimeError(
        f"没有读到 SILICONFLOW_API_KEY。\n"
        f"请确认文件存在：{ENV_PATH}"
    )

SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1"
EMBEDDING_MODEL = "BAAI/bge-m3"

# embedding 客户端
embedding_client = OpenAI(
    api_key=SILICONFLOW_API_KEY,
    base_url=SILICONFLOW_BASE_URL,
    timeout=30,        # 单次请求超时（秒）
    max_retries=2,     # 网络抖动 / 5xx 时自动重试次数
)

# 知识库目录：knowledge/ 在 backend/ 的上一层
KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge"

# 切块参数：这两个值直接决定检索质量，想想为什么是这两个数
CHUNK_SIZE = 300
CHUNK_OVERLAP = 50

# ================================================================================
# 【1】文档加载
# ================================================================================


def load_documents(directory: Path) -> list[dict]:
    """
    读取目录下所有 .md / .txt 文件，返回 [{"source": 文件名, "text": 全文}, ...]

    为什么要记 source？
        引用来源追踪要用它 —— 前端要能显示"这句话出自哪篇文档"。
        没有 source，检索出来的就是一堆无主的文本块，用户没法验证。

    边界要想到：
        - 目录不存在 / 目录是空的 → 返回什么？直接崩掉好还是给个提示好？
        - 文件读出来是空的（0 字节）→ 要不要收进来？
        - 非 .md/.txt 的文件（比如把 .DS_Store 读进来了）→ 怎么排除？
    """
    path = Path(directory)
    # 1. 路径不存在
    if not path.exists():
        print(f"路径不存在: {directory}")
        return []

    # 2. 不是目录
    if not path.is_dir():
        print(f"不是目录: {directory}")
        return []

    # 3. 读取文件
    docs = []
    # 创建目录对象，遍历所有文件（rglob 递归子目录）
    for file_path in path.rglob("*"):
        # 筛选 .md 和 .txt 文件
        if file_path.suffix in (".md", ".txt"):
            try:
                # 读取文件内容
                text = file_path.read_text(encoding="utf-8")
                # 文件为空
                if not text.strip():
                    print(f"跳过空文件: {file_path.name}")
                    continue
                # 组装成字典
                docs.append({
                    # 文件名
                    "source": file_path.name,
                    # 文件内容
                    "text": text,
                })
            except Exception as e:
                # 读取失败
                print(f"读取失败: {file_path.name}, 错误: {e}")
    
    if not docs:
        print(f"目录下没有 .md 或 .txt 文件: {directory}")

    return docs

# ================================================================================
# 【2】切块（滑动窗口）
# ================================================================================


def split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """
    把一篇长文切成带重叠的小块。

    图示：chunk_size=4, overlap=1

        原文：A B C D E F G H I J

        块1:  A B C D
        块2:        D E F G        ← D 是重叠部分
        块3:              G H I J

    要求：
        - 每块最多 chunk_size 个字
        - 相邻两块重叠 overlap 个字
        - 最后一块不足 chunk_size 也要收进来（别把尾巴丢了）

    提示：想想每次往前走多少个字，才能让相邻两块正好重叠 overlap 个？
          然后用 range(起点, 总长, 步长) 循环就能写出来。

    边界要想到：
        - text 为空 → 返回 [] 还是 [""]？（提示：返回 [""] 会让下游多出一条空向量）
        - chunk_size <= overlap → 步长会变成多少？循环会不会永远走不完？
        - overlap 比 chunk_size 还大 → 直接报错还是自动修正？
        - text 比 chunk_size 还短 → 能不能正常返回一块？
    """
    # text为空时，返回空数组
    if not text:
        return []

    # 校验参数
    if chunk_size <= 0:
        raise ValueError("chunk_size 必须大于 0")
    if overlap < 0:
        raise ValueError("overlap 不能为负数")
    if overlap >= chunk_size:
        raise ValueError("overlap 必须小于 chunk_size")

    # 块列表
    chunk_list = []
    # 每次往后挪 chunk_size - overlap 个字符
    step = chunk_size - overlap
    # 上一块结束的位置
    prev_end = 0

    # 以 step 为步长，逐段切出 chunk_size 长度的文本块，每块之间有 overlap 个字符的重叠
    for i in range(0, len(text), step):
        chunk = text[i:i + chunk_size]
        # 当前块的结束位置，不用curr_end = i + chunk_size，这是理论位置，不是实际位置
        curr_end = i + len(chunk)
        # 最后一块没有新内容，丢弃
        if curr_end <= prev_end:
            break
        chunk_list.append(chunk)
        prev_end = curr_end

    return chunk_list

# ================================================================================
# 【3】向量化（Embedding）
# ================================================================================


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    调 embedding API，把一批文本变成一批向量。

    提示：硅基流动兼容 OpenAI 协议，所以你已经会的那个 OpenAI 客户端，
          换一个 base_url 就能用：

              client = OpenAI(api_key=..., base_url="https://api.siliconflow.cn/v1")
              resp = client.embeddings.create(model="BAAI/bge-m3", input=texts)
              resp.data[i].embedding   → 第 i 条文本的向量

    为什么要一批批传（input 是 list），而不是 for 循环一条条调？
        想想网络往返（RTT）的成本 —— 100 条文本循环调就是 100 次 HTTP 请求。

    边界要想到：
        - texts 是空列表 → 直接返回 []，别去调 API（省钱，也避免 API 报错）
        - 返回的向量长度必须一致（bge-m3 是 1024 维）—— 长度不一致余弦相似度就没法算
        - 网络失败 / 额度用完 → 错误信息要能让人看懂是"哪一步"炸了
    """

    # 空列表直接返回
    if not texts:
        return []

    resp = embedding_client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    embeddings = [item.embedding for item in resp.data]

    return embeddings

# ================================================================================
# 【4】余弦相似度（必须手写）
# ================================================================================


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """
    手写余弦相似度。不许 import numpy，就用 Python 内置（sum / zip / math.sqrt）。

    公式：  cos(a, b) = (a · b) / (|a| × |b|)

        分子 a · b（点积）：对应位置相乘，再全部相加
        分母 |a|（模长）：每个元素平方求和，再开根号

    取值范围 -1 到 1：越接近 1 越相似，0 附近表示无关。

    为什么用余弦而不是欧氏距离？
        余弦只看「方向」不看「长度」。同一段话写长写短，方向基本不变、语义也没变，
        所以余弦能公平比较长短不一的文本。

    边界要想到：
        - 有一个向量全是 0 → 分母是 0 → ZeroDivisionError，怎么处理？
        - 两个向量长度不一样 → 直接报错，还是不管？
          （提示：Python 的 zip 遇到长度不同的会「静默截断到短的那个」，
           不报错、结果却是错的 —— 这是个隐藏很深的坑）
    """
    # 确保a和b的维度一致
    if len(a) != len(b):
        raise ValueError(f"向量维度不一致: {len(a)} vs {len(b)}")

    # 点积，点积越大方向越同
    # A = [1, 2, 3]
    # B = [4, 5, 6]
    # A · B = 1×4 + 2×5 + 3×6 = 32
    dot_product = sum(x * y for x, y in zip(a, b))

    # 向量模，模就是方向的长度
    # |A| = √(1² + 2² + 3²) = √14 ≈ 3.74
    # |B| = √(4² + 5² + 6²) = √77 ≈ 8.77
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))

    # 防止除以0，返回无相似度
    if norm_a == 0 or norm_b == 0:
        return 0.0

    # 除以模 = 消除长度的影响
    # 余弦相似度 = 看两个向量"箭头方向"有多像
    # 不关心向量多长（文本多长）
    # 只关心方向（内容含义是否接近）
    # cos = 点积 / 模的乘积  → 消除长度，只看方向
    return dot_product / (norm_a * norm_b)

# ================================================================================
# 【5】向量库（内存版）
# ================================================================================


class VectorStore:
    """
    最简单的向量库：把 (文本块, 向量) 存在内存里，检索时暴力算一遍所有相似度。

    真实产品为什么不用这种？
        100 万条 chunk × 1024 维，每次查询要算 100 万次余弦相似度 —— 太慢了。
        所以才有了 HNSW 这类「近似最近邻」索引：用一点点准确率换几十倍速度。

    我们这个 demo 只有几十块，暴力算完全够用，而且能把原理讲清楚。
    """

    def __init__(self):
        # 存文本块
        self.texts: list[dict] = []
        # 存文本块对应的向量
        self.embeddings: list[list[float]] = []

    def add(self, chunks: list[dict], vectors: list[list[float]]) -> None:
        """
        把文本块和它们的向量存进去。

        chunks 形如 [{"source": "01-SSE流式输出.md", "text": "..."}, ...]
        vectors 是等长的向量列表，和 chunks 一一对应。

        边界要想到：chunks 和 vectors 长度不一致怎么办？（这是调用方的 bug，要早点发现）
        """
        if len(chunks) != len(vectors):
            raise ValueError(f"chunks 和 vectors 长度不一致: {len(chunks)} vs {len(vectors)}")

        self.texts.extend(chunks)
        self.embeddings.extend(vectors)

    def search(self, query_vector: list[float], k: int = 3) -> list[dict]:
        """
        返回和 query_vector 最相似的 k 块。

        返回格式：[{"source": ..., "text": ..., "score": 0.87}, ...]
        按 score 从大到小排序。

        边界要想到：
            - 库是空的 → 返回 []
            - k 比库里总块数还大 → 返回全部，别报错
            - 排序用 sorted(..., key=..., reverse=True)，注意是降序
        """
        if not query_vector:
            return []
        if k <= 0:
            k = 3

        similarities = []
        for i, embedding in enumerate(self.embeddings):
            # 获取cos值作为分数
            score = cosine_similarity(query_vector, embedding)
            similarities.append({
                "source": self.texts[i]["source"],
                "text": self.texts[i]["text"],
                "score": score,
            })
        # 按照分数来降序排列，最高的在最前面
        result = sorted(similarities, key=lambda x: x["score"], reverse=True)
        return result[:k]

# ================================================================================
# 【6】对外入口：检索
# ================================================================================

def build_index(directory: Path) -> VectorStore:
    """
    离线建索引：加载文档 → 切块 → 向量化 → 存进向量库。

    这就是"进程启动时做一次"的那部分。

    提示：这里要把 load_documents 和 split_text 串起来，
          注意每块都要带上 source，不然后面引用来源就丢了。

    想一想：如果知识库有 1000 篇文档，在启动时全部向量化要花很久，
            每次改代码重启都要重跑一遍 —— 有什么办法避免？（先不用实现，知道有这回事就行）
    """
    store = VectorStore()

    # 第一步：加载所有文档
    docs = load_documents(directory)

    all_chunks = []
    all_texts = []

    # 第二步：每篇文档切块
    for doc in docs:
        chunks = split_text(doc["text"])
        for chunk in chunks:
            all_chunks.append({
                "source": doc["source"],
                "text": chunk,
            })
            all_texts.append(chunk)

    if not all_chunks:
        print("没有可索引的文本块")
        return store

    print(f"正在向量化 {len(all_texts)} 个文本块...")
    all_embeddings = embed_texts(all_texts)

    # 第三步：一次性存入向量库
    store.add(chunks=all_chunks, vectors=all_embeddings)

    # 服务启动
    #     ↓
    # 检查本地有没有缓存文件
    #     ↓
    # 有 → 秒加载，直接用
    # 没有 → 重新构建，保存到本地
    #     ↓
    # 服务运行中，所有请求共用这个 store
    #     ↓
    # 服务关闭，缓存文件还在，下次启动继续用

    return store

def retrieve(query: str, store: VectorStore, k: int = 3) -> list[dict]:
    """
    在线检索：把问题向量化，去向量库里找最相似的 k 块。

    边界要想到：query 是空字符串或全是空格 → 要不要短路返回 []？
    """
    # 空查询直接返回
    if not query.strip():
        return []
    
    # 把问题转成向量
    query_embedding = embed_texts([query])[0]

    # 去向量库搜索
    results = store.search(query_embedding, k)

    return results

# ================================================================================
# 自测
# ================================================================================

if __name__ == "__main__":
    # 【1】切块正确性（先单独测，不要一上来就测端到端）
    #      用一段能数得清字数的文本，检查块数、每块长度、重叠是否正确
    #
    # 【2】余弦相似度
    #      - 自己和自己算 → 应该是 1.0
    #      - 手算一个小例子对答案，比如 [1,0] 和 [0,1] → 应该是 0.0
    #      - 全 0 向量 → 看你的边界处理对不对
    #
    # 【3】端到端检索（这是重头戏）
    #      用这几个问题查，看返回的 source 对不对：
    #        "SSE 的正文里能不能直接放换行符"   → 应命中 01-SSE流式输出.md
    #        "怎么防止 AI 输出被注入脚本"        → 应命中 03-前端XSS防护.md
    #        "为什么对话历史由前端传"            → 应命中 04-项目架构说明.md
    #
    #      这一步如果命中了，说明你的 RAG 检索链路是通的。
    #      如果没命中，先别急着改检索逻辑 —— 先打印出所有块的 score，
    #      看看是「检索算法的问题」还是「切块把答案切碎了」。
    #
    # 打印要清晰：每块显示 source、score（保留 3 位小数）、正文前 50 个字。

    print("=" * 60)
    print("【1】切块正确性测试")
    print("=" * 60)

    test_text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" * 4  # 104 个字符
    chunks = split_text(test_text, chunk_size=20, overlap=5)

    print(f"原文长度: {len(test_text)}")
    print(f"chunk_size=20, overlap=5, step=15")
    print(f"切出块数: {len(chunks)}")
    for i, chunk in enumerate(chunks):
        print(f"  第{i}块: 长度={len(chunk)}, 内容=[{chunk}]")

    # 验证：相邻块的重叠部分
    for i in range(1, len(chunks)):
        prev_tail = chunks[i - 1][-5:]  # 上一块最后5个字符
        curr_head = chunks[i][:5]        # 当前块前5个字符
        match = "✅ 重叠正确" if prev_tail == curr_head else "❌ 重叠不匹配"
        print(f"  第{i-1}块尾={prev_tail} vs 第{i}块头={curr_head} {match}")

    print()
    print("=" * 60)
    print("【2】余弦相似度测试")
    print("=" * 60)

    # 自己和自己 → 1.0
    a = [0.1, 0.3, 0.5, 0.7]
    result = cosine_similarity(a, a)
    print(f"自己和自己: {result:.3f} (期望 1.000) {'✅' if abs(result - 1.0) < 0.001 else '❌'}")

    # 正交向量 → 0.0
    result = cosine_similarity([1, 0], [0, 1])
    print(f"[1,0] vs [0,1]: {result:.3f} (期望 0.000) {'✅' if abs(result) < 0.001 else '❌'}")

    # 方向相反 → -1.0
    result = cosine_similarity([1, 0], [-1, 0])
    print(f"[1,0] vs [-1,0]: {result:.3f} (期望 -1.000) {'✅' if abs(result - (-1.0)) < 0.001 else '❌'}")

    # 全零向量 → 0.0（边界处理）
    result = cosine_similarity([0, 0, 0], [1, 2, 3])
    print(f"[0,0,0] vs [1,2,3]: {result:.3f} (期望 0.000) {'✅' if abs(result) < 0.001 else '❌'}")

    # 手算验证: [1,2] vs [3,4]
    # 点积 = 1*3 + 2*4 = 11
    # |a| = √5, |b| = √25 = 5
    # cos = 11 / (√5 * 5) = 11 / 11.180 = 0.984
    result = cosine_similarity([1, 2], [3, 4])
    expected = 11 / (5 ** 0.5 * 5)
    print(f"[1,2] vs [3,4]: {result:.3f} (手算期望 {expected:.3f}) {'✅' if abs(result - expected) < 0.001 else '❌'}")

    print()
    print("=" * 60)
    print("【3】端到端检索测试")
    print("=" * 60)

    # 构建索引
    print(f"文档目录: {KNOWLEDGE_DIR}")

    store = build_index(KNOWLEDGE_DIR)
    print(f"向量库已加载，共 {len(store.texts)} 个文本块")

    # 测试问题
    test_queries = [
        {
            "question": "SSE 的正文里能不能直接放换行符",
            "expected_source": "01-SSE流式输出.md",
        },
        {
            "question": "怎么防止 AI 输出被注入脚本",
            "expected_source": "03-前端XSS防护.md",
        },
        {
            "question": "为什么对话历史由前端传",
            "expected_source": "04-项目架构说明.md",
        },
    ]

    for item in test_queries:
        question = item["question"]
        expected = item["expected_source"]

        results = retrieve(question, store, k=3)

        print(f"问题: {question}")
        print(f"期望命中: {expected}")
        print("检索结果:")

        hit = False
        for r in results:
            marker = "✅ 命中" if expected in r["source"] else "  "
            if expected in r["source"]:
                hit = True
            print(f"  {marker}  source={r['source']}, score={r['score']:.3f}, 内容=[{r['text'][:50]}...]")

        print(f"结论: {'✅ 命中' if hit else '❌ 未命中'}")
        print("-" * 60)
