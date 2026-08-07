# Vue 技术栈：从响应式原理到 Composition API 的完整思考路径

## 核心策略：Vue 技术栈的 6 个套路

Vue 的知识点可以归为 6 个套路，掌握后遇到任何 Vue 面试题都能应对。

~~~
套路1：响应式原理        → Vue2 Object.defineProperty vs Vue3 Proxy
套路2：组件通信          → props / emit / provide / inject / pinia
套路3：生命周期与 Hooks  → Options API 生命周期 vs Composition API 生命周期
套路4：模板编译与渲染    → 模板编译 / 虚拟DOM / diff算法 / 静态提升 / PatchFlag
套路5：路由与状态管理    → Vue Router / Pinia
套路6：高级特性          → Keep-alive / 自定义指令 / 插件 / 渲染函数
~~~

---

## 套路一：响应式原理（Vue2 vs Vue3）

### Vue2 的响应式：Object.defineProperty

**手写口诀：遍历对象的每个属性，用 getter/setter 劫持读写**

~~~javascript
// ========== 手写 Vue2 响应式核心 ==========
function defineReactive(对象, 键, 值) {
  // 如果值是对象，递归劫持
  observe(值);

  Object.defineProperty(对象, 键, {
    get() {
      console.log(`[GET] ${键} = ${值}`);
      // 依赖收集（谁在读这个属性？记下来）
      return 值;
    },
    set(新值) {
      if (新值 === 值) return;
      console.log(`[SET] ${键} = ${新值}`);
      值 = 新值;
      // 触发更新（通知所有依赖这个属性的组件重新渲染）
      if (typeof 新值 === "object") observe(新值);
    }
  });
}

function observe(对象) {
  if (typeof 对象 !== "object" || 对象 === null) return;
  Object.keys(对象).forEach(键 => defineReactive(对象, 键, 对象[键]));
}
~~~

#### 测试

~~~javascript
const 菜品 = { 名字: "红烧肉", 价格: 38 };
observe(菜品);

菜品.名字;           // [GET] 名字 = 红烧肉
菜品.价格 = 45;      // [SET] 价格 = 45
console.log(菜品.价格); // [GET] 价格 = 45
~~~

#### Vue2 响应式的 3 个致命问题

~~~javascript
// ========== 问题1：不能监听新增属性 ==========
const 菜品 = {};
observe(菜品);
菜品.名字 = "红烧肉";  // ❌ set 不会触发（属性是新增的，没有被劫持）

// 解决方案：Vue.set()
Vue.set(菜品, "名字", "红烧肉");  // ✅ 会触发响应式

// ========== 问题2：不能监听数组下标 ==========
const 菜单 = ["红烧肉", "麻婆豆腐"];
observe(菜单);
菜单[0] = "糖醋里脊";  // ❌ set 不会触发

// 解决方案：Vue 重写了数组的 7 个方法
// push / pop / shift / unshift / splice / sort / reverse
菜单.splice(0, 1, "糖醋里脊");  // ✅ 会触发响应式

// ========== 问题3：不能监听属性删除 ==========
delete 菜品.名字;  // ❌ 不会触发

// 解决方案：Vue.delete()
Vue.delete(菜品, "名字");  // ✅ 会触发响应式
~~~

### Vue3 的响应式：Proxy

**手写口诀：代理整个对象，拦截所有操作（包括新增、删除、数组下标）**

~~~javascript
// ========== 手写 Vue3 响应式核心 ==========
function reactive(对象) {
  return new Proxy(对象, {
    get(目标, 属性, 代理) {
      console.log(`[GET] ${String(属性)}`);
      const 值 = Reflect.get(目标, 属性, 代理);

      // 依赖收集
      track(目标, 属性);

      // 深层响应式：如果值是对象，递归代理
      if (typeof 值 === "object" && 值 !== null) {
        return reactive(值);
      }

      return 值;
    },
    set(目标, 属性, 值, 代理) {
      const 旧值 = 目标[属性];
      const 结果 = Reflect.set(目标, 属性, 值, 代理);

      // 触发更新（只有值变化时才触发）
      if (旧值 !== 值) {
        trigger(目标, 属性);
      }

      return 结果;
    },
    deleteProperty(目标, 属性) {
      const 结果 = Reflect.deleteProperty(目标, 属性);
      trigger(目标, 属性);
      return 结果;
    }
  });
}
~~~

#### 测试

~~~javascript
const 菜品 = reactive({});

菜品.名字 = "红烧肉";   // [SET] 名字 → ✅ 新增属性也能监听！
console.log(菜品.名字);  // [GET] 名字 → 红烧肉

delete 菜品.名字;        // ✅ 删除也能监听！

// 数组也能正常监听
const 菜单 = reactive(["红烧肉", "麻婆豆腐"]);
菜单[0] = "糖醋里脊";   // ✅ 数组下标变化也能监听！
菜单.push("宫保鸡丁");   // ✅ push 也能监听！
~~~

### 依赖收集与触发更新

#### 三层数据结构（WeakMap → Map → Set）

~~~
Vue3 的依赖收集用三层映射结构：

targetMap: WeakMap<Target, Map<Key, Set<ReactiveEffect>>>

  WeakMap
  ├── target1（对象A）→ Map
  │     ├── name → Set[effect1, effect2]   （读取 name 的副作用）
  │     ├── age  → Set[effect3]             （读取 age 的副作用）
  │     └── ...
  └── target2（对象B）→ Map
        ├── ...

为什么用 WeakMap？
  - WeakMap 的键是弱引用
  - 当 target 对象没有其他引用时，会被垃圾回收
  - WeakMap 里的对应记录也会自动清除，避免内存泄漏

track(target, key) 的过程：
  1. 从 targetMap 中获取 target 对应的 Map（没有就创建）
  2. 从 Map 中获取 key 对应的 Set（没有就创建）
  3. 把当前正在执行的 effect（副作用函数）加入 Set

trigger(target, key) 的过程：
  1. 从 targetMap 中获取 target 对应的 Map
  2. 从 Map 中获取 key 对应的 Set
  3. 遍历 Set 中的每个 effect，执行它（触发组件重新渲染）
~~~

#### 完整 track/trigger 手写代码

~~~javascript
const targetMap = new WeakMap();
let activeEffect = null; // 当前正在执行的副作用函数

function track(target, key) {
  if (!activeEffect) return; // 不在副作用执行期间，不需要收集

  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));

  let deps = depsMap.get(key);
  if (!deps) depsMap.set(key, (deps = new Set()));

  deps.add(activeEffect); // 记录依赖
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const deps = depsMap.get(key);
  if (deps) {
    deps.forEach(effect => effect()); // 触发所有依赖
  }
}

// effect 函数（简化版，实际 Vue 中是 ReactiveEffect 类）
function effect(fn) {
  activeEffect = fn;
  fn(); // 执行时会触发 getter，从而收集依赖
  activeEffect = null;
}
~~~

#### 测试

~~~javascript
const dish = reactive({ name: "红烧肉", price: 38 });

effect(() => {
  console.log(`菜品：${dish.name}，价格：${dish.price}`);
});
// 输出：菜品：红烧肉，价格：38
// 此时 dish.name 和 dish.price 的依赖都被收集了

