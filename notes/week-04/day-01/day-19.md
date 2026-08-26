# 第 19 天：浏览器工作原理

## 今日学习目标

- 梳理从输入 URL 到页面展示的完整过程。
- 理解 DOM、CSSOM、渲染树、Layout、Paint 和 Composite。
- 区分重排、重绘与合成。
- 使用 Performance 面板观察页面渲染过程和布局抖动。

---

## 一、URL 与页面导航（约 30 分钟）

示例 URL：

```text
https://shop.example.com:443/products/100?color=black&size=42#reviews
```

| 部分 | 内容 |
| --- | --- |
| 协议 | `https` |
| 域名 | `shop.example.com` |
| 端口 | `443` |
| 路径 | `/products/100` |
| 查询参数 | `?color=black&size=42` |
| 页面片段 | `#reviews` |

`#reviews` 通常只供浏览器在当前页面内定位，不会随 HTTP 请求发送给服务器。

浏览器会先解析地址，识别协议、域名、端口、路径、查询参数和片段，然后检查缓存。缓存有效时，部分资源可以直接复用；命中缓存不代表一定完全不访问服务器，例如浏览器可能向服务器验证缓存是否仍然有效。

基础顺序：

```text
输入 URL
→ 解析 URL
→ 检查缓存
→ DNS 查询
→ 建立连接
→ 发送 HTTP 请求
→ 接收 HTTP 响应
```

---

## 二、DNS、TCP、TLS 与 HTTP（约 40 分钟）

### 1. DNS

DNS 负责把人类容易记忆的域名转换成服务器的 IP 地址。浏览器会优先检查已有的 DNS 缓存，以减少查询时间。

### 2. TCP

获得 IP 后，浏览器通常通过 TCP 三次握手建立连接。它的主要目的是确认双方具备收发数据的能力，并准备好通信。

### 3. TLS

HTTPS 还需要进行 TLS 协商，用来：

- 验证服务器身份；
- 协商加密方式；
- 建立安全的加密通信；
- 降低数据被窃听或篡改的风险。

### 4. HTTP

地址栏访问网页通常发送 GET 请求。HTTP 请求可包含请求方法、请求头和请求体；GET 请求通常没有请求体。

HTTP 响应主要包含：

- 状态码；
- 响应头；
- 响应体。

常见状态码：

| 状态码 | 含义 |
| --- | --- |
| 200 | 请求成功 |
| 304 | 缓存资源仍然可以使用 |
| 404 | 请求的资源不存在 |
| 500 | 服务器内部错误 |

`fetch()` 收到 404 或 500 时通常仍会正常得到 Response，因此需要主动检查：

```js
if (!response.ok) {
    throw new Error("请求失败：" + response.status);
}
```

网络阶段的基础顺序：

```text
DNS → TCP → TLS（HTTPS）→ HTTP 请求 → HTTP 响应
```

---

## 三、DOM、CSSOM 与脚本加载（约 45 分钟）

浏览器可以在 HTML 下载过程中流式解析内容，不必等待整个文件全部下载完成。

- HTML 被解析成 DOM。
- CSS 被解析成 CSSOM。
- JavaScript 修改的是浏览器当前内存中的 DOM，不会直接改写服务器上的 HTML 文件。
- 解析到 `<link rel="stylesheet">` 时，浏览器会请求并解析 CSS。

CSS 经常被称为渲染阻塞资源，因为浏览器需要 CSSOM 才能准确确定元素最终应该怎样显示。

### script、defer 与 async

| 写法 | 下载与执行特点 |
| --- | --- |
| 普通 `script` | 通常暂停 HTML 解析，下载并执行后再继续解析 |
| `defer` | 并行下载，不阻塞 HTML 解析；DOM 构建完成后按书写顺序执行 |
| `async` | 并行下载，下载完成后尽快执行；执行时可能暂停 HTML 解析，不保证书写顺序 |

`async` 不适合依赖前一个脚本执行结果的代码。

### DOMContentLoaded 与 load

- `DOMContentLoaded`：DOM 构建完成，并完成需要等待的脚本后触发，通常不等待图片全部加载。
- `load`：页面依赖的图片、样式等资源全部加载完成后触发。

通常 `DOMContentLoaded` 先于 `load`。

---

## 四、从 DOM 到屏幕画面（约 45 分钟）

```text
DOM + CSSOM
→ 计算样式
→ 渲染树
→ Layout
→ Paint
→ Composite
→ 屏幕画面
```

### 1. 计算样式

浏览器根据继承、选择器优先级、层叠规则和默认样式，确定每个元素最终生效的样式。

### 2. 渲染树

浏览器把需要显示的 DOM 内容和计算样式结合成渲染树。并非所有 DOM 节点都会进入渲染树，例如 `display: none` 的元素仍存在于 DOM 中，但不参与布局和绘制。

| 样式 | 是否占据布局空间 | 是否可见 |
| --- | --- | --- |
| `display: none` | 否 | 否 |
| `visibility: hidden` | 是 | 否 |
| `opacity: 0` | 是 | 否，但仍可能响应点击 |

### 3. Layout（布局）

计算元素的宽度、高度、横纵坐标以及元素之间的位置关系。

### 4. Paint（绘制）

根据布局结果生成文字、颜色、边框、阴影等绘制指令。

### 5. Composite（合成）

把不同图层按照位置、层级和透明度组合成最终画面。

