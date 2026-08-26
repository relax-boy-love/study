# 第 20 天：HTTP 与缓存

## 今日学习目标

- 理解 HTTP 请求与响应的组成。
- 整理 GET、POST、PUT、PATCH、DELETE 的区别。
- 掌握常见状态码、请求头和响应头。
- 理解强缓存和协商缓存。
- 使用 Network 面板判断资源为什么来自缓存。

---

## 一、HTTP 请求与响应（约 35 分钟）

一次基础 HTTP 通信：

```text
浏览器发送HTTP请求
→ 服务器处理请求
→ 服务器返回HTTP响应
```

### HTTP 请求

```text
请求行 → 请求头 → 空行 → 请求体（不一定存在）
```

示例：

```http
GET /users?page=2 HTTP/1.1
Host: example.com
Accept: application/json
Authorization: Bearer abc123
```

- `GET`：请求方法。
- `/users?page=2`：请求目标。
- `HTTP/1.1`：协议版本。
- `Authorization` 等信息属于请求头。
- POST 等方法提交的 JSON 数据通常位于请求体。

### HTTP 响应

```text
状态行 → 响应头 → 空行 → 响应体（不一定存在）
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=3600

{"users":[]}
```

响应体不只可以是 HTML，还可以是 CSS、JavaScript、JSON、图片、视频等内容。

---

## 二、常见 HTTP 请求方法（约 45 分钟）

| 方法 | 常见用途 | 数据位置 | 安全 | 通常幂等 |
| --- | --- | --- | --- | --- |
| GET | 获取资源 | 查询条件通常位于 URL | 是 | 是 |
| POST | 创建资源或提交操作 | 请求体 | 否 | 否 |
| PUT | 完整替换资源 | 请求体 | 否 | 是 |
| PATCH | 局部修改资源 | 请求体 | 否 | 不保证 |
| DELETE | 删除资源 | 通常由 URL 指明资源 | 否 | 是 |

### PUT 与 PATCH

```text
PUT   → 通常用完整数据替换资源
PATCH → 通常只修改资源的部分字段
```

### 安全与幂等

HTTP 中的“安全”表示只读取资源，不修改服务器状态，不是指是否使用 HTTPS 加密。

幂等表示：

> 对同一个资源执行一次和连续执行多次，服务器的最终状态相同。

DELETE 第二次可能返回 404，但最终状态仍然是“资源不存在”，所以通常认为 DELETE 是幂等的。POST 创建请求执行两次可能创建两条数据，因此通常不幂等。

登录通常使用 POST，使账号和密码位于请求体，避免直接出现在 URL、浏览记录和部分日志中。但 POST 本身不负责加密，登录仍然必须使用 HTTPS。

---

## 三、常见 HTTP 状态码（约 35 分钟）

| 范围 | 含义 |
| --- | --- |
| 1xx | 信息性状态 |
| 2xx | 请求成功 |
| 3xx | 重定向或缓存相关 |
| 4xx | 客户端请求问题 |
| 5xx | 服务器处理问题 |

| 状态码 | 含义 |
| --- | --- |
| 200 | 请求成功 |
| 201 | 成功创建资源 |
| 204 | 请求成功，但没有响应体 |
| 301 | 永久重定向 |
| 302 | 临时重定向 |
| 304 | 资源未修改，继续使用本地缓存 |
| 400 | 请求格式或参数错误 |
| 401 | 没有有效身份认证 |
| 403 | 已识别身份，但没有访问权限 |
| 404 | 资源不存在 |
| 409 | 请求与资源当前状态冲突 |
| 422 | 请求格式可理解，但业务数据校验失败 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 502 | 网关收到无效上游响应 |
| 503 | 服务暂时不可用 |
| 504 | 网关等待上游响应超时 |

收到 `204 No Content` 后不应直接调用 `response.json()`，因为没有响应体可供解析。

Fetch 收到 404、500 等 HTTP 响应时通常不会自动 rejected，需要主动检查：

```js
if (!response.ok) {
    throw new Error(
        "请求失败，状态码：" +
        response.status
    );
}
```

---

## 四、请求头与响应头（约 40 分钟）

### 常见请求头

| 请求头 | 作用 |
| --- | --- |
| Host | 指明目标主机 |
| Accept | 客户端希望接收的数据格式 |
| Content-Type | 当前请求体的数据格式 |
| Authorization | 提供身份认证凭据 |
| Cookie | 浏览器向服务器发送 Cookie |
| User-Agent | 描述浏览器或运行环境 |
| Referer | 表示请求可能从哪个页面发起 |
| If-None-Match | 把旧 ETag 交给服务器验证 |
| If-Modified-Since | 把旧的修改时间交给服务器验证 |

### 常见响应头

| 响应头 | 作用 |
| --- | --- |
| Content-Type | 当前响应体的数据格式 |
| Content-Length | 响应体长度，通常以字节为单位 |
| Set-Cookie | 要求浏览器保存 Cookie |
| Location | 指明重定向地址或新资源位置 |
| Cache-Control | 控制缓存行为 |
| Expires | 使用绝对时间表示缓存过期时间 |
| ETag | 服务器提供的资源标识符 |
| Last-Modified | 资源最后修改时间 |