dish.name = "麻婆豆腐";
// 输出：菜品：麻婆豆腐，价格：38（自动触发更新，只有 name 变了）
~~~

### Vue2 vs Vue3 响应式对比

| | Vue2 (Object.defineProperty) | Vue3 (Proxy) |
|---|---|---|
| 劫持方式 | 遍历每个属性，逐个定义 getter/setter | 代理整个对象，拦截所有操作 |
| 新增属性 | ❌ 不能监听（需要 Vue.set） | ✅ 可以监听 |
| 数组下标 | ❌ 不能监听（重写 7 个方法） | ✅ 可以监听 |
| 属性删除 | ❌ 不能监听（需要 Vue.delete） | ✅ 可以监听 |
| 性能 | 初始化时递归遍历所有属性（慢） | 惰性代理，访问时才递归（快） |
| 兼容性 | IE11 支持 | IE11 不支持 |
| 数据结构 | 不支持 Map/Set | 支持 Map/Set |

### 依赖收集与触发更新

~~~
依赖收集的过程（简化版）：

  组件渲染时，访问了 this.名字
  → 触发 getter
  → getter 里记录："组件A 依赖了 名字"
  → 存入映射表：{ 菜品: { 名字: Set[组件A] } }

触发更新的过程：

  this.名字 = "新值"
  → 触发 setter
  → setter 里查找："谁依赖了 名字？"
  → 找到：组件A
  → 通知组件A 重新渲染
~~~

**手写口诀：getter 里收集依赖，setter 里触发更新**

~~~javascript
// ========== 简易版依赖收集 ==========
const 依赖映射 = new WeakMap();  // 目标 → 属性 → 依赖集合
let 当前依赖 = null;  // 当前正在执行的组件（简化版）

function track(目标, 属性) {
  if (!当前依赖) return;  // 不在组件渲染时访问，不需要收集

  if (!依赖映射.has(目标)) 依赖映射.set(目标, new Map());
  const 属性映射 = 依赖映射.get(目标);

  if (!属性映射.has(属性)) 属性映射.set(属性, new Set());
  const 依赖集合 = 属性映射.get(属性);

  依赖集合.add(当前依赖);  // 记录：这个属性被当前组件依赖了
}

function trigger(目标, 属性) {
  if (!依赖映射.has(目标)) return;
  const 属性映射 = 依赖映射.get(目标);
  if (!属性映射.has(属性)) return;

  属性映射.get(属性).forEach(组件 => 组件.更新());
}
~~~

### ref vs reactive

**手写口诀：ref 包装基本类型，reactive 包装对象，ref 要 .value 访问**

~~~javascript
import { ref, reactive } from "vue";

// ========== ref：用于基本类型 ==========
const 名字 = ref("红烧肉");
console.log(名字.value);  // "红烧肉"（需要 .value）
名字.value = "麻婆豆腐";

// 模板里不需要 .value（Vue 自动解包）
// <template>{{ 名字 }}</template>

// ========== reactive：用于对象 ==========
const 菜品 = reactive({ 名字: "红烧肉", 价格: 38 });
console.log(菜品.名字);  // "红烧肉"（直接访问，不需要 .value）
菜品.价格 = 45;

// ========== ref 也能包装对象 ==========
const 菜品2 = ref({ 名字: "红烧肉" });
console.log(菜品2.value.名字);  // 需要 .value 再 .名字

// ========== 响应式丢失问题 ==========
const 菜品 = reactive({ 名字: "红烧肉", 价格: 38 });

// ❌ 解构会丢失响应式
const { 名字, 价格 } = 菜品;  // 名字和价格不再是响应式的
// 因为解构相当于 const 名字 = "红烧肉"（普通字符串赋值）

// ✅ 用 toRefs 保持响应式
import { toRefs } from "vue";
const { 名字: n, 价格: p } = toRefs(菜品);
// n 和 p 是 ref，保持响应式
~~~

#### 测试

~~~javascript
// ========== ref 和 reactive 的本质区别 ==========
import { ref, reactive, isRef, isReactive, toRaw } from "vue";

const r = ref(0);
const o = reactive({ a: 1 });

console.log(isRef(r));        // true
console.log(isReactive(o));   // true

// ref 的本质：{ value: 值 } 的包装对象
// reactive 的本质：Proxy 代理对象

// toRaw：获取原始对象（去掉 Proxy 包装）
const 原始 = toRaw(o);
console.log(原始 === o);  // false（原始是普通对象，o 是 Proxy）
~~~

### ref 的解包规则

~~~javascript
import { ref, reactive } from "vue";

// ========== ref 在 reactive 中会自动解包（不需要 .value） ==========
const count = ref(0);
const state = reactive({ count });
console.log(state.count); // 0（自动解包，不是 Ref 对象）
state.count++;            // 直接修改，count.value 也会变

// ========== ref 在 reactive 中赋值时也会自动解包 ==========
const other = ref(42);
state.count = other;      // 自动解包，state.count = 42
// 而不是 state.count = other（Ref 对象）

// ========== 但数组和 Map 中的 ref 不会自动解包 ==========
const arr = ref([ref(1), ref(2)]);
console.log(arr.value[0]);     // Ref 对象（没有解包）
console.log(arr.value[0].value); // 1（需要 .value）
~~~

### 响应式丢失问题与 toRef / toRefs

~~~javascript
import { reactive, toRefs, toRef } from "vue";

const state = reactive({
  name: "老王",
  age: 25,
});

// ❌ 解构会丢失响应式
const { name, age } = state;
// name 和 age 变成了普通字符串/数字，不再是响应式的
// 修改 name 不会触发更新

// ✅ 用 toRefs 保持响应式
const { name: nameRef, age: ageRef } = toRefs(state);
// nameRef 和 ageRef 是 Ref 类型，保持响应式
nameRef.value = "新名字"; // ✅ 会触发更新，state.name 也会变

// ✅ 用 toRef 转换单个属性
const nameOnly = toRef(state, "name");
nameOnly.value = "新名字"; // ✅ 会触发更新
~~~

### customRef：自定义 ref

~~~javascript
import { customRef } from "vue";

// customRef：自定义 ref（控制依赖收集和触发更新的时机）
// 常见用途：防抖 ref
function useDebouncedRef(value, delay = 300) {
  let timeout;
  return customRef((track, trigger) => ({
    get() {
      track(); // 收集依赖
      return value;
    },
    set(newValue) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        value = newValue;
        trigger(); // 触发更新
      }, delay);
    }
  }));
}

const search = useDebouncedRef("");
search.value = "红";      // 不会立即触发更新
search.value = "红烧";    // 重置定时器
search.value = "红烧肉";  // 重置定时器
// 300ms 后才触发更新（防抖效果）
~~~

---

## 套路二：组件通信

### 组件通信的 8 种方式

~~~
1. props / emit           → 父子组件通信（最常用）
2. provide / inject       → 跨层级通信（祖先 → 后代）
3. pinia / vuex           → 全局状态管理（任意组件间）
4. eventBus（已废弃）      → 任意组件间（Vue2 常用，Vue3 不推荐）
5. ref / $refs            → 父组件直接访问子组件
6. $parent / $children    → 子组件访问父组件（不推荐）
7. attrs / slots          → 透传属性和插槽
8. mitt / eventemitter3    → 第三方事件总线（替代 eventBus）
~~~

