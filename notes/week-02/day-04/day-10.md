# 第 10 天：async/await 与网络请求

## 一、今日学习内容

- `async` 函数的返回值和错误
- `await` 的作用与执行顺序
- `try / catch / finally`
- Fetch 请求和 JSON 解析
- 加载、成功、空数据和错误四种页面状态
- `AbortController` 取消请求
- 防止旧搜索结果覆盖最新结果

---

## 二、async 函数

### 1. async 函数一定返回 Promise

```js
async function getNumber() {
  return 100;
}

const result = getNumber();

console.log(result); // Promise对象

result.then(function (value) {
  console.log(value); // 100
});
```

即使 `async` 函数返回的是普通值，调用它得到的仍然是 Promise。

```js
async function getNumber() {
  return 100;
}
```

可以近似理解为：

```js
function getNumber() {
  return Promise.resolve(100);
}
```

### 2. async 函数抛出错误

```js
async function getUser() {
  throw new Error("用户不存在");
}

getUser()
  .then(function (value) {
    console.log("成功：", value);
  })
  .catch(function (error) {
    console.log("失败：", error.message);
  });
```

`async` 函数中抛出错误，会让返回的 Promise 变为 `rejected`。

可以近似理解为：

```js
return Promise.reject(new Error("用户不存在"));
```

---

## 三、await 的作用

### 1. await 得到 Promise 的成功结果

```js
function getSuccessData() {
  return Promise.resolve({
    name: "小明",
    age: 20
  });
}

async function loadUser() {
  const user = await getSuccessData();

  console.log(user.name); // 小明
}
```

区别：

```js
const userPromise = getSuccessData();
// userPromise是Promise
```

```js
const user = await getSuccessData();
// user是Promise成功后得到的数据对象
```

### 2. await 只暂停当前 async 函数

```js
function delayResult(value, delay) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(value);
    }, delay);
  });
}

async function run() {
  console.log("run开始");

  const result = await delayResult("异步结果", 1000);

  console.log(result);
  console.log("run结束");
}

console.log("全局开始");
run();
console.log("全局结束");
```

输出：

```text
全局开始
run开始
全局结束
异步结果
run结束
```

执行到 `await` 时：

- 暂停当前 `async` 函数后面的代码。
- 函数外的同步代码继续执行。
- 不会阻塞整个 JavaScript 程序。
- 不会让页面因为等待而卡住。

### 3. await 与 then 的对应关系

Promise 写法：

```js
getSuccessData().then(function (data) {
  console.log(data);
});
```

`async/await` 写法：

```js
const data = await getSuccessData();
console.log(data);
```

`await` 没有取代 Promise，它只是让基于 Promise 的异步代码更接近从上到下的普通代码。

---

## 四、try / catch / finally

```js
async function loadData() {
  console.log("开始请求");

  try {
    const data = await getFailedData();
    console.log("成功：", data);
  } catch (error) {
    console.log("失败：", error.message);
  } finally {
    console.log("请求结束");
  }
}
```

作用：

| 结构 | 作用 |
| --- | --- |
| `try` | 发起请求并处理成功结果 |
| `catch` | 捕获 Promise 失败或主动抛出的错误 |
| `finally` | 无论成功还是失败都执行清理工作 |

`finally` 适合：

- 关闭加载动画
- 恢复按钮状态
- 隐藏加载提示
- 清理当前请求控制器

---

## 五、Fetch 的完整过程

### 1. 两次异步等待

```js
const response = await fetch(url);
const data = await response.json();
```

执行流程：

```text
fetch(url)
   ↓ 返回Promise
等待服务器响应
   ↓
Response响应对象
   ↓ response.json()也返回Promise
读取并解析响应体
   ↓
JavaScript数据
```

因此：

- `fetch(url)` 返回 Promise。
- `await fetch(url)` 得到 `Response` 对象，不是最终数据。
- `response.json()` 也返回 Promise。
- `await response.json()` 才得到解析后的数据。

### 2. 检查 response.ok

Fetch 遇到 404、500 等 HTTP 响应时，返回的 Promise 通常仍然是成功状态，不会自动进入 `catch`。

因此需要主动判断：

```js
if (!response.ok) {
  throw new Error(
    "请求失败，状态码：" + response.status
  );
}
```

`throw` 后会跳过 `try` 中后续的成功代码，直接进入 `catch`。

网络断开、域名无法连接等情况通常会让 Fetch 自身失败，并进入 `catch`。

---

## 六、四种页面状态

页面请求至少要考虑：

