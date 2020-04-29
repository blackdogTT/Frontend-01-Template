## 找出 JavaScript 标准里有哪些对象是我们无法实现出来的，都有哪些特性？

### configurable

当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，也能够被删除。默认为 false。 enumerable 当且仅当该属性的 enumerable 为 true 时，该属性才能够出现在对象的枚举属性中。默认为 false。 数据描述符同时具有以下可选键值：

### value

该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。默认为 undefined。

### writable

当且仅当该属性的 writable 为 true 时，该属性才能被赋值运算符改变。默认为 false。 存取描述符同时具有以下可选键值：

### get

一个给属性提供 getter 的方法，如果没有 getter 则为 undefined。该方法返回值被用作属性值。默认为 >undefined。

### set

一个给属性提供 setter 的方法，如果没有 setter 则为 undefined。该方法将接受唯一参数，并将该参数的新值>分配给该属性。默认为 undefined。

### call

视为函数Function

### Construct

可以被new 操作符调用，根据new的规则返回对象。

### DefineOwnProperty

### callee

视为函数参数对对象，伪数组 caller

### GetPrototypeOf

对应getPrototypeOf方法 获取对象原型

### SetPrototypeOf

对应setPrototypeOf方法 设置对象原型

### GetOwnProperty

getOwnPropertyDescriptor 获取对象私有属性的描述列表

### HasProperty

hasOwnProperty 私有属性判断

### IsExtensible

isExtensible对象是否可扩展

### PreventExtensions

preventExtension控制对象是否可以添加属性

### DefineOwnProperty

defineProperty 定义对象属性

### Delete

delete 操作符

### OwnPropertyKeys

Object.keys() Object.entries() Object.values()

### Module

视为一个引入的模块

### Exports

视为一个导出的模块