### 方式1：props / emit（最常用）

**手写口诀：父传子用 props，子传父用 emit**

~~~javascript
// ========== 父组件 ==========
// <template>
//   <子组件 :菜品名="名字" @点菜="处理点菜" />
// </template>

import { ref } from "vue";
const 名字 = ref("红烧肉");
function 处理点菜(菜名) {
  console.log(`点了：${菜名}`);
}

// ========== 子组件 ==========
// <template>
//   <div @click="$emit('点菜', 菜品名)">{{ 菜品名 }}</div>
// </template>

// 方式1：选项式 props
export default {
  props: {
    菜品名: {
      type: String,
      required: true,
      default: "默认菜",
      validator: (值) => 值.length > 0  // 自定义校验
    }
  },
  emits: ["点菜"]  // 声明要触发的事件
}

// 方式2：组合式 defineProps + defineEmits
const props = defineProps({
  菜品名: { type: String, required: true }
});
const emit = defineEmits(["点菜"]);
~~~

#### 测试

~~~javascript
// ========== props 单向数据流 ==========

// ❌ 子组件不能直接修改 props
// 子组件里：props.菜品名 = "新名字"  → Vue 警告

// ✅ 子组件通过 emit 通知父组件修改
emit("点菜", "麻婆豆腐");
// 父组件收到事件后自己修改数据

// ========== props 的类型检查 ==========
props: {
  名字: String,               // 类型检查
  价格: [Number, String],     // 多种类型
  评分: {
    type: Number,
    required: true,            // 必填
    default: 5,                // 默认值
    validator: v => v >= 0 && v <= 5  // 自定义校验
  }
}
~~~

### 方式2：provide / inject（跨层级通信）

**手写口诀：provide 在祖先提供，inject 在后代注入**

~~~javascript
// ========== 祖先组件 ==========
import { provide, ref } from "vue";

const 主题 = ref("黑色");
provide("主题", 主题);          // 提供响应式数据
provide("餐厅名", "老王饭馆");  // 提供静态数据

// ========== 后代组件（任意层级） ==========
import { inject } from "vue";

const 主题 = inject("主题");           // 注入响应式数据
const 餐厅名 = inject("餐厅名");       // 注入静态数据
const 语言 = inject("语言", "中文");   // 第二个参数是默认值

// 后代组件可以直接修改 inject 的响应式数据
主题.value = "白色";  // ✅ 祖先组件也会更新
~~~

#### 测试

~~~javascript
// ========== provide/inject 的响应式 ==========
import { provide, inject, ref, readonly } from "vue";

// 祖先组件
const 状态 = ref({ 名字: "红烧肉", 价格: 38 });
provide("菜品", readonly(状态));  // 用 readonly 防止后代直接修改

// 后代组件
const 菜品 = inject("菜品");
console.log(菜品.value.名字);  // "红烧肉"
// 菜品.value.名字 = "改了";  // ❌ 警告：readonly

// ========== 修改祖先数据的正确方式 ==========
// 祖先组件提供修改方法
const 状态2 = ref({ 名字: "红烧肉" });
function 修改名字(新名字) { 状态2.value.名字 = 新名字; }
provide("菜品2", readonly(状态2));
provide("修改名字", 修改名字);

// 后代组件
const 菜品2 = inject("菜品2");
const 修改名字 = inject("修改名字");
修改名字("麻婆豆腐");  // ✅ 通过提供的方法修改
~~~

### 方式3：Pinia 状态管理（全局通信）

**手写口诀：defineStore 定义，state/getters/actions 三件套**

~~~javascript
// ========== 定义 Store ==========
// stores/菜单.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const use菜单Store = defineStore("菜单", () => {
  // state（状态）
  const 菜品们 = ref([
    { 名字: "红烧肉", 价格: 38, 类型: "热菜" },
    { 名字: "拍黄瓜", 价格: 12, 类型: "凉菜" },
  ]);

  // getters（计算属性）
  const 热菜 = computed(() => 菜品们.value.filter(菜 => 菜.类型 === "热菜"));
  const 总价 = computed(() => 菜品们.value.reduce((和, 菜) => 和 + 菜.价格, 0));

  // actions（方法，可以是同步也可以是异步）
  function 添加菜品(菜品) {
    菜品们.value.push(菜品);
  }

  async function 从服务器获取菜品() {
    const 响应 = await fetch("/api/菜品");
    菜品们.value = await 响应.json();
  }

  return { 菜品们, 热菜, 总价, 添加菜品, 从服务器获取菜品 };
});
~~~

#### 测试

~~~javascript
// ========== 在组件中使用 ==========
import { use菜单Store } from "@/stores/菜单";

const 菜单 = use菜单Store();

// 读取 state
console.log(菜单.菜品们);
console.log(菜单.热菜);    // getter
console.log(菜单.总价);    // getter

// 修改 state
菜单.添加菜品({ 名字: "宫保鸡丁", 价格: 35, 类型: "热菜" });

// 异步 action
await 菜单.从服务器获取菜品();

// ========== 解构时保持响应式 ==========
import { storeToRefs } from "pinia";

// ❌ 直接解构会丢失响应式
const { 菜品们, 总价 } = 菜单;  // 不再是响应式的

// ✅ 用 storeToRefs 保持响应式
const { 菜品们: 菜, 总价: 总 } = storeToRefs(菜单);
// 菜 和 总 是 ref，保持响应式

// actions 不需要用 storeToRefs（因为函数不需要响应式）
const { 添加菜品 } = 菜单;
~~~

---

## 套路三：生命周期与 Hooks

### Vue2 生命周期 vs Vue3 生命周期

| Vue2（Options API） | Vue3（Composition API） | 时机 |
|---|---|---|
| beforeCreate | setup() 开始 | 实例初始化 |
| created | setup() 结束 | 数据初始化完成 |
| beforeMount | onBeforeMount | 挂载前 |
| mounted | onMounted | 挂载完成 |
| beforeUpdate | onBeforeUpdate | 更新前 |
| updated | onUpdated | 更新完成 |
| beforeDestroy | onBeforeUnmount | 卸载前 |
| destroyed | onUnmounted | 卸载完成 |

### Composition API 的生命周期 Hooks

~~~javascript
import {
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted,
  onActivated, onDeactivated,
  onErrorCaptured
} from "vue";

// setup 本身相当于 beforeCreate + created
setup() {
  // 这里的代码在 beforeCreate 和 created 之间执行

  onBeforeMount(() => { console.log("挂载前"); });
  onMounted(() => { console.log("挂载完成"); });
  onBeforeUpdate(() => { console.log("更新前"); });
  onUpdated(() => { console.log("更新完成"); });
  onBeforeUnmount(() => { console.log("卸载前"); });
  onUnmounted(() => { console.log("卸载完成"); });
}
~~~

#### 测试

~~~javascript
// ========== 完整生命周期执行顺序 ==========
// <template>
//   <div>{{ 消息 }}</div>
// </template>

import { ref, onMounted, onUpdated, onUnmounted } from "vue";

const 消息 = ref("初始值");

console.log("1. setup（相当于 beforeCreate + created）");