重点区别：

```text
Accept       → 客户端希望收到什么格式
Content-Type → 当前发送的消息体是什么格式

Cookie       → 浏览器向服务器发送Cookie
Set-Cookie   → 服务器要求浏览器保存Cookie
```

协商缓存的对应关系：

```text
响应头：ETag
请求头：If-None-Match

响应头：Last-Modified
请求头：If-Modified-Since
```

---

## 五、强缓存与协商缓存（约 55 分钟）

### 1. 强缓存

缓存仍然新鲜时，浏览器直接使用本地资源，不向服务器发送验证请求。

```http
Cache-Control: public, max-age=3600
```

表示资源在约 3600 秒内可以直接使用缓存。

Network 中可能显示：

```text
(memory cache)
(disk cache)
0 B
```

- memory cache：资源来自内存。
- disk cache：资源来自磁盘。
- 它们描述存储位置，而“强缓存、协商缓存”描述缓存验证策略。

### 2. Cache-Control 常用指令

| 指令 | 含义 |
| --- | --- |
| `max-age=3600` | 在约 3600 秒内缓存新鲜 |
| `no-cache` | 可以保存，但每次使用前必须验证 |
| `no-store` | 不要保存该响应的缓存 |
| `public` | 浏览器和 CDN 等共享缓存都可保存 |
| `private` | 只适合用户自己的私有缓存保存 |
| `immutable` | 有效期内资源不会改变 |
| `must-revalidate` | 过期后必须向服务器重新验证 |

```text
no-cache → 可以存，使用前要验证
no-store → 不允许存储
```

文件名带内容哈希的资源适合长期缓存：

```text
app.a8f3c2.js
style.19bd4a.css
```

内容改变时文件名也会改变，不会继续请求旧地址。

`Expires` 使用绝对时间表示过期时间；如果它和 `Cache-Control: max-age` 同时存在，现代浏览器通常优先使用 Cache-Control。

### 3. 协商缓存

缓存需要验证时，浏览器会联系服务器。

#### ETag

第一次响应：

```http
ETag: "app-version-1"
```

下次请求：

```http
If-None-Match: "app-version-1"
```

#### Last-Modified

第一次响应：

```http
Last-Modified: Tue, 25 Aug 2026 10:00:00 GMT
```

下次请求：

```http
If-Modified-Since: Tue, 25 Aug 2026 10:00:00 GMT
```

服务器判断结果：

```text
资源未变化 → 304，不发送完整响应体，浏览器复用本地内容
资源已变化 → 200，返回最新响应体和新的验证信息
```

### 4. 完整判断流程

```text
需要资源
→ 本地没有缓存
  → 请求服务器，得到200和完整资源

→ 本地有缓存
  → 缓存仍然新鲜
    → 强缓存，直接使用本地资源

  → 缓存已经过期或要求验证
    → 携带If-None-Match或If-Modified-Since请求服务器
      → 未变化：304，复用本地响应体
      → 已变化：200，下载最新响应体
```

---

## 六、本地缓存实验代码（环境搭建约 15 分钟）

目录结构：

```text
http-cache-practice/
├── server.js
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

### server.js

```js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const publicDirectory = path.join(__dirname, "public");

function sendFile(
    response,
    fileName,
    contentType,
    headers = {}
) {
    const filePath = path.join(publicDirectory, fileName);

    fs.readFile(filePath, function (error, content) {
        if (error) {
            response.writeHead(500, {
                "Content-Type": "text/plain; charset=utf-8"
            });
            response.end("读取文件失败");
            return;
        }

        response.writeHead(200, {
            "Content-Type": contentType,
            ...headers
        });
        response.end(content);
    });
}

const server = http.createServer(function (request, response) {
    console.log(request.method, request.url);

    if (request.url === "/") {
        sendFile(
            response,
            "index.html",
            "text/html; charset=utf-8",
            { "Cache-Control": "no-store" }
        );
        return;
    }

    if (request.url === "/style.css") {
        sendFile(
            response,
            "style.css",
            "text/css; charset=utf-8",
            { "Cache-Control": "public, max-age=60" }
        );
        return;
    }

    if (request.url === "/app.js") {
        const etag = '"app-version-1"';

        if (request.headers["if-none-match"] === etag) {
            response.writeHead(304, {
                ETag: etag,
                "Cache-Control": "no-cache"
            });
            response.end();
            return;
        }

        sendFile(
            response,
            "app.js",
            "text/javascript; charset=utf-8",
            {
                ETag: etag,
                "Cache-Control": "no-cache"
            }
        );
        return;
    }

    response.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
    });
    response.end("资源不存在");
});

server.listen(PORT, function () {
    console.log(`服务器已启动：http://localhost:${PORT}`);
});
```

### public/index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTTP缓存实验</title>
    <link rel="stylesheet" href="/style.css">
    <script src="/app.js" defer></script>
</head>
<body>
    <main class="page">
        <h1>HTTP缓存实验</h1>
        <p>打开Network面板，观察HTML、CSS和JavaScript的缓存行为。</p>
        <button id="request-button" type="button">测试JavaScript</button>
        <p id="result"></p>
    </main>
</body>
</html>
```

