# JavaScript 基础练习代码梳理（第一次上传）

## 一、练习内容概览

本次代码包含四个主要练习：

1. 数组去重
2. 字符出现次数统计与最高频字符查找
3. 对象数组多条件排序
4. DOM 计数器与事件绑定

整体完成情况不错，已经掌握了数组遍历、对象统计、排序比较函数和 DOM 事件等基础知识。

---

## 二、数组去重

### 原始数据

```js
const data = [1, 2, 2, 3, 1, 4, 4, 5];
```

### 实现代码

```js
function uniqueArray(arr) {
  const res = [];

  for (let i = 0; i < arr.length; i++) {
    if (res.indexOf(arr[i]) === -1) {
      res.push(arr[i]);
    }
  }

  return res;
}

console.log(uniqueArray(data));
```

### 实现思路

创建一个空数组 `res`，然后依次检查原数组中的元素：

- 如果元素不在 `res` 中，就添加进去。
- 如果已经存在，就跳过。
- 最后返回去重后的数组。

### 输出结果

```js
[1, 2, 3, 4, 5]
```

### 更简洁的写法

可以使用 `Set` 完成数组去重：

```js
function uniqueArray(arr) {
  return [...new Set(arr)];
}
```

---

## 三、统计字符出现次数

### 实现代码

```js
function countCharacters(str) {
  const res = {};

  str = str.toLowerCase();

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === " ") {
      continue;
    }

    if (res[char] === undefined) {
      res[char] = 1;
    } else {
      res[char]++;
    }
  }

  return res;
}

console.log(countCharacters("Hello HELLO"));
```

### 实现思路

1. 创建空对象 `res`，用于保存统计结果。
2. 使用 `toLowerCase()` 将字符串统一转换为小写。
3. 遍历字符串中的每一个字符。
4. 遇到空格时，通过 `continue` 跳过。
5. 如果字符第一次出现，将次数设置为 `1`。
6. 如果字符已经存在，将次数加 `1`。

### 输出结果

```js
{
  h: 2,
  e: 2,
  l: 4,
  o: 2
}
```

### 可以改进的地方

目前只跳过了普通空格。如果想跳过制表符、换行符等所有空白字符，可以使用正则表达式：

```js
if (/\s/.test(char)) {
  continue;
}
```

也可以使用更简洁的统计方式：

```js
res[char] = (res[char] || 0) + 1;
```

整理后：

```js
function countCharacters(str) {
  const result = {};

  for (const char of str.toLowerCase()) {
    if (/\s/.test(char)) {
      continue;
    }

    result[char] = (result[char] || 0) + 1;
  }

  return result;
}
```

---

## 四、查找出现次数最多的字符

### 当前代码

```js
const counts = countCharacters("Hello HELLO");

function findMostFrequentCharacter(str) {
  let maxCharacter = "";
  let maxCount = 0;

  for (const key in str) {
    if (str[key] > maxCount) {
      maxCount = str[key];
      maxCharacter = key;
    }
  }

  return {
    Character: maxCharacter,
    count: maxCount
  };
}

console.log(findMostFrequentCharacter(counts));
```

### 实现思路

遍历字符统计对象，并记录：

- 当前出现次数最多的字符；
- 当前最大的出现次数。

### 输出结果

```js
{
  Character: "l",
  count: 4
}
```

### 命名问题

函数的参数名是 `str`，但实际传入的是字符统计对象，不是字符串：

```js
findMostFrequentCharacter(counts);
```

因此，建议将参数名改成 `characterCounts` 或 `counts`：

```js
function findMostFrequentCharacter(characterCounts) {
  let maxCharacter = "";
  let maxCount = 0;

  for (const character in characterCounts) {
    if (characterCounts[character] > maxCount) {
      maxCharacter = character;
      maxCount = characterCounts[character];
    }
  }

  return {
    character: maxCharacter,
    count: maxCount
  };
}
```

推荐将返回对象中的 `Character` 改成小写开头的 `character`，以符合 JavaScript 常见命名习惯。

### 空字符串情况

如果传入空字符串，结果会是：

```js
{
  character: "",
  count: 0
}
```

这是合理的默认结果，也可以根据题目要求返回 `null`。

---

## 五、对象数组多条件排序

### 原始数据

```js
const students = [
  { name: "小明", score: 82, age: 20 },
  { name: "小红", score: 95, age: 19 },
  { name: "小刚", score: 82, age: 18 },
  { name: "小李", score: 76, age: 21 },
  { name: "小王", score: 95, age: 20 }
];
```

### 排序规则

1. 按照 `score` 从高到低排序。
2. 分数相同时，按照 `age` 从小到大排序。
3. 不能修改传入的原数组。

