# 第 11 天：JavaScript 事件循环

## 一、今日学习内容

- 调用栈与后进先出
- 同步代码、任务和微任务
- Promise、定时器与 `async/await` 的执行顺序
- 微任务中新增任务的处理规则
- 10 道浏览器输出题
- 调用栈、微任务队列和任务队列绘图
- 事件循环综合观察器
- 浏览器与 Node.js 事件循环的基础区别
- 微任务饥饿与长任务造成的页面卡顿

---

## 二、调用栈

调用栈用来记录当前正在执行的全局代码和函数。

- 调用函数时，函数进入调用栈。
- 函数执行完成后，从调用栈退出。
- 调用栈遵循后进先出。

```js
function a() {
  console.log("a开始");
  b();
  console.log("a结束");
}

function b() {
  console.log("b开始");
  c();
  console.log("b结束");
}

function c() {
  console.log("c");
}

console.log("全局开始");
a();
console.log("全局结束");
```

执行到 `c()` 时，调用栈从下到上可以表示为：

```text
全局代码
  ↓
a
  ↓
b
  ↓
c
```

输出：

```text
全局开始
a开始
b开始
c
b结束
a结束
全局结束
```

不能只看到函数定义位置，要从实际调用过程分析。

---

## 三、任务与微任务

### 1. 同步代码

普通语句、函数调用和 Promise 执行器会在当前调用栈中同步执行。

### 2. 常见任务

入门阶段经常称为宏任务：

```js
setTimeout
setInterval
点击事件
输入事件
```

严格来说，浏览器规范通常称它们为任务。点击回调整体由一个任务启动；回调进入调用栈后，里面的普通语句仍是同步执行。

### 3. 常见微任务

```js
Promise.then
Promise.catch
Promise.finally
queueMicrotask
await后面的继续执行
MutationObserver
```

注意：`async` 函数整体不等于微任务。调用它时，遇到第一个 `await` 之前的代码同步执行；`await` 后面的继续执行通常进入微任务。

---

## 四、一轮基础事件循环

基础规则：

```text
执行当前同步代码
      ↓
调用栈清空
      ↓
清空全部微任务
      ↓
浏览器可能进行页面渲染
      ↓
执行下一个任务
      ↓
再次清空全部微任务
```

最重要的两条：

1. 微任务队列必须清空后，才处理下一个任务。
2. 微任务执行期间创建的新微任务，也要在本轮继续清空。

```js
console.log("A");

setTimeout(function () {
  console.log("B");
}, 0);

Promise.resolve().then(function () {
  console.log("C");
});

console.log("D");
```

输出：

```text
A → D → C → B
```

分析：

```text
同步：A、注册定时器、注册then、D
微任务：C
任务：B
```

---

## 五、setTimeout(fn, 0)

```js
setTimeout(fn, 0);
```

不表示立即执行，也不保证恰好 0ms 后执行。

它表示：

> 等待时间达到最低要求后，把 `fn` 安排为一个任务等待执行。它必须等当前调用栈清空，并等前面的微任务执行完。

所以：

```js
console.log("A");

setTimeout(function () {
  console.log("B");
}, 0);

console.log("C");
```

输出：

```text
A → C → B
```

---

## 六、Promise 的执行时机

### 1. Promise 执行器同步执行

```js
console.log("A");

const promise = new Promise(function (resolve) {
  console.log("B");
  resolve();
  console.log("C");
});

promise.then(function () {
  console.log("D");
});

console.log("E");
```

输出：

```text
A → B → C → E → D
```

- Promise 执行器同步执行。
- `resolve()` 不会终止执行器函数，所以 `C` 继续输出。
- `then` 回调异步执行，进入微任务队列。

### 2. 微任务先进先出

```js
Promise.resolve().then(function () {
  console.log("A");
});

Promise.resolve().then(function () {
  console.log("B");
});
```

先注册的回调先进入队列，所以输出 `A → B`。

### 3. 微任务中新建微任务

```js
Promise.resolve().then(function () {
  console.log("B");

  Promise.resolve().then(function () {
    console.log("C");
  });
});

Promise.resolve().then(function () {
  console.log("D");
});
```

初始队列：

```text
[B, D]
```

执行 B 时把 C 加到队尾：

```text
[D, C]
```

所以输出：

```text
B → D → C
```

---

## 七、链式 then 的入队时机

```js
console.log("开始");

Promise.resolve()
  .then(function () {
    console.log("A");
  })
  .then(function () {
    console.log("B");
  });

Promise.resolve().then(function () {
  console.log("C");
});

console.log("结束");
```

同步结束时，微任务队列是：

```text
[A, C]
```

不是：

```text
[A, B, C]
```

执行过程：

```text
执行A
  ↓
第一个then执行完成
  ↓
第一个then返回的新Promise成功
  ↓
这时才把B加入队尾
  ↓
队列变为[C, B]
```

最终输出：

```text
开始 → 结束 → A → C → B
```

链式 `then` 的后一个回调必须等待前一个 `then` 执行完成，并根据前一个 `then` 返回的新 Promise 状态决定后续走成功还是失败分支。

