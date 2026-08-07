# Python后端开发：从零基础到 FastAPI 的 7 个跟练 Demo

## 学习路线图

~~~
Demo 0: 环境搭建（10分钟）
  ↓
Demo 1: Python 基础 → 用 Python 写一个餐厅菜单管理器（30分钟）
  ↓
Demo 2: FastAPI 入门 → 启动第一个后端 API 服务（20分钟）
  ↓
Demo 3: Pydantic 校验 → 给 API 加上类型校验（20分钟）
  ↓
Demo 4: 依赖注入与中间件 → 给 API 加认证和跨域（20分钟）
  ↓
Demo 5: SQLAlchemy 数据库 → 把数据存到 PostgreSQL（40分钟）
  ↓
Demo 6: SSE 流式输出 → 模拟 AI 逐字回答（20分钟）
  ↓
Demo 7: 综合实战 → 把以上所有拼成完整项目（60分钟）
~~~

---

## Demo 0：环境搭建（10分钟）

### 学习目标

在你的电脑上准备好 Python + FastAPI 的开发环境。

### 第一步：安装 Python

**macOS / Linux：**

~~~bash
# 检查是否已安装
python3 --version

# 如果没有，macOS 用 Homebrew 安装
brew install python@3.12
~~~

**Windows：**

~~~
1. 打开 https://www.python.org/downloads/
2. 下载 Python 3.12.x 安装包
3. 安装时 **务必勾选** "Add Python to PATH"
4. 打开命令行输入 python --version 验证
~~~

### 第二步：创建项目文件夹和虚拟环境

~~~bash
# 创建项目文件夹
mkdir 餐厅后端
cd 餐厅后端

# 创建 Python 虚拟环境（类似 npm init，隔离项目依赖）
python3 -m venv .venv

# 激活虚拟环境
# macOS / Linux：
source .venv/bin/activate
# Windows：
.venv\Scripts\activate

# 激活后，终端前面会出现 (.venv) 标志
# 就像 nvm 切换了 Node 版本一样
~~~

### 第三步：安装依赖

~~~bash
# 安装 FastAPI 和相关依赖（类似 npm install express）
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic python-dotenv httpx

# 导出依赖清单（类似 package.json）
pip freeze > requirements.txt

# 验证安装
python3 -c "import fastapi; print(f'FastAPI {fastapi.__version__} 安装成功')"
# 输出 ✅ FastAPI 0.115.x 安装成功
~~~

### 第四步：安装 VS Code 插件

~~~
1. 打开 VS Code
2. 安装插件：Python（Microsoft 出品）
3. 安装插件：Pylance（Python 语言服务）
4. 打开项目文件夹：文件 → 打开文件夹 → 选择"餐厅后端"
5. VS Code 会自动识别 .venv 虚拟环境
~~~

### 验证清单

~~~
✅ python3 --version 能输出版本号
✅ (.venv) 虚拟环境已激活
✅ pip install 安装了所有依赖
✅ VS Code 安装了 Python 插件
~~~

---

## Demo 1：Python 基础 — 用 Python 写一个餐厅菜单管理器

### 学习目标

- 掌握 Python 的变量、类型、列表、字典、函数、类
- 用前端思维理解 Python 语法
- 最终产出：一个可以在命令行运行的菜单管理器

### 1.1 第一个 Python 文件

创建文件 `demo1_基础.py`：

~~~python
# ========== demo1_基础.py
# Python 不需要 const/let/var，直接赋值
# Python 用缩进（4个空格）代替 {}，用冒号 : 代替 {

# ---------- 变量和类型（对比 JS/TS）
菜品名称 = "宫保鸡丁"       # str 字符串，类似 JS 的 string
菜品价格 = 38.5             # float 浮点数，类似 JS 的 number
菜品数量 = 3                # int 整数（Python 区分整数和小数，JS 不区分）
是否售罄 = False            # bool 布尔（注意首字母大写！JS 是小写 true/false）
菜品标签 = None             # NoneType（只有这一个值，类似 JS 的 null）

# ---------- 类型注解（类似 TypeScript，但运行时不强制）
名称: str = "宫保鸡丁"
价格: float = 38.5
数量: int = 3
售罄: bool = False
标签: str | None = None     # Python 3.10+ 支持联合类型，等同 TS 的 string | null

# ---------- f-string 模板字符串（类似 JS 的反引号模板字符串）
# JS:  `点了${数量}份${名称}，总价${价格 * 数量}元`
# Python: f"点了{数量}份{名称}，总价{价格 * 数量}元"
订单信息 = f"点了{数量}份{名称}，总价{价格 * 数量}元"
print(订单信息)
# 输出 ✅ 点了3份宫保鸡丁，总价115.5元

# ---------- 类型转换（类似 JS 的 String() Number()）
价格字符串 = str(价格)      # 38.5 → "38.5"，类似 JS 的 String(38.5)
价格整数 = int(价格)        # 38.5 → 38（截断小数），类似 JS 的 Math.floor()
价格浮点 = float("38.5")   # "38.5" → 38.5，类似 JS 的 Number("38.5")

print(f"字符串: {价格字符串}, 整数: {价格整数}, 浮点: {价格浮点}")
# 输出 ✅ 字符串: 38.5, 整数: 38, 浮点: 38.5
~~~

运行：

~~~bash
python3 demo1_基础.py
~~~

### 1.2 列表、字典、元组、集合

在 `demo1_基础.py` 末尾追加：

~~~python
# ========== 列表 list ≈ JS 的 Array（有序、可变）
菜单 = ["宫保鸡丁", "鱼香肉丝", "麻婆豆腐"]
菜单.append("回锅肉")         # 添加末尾 ≈ JS 的 push()
菜单.insert(0, "凉菜拼盘")    # 在索引0插入
最后一个 = 菜单.pop()         # 删除并返回最后一个 ≈ JS 的 pop()
第一个 = 菜单.pop(0)          # 删除并返回索引0的元素
长度 = len(菜单)               # 获取长度 ≈ JS 的 .length

print(f"菜单: {菜单}")
print(f"弹出的菜: {第一个}, {最后一个}")
print(f"剩余数量: {长度}")
# 输出 ✅ 菜单: ['宫保鸡丁', '鱼香肉丝', '麻婆豆腐']
# 输出 ✅ 弹出的菜: 凉菜拼盘, 回锅肉
# 输出 ✅ 剩余数量: 3

# ---------- 切片（Python 独有的强大特性，JS 没有）
前两道 = 菜单[0:2]           # 取索引 0、1，类似 JS 的 .slice(0, 2)
后两道 = 菜单[-2:]           # 取最后2个
复制列表 = 菜单[:]           # 浅拷贝整个列表
反转列表 = 菜单[::-1]        # 反转（步长为-1）

print(f"前两道: {前两道}")     # 输出 ✅ 前两道: ['宫保鸡丁', '鱼香肉丝']
print(f"反转: {反转列表}")    # 输出 ✅ 反转: ['麻婆豆腐', '鱼香肉丝', '宫保鸡丁']

# ========== 字典 dict ≈ JS 的 Object/Map（键值对）
菜品详情 = {
    "名称": "宫保鸡丁",
    "价格": 38.5,
    "辣度": "中辣",
    "食材": ["鸡肉", "花生", "辣椒"],  # 值可以是列表
}

# 访问
名称 = 菜品详情["名称"]                # 直接访问，key 不存在会报错
安全名称 = 菜品详情.get("名称", "未知") # 安全访问，key 不存在返回默认值 ≈ ?? 运算符
不存在的 = 菜品详情.get("评分", "暂无") # "暂无"

# 增删改
菜品详情["评分"] = 4.8                 # 新增键值对
del 菜品详情["辣度"]                    # 删除键值对
菜品详情["价格"] = 42.0                # 修改

# 判断是否存在
有价格 = "价格" in 菜品详情            # True，类似 JS 的 "price" in obj
有辣度 = "辣度" in 菜品详情            # False（已删除）

print(f"菜品: {菜品详情}")
print(f"有价格: {有价格}, 有辣度: {有辣度}")
# 输出 ✅ 菜品: {'名称': '宫保鸡丁', '价格': 42.0, '食材': ['鸡肉', '花生', '辣椒'], '评分': 4.8}
# 输出 ✅ 有价格: True, 有辣度: False

# ========== 元组 tuple ≈ 不可变的列表（类似 Object.freeze([])）
坐标 = (116.4, 39.9)
# 坐标[0] = 120  # ❌ 报错！元组不可修改
print(f"经度: {坐标[0]}, 纬度: {坐标[1]}")
# 输出 ✅ 经度: 116.4, 纬度: 39.9

# ========== 集合 set ≈ JS 的 Set（无序、自动去重）
已点菜品 = {"宫保鸡丁", "鱼香肉丝", "宫保鸡丁"}  # 自动去重
print(f"已点: {已点菜品}")
# 输出 ✅ 已点: {'宫保鸡丁', '鱼香肉丝'}（注意：顺序可能不同）

已点菜品.add("麻婆豆腐")       # 添加
已点菜品.discard("鱼香肉丝")   # 删除（不存在不会报错）
是否包含 = "宫保鸡丁" in 已点菜品  # O(1) 查找
print(f"包含宫保鸡丁: {是否包含}")
# 输出 ✅ 包含宫保鸡丁: True
~~~

运行验证：

~~~bash
python3 demo1_基础.py
# 确认所有输出都和注释中标注的一致
~~~

### 1.3 函数

创建文件 `demo1_函数.py`：

~~~python
# ========== demo1_函数.py

# ---------- 基础函数
# JS:  function 计算总价(单价, 数量 = 1) { return 单价 * 数量; }
# Python:
def 计算总价(单价: float, 数量: int = 1) -> float:
    """
    计算菜品总价
    参数：
        单价: 菜品单价
        数量: 点的数量，默认1
    返回：总价
    """
    return 单价 * 数量

# 三种调用方式
结果1 = 计算总价(38.5, 3)            # 位置参数（按顺序传）
结果2 = 计算总价(单价=38.5, 数量=3)  # 关键字参数（指定名称传，JS 没有这个特性）
结果3 = 计算总价(38.5)               # 数量用默认值 1

print(f"结果1: {结果1}")  # 输出 ✅ 结果1: 115.5
print(f"结果2: {结果2}")  # 输出 ✅ 结果2: 115.5
print(f"结果3: {结果3}")  # 输出 ✅ 结果3: 38.5