onMounted(() => {
  console.log("2. mounted（DOM 已挂载）");
  console.log("DOM 内容：", document.querySelector("div").textContent);  // 初始值

  // 3秒后修改数据
  setTimeout(() => { 消息.value = "新值"; }, 3000);
});

onUpdated(() => {
  console.log("3. updated（数据变化，DOM 更新）");
  console.log("DOM 内容：", document.querySelector("div").textContent);  // 新值
});

onUnmounted(() => {
  console.log("4. unmounted（组件销毁）");
  // 清理定时器、取消事件监听等
});

// 执行顺序：
// 1. setup
// 2. mounted
// （3秒后）
// 3. updated
// （组件销毁时）
// 4. unmounted
~~~

### 常见面试题：mounted 里能拿到 DOM 吗？

~~~javascript
// ========== mounted 里能拿到 DOM ==========
import { ref, onMounted, nextTick } from "vue";

const 元素 = ref(null);

onMounted(() => {
  console.log(元素.value);  // ✅ DOM 元素（能拿到）
});

// ========== 同步修改数据后，DOM 还没更新 ==========
onMounted(() => {
  消息.value = "新值";
  console.log(元素.value.textContent);  // ❌ 还是旧值！

  nextTick(() => {
    console.log(元素.value.textContent);  // ✅ 新值（DOM 更新了）
  });
});
~~~

### 自定义 Hooks（Composables）

**手写口诀：以 use 开头，返回 ref/reactive，组件间复用逻辑**

~~~javascript
// ========== 1. useFetch：封装请求逻辑 ==========
// composables/useFetch.js
import { ref, watchEffect } from "vue";

export function useFetch(url) {
  const 数据 = ref(null);
  const 加载中 = ref(false);
  const 错误 = ref(null);

  async function 发起请求() {
    加载中.value = true;
    错误.value = null;
    try {
      const 响应 = await fetch(url);
      数据.value = await 响应.json();
    } catch (e) {
      错误.value = e;
    } finally {
      加载中.value = false;
    }
  }

  发起请求();

  return { 数据, 加载中, 错误, 刷新: 发起请求 };
}

// ========== 2. useCounter：封装计数器逻辑 ==========
// composables/useCounter.js
import { ref, computed } from "vue";

export function useCounter(初始值 = 0) {
  const 数字 = ref(初始值);
  const 双倍 = computed(() => 数字.value * 2);

  function 增加() { 数字.value++; }
  function 减少() { 数字.value--; }
  function 重置() { 数字.value = 初始值; }

  return { 数字, 双倍, 增加, 减少, 重置 };
}

// ========== 3. useLocalStorage：封装本地存储 ==========
// composables/useLocalStorage.js
import { ref, watch } from "vue";

export function useLocalStorage(键, 默认值) {
  const 存储值 = ref(
    JSON.parse(localStorage.getItem(键)) || 默认值
  );

  watch(存储值, (新值) => {
    localStorage.setItem(键, JSON.stringify(新值));
  }, { deep: true });

  return 存储值;
}
~~~

#### 测试

~~~javascript
// ========== 在组件中使用自定义 Hooks ==========
import { useFetch } from "@/composables/useFetch";
import { useCounter } from "@/composables/useCounter";
import { useLocalStorage } from "@/composables/useLocalStorage";

// 使用 useFetch
const { 数据: 菜品, 加载中, 错误, 刷新 } = useFetch("/api/菜品");

// 使用 useCounter
const { 数字, 双倍, 增加, 减少, 重置 } = useCounter(0);

// 使用 useLocalStorage
const 主题 = useLocalStorage("主题", "黑色");
// 修改主题会自动保存到 localStorage
// 刷新页面后自动恢复

// ========== 多个组件可以复用同一个 Hook ==========
// 组件A 和 组件B 都可以 useCounter()
// 每个组件有自己的独立状态
~~~

---

## 套路四：模板编译与渲染（核心面试考点）

### 模板编译流程：template → render 函数

**手写口诀：模板字符串 → 解析成 AST → 优化 AST → 生成 render 函数代码**

~~~
Vue 模板编译的 3 个阶段：

  阶段1：Parse（解析）
    把 template 字符串解析成 AST（抽象语法树）
    <div><h1>{{名字}}</h1></div>
    → { tag: "div", children: [{ tag: "h1", children: [{ 表达式: "名字" }] }] }

  阶段2：Transform（优化）
    遍历 AST，标记静态节点
    静态节点 → 标记为"不需要更新"
    动态节点 → 标记 PatchFlag（告诉渲染器哪些属性会变化）

  阶段3：Generate（生成代码）
    把优化后的 AST 转换成 render 函数字符串
    → _createVNode("div", null, [_createVNode("h1", null, _toDisplayString(名字))])
~~~

~~~
完整链路：

  template（模板字符串）
    ↓  Parse
  AST（抽象语法树）
    ↓  Transform（标记静态节点 + PatchFlag）
  优化后的 AST
    ↓  Generate
  render 函数（可执行的 JS 代码）
    ↓  执行 render
  虚拟 DOM（VNode）
    ↓  patch（diff）
  真实 DOM
~~~

#### 测试

~~~javascript
// ========== 手写简化版 Parse（把模板解析成 AST） ==========
// 只处理最简单的情况：<div>文本</div>

function parseTemplate(模板) {
  const 标签正则 = /^<([a-z]+)>([\s\S]*)<\/\1>$/;
  const 匹配 = 模板.trim().match(标签正则);

  if (!匹配) return { type: 3, text: 模板.trim() };  // 纯文本节点

  const [, 标签名, 内容] = 匹配;

  return {
    type: 1,              // 元素节点
    tag: 标签名,
    children: [parseTemplate(content)]  // 递归解析子节点
  };
}

// 测试
const ast = parseTemplate("<div><h1>红烧肉</h1></div>");
console.log(JSON.stringify(ast, null, 2));
// {
//   "type": 1,
//   "tag": "div",
//   "children": [{
//     "type": 1,
//     "tag": "h1",
//     "children": [{ "type": 3, "text": "红烧肉" }]
//   }]
// }
~~~

### Vue3 的性能优化：静态提升 + PatchFlag

**面试核心：Vue3 为什么比 Vue2 快？答这三个优化就够了。**

~~~
优化1：静态提升（Static Hoisting）

  模板里不变的节点，编译时提取出来，只创建一次
  后续更新时直接复用，不再重新创建

  Vue2 的做法：
    每次重新渲染 → 整个 render 函数重新执行 → 所有 VNode 重新创建
    即使 h1 没有变化，也会重新创建它的 VNode

  Vue3 的做法：
    编译时把静态节点提取到 render 函数外面
    每次重新渲染 → 只执行动态部分 → 静态节点直接复用
~~~

~~~javascript
// ========== 没有静态提升（Vue2 风格） ==========
function render() {
  // 每次渲染都会重新创建所有 VNode
  return createVNode("div", null, [
    createVNode("h1", null, "老王饭馆"),   // 静态节点，但每次都重新创建 ❌
    createVNode("p", null, "红烧肉 38元"), // 静态节点，但每次都重新创建 ❌
    createVNode("span", null, 名字)        // 动态节点
  ]);
}

