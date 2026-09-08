# 第 22 天：Web 安全

## 今日学习目标

- 理解 XSS、CSRF、点击劫持和敏感信息泄漏。
- 编写一个本地 XSS 示例，观察脚本执行过程并完成修复。
- 理解 Cookie 的 `HttpOnly`、`Secure` 和 `SameSite` 属性。
- 掌握 CSRF Token、来源检查等基本 CSRF 防护方式。
- 检查当前练习中不安全的 HTML 渲染方式。
- 完成链表遍历与链表长度练习。

---

## 今日学习安排

| 部分 | 内容 | 预计时间 |
| --- | --- | ---: |
| 一 | XSS 原理与数据流 | 35 分钟 |
| 二 | 本地 XSS 实验 | 40 分钟 |
| 三 | XSS 修复与验证 | 35 分钟 |
| 四 | CSRF、Cookie、点击劫持和信息泄漏 | 35 分钟 |
| 五 | 不安全 HTML 渲染检查 | 35 分钟 |
| 六 | 链表算法练习 | 30 分钟 |
| 七 | 笔记、复盘与综合验收 | 30 分钟 |

**主线预计学习时间：约 4 小时。**

---

## 一、XSS

### 1. XSS 是什么

XSS（Cross-Site Scripting，跨站脚本攻击）是指：应用把不可信数据当成可执行内容处理，使攻击者提供的脚本在可信网站的页面环境中运行。

本次 DOM 型 XSS 实验的数据流：

```text
用户输入形成不可信数据
→ 数据流入危险接收点 innerHTML
→ 浏览器将字符串解析成 HTML
→ 元素的事件属性触发 JavaScript
```

XSS 的关键不是用户输入了内容，而是不可信数据到达了能够将其解释为代码的危险位置。

### 2. Source 与 Sink

```js
const comment = input.value;
output.innerHTML = comment;
```

- Source（不可信数据源）：`input.value`，数据由用户控制。
- Sink（危险接收点）：`output.innerHTML`，它会把字符串解析为 HTML。

```text
不可信数据本身不一定立即造成漏洞
→ 数据进入危险 Sink
→ 浏览器把数据当成可执行内容
→ 形成 XSS
```

### 3. 存在漏洞的代码

```js
button.addEventListener("click", function () {
    const comment = input.value;
    output.innerHTML = comment;
});
```

当用户输入普通 HTML 时：

```html
<strong>这是一条加粗评论</strong>
```

浏览器会创建 `strong` 元素，而不是显示完整标签。

本地无害验证输入：

```html
<img
    src="invalid-image"
    onerror="document.querySelector('#status').textContent='脚本已经执行'"
>
```

图片加载失败后触发 `onerror`，其中的 JavaScript 修改了页面内容。这证明用户输入已经不再只是数据，而是被浏览器当成了可执行内容。

> 该示例仅用于自己的本地练习页面，不应在他人网站中测试。

---

## 二、XSS 修复

页面只需要显示普通文本时，应优先使用 `textContent`：

```js
button.addEventListener("click", function () {
    const comment = input.value;

    // 将用户输入作为文本渲染，避免被解析成可执行的 HTML
    output.textContent = comment;
});
```

修复后的数据流：

```text
用户输入
→ input.value
→ textContent
→ 浏览器按普通文本显示
→ 不创建用户输入的 HTML 元素
→ 不执行事件属性中的 JavaScript
```

### 实际实验结果

| 测试内容 | 使用 `innerHTML` | 使用 `textContent` |
| --- | --- | --- |
| 普通评论 | 显示普通文字 | 显示普通文字 |
| `<strong>...</strong>` | 创建标签并显示加粗文字 | 显示完整标签文本 |
| 带 `onerror` 的错误图片 | 创建 `img`，失败事件执行 | 不创建 `img`，事件不执行 |
| `status` 内容 | 变成“脚本已经执行” | 保持“脚本没有执行” |

修复有效的原因：`textContent` 把用户输入当作数据，而不是当作可以由浏览器解析和执行的代码。

### 需要富文本时