# ---------- 多返回值（Python 独有，JS 要用数组/对象模拟）
def 分析菜单(菜品列表: list[str]) -> tuple[int, str]:
    """返回数量和推荐菜"""
    return len(菜品列表), 菜品列表[0]

数量, 推荐 = 分析菜单(["宫保鸡丁", "鱼香肉丝", "麻婆豆腐"])
print(f"共{数量}道菜，推荐: {推荐}")
# 输出 ✅ 共3道菜，推荐: 宫保鸡丁

# ---------- *args 和 **kwargs
# *args   ≈ JS 的 ...rest 收集剩余参数为元组
# **kwargs ≈ JS 的 ...rest 收集剩余参数为字典
def 打印订单(主菜: str, *配菜: str, **选项: str):
    print(f"主菜: {主菜}")
    print(f"配菜: {配菜}")     # 元组
    print(f"选项: {选项}")     # 字典

打印订单("宫保鸡丁", "凉菜", "汤", 辣度="中辣", 加饭="是")
# 输出 ✅ 主菜: 宫保鸡丁
# 输出 ✅ 配菜: ('凉菜', '汤')
# 输出 ✅ 选项: {'辣度': '中辣', '加饭': '是'}

# ---------- Lambda 匿名函数 ≈ JS 的箭头函数 () => {}
排序函数 = lambda 菜品: 菜品["价格"]
# 等价于：
# const 排序函数 = (菜品) => 菜品["价格"]

菜单 = [
    {"名称": "宫保鸡丁", "价格": 38},
    {"名称": "凉菜", "价格": 18},
    {"名称": "鱼香肉丝", "价格": 28},
]
按价格排序 = sorted(菜单, key=排序函数)
print(f"排序后: {按价格排序}")
# 输出 ✅ 排序后: [{'名称': '凉菜', '价格': 18}, {'名称': '鱼香肉丝', '价格': 28}, {'名称': '宫保鸡丁', '价格': 38}]

# ---------- 列表推导式（类似 JS 的 .map() + .filter()）
# JS:  const result = prices.filter(p => p > 30).map(p => p * 0.8)
# Python:
原始价格 = [38.5, 28.0, 45.0, 18.0, 52.0]
高价八折 = [价格 * 0.8 for 价格 in 原始价格 if 价格 > 30]
print(f"高价菜品八折: {高价八折}")
# 输出 ✅ 高价菜品八折: [30.8, 36.0, 41.6]

# ---------- 字典推导式
名称列表 = ["宫保鸡丁", "鱼香肉丝", "麻婆豆腐"]
价格列表 = [38, 28, 22]
菜单字典 = {名: 价 for 名, 价 in zip(名称列表, 价格列表)}
print(f"菜单: {菜单字典}")
# 输出 ✅ 菜单: {'宫保鸡丁': 38, '鱼香肉丝': 28, '麻婆豆腐': 22}
~~~

运行验证：

~~~bash
python3 demo1_函数.py
~~~

### 1.4 类（面向对象）

创建文件 `demo1_类.py`：

~~~python
# ========== demo1_类.py

# ---------- 类的定义（类似 ES6 的 class）
# JS:  class 菜品 { constructor(名称, 价格) { this.名称 = 名称; } }
# Python:
class 菜品:
    # 类变量（所有实例共享，类似 JS 的 static 属性）
    餐厅名称 = "川味小馆"

    # __init__ 就是 JS 的 constructor
    def __init__(self, 名称: str, 价格: float, 辣度: int = 0):
        # self 就是 JS 的 this（但 Python 必须显式写出来）
        self.名称 = 名称
        self.价格 = 价格
        self.辣度 = 辣度
        self.已售数量 = 0

    # 实例方法
    def 点单(self, 数量: int = 1):
        self.已售数量 += 数量
        return f"已点 {数量} 份 {self.名称}，小计 ¥{self.价格 * 数量}"

    # 计算属性（类似 JS 的 get）
    @property
    def 总销售额(self) -> float:
        return self.价格 * self.已售数量

    # 魔术方法 __str__ ≈ JS 的 toString()
    def __repr__(self):
        return f"<菜品 {self.名称} ¥{self.价格}>"

    # 静态方法（不需要 self）
    @staticmethod
    def 折扣价(价格: float, 折扣: float = 0.8) -> float:
        return round(价格 * 折扣, 2)

    # 类方法（接收 cls 类本身）
    @classmethod
    def 获取餐厅名(cls) -> str:
        return cls.餐厅名称


# ---------- 使用类
宫保鸡丁 = 菜品("宫保鸡丁", 38.5, 辣度=3)  # 创建实例
鱼香肉丝 = 菜品("鱼香肉丝", 28.0, 辣度=1)

print(宫保鸡丁.点单(2))        # 输出 ✅ 已点 2 份 宫保鸡丁，小计 ¥77.0
print(宫保鸡丁.点单(1))        # 输出 ✅ 已点 1 份 宫保鸡丁，小计 ¥38.5
print(f"总销售额: ¥{宫保鸡丁.总销售额}")  # 输出 ✅ 总销售额: ¥115.5

print(菜品.折扣价(38.5))       # 输出 ✅ 30.8
print(菜品.获取餐厅名())       # 输出 ✅ 川味小馆
print(宫保鸡丁)                 # 输出 ✅ <菜品 宫保鸡丁 ¥38.5>


# ---------- 继承（和 JS 的 extends 一样）
class 特价菜品(菜品):
    def __init__(self, 名称: str, 价格: float, 折扣: float, 辣度: int = 0):
        super().__init__(名称, 价格, 辣度)  # 调用父类构造函数 ≈ super()
        self.折扣 = 折扣

    # 重写父类方法
    def 点单(self, 数量: int = 1):
        实际价格 = round(self.价格 * self.折扣, 2)
        self.已售数量 += 数量
        return f"[特价{self.折扣}折] 已点 {数量} 份 {self.名称}，小计 ¥{实际价格 * 数量}"


特价鸡丁 = 特价菜品("特价宫保鸡丁", 38.5, 折扣=0.7)
print(特价鸡丁.点单(2))
# 输出 ✅ [特价0.7折] 已点 2 份 特价宫保鸡丁，小计 ¥53.9
~~~

运行验证：

~~~bash
python3 demo1_类.py
~~~

### 1.5 实战：命令行餐厅菜单管理器

创建文件 `demo1_菜单管理器.py`——把以上所有知识组合起来：

~~~python
# ========== demo1_菜单管理器.py
# 这是一个完整的命令行应用，综合运用了变量、列表、字典、函数、类、循环、条件判断

import json
import os

# ---------- 数据模型
class 菜品:
    自增编号 = 0

    def __init__(self, 名称: str, 价格: float, 分类: str = "主食", 辣度: int = 0):
        菜品.自增编号 += 1
        self.编号 = 菜品.自增编号
        self.名称 = 名称
        self.价格 = 价格
        self.分类 = 分类
        self.辣度 = 辣度

    def 转字典(self) -> dict:
        return {
            "编号": self.编号,
            "名称": self.名称,
            "价格": self.价格,
            "分类": self.分类,
            "辣度": self.辣度,
        }

    @staticmethod
    def 从字典创建(数据: dict) -> "菜品":
        菜品实例 = 菜品(数据["名称"], 数据["价格"], 数据["分类"], 数据["辣度"])
        菜品实例.编号 = 数据["编号"]
        菜品.自增编号 = max(菜品.自增编号, 数据["编号"])
        return 菜品实例


# ---------- 菜单管理器
class 菜单管理器:
    def __init__(self, 数据文件: str = "菜单数据.json"):
        self.数据文件 = 数据文件
        self.菜品列表: list[菜品] = []
        self.加载数据()

    def 加载数据(self):
        if os.path.exists(self.数据文件):
            with open(self.数据文件, "r", encoding="utf-8") as f:
                数据列表 = json.load(f)
                self.菜品列表 = [菜品.从字典创建(数据) for 数据 in 数据列表]
            print(f"已加载 {len(self.菜品列表)} 道菜品")

    def 保存数据(self):
        数据列表 = [菜.转字典() for 菜 in self.菜品列表]
        with open(self.数据文件, "w", encoding="utf-8") as f:
            json.dump(数据列表, f, ensure_ascii=False, indent=2)
        print("数据已保存")

    def 添加菜品(self, 名称: str, 价格: float, 分类: str = "主食", 辣度: int = 0):
        新菜品 = 菜品(名称, 价格, 分类, 辣度)
        self.菜品列表.append(新菜品)
        self.保存数据()
        print(f"✅ 已添加：{新菜品.名称}（编号 {新菜品.编号}）")

    def 删除菜品(self, 编号: int):
        for i, 菜 in enumerate(self.菜品列表):
            if 菜.编号 == 编号:
                已删除 = self.菜品列表.pop(i)
                self.保存数据()
                print(f"✅ 已删除：{已删除.名称}")
                return
        print(f"❌ 未找到编号 {编号} 的菜品")

    def 查找菜品(self, 关键词: str):
        结果 = [菜 for 菜 in self.菜品列表 if 关键词 in 菜.名称 or 关键词 in 菜.分类]
        if 结果:
            print(f"找到 {len(结果)} 条结果：")
            for 菜 in 结果:
                print(f"  [{菜.编号}] {菜.名称} - ¥{菜.价格} ({菜.分类}, 辣度{菜.辣度})")
        else:
            print("未找到匹配的菜品")

    def 显示所有(self):
        if not self.菜品列表:
            print("菜单为空，请先添加菜品")
            return
        print("\n" + "=" * 50)
        print(f"{'编号':<6}{'名称':<12}{'价格':<8}{'分类':<8}{'辣度':<6}")
        print("-" * 50)
        for 菜 in self.菜品列表:
            print(f"{菜.编号:<6}{菜.名称:<12}¥{菜.价格:<7}{菜.分类:<8}{菜.辣度:<6}")
        print("=" * 50)
        print(f"共 {len(self.菜品列表)} 道菜品\n")

    def 按分类统计(self):
        统计: dict[str, list[菜品]] = {}
        for 菜 in self.菜品列表:
            if 菜.分类 not in 统计:
                统计[菜.分类] = []
            统计[菜.分类].append(菜)

        print("\n分类统计：")
        for 分类, 菜品们 in 统计.items():
            平均价格 = sum(菜.价格 for 菜 in 菜品们) / len(菜品们)
            print(f"  {分类}: {len(菜品们)} 道，平均价格 ¥{平均价格:.1f}")


