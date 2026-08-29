# 第 21 天：登录鉴权与跨域

## 今日学习目标

- 理解 Cookie、Session、Token 和 JWT。
- 掌握 Access Token、Refresh Token、刷新和退出流程。
- 理解同源策略、CORS 与预检请求。
- 使用 Vite 代理解决本地接口跨域。
- 能解释“跨域是谁限制的”和“代理为什么有效”。

---

## 一、Cookie 与 Session（约 35 分钟）

HTTP 本身是无状态的。服务器不会天然知道前后两次请求来自同一个已登录用户，因此需要额外的身份凭据。

### Cookie

Cookie 是保存在用户浏览器中的一小段数据。符合域名、路径和安全策略等条件时，浏览器会自动携带它。

服务器要求浏览器保存 Cookie：

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax
```

浏览器后续发送 Cookie：

```http
Cookie: sessionId=abc123
```

```text
响应头 Set-Cookie → 服务器要求浏览器保存
请求头 Cookie     → 浏览器向服务器发送
```

### 常见 Cookie 属性

| 属性 | 作用 |
| --- | --- |
| `HttpOnly` | JavaScript 通常不能读取，降低 Cookie 被 XSS 脚本直接盗取的风险 |
| `Secure` | 只通过 HTTPS 发送 |
| `SameSite` | 控制跨站请求是否自动携带 Cookie |
| `Max-Age` / `Expires` | 控制有效期 |

`HttpOnly` 不能彻底解决 XSS；`SameSite=None` 通常还必须配合 `Secure`。

### Session

Session 方案把真正的登录状态保存在服务器：

```js
sessions = {
    "abc123": {
        userId: 10,
        role: "student"
    }
};
```

浏览器通常只保存：

```text
sessionId=abc123
```

请求流程：

```text
浏览器自动发送sessionId Cookie
→ 服务器根据sessionId查询Session
→ 找到用户身份和权限
→ 判断用户已经登录
```

完整退出需要服务器删除或失效 Session，并让 sessionId Cookie 过期。只清空前端页面数据不算完整退出。

### Cookie 与 Session 的区别

```text
Cookie  → 浏览器侧的数据保存与自动携带机制
Session → 服务器侧保存登录状态的方案
```

---

## 二、Token 与 JWT（约 40 分钟）

### Token

Token 可以理解为服务器签发给客户端的访问凭据。

使用 Token 访问接口时，前端通常主动添加：

```http
Authorization: Bearer accessToken
```

```js
fetch("/api/profile", {
    headers: {
        Authorization:
            "Bearer " + accessToken
    }
});
```

Cookie 和 Token 不是互斥概念：

```text
Cookie → 数据保存与发送机制
Token  → 身份凭据的一种形式
```

Token 也可以保存在 Cookie 中。

### JWT

JWT 是 Token 的一种常见格式，不是所有 Token 都是 JWT。

```text
Header.Payload.Signature
```

- Header：Token 类型和签名算法。
- Payload：用户标识、角色、签发时间、过期时间等声明。
- Signature：用于检测内容是否被篡改。

常见声明：

| 字段 | 含义 |
| --- | --- |
| `sub` | 主体标识，常用作用户 ID |
| `iat` | 签发时间 |
| `exp` | 过期时间 |
| `iss` | 签发者 |
| `aud` | 接收者 |

JWT 的 Header 和 Payload 通常只是 Base64URL 编码，并没有加密。拿到 JWT 的人通常可以解码，因此不能把密码、银行卡信息或服务器密钥放入 Payload。

只解码 Payload 不能证明 JWT 有效。服务器必须验证：

```text
签名
→ exp是否过期
→ iss、aud等声明
→ 用户身份和权限
```

### Session 与 Token 对比

| 内容 | 浏览器保存 | 服务器保存 |
| --- | --- | --- |
| Session 方案 | sessionId Cookie | Session 登录记录 |
| Access Token | 常保存在前端内存 | JWT 验证密钥；不一定逐个保存 Token |
| Refresh Token | 常保存在 HttpOnly Cookie | 通常保存验证、轮换或撤销记录 |

Session 容易立即失效，因为服务器可以删除对应记录。普通 JWT 可能只依赖签名和过期时间验证，服务器若没有保存每个 Token，就没有对应记录可直接删除。

### Token 存储风险

- `localStorage`：刷新后仍存在，但 JavaScript 可读取，发生 XSS 时可能被盗取。
- `sessionStorage`：标签页会话内有效，但 JavaScript 仍可读取。
- `HttpOnly Cookie`：JavaScript 通常不能读取，但需要正确处理 SameSite、Secure、CORS 和 CSRF。

不能简单认为 JWT 一定比 Session 安全，应结合架构和威胁模型选择。

---

## 三、登录、刷新与退出流程（约 40 分钟）

### Access Token 与 Refresh Token

```text
Access Token  → 有效期较短，用于访问业务接口
Refresh Token → 有效期较长，用于申请新的Access Token
```

Access Token 有效期短，可以缩短泄露后的可利用时间。Refresh Token 使用频率低但影响时间长，常保存在 HttpOnly、Secure Cookie 中。

### 1. 登录流程

```text
用户输入账号和密码
→ 前端通过HTTPS发送登录请求
→ 服务器验证账号和密码
→ 签发Access Token和Refresh Token
→ Access Token保存在前端内存
→ Refresh Token保存在HttpOnly、Secure Cookie
```

### 2. 访问受保护接口

```http
Authorization: Bearer accessToken
```

```text
服务器验证Token签名和声明
→ Token无效或过期：401
→ 身份有效但权限不足：403
→ 验证通过：返回业务数据
```

### 3. 刷新流程

```text
Access Token过期
→ 业务接口返回401
→ 前端POST /api/auth/refresh
→ 浏览器携带Refresh Token Cookie
→ 服务器验证Refresh Token
→ 返回新的Access Token
→ 可能同时轮换新的Refresh Token
→ 前端重新发送原业务请求
```

刷新失败时：

```text
停止继续刷新
→ 清空Access Token和用户状态
→ 跳转登录页
```

刷新接口失败后不能继续刷新，否则可能形成无限请求循环。

### 4. Refresh Token 轮换

```text
旧Refresh Token失效
→ 签发新Access Token
→ 同时签发新Refresh Token
```

旧 Refresh Token 再次出现时，服务器可以将其视为泄露风险。

### 5. 退出流程

```text
前端请求退出接口
→ 服务器撤销或失效Refresh Token
→ 服务器通过Set-Cookie让Refresh Token Cookie过期
→ 前端清空Access Token和用户状态
→ 跳转登录页
```

清除 Cookie 示例：

```http
Set-Cookie: refreshToken=; Max-Age=0; HttpOnly; Secure
```

### credentials: include

跨源 Fetch 需要携带 Cookie 时可能使用：

```js
fetch(
    "https://api.example.com/auth/refresh",
    {
        method: "POST",
        credentials: "include"
    }
);
```

前端配置还不够，服务器必须正确返回允许携带凭据的 CORS 响应头，Cookie 也必须符合 SameSite、Secure、域名和路径规则。

---

## 四、同源策略与跨域（约 40 分钟）

### 源的组成

```text
协议 + 主机 + 端口
```

路径和查询参数不参与同源判断。

当前页面：

```text
http://localhost:5173
```

| 地址 | 是否同源 | 原因 |
| --- | --- | --- |
| `http://localhost:5173/users` | 是 | 三部分相同 |
| `http://localhost:5173/products?page=2` | 是 | 只改变路径和查询参数 |
| `http://localhost:3000/users` | 否 | 端口不同 |
| `https://localhost:5173/users` | 否 | 协议不同 |
| `http://127.0.0.1:5173/users` | 否 | 主机不同 |

