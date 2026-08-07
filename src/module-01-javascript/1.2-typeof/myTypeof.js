// 要求能准确区分：undefined、null、boolean、number、string、symbol、bigint、function、array、object、date、regexp、map、set、weakmap、weakset、promise、error
function myTypeof(value) {
    // 先处理特殊的null类型
    if (value === null) {
        return 'null';
    }

    // 如果是基本类型则直接用typeof返回即可，避免函数调用影响性能
    if (typeof value !== "object") {
        return typeof value;
    }

    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

// undefined
console.log(myTypeof(undefined));
// null
console.log(myTypeof(null));
// boolean
console.log(myTypeof(true));
// number
console.log(myTypeof(1));
// string
console.log(myTypeof('1'));
// symbol
console.log(myTypeof(Symbol('1')));
// bigint
console.log(myTypeof(24n));
// function
console.log(myTypeof(function(){}));
// array
console.log(myTypeof([1, 2]));
// object
console.log(myTypeof({}));
// date
console.log(myTypeof(new Date()));
// regexp
console.log(myTypeof(new RegExp()));
// map
console.log(myTypeof(new Map()));
// set
console.log(myTypeof(new Set()));
// weakmap
console.log(myTypeof(new WeakMap()));
// weakset
console.log(myTypeof(new WeakSet()));
// promise
console.log(myTypeof(Promise.resolve()));
// error
console.log(myTypeof(new Error));

// NaN，打印number
console.log(myTypeof(NaN));
// Infinity，打印number
console.log(myTypeof(Infinity));
// ()=>{}，打印function
console.log(myTypeof(()=>{}));
// class Foo {}，打印function
console.log(myTypeof(class Foo {}));
