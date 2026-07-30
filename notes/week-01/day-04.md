第 4 天：`this`与函数

## 今日目标

- 理解普通函数中的`this`
- 区分默认绑定、隐式绑定、显式绑定和`new`绑定
- 理解箭头函数中的`this`
- 掌握`call`、`apply`、`bind`
- 理解简化版`myCall`和`myBind`的实现过程
- 能够根据函数调用位置判断`this`

---

## 一、判断`this`的核心原则

普通函数中的`this`主要由函数的调用方式决定，而不是由函数的定义位置决定。

判断顺序：

```text
1. 是否是箭头函数？
2. 是否使用new调用？
3. 是否使用call、apply或bind？
4. 是否通过“对象.方法()”调用？
5. 如果都不是，就是默认绑定
```

绑定方式总结：

| 调用方式 | 绑定类型 | `this` |
|---|---|---|
| `fn()` | 默认绑定 | 严格模式下为`undefined` |
| `obj.fn()` | 隐式绑定 | 点号前面的`obj` |
| `fn.call(obj)` | 显式绑定 | 指定的`obj` |
| `fn.apply(obj)` | 显式绑定 | 指定的`obj` |
| `fn.bind(obj)` | 显式绑定 | 绑定函数保存的`obj` |
| `new Fn()` | `new`绑定 | 新创建的对象 |
| 箭头函数 | 词法`this` | 定义位置外层作用域中的`this` |

---

## 二、默认绑定

```js
"use strict";

function showThis() {
  console.log(this);
}

showThis();
```

`showThis()`是普通函数直接调用，属于默认绑定。

```text
非严格模式的浏览器普通脚本：this通常是window
严格模式：this是undefined
```

如果严格模式下执行：

```js
this.name
```

会产生类似错误：

```text
TypeError: Cannot read properties of undefined
```

### 全局对象

浏览器中的全局对象通常是：

```js
window
```

跨环境访问全局对象可以使用：

```js
globalThis
```

---

## 三、隐式绑定

```js
const student = {
  name: "小红",

  introduce: function () {
    console.log(this.name);
  }
};

student.introduce();
```

调用形式是：

```text
student.introduce()
```

点号前面是`student`，所以`introduce`中的`this`指向`student`。

### 方法借用

```js
const user = {
  name: "小明",

  showName: function () {
    console.log(this.name);
  }
};

const admin = {
  name: "管理员",
  showName: user.showName
};

admin.showName();
```

虽然函数最初写在`user`中，但最后通过`admin.showName()`调用，因此`this`指向`admin`，输出`"管理员"`。

普通函数不会永久记住它最初属于哪个对象。

### 方法丢失

```js
"use strict";

const user = {
  name: "小明",

  showThis: function () {
    console.log(this);
  }
};

const fn = user.showThis;
fn();
```

赋值时只取出了函数本身：

```text
user.showThis() → 对象方法调用
fn()            → 普通函数直接调用
```

调用形式从`对象.方法()`变成`函数()`后，原对象的隐式绑定丢失。严格模式下，`fn()`中的`this`是`undefined`。

---

## 四、普通嵌套函数与箭头函数

### 1. 普通嵌套函数

```js
"use strict";

const user = {
  name: "小明",

  showName: function () {
    function inner() {
      console.log(this);
    }

    inner();
  }
};

user.showName();
```

关系：

```text
user.showName()
└── showName中的this → user

inner()
└── 独立的普通函数直接调用
    └── inner中的this → undefined
```

普通嵌套函数不会自动继承外层普通函数的`this`。

需要区分：

```text
普通变量：沿词法作用域链查找
普通函数的this：根据调用方式决定
```

### 2. 箭头函数

```js
const user = {
  name: "小明",

  showName: function () {
    const inner = () => {
      console.log(this.name);
    };

    inner();
  }
};

user.showName();
```

箭头函数没有自己的`this`，它使用定义位置外层`showName`中的`this`。