如果业务确实需要显示经过允许的富文本，不能简单地把不可信内容直接交给 `innerHTML`。应使用可靠、持续维护的 HTML 净化方案，并根据输出位置采用正确的编码或净化规则。

---

## 三、XSS 与 HttpOnly

`HttpOnly` 只限制 JavaScript 通过 `document.cookie` 读取或修改设置了该属性的 Cookie。

```http
Set-Cookie: session=abc123; HttpOnly
```

`HttpOnly` 不能阻止 XSS 脚本：

- 修改 DOM；
- 监听页面事件；
- 读取页面中其他可访问的数据；
- 以当前登录用户的身份调用同源接口。

```text
不能读取登录 Cookie
≠
不能利用当前登录状态
```

浏览器在符合 Cookie 规则时仍会自动携带 Cookie。因此，`HttpOnly` 可以降低 Cookie 被 XSS 脚本直接窃取的风险，但不能修复 XSS。

---

## 四、CSRF

### 1. CSRF 是什么

CSRF（Cross-Site Request Forgery，跨站请求伪造）是指：攻击者诱导已登录用户的浏览器，向可信网站发送并非用户本人意愿的请求。

```text
用户已经登录可信网站
→ 浏览器保存登录 Cookie
→ 用户访问攻击页面
→ 攻击页面触发到可信网站的请求
→ 受害者浏览器根据规则自动携带已有 Cookie
→ 服务器可能误认为这是用户主动操作
```

攻击者通常没有看到或取得 Cookie。攻击者负责诱导请求，Cookie 是受害者浏览器直接发送给目标网站的。

### 2. 为什么只检查 Cookie 不够

Cookie 可以证明请求属于一个有效的登录会话，但不能证明请求是用户主动发出的。

```text
有效 Cookie
→ 证明登录会话有效

有效 Cookie + 有效 CSRF Token
→ 进一步证明请求来自能够取得 Token 的可信页面
```

### 3. 为什么不能使用 GET 修改数据

GET 很容易被普通资源加载和导航触发，例如：

```html
<img src="https://shop.example/change-address?address=xxx">

<a href="https://shop.example/change-address?address=xxx">
    查看详情
</a>
```

地址栏访问、页面跳转、预加载或爬虫也可能触发 GET。

```text
GET：读取数据，不应修改服务器业务状态
POST、PUT、PATCH、DELETE：用于相应的创建、更新或删除操作
```

把 GET 改成 POST 并不能单独彻底防止 CSRF，还需要其他防护。

### 4. CSRF 防护

常见防护措施：

1. 使用 CSRF Token。
2. 正确设置 Cookie 的 `SameSite`。
3. 服务端检查 `Origin` 或 `Referer`。
4. 不使用 GET 修改数据。
5. 对高风险操作要求重新认证或二次确认。

多种措施可以组合使用，形成纵深防御。

### 5. CSRF Token

CSRF Token 最重要的要求：

- 与正确的用户会话关联；
- 保密；
- 不可预测。

Token 不一定每次请求都必须更新：

- 按会话生成：一个登录会话使用一个 Token，实现较简单。
- 按请求生成：每次请求使用新 Token，安全窗口更小，但实现更复杂，也可能影响返回上一页等操作。

Token 更适合放在请求体或自定义请求头中：

```http
POST /change-address
Content-Type: application/json
X-CSRF-Token: random-secret-value

{"address":"新地址"}
```

不应把 Token 放在 URL 查询参数中，因为完整 URL 可能进入：

- 浏览器历史记录；
- 服务器、代理或网关日志；
- 监控与统计系统；
- 某些情况下的 `Referer`；
- 用户复制或分享的链接。

---