# ---------- 主程序
def 主程序():
    管理器 = 菜单管理器()

    # 如果菜单为空，添加一些示例数据
    if not 管理器.菜品列表:
        print("首次运行，添加示例菜品...")
        管理器.添加菜品("宫保鸡丁", 38.5, "热菜", 3)
        管理器.添加菜品("鱼香肉丝", 28.0, "热菜", 1)
        管理器.添加菜品("麻婆豆腐", 22.0, "热菜", 4)
        管理器.添加菜品("凉菜拼盘", 18.0, "凉菜", 0)
        管理器.添加菜品("米饭", 3.0, "主食", 0)
        管理器.添加菜品("酸梅汤", 8.0, "饮品", 0)

    while True:
        print("\n🍽️  餐厅菜单管理系统")
        print("1. 查看所有菜品")
        print("2. 添加菜品")
        print("3. 删除菜品")
        print("4. 搜索菜品")
        print("5. 分类统计")
        print("0. 退出")

        选择 = input("\n请输入选项编号: ").strip()

        if 选择 == "1":
            管理器.显示所有()
        elif 选择 == "2":
            名称 = input("菜品名称: ").strip()
            价格 = float(input("价格: ").strip())
            分类 = input("分类（热菜/凉菜/主食/饮品）: ").strip() or "主食"
            辣度 = int(input("辣度（0-5）: ").strip() or "0")
            管理器.添加菜品(名称, 价格, 分类, 辣度)
        elif 选择 == "3":
            编号 = int(input("要删除的菜品编号: ").strip())
            管理器.删除菜品(编号)
        elif 选择 == "4":
            关键词 = input("搜索关键词: ").strip()
            管理器.查找菜品(关键词)
        elif 选择 == "5":
            管理器.按分类统计()
        elif 选择 == "0":
            print("再见！")
            break
        else:
            print("无效选项，请重新输入")


# 运行
if __name__ == "__main__":
    主程序()
~~~

运行并体验：

~~~bash
python3 demo1_菜单管理器.py
# 跟着菜单操作：查看、添加、删除、搜索、统计
# 数据会保存到 菜单数据.json，下次运行还在
~~~

**Demo 1 学完你应该掌握：**
- Python 变量不需要声明关键字，用冒号+缩进定代码块
- `list` ≈ Array，`dict` ≈ Object，`set` ≈ Set，`tuple` ≈ 不可变 Array
- `def` 定义函数，`*args` 收集元组，`**kwargs` 收集字典
- `class` 定义类，`self` ≈ `this`，`__init__` ≈ `constructor`
- 列表推导式 `[x for x in list if 条件]` ≈ `.filter().map()`

---

## Demo 2：FastAPI 入门 — 启动第一个后端 API 服务

### 学习目标

- 理解 FastAPI 的路由系统
- 写出第一个 GET/POST/PUT/DELETE API
- 用浏览器访问自动生成的 API 文档

### 2.1 最简单的 FastAPI 应用

创建文件 `demo2_main.py`：

~~~python
# ========== demo2_main.py
# 这就是 FastAPI 的 Hello World

from fastapi import FastAPI

# 创建应用实例（类似 Express 的 const app = express()）
厨房 = FastAPI(title="餐厅API", description="我的第一个后端API", version="1.0.0")

# 定义路由（类似 Express 的 app.get('/', handler)）
# @装饰器 语法是 Python 的语法糖，等价于：厨房.get("/")(欢迎页面)
@厨房.get("/")
def 欢迎页面():
    return {"消息": "欢迎光临餐厅API"}

# 启动命令：uvicorn demo2_main:厨房 --reload
# demo2_main = 文件名（不要 .py）
# 厨房 = FastAPI 实例的变量名
# --reload = 文件修改后自动重启（开发用）
~~~

启动服务器：

~~~bash
# 在终端执行（确保虚拟环境已激活）
uvicorn demo2_main:厨房 --reload --port 8000

# 你会看到：
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Started reloader process
~~~

打开浏览器访问：

~~~
http://127.0.0.1:8000          → {"消息": "欢迎光临餐厅API"}
http://127.0.0.1:8000/docs     → 自动生成的 Swagger API 文档（可以点"Try it out"测试）
http://127.0.0.1:8000/redoc    → 另一个风格的 API 文档
~~~

**前端类比：**
~~~
Express 的 app.get('/path', handler)    →    FastAPI 的 @厨房.get("/path")
Express 的 res.json(data)               →    FastAPI 的 return data（自动转 JSON）
Express 的 app.listen(3000)             →    终端运行 uvicorn demo2_main:厨房 --reload
Express 的 nodemon                      →    uvicorn 的 --reload（文件修改自动重启）
~~~

### 2.2 路径参数和查询参数

在 `demo2_main.py` 中继续添加：

~~~python
from fastapi import HTTPException

# ========== 路径参数（类似 Express 的 req.params）
# URL 中的变量部分用 {花括号} 包裹
# 类型注解会自动校验：传了字符串会返回 422 错误
@厨房.get("/菜品/{菜品编号}")
def 获取菜品(菜品编号: int):
    菜品库 = {
        1: {"编号": 1, "名称": "宫保鸡丁", "价格": 38.5},
        2: {"编号": 2, "名称": "鱼香肉丝", "价格": 28.0},
        3: {"编号": 3, "名称": "麻婆豆腐", "价格": 22.0},
    }
    # HTTPException 就是手动返回错误码（类似 Express 的 res.status(404).json(...)）
    if 菜品编号 not in 菜品库:
        raise HTTPException(status_code=404, detail=f"菜品 {菜品编号} 不存在")
    return 菜品库[菜品编号]


# ========== 查询参数（类似 Express 的 req.query）
# 函数参数不写在路径里的，就是查询参数
# 默认值就相当于可选参数
@厨房.get("/菜单")
def 搜索菜品(
    分类: str = "全部",     # ?分类=热菜  默认值"全部"
    最低价: float = 0,      # ?最低价=20  默认值0
    最高价: float = 999,    # ?最高价=50  默认值999
    页码: int = 1,          # ?页码=2     默认值1
    每页数量: int = 10,     # ?每页数量=5 默认值10
):
    return {
        "筛选条件": {
            "分类": 分类,
            "价格区间": f"¥{最低价} - ¥{最高价}",
        },
        "分页": {
            "页码": 页码,
            "每页": 每页数量,
            "偏移量": (页码 - 1) * 每页数量,
        },
    }

# 测试：
# GET /菜单                        → 使用全部默认值
# GET /菜单?分类=热菜&最低价=20     → 筛选热菜，价格>=20
# GET /菜单?页码=2&每页数量=5       → 第2页，每页5条
~~~

在浏览器中测试：

~~~
http://127.0.0.1:8000/菜品/1                    → {"编号":1,"名称":"宫保鸡丁","价格":38.5}
http://127.0.0.1:8000/菜品/999                   → 404 错误
http://127.0.0.1:8000/菜品/abc                   → 422 错误（类型不匹配）
http://127.0.0.1:8000/菜单?分类=热菜&最低价=20    → 带筛选条件的查询
http://127.0.0.1:8000/docs                       → 点击"Try it out"在线测试每个接口
~~~

### 2.3 完整的 CRUD 接口

创建文件 `demo2_crud.py`——把增删改查四个接口写完整：

~~~python
# ========== demo2_crud.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

厨房 = FastAPI(title="菜品CRUD")

# ---------- 用字典模拟数据库
菜品数据库: dict[int, dict] = {}
自增编号: int = 0

# ---------- 请求体的数据结构（类似 TypeScript interface）
# 就像 TS 的 interface 菜品输入 { 名称: string; 价格: number; ... }
class 菜品输入(BaseModel):
    名称: str
    价格: float
    分类: str = "主食"
    辣度: int = 0


# ---------- CREATE（创建）
@厨房.post("/菜品", status_code=201)
def 创建菜品(菜品: 菜品输入):
    """
    POST /菜品
    Body: {"名称": "宫保鸡丁", "价格": 38.5, "辣度": 3}
    """
    global 自增编号
    自增编号 += 1
    菜品数据库[自增编号] = {
        "编号": 自增编号,
        **菜品.model_dump(),   # ** 解包字典 ≈ JS 的展开运算符 {...obj}
    }
    return {"消息": "创建成功", "数据": 菜品数据库[自增编号]}


# ---------- READ ALL（查询全部）
@厨房.get("/菜品")
def 获取所有菜品(分类: str | None = None):
    """
    GET /菜品               → 返回全部
    GET /菜品?分类=热菜      → 按分类筛选
    """
    if 分类:
        return {
            "总数": sum(1 for 菜 in 菜品数据库.values() if 菜["分类"] == 分类),
            "数据": [菜 for 菜 in 菜品数据库.values() if 菜["分类"] == 分类],
        }
    return {"总数": len(菜品数据库), "数据": list(菜品数据库.values())}


# ---------- READ ONE（查询单个）
@厨房.get("/菜品/{菜品编号}")
def 获取单个菜品(菜品编号: int):
    """
    GET /菜品/1
    """
    if 菜品编号 not in 菜品数据库:
        raise HTTPException(status_code=404, detail=f"菜品 {菜品编号} 不存在")
    return 菜品数据库[菜品编号]


# ---------- UPDATE（更新）
@厨房.put("/菜品/{菜品编号}")
def 更新菜品(菜品编号: int, 菜品: 菜品输入):
    """
    PUT /菜品/1
    Body: {"名称": "新宫保鸡丁", "价格": 42.0}
    """
    if 菜品编号 not in 菜品数据库:
        raise HTTPException(status_code=404, detail=f"菜品 {菜品编号} 不存在")
    菜品数据库[菜品编号] = {
        "编号": 菜品编号,
        **菜品.model_dump(),
    }
    return {"消息": "更新成功", "数据": 菜品数据库[菜品编号]}


# ---------- DELETE（删除）
@厨房.delete("/菜品/{菜品编号}", status_code=204)
def 删除菜品(菜品编号: int):
    """
    DELETE /菜品/1
    """
    if 菜品编号 not in 菜品数据库:
        raise HTTPException(status_code=404, detail=f"菜品 {菜品编号} 不存在")
    del 菜品数据库[菜品编号]
    # 204 状态码不需要返回内容
~~~

启动并测试：

~~~bash
uvicorn demo2_crud:厨房 --reload --port 8000

# 然后打开 http://127.0.0.1:8000/docs
# 点击每个接口的 "Try it out" 按钮，在线测试：
# 1. POST /菜品 → 创建几道菜
# 2. GET /菜品 → 查看全部
# 3. GET /菜品/1 → 查看单个
# 4. PUT /菜品/1 → 修改价格
# 5. DELETE /菜品/1 → 删除
~~~