### 当前代码

```js
function sortStudents(Students) {
  const newStudents = [...students];

  newStudents.sort(function (a, b) {
    if (a.score === b.score) {
      return a.age - b.age;
    }

    return b.score - a.score;
  });

  return newStudents;
}

console.log(sortStudents(students));
```

### 排序逻辑

```js
return b.score - a.score;
```

表示按照分数从高到低排序。

```js
return a.age - b.age;
```

表示分数相同时，按照年龄从小到大排序。

### 存在的问题

函数接收的参数是 `Students`，但函数内部复制的是外部变量 `students`：

```js
const newStudents = [...students];
```

这样会导致函数依赖外部数据。即使传入其他学生数组，函数仍然会对外部的 `students` 进行排序。

另外，JavaScript 变量通常使用小驼峰命名法，因此参数不建议写成大写开头的 `Students`。

### 修改后的代码

```js
function sortStudents(students) {
  const newStudents = [...students];

  newStudents.sort(function (a, b) {
    if (a.score === b.score) {
      return a.age - b.age;
    }

    return b.score - a.score;
  });

  return newStudents;
}
```

也可以写得更加简洁：

```js
function sortStudents(students) {
  return [...students].sort((a, b) => {
    return b.score - a.score || a.age - b.age;
  });
}
```

这里使用了逻辑或运算符：

```js
b.score - a.score || a.age - b.age
```

含义是：

- 如果分数不同，就使用分数比较结果。
- 如果分数相同，前面的结果是 `0`，继续比较年龄。

### 排序结果

```text
小红：95 分，19 岁
小王：95 分，20 岁
小刚：82 分，18 岁
小明：82 分，20 岁
小李：76 分，21 岁
```

---

## 六、通用排序函数

可以根据字段名和排序方向编写通用排序函数：

```js
function sortBy(arr, key, order = "asc") {
  return [...arr].sort((a, b) => {
    if (a[key] === b[key]) {
      return 0;
    }

    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    }

    return a[key] < b[key] ? 1 : -1;
  });
}
```

### 使用示例

按照分数从高到低排序：

```js
console.log(sortBy(students, "score", "desc"));
```

按照年龄从小到大排序：

```js
console.log(sortBy(students, "age", "asc"));
```

如果确定排序字段都是数字，也可以简化：

```js
function sortBy(arr, key, order = "asc") {
  return [...arr].sort((a, b) => {
    return order === "asc"
      ? a[key] - b[key]
      : b[key] - a[key];
  });
}
```

---

## 七、DOM 计数器

### HTML 结构

```html
<div class="counter">
  <button id="decrease">-1</button>
  <span id="count">0</span>
  <button id="increase">+1</button>
  <button id="reset">重置</button>
</div>

<p id="message"></p>
```

页面包含以下元素：

- 减少按钮；
- 显示当前数字的元素；
- 增加按钮；
- 重置按钮；
- 显示提示信息的段落。

### 获取 DOM 元素

```js
const add = document.querySelector("#increase");
const jian = document.querySelector("#decrease");
const countment = document.querySelector("#count");
const rest = document.querySelector("#reset");
const messagechange = document.querySelector("#message");

let count = 0;
```

### 增加按钮

```js
add.addEventListener("click", function () {
  count++;
  change();
});
```

每次点击后：

1. `count` 加 `1`；
2. 调用 `change()` 更新页面。

### 减少按钮

```js
jian.addEventListener("click", function () {
  if (count >= 1) {
    count--;
    change();
  } else {
    messagechange.textContent = "不能在少了";
  }
});
```

当数字大于等于 `1` 时，可以继续减少；否则显示提示信息。

### 重置按钮

```js
rest.addEventListener("click", function () {
  count = 0;
  change();
  messagechange.textContent = "";
});
```

点击重置按钮后：

- 将计数恢复成 `0`；
- 更新页面；
- 清空提示信息。

### 更新页面

```js
function change() {
  countment.textContent = count;
}
```

该函数负责将变量 `count` 的值同步到页面。

---

## 八、计数器存在的问题及优化

### 1. 提示文字有错别字

原代码：

```js
messagechange.textContent = "不能在少了";
```

建议修改为：

```js
messagechange.textContent = "不能再少了";
```

“再”表示继续进行某个动作，“在”通常表示位置或状态。

### 2. 增加数字后没有清除错误提示

当数字为 `0` 时点击减少按钮，会显示错误信息。之后点击增加按钮，错误信息仍然存在。

可以在成功改变数字后清空提示：

```js
add.addEventListener("click", function () {
  count++;
  messagechange.textContent = "";
  change();
});
```

### 3. 函数和变量命名不够清楚

建议调整：