---

## 八、async/await 与微任务

```js
async function runTask() {
  console.log("1");

  await Promise.resolve();

  console.log("2");

  await 0;

  console.log("3");
}

console.log("4");
runTask();
console.log("5");

Promise.resolve().then(function () {
  console.log("6");
});
```

输出：

```text
4 → 1 → 5 → 2 → 6 → 3
```

队列变化：

```text
同步执行4
调用runTask，同步执行1
第一个await安排“继续执行并输出2”的微任务
同步执行5
注册输出6的微任务

初始微任务队列：[输出2, 输出6]

执行输出2
遇到await 0，将输出3的新微任务加入队尾

微任务队列：[输出6, 输出3]
```

注意：`await 0` 也会异步恢复。输出 3 的任务是在执行输出 2 时才加入队尾，因此在已经排队的输出 6 之后。

---

## 九、任务之间清空微任务

```js
console.log("开始");

setTimeout(function () {
  console.log("定时器1");

  Promise.resolve().then(function () {
    console.log("定时器1中的微任务");
  });
}, 0);

setTimeout(function () {
  console.log("定时器2");
}, 0);

Promise.resolve().then(function () {
  console.log("全局微任务");
});

console.log("结束");
```

输出：

```text
开始
结束
全局微任务
定时器1
定时器1中的微任务
定时器2
```

原因：执行完定时器 1 这个任务后，要先清空它创建的微任务，才会执行定时器 2。

---

## 十、完整队列绘图示例

```js
console.log("1");

setTimeout(function () {
  console.log("2");

  Promise.resolve().then(function () {
    console.log("3");
  });
}, 0);

Promise.resolve().then(function () {
  console.log("4");

  setTimeout(function () {
    console.log("5");
  }, 0);
});

console.log("6");
```

### 阶段 1：同步代码

```text
输出：1、6
调用栈：全局代码，结束后清空
微任务队列：[输出4]
任务队列：[输出2]
```

### 阶段 2：清空微任务

```text
输出4
创建输出5的定时器

微任务队列：[]
任务队列：[输出2, 输出5]
```

### 阶段 3：执行第一个定时器

```text
输出2
创建输出3的微任务

微任务队列：[输出3]
任务队列：[输出5]
```

### 阶段 4：先清空微任务

```text
输出3
微任务队列：[]
```

### 阶段 5：下一个任务

```text
输出5
```

最终：

```text
1 → 6 → 4 → 2 → 3 → 5
```

---

## 十一、综合事件循环观察器

### 1. 页面记录函数

```js
let step = 0;

function logStep(message) {
  step++;

  const logItem = document.createElement("li");
  logItem.textContent = step + ". " + message;

  logList.append(logItem);
  console.log(step + ". " + message);
}
```

每执行一次就在页面和控制台同时记录顺序。

### 2. 原始版本：Promise 链在前

原始注册顺序：

```js
Promise.resolve().then(/* Promise微任务1 */);
runAsyncTask();
queueMicrotask(/* queueMicrotask */);
```

同步结束时：

```text
微任务队列：
[Promise微任务1, async第一次恢复, queueMicrotask]
```

动态执行后的微任务顺序：

```text
Promise微任务1
async第一次恢复
queueMicrotask
Promise微任务2
async第二次恢复
```

原始版本 13 条输出：

```text
1. 点击事件开始
2. async开始
3. 点击事件结束
4. Promise微任务1
5. async第一次恢复
6. queueMicrotask
7. Promise微任务2
8. async第二次恢复
9. 定时器1
10. 定时器1中的微任务
11. 定时器2
12. async中的定时器
13. async定时器中的微任务
```

### 3. 改造版本：runAsyncTask 移到 Promise 链前

```js
runAsyncTask();
Promise.resolve().then(/* Promise微任务1 */);
queueMicrotask(/* queueMicrotask */);
```

同步结束时：

```text
[async第一次恢复, Promise微任务1, queueMicrotask]
```

改造后 13 条输出：

```text
1. 点击事件开始
2. async开始
3. 点击事件结束
4. async第一次恢复
5. Promise微任务1
6. queueMicrotask
7. async第二次恢复
8. Promise微任务2
9. 定时器1
10. 定时器1中的微任务
11. async中的定时器
12. async定时器中的微任务
13. 定时器2
```

仅移动一行代码，就同时改变了微任务和后续定时器的注册顺序。

### 4. 在定时器 2 中增加微任务

```js
setTimeout(function () {
  logStep("定时器2");

  Promise.resolve().then(function () {
    logStep("定时器2中的微任务");
  });
}, 0);
```

总记录变为 14 条，最后三条是：

```text
async定时器中的微任务
定时器2
定时器2中的微任务
```

新微任务不会打断正在执行的定时器 2，而是在定时器 2 回调结束、调用栈清空后执行；如果后面还有其他任务，它会在下一个任务之前执行。

> 综合文件中的部分注释记录的是改造前顺序，而当前实际代码已经把 `runAsyncTask()` 移到了 Promise 链前，并在定时器 2 中加入了微任务。复习时应按本节分开的两个版本理解。

