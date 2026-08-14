Function.prototype.myBind = function (context, ...args) {
    const originThis = this;
    context = context == null ? globalThis : context;

    if (typeof context !== 'object' && typeof context !== 'function') {
        context = Object(context);
    }

    const bindFn = function (...otherArgs) {
        // 被new调用时，this指向自己
        const truthThis = this instanceof bindFn ? this : context;
        // args是初始化参数，otherArgs是剩余补充参数
        return originThis.apply(truthThis, [...args, ...otherArgs]);
    }

    // 被new调用之后需要处理原型链；
    if (originThis.prototype) {
        // 根据原始函数的原型来创建并指向绑定函数的原型
        bindFn.prototype = Object.create(originThis.prototype);
    }

    return bindFn;
};

const makeFood = function (f1, f2) {
    console.log(`${this.name}做了${f1}和${f2}!`);
}

const Wu = { name: "WZL" }

const WuMakeFood = makeFood.myBind(Wu, "麻辣牛肉", "四喜丸子");

console.log(WuMakeFood());

const WuMakeBeef = makeFood.myBind(Wu, "水煮牛肉");

console.log(WuMakeBeef("卤水牛肉"));

const canteen = function (name, city) {
    this.name = name;
    this.city = `中国 ${city}`;
}

canteen.prototype.WelCome = function () {
    console.log(`欢迎 ${this.name}，来自${this.city}!`);
};

const newCanteen = canteen.myBind({ name: "全聚德", city: "北京" }, "hubei");
const HNCanteen = new newCanteen("湖南");
console.log(HNCanteen.name);
console.log(HNCanteen.city);
HNCanteen.WelCome();
console.log(HNCanteen instanceof canteen);

const myCreate = function (proto, properties) {
    // proto是基座，基于proto来创建，proto必须是对象或者null
    if (typeof proto !== 'object') {
        throw new TypeError("proto必须为object或null");
    }

    let newObj;

    // proto为null时，创建一个无属性的空对象；
    if (proto === null) {
        newObj = {};
        newObj.__proto__ = null;
    } else {
        // proto为object时，创建一个空函数，它的原型指向proto
        const Foo = function () { };
        Foo.prototype = proto;
        newObj = new Foo();
    }

    if (properties !== undefined) {
        Object.defineProperties(newObj, properties);
    }

    return newObj;
};
const obj1 = myCreate(null);
console.log(obj1);

const obj2 = myCreate({ name: 'NNN' });
console.log(obj2.name);