### 跨域是谁限制的

> 跨域主要由浏览器的同源策略限制，它主要限制网页中的 JavaScript 读取跨源响应。

它不是 JavaScript 语言本身的限制，也不是服务器天然不能通信。Node.js、后端程序和 Postman 不执行浏览器页面的同源策略。

CORS 错误不一定说明请求没有发出：

```text
正式请求可能已经发出并被服务器处理
→ 响应缺少正确CORS许可
→ 浏览器不让前端JavaScript读取响应
```

复杂请求也可能先预检；预检失败时，正式请求才不会发送。

`img`、`script`、`link` 等标签可以加载部分跨源资源，但能够加载不等于 JavaScript 可以随意读取内容。

---

## 五、CORS 与预检请求（约 35 分钟）

CORS 是目标服务器通过 HTTP 响应头给浏览器的跨源读取许可。

```http
Access-Control-Allow-Origin: http://localhost:5173
```

表示允许来自该源的网页读取响应。

### 携带 Cookie

前端：

```js
fetch(url, {
    credentials: "include"
});
```

服务器：

```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

携带凭据时，`Access-Control-Allow-Origin` 不能使用 `*`，必须明确指定允许的源。

### 简单请求

常见简单请求方法：

```text
GET、HEAD、POST
```

允许成为简单请求的常见 Content-Type：

```text
application/x-www-form-urlencoded
multipart/form-data
text/plain
```

POST 不一定是简单请求。`Content-Type: application/json`、`Authorization`、PATCH 等通常会触发预检。

### OPTIONS 预检

```http
OPTIONS /users HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: content-type, authorization
```

服务器允许时返回：

```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

预检过程：