## 五、Cookie 安全属性

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax
```

| 属性 | 主要作用 | 不能解决的问题 |
| --- | --- | --- |
| `HttpOnly` | 限制 JavaScript 读取特定 Cookie | 不能阻止 XSS 执行或浏览器自动发送 Cookie |
| `Secure` | 只通过 HTTPS 发送 Cookie，本地开发环境可能有特殊处理 | 不能单独防止 XSS 或 CSRF |
| `SameSite` | 限制跨站请求是否携带 Cookie | 不能修复不安全的 HTML 渲染 |

### SameSite 的取值

| 值 | 行为 |
| --- | --- |
| `Strict` | 跨站请求通常不携带 Cookie，限制最严格，但可能影响从外站跳转后的登录体验 |
| `Lax` | 允许部分跨站顶层导航携带 Cookie，通常阻止跨站子资源请求和跨站 POST 携带 Cookie |
| `None` | 允许跨站请求携带 Cookie，必须同时设置 `Secure` |

`SameSite` 是 CSRF 的重要防护层，但不能在所有系统中直接代替 CSRF Token 和服务端来源检查。

---

## 六、XSS 与 CSRF 对比

| 对比项 | XSS | CSRF |
| --- | --- | --- |
| 核心问题 | 不可信数据被当成可执行内容 | 浏览器被诱导发送非用户意愿的请求 |
| 执行位置 | 可信网站的页面环境 | 受害者浏览器发往可信网站的请求 |
| 是否必须取得 Cookie | 不一定 | 不需要 |
| 主要防护 | 安全输出、上下文编码、HTML 净化、CSP 等 | CSRF Token、SameSite、来源检查等 |
| `HttpOnly` 的作用 | 降低 Cookie 被直接读取的风险，不能修复 XSS | 不阻止浏览器自动携带 Cookie |

---

## 七、点击劫持

点击劫持是指攻击者在自己的页面中嵌入透明或伪装的目标网站 `iframe`，诱导用户点击目标网站中的真实操作按钮。

```text
用户看到攻击者设计的诱导页面
→ 透明的目标网站 iframe 覆盖在按钮上
→ 用户点击诱导位置
→ 实际点击目标网站中的敏感按钮
```

主要防护应由服务端响应头完成。

禁止任何页面嵌入：

```http
Content-Security-Policy: frame-ancestors 'none'
```

只允许同源页面嵌入：

```http
Content-Security-Policy: frame-ancestors 'self'
```

- `frame-ancestors` 是 CSP 指令名称。
- `'none'` 禁止任何页面嵌入，包括同源页面。
- `'self'` 允许同源页面嵌入。

旧版兼容方案：

```http
X-Frame-Options: DENY
```

---

## 八、敏感信息泄漏

核心原则：发送到浏览器的内容，不能再被当作真正的服务器秘密。

常见风险：

```js
const databasePassword = "admin123";

const token =
    new URLSearchParams(location.search).get("token");

console.log("当前 Token：", token);
localStorage.setItem("token", token);
```

这段代码包含四处风险：

1. 数据库密码写入前端源码，会进入用户可检查的前端资源。
2. Token 放在 URL 中，可能进入历史记录、日志、监控系统或 `Referer`。
3. Token 输出到控制台，可能被本机用户、扩展、日志采集或共享截图暴露。
4. Token 保存在 `localStorage`，发生 XSS 时脚本可以读取。

真正的数据库密码和服务器私钥必须保存在服务端，不能进入前端源码或打包产物。接口也应该只返回页面真正需要的数据字段。

---

## 九、当前代码安全检查

本次没有可供检查的旧业务项目，因此改为审计当天的 XSS 练习。

检查结果：

```text
Source：input.value
→ Sink：output.innerHTML
→ 风险：输入被解析成 HTML，事件属性可以执行 JavaScript
→ 修复：output.textContent = comment
→ 验证：标签按文字显示，img 不创建，onerror 不执行
```

练习文件：[`xss-demo/index.html`](./xss-demo/index.html)

以后检查 Vue 项目时重点搜索：

```text
v-html
innerHTML
outerHTML
insertAdjacentHTML
document.write
eval
localStorage / sessionStorage 中的 Token
前端环境变量中的秘密
包含敏感数据的 console.log
```

搜索到这些内容不代表一定存在漏洞，需要继续追踪数据来源和最终流向。

---

## 十、链表练习

### 1. 链表结构

```js
const node3 = {
    value: 30,
    next: null
};

const node2 = {
    value: 20,
    next: node3
};

const node1 = {
    value: 10,
    next: node2
};

const head = node1;
```

数据关系：

```text
head
↓
node1 → node2 → node3 → null
  10      20      30
```

### 2. 遍历链表

```js
let current = head;

