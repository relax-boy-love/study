第 3 天：作用域、变量提升与闭包

## 今日目标

- 理解全局作用域、函数作用域和块级作用域
- 理解词法作用域与作用域链
- 掌握 `var`、`let`、`const` 的提升区别
- 理解暂时性死区（TDZ）
- 理解闭包的形成、用途和内存风险
- 能够实现计数器、`once` 和缓存函数

---

## 一、作用域

作用域决定一个变量可以在哪些位置被访问。

### 1. 全局作用域

```js
const globalName = "全局变量";

function showName() {
  console.log(globalName);
}

showName();
```

函数内部可以沿作用域链访问外部变量。

### 2. 函数作用域

```js
function test() {
  const functionName = "函数变量";
  console.log(functionName);
}

test();
```

`functionName`只能在`test`函数及其内部嵌套作用域中访问。函数外访问会产生：

```text
ReferenceError: functionName is not defined
```

### 3. 块级作用域

`let`和`const`具有块级作用域：

```js
if (true) {
  const message = "hello";
  let count = 1;

  console.log(message);
  console.log(count);
}
```

`message`和`count`只能在`if`的大括号中访问。

`var`没有块级作用域：

```js
if (true) {
  var score = 100;
}

console.log(score); // 100
```

> 注意：故意产生错误的示例应分开运行。一个未捕获错误会阻止当前脚本后面的代码继续执行。

---

## 二、词法作用域与作用域链

词法作用域表示：函数能够访问哪些变量，由函数定义的位置决定，而不是调用的位置决定。

```js
const globalValue = "global";

function outer() {
  const outerValue = "outer";

  function inner() {
    const innerValue = "inner";

    console.log(globalValue);
    console.log(outerValue);
    console.log(innerValue);
  }

  inner();
}

outer();
```

变量查找顺序：

```text
当前作用域
    ↓
外层词法作用域
    ↓
更外层作用域
    ↓
全局作用域
    ↓
仍未找到：ReferenceError
```

作用域关系：

```text
全局作用域
├── globalValue
└── outer函数

outer函数作用域
├── outerValue
└── inner函数

inner函数作用域
└── innerValue
```

### 变量遮蔽

```js
const value = "全局";

function outer() {
  const value = "outer";

  function inner() {
    const value = "inner";
    console.log(value);
  }

  inner();
}

outer();
```

当前作用域找到变量后就停止向外查找，所以输出`"inner"`。这种同名内层变量遮住外层变量的现象叫变量遮蔽。

---

## 三、变量提升

JavaScript执行代码前，会先处理当前作用域中的声明。

### 1. `var`

```js
console.log(username); // undefined

var username = "小明";

console.log(username); // 小明
```

可以近似理解为：

```js
var username;

console.log(username);
username = "小明";
console.log(username);
```

`var`的声明被提升并初始化为`undefined`，但赋值不会提升。

### 2. `let`和`const`

```js
console.log(age);
let age = 18;
```

常见错误：

```text
ReferenceError: Cannot access 'age' before initialization
```

`let`和`const`的声明也会被JavaScript提前处理，但在声明语句执行前不能访问。

### 3. 函数声明

```js
showMessage();

function showMessage() {
  console.log("hello");
}
```

函数声明的函数名和函数体会一起提升，因此可以在声明位置之前调用。

### 4. 函数表达式

```js
showMessage();

const showMessage = function () {
  console.log("hello");
};
```

这里的`showMessage`遵循`const`规则，在初始化前处于暂时性死区，不能提前调用。

> 函数声明和同名的`const`函数表达式不能放在同一作用域测试，否则会产生重复声明错误。

---

## 四、暂时性死区（TDZ）

暂时性死区是：

```text
从当前作用域开始
→ 到let或const声明语句执行完成
```

示例：

```js
{
  // TDZ开始

  console.log(age);

  let age = 18;
  // TDZ结束
}
```

处于暂时性死区不代表JavaScript不知道变量存在，而是变量尚未完成初始化，因此不能访问。

---

## 五、闭包

闭包可以理解为：

> 一个函数与它定义时所在的词法环境的组合。内部函数即使在外层函数执行结束后，仍然能够访问它所引用的外层变量。

典型结构：

```js
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();
```

引用关系：

```text
counter
└── 返回的内部函数
    └── 引用createCounter调用时的词法环境
        └── count
```

调用：

```js
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

`count`没有每次恢复为0，是因为每次调用的都是同一个内部函数，它一直引用着同一次`createCounter()`调用产生的`count`。

### 两个闭包互不影响

```js
const counterA = createCounter();
const counterB = createCounter();
```

每次调用`createCounter()`都会创建独立的词法环境：

```text
counterA → 第一次调用中的count
counterB → 第二次调用中的count
```

### 闭包形成的关键

- 存在内部函数
- 内部函数使用了外层变量
- 内部函数被外部继续引用或以后仍会执行

`return`是把内部函数保存到外部的常见方式，但不是形成闭包的唯一方式。事件处理函数、定时器回调也经常形成闭包。

---

## 六、闭包练习一：计数器

```js
function createCounter(initialValue) {
  let count = initialValue;

  return {
    increment: function () {
      count++;
      return count;
    },

    decrement: function () {
      count--;
      return count;
    },

    getValue: function () {
      return count;
    },

    reset: function () {
      count = initialValue;
      return count;
    }
  };
}
```

测试：

```js
const counter = createCounter(10);