```text
showName中的this → user
inner中的this    → 使用外层showName的this
```

最终读取`user.name`。

### 不建议直接用箭头函数编写需要`this`的对象方法

```js
const user = {
  name: "小明",

  showName: () => {
    console.log(this.name);
  }
};
```

对象字面量的大括号不会为箭头函数创建`this`。箭头函数会继续使用对象外层的`this`，不会因为写在`user`中就自动指向`user`。

### 箭头函数不能使用`new`

箭头函数没有构造函数需要的内部构造能力，不能作为构造器：

```js
const Person = (name) => {
  this.name = name;
};

new Person("小明");
```

会产生类似错误：

```text
TypeError: Person is not a constructor
```

---

## 五、`call`、`apply`、`bind`

原函数：

```js
function introduce(greeting, city) {
  return greeting + "，我是" + this.name + "，来自" + city;
}

const user = {
  name: "小明"
};
```

### 1. `call`

```js
const result = introduce.call(user, "你好", "成都");
```

格式：

```js
函数.call(this指向, 参数1, 参数2, ...);
```

`call`做三件事：

```text
1. 将原函数中的this指定为第一个参数
2. 将后续参数逐个传给原函数
3. 立即执行原函数并返回结果
```

当前数据：

```text
原函数       → introduce
this         → user
greeting     → "你好"
city         → "成都"
返回值       → "你好，我是小明，来自成都"
```

### 2. `apply`

```js
const result = introduce.apply(user, ["早上好", "北京"]);
```

格式：

```js
函数.apply(this指向, [参数1, 参数2, ...]);
```

`apply`与`call`都会立即执行函数。主要区别是业务参数形式：

```text
call：逐个传入
apply：放在数组或类数组对象中传入
```

### 3. `bind`

```js
const boundIntroduce = introduce.bind(user, "欢迎");
```

`bind`不会立即执行`introduce`，而是返回一个绑定函数。

绑定函数保存：

```text
原函数       → introduce
this         → user
提前参数     → ["欢迎"]
```

稍后调用：

```js
const result = boundIntroduce("广州");
```

此时：

```text
提前参数     → greeting = "欢迎"
后来参数     → city = "广州"
this         → user
```

整体效果近似于：

```js
introduce.call(user, "欢迎", "广州");
```

### `call`与`bind`的核心区别

```text
call
→ 指定this
→ 立即执行
→ 返回原函数执行结果
```

```text
bind
→ 保存this和部分参数
→ 不立即执行
→ 返回一个以后执行的新函数
```

### 为什么绑定函数不会再次丢失`this`

```js
const bound = introduce.bind(user, "欢迎");
```

`bound`已经把`user`保存在内部。普通调用情况下，即使执行：

```js
bound.call(otherUser, "深圳");
```

绑定函数仍然使用绑定时保存的`user`，后续的普通`call`不能重新改变它保存的`this`。

---

## 六、`new`绑定

```js
function Person(name, age) {
  this.name = name;
  this.age = age;

  this.introduce = function () {
    console.log("我是" + this.name + "，今年" + this.age + "岁");
  };
}

const person = new Person("小明", 20);
```

`new Person()`可以先理解为：

```text
1. 创建一个新对象
2. 将Person中的this指向新对象
3. 执行Person，为新对象添加属性
4. 返回新对象
```

构造过程中：

```text
Person中的this → new创建的新对象
```

构造完成后，这个新对象被赋值给`person`。

构造函数首字母大写是开发约定，不是普通函数与构造函数之间的语法开关。关键在于是否使用`new`调用。

---

## 七、手动模拟`call`

已知：

```js
const user = {
  name: "小明"
};

function introduce(greeting, city) {
  return greeting + "，我是" + this.name + "，来自" + city;
}
```

手动改变`this`：

```js
user.tempFunction = introduce;

const result = user.tempFunction("你好", "成都");

delete user.tempFunction;
```