// ========== 有静态提升（Vue3） ==========
// 静态节点提升到 render 函数外面（只创建一次）
const _hoisted_1 = createVNode("h1", null, "老王饭馆");
const _hoisted_2 = createVNode("p", null, "红烧肉 38元");

function render() {
  return createVNode("div", null, [
    _hoisted_1,     // 直接复用，不再重新创建 ✅
    _hoisted_2,     // 直接复用，不再重新创建 ✅
    createVNode("span", null, 名字)  // 只有动态节点才重新创建
  ]);
}
~~~

~~~
优化2：PatchFlag（补丁标记）

  编译时给每个动态节点打标记
  告诉渲染器"这个节点的哪些属性会变化"
  更新时只检查标记的属性，不检查其他属性

  PatchFlag 的值：
    1  → TEXT（文本会变化）
    2  → CLASS（class 会变化）
    4  → STYLE（style 会变化）
    8  → PROPS（其他属性会变化）
    16 → FULL_PROPS（有动态 key 的属性）
    32 → NEED_HYDRATION（需要水合）
    64 → STABLE_FRAGMENT（稳定的 Fragment）
    128 → KEYED_FRAGMENT（有 key 的 Fragment）
    256 → UNKEYED_FRAGMENT（无 key 的 Fragment）
    512 → NEED_PATCH（ref/directive/hooks 变化）
~~~

~~~javascript
// ========== 没有 PatchFlag（Vue2 风格） ==========
function render() {
  return createVNode("div", { class: "菜品", id: "c1" }, [
    createVNode("span", null, 名字)
  ]);
}
// 更新时：diff 算法要比较 class、id、children 全部属性 ❌

// ========== 有 PatchFlag（Vue3） ==========
function render() {
  return createVNode("div", { class: "菜品", id: "c1" }, [
    createVNode("span", null, 名字, 1 /* TEXT */)  // 1 = 只有文本会变
  ]);
}
// 更新时：只比较文本内容，跳过 class/id ❌ → ✅

// ========== 多个动态属性 ==========
function render() {
  return createVNode("div", {
    class: 菜品类,
    style: { color: 颜色 },
    id: "c1"
  }, null, 6 /* CLASS | STYLE */);
  // 6 = 2(CLASS) + 4(STYLE)
  // 更新时只比较 class 和 style，跳过 id
}
~~~

~~~
优化3：Block Tree（区块树）

  传统 diff：遍历整棵虚拟 DOM 树，逐个比较
  Block Tree：只遍历有动态节点的"扁平数组"

  原理：
    编译时把模板中的动态节点收集到一个扁平数组里（叫"Block"）
    更新时直接遍历这个数组，跳过所有静态节点
    配合 PatchFlag，每个动态节点只比较标记的属性
~~~

~~~javascript
// ========== 没有 Block Tree（Vue2 风格） ==========
// diff 算法要递归遍历整棵树
// div
// ├── h1（静态）→ 比较一次
// ├── p（静态）  → 比较一次
// ├── div（静态）→ 比较一次
// │   ├── span（静态）→ 比较一次
// │   └── span（静态）→ 比较一次
// └── span（动态）→ 比较一次
// 总共比较 6 次，只有最后 1 次是有意义的 ❌

// ========== 有 Block Tree（Vue3） ==========
// Block 只收集动态节点
// 动态节点数组: [span（动态）]
// 更新时直接遍历这个数组，1 次比较 ✅

// 如果嵌套模板中也有动态节点，会创建嵌套 Block
// Block
// ├── 动态 span → PatchFlag = 1(TEXT)
// └── Block（子模板）
//     ├── 动态 span → PatchFlag = 2(CLASS)
//     └── 动态 a → PatchFlag = 8(PROPS)
// 总共 3 次比较，每次都精准命中 ✅
~~~

### Vue3 编译优化总结

~~~
三个优化的效果对比：

  场景：100 个节点，其中 3 个是动态的

  Vue2：
    创建 VNode：100 个全部创建
    diff 更新：100 个全部比较
    → 性能 = O(节点总数)

  Vue3：
    创建 VNode：97 个静态节点只创建一次（静态提升），3 个动态节点每次创建
    diff 更新：只比较 3 个动态节点的标记属性（Block Tree + PatchFlag）
    → 性能 = O(动态节点数)

  结论：节点越多、动态节点越少 → Vue3 的优势越大
~~~

### 虚拟 DOM 与 diff 算法

**什么是虚拟 DOM？**

~~~
虚拟 DOM = 用 JavaScript 对象描述真实 DOM 结构

为什么需要虚拟 DOM？
  1. 操作真实 DOM 很慢（浏览器需要重新计算布局、重绘）
  2. 用虚拟 DOM 计算出"最小差异"，只更新变化的部分
  3. 跨平台（虚拟 DOM 可以渲染到不同平台：Web、Native、Canvas）
~~~

~~~javascript
// ========== 真实 DOM ==========
// <div class="菜单">
//   <h1>红烧肉</h1>
//   <p>38元</p>
// </div>

// ========== 虚拟 DOM（JavaScript 对象） ==========
const 虚拟节点 = {
  type: "div",
  props: { class: "菜单" },
  children: [
    { type: "h1", props: {}, children: ["红烧肉"] },
    { type: "p", props: {}, children: ["38元"] }
  ]
};
~~~

**diff 算法的核心思路**

**手写口诀：同层比较，不跨层移动；类型不同直接替换；用 key 优化列表**

~~~
diff 算法的 3 条规则：

规则1：只比较同层级的节点（不跨层比较）
  旧：div → h1, p
  新：div → h1, span
  只比较 h1 vs h1，p vs span
  不会拿 h1 去和 span 比较

规则2：类型不同 → 直接替换（不继续比较子节点）
  旧：h1
  新：p
  直接替换，不比较 h1 和 p 的子节点

规则3：类型相同 → 比较属性和子节点
  旧：h1 { class: "旧" } → "红烧肉"
  新：h1 { class: "新" } → "麻婆豆腐"
  只更新 class 和文本内容，不替换整个 h1
~~~

**key 的作用**

~~~javascript
// ========== 没有 key（或 key=index） ==========
// 旧列表：[A, B, C]
// 新列表：[D, A, B, C]（在前面插入了 D）

// 没有 key 时，Vue 的比较过程：
//   位置0: A vs D → 类型相同，更新内容 → 改成 D
//   位置1: B vs A → 类型相同，更新内容 → 改成 A
//   位置2: C vs B → 类型相同，更新内容 → 改成 B
//   位置3: 无 vs C → 新增 C
//   结果：做了 3 次更新 + 1 次新增 = 4 次 DOM 操作 ❌

// ========== 有唯一 key ==========
// 旧列表：key=[a, b, c]
// 新列表：key=[d, a, b, c]

// 有 key 时，Vue 的比较过程：
//   key=d → 旧列表没有 → 新增 D
//   key=a → 找到了，位置变了 → 移动
//   key=b → 找到了，位置变了 → 移动
//   key=c → 找到了，位置变了 → 移动
//   结果：1 次新增 + 3 次移动 = 4 次 DOM 操作 ✅（比没有 key 更高效）

