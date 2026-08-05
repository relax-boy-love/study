# 第 9 天：Promise 复习笔记

## 一、今日学习内容

- Promise 的三种状态与状态变化
- `then` 链式调用与返回值传递
- 错误传播、`catch` 和 `finally`
- `Promise.all`、`allSettled`、`race`、`any`
- 串行请求与并行请求
- 失败重试
- 手写简化版 `Promise.all`

---

## 二、Promise 的状态

Promise 表示一个现在可能还没有结果、将来才会完成的异步操作。

它有三种状态：

```text
pending    等待中
fulfilled 成功
rejected  失败
```

状态只能发生以下变化：

```text
pending → fulfilled
pending → rejected
```

状态一旦改变就不能再次改变。第一次调用 `resolve` 或 `reject` 有效，后续调用无效。

```js
const promise = new Promise(function (resolve, reject) {
  resolve("第一次成功");
  reject("后来失败");
  resolve("第二次成功");
});

promise.then(function (value) {
  console.log(value); // 第一次成功
});
```

### resolve 与 reject

- `resolve(value)`：将 Promise 确定为成功，并传递成功结果 `value`。
- `reject(reason)`：将 Promise 确定为失败，并传递失败原因 `reason`。

### 执行器会立即执行

传给 `new Promise()` 的函数叫执行器，它会在创建 Promise 时立即执行，不会等到调用 `then` 时才执行。

```js
const promise = new Promise(function (resolve) {
  console.log("开始执行");

  setTimeout(function () {
    resolve("请求成功");
  }, 1000);
});

promise.then(function (result) {
  console.log(result);
});

console.log("同步代码结束");
```

输出顺序：

```text
开始执行
同步代码结束
请求成功
```

注意：即使 Promise 已经成功，`then` 回调也不会插入当前同步代码中立即执行，它会等待当前同步代码结束。

---

## 三、then 链式调用

最重要的规则：**前一个 `then` 返回的结果，会决定后一个 `then` 接收到什么。**

### 1. 返回普通值

```js
Promise.resolve(10)
  .then(function (value) {
    return value + 5;
  })
  .then(function (value) {
    console.log(value); // 15
  });
```

前一个 `then` 返回 `15`，下一个 `then` 的参数就是 `15`。

### 2. 没有 return

函数没有写 `return`，相当于：

```js
return undefined;
```

```js
Promise.resolve("开始")
  .then(function (value) {
    const nextValue = "处理中";
    // 没有return
  })
  .then(function (value) {
    console.log(value); // undefined
  });
```

仅仅声明变量不会把它交给下一个 `then`。

### 3. 返回新的 Promise

```js
Promise.resolve(2)
  .then(function (value) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(value * 10);
      }, 1000);
    });
  })
  .then(function (value) {
    console.log(value); // 20
  });
```

下一个 `then` 会等待返回的 Promise 确定状态：

- 返回的 Promise 成功：下一个 `then` 接收成功结果。
- 返回的 Promise 失败：跳过成功回调，向后寻找 `catch`。

### 4. 链式传递总结

```text
返回普通值   → 下一个then收到该值
没有return   → 下一个then收到undefined
返回Promise  → 等待它确定状态，再传递结果
抛出错误     → 链变为失败，向后寻找catch
```

---

## 四、错误传播、catch 与 finally

### 1. 错误传播

```js
Promise.resolve("开始")
  .then(function (value) {
    console.log(value);
    throw new Error("处理失败");
  })
  .then(function () {
    console.log("这里不会执行");
  })
  .catch(function (error) {
    console.log(error.message); // 处理失败
  });
```

流程：

```text
then抛出错误
    ↓
Promise链变为失败
    ↓
跳过后续成功then
    ↓
直到被catch捕获
```

### 2. catch 可以恢复链条

```js
Promise.reject("网络错误")
  .catch(function (error) {
    console.log(error);
    return "恢复成功";
  })
  .then(function (value) {
    console.log(value); // 恢复成功
  });
```