### public/style.css

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 32px;
    font-family: Arial, "Microsoft YaHei", sans-serif;
    color: #1f2937;
    background-color: #f3f4f6;
}

.page {
    width: min(100%, 720px);
    margin-inline: auto;
    padding: 32px;
    border-radius: 12px;
    background-color: #ffffff;
}

button {
    min-height: 44px;
    padding: 8px 16px;
    border: 0;
    border-radius: 6px;
    color: #ffffff;
    background-color: #2563eb;
    font: inherit;
    cursor: pointer;
}
```

### public/app.js

```js
const requestButton = document.querySelector("#request-button");
const result = document.querySelector("#result");

requestButton.addEventListener("click", function () {
    result.textContent = "JavaScript文件已经成功执行";
});

console.log(
    "app.js执行时间：",
    new Date().toLocaleTimeString()
);
```

启动方式：

```powershell
node server.js
```

访问：

```text
http://localhost:3000
```

不能直接双击 HTML，也不使用 Live Server，因为本实验需要由 `server.js` 设置缓存响应头。

---

## 七、Network 面板实验结果（约 35 分钟）

### 1. 主 HTML：no-store

观察结果：

```text
Status: 200
Cache-Control: no-store
第二次刷新仍然发送请求
Size显示实际传输大小
```

判断：浏览器不保存该响应缓存，因此下次访问需要重新请求。

### 2. style.css：强缓存

观察结果：

```text
Cache-Control: public, max-age=60
60秒内再次请求时Size为0 B
没有If-None-Match
没有If-Modified-Since
```

判断：资源在有效期内直接由本地缓存满足，没有向服务器进行缓存验证，属于强缓存。

### 3. app.js：协商缓存

第一次响应：

```text
Status: 200
ETag: "app-version-1"
Cache-Control: no-cache
```

再次请求：

```text
If-None-Match: "app-version-1"
Status: 304
```

判断：浏览器把旧 ETag 交给服务器，服务器确认资源没有改变，未发送完整响应体；浏览器最终使用本地缓存中的 JavaScript 内容。

### 4. Disable cache

勾选后：

- `style.css` 重新从网络请求；
- `app.js` 返回 200 和完整内容；
- 不再看到 memory cache 或 disk cache。

实验完成后应取消勾选，以恢复正常缓存行为并避免影响后续调试结果。

---

## 八、根据 Network 判断缓存来源（约 15 分钟）

建议依次检查：

1. `Status` 是 200 还是 304；
2. `Size` 是实际传输大小、memory cache 还是 disk cache；
3. Response Headers 中的 `Cache-Control`；
4. Request Headers 中是否有 `If-None-Match`；
5. Response Headers 中是否有 `ETag`；
6. Request Headers 中是否有 `If-Modified-Since`；
7. Response Headers 中是否有 `Last-Modified`；
8. `Disable cache` 是否被勾选。

典型判断：

```text
200 + memory/disk cache
→ 强缓存，资源来自本地内存或磁盘

304 + If-None-Match
→ ETag协商缓存，服务器确认未变化，使用本地响应体

200 + If-None-Match + 新ETag
→ 进行了协商，但资源已变化，使用服务器返回的新响应体

200 + no-store
→ 不保存缓存，下次需要重新请求
```

综合案例：

```http
Cache-Control: private, max-age=600
ETag: "user-v1"
```

- 前 600 秒：命中用户自己的私有强缓存，不询问服务器。
- 过期以后：浏览器把 `"user-v1"` 放入 `If-None-Match`，向服务器验证。
- 未改变：服务器返回 304，浏览器复用本地内容。
- 已改变：服务器返回 200、最新响应体和新的 ETag。

---

## 九、重点易错点

1. POST 不负责加密，HTTPS 中的 TLS 才负责加密传输。
2. `204` 没有响应体，不要直接执行 `response.json()`。
3. Fetch 收到 404、500 时通常不会自动 rejected。
4. `no-cache` 不是不缓存，而是使用前必须验证。
5. `no-store` 才是不允许存储响应缓存。
6. memory cache 和 disk cache 是存储位置，不是缓存验证策略。
7. `304` 不包含完整响应体，浏览器会复用本地内容。
8. `ETag` 位于响应头，`If-None-Match` 位于后续请求头。
9. `Last-Modified` 位于响应头，`If-Modified-Since` 位于后续请求头。
10. 仅看到状态码 200，不能直接断定资源一定重新通过网络下载，还要检查 Size 和缓存信息。

## 今日验收

- [x] 能说明 HTTP 请求和响应的结构。
- [x] 能解释 GET、POST、PUT、PATCH、DELETE 的区别。
- [x] 能识别常见 HTTP 状态码。
- [x] 能区分常见请求头和响应头。
- [x] 能解释强缓存和协商缓存。
- [x] 能说明 `no-cache` 与 `no-store` 的区别。
- [x] 能使用 Network 面板分析缓存。
- [x] 能根据响应头判断资源为什么来自缓存。

**今日预计学习时间：约 4 小时 35 分钟。**