```text
加载中 → 请求正在进行
成功   → 请求成功并且有数据
空数据 → 请求成功但数组为空
错误   → 网络错误或HTTP错误
```

### 完整加载示例

```js
async function loadUsers() {
  // 加载状态必须在await之前设置
  statusMessage.textContent = "正在加载用户……";
  loadButton.disabled = true;
  userList.innerHTML = "";

  try {
    const response = await fetch(
      "https://dummyjson.com/users?limit=5"
    );

    if (!response.ok) {
      throw new Error(
        "请求失败，状态码：" + response.status
      );
    }

    const data = await response.json();
    const users = data.users;

    // 空数据状态：请求本身是成功的
    if (users.length === 0) {
      statusMessage.textContent = "暂无用户";
      return;
    }

    users.forEach(function (user) {
      const userItem = document.createElement("li");

      userItem.textContent =
        user.firstName +
        " " +
        user.lastName +
        " - " +
        user.email;

      userList.append(userItem);
    });

    // 成功状态
    statusMessage.textContent =
      "成功加载" + users.length + "名用户";

  } catch (error) {
    // 错误状态
    statusMessage.textContent = error.message;
    userList.innerHTML = "";

  } finally {
    // 成功、空数据和失败都会恢复按钮
    loadButton.disabled = false;
  }
}
```

### 关键点

- 加载提示必须在 `await fetch()` 前设置。
- 空数组表示请求成功但没有数据，不应该进入 `catch`。
- 空数据分支 `return`，避免继续执行成功渲染。
- 重新渲染前清空旧列表，避免内容重复。
- 错误时清空列表，避免页面继续展示已经过期的数据。
- 恢复按钮放在 `finally`，保证每一种结果都会执行。

---

## 七、过期请求问题

连续搜索时，请求完成顺序不一定等于发起顺序：

```js
searchUsers("John", 3000);
searchUsers("Emily", 500);
```

```text
John先请求，需要3000ms
Emily后请求，需要500ms
       ↓
Emily先完成，页面显示Emily
       ↓
John旧请求后完成并覆盖页面
       ↓
最终错误地显示John
```

用户最后搜索的是 Emily，页面却显示 John，这就是过期请求覆盖最新结果。

仅使用防抖不能彻底解决：防抖可以减少尚未发出的请求，但不能自动取消已经发出的旧请求。

---

## 八、AbortController

### 1. 基础用法

```js
const controller = new AbortController();

fetch(url, {
  signal: controller.signal
});

controller.abort();
```

- `new AbortController()`：创建请求控制器。
- `controller.signal`：把控制器与 Fetch 请求连接起来。
- `controller.abort()`：取消与该信号连接的请求。

取消后 Fetch 通常会抛出：

```js
error.name === "AbortError"
```

这是程序主动取消，不是真正的请求故障，不应该向用户显示成“搜索失败”。

### 2. 自动取消旧搜索

```js
let currentController = null;

async function searchUsers(keyword, delay) {
  // 新搜索开始前取消旧请求
  if (currentController !== null) {
    currentController.abort();
  }

  // 为本次请求创建自己的控制器
  const controller = new AbortController();
  currentController = controller;

  statusMessage.textContent =
    "正在搜索：" + keyword;

  try {
    const url =
      "https://dummyjson.com/users/search?q=" +
      encodeURIComponent(keyword) +
      "&delay=" +
      delay;

    const response = await fetch(url, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(
        "请求失败，状态码：" + response.status
      );
    }

    const data = await response.json();
    const users = data.users;

    // 额外保险：旧请求不能更新页面
    if (controller !== currentController) {
      return;
    }

    userList.innerHTML = "";

    if (users.length === 0) {
      statusMessage.textContent = "暂无搜索结果";
      return;
    }

    users.forEach(function (user) {
      const userItem = document.createElement("li");

      userItem.textContent =
        user.firstName + " " + user.lastName;

      userList.append(userItem);
    });

    statusMessage.textContent =
      keyword + "搜索完成";

  } catch (error) {
    // 主动取消不显示失败提示
    if (error.name === "AbortError") {
      console.log(keyword + "请求已取消");
      return;
    }

    // 旧请求产生的普通错误也不能覆盖最新状态
    if (controller !== currentController) {
      return;
    }

    statusMessage.textContent =
      "搜索失败：" + error.message;

  } finally {
    // 只能由最新请求清理当前控制器
    if (controller === currentController) {
      currentController = null;
    }
  }
}
```

### 3. 为什么控制器定义在函数外

`currentController` 必须定义在函数外，才能在下一次搜索时找到并取消上一次请求。