**Demo 2 学完你应该掌握：**
- `FastAPI()` 创建应用，`@厨房.get/post/put/delete` 定义路由
- 路径参数 `/{id}` 自动校验类型，查询参数用函数参数+默认值
- `BaseModel` 定义请求体结构，`HTTPException` 返回错误码
- `return 字典` 自动转 JSON 响应
- `/docs` 自动生成 Swagger 文档可以在线测试

---

## Demo 3：Pydantic 校验 — 给 API 加上类型守卫

### 学习目标

- 用 Pydantic 定义数据模型，自动校验请求数据
- 理解 Field 约束、嵌套模型、自定义校验器

### 3.1 Pydantic 基础

创建文件 `demo3_pydantic.py`：

~~~python
# ========== demo3_pydantic.py
# Pydantic 就是后端版的 Zod + TypeScript 类型守卫
# 定义一个模型，自动校验输入数据，不合法直接报错

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Literal

# ---------- 基础模型（类似 TypeScript interface）
class 菜品模型(BaseModel):
    # Field(..., ) 的第一个参数 ... 表示必填（类似 TS 没有 ? 标记）
    名称: str = Field(
        ...,                     # 必填
        min_length=1,            # 最少1个字符
        max_length=50,           # 最多50个字符
        description="菜品名称",  # 会显示在 Swagger 文档中
    )
    价格: float = Field(
        ...,                     # 必填
        gt=0,                    # greater than 0，必须 > 0
        description="菜品价格",
    )
    分类: str = Field(
        default="主食",          # 有默认值就是可选的
        description="菜品分类",
    )
    辣度: int = Field(
        default=0,
        ge=0,                    # greater or equal，>= 0
        le=5,                    # less or equal，<= 5
        description="辣度 0-5",
    )
    食材: list[str] = Field(
        default_factory=list,    # 默认值用工厂函数（列表是可变对象，不能直接 default=[]）
        description="食材列表",
    )

    # 自定义校验器（类似 Zod 的 .refine()）
    @field_validator("名称")
    @classmethod
    def 名称校验(cls, 值: str) -> str:
        敏感词 = ["<", ">", "script", "drop table"]
        for 词 in 敏感词:
            if 词 in 值.lower():
                raise ValueError(f"名称不能包含敏感词: {词}")
        return 值.strip()  # 去掉首尾空格


# ---------- 测试合法数据
合法菜品 = 菜品模型(名称="宫保鸡丁", 价格=38.5, 辣度=3, 食材=["鸡肉", "花生"])
print(f"合法菜品: {合法菜品}")
# 输出 ✅ 合法菜品: 名称='宫保鸡丁' 价格=38.5 分类='主食' 辣度=3 食材=['鸡肉', '花生']

# .model_dump() 转字典（类似 JSON.parse 后的结果）
字典 = 合法菜品.model_dump()
print(f"转字典: {字典}")
# 输出 ✅ 转字典: {'名称': '宫保鸡丁', '价格': 38.5, '分类': '主食', '辣度': 3, '食材': ['鸡肉', '花生']}

# .model_dump_json() 转 JSON 字符串
JSON字符串 = 合法菜品.model_dump_json(ensure_ascii=False)
print(f"转JSON: {JSON字符串}")


# ---------- 测试不合法数据
print("\n--- 测试不合法数据 ---")

# 价格为负数
try:
    菜品模型(名称="测试菜", 价格=-5)
except Exception as e:
    print(f"❌ 价格校验失败: {e}")

# 辣度超范围
try:
    菜品模型(名称="测试菜", 价格=10, 辣度=10)
except Exception as e:
    print(f"❌ 辣度校验失败: {e}")

# 名称为空
try:
    菜品模型(名称="", 价格=10)
except Exception as e:
    print(f"❌ 名称校验失败: {e}")

# 名称包含敏感词
try:
    菜品模型(名称="drop table 菜品", 价格=10)
except Exception as e:
    print(f"❌ 敏感词校验失败: {e}")


# ---------- 嵌套模型（类似 TS 的嵌套 interface）
class 营养信息(BaseModel):
    卡路里: float = Field(..., ge=0)
    蛋白质: float = Field(..., ge=0)
    碳水: float = Field(..., ge=0)

class 完整菜品(BaseModel):
    基本信息: 菜品模型              # 嵌套模型
    营养: 营养信息 | None = None    # 可选嵌套

完整 = 完整菜品(
    基本信息={"名称": "宫保鸡丁", "价格": 38.5},
    营养={"卡路里": 350, "蛋白质": 25, "碳水": 15},
)
print(f"\n完整菜品: {完整.model_dump()}")
# 输出 ✅ 嵌套的完整字典结构


# ---------- Literal 限定值（类似 TS 的联合字面量类型）
class 订单创建(BaseModel):
    桌号: int = Field(..., ge=1, le=100)
    支付方式: Literal["现金", "微信", "支付宝"] = "微信"   # 只能是这三个值

合法订单 = 订单创建(桌号=5, 支付方式="微信")
print(f"\n合法订单: {合法订单.model_dump()}")

try:
    订单创建(桌号=5, 支付方式="比特币")
except Exception as e:
    print(f"❌ 支付方式校验失败: {e}")
~~~

运行验证：

~~~bash
python3 demo3_pydantic.py
# 确认所有校验都按预期工作
~~~

### 3.2 在 FastAPI 中使用 Pydantic

创建文件 `demo3_带校验的API.py`：

~~~python
# ========== demo3_带校验的API.py

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime

厨房 = FastAPI(title="带校验的菜品API")

# ---------- 请求模型（前端发过来的数据）
class 创建菜品请求(BaseModel):
    名称: str = Field(..., min_length=1, max_length=50)
    价格: float = Field(..., gt=0)
    分类: Literal["热菜", "凉菜", "主食", "饮品"] = "主食"
    辣度: int = Field(default=0, ge=0, le=5)
    食材: list[str] = Field(default_factory=list)

class 创建订单请求(BaseModel):
    桌号: int = Field(..., ge=1, le=100)
    菜品列表: list[dict] = Field(..., min_length=1)  # 至少点一道菜
    支付方式: Literal["现金", "微信", "支付宝"] = "微信"


# ---------- 响应模型（返回给前端的数据）——可以和请求模型不同
class 菜品响应(BaseModel):
    编号: int
    名称: str
    价格: float
    分类: str
    辣度: int
    创建时间: str


# ---------- 模拟数据库
菜品数据库: dict[int, dict] = {}
自增编号: int = 0

@厨房.post("/菜品", response_model=菜品响应, status_code=201)
def 创建菜品(请求: 创建菜品请求):
    global 自增编号
    自增编号 += 1
    数据 = {
        "编号": 自增编号,
        **请求.model_dump(),
        "创建时间": datetime.now().isoformat(),
    }
    菜品数据库[自增编号] = 数据
    return 数据    # 会被 response_model 自动过滤，只返回响应模型中定义的字段

@厨房.get("/菜品", response_model=list[菜品响应])
def 获取菜品列表(
    分类: str | None = Query(default=None, description="按分类筛选"),
    最低价: float = Query(default=0, ge=0, description="最低价格"),
    最高价: float = Query(default=999, ge=0, description="最高价格"),
):
    结果 = list(菜品数据库.values())
    if 分类:
        结果 = [菜 for 菜 in 结果 if 菜["分类"] == 分类]
    结果 = [菜 for 菜 in 结果 if 最低价 <= 菜["价格"] <= 最高价]
    return 结果
~~~

启动并测试：

~~~bash
uvicorn demo3_带校验的API:厨房 --reload --port 8000

# 打开 http://127.0.0.1:8000/docs
# 试一下：
# 1. POST /菜品 → 正常数据 → 201 创建成功
# 2. POST /菜品 → 价格填 -5 → 422 校验失败，自动返回错误详情
# 3. POST /菜品 → 分类填 "火锅" → 422 只允许 热菜/凉菜/主食/饮品
# 4. GET /菜品?分类=热菜&最低价=20 → 按条件筛选
~~~

**Demo 3 学完你应该掌握：**
- `BaseModel` 定义数据模型，字段类型注解就是校验规则
- `Field()` 设置长度、范围、默认值、描述
- `field_validator` 自定义校验逻辑
- `Literal["A", "B"]` 限定只能选某些值
- `response_model` 控制返回数据的结构
- 不合法数据自动返回 422 + 详细错误信息，前端不用写 try-catch

---

## Demo 4：依赖注入与中间件 — 给 API 加认证和跨域

### 学习目标

- 理解 FastAPI 的依赖注入机制（Depends）
- 配置 CORS 跨域中间件
- 写自定义中间件（请求计时、日志）
- 实现简单的 Token 认证

### 4.1 CORS 中间件

创建文件 `demo4_中间件.py`：

~~~python
# ========== demo4_中间件.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

厨房 = FastAPI(title="中间件演示")

# ---------- CORS 跨域配置（前端最常遇到的问题）
# 就像 Express 的 cors 包：app.use(cors({ origin: [...] }))
厨房.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # React 开发服务器
        "http://localhost:5173",    # Vite 开发服务器
        "https://你的域名.com",     # 生产环境
    ],
    allow_credentials=True,    # 允许携带 Cookie
    allow_methods=["*"],       # 允许所有 HTTP 方法
    allow_headers=["*"],       # 允许所有请求头
)

# ---------- 自定义中间件：请求计时
# 类似 Express 的中间件：app.use((req, res, next) => { ... })
@厨房.middleware("http")
async def 请求计时中间件(请求: Request, 调用下一个处理函数):
    # 1. 请求进入时记录时间
    开始时间 = time.time()

    # 2. 继续执行后续处理（路由函数等）
    响应 = await 调用下一个处理函数(请求)

    # 3. 请求处理完后计算耗时
    耗时毫秒 = round((time.time() - 开始时间) * 1000, 2)

    # 4. 在响应头中添加自定义信息
    响应.headers["X-Process-Time"] = f"{耗时毫秒}ms"

    # 5. 打印日志
    print(f"[{请求.method}] {请求.url.path} → {耗时毫秒}ms")

    return 响应


# 测试路由
@厨房.get("/")
def 首页():
    return {"消息": "首页"}

@厨房.get("/慢接口")
def 慢接口():
    import time
    time.sleep(1)  # 模拟耗时操作
    return {"消息": "完成"}
~~~

启动并测试：