| 原名称 | 推荐名称 |
|---|---|
| `add` | `increaseButton` |
| `jian` | `decreaseButton` |
| `countment` | `countElement` |
| `rest` | `resetButton` |
| `messagechange` | `messageElement` |
| `change` | `renderCount` |

使用清楚的英文名称，可以直接看出变量的作用。

### 优化后的完整计数器代码

```js
const increaseButton = document.querySelector("#increase");
const decreaseButton = document.querySelector("#decrease");
const resetButton = document.querySelector("#reset");
const countElement = document.querySelector("#count");
const messageElement = document.querySelector("#message");

let count = 0;

increaseButton.addEventListener("click", function () {
  count++;
  messageElement.textContent = "";
  renderCount();
});

decreaseButton.addEventListener("click", function () {
  if (count === 0) {
    messageElement.textContent = "不能再少了";
    return;
  }

  count--;
  messageElement.textContent = "";
  renderCount();
});

resetButton.addEventListener("click", function () {
  count = 0;
  messageElement.textContent = "";
  renderCount();
});

function renderCount() {
  countElement.textContent = count;
}
```

---

## 九、整理后的完整 JavaScript

```js
// 题目一：数组去重

const data = [1, 2, 2, 3, 1, 4, 4, 5];

function uniqueArray(arr) {
  const result = [];

  for (const item of arr) {
    if (!result.includes(item)) {
      result.push(item);
    }
  }

  return result;
}

console.log(uniqueArray(data));


// 题目二：统计字符次数

function countCharacters(str) {
  const result = {};

  for (const char of str.toLowerCase()) {
    if (/\s/.test(char)) {
      continue;
    }

    result[char] = (result[char] || 0) + 1;
  }

  return result;
}

const characterCounts = countCharacters("Hello HELLO");

console.log(characterCounts);


// 查找出现次数最多的字符

function findMostFrequentCharacter(characterCounts) {
  let maxCharacter = "";
  let maxCount = 0;

  for (const character in characterCounts) {
    if (characterCounts[character] > maxCount) {
      maxCharacter = character;
      maxCount = characterCounts[character];
    }
  }

  return {
    character: maxCharacter,
    count: maxCount
  };
}

console.log(findMostFrequentCharacter(characterCounts));


// 题目三：对象数组排序

const students = [
  { name: "小明", score: 82, age: 20 },
  { name: "小红", score: 95, age: 19 },
  { name: "小刚", score: 82, age: 18 },
  { name: "小李", score: 76, age: 21 },
  { name: "小王", score: 95, age: 20 }
];

function sortStudents(students) {
  return [...students].sort((a, b) => {
    return b.score - a.score || a.age - b.age;
  });
}

console.log(sortStudents(students));


// 加分题：通用排序函数

function sortBy(arr, key, order = "asc") {
  return [...arr].sort((a, b) => {
    if (a[key] === b[key]) {
      return 0;
    }

    if (order === "asc") {
      return a[key] > b[key] ? 1 : -1;
    }

    return a[key] < b[key] ? 1 : -1;
  });
}

console.log(sortBy(students, "score", "desc"));
console.log(sortBy(students, "age", "asc"));


// 题目四：DOM 事件绑定

const increaseButton = document.querySelector("#increase");
const decreaseButton = document.querySelector("#decrease");
const resetButton = document.querySelector("#reset");
const countElement = document.querySelector("#count");
const messageElement = document.querySelector("#message");

let count = 0;

increaseButton.addEventListener("click", function () {
  count++;
  messageElement.textContent = "";
  renderCount();
});

decreaseButton.addEventListener("click", function () {
  if (count === 0) {
    messageElement.textContent = "不能再少了";
    return;
  }

  count--;
  messageElement.textContent = "";
  renderCount();
});

resetButton.addEventListener("click", function () {
  count = 0;
  messageElement.textContent = "";
  renderCount();
});

function renderCount() {
  countElement.textContent = count;
}
```

---

## 十、本次练习总结

本次代码已经正确运用了以下知识：

- `for` 循环和 `for...in`；
- 数组的 `indexOf()`、`push()` 和 `sort()`；
- 对象属性的读取与修改；
- 字符串的 `toLowerCase()`；
- 展开运算符 `...`；
- DOM 元素查询；
- `addEventListener()` 事件绑定；
- `textContent` 页面内容更新。

后续建议重点注意：

1. 函数内部优先使用传入的参数，不要意外引用同名的外部变量。
2. 变量名应准确表达用途。
3. 处理成功操作时，也要同步清除旧的错误提示。
4. 将重复的页面更新操作封装成函数。
5. 逐渐练习 `const`、`let`、箭头函数和数组方法的现代写法。