```text
浏览器询问允许的源、方法、请求头和凭据
→ 预检通过：发送正式请求
→ 预检失败：不发送正式请求
```

CORS 不是身份认证。CORS 决定浏览器是否把响应交给前端 JavaScript；身份认证决定用户是谁以及是否有权限。

---

## 六、Vite 代理实验（约 40 分钟）

实验环境：

```text
Vite前端：http://localhost:5173
Node接口：http://localhost:3000
```

3000 接口故意不返回 CORS 响应头。

### 直接请求

```js
fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        username: "xiaoming",
        password: "123456"
    })
});
```

因为 5173 与 3000 端口不同，所以跨源。JSON POST 触发 OPTIONS 预检，3000 没有返回 CORS 许可，因此预检失败。

实际观察结果：

- 直接请求页面显示失败；
- 控制台出现 CORS 错误；
- Network 中出现 OPTIONS；
- 后端终端记录 `OPTIONS /login`。

### Vite 代理配置

`vite.config.js`：

```js
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                rewrite: function (path) {
                    return path.replace(
                        /^\/api/,
                        ""
                    );
                }
            }
        }
    }
});
```

前端请求：

```js
const loginResponse = await fetch(
    "/api/login",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: "xiaoming",
            password: "123456"
        })
    }
);
```

转发过程：

```text
浏览器请求 http://localhost:5173/api/login
→ Vite开发服务器接收
→ rewrite删除/api
→ Vite请求 http://localhost:3000/login
→ 接口响应给Vite
→ Vite响应给浏览器
```

`rewrite` 删除 `/api`，因为后端定义的是 `/login`。不删除时后端会收到 `/api/login`，当前实验会返回 404。

`changeOrigin: true` 会调整代理请求中的目标主机信息，使其符合目标服务器。

### 代理为什么有效

> 浏览器只向同源的 5173 发送请求，Vite 再从服务器端请求 3000。服务器到服务器的请求不受浏览器同源策略限制。

代理没有关闭浏览器安全策略，而是改变了浏览器实际请求的地址。

```text
CORS → 目标服务器明确允许浏览器跨源读取
代理 → 让浏览器只发送同源请求，由服务器转发
```

Vite 代理主要用于本地开发。生产环境通常使用 Nginx、网关、后端服务或反向代理完成转发。

实验结果：

- 通过代理登录成功；
- 页面成功显示小明的数据；
- 浏览器 Network 中请求地址为 5173；
- 3000 后端收到 `POST /login` 和 `GET /profile`。

---

## 七、最终流程图（约 10 分钟）

### 登录

```text
账号密码
→ HTTPS发送登录请求
→ 服务器验证账号密码
→ 签发Access Token和Refresh Token
→ Access Token存前端内存
→ Refresh Token存HttpOnly、Secure Cookie
```

### 访问接口

```text
Authorization: Bearer AccessToken
→ 服务器验证签名、有效期、身份和权限
→ 无效或过期：401
→ 身份有效但权限不足：403
```

### 刷新

```text
业务接口返回401
→ POST /api/auth/refresh
→ 浏览器携带Refresh Token Cookie
→ 服务器验证Refresh Token
→ 返回新Access Token
→ 重试原业务请求
→ 刷新失败则退出登录
```

### 退出

```text
请求退出接口
→ 服务器撤销Refresh Token
→ 让Refresh Token Cookie过期
→ 前端清空Access Token和用户状态
→ 跳转登录页
```

---

## 八、重点易错点

1. 浏览器保存 sessionId，服务器保存完整 Session 记录。
2. `Authorization: Bearer` 后面通常是 Access Token，不是 sessionId。
3. JWT Payload 只是编码，不等于加密。
4. 只解码 JWT 不能证明有效，必须验证签名和声明。
5. Access Token 访问接口，Refresh Token 只用于刷新。
6. Access Token 过期通常返回 401；身份有效但权限不足返回 403。
7. 刷新接口是 `/api/auth/refresh`，不是登录接口。
8. Refresh Token 验证失败后不能无限刷新。
9. 同源比较协议、主机、端口，不比较路径。
10. 跨域主要由浏览器限制前端 JavaScript 读取响应。
11. CORS 错误不代表请求一定没有发送。
12. CORS 是目标服务器许可；代理是同源服务器转发。

## 今日验收

- [x] 能区分 Cookie、Session、Token 和 JWT。
- [x] 能说明数据分别保存在浏览器还是服务器。
- [x] 能画出登录、携带 Token、刷新和退出流程。
- [x] 能判断同源与跨源。
- [x] 能解释 CORS 与 OPTIONS 预检。
- [x] 完成 Vite 代理实验。
- [x] 能解释“跨域是谁限制的”。
- [x] 能解释“代理为什么有效”。

**今日预计学习时间：约 4 小时。**