~~~bash
uvicorn demo4_中间件:厨房 --reload --port 8000

# 访问 http://127.0.0.1:8000/慢接口
# 查看浏览器开发者工具 → 网络 → 响应头中可以看到 X-Process-Time: 1000.xx ms
# 终端会打印日志：[GET] /慢接口 → 1000.xx ms
~~~

### 4.2 依赖注入（Depends）

在 `demo4_中间件.py` 中继续添加：

~~~python
from fastapi import Depends, Header, HTTPException, Query
from typing import Annotated

# ========== 依赖注入 = "在路由执行之前，先执行这个函数，把结果传进来"
# 就像 Vue 的 provide/inject
# 就像 Express 把 db 连接挂在 req 上：app.use((req, res, next) => { req.db = ... })

# ---------- 依赖函数 1：从请求头获取并验证用户
def 获取当前用户(authorization: str = Header(...)):
    """
    Header(...) 表示这个参数从 HTTP 请求头中获取
    ... 表示必传，不传就返回 422
    """
    # 校验格式
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="格式错误，需要 Bearer Token",
        )

    token = authorization.replace("Bearer ", "")

    # 简单的 Token 校验（实际项目中应该解析 JWT）
    用户数据库 = {
        "admin-token-123": {"用户名": "张三", "角色": "管理员"},
        "user-token-456":  {"用户名": "李四", "角色": "服务员"},
    }

    if token not in 用户数据库:
        raise HTTPException(status_code=401, detail="Token 无效或已过期")

    return 用户数据库[token]


# ---------- 依赖函数 2：分页参数（可复用的通用逻辑）
class 分页参数:
    def __init__(
        self,
        页码: int = Query(1, ge=1, description="页码"),
        每页数量: int = Query(10, ge=1, le=100, description="每页数量"),
    ):
        self.页码 = 页码
        self.每页数量 = 每页数量
        self.偏移量 = (页码 - 1) * 每页数量


# ---------- 使用依赖的路由
@厨房.get("/我的信息")
def 获取我的信息(
    当前用户: dict = Depends(获取当前用户),   # 注入用户信息
):
    """
    GET /我的信息
    Header: Authorization: Bearer admin-token-123
    """
    return {
        "欢迎": f"你好，{当前用户['用户名']}",
        "角色": 当前用户["角色"],
    }


@厨房.get("/菜品")
def 获取菜品列表(
    分页: Annotated[分页参数, Depends()],  # 注入分页参数
):
    """
    GET /菜品?页码=2&每页数量=5
    """
    return {
        "页码": 分页.页码,
        "每页": 分页.每页数量,
        "偏移量": 分页.偏移量,
        "数据": f"这里是第{分页.页码}页的菜品数据...",
    }


# ---------- 依赖嵌套：权限检查依赖于用户认证
def 需要管理员权限(当前用户: dict = Depends(获取当前用户)):
    """这个依赖依赖了另一个依赖"""
    if 当前用户["角色"] != "管理员":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return 当前用户


@厨房.delete("/菜品/{菜品编号}")
def 删除菜品(
    菜品编号: int,
    管理员: dict = Depends(需要管理员权限),  # 需要管理员才能删除
):
    return {"消息": f"管理员 {管理员['用户名']} 删除了菜品 {菜品编号}"}
~~~

启动并测试：

~~~bash
uvicorn demo4_中间件:厨房 --reload --port 8000

# 打开 http://127.0.0.1:8000/docs
#
# 测试 1：获取我的信息
#   → 点击 /我的信息 → 点 "Try it out"
#   → 在 authorization 输入框填: Bearer admin-token-123
#   → 点 Execute → 200 成功
#
# 测试 2：用无效 Token
#   → authorization 填: Bearer wrong-token
#   → 401 Token 无效
#
# 测试 3：不填 Token
#   → 422 缺少必填参数
#
# 测试 4：服务员删除菜品
#   → authorization 填: Bearer user-token-456
#   → 403 需要管理员权限
#
# 测试 5：管理员删除菜品
#   → authorization 填: Bearer admin-token-123
#   → 200 成功
~~~

**Demo 4 学完你应该掌握：**
- `add_middleware(CORSMiddleware, ...)` 配置跨域
- `@厨房.middleware("http")` 写自定义中间件（洋葱模型）
- `Depends(函数名)` 做依赖注入，等价于 "在路由前执行这个函数"
- 依赖可以嵌套：A 依赖 B，FastAPI 自动按顺序解析
- `Annotated[类型, Depends()]` 是更现代的写法
- `Header(...)` 从请求头获取参数，`Query(...)` 从查询参数获取

---

## Demo 5：SQLAlchemy 数据库 — 把数据存到 PostgreSQL

### 学习目标

- 理解 ORM 的概念（用对象操作数据库）
- 安装并配置 PostgreSQL + SQLAlchemy
- 定义数据模型，执行 CRUD 操作
- 实现表之间的关联关系

### 5.1 安装 PostgreSQL

**macOS：**

~~~bash
brew install postgresql@16
brew services start postgresql@16

# 创建数据库
createdb 餐厅数据库
~~~

**Windows：**

~~~
1. 下载安装 https://www.postgresql.org/download/windows/
2. 安装时记住密码
3. 打开 pgAdmin 或命令行
4. 执行: CREATE DATABASE 餐厅数据库;
~~~

**或者用 Docker（推荐，最简单）：**

~~~bash
docker run -d \
  --name 餐厅数据库 \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=餐厅数据库 \
  -p 5432:5432 \
  postgres:16
~~~

### 5.2 数据库配置

创建文件 `demo5_database.py`（数据库连接）：

~~~python
# ========== demo5_database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# ---------- 数据库连接地址
# 格式：postgresql://用户名:密码@地址:端口/数据库名
数据库地址 = "postgresql://postgres:password@localhost:5432/餐厅数据库"

# 创建引擎（数据库的"插座"，连接数据库用的）
引擎 = create_engine(
    数据库地址,
    echo=True,  # 打印每条 SQL 语句（学习用，生产环境关掉）
)

# 创建会话工厂（每次需要操作数据库时，从工厂拿一个"会话"）
会话工厂 = sessionmaker(bind=引擎)

# 模型基类（所有数据表模型都要继承它）
class 模型基类(DeclarativeBase):
    pass

# FastAPI 的依赖函数：获取数据库会话
def 获取数据库会话():
    """每次请求创建一个会话，请求结束后自动关闭"""
    会话 = 会话工厂()
    try:
        yield 会话      # yield 使这个函数成为"生成器依赖"
    finally:
        会话.close()    # 无论成功失败，都关闭会话
~~~

### 5.3 定义数据模型

创建文件 `demo5_models.py`（数据表定义）：

~~~python
# ========== demo5_models.py
# 每个类对应数据库中的一张表，每个属性对应表中的一个字段
# 就像 TypeScript 的 interface，但这个是真正的数据库表

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from demo5_database import 模型基类


class 菜品表(模型基类):
    __tablename__ = "菜品"    # 对应数据库中的表名

    # 字段定义（Column 就是表的列）
    编号 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # primary_key=True  → 主键
    # index=True        → 建索引（加快查询）
    # autoincrement=True → 自增

    名称 = Column(String(50), unique=True, nullable=False, index=True)
    # String(50)   → 最长50字符的字符串
    # unique=True  → 唯一约束（不能重复）
    # nullable=False → 不能为空

    价格 = Column(Float, nullable=False)
    分类 = Column(String(20), default="主食")
    辣度 = Column(Integer, default=0)
    描述 = Column(Text, default="")
    创建时间 = Column(DateTime, default=datetime.now)

    # 关联关系：一道菜可以出现在多个订单项中
    # 就像数据库的外键关联，但 ORM 让你用对象.属性的方式访问
    订单项列表 = relationship("订单项表", back_populates="菜品")

    def __repr__(self):
        return f"<菜品 [{self.编号}] {self.名称} ¥{self.价格}>"


class 订单表(模型基类):
    __tablename__ = "订单"

    编号 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    桌号 = Column(Integer, nullable=False)
    总价 = Column(Float, default=0)
    状态 = Column(String(20), default="待处理")
    创建时间 = Column(DateTime, default=datetime.now)

    # 关联：一个订单包含多个订单项
    订单项列表 = relationship("订单项表", back_populates="订单", cascade="all, delete-orphan")
    # cascade="all, delete-orphan" → 删除订单时，自动删除关联的订单项


class 订单项表(模型基类):
    __tablename__ = "订单项"

    编号 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    订单编号 = Column(Integer, ForeignKey("订单.编号"), nullable=False)
    # ForeignKey("订单.编号") → 外键，关联到"订单"表的"编号"字段

    菜品编号 = Column(Integer, ForeignKey("菜品.编号"), nullable=False)
    数量 = Column(Integer, nullable=False, default=1)
    备注 = Column(String(100), default="")

    # 反向关联
    订单 = relationship("订单表", back_populates="订单项列表")
    菜品 = relationship("菜品表", back_populates="订单项列表")

    def __repr__(self):
        return f"<订单项 菜品{self.菜品编号} x{self.数量}>"
~~~

### 5.4 创建表并执行 CRUD

创建文件 `demo5_crud.py`（把所有部分组合起来）：

~~~python
# ========== demo5_crud.py

from demo5_database import 引擎, 模型基类, 获取数据库会话
from demo5_models import 菜品表, 订单表, 订单项表
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Literal

# ---------- 第一步：创建所有表（只需运行一次）
# 就像执行 CREATE TABLE SQL 语句
模型基类.metadata.create_all(引擎)
print("✅ 数据库表创建完成")


# ---------- 创建 FastAPI 应用
厨房 = FastAPI(title="餐厅数据库API")


# ---------- Pydantic 请求/响应模型
class 创建菜品请求(BaseModel):
    名称: str = Field(..., min_length=1, max_length=50)
    价格: float = Field(..., gt=0)
    分类: Literal["热菜", "凉菜", "主食", "饮品"] = "主食"
    辣度: int = Field(default=0, ge=0, le=5)
    描述: str = ""

class 菜品响应(BaseModel):
    编号: int
    名称: str
    价格: float
    分类: str
    辣度: int
    描述: str

    class Config:
        from_attributes = True   # 允许从 ORM 对象创建（重要！）

class 创建订单请求(BaseModel):
    桌号: int = Field(..., ge=1, le=100)
    支付方式: Literal["现金", "微信", "支付宝"] = "微信"


# ========== CRUD 接口

