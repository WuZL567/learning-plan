/**
 * 手写深拷贝
 *
 * 要求：
 * 1. 实现基础版深拷贝（处理对象、数组、基本类型）
 * 2. 实现完整版深拷贝（处理循环引用、Date、RegExp）
 * 3. 用注释写清楚每个判断的作用
 *
 * 验收标准：
 * - 代码能正确运行（通过下方测试用例）
 * - 处理了循环引用（用 WeakMap）
 * - 处理了 Date 和 RegExp
 * - 注释用自己的话解释逻辑
 */

// 在这里实现你的 deepClone 函数

function deepClone(obj, map = new WeakMap()) {
  // 基本类型，直接返回自身
  if (obj == null || typeof obj !== 'object') return obj;
  // 映射中已存在就直接返回
  if (map.has(obj)) return map.get(obj);
  // 特殊类型处理
  // Date类型
  if (obj instanceof Date) return new Date(obj);
  // RegExp类型
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  // Map类型
  if (obj instanceof Map) {
    const cloneMap = new Map();
    map.set(obj, cloneMap);
    obj.forEach((value, key) => {
      // 遍历Map
      cloneMap.set(deepClone(key, map), deepClone(value, map));
    });
    return cloneMap;
  }
  // Set类型
  if (obj instanceof Set) {
    const cloneSet = new Set();
    map.set(obj, cloneSet);
    obj.forEach((value) => {
      cloneSet.add(deepClone(value, map));
    });
    return cloneSet;
  }
  // 数组和对象类型
  const cloneObj = Array.isArray(obj) ? [] : {};
  map.set(obj, cloneObj);
  for (const key of Reflect.ownKeys(obj)) {
    // 递归克隆
    cloneObj[key] = deepClone(obj[key], map);
  }
  return cloneObj;
}


// 测试用例（不要修改）
const obj = {
  num: 1,
  str: 'hello',
  arr: [1, 2, { a: 3 }],
  date: new Date(),
  reg: /test/gi,
  nested: { a: { b: { c: 1 } } }
}

// 循环引用测试
obj.self = obj

const cloned = deepClone(obj)

console.log('基本类型测试:', cloned.num === 1 && cloned.str === 'hello')
// 基本类型测试: true
console.log('数组深拷贝测试:', cloned.arr[2].a === 3 && cloned.arr[2] !== obj.arr[2])
// 数组深拷贝测试: true
console.log('Date测试:', cloned.date instanceof Date && cloned.date !== obj.date)
// Date测试: true
console.log('RegExp测试:', cloned.reg instanceof RegExp && cloned.reg !== obj.reg)
// RegExp测试: true
console.log('循环引用测试:', cloned.self === cloned)
// 循环引用测试: true
console.log('嵌套对象测试:', cloned.nested.a.b.c === 1 && cloned.nested !== obj.nested)
// 嵌套对象测试: true