// 为什么 key 不能用 index？
// 因为 index 会随着列表变化而变化
// 删除中间元素后，后面所有元素的 index 都变了
// 导致 Vue 认为"每个元素都变了"，全部重新渲染
~~~

**key=index 的问题（状态错乱场景）：**

~~~javascript
// 旧列表：[{name: "A"}, {name: "B"}, {name: "C"}]
// key=0: A, key=1: B, key=2: C

// 删除 B 后：
// 新列表：[{name: "A"}, {name: "C"}]
// key=0: A, key=1: C

// Vue 认为：
//   key=0: A vs A → 没变 ✅
//   key=1: B vs C → 变了！更新 ❌（实际上 C 只是移动了位置）
//   key=2: C 被删除了

// 如果 B 有输入框且用户输入了内容：
// 删除 B 后，key=1 的组件被复用，输入框的内容会变成 C 的（状态错乱）

// ========== 用唯一 id ==========
// 旧列表：key=[a, b, c]
// 删除 B 后：key=[a, c]
// Vue 认为：
//   key=a: A vs A → 没变 ✅
//   key=b: 被删除了 ✅（正确识别 B 已移除）
//   key=c: C vs C → 没变，只是移动了位置 ✅
// 组件状态保持正确 ✅
~~~

#### 测试

~~~javascript
// ========== key=index 的问题 ==========
// 旧列表：[{name: "A"}, {name: "B"}, {name: "C"}]
// key=0: A, key=1: B, key=2: C

// 删除 B 后：
// 新列表：[{name: "A"}, {name: "C"}]
// key=0: A, key=1: C

// Vue 认为：
//   key=0: A vs A → 没变 ✅
//   key=1: B vs C → 变了！更新 ❌（实际上 C 只是移动了位置）
//   key=2: C 被删除了

// 用唯一 id：
// 旧列表：key=[a, b, c]
// 删除 B 后：key=[a, c]
// Vue 认为：
//   key=a: A vs A → 没变 ✅
//   key=b: 被删除了 ✅
//   key=c: C vs C → 没变，只是移动了位置 ✅
~~~

---

## 套路五：路由与状态管理

### Vue Router 核心原理

**手写口诀：监听 URL 变化 → 匹配路由规则 → 渲染对应组件**

~~~
两种路由模式：
  Hash 模式：URL 带 #，如 http://localhost:3000/#/菜品
  History 模式：URL 不带 #，如 http://localhost:3000/菜品
~~~

~~~javascript
// ========== 手写 Hash 路由（简化版） ==========
class HashRouter {
  constructor() {
    this.路由表 = {};
    window.addEventListener("hashchange", () => this.匹配());
  }

  注册(路径, 组件) {
    this.路由表[路径] = 组件;
  }

  匹配() {
    const 路径 = location.hash.slice(1) || "/";
    const 组件 = this.路由表[路径];
    if (组件) {
      document.getElementById("app").innerHTML = 组件;
    }
  }
}

const 路由 = new HashRouter();
路由.注册("/", "<h1>首页</h1>");
路由.注册("/菜品", "<h1>菜品列表</h1>");
路由.注册("/关于", "<h1>关于我们</h1>");

// ========== 手写 History 路由（简化版） ==========
class HistoryRouter {
  constructor() {
    this.路由表 = {};
    window.addEventListener("popstate", () => this.匹配());
  }

  注册(路径, 组件) {
    this.路由表[路径] = 组件;
  }

  push(路径) {
    history.pushState(null, "", 路径);
    this.匹配();
  }

  匹配() {
    const 路径 = location.pathname;
    const 组件 = this.路由表[路径];
    if (组件) {
      document.getElementById("app").innerHTML = 组件;
    }
  }
}
~~~

### Vue Router 的使用

~~~javascript
// ========== 路由配置 ==========
// router/index.js
import { createRouter, createWebHistory } from "vue-router";

const 路由 = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "首页",
      component: () => import("@/views/Home.vue"),
      meta: { 需要登录: false }
    },
    {
      path: "/菜品",
      name: "菜品",
      component: () => import("@/views/Menu.vue"),
      meta: { 需要登录: true }
    },
    {
      path: "/菜品/:id",
      name: "菜品详情",
      component: () => import("@/views/Detail.vue"),
      props: true  // 把 route.params 作为 props 传入组件
    },
    {
      path: "/:pathMatch(.*)*",
      name: "404",
      component: () => import("@/views/NotFound.vue")
    }
  ]
});
~~~

#### 测试

~~~javascript
// ========== 路由守卫（全局前置守卫） ==========
路由.beforeEach((to, from) => {
  if (to.meta.需要登录 && !isAuthenticated()) {
    return { name: "登录页" };  // 重定向到登录页
  }
  return true;  // 放行
});

// ========== 编程式导航 ==========
import { useRouter, useRoute } from "vue-router";

const 路由器 = useRouter();    // 路由器实例（用于跳转）
const 当前路由 = useRoute();   // 当前路由信息

// 跳转
路由器.push("/菜品");
路由器.push({ name: "菜品详情", params: { id: 1 } });
路由器.replace("/登录");  // 不会留下历史记录
路由器.go(-1);             // 后退

// 读取参数
console.log(当前路由.params.id);    // 路径参数
console.log(当前路由.query.搜索);   // 查询参数
console.log(当前路由.meta.需要登录); // 路由元信息

// ========== 路由懒加载 ==========
// 非懒加载（打包时全部加载）
import Home from "@/views/Home.vue";

// 懒加载（访问时才加载）
const Home = () => import("@/views/Home.vue");
// 优势：首屏加载更快，按需加载
~~~

### Hash 模式 vs History 模式

| | Hash 模式 | History 模式 |
|---|---|---|
| URL 格式 | `/#/菜品` | `/菜品` |
| 实现原理 | hashchange 事件 | pushState / popState |
| 服务器配置 | 不需要 | 需要配置（所有路径返回 index.html） |
| 刷新 | 不会 404 | 会 404（需要服务器配合） |
| SEO | 不友好（# 不发送到服务器） | 友好（URL 干净） |
| 兼容性 | IE8+ | IE10+ |

---

## 套路六：高级特性

### Keep-alive 缓存机制

**手写口诀：Keep-alive 缓存组件实例，切换时不销毁，而是隐藏**

~~~
Keep-alive 做了什么？

  没有 Keep-alive：
    组件A → 切换到组件B → 组件A 被销毁（unmounted）
    切回组件A → 组件A 重新创建（mounted）
    → 状态丢失，数据重新请求

  有 Keep-alive：
    组件A → 切换到组件B → 组件A 被缓存（deactivated）
    切回组件A → 组件A 从缓存恢复（activated）
    → 状态保留，不重新请求数据
~~~

#### LRU 淘汰机制

~~~
Keep-alive 内部维护了两个东西：
  1. 缓存池（Map）：{ 组件名: VNode }
  2. 访问顺序（数组）：[最近访问的, ..., 最久没访问的]

当组件被 Keep-alive 包裹时：
  1. 组件首次渲染 → 创建实例 → 存入缓存池
  2. 组件切换离开 → 不销毁，存入缓存池（触发 deactivated 钩子）
  3. 组件切换回来 → 从缓存池取出复用，移到最新位置（触发 activated 钩子）
  4. 缓存数量超过 max → 淘汰最久没用的（LRU 策略）