# ---------- CREATE（创建菜品）
@厨房.post("/菜品", response_model=菜品响应, status_code=201)
def 创建菜品(请求: 创建菜品请求, 数据库: Session = Depends(获取数据库会话)):
    # 1. 创建 ORM 对象（类似 const item = new Model(data)）
    新菜品 = 菜品表(**请求.model_dump())
    # **请求.model_dump() 展开字典为关键字参数
    # 等价于：菜品表(名称="宫保鸡丁", 价格=38.5, ...)

    # 2. 添加到会话（暂存，还没存到数据库）
    数据库.add(新菜品)

    # 3. 提交（真正执行 INSERT SQL）
    数据库.commit()

    # 4. 刷新（获取数据库生成的自增编号等）
    数据库.refresh(新菜品)

    return 新菜品


# ---------- READ ALL（查询全部）
@厨房.get("/菜品", response_model=list[菜品响应])
def 获取菜品列表(
    分类: str | None = None,
    最低价: float = 0,
    最高价: float = 999,
    数据库: Session = Depends(获取数据库会话),
):
    查询 = 数据库.query(菜品表)   # 开始查询 ≈ SELECT * FROM 菜品

    if 分类:
        查询 = 查询.filter(菜品表.分类 == 分类)  # 添加 WHERE 条件

    查询 = 查询.filter(菜品表.价格 >= 最低价, 菜品表.价格 <= 最高价)

    return 查询.all()  # 执行查询，返回所有结果


# ---------- READ ONE（查询单个）
@厨房.get("/菜品/{菜品编号}", response_model=菜品响应)
def 获取单个菜品(菜品编号: int, 数据库: Session = Depends(获取数据库会话)):
    菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 菜品编号).first()
    # .filter() ≈ WHERE
    # .first()  ≈ LIMIT 1，返回第一条或 None

    if not 菜品:
        raise HTTPException(status_code=404, detail=f"菜品 {菜品编号} 不存在")
    return 菜品


# ---------- UPDATE（更新）
@厨房.put("/菜品/{菜品编号}", response_model=菜品响应)
def 更新菜品(
    菜品编号: int,
    请求: 创建菜品请求,
    数据库: Session = Depends(获取数据库会话),
):
    菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 菜品编号).first()
    if not 菜品:
        raise HTTPException(status_code=404, detail=f"菜品 {菜品编号} 不存在")

    # 逐个字段更新
    for 字段名, 值 in 请求.model_dump().items():
        setattr(菜品, 字段名, 值)  # setattr(obj, "名称", "新名称") ≈ obj.名称 = "新名称"

    数据库.commit()
    数据库.refresh(菜品)
    return 菜品


# ---------- DELETE（删除）
@厨房.delete("/菜品/{菜品编号}", status_code=204)
def 删除菜品(菜品编号: int, 数据库: Session = Depends(获取数据库会话)):
    菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 菜品编号).first()
    if not 菜品:
        raise HTTPException(status_code=404, detail=f"菜品 {菜品编号} 不存在")

    数据库.delete(菜品)
    数据库.commit()


# ========== 创建订单（关联查询）
@厨房.post("/订单", status_code=201)
def 创建订单(
    请求: 创建订单请求,
    菜品列表: list[dict],   # [{"菜品编号": 1, "数量": 2}, ...]
    数据库: Session = Depends(获取数据库会话),
):
    # 1. 创建订单
    新订单 = 订单表(桌号=请求.桌号)
    数据库.add(新订单)
    数据库.flush()  # flush 获取自增编号，但不 commit

    # 2. 创建订单项
    总价 = 0
    for 项 in 菜品列表:
        菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 项["菜品编号"]).first()
        if not 菜品:
            raise HTTPException(status_code=400, detail=f"菜品 {项['菜品编号']} 不存在")

        订单项 = 订单项表(
            订单编号=新订单.编号,
            菜品编号=菜品.编号,
            数量=项.get("数量", 1),
            备注=项.get("备注", ""),
        )
        数据库.add(订单项)
        总价 += 菜品.价格 * 项.get("数量", 1)

    # 3. 更新订单总价
    新订单.总价 = round(总价, 2)

    # 4. 提交
    数据库.commit()
    数据库.refresh(新订单)

    return {
        "订单编号": 新订单.编号,
        "桌号": 新订单.桌号,
        "总价": 新订单.总价,
        "状态": 新订单.状态,
    }


# ========== 查询订单详情（通过 relationship 访问关联数据）
@厨房.get("/订单/{订单编号}")
def 获取订单详情(订单编号: int, 数据库: Session = Depends(获取数据库会话)):
    订单 = 数据库.query(订单表).filter(订单表.编号 == 订单编号).first()
    if not 订单:
        raise HTTPException(status_code=404, detail="订单不存在")

    # 通过 relationship 自动获取关联的订单项
    明细 = []
    for 项 in 订单.订单项列表:
        明细.append({
            "菜品": 项.菜品.名称,        # 订单项 → 菜品（通过 relationship）
            "单价": 项.菜品.价格,
            "数量": 项.数量,
            "小计": round(项.菜品.价格 * 项.数量, 2),
            "备注": 项.备注,
        })

    return {
        "订单编号": 订单.编号,
        "桌号": 订单.桌号,
        "总价": 订单.总价,
        "状态": 订单.状态,
        "明细": 明细,
    }
~~~

启动并测试：

~~~bash
uvicorn demo5_crud:厨房 --reload --port 8000

# 打开 http://127.0.0.1:8000/docs
#
# 测试流程：
# 1. POST /菜品 → 创建几道菜（宫保鸡丁38.5, 鱼香肉丝28, 麻婆豆腐22）
# 2. GET /菜品 → 查看全部菜品
# 3. GET /菜品?分类=热菜 → 按分类筛选
# 4. PUT /菜品/1 → 修改宫保鸡丁的价格为 42
# 5. POST /订单 → 创建一个订单（带菜品列表）
# 6. GET /订单/1 → 查看订单详情（能看到关联的菜品名称和价格）
# 7. DELETE /菜品/1 → 删除菜品
~~~

**Demo 5 学完你应该掌握：**
- ORM 就是把数据库表映射成 Python 类，用对象操作代替 SQL
- `Column()` 定义字段，`relationship()` 定义表间关联
- `session.add()` 暂存 → `session.commit()` 提交
- `session.query(表).filter(条件).first()` 查询单条，`.all()` 查询全部
- `response_model` 配 `from_attributes = True` 让 ORM 对象自动转 JSON
- `ForeignKey` + `relationship` 实现关联查询（订单 → 订单项 → 菜品）

---

## Demo 6：SSE 流式输出 — 模拟 AI 逐字回答

### 学习目标

- 理解 SSE（Server-Sent Events）的工作原理
- 用 FastAPI 实现流式输出
- 前端用 EventSource 和 fetch 接收流式数据

### 6.1 后端：SSE 流式接口

创建文件 `demo6_sse.py`：

~~~python
# ========== demo6_sse.py
# SSE（Server-Sent Events）= 服务端单向推送数据给客户端
# AI 岗位的核心交互方式：AI 逐字输出回答，前端逐字显示

from fastapi import FastAPI
from fastapi.responses import StreamingResponse, HTMLResponse
import asyncio
import json
import time

厨房 = FastAPI(title="SSE 流式输出演示")


# ========== 生成器函数（async + yield = 流式输出）
async def 模拟AI逐字回答(问题: str):
    """
    这个函数用 yield 逐个"吐出"数据
    每次 yield 一个数据块，前端就收到一个数据块
    就像水龙头一滴一滴出水
    """
    # 模拟 AI 的回答
    回答 = (
        f"你问的是"{问题}"，这是一个很好的问题！\n\n"
        f"Python 和 JavaScript 都是非常流行的编程语言。"
        f"Python 在数据科学和 AI 领域占主导地位，"
        f"而 JavaScript 在 Web 开发领域无可替代。"
        f"作为前端开发者，学习 Python 可以让你拓展到 AI 应用开发领域。"
    )

    # 逐字输出
    for 字符 in 回答:
        数据块 = json.dumps(
            {"类型": "内容", "字符": 字符, "时间戳": time.time()},
            ensure_ascii=False,
        )
        # SSE 格式：每条消息以 "data: " 开头，以 "\n\n" 结尾
        yield f"data: {数据块}\n\n"
        await asyncio.sleep(0.03)  # 每个字符间隔 30ms（模拟打字效果）

    # 发送完成信号
    完成数据 = json.dumps({"类型": "完成", "总字符数": len(回答)}, ensure_ascii=False)
    yield f"data: {完成数据}\n\n"


@厨房.get("/聊天")
async def 流式聊天接口(问题: str = "Python好学吗"):
    """
    SSE 接口：前端用 EventSource 或 fetch 接收
    """
    return StreamingResponse(
        模拟AI逐字回答(问题),
        media_type="text/event-stream",    # SSE 的媒体类型
        headers={
            "Cache-Control": "no-cache",       # 禁用缓存
            "Connection": "keep-alive",         # 保持连接
            "X-Accel-Buffering": "no",          # Nginx 禁用缓冲（如果用了 Nginx 反向代理）
        },
    )


# ========== 带进度的流式输出示例
async def 生成报告流(任务名称: str):
    """模拟一个耗时任务的进度报告"""
    步骤列表 = [
        "正在初始化...",
        "正在连接数据库...",
        "正在查询数据...",
        "正在计算统计...",
        "正在生成图表...",
        "正在导出报告...",
        "完成！",
    ]

    for 序号, 描述 in enumerate(步骤列表, 1):
        进度 = round(序号 / len(步骤列表) * 100)
        yield f"data: {json.dumps({'任务': 任务名称, '步骤': 序号, '总步骤': len(步骤列表), '进度': 进度, '描述': 描述}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(1)  # 每步模拟耗时1秒


@厨房.get("/报告/{任务名称}")
async def 获取报告流(任务名称: str):
    return StreamingResponse(
        生成报告流(任务名称),
        media_type="text/event-stream",
    )