如果定义在函数内，每次调用都会创建独立变量，新请求无法取得旧控制器。

控制器变化：

```text
第一次搜索：currentController → John控制器

第二次搜索刚进入：仍保存John控制器
                    ↓ abort()
                  取消John
                    ↓
创建Emily控制器并赋值
                    ↓
第二次搜索：currentController → Emily控制器
```

### 4. 为什么还要比较控制器

```js
if (controller !== currentController) {
  return;
}
```

- `controller`：当前这次函数调用自己的控制器。
- `currentController`：整个页面最新请求的控制器。
- 二者相等：当前函数属于最新请求，可以更新页面。
- 二者不等：当前函数属于旧请求，不能更新页面。

因此同时使用两层保护：

```text
abort旧请求                 → 尽早停止旧请求
比较controller与当前控制器 → 防止旧结果或旧错误修改页面
```

### 5. 手动取消请求

```js
cancelButton.addEventListener("click", function () {
  if (currentController) {
    currentController.abort();
    currentController = null;
    statusMessage.textContent = "请求已取消";
  }
});
```

---

## 九、搜索事件

### 点击搜索

```js
searchButton.addEventListener("click", function () {
  const keyword = searchInput.value.trim();

  if (keyword === "") {
    statusMessage.textContent = "请输入搜索内容";
    userList.innerHTML = "";
    return;
  }

  searchUsers(keyword, 2000);
});
```

`encodeURIComponent(keyword)` 可以安全地把用户输入放进 URL 查询参数，避免空格、中文和特殊字符破坏 URL。

### 回车复用按钮逻辑

```js
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchButton.click();
  }
});
```

`searchButton` 是 DOM 元素，不能写成 `searchButton()`。调用 `.click()` 才是触发按钮已经绑定的点击逻辑。

---

## 十、网络错误与代码错误的区别

今天遇到：

```text
net::ERR_CONNECTION_RESET
```

它表示浏览器与接口之间的连接被网络、代理、防火墙或服务器中断，不代表 Fetch 代码一定写错。

区别：

```text
ERR_CONNECTION_RESET             → 网络连接问题
Controller is not defined        → 变量大小写或未声明
searchButton is not a function   → 把DOM元素当函数调用
HTTP 404/500                     → 服务器返回了非成功HTTP状态
```

JavaScript 区分大小写：

```js
const controller = new AbortController();

// 正确
controller.signal

// 错误，Controller变量不存在
Controller.signal
```

---

## 十一、今日易错点

1. `async` 函数返回普通值，调用结果仍然是 Promise。
2. `await` 得到成功数据，不是原来的 Promise。
3. `await` 只暂停当前 `async` 函数，不会阻塞整个程序。
4. `fetch()` 和 `response.json()` 都返回 Promise，因此有两次 `await`。
5. 404、500 通常不会让 Fetch 自动进入 `catch`，要检查 `response.ok`。
6. 空数据是成功状态，不是错误状态。
7. 加载状态要在 `await` 前设置，清理工作放在 `finally`。
8. 防抖不能取消已经发出的旧请求。
9. Fetch 必须传入 `controller.signal`，不是 `controller`。
10. `AbortError` 是主动取消，不应显示为请求失败。
11. `controller !== currentController` 表示当前函数属于旧请求。
12. 旧请求的成功结果和错误都不能修改最新页面。
13. DOM 按钮需要使用 `searchButton.click()` 触发，不能写 `searchButton()`。

---

## 十二、口述验收

不看代码回答：

1. `async` 函数返回普通值时，调用者得到什么？
2. `await` 暂停的是整个程序还是当前函数？
3. `await fetch(url)` 得到的是什么？
4. 为什么 `response.json()` 也需要 `await`？
5. 为什么要检查 `response.ok`？
6. 加载、成功、空数据和错误状态分别在什么时候显示？
7. 为什么仅使用防抖仍可能出现过期搜索结果？
8. `controller.signal` 的作用是什么？
9. `abort()` 以后为什么会进入 `catch`？
10. 为什么 `AbortError` 不应该显示为请求失败？
11. 为什么 `currentController` 要定义在函数外？
12. 为什么成功分支和错误分支都要检查请求是否仍是最新请求？

## 今日总结

`async/await` 是基于 Promise 的异步写法。Fetch 需要分别等待响应和 JSON 解析，并主动检查 HTTP 状态。页面要明确处理加载、成功、空数据和错误状态。连续搜索时，使用 `AbortController` 取消旧请求，再通过控制器身份比较阻止旧结果或旧错误更新页面，才能保证最终展示的一定是用户最后一次搜索的结果。
