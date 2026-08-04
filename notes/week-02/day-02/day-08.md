# 第 8 天：防抖、节流与深拷贝

## 一、今日学习目标

- 理解防抖和节流的区别及使用场景。
- 手写 `debounce` 和 `throttle`。
- 将防抖应用到搜索输入框。
- 理解浅拷贝为什么会共享嵌套对象。
- 实现支持对象、数组、`Date` 和循环引用的基础深拷贝。

---

## 二、防抖 debounce

### 1. 什么是防抖

防抖的核心是：**连续触发时不断重新计时，停止触发一段时间后，只执行最后一次。**

例如搜索框设置了 500ms 防抖：

1. 用户输入 `j`，创建一个 500ms 定时器。
2. 500ms 内继续输入 `a`，取消原定时器并重新计时。
3. 用户继续输入时，重复取消和重新计时。
4. 用户停止输入 500ms 后，才使用最后的内容执行搜索。

适合场景：

- 搜索框输入请求
- 表单内容校验
- 窗口尺寸改变后的计算
- 避免按钮短时间内被连续提交

### 2. 搜索框中的防抖

```js
function search(keyword) {
  console.count("执行搜索");
  resultElement.textContent = "正在搜索：" + keyword;
}

function debounce(fn, delay) {
  let timerId;

  return function (...args) {
    // 保存本次调用返回函数时的this
    const context = this;

    // 取消上一次尚未执行的任务
    clearTimeout(timerId);

    // 重新开始计时
    timerId = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

const debouncedSearch = debounce(search, 500);

searchInput.addEventListener("input", function (event) {
  debouncedSearch(event.target.value);
});
```

### 3. 关键点

- `debounce(search, 500)` 不会立即执行 `search`，而是返回一个新函数。
- `timerId` 必须放在返回函数外，才能被多次调用共同使用，这里利用了闭包。
- `clearTimeout(undefined)` 不会报错，所以第一次调用也可以直接清除。
- `args` 保存本次调用传入的所有参数，搜索内容就在其中。
- `context` 保存返回函数被调用时的 `this`。
- `apply` 的第二个参数本来就要求数组，因此写 `fn.apply(context, args)`，不能写成 `fn.apply(context, ...args)`。
- `input` 事件在输入框的值发生变化时触发，并不只是键盘按下时触发；粘贴、删除等操作也能触发。

---

## 三、节流 throttle

### 1. 什么是节流

节流的核心是：**连续触发期间不重新计时，每隔固定时间最多执行一次。**

本次实现属于“立即执行型节流”：第一次触发立即执行，等待期间的触发被忽略，时间结束后重新允许执行。

适合场景：

- 页面滚动位置更新
- 鼠标移动事件
- 拖拽事件
- 高频点击或高频计算

### 2. 节流代码

```js
function throttle(fn, delay) {
  // true表示当前允许执行
  let canRun = true;

  return function (...args) {
    // 等待期间直接忽略本次触发
    if (canRun === false) {
      return;
    }

    // 关闭开关
    canRun = false;

    const context = this;

    // 第一次触发立即执行
    fn.apply(context, args);

    // 等待结束后重新打开开关
    setTimeout(function () {
      canRun = true;
    }, delay);
  };
}
```

`canRun` 必须位于返回函数外部。这样多次触发时访问的才是同一个开关；如果写在内部，每次调用都会重新变成 `true`，节流就会失效。

### 3. 防抖与节流对比

| 对比项 | 防抖 | 节流 |
| --- | --- | --- |
| 连续触发时 | 取消旧计时并重新计时 | 等待期间忽略触发，不重新计时 |
| 执行特点 | 停止触发后执行最后一次 | 固定时间内最多执行一次 |
| 搜索框最终请求 | 适合 | 通常不作为首选 |
| 页面持续滚动 | 通常不适合实时更新 | 适合 |

记忆方法：

- 防抖：**你不停，我不执行。**
- 节流：**你不停，我也按固定频率执行。**

---

## 四、浅拷贝

```js
const original = {
  name: "小明",
  address: {
    city: "上海"
  }
};

const copied = { ...original };

copied.name = "小红";
copied.address.city = "北京";
```

结果：

```js
console.log(original.name);         // 小明
console.log(original.address.city); // 北京
console.log(copied === original);   // false
console.log(copied.address === original.address); // true
```

原因：展开语法只创建了新的外层对象。

- `name` 是基本类型，复制的是值，修改后互不影响。
- `address` 是对象，浅拷贝复制的是对象引用，两个外层对象仍然使用同一个 `address`。

浅拷贝：**创建新的第一层对象，但嵌套对象和数组仍可能与原数据共享引用。**

---

## 五、深拷贝的基础思路

深拷贝要求每一层对象和数组都创建新的数据，因此需要递归：

1. 基本类型和 `null` 直接返回。
2. 日期创建新的 `Date` 实例。
3. 数组创建 `[]`，普通对象创建 `{}`。
4. 遍历每个属性。
5. 对每个属性再次执行 `deepClone`。

### 为什么需要递归