`transform` 动画在适当条件下可能主要进行合成，因此通常比不断修改 `width` 或 `left` 更适合动画，但这不是绝对保证。不要给所有元素随意添加 `will-change`，否则可能增加内存占用。

---

## 五、重排、重绘与合成（约 35 分钟）

### 重排（Reflow / Layout）

元素的几何信息发生变化，需要重新计算布局。重排之后通常还可能继续发生重绘和合成。

常见例子：

```js
element.style.width = "500px";
element.style.height = "200px";
element.style.margin = "20px";
element.style.fontSize = "32px";
```

### 重绘（Repaint / Paint）

元素位置和尺寸通常没有变化，但外观发生改变，不一定需要重新计算布局。

```js
element.style.backgroundColor = "red";
element.style.color = "white";
element.style.boxShadow = "0 4px 12px #0003";
```

### 合成（Composite）

在适当条件下，以下属性的变化可能主要由合成阶段完成：

```js
element.style.transform = "translateX(50px)";
element.style.opacity = "0.5";
```

这只是常见情况，不代表 `transform` 和 `opacity` 在任何页面中都绝对不会触发 Paint。

### 布局抖动

下面的循环交替写入布局属性并读取几何信息：

```js
for (let i = 0; i < 100; i++) {
    box.style.width = i + "px";
    console.log(box.offsetWidth);
}
```

写入 `width` 后，浏览器原本可以稍后统一执行 Layout；但紧接着读取 `offsetWidth` 时，为了立即返回准确数据，浏览器可能被迫提前完成布局。反复执行会产生多次 Layout，形成布局抖动。

优化的基本思路是把读取和写入分组，尽量先读后写，避免反复交错。

---

## 六、Performance 面板实验（约 40 分钟）

打开 Chrome 或 Edge 开发者工具，选择 `Performance`，开始录制后运行动画或布局抖动实验，再停止录制。

重点观察：

- `Main`：主线程时间线；
- `Frames`：每一帧的耗时；
- `Recalculate Style`：重新计算样式；
- `Layout`：重新布局；
- `Paint`：重新绘制；
- 合成相关工作；
- 是否存在强制同步布局。

实验结果：

1. 修改 `left` 的动画中能看到 Layout 和 Paint。
2. 修改 `transform` 时 Layout 更少，主要出现合成相关工作。
3. 两种动画肉眼都能移动，但性能成本并不相同。
4. 布局抖动实验中出现多次 Layout。

布局抖动实验中的关键代码：

```js
// 修改布局信息
item.style.width = 40 + index % 10 + "px";

// 读取布局信息
const width = item.offsetWidth;

// 只保存数据，通常不是引发布局变化的关键
item.dataset.width = width;
```

在 60Hz 屏幕上，一帧常以约 `16.7ms` 为参考。如果主线程任务持续超过这一时间，动画可能掉帧。

性能优化前应该先测量，确认真正耗时的是 Layout、Paint、JavaScript 还是其他任务，再针对瓶颈优化，不能只凭感觉判断。

---

## 七、输入 URL 到页面展示的完整过程（约 25 分钟）

用户输入 URL 后，浏览器先解析协议、域名、端口、路径和查询参数，并检查已有缓存是否可以使用。需要访问服务器时，DNS 把域名转换成 IP 地址；浏览器通过 TCP 建立连接，HTTPS 页面还会进行 TLS 协商，以验证服务器身份并建立加密通信。

连接建立后，浏览器发送 HTTP 请求，服务器返回状态码、响应头和响应体。浏览器可以一边接收一边解析 HTML，逐步构建 DOM；解析过程中发现 CSS、JavaScript、图片等外部资源时，会继续发起相应请求。CSS 被解析成 CSSOM，普通脚本可能暂停 HTML 解析，而 `defer` 和 `async` 具有不同的下载与执行时机。

浏览器结合 DOM 与 CSSOM 计算最终样式，生成包含可见内容的渲染树。随后通过 Layout 计算元素尺寸和位置，通过 Paint 生成绘制指令，再通过 Composite 合成各个图层，最终把页面显示到屏幕上。页面显示后，如果 DOM 或样式继续变化，浏览器可能再次执行布局、绘制或合成。

---

## 八、重点易错点

1. 检查缓存不等于 DNS；DNS 才负责把域名转换成 IP。
2. HTTP 响应不只有 HTML，也可能是 CSS、JavaScript、图片或 JSON。
3. 不是所有 DOM 节点都会进入渲染树。
4. `visibility: hidden` 和 `opacity: 0` 仍然占据空间。
5. 普通脚本、`defer` 和 `async` 的执行时机不同。
6. 重排通常会继续引起重绘和合成，重绘不一定需要重排。
7. `transform` 和 `opacity` 只是可能主要进行合成，并非绝对。
8. 循环中反复“修改布局 → 读取几何信息”容易产生布局抖动。

## 今日验收

- [x] 能说明 URL 的组成部分。
- [x] 能说明 DNS、TCP、TLS 和 HTTP 的基础关系。
- [x] 能区分 DOM、CSSOM 和渲染树。
- [x] 能解释 Layout、Paint 和 Composite。
- [x] 能判断常见属性变化可能触发的渲染阶段。
- [x] 能说明布局抖动的原因和基础优化方法。
- [x] 能使用 Performance 面板观察渲染记录。
- [x] 能完整口述“输入 URL 后发生什么”。

**今日预计学习时间：约 4 小时 20 分钟。**