while (current !== null) {
    console.log(current.value);
    current = current.next;
}
```

实际输出：

```text
10
20
30
```

必须执行 `current = current.next`，否则 `current` 会一直指向原节点，循环条件始终为真并形成死循环。

### 3. 计算链表长度

```js
function countNodes(head) {
    let count = 0;
    let current = head;

    while (current !== null) {
        count++;
        current = current.next;
    }

    return count;
}

console.log(countNodes(head));
console.log(countNodes(null));
```

实际输出：

```text
3
0
```

- 非空链表：每访问一个节点，`count` 增加 1。
- 空链表：`current` 初始为 `null`，循环不执行，返回 `0`。
- 时间复杂度：`O(n)`，因为需要访问全部 `n` 个节点。
- 空间复杂度：`O(1)`，因为只使用固定数量的变量。

---

## 十一、重点易错点

1. XSS 的关键不是“脚本出现在可信页面”，而是不可信数据被当成可执行内容。
2. `innerHTML` 是本次实验的危险 Sink；输入到达 Sink 时才形成执行风险。
3. `HttpOnly` 保护特定 Cookie，不保护整个网页，也不能阻止 XSS 修改 DOM。
4. CSRF 攻击者通常看不到 Cookie；受害者浏览器直接把 Cookie 发给目标网站。
5. Cookie 只能证明登录会话有效，不能证明请求是用户主动发出的。
6. `<img>` 不会取得 Cookie，它只负责触发请求；浏览器决定是否携带已有 Cookie。
7. GET 的风险不只是 URL 可见，而是图片、链接、导航等行为都容易触发它。
8. CSRF Token 不一定每次请求都更新，但必须保密、不可预测并与正确会话关联。
9. Token 不应放进 URL，避免进入历史记录、日志、监控系统或 `Referer`。
10. `Content-Security-Policy: frame-ancestors 'none'` 中，`frame-ancestors` 是指令名称。
11. `'none'` 禁止任何页面嵌入，包括同源页面；`'self'` 才允许同源嵌入。
12. 前端环境变量并不能保护服务器私钥，进入前端包的内容可被用户检查。
13. 计算链表长度必须访问每个节点，因此时间复杂度是 `O(n)`。

---

## 十二、最终流程图

### XSS 漏洞与修复

```text
漏洞：
用户输入
→ input.value
→ innerHTML
→ 浏览器解析HTML
→ 创建元素
→ 事件触发JavaScript

修复：
用户输入
→ input.value
→ textContent
→ 作为普通文本显示
→ 不创建输入中的元素
→ 不执行事件代码
```

### CSRF 攻击与防护

```text
攻击：
用户已登录
→ 攻击页面诱导请求
→ 浏览器自动携带Cookie
→ 服务器只验证Cookie
→ 错误执行敏感操作

防护：
非GET修改请求
+ CSRF Token
+ SameSite Cookie
+ Origin / Referer检查
→ 服务器拒绝不合法请求
```

---

## 十三、今日验收

- [x] 能解释 XSS 的攻击数据流。
- [x] 能识别 `input.value` 是 Source、`innerHTML` 是危险 Sink。
- [x] 完成本地 XSS 实验并观察 `onerror` 执行。
- [x] 使用 `textContent` 完成修复并重新验证。
- [x] 能解释 XSS 与 CSRF 的攻击方式和区别。
- [x] 能解释 `HttpOnly`、`Secure` 和 `SameSite`。
- [x] 能说出至少三项 CSRF 防护措施。
- [x] 能解释点击劫持及 `frame-ancestors`。
- [x] 能识别前端源码、URL、控制台和 `localStorage` 的泄漏风险。
- [x] 完成链表遍历与 `countNodes` 练习。
- [x] 综合知识验收通过。
- [ ] 检查 Git 状态并完成当天提交。
- [ ] 记录额外 2～3 小时面试训练结果。

**学习结论：主线知识与代码验收通过；Git 提交和额外面试训练待完成。**

**主线预计学习时间：约 4 小时；实际总学习时间待补充。**

---

## 十四、参考资料

- [OWASP：Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP：Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP：Clickjacking Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)
- [MDN：Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