- `catch` 返回普通值：链条恢复为成功。
- `catch` 没有返回值：也恢复为成功，下一个 `then` 收到 `undefined`。
- `catch` 再次 `throw error`：链条继续保持失败。

### 3. finally

`finally` 在成功和失败时通常都会执行，适合：

- 关闭加载动画
- 隐藏加载提示
- 恢复按钮可点击状态
- 清理临时资源

```js
request()
  .then(handleSuccess)
  .catch(handleError)
  .finally(function () {
    hideLoading();
  });
```

---

## 五、四种 Promise 组合方法

| 方法 | 成功条件 | 失败条件 | 关注点 |
| --- | --- | --- | --- |
| `Promise.all` | 全部成功 | 任意一个失败 | 全部都要成功 |
| `Promise.allSettled` | 等待全部结束 | 不因单个失败提前结束 | 收集全部结果 |
| `Promise.race` | 最先结束的是成功 | 最先结束的是失败 | 第一个结束 |
| `Promise.any` | 任意一个成功 | 全部失败 | 第一个成功 |

### 1. Promise.all

适合多个任务互不依赖、可以并行，并且只有全部成功后续工作才有意义的场景。

```js
Promise.all([userRequest, productRequest, permissionRequest])
  .then(function (results) {
    console.log(results);
  })
  .catch(function (error) {
    console.log(error);
  });
```

重要规则：

- 总耗时约等于最慢任务的耗时，不是所有耗时相加。
- 结果数组按照传入顺序排列，不按照完成顺序排列。
- 任意一项失败，`Promise.all` 立即确定为失败。
- 其他已经启动的任务不会被自动取消，仍可能继续执行。

### 2. Promise.allSettled

适合批量上传、批量发送通知等需要收集每一项最终结果的场景。

结果格式：

```js
[
  { status: "fulfilled", value: "任务A成功" },
  { status: "rejected", reason: "任务B失败" }
]
```

成功结果在 `value`，失败原因在 `reason`。

### 3. Promise.race

谁最先结束就采用谁的状态和结果，无论成功还是失败。

常用于请求超时控制：

```js
Promise.race([requestPromise, timeoutPromise]);
```

### 4. Promise.any

忽略先出现的失败，使用第一个成功结果。只有全部 Promise 都失败时，它才失败。

适合同时从多个备用服务获取相同资源。

记忆：

```text
race：第一个结束
any：第一个成功
```

---

## 六、串行请求与并行请求

### 1. 串行请求

前一个任务完成后，才开始下一个任务。

```js
request("请求A", 1000)
  .then(function (resultA) {
    console.log(resultA);
    return request("请求B", 500);
  })
  .then(function (resultB) {
    console.log(resultB);
    return request("请求C", 800);
  })
  .then(function (resultC) {
    console.log(resultC);
  });
```

总耗时大约为：

```text
1000 + 500 + 800 = 2300ms
```

适合后一个任务依赖前一个任务结果的场景，例如：

```text
登录 → 获取用户身份 → 根据身份查询订单
```

必须 `return` 下一个请求，Promise 链才会等待它，并把它的结果交给后续 `then`。

### 2. 并行请求

```js
const requestA = request("请求A", 1000);
const requestB = request("请求B", 500);
const requestC = request("请求C", 800);

Promise.all([requestA, requestB, requestC])
  .then(function (results) {
    console.log(results);
  });
```

三个请求在调用 `request()` 时就已经开始。

```text
完成顺序：B → C → A
结果顺序：A → B → C
总耗时：约1000ms
```

适合多个任务互不依赖的场景，例如页面同时加载用户信息、公告和商品列表。

---

## 七、失败重试

核心流程：

```text
请求失败
  ├─ 还有机会 → return execute()
  └─ 次数用完 → throw error
```

```js
function retry(fn, maxAttempts) {
  let attempts = 0;

  function execute() {
    attempts++;

    return fn().catch(function (error) {
      if (attempts >= maxAttempts) {
        throw error;
      }

      return execute();
    });
  }

  return execute();
}
```

关键点：