---

## 十二、浏览器与 Node.js 的基础区别

### 共同点

- 都有调用栈和事件循环。
- Promise 回调都属于微任务。
- 当前执行结束后都会处理微任务。
- 长时间同步任务都会阻塞后续任务。

### 浏览器

浏览器负责网页界面，拥有 DOM、CSS 和渲染引擎。事件循环除了执行 JavaScript，还要处理：

- DOM 事件
- 定时器
- 网络回调
- 用户交互
- 页面渲染

### Node.js

Node.js 主要运行服务器和工具程序，通常没有普通网页的 DOM 与页面渲染。它还要处理：

- 文件读写
- 网络和服务器 I/O
- 定时器
- `setImmediate`
- `process.nextTick`

基础阶段：

```text
timers阶段：setTimeout、setInterval
poll阶段：部分I/O回调
check阶段：setImmediate
```

`process.nextTick()` 主要存在于 Node.js，它有自己的特殊队列，通常会优先于普通 Promise 微任务处理。

不能简单认为 `setTimeout(0)` 永远早于 `setImmediate()`：它们位于 Node.js 事件循环的不同阶段，顺序还受注册位置、当前阶段和 I/O 环境影响。

---

## 十三、事件循环与实际开发

### 1. 微任务饥饿

如果一个微任务不断创建新的微任务：

```text
微任务 → 新微任务 → 新微任务 → 一直继续
```

事件循环会一直尝试清空微任务，可能造成：

- 下一个任务迟迟不能执行
- 点击与定时器无法及时响应
- 浏览器无法及时渲染
- 页面卡顿

### 2. 长同步任务

很长的同步循环会一直占用调用栈。调用栈不清空，事件循环就不能及时处理用户事件、定时器、Promise 后续代码和页面渲染。

### 3. 与 Fetch、Promise 和 async/await 的关系

网络请求由浏览器环境处理，JavaScript 不需要在调用栈中一直等待。

请求完成后：

```text
Fetch的Promise确定状态
       ↓
Promise回调进入微任务队列
       ↓
await后续代码也通过微任务恢复
       ↓
事件循环在调用栈清空后执行它们
```

所以等待网络期间页面仍然可以处理其他工作。

---

## 十四、今日错题与易错点

1. 调用 `a()` 时首先进入调用栈的是 `a`，不是它内部调用的 `b`。
2. 定时器回调进入任务队列，不是简单地“排在下一行代码后”。
3. 设置定时器和注册 `then` 的操作同步执行，但它们的回调异步执行。
4. Promise 执行器同步执行，`then` 回调是异步微任务。
5. `async` 函数不是整体都属于微任务；`await` 前同步，后续通常由微任务恢复。
6. `await 0` 也会产生异步恢复点。
7. 第二个 `await` 创建的新微任务排在已经存在的微任务后面。
8. 链式第二个 `then` 不会提前入队，要等待第一个 `then` 完成。
9. `setTimeout(fn, 0)` 不是立即执行，也没有创建微任务。
10. 微任务必须清空后才执行下一个任务。
11. Node.js 的 `setTimeout(0)` 与 `setImmediate()` 不能只按名称判断顺序。
12. 分析输出时要关注任务注册的实际时间，而不只是代码类型。

---

## 十五、分析异步输出题的方法

以后遇到复杂题，按照这个顺序：

1. 圈出所有同步代码。
2. 找到 Promise 执行器和 `await` 前代码，按同步执行。
3. 记录任务与微任务的注册顺序。
4. 写出同步输出。
5. 清空微任务，并记录微任务中新创建的任务。
6. 执行一个任务。
7. 当前任务完成后，再次清空全部微任务。
8. 重复直到队列为空。

不要只背：

```text
同步 → 微任务 → 宏任务
```

还要动态追踪：

```text
谁先入队？
执行过程中又创建了什么？
新任务被加入哪个队列的什么位置？
```

---

## 十六、口述验收

不看代码回答：

1. 调用栈保存什么？为什么说它后进先出？
2. 一轮基础事件循环怎样执行？
3. 微任务中新建微任务时，新任务什么时候执行？
4. `setTimeout(fn, 0)` 的真正含义是什么？
5. Promise 执行器和 `then` 回调分别怎样执行？
6. 链式 `then` 的第二个回调什么时候进入队列？
7. `await` 前后代码的执行方式有什么区别？
8. 为什么两个定时器之间可以插入一个 Promise 微任务？
9. 为什么长同步任务和无限微任务都会造成页面卡顿？
10. 浏览器和 Node.js 事件循环最基础的区别是什么？

## 今日总结

事件循环的核心不是简单背诵“同步、微任务、宏任务”，而是结合调用栈和任务注册时机动态追踪队列。当前代码执行完后会清空微任务；每执行一个新任务后又会再次清空微任务。Promise 回调与 `await` 后续代码依靠微任务执行，定时器和事件回调作为任务等待。理解这些规则，才能解释异步输出顺序、页面卡顿以及网络请求完成后的代码为什么能继续运行。