# ========== 内置测试页面（可以直接在浏览器中看到效果）
@厨房.get("/测试页面", response_class=HTMLResponse)
def 测试页面():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>SSE 测试</title>
        <style>
            body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
            #输出框 { background: #1a1a2e; color: #0f0; padding: 20px; border-radius: 8px;
                      min-height: 200px; font-size: 16px; line-height: 1.8; white-space: pre-wrap; }
            button { padding: 10px 20px; margin: 10px 10px 10px 0; font-size: 16px; cursor: pointer;
                     background: #4361ee; color: white; border: none; border-radius: 6px; }
            button:hover { background: #3a56d4; }
            input { padding: 10px; font-size: 16px; width: 400px; }
        </style>
    </head>
    <body>
        <h1>SSE 流式输出测试</h1>
        <input id="问题输入" type="text" placeholder="输入问题..." value="Python好学吗">
        <button onclick="开始聊天()">发送问题</button>
        <button onclick="查看进度()">查看进度</button>
        <button onclick="清空()">清空</button>
        <div id="输出框"></div>

        <script>
            const 输出框 = document.getElementById('输出框');
            const 问题输入 = document.getElementById('问题输入');

            function 清空() { 输出框.textContent = ''; }

            // 方式1：EventSource（只能 GET）
            function 开始聊天() {
                清空();
                const 问题 = encodeURIComponent(问题输入.value);
                const source = new EventSource(`/聊天?问题=${问题}`);

                source.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    if (data.类型 === '完成') {
                        输出框.textContent += '\\n\\n--- 回答完毕 ---';
                        source.close();
                    } else {
                        输出框.textContent += data.字符;
                    }
                };

                source.onerror = function() {
                    输出框.textContent += '\\n[连接关闭]';
                    source.close();
                };
            }

            // 方式2：查看进度
            function 查看进度() {
                清空();
                const source = new EventSource('/报告/数据分析');

                source.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    const 进度条 = '█'.repeat(Math.floor(data.进度 / 5)) + '░'.repeat(20 - Math.floor(data.进度 / 5));
                    输出框.textContent = `任务: ${data.任务}\\n进度: [${进度条}] ${data.进度}%\\n步骤 ${data.步骤}/${data.总步骤}: ${data.描述}`;

                    if (data.进度 >= 100) {
                        source.close();
                    }
                };
            }
        </script>
    </body>
    </html>
    """
~~~

启动并测试：

~~~bash
uvicorn demo6_sse:厨房 --reload --port 8000

# 打开 http://127.0.0.1:8000/测试页面
# 1. 点击"发送问题" → 看到 AI 逐字输出（绿色文字在黑色背景上）
# 2. 点击"查看进度" → 看到进度条动画
# 3. 也可以直接访问 http://127.0.0.1:8000/聊天?问题=你好 看原始 SSE 数据
~~~

**Demo 6 学完你应该掌握：**
- `async def` + `yield` = 流式生成器
- `StreamingResponse(生成器, media_type="text/event-stream")` = SSE 响应
- SSE 格式：每条消息 `data: {JSON}\n\n`
- 前端用 `new EventSource(url)` 接收（只能 GET）
- 前端用 `fetch` + `ReadableStream` 接收（支持 POST）
- 必须设置 `Cache-Control: no-cache` 和 `X-Accel-Buffering: no`

---

## Demo 7：综合实战 — 把以上所有拼成完整项目

### 学习目标

- 把 Demo 2-6 的所有代码整合成一个结构清晰的完整项目
- 学会 FastAPI 的项目组织方式（路由拆分）
- 产出一个可以直接写在简历上的后端项目

### 7.1 项目结构

~~~
餐厅后端/
├── main.py              # 入口文件（启动用）
├── database.py          # 数据库配置
├── models.py            # 数据库模型（表定义）
├── schemas.py           # Pydantic 模型（请求/响应）
├── routers/
│   ├── __init__.py
│   ├── 菜品.py          # 菜品相关路由
│   ├── 订单.py          # 订单相关路由
│   └── 聊天.py          # SSE 聊天相关路由
├── dependencies.py      # 依赖注入函数
├── middleware.py         # 中间件
└── requirements.txt     # 依赖清单
~~~

### 7.2 逐个文件编写

**database.py：**

~~~python
# ========== database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

数据库地址 = "postgresql://postgres:password@localhost:5432/餐厅数据库"
引擎 = create_engine(数据库地址, echo=False)  # 生产环境关闭 SQL 打印
会话工厂 = sessionmaker(bind=引擎)

class 模型基类(DeclarativeBase):
    pass

def 获取数据库会话():
    会话 = 会话工厂()
    try:
        yield 会话
    finally:
        会话.close()
~~~

**models.py：**

~~~python
# ========== models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import 模型基类

class 菜品表(模型基类):
    __tablename__ = "菜品"
    编号 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    名称 = Column(String(50), unique=True, nullable=False, index=True)
    价格 = Column(Float, nullable=False)
    分类 = Column(String(20), default="主食")
    辣度 = Column(Integer, default=0)
    描述 = Column(Text, default="")
    创建时间 = Column(DateTime, default=datetime.now)
    订单项列表 = relationship("订单项表", back_populates="菜品")

class 订单表(模型基类):
    __tablename__ = "订单"
    编号 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    桌号 = Column(Integer, nullable=False)
    总价 = Column(Float, default=0)
    状态 = Column(String(20), default="待处理")
    创建时间 = Column(DateTime, default=datetime.now)
    订单项列表 = relationship("订单项表", back_populates="订单", cascade="all, delete-orphan")

class 订单项表(模型基类):
    __tablename__ = "订单项"
    编号 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    订单编号 = Column(Integer, ForeignKey("订单.编号"), nullable=False)
    菜品编号 = Column(Integer, ForeignKey("菜品.编号"), nullable=False)
    数量 = Column(Integer, nullable=False, default=1)
    备注 = Column(String(100), default="")
    订单 = relationship("订单表", back_populates="订单项列表")
    菜品 = relationship("菜品表", back_populates="订单项列表")
~~~

**schemas.py：**

~~~python
# ========== schemas.py
from pydantic import BaseModel, Field
from typing import Literal

# ---------- 菜品
class 创建菜品请求(BaseModel):
    名称: str = Field(..., min_length=1, max_length=50)
    价格: float = Field(..., gt=0)
    分类: Literal["热菜", "凉菜", "主食", "饮品"] = "主食"
    辣度: int = Field(default=0, ge=0, le=5)
    描述: str = ""

class 菜品响应(BaseModel):
    编号: int
    名称: str
    价格: float
    分类: str
    辣度: int
    描述: str
    class Config:
        from_attributes = True

# ---------- 订单
class 创建订单请求(BaseModel):
    桌号: int = Field(..., ge=1, le=100)
    支付方式: Literal["现金", "微信", "支付宝"] = "微信"

class 订单项输入(BaseModel):
    菜品编号: int = Field(..., gt=0)
    数量: int = Field(default=1, ge=1, le=99)
    备注: str = ""
~~~

**dependencies.py：**

~~~python
# ========== dependencies.py
from fastapi import Header, HTTPException, Depends, Query
from typing import Annotated

def 获取当前用户(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="格式错误")
    token = authorization.replace("Bearer ", "")
    用户数据库 = {
        "admin-token": {"用户名": "张三", "角色": "管理员"},
        "user-token":  {"用户名": "李四", "角色": "服务员"},
    }
    if token not in 用户数据库:
        raise HTTPException(status_code=401, detail="Token 无效")
    return 用户数据库[token]

def 需要管理员(当前用户: dict = Depends(获取当前用户)):
    if 当前用户["角色"] != "管理员":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return 当前用户

class 分页参数:
    def __init__(
        self,
        页码: int = Query(1, ge=1),
        每页数量: int = Query(10, ge=1, le=100),
    ):
        self.页码 = 页码
        self.每页数量 = 每页数量
        self.偏移量 = (页码 - 1) * 每页数量
~~~

**middleware.py：**

~~~python
# ========== middleware.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

def 配置中间件(应用: FastAPI):
    # CORS
    应用.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 请求计时
    @应用.middleware("http")
    async def 计时(请求: Request, 下一步):
        开始 = time.time()
        响应 = await 下一步(请求)
        耗时 = round((time.time() - 开始) * 1000, 2)
        响应.headers["X-Process-Time"] = f"{耗时}ms"
        print(f"[{请求.method}] {请求.url.path} → {耗时}ms")
        return 响应
~~~

**routers/__init__.py：**

~~~python
# ========== routers/__init__.py
# 空文件，让 Python 把 routers 当作包
~~~

**routers/菜品.py：**

~~~python
# ========== routers/菜品.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import 获取数据库会话
from models import 菜品表
from schemas import 创建菜品请求, 菜品响应
from dependencies import 需要管理员, 分页参数
from typing import Annotated

# APIRouter 就是"子路由器"，类似 Express 的 Router()
路由器 = APIRouter(prefix="/菜品", tags=["菜品管理"])

@路由器.post("", response_model=菜品响应, status_code=201)
def 创建菜品(请求: 创建菜品请求, 数据库: Session = Depends(获取数据库会话)):
    新菜品 = 菜品表(**请求.model_dump())
    数据库.add(新菜品)
    数据库.commit()
    数据库.refresh(新菜品)
    return 新菜品

@路由器.get("", response_model=list[菜品响应])
def 获取菜品列表(
    分页: Annotated[分页参数, Depends()],
    分类: str | None = None,
    数据库: Session = Depends(获取数据库会话),
):
    查询 = 数据库.query(菜品表)
    if 分类:
        查询 = 查询.filter(菜品表.分类 == 分类)
    return 查询.offset(分页.偏移量).limit(分页.每页数量).all()

@路由器.get("/{菜品编号}", response_model=菜品响应)
def 获取单个菜品(菜品编号: int, 数据库: Session = Depends(获取数据库会话)):
    菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 菜品编号).first()
    if not 菜品:
        raise HTTPException(status_code=404, detail="菜品不存在")
    return 菜品

@路由器.put("/{菜品编号}", response_model=菜品响应)
def 更新菜品(菜品编号: int, 请求: 创建菜品请求, 数据库: Session = Depends(获取数据库会话)):
    菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 菜品编号).first()
    if not 菜品:
        raise HTTPException(status_code=404, detail="菜品不存在")
    for 键, 值 in 请求.model_dump().items():
        setattr(菜品, 键, 值)
    数据库.commit()
    数据库.refresh(菜品)
    return 菜品

@路由器.delete("/{菜品编号}", status_code=204, dependencies=[Depends(需要管理员)])
def 删除菜品(菜品编号: int, 数据库: Session = Depends(获取数据库会话)):
    菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 菜品编号).first()
    if not 菜品:
        raise HTTPException(status_code=404, detail="菜品不存在")
    数据库.delete(菜品)
    数据库.commit()
~~~

**routers/订单.py：**

~~~python
# ========== routers/订单.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import 获取数据库会话
from models import 订单表, 订单项表, 菜品表
from schemas import 创建订单请求, 订单项输入

路由器 = APIRouter(prefix="/订单", tags=["订单管理"])

@路由器.post("", status_code=201)
def 创建订单(
    请求: 创建订单请求,
    菜品列表: list[订单项输入],
    数据库: Session = Depends(获取数据库会话),
):
    if not 菜品列表:
        raise HTTPException(status_code=400, detail="至少点一道菜")

    新订单 = 订单表(桌号=请求.桌号)
    数据库.add(新订单)
    数据库.flush()

    总价 = 0
    for 项 in 菜品列表:
        菜品 = 数据库.query(菜品表).filter(菜品表.编号 == 项.菜品编号).first()
        if not 菜品:
            raise HTTPException(status_code=400, detail=f"菜品 {项.菜品编号} 不存在")
        数据库.add(订单项表(订单编号=新订单.编号, 菜品编号=菜品.编号, 数量=项.数量, 备注=项.备注))
        总价 += 菜品.价格 * 项.数量

    新订单.总价 = round(总价, 2)
    数据库.commit()
    数据库.refresh(新订单)

    return {"订单编号": 新订单.编号, "总价": 新订单.总价, "状态": 新订单.状态}

@路由器.get("/{订单编号}")
def 获取订单详情(订单编号: int, 数据库: Session = Depends(获取数据库会话)):
    订单 = 数据库.query(订单表).filter(订单表.编号 == 订单编号).first()
    if not 订单:
        raise HTTPException(status_code=404, detail="订单不存在")

    明细 = []
    for 项 in 订单.订单项列表:
        明细.append({
            "菜品": 项.菜品.名称,
            "单价": 项.菜品.价格,
            "数量": 项.数量,
            "小计": round(项.菜品.价格 * 项.数量, 2),
            "备注": 项.备注,
        })

    return {
        "订单编号": 订单.编号,
        "桌号": 订单.桌号,
        "总价": 订单.总价,
        "状态": 订单.状态,
        "明细": 明细,
    }

@路由器.patch("/{订单编号}/状态")
def 更新订单状态(订单编号: int, 新状态: str, 数据库: Session = Depends(获取数据库会话)):
    订单 = 数据库.query(订单表).filter(订单表.编号 == 订单编号).first()
    if not 订单:
        raise HTTPException(status_code=404, detail="订单不存在")
    订单.状态 = 新状态
    数据库.commit()
    return {"消息": f"订单 {订单编号} 状态已更新为 {新状态}"}
~~~

**routers/聊天.py：**

~~~python
# ========== routers/聊天.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
import time

路由器 = APIRouter(tags=["AI聊天"])

async def 模拟AI回答(问题: str):
    回答 = f"关于"{问题}"，我的回答是：Python 和 JavaScript 都是优秀的编程语言。作为前端开发者，学习 Python + FastAPI 可以帮助你进入 AI 应用开发领域，这是一个非常有前景的方向。"
    for 字符 in 回答:
        yield f"data: {json.dumps({'类型': '内容', '字符': 字符}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.03)
    yield f"data: {json.dumps({'类型': '完成'}, ensure_ascii=False)}\n\n"

@路由器.get("/聊天")
async def 流式聊天(问题: str = "你好"):
    return StreamingResponse(
        模拟AI回答(问题),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
~~~

**main.py（入口文件，把所有部分组装起来）：**

~~~python
# ========== main.py
from fastapi import FastAPI
from database import 引擎, 模型基类
from middleware import 配置中间件
from routers import 菜品, 订单, 聊天

# 1. 创建表
模型基类.metadata.create_all(引擎)

# 2. 创建应用
应用 = FastAPI(
    title="餐厅管理系统",
    description="一个完整的餐厅后端 API（FastAPI + SQLAlchemy + SSE）",
    version="1.0.0",
)

# 3. 配置中间件
配置中间件(应用)

# 4. 注册路由
应用.include_router(菜品.路由器)
应用.include_router(订单.路由器)
应用.include_router(聊天.路由器)

# 5. 首页
@应用.get("/")
def 首页():
    return {
        "名称": "餐厅管理系统 API",
        "文档": "/docs",
        "版本": "1.0.0",
    }

# 启动命令：
# uvicorn main:应用 --reload --port 8000
~~~

### 7.3 启动完整项目

~~~bash
# 确保 PostgreSQL 在运行
# 确保虚拟环境已激活
cd 餐厅后端

# 启动
uvicorn main:应用 --reload --port 8000

# 打开 http://127.0.0.1:8000/docs 查看完整 API 文档
~~~

### 7.4 完整测试流程

~~~bash
# 在另一个终端用 curl 测试（也可以在 Swagger UI /docs 中测试）

# 1. 创建菜品
curl -X POST http://127.0.0.1:8000/菜品 \
  -H "Content-Type: application/json" \
  -d '{"名称": "宫保鸡丁", "价格": 38.5, "分类": "热菜", "辣度": 3}'

curl -X POST http://127.0.0.1:8000/菜品 \
  -H "Content-Type: application/json" \
  -d '{"名称": "鱼香肉丝", "价格": 28.0, "分类": "热菜", "辣度": 1}'

curl -X POST http://127.0.0.1:8000/菜品 \
  -H "Content-Type: application/json" \
  -d '{"名称": "米饭", "价格": 3.0, "分类": "主食"}'

# 2. 查看所有菜品
curl http://127.0.0.1:8000/菜品

# 3. 创建订单
curl -X POST "http://127.0.0.1:8000/订单?桌号=5" \
  -H "Content-Type: application/json" \
  -d '[{"菜品编号": 1, "数量": 2}, {"菜品编号": 2, "数量": 1}, {"菜品编号": 3, "数量": 3}]'

# 4. 查看订单详情
curl http://127.0.0.1:8000/订单/1

# 5. 测试 SSE 流式聊天
curl -N "http://127.0.0.1:8000/聊天?问题=Python好学吗"
# -N 禁用缓冲，可以看到逐字输出的效果

# 6. 测试删除（需要管理员 Token）
curl -X DELETE http://127.0.0.1:8000/菜品/1 \
  -H "Authorization: Bearer admin-token"

# 7. 测试权限（普通用户不能删除）
curl -X DELETE http://127.0.0.1:8000/菜品/2 \
  -H "Authorization: Bearer user-token"
# 返回 403 需要管理员权限
~~~

---

## 高频面试题

### Q1：FastAPI 和 Express 最大的区别是什么？

~~~
1. 类型校验：FastAPI 用 Pydantic 自动校验请求数据（类似 Zod），Express 需要手动校验
2. 自动文档：FastAPI 自动生成 /docs Swagger 文档，Express 需要额外配置
3. 依赖注入：FastAPI 原生 Depends()，Express 没有原生支持
4. 性能：两者差不多，FastAPI 底层用 uvicorn（基于 uvloop），和 Node.js 性能相当
~~~

### Q2：ORM 的优缺点？

~~~
优点：
  - 不用写 SQL，面向对象操作
  - 自动防 SQL 注入
  - 换数据库只改连接地址
缺点：
  - 复杂查询不如原生 SQL 灵活
  - N+1 查询问题需要手动优化
  - 有学习成本
~~~

### Q3：SSE 和 WebSocket 怎么选？

~~~
SSE（Server-Sent Events）：
  - 单向：服务端 → 客户端
  - 基于 HTTP，断线自动重连
  - 适用：AI 流式输出、通知推送、进度报告

WebSocket：
  - 双向通信
  - 独立协议（ws://）
  - 适用：聊天室、游戏、协同编辑

AI 岗位首选 SSE，因为 AI 输出是单向的服务端推流。
~~~

### Q4：Pydantic 和 TypeScript + Zod 有什么区别？

~~~
核心区别：Pydantic 在 Python 服务端运行，Zod 在 JS/TS 运行时运行。

Pydantic 的优势：
  - FastAPI 请求到达时自动校验（Zod 需要手动 .parse()）
  - 支持 ORM 对象转换（from_attributes = True）
  - V2 版用 Rust 核心，性能极快

两者设计理念一样：定义 Schema → 自动校验 → 类型安全
~~~

### Q5：FastAPI 的依赖注入是怎么工作的？

~~~python
# Depends 的本质：
# 在请求到达路由函数之前，先执行依赖函数，把返回值传给路由函数

@厨房.get("/路径")
def 路由函数(用户 = Depends(获取用户), 数据库 = Depends(获取数据库)):
    # 请求到达时：
    #   1. 先执行 获取用户(authorization) → 返回用户信息
    #   2. 再执行 获取数据库() → 返回数据库会话
    #   3. 最后执行 路由函数(用户, 数据库)
    return {"用户": 用户, "数据": "..."}

# 依赖可以嵌套：A 依赖 B，B 依赖 C → FastAPI 自动解析依赖链
~~~

---

## 终极记忆卡片

1. **Python 基础** → 不用声明关键字，冒号缩进定代码块，None/True/False 首字母大写
2. **列表/字典** → list ≈ Array，dict ≈ Object，列表推导 `[x for x in l if 条件]` ≈ filter + map
3. **函数** → `def` 定义，`-> 返回类型` 写在后面，`*args` 收集元组，`**kwargs` 收集字典
4. **类** → `class` 定义，`self` ≈ `this`，`__init__` ≈ `constructor`
5. **FastAPI 路由** → `@厨房.get/post/put/delete` 定义，路径参数 `{id}`，查询参数用默认值
6. **Pydantic** → `BaseModel` 定义模型，`Field()` 设约束，不合法自动 422
7. **依赖注入** → `Depends(函数名)` 在路由前执行，`yield` 依赖请求后清理
8. **SQLAlchemy** → `Column` 定义字段，`relationship` 连表关系，`session.add` + `commit` 操作
9. **SSE 流式** → `async def` + `yield` 生成数据，`StreamingResponse` 包裹，前端 `EventSource` 接收
10. **项目结构** → `main.py` 入口 + `routers/` 路由拆分 + `models.py` 模型 + `schemas.py` 校验

---

## 启动命令速查

~~~bash
# ========== 环境
python3 -m venv .venv              # 创建虚拟环境
source .venv/bin/activate           # 激活（macOS/Linux）
pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic

# ========== 启动
uvicorn main:应用 --reload --port 8000

# ========== 文档
# Swagger UI:  http://127.0.0.1:8000/docs
# ReDoc:       http://127.0.0.1:8000/redoc

# ========== 依赖管理
pip freeze > requirements.txt       # 导出
pip install -r requirements.txt     # 安装
~~~