LRU = Least Recently Used（最近最少使用）
  访问一个缓存的组件时，把它移到"最新"位置
  缓存满了要淘汰时，删掉"最久没访问"的那个
~~~

~~~javascript
// ========== 基本用法 ==========
// <template>
//   <keep-alive>
//     <component :is="当前组件" />
//   </keep-alive>
// </template>

// ========== 缓存指定组件（include） ==========
// <keep-alive include="Menu,About">
//   <router-view />
// </keep-alive>

// ========== 排除指定组件（exclude） ==========
// <keep-alive exclude="Login">
//   <router-view />
// </keep-alive>

// ========== 限制缓存数量（max） ==========
// <keep-alive :max="10">
//   <router-view />
// </keep-alive>
// 最多缓存 10 个组件实例，超出后最久没访问的会被销毁

// ========== activated / deactivated 生命周期 ==========
import { onActivated, onDeactivated, onMounted } from "vue";

onMounted(() => {
  console.log("首次挂载（只执行一次）");
  // 适合：初始化数据、请求接口
});

onActivated(() => {
  console.log("组件被激活（从缓存恢复时执行）");
  // 适合：刷新数据、重新请求
  // 首次挂载时也会执行（在 onMounted 之后）
});

onDeactivated(() => {
  console.log("组件被缓存（切换离开时执行）");
  // 适合：清理定时器、保存状态
});
~~~

#### 测试

~~~javascript
// ========== 完整示例：带缓存的页面切换 ==========
// 菜品列表页
import { ref, onMounted, onActivated, onDeactivated } from "vue";

const 菜品们 = ref([]);
const 滚动位置 = ref(0);

onMounted(async () => {
  console.log("首次加载菜品列表");
  const 响应 = await fetch("/api/菜品");
  菜品们.value = await 响应.json();
});

onActivated(async () => {
  console.log("从缓存恢复，刷新数据");
  const 响应 = await fetch("/api/菜品");
  菜品们.value = await 响应.json();

  // 恢复滚动位置
  document.querySelector(".列表").scrollTop = 滚动位置.value;
});

onDeactivated(() => {
  console.log("离开页面，保存滚动位置");
  滚动位置.value = document.querySelector(".列表").scrollTop;
});

// 执行顺序：
// 第一次进入：onMounted → onActivated
// 离开：onDeactivated
// 再次进入：onActivated（不执行 onMounted）
// → 状态保留，滚动位置恢复 ✅
~~~

~~~
Keep-alive 的内部原理（简化版）：

  Keep-alive 内部维护了两个东西：
    1. 缓存池（Map）：{ 组件名: VNode }
    2. 访问顺序（数组）：[最近访问的, ..., 最久没访问的]

  组件进入时：
    1. 把 VNode 存入缓存池
    2. 把组件 DOM 移出页面（display: none 或移出 DOM 树）
    3. 触发 deactivated 生命周期

  组件恢复时：
    1. 从缓存池取出 VNode
    2. 把组件 DOM 移回页面
    3. 触发 activated 生命周期

  超出 max 时：
    删除数组末尾的组件（最久没访问的）
~~~

### 自定义指令

**手写口诀：在 mounted/updated 钩子里操作 DOM**

~~~javascript
// ========== 全局指令 ==========
app.directive("focus", {
  mounted(元素) {
    元素.focus();  // 自动聚焦
  }
});

// <input v-focus />  → 输入框自动获得焦点

// ========== v-permission：权限控制 ==========
app.directive("permission", {
  mounted(元素, 绑定) {
    const 用户权限 = ["read", "write"];
    const 需要权限 = 绑定.value;  // v-permission="'delete'"

    if (!用户权限.includes(需要权限)) {
      元素.parentNode.removeChild(元素);  // 没权限就移除元素
    }
  }
});

// <button v-permission="'delete'">删除</button>
// 用户没有 delete 权限时，按钮不会渲染

// ========== v-debounce：防抖点击 ==========
app.directive("debounce", {
  mounted(元素, 绑定) {
    let 定时器 = null;
    const [回调, 延迟 = 300] = 绑定.value;

    元素.addEventListener("click", (...参数) => {
      clearTimeout(定时器);
      定时器 = setTimeout(() => 回调(...参数), 延迟);
    });
  }
});

// <button v-debounce="[提交订单, 500]">提交</button>

// ========== 指令的完整钩子 ==========
app.directive("自定义", {
  created(元素, 绑定, 虚拟节点, 前虚拟节点) { },
  beforeMount(元素, 绑定, 虚拟节点, 前虚拟节点) { },
  mounted(元素, 绑定, 虚拟节点, 前虚拟节点) { },
  beforeUpdate(元素, 绑定, 虚拟节点, 前虚拟节点) { },
  updated(元素, 绑定, 虚拟节点, 前虚拟节点) { },
  beforeUnmount(元素, 绑定, 虚拟节点, 前虚拟节点) { },
  unmounted(元素, 绑定, 虚拟节点, 前虚拟节点) { }
});

// 参数说明：
// 元素 → 指令绑定的 DOM 元素
// 绑定 → { value, oldValue, arg, modifiers }（指令的值、参数、修饰符）
// 虚拟节点 → 虚拟 DOM 节点
// 前虚拟节点 → 更新前的虚拟节点（只有 update 钩子有）
~~~

### 插件（Plugin）

**手写口诀：插件是一个对象或函数，必须有 install 方法**

~~~javascript
// ========== 定义插件 ==========
// plugins/消息插件.js
export const 消息插件 = {
  install(app, 选项) {
    // 1. 全局方法
    app.config.globalProperties.$消息 = (文本, 类型 = "info") => {
      console.log(`[${类型}] ${文本}`);
    };

    // 2. 全局组件
    app.component("全局按钮", {
      template: `<button class="全局按钮"><slot /></button>`
    });

    // 3. 全局指令
    app.directive("highlight", {
      mounted(元素, 绑定) {
        元素.style.backgroundColor = 绑定.value || "yellow";
      }
    });

    // 4. provide/inject
    app.provide("消息服务", {
      成功: (文本) => console.log(`✅ ${文本}`),
      失败: (文本) => console.log(`❌ ${文本}`),
    });

    // 使用选项
    console.log("插件配置：", 选项);
  }
};

// ========== 使用插件 ==========
import { createApp } from "vue";
import App from "./App.vue";
import { 消息插件 } from "./plugins/消息插件";

const app = createApp(App);
app.use(消息插件, { 位置: "顶部", 持续时间: 3000 });
app.mount("#app");

// ========== 在组件中使用 ==========
import { inject } from "vue";

// 使用全局方法
const { proxy } = getCurrentInstance();
proxy.$消息("菜品添加成功", "success");

// 使用 provide/inject
const 消息服务 = inject("消息服务");
消息服务.成功("保存成功");
~~~

### 渲染函数（h 函数）

**手写口诀：h(标签名, 属性对象, 子节点) 替代 template**

~~~javascript
import { h, defineComponent } from "vue";

// ========== 基本用法 ==========
// template 写法：
// <div class="菜品"><h1>红烧肉</h1><p>38元</p></div>