对象内部可能还有对象，数组内部也可能还有对象。只复制第一层不能断开所有引用，因此需要一层一层继续复制。

### 为什么 Date 需要单独处理

`typeof date` 的结果也是 `"object"`。如果把日期当作普通对象处理，会创建 `{}`；而且 `Object.keys(date)` 通常为空，日期值会丢失。

正确方式：

```js
new Date(value.getTime());
```

这样新旧日期的时间值相同，但它们是两个不同的对象。

---

## 六、循环引用与 WeakMap

循环引用示例：

```js
const originalUser = {
  name: "小明"
};

originalUser.self = originalUser;
```

如果没有缓存，复制 `self` 时会再次复制原对象，然后继续复制它的 `self`，最终形成无限递归。

`WeakMap` 在这里保存：

```text
原对象 → 已经创建的新对象
```

复制规则：

1. 复制一个对象前，先检查它是否在缓存中。
2. 如果存在，直接返回之前创建的新对象。
3. 如果不存在，先创建新对象。
4. 在递归属性之前，把“原对象 → 新对象”放入缓存。
5. 递归时继续传递同一个缓存。

必须先执行 `cache.set(value, result)` 再递归。这样再次遇到同一个原对象时，才能直接找到新对象并终止循环。

---

## 七、最终版 deepClone

```js
function deepClone(value, cache = new WeakMap()) {
  // 基本类型和null直接返回
  if (value === null || typeof value !== "object") {
    return value;
  }

  // 已复制过的对象直接返回对应的新对象
  if (cache.has(value)) {
    return cache.get(value);
  }

  // 单独处理Date
  if (value instanceof Date) {
    const copiedDate = new Date(value.getTime());
    cache.set(value, copiedDate);
    return copiedDate;
  }

  // 创建新的数组或普通对象
  const result = Array.isArray(value) ? [] : {};

  // 必须在递归属性之前缓存
  cache.set(value, result);

  const keys = Object.keys(value);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    // 复制当前属性，并一直传递同一个cache
    result[key] = deepClone(value[key], cache);
  }

  return result;
}
```

### WeakMap 还能保留共享关系

如果原对象中的两个属性指向同一个对象：

```js
const sharedInfo = { score: 100 };

const originalData = {
  firstInfo: sharedInfo,
  secondInfo: sharedInfo
};
```

深拷贝之后：

```js
copiedData.firstInfo === copiedData.secondInfo; // true
copiedData.firstInfo === sharedInfo;            // false
```

这说明新数据保留了原来的共享关系，但不会继续引用原对象。

### 当前基础版的范围

目前版本可以处理：

- 基本类型和 `null`
- 普通对象
- 数组
- `Date`
- 循环引用
- 重复引用同一个对象

暂未处理 `Map`、`Set`、`RegExp`、Symbol 属性、不可枚举属性和属性描述符等特殊情况。这些可以在以后学习中扩展。

---

## 八、开发者工具验收结果

### 防抖测试

快速输入 `javascript`：

- 搜索函数执行次数：1 次。
- 最终收到的参数：`javascript`。

### 节流测试

设置 500ms 节流，持续滚动约 3 秒：

- 大约执行 6 次，结果合理。
- 停止滚动后不会额外执行一次。

原因：本次实现是立即执行型节流，没有保存等待期间的最后一次调用，因此不具备尾部执行功能。

---

## 九、今日容易出错的地方

1. 500ms 节流并不是持续操作 3 秒只执行一次，而是每 500ms 最多执行一次。
2. 防抖中的 `timerId`、节流中的 `canRun` 都要通过闭包保存。
3. `context` 保存的是返回函数调用时的 `this`，不是定义 `debounce` 或 `throttle` 时的 `this`。
4. `apply` 的第二个参数直接传数组：`fn.apply(context, args)`。
5. 深拷贝递归时要传当前属性：`deepClone(value[key], cache)`。
6. 每一层递归必须使用同一个 `cache`。
7. 缓存必须在递归属性之前写入，否则循环引用仍会无限递归。
8. 浅拷贝只断开第一层引用，不会自动复制嵌套对象。

---

## 十、口述复习

尝试不看代码回答：

1. 什么是防抖？搜索框为什么适合防抖？
2. 什么是节流？滚动事件为什么适合节流？
3. 防抖和节流在“是否重新计时”方面有什么区别？
4. `timerId` 和 `canRun` 为什么需要形成闭包？
5. `fn.apply(context, args)` 分别解决了什么问题？
6. 浅拷贝为什么会共享嵌套对象？
7. 深拷贝为什么需要递归？
8. `Date` 为什么要单独复制？
9. `WeakMap` 中保存的对应关系是什么？
10. 为什么必须在递归之前执行 `cache.set(value, result)`？

## 今日总结

- 防抖关注“停止触发后的最后一次”。
- 节流关注“持续触发时的固定执行频率”。
- 浅拷贝只复制第一层，深拷贝递归复制每一层。
- `WeakMap` 记录“原对象 → 新对象”，解决循环引用并保留共享引用关系。