因为调用形式变成：

```js
user.tempFunction()
```

根据隐式绑定，`introduce`内部的`this`指向`user`。

手动模拟过程：

```text
添加临时方法
→ 通过目标对象调用
→ 保存执行结果
→ 删除临时方法
→ 返回执行结果
```

---

## 八、简化版`myCall`

```js
Function.prototype.myCall = function (context, ...args) {
  const key = Symbol("tempFunction");

  context[key] = this;

  const result = context[key](...args);

  delete context[key];

  return result;
};
```

使用：

```js
const result = introduce.myCall(user, "你好", "成都");
```

### 最难点：存在两层`this`

调用：

```js
introduce.myCall(user, "你好", "成都");
```

进入`myCall`后：

```text
myCall中的this → introduce函数
context         → user对象
args            → ["你好", "成都"]
```

原因是调用形式：

```js
introduce.myCall()
```

点号前面是`introduce`函数对象，所以`myCall`中的`this`是`introduce`。

执行：

```js
context[key] = this;
```

近似相当于：

```js
user[key] = introduce;
```

然后：

```js
context[key](...args);
```

近似相当于：

```js
user[key]("你好", "成都");
```

此时调用形式是`user.方法()`，所以原函数`introduce`执行时：

```text
introduce中的this → user
```

完整关系：

```text
introduce.myCall(user, "你好", "成都")
              ↓
myCall中的this是introduce
context是user
args是["你好", "成都"]
              ↓
临时执行user[key] = introduce
              ↓
调用user[key]("你好", "成都")
              ↓
introduce中的this指向user
              ↓
删除user[key]
              ↓
返回introduce的结果
```

### 为什么使用`Symbol`

如果固定使用：

```js
context.tempFunction
```

目标对象可能本来就有同名属性。

```js
const key = Symbol("tempFunction");
```

会创建唯一属性键，避免覆盖目标对象已有属性。

### `...args`

参数位置：

```js
function (context, ...args)
```

表示收集业务参数：

```text
"你好", "成都" → ["你好", "成都"]
```

调用位置：

```js
context[key](...args)
```

表示重新展开：

```text
["你好", "成都"] → "你好", "成都"
```

### 简化版的限制

当前练习版暂时没有完整处理：

- `context`是`null`或`undefined`
- `context`是基本类型
- 原函数抛出异常时仍保证删除临时属性

当前目标是理解改变`this`的核心机制，不要求实现完整原生规范。

---

## 九、简化版`myBind`

```js
Function.prototype.myBind = function (context, ...bindArgs) {
  const originalFunction = this;

  return function (...callArgs) {
    return originalFunction.myCall(
      context,
      ...bindArgs,
      ...callArgs
    );
  };
};
```

使用：

```js
const boundIntroduce = introduce.myBind(user, "欢迎");
const result = boundIntroduce("成都");
```

### 第一步：调用`myBind`

```js
introduce.myBind(user, "欢迎");
```

进入`myBind`后：

```text
originalFunction → introduce
context          → user
bindArgs         → ["欢迎"]
```

`myBind`此时没有执行`introduce`，只是返回了一个新函数。

### 第二步：调用返回的新函数

```js
boundIntroduce("成都");
```

新函数收集：

```text
callArgs → ["成都"]
```

随后执行：

```js
originalFunction.myCall(
  context,
  ...bindArgs,
  ...callArgs
);
```

换成当前实际数据：

```js
introduce.myCall(
  user,
  "欢迎",
  "成都"
);
```

所以原函数最终得到：

```text
this     → user
greeting → "欢迎"
city     → "成都"
```

### 为什么`myBind`里面使用`myCall`

如果直接执行：

```js
originalFunction(...bindArgs, ...callArgs);
```

这是普通函数直接调用，严格模式下`this`是`undefined`，不会自动使用保存的`context`。

使用：