- `attempts` 位于 `execute` 外，递归调用时才能共享同一个计数。
- `return execute()` 让 Promise 链等待下一次请求。
- 达到最大次数时使用 `throw error`，让失败继续传到外部 `catch`。
- 如果写成 `return error`，会把失败错误当作普通成功结果。
- `maxAttempts` 表示最多尝试的总次数，而不是“首次失败后额外重试的次数”。

### 两种测试情况

如果请求在第 3 次成功，`retry(fn, 3)` 最终进入 `then`。

如果请求必须到第 10 次才成功，`retry(fn, 3)` 只会尝试 3 次，最终进入 `catch`。

> 今天代码里的成功条件是 `requestCount < 10` 时失败，因此最多执行 3 次的测试结果应为最终失败，而不是第 3 次成功。

---

## 八、手写简化版 Promise.all

```js
function myPromiseAll(promises) {
  return new Promise(function (resolve, reject) {
    const results = [];
    let completedCount = 0;

    // 空数组立即成功
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    promises.forEach(function (item, index) {
      // 将普通值和Promise统一处理
      Promise.resolve(item)
        .then(function (value) {
          // 按传入位置保存，而不是按完成顺序push
          results[index] = value;
          completedCount++;

          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(function (error) {
          reject(error);
        });
    });
  });
}
```

### 核心变量

```js
const results = [];      // 保存成功结果
let completedCount = 0;  // 记录已经成功的数量
```

### 为什么使用 results[index]

任务可能按照 `C → B → A` 完成，但 `Promise.all` 要求结果按照传入的 `A → B → C` 排列。

```js
results[index] = value;
```

能够把结果放回原来的位置；使用 `push` 会变成完成顺序。

### 为什么使用 Promise.resolve(item)

传入数组可能同时包含 Promise 和普通值：

```js
myPromiseAll([Promise.resolve("A"), 100, "hello"]);
```

`Promise.resolve(item)` 会：

- 对 Promise：采用它最终的状态和结果。
- 对普通值：包装成成功 Promise。

这样后面就可以统一使用 `then`。

### 当前版本的范围

这是学习用简化版本，接收数组并实现了核心行为。原生 `Promise.all` 还能接收其他可迭代对象，并涉及更完整的规范细节。

---

## 九、今日易错点

1. `new Promise` 的执行器立即执行，`then` 回调异步执行。
2. Promise 状态只能改变一次。
3. `reject("错误")` 后，`catch` 收到的是字符串 `"错误"`，不是整行 `reject(...)`。
4. `then` 没写 `return`，下一个 `then` 收到 `undefined`。
5. 返回 Promise 后，下一个 `then` 必须等待它确定状态。
6. `catch` 返回普通值会让链条恢复成功；继续失败要 `throw error`。
7. `finally` 成功和失败都会执行。
8. `race` 关注第一个结束，`any` 关注第一个成功。
9. `Promise.all` 的结果按传入顺序排列，不按完成顺序排列。
10. `Promise.all` 失败不会自动取消已经启动的其他任务。
11. 串行请求必须返回下一个 Promise，链条才会等待。
12. 重试达到最大次数时要抛出错误，不能把错误作为普通值返回。

---

## 十、口述验收

尝试不看代码回答：

1. Promise 有哪三种状态？状态如何变化？
2. `resolve` 和 `reject` 分别负责什么？
3. 为什么 Promise 状态只能改变一次？
4. `then` 返回普通值、没有返回值、返回 Promise、抛出错误时，链条分别如何变化？
5. `catch` 返回普通值后，为什么后面的 `then` 可以继续执行？
6. `finally` 适合处理哪些工作？
7. `all`、`allSettled`、`race`、`any` 有什么区别？
8. 串行和并行分别适合什么场景？
9. `retry` 为什么需要 `return execute()`？
10. 手写 `Promise.all` 为什么要使用下标和完成计数？

## 今日总结

Promise 链中的每个 `then` 都会返回一个新的 Promise。前一个回调返回普通值时，该值成为下一个 `then` 的参数；没有返回值时传递 `undefined`；返回 Promise 时，链条等待它确定状态；抛出错误时，链条转为失败并向后寻找 `catch`。