// 渲染函数写法：
export default {
  render() {
    return h("div", { class: "菜品" }, [
      h("h1", null, "红烧肉"),
      h("p", null, "38元")
    ]);
  }
}

// ========== 动态组件 ==========
export default {
  props: { 标签: String, 内容: String },
  render() {
    return h(this.标签, { class: "动态" }, this.内容);
  }
}
// <动态标签 标签="h1" 内容="红烧肉" />  → <h1 class="动态">红烧肉</h1>
// <动态标签 标签="p" 内容="38元" />      → <p class="动态">38元</p>

// ========== 渲染函数 vs template ==========
// template：简单直观，适合 90% 的场景
// 渲染函数：灵活，适合动态性强的组件（递归组件、动态标签、函数式组件）

// ========== 什么时候用渲染函数？ ==========
// 1. 组件需要动态决定渲染什么标签
// 2. 递归组件（树形菜单）
// 3. 需要编程逻辑控制渲染（if/else 复杂时）
// 4. 开发通用组件库
~~~

---

## 综合面试高频题

### 题目1：Vue2 和 Vue3 的区别（10 点）

~~~
1. 响应式：Object.defineProperty → Proxy
2. API：Options API → Composition API
3. 生命周期：beforeCreate/created → setup
4. 根节点：单根节点 → 多根节点（Fragment）
5. 状态管理：Vuex → Pinia
6. TypeScript：支持差 → 原生支持
7. 性能：编译优化一般 → 静态提升 + PatchFlag + Block Tree
8. 包体积：整体引入 → Tree Shaking
9. 事件 API：$on/$off/$emit → 移除 $on/$off
10. v-model：v-bind + v-input → v-model:xxx
~~~

### 题目2：Vue3 为什么比 Vue2 快？（编译优化三板斧）

~~~
1. 静态提升（Static Hoisting）
   静态节点只创建一次，后续渲染直接复用
   → 减少 VNode 创建开销

2. PatchFlag（补丁标记）
   编译时标记动态节点会变化的属性（文本/class/style/props）
   → diff 时只比较标记的属性，跳过其他

3. Block Tree（区块树）
   把动态节点收集到扁平数组里
   → diff 时只遍历动态节点，跳过静态节点

效果：节点越多、动态节点越少 → Vue3 优势越大
~~~

### 题目3：nextTick 是什么？

~~~
nextTick = "等 DOM 更新完成后执行回调"

Vue 更新 DOM 是异步的：
  数据变了 → DOM 不会立刻更新
  而是把更新放到微任务队列里，等同步代码跑完后统一更新

nextTick 的作用：在 DOM 更新完成后执行回调
原理解析：利用微任务（优先级从高到低）：
  1. Promise.then（首选）
  2. MutationObserver
  3. setImmediate（Node.js）
  4. setTimeout（兜底）
~~~

~~~javascript
import { ref, nextTick } from "vue";

const 消息 = ref("旧值");

async function 更新消息() {
  消息.value = "新值";

  // 此时 DOM 还没更新
  console.log(document.getElementById("消息").textContent);  // "旧值"

  await nextTick();

  // 现在 DOM 已更新
  console.log(document.getElementById("消息").textContent);  // "新值"
}
~~~

### 题目4：computed 和 watch 的区别

| | computed | watch |
|---|---|---|
| 返回值 | 有返回值（计算结果） | 没有返回值（执行副作用） |
| 缓存 | ✅ 有缓存（依赖不变就不重新计算） | ❌ 没有缓存 |
| 异步 | ❌ 不能有异步操作 | ✅ 可以有异步操作 |
| 用途 | 派生状态（一个值依赖另一个值） | 副作用（数据变化时执行操作） |

~~~javascript
import { ref, computed, watch, watchEffect } from "vue";

const 原价 = ref(100);
const 折扣 = ref(0.8);

// ========== computed：派生状态 ==========
const 售价 = computed(() => 原价.value * 折扣.value);
// 缓存：原价和折扣不变时，多次访问售价不会重新计算

// ========== watch：监听变化 ==========
watch(原价, (新值, 旧值) => {
  console.log(`原价从 ${旧值} 变成了 ${新值}`);
  // 可以执行副作用：发请求、操作 DOM 等
});

// ========== watchEffect：自动收集依赖 ==========
watchEffect(() => {
  console.log(`售价：${原价.value * 折扣.value}`);
  // 自动追踪用到的响应式数据
  // 原价或折扣变化时自动重新执行
});

// ========== watch 的深度监听 ==========
const 菜品 = ref({ 名字: "红烧肉", 价格: 38 });
watch(菜品, (新值) => {
  console.log("菜品变了：", 新值);
}, { deep: true });  // 深度监听对象内部变化

// ========== watch 的立即执行 ==========
watch(原价, (新值) => {
  console.log("原价：", 新值);
}, { immediate: true });  // 立即执行一次（不等变化）
~~~

---

## 终极记忆卡片

~~~
套路1：响应式原理
  Vue2 → Object.defineProperty（getter/setter 劫持每个属性）
    问题：不能监听新增/删除属性、数组下标
  Vue3 → Proxy（代理整个对象，拦截所有操作）
    优势：惰性代理、支持 Map/Set、性能更好
  ref → 包装基本类型，.value 访问
  reactive → 包装对象，直接访问
  依赖收集 → getter 里 track，setter 里 trigger

套路2：组件通信
  props/emit → 父子通信（最常用）
  provide/inject → 跨层级通信
  pinia → 全局状态管理（defineStore + state/getters/actions）
  storeToRefs → 解构 store 时保持响应式

套路3：生命周期
  Vue2 → beforeCreate / created / mounted / updated / destroyed
  Vue3 → setup + onMounted / onUpdated / onUnmounted
  自定义 Hooks → use 开头，返回 ref/reactive，复用逻辑

套路4：模板编译与渲染
  编译流程 → template → Parse(AST) → Transform(优化) → Generate(render函数)
  静态提升 → 静态节点只创建一次，后续复用
  PatchFlag → 标记动态节点会变化的属性，diff 时精准比较
  Block Tree → 动态节点收集到扁平数组，diff 时跳过静态节点
  虚拟 DOM → JS 对象描述 DOM 结构
  diff → 同层比较、类型不同直接替换、key 优化列表
  key → 用唯一 id，不用 index

套路5：路由与状态管理
  Vue Router → createRouter + createWebHistory
  Hash vs History → # 号区别、服务器配置区别
  路由守卫 → beforeEach（登录拦截）
  路由懒加载 → () => import()（按需加载）
  Pinia → defineStore + storeToRefs + Composition API 写法

套路6：高级特性
  Keep-alive → 缓存组件实例，activated/deactivated 生命周期
    include/exclude 控制缓存范围，max 限制缓存数量
  自定义指令 → mounted/updated 钩子里操作 DOM
    v-permission / v-focus / v-debounce
  插件 → install 方法，注册全局方法/组件/指令/provide
  渲染函数 → h(标签, 属性, 子节点) 替代 template

综合高频题
  Vue2 vs Vue3 区别 → 10 点对比
  Vue3 为什么快 → 静态提升 + PatchFlag + Block Tree
  computed vs watch → 计算属性（缓存）vs 侦听器（副作用）
  nextTick → 等 DOM 更新后执行
~~~
