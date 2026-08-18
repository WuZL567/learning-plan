/**
 * 手写深拷贝 deepClone
 *
 * 要求：实现一个深拷贝函数，处理以下所有边界 case
 * 1. 基础类型（string/number/boolean/null/undefined）直接返回
 * 2. 循环引用不报错（用 WeakMap 记录已拷贝对象）
 * 3. 数组拷贝后是全新数组
 * 4. Symbol 键属性也要拷贝
 * 5. Date / RegExp 拷贝后仍是原类型
 * 6. 函数直接引用即可
 * 7. 嵌套多层对象互不影响
 *
 * 验收标准：
 * - 代码可运行，下方测试用例全部输出符合预期
 * - 注释用自己的话解释关键逻辑
 * - 每个边界 case 都有对应的测试代码
 */

function deepClone(target, map = new WeakMap()) {
  // 提示：第一步先判断基础类型
  // 提示：第二步查 WeakMap 处理循环引用
  // 提示：第三步区分 数组 / Date / RegExp / 普通对象，递归拷贝
  if (target === null || typeof target !== "object") {
    // 基本类型直接返回自身
    return target;
  }
  // 已存在map中的直接返回
  if (map.has(target)) {
    return map.get(target);
  }

  // 特殊的RegExp，Date，Map，Set类型处理
  if (target instanceof RegExp) {
    return new RegExp(target.source, target.flags);
  }
  if (target instanceof Date) {
    return new Date(target);
  }
  if (target instanceof Map) {
    const newMap = new Map();
    map.set(target, newMap);
    target.forEach((value, key) => {
      // 递归
      newMap.set(deepClone(key, map), deepClone(value, map));
    });
    return newMap;
  }
  if (target instanceof Set) {
    const newSet = new Set();
    map.set(target, newSet);
    target.forEach((value) => {
      // 递归
      newSet.add(deepClone(value, map));
    });
    return newSet;
  }

  const clone = Array.isArray(target) ? [] : {};
  map.set(target, clone);

  // Reflect.ownKeys(target) 只返回自身键（不含原型链）
  for (const key of Reflect.ownKeys(target)) {
    // 递归
    clone[key] = deepClone(target[key], map);
  }

  return clone;
}

// ============ 测试用例（不要删除，验收时运行） ============
const tests = {
  '基础类型': () => {
    console.log(deepClone(1) === 1);
    console.log(deepClone('a') === 'a');
    console.log(deepClone(null) === null);
    console.log(deepClone(undefined) === undefined);
  },
  '嵌套对象': () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
    const clone = deepClone(obj);
    clone.b.d.e = 99;
    console.log(obj.b.d.e === 3 && clone.b.d.e === 99);
  },
  '数组': () => {
    const arr = [1, [2, [3]]];
    const clone = deepClone(arr);
    clone[1][1][0] = 100;
    console.log(arr[1][1][0] === 3);
  },
  '循环引用': () => {
    const a = { name: 'a' };
    a.self = a;
    const clone = deepClone(a);
    console.log(clone.self === clone && clone !== a);
  },
  'Symbol键': () => {
    const s = Symbol('key');
    const obj = { [s]: 42 };
    const clone = deepClone(obj);
    console.log(Object.getOwnPropertySymbols(clone)[0] === s && clone[s] === 42);
  },
  'Date和RegExp': () => {
    const obj = { date: new Date('2026-01-01'), reg: /abc/g };
    const clone = deepClone(obj);
    console.log(clone.date instanceof Date && clone.date !== obj.date);
    console.log(clone.reg instanceof RegExp && clone.reg !== obj.reg);
  },
  '函数': () => {
    const fn = () => 'hello';
    const clone = deepClone(fn);
    console.log(clone === fn);
  },
};

// 运行全部测试
let passCount = 0;
let totalCount = 0;
for (const [name, test] of Object.entries(tests)) {
  totalCount++;
  try {
    test();
    passCount++;
    console.log(`[通过] ${name}`);
  } catch (e) {
    console.log(`[报错] ${name}: ${e.message}`);
  }
}
console.log(`\n测试结果: ${passCount} / ${totalCount}`);