```js
originalFunction.myCall(context, ...)
```

才能在真正执行原函数时，让原函数中的`this`指向绑定时保存的`context`。

`myBind`不一定必须依赖`myCall`。也可以使用原生`apply`，或者重新实现临时添加方法的过程。当前使用`myCall`是为了复用已经实现的“改变`this`并立即执行”能力。

### `bindArgs`与`callArgs`

```text
bindArgs：调用myBind时提前传入的参数
callArgs：调用绑定函数时后来传入的参数
```

合并顺序：

```js
...bindArgs,
...callArgs
```

先放提前参数，再放后来参数。

### 闭包关系

返回的新函数形成闭包，保存：

```text
originalFunction
context
bindArgs
```

因此`myBind`执行结束后，新函数仍然知道以后需要调用哪个原函数、使用哪个`this`以及带上哪些提前参数。

### 简化版限制

当前练习版没有完整处理原生`bind`的：

- 使用`new`调用绑定函数
- 原型继承关系
- `name`、`length`等函数属性

这些属于进阶内容，当前不要求掌握。

---

## 十、`call`与`bind`对照

### `call`

```js
introduce.call(user, "你好", "成都");
```

```text
指定this为user
→ 立即执行introduce
→ 返回introduce的执行结果
```

### `bind`

```js
const bound = introduce.bind(user, "你好");
bound("成都");
```

```text
保存introduce、user和"你好"
→ 返回bound函数
→ 暂时不执行introduce
→ 调用bound("成都")
→ 执行introduce并返回结果
```

一句话记忆：

```text
call：现在借用对象执行函数
bind：先打包函数、this和参数，留到以后执行
```

---

## 十一、常见错误

### 1. 把`this`理解成定义位置

普通函数的`this`通常看调用位置，不看最初写在哪个对象中。

### 2. 认为嵌套普通函数继承外层`this`

普通嵌套函数仍然根据自己的调用方式决定`this`。只有箭头函数使用外层词法`this`。

### 3. 混淆`call`与`bind`

```text
call：立即执行
bind：返回新函数
```

### 4. 在`myCall`中写死原函数

错误思路：

```js
context[key] = introduce;
```

这会让`myCall`只能处理某一个函数。

通用写法使用：

```js
context[key] = this;
```

因为`myCall`中的`this`就是调用`myCall`的原函数。

### 5. 重复声明同名`const`

```text
SyntaxError: Cannot redeclare block-scoped variable
```

不同练习使用不同变量名，或者放在不同代码块中。

### 6. 同一作用域重复声明同名函数

原练习中多次使用`introduce`作为函数名，可能发生覆盖和提升干扰。整理代码时建议使用不同名字，或者将每个练习放在独立代码块、文件中。

---

## 十二、最终自测

先独立回答，再查看笔记：

1. 普通函数的`this`主要由什么决定？
2. 严格模式下直接调用普通函数，`this`是什么？
3. `user.showName()`中的`this`为什么指向`user`？
4. 为什么`const fn = user.showName; fn()`可能丢失`this`？
5. 嵌套普通函数会自动继承外层`this`吗？
6. 箭头函数如何获得`this`？
7. 为什么不建议直接用箭头函数编写需要`this`的对象方法？
8. `call`与`apply`有什么共同点和不同点？
9. `bind`为什么不会立即执行原函数？
10. `new Person()`中的`this`指向什么？
11. `myCall`为什么要把原函数临时添加到目标对象？
12. `myCall`内部的`this`与原函数执行时的`this`分别指向什么？
13. `myCall`为什么使用`Symbol`？
14. `myBind`形成的闭包保存了什么？
15. `myBind`为什么需要在新函数调用时使用`myCall`？
16. `bindArgs`和`callArgs`分别来自哪里？

## 今日一句话总结

```text
普通函数的this看调用方式，箭头函数的this看定义位置；call现在执行，bind保存后以后执行。
```