console.log(counter.getValue());
console.log(counter.increment());
console.log(counter.increment());
console.log(counter.decrement());
console.log(counter.reset());
console.log(counter.getValue());
```

闭包保存：

```text
count
initialValue
```

返回到外部的是一个对象，对象中的四个方法共享同一个词法环境。

---

## 七、闭包练习二：`once`

`once(fn)`用于保证原函数只执行一次，后续调用返回第一次执行的结果。

```js
function once(fn) {
  let hasRun = false;
  let result;

  return function (...args) {
    if (hasRun === false) {
      result = fn(...args);
      hasRun = true;
    }

    return result;
  };
}
```

测试：

```js
function pay(amount) {
  console.log("支付了：" + amount);
  return "支付成功";
}

const payOnce = once(pay);

console.log(payOnce(100));
console.log(payOnce(200));
console.log(payOnce(300));
```

闭包保存：

```text
fn
hasRun
result
```

### `...args`的两个作用

收集参数：

```js
function (...args)
```

调用时传入的多个参数会被收集为数组。

展开参数：

```js
fn(...args)
```

数组中的参数会被展开，再分别传给原函数。

> 易错点：变量名必须统一使用`result`，不能混写成`ruslt`、`reuslt`，否则会产生`ReferenceError`。

---

## 八、闭包练习三：缓存函数

```js
function memoize(fn) {
  const cache = {};

  return function (number) {
    if (cache[number] === undefined) {
      cache[number] = fn(number);
    }

    return cache[number];
  };
}
```

测试：

```js
function calculateSquare(number) {
  console.log("正在计算：" + number);
  return number * number;
}

const cachedSquare = memoize(calculateSquare);

console.log(cachedSquare(5));
console.log(cachedSquare(5));
console.log(cachedSquare(6));
console.log(cachedSquare(5));
```

闭包保存：

```text
fn
cache
```

执行流程：

```text
检查缓存
├── 已存在：直接返回
└── 不存在：执行fn → 保存结果 → 返回结果
```

当前基础版本有一个边界：如果`fn`的正确返回值就是`undefined`，代码会误认为没有缓存。后续可以使用`Object.hasOwn()`或`Map.has()`准确判断缓存键是否存在。

---

## 九、闭包与内存

闭包本身不等于内存泄漏。

内存风险的关键是：

> 已经不再需要的数据，是否仍然被长期引用而无法释放。

缓存函数可能产生内存问题的情况：

- 不断传入不同参数
- 缓存持续增长
- 缓存没有数量限制
- 缓存没有过期时间
- 不再需要缓存时，包装函数仍然被长期引用

其他常见情况：

- 没有清理的定时器
- 没有移除的事件监听
- 闭包长期引用大数组或大对象

常见处理方式：

- 限制缓存数量
- 设置缓存过期时间
- 不需要时清空缓存
- 使用`clearInterval()`清理定时器
- 使用`removeEventListener()`移除事件监听
- Vue组件卸载时清理副作用

---

## 十、易错点

### 1. 作用域错误

找不到变量：

```text
ReferenceError: xxx is not defined
```

暂时性死区：

```text
ReferenceError: Cannot access 'xxx' before initialization
```

两者含义不同。

### 2. 对变量提升的错误理解

错误：

```text
let和const不会提升
```

正确理解：

```text
var：提升并初始化为undefined
let、const：声明被提前处理，但初始化前处于TDZ
```

### 3. 对闭包的错误理解

闭包保存变量不是因为`return count`，而是因为返回的函数仍然引用外层词法环境。

### 4. `once`拼写不一致

以下变量不是同一个变量：

```js
result
ruslt
reuslt
```

应统一为：

```js
result
```

### 5. 故意报错的代码不能连续测试

前一段代码产生未捕获错误后，后面的代码不会继续执行。测试报错案例时应分开运行或注释掉已经验证的错误行。

---

## 十一、复习自测

先独立回答，再回看笔记：

1. 什么是作用域链？
2. 函数外为什么不能访问函数内部变量？
3. `var`为什么可以穿过`if`代码块？
4. `var`、`let`和`const`的提升表现有什么区别？
5. 什么是暂时性死区？
6. 函数声明和函数表达式的提升表现有什么区别？
7. 闭包保存外层变量的真正原因是什么？
8. 两次调用`createCounter()`为什么不会共享`count`？
9. `once`闭包保存了哪些内容？
10. `memoize`闭包保存了哪些内容？
11. `...args`在函数参数和函数调用中分别有什么作用？
12. 闭包一定会造成内存泄漏吗？
13. 无限制缓存为什么可能导致内存问题？

## 今日一句话总结

```text
作用域链决定变量去哪里找，变量提升决定声明前能否访问，闭包让函数在外层执行结束后仍能使用定义时的外层变量。
```
