# 第 14 天：盒模型、定位、BFC 与层叠上下文

## 今日学习内容与时间

- 盒模型与尺寸计算：35 分钟
- 外边距折叠、高度塌陷与 BFC：40 分钟
- 定位方式与包含块：40 分钟
- 层叠上下文与 `z-index`：35 分钟
- 双栏、三栏、吸顶和弹窗布局：55 分钟
- 综合排错与口述验收：20 分钟
- 复习笔记与 Git 上传：15 分钟

总计约 4 小时。

## 一、盒模型

盒模型从内到外：

```text
content → padding → border → margin
```

- `content`：内容区域
- `padding`：内容与边框之间的距离
- `border`：边框
- `margin`：元素与其他元素之间的距离，不属于背景区域

### content-box

```css
.box {
    box-sizing: content-box;
    width: 200px;
    padding: 20px;
    border: 5px solid;
}
```

`width` **只包含 content**：

```text
可见总宽度
= content 200
+ 左右padding 40
+ 左右border 10
= 250px
```

### border-box

```css
.box {
    box-sizing: border-box;
    width: 200px;
    padding: 20px;
    border: 5px solid;
}
```

`width` 包含 `content + padding + border`：

```text
可见总宽度：200px
content宽度：200 - 40 - 10 = 150px
```

两种模型的 `width` 都不包含 `margin`。

现代项目通常统一设置：

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}
```

这样设置 `width: 100%` 后，padding 和 border 不会继续把元素撑出父容器。

## 二、外边距折叠

### 相邻兄弟元素

两个普通块元素的垂直正外边距可能折叠：

```text
margin-bottom: 30px
margin-top: 50px
最终间距通常为50px，而不是80px
```

外边距折叠通常发生在垂直方向，水平方向通常不会发生。

### 父子元素

父元素没有 border、padding、行内内容等分隔条件时，第一个子元素的 `margin-top` 可能与父元素发生折叠，表现为父元素整体向下移动。

以下方式可以分隔父子外边距：

- 给父元素添加适当的 `padding-top`
- 给父元素添加 `border-top`
- 让父元素形成 BFC

## 三、高度塌陷与 BFC

### 高度塌陷

当父元素没有固定高度，内部元素全部浮动时，浮动元素不会按普通文档流方式为父元素贡献高度，父元素可能无法被撑高。

```css
.float-item {
    float: left;
    width: 200px;
    height: 120px;
}
```

高度塌陷是**父元素没有被撑高**，不是浮动子元素的高度变成了 0。

不要依赖固定高度解决，因为内容数量、文字换行和屏幕宽度都可能变化。

### BFC

BFC（Block Formatting Context）可以理解为相对独立的块级布局区域。

常见作用：

- 包含内部浮动，解决父元素高度塌陷
- 处理父子垂直外边距折叠
- 避免布局区域与外部浮动重叠

现代推荐使用：

```css
.container {
    display: flow-root;
}
```

`overflow: hidden` 也能创建 BFC，但可能裁剪溢出内容，因此不能随意使用。

实验结果：

```text
添加flow-root前：父元素高度0px
添加flow-root后：父元素高度120px
父元素背景可以包住浮动元素
后续内容恢复正常位置
```

## 四、定位

### static

- 默认定位方式
- 按普通文档流排列
- `top/right/bottom/left` 通常无效

### relative

- 相对于元素**自己原来的位置**偏移
- 原来的文档流空间仍然保留
- 常用于给绝对定位子元素提供定位参照

### absolute

- 脱离普通文档流
- 原空间不保留
- 寻找最近的、`position` 不是 `static` 的祖先作为定位参照
- 不一定相对于直接父元素定位

```css
.card {
    position: relative;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
}
```

关闭按钮相对于 `.card` 的右上角定位。

### fixed

- 脱离普通文档流
- 基本情况下相对于视口定位
- 页面滚动时仍保持在视口指定位置
- 适合悬浮按钮、全屏遮罩

### sticky

- 开始时按普通流排列
- 滚动达到 `top` 等限制位置后吸附
- 受到滚动容器和祖先范围限制

```css
.sticky-nav {
    position: sticky;
    top: 0;
    z-index: 10;
}
```

`sticky` 不依赖祖先的 `position: relative`。

常见失效原因：

- 忘记设置 `top`、`bottom` 等吸附位置
- 页面没有足够内容产生滚动
- 祖先的 `overflow: hidden/auto/scroll` 改变了滚动参照
- 父容器范围或高度不足

## 五、层叠上下文与 z-index

同一层叠上下文中，元素重叠时，较大的 `z-index` 通常显示在上方。数值相同的情况下，HTML 中靠后的元素通常在上方。

但 `z-index` 不是全页面统一比较的“权重”。浏览器会先比较父级层叠上下文：

```text
parent-a（z-index: 1）
└── child-a（z-index: 9999）

parent-b（z-index: 2）
└── child-b（z-index: 1）
```

`child-a` 的 9999 只能在 `parent-a` 内比较。由于 `parent-a` 整体低于 `parent-b`，`child-a` 仍可能被 `child-b` 遮挡。

### 常见层叠上下文触发条件

- 定位元素配合非 `auto` 的 `z-index`
- `position: fixed` 或 `sticky`
- `opacity` 小于 1
- `transform` 不是 `none`
- `filter`
- `isolation: isolate`

普通的 `position: relative` 配合默认 `z-index: auto`，通常不会单独创建层叠上下文。

### z-index 排错顺序

```text
元素是否真正重叠
→ 自身z-index是否在当前环境生效
→ 祖先是否创建层叠上下文
→ 祖先层级是否较低
→ 是否被祖先overflow裁剪
```

被 `overflow: hidden` 裁剪属于裁剪问题，继续增加 `z-index` 无法解决。

## 六、吸顶布局

```css
body {
    margin: 0;
}

.sticky-nav {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 16px 24px;
    background-color: #fff;
}
```

导航开始位于头部下方，滚动到视口顶部时开始吸附。`z-index` 用于避免后续内容在重叠时覆盖导航。

实验时给 `.page` 添加 `overflow: hidden` 会影响 sticky，应在正常版本中删除该属性，除非确实需要新的滚动或裁剪行为。

## 七、弹窗布局

```css
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(0 0 0 / 50%);
}

.modal {
    position: relative;
    width: min(90%, 420px);
    padding: 24px;
    border-radius: 12px;
    background-color: #fff;
}

.modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
}
```

- `fixed`：遮罩覆盖视口并在滚动时保持覆盖
- `inset: 0`：等价于 `top/right/bottom/left: 0`
- Flex：让弹窗水平、垂直居中
- `.modal { position: relative; }`：为关闭按钮提供定位参照
- 关闭按钮使用 absolute 定位在弹窗右上角

## 八、双栏布局

```css
.two-column-layout {
    display: flex;
    gap: 20px;
}

.sidebar {
    flex: 0 0 220px;
}

.content {
    flex: 1;
    min-width: 0;
}
```

`flex: 0 0 220px`：

```text
第一个0：不放大
第二个0：不缩小
220px：基础宽度
```

`.content { flex: 1; }` 占据剩余空间，`min-width: 0` 允许内容区缩小，避免长内容撑破布局。

## 九、三栏与响应式布局

```css
.three-column-layout {
    display: flex;
    gap: 20px;
}

.left-sidebar {
    flex: 0 0 180px;
}

.main-content {
    flex: 1;
    min-width: 0;
}

.right-sidebar {
    flex: 0 0 240px;
}

@media (max-width: 768px) {
    .three-column-layout {
        flex-direction: column;
    }

    .left-sidebar,
    .right-sidebar {
        flex-basis: auto;
    }
}
```

宽屏显示左、中、右三栏；窄屏按 HTML 顺序变为纵向单栏。

## 十、今日易错点

1. `content-box` 的 `width` 只包含 content，不包含 padding、border 和 margin。
2. `border-box` 的 `width` 包含 content、padding、border，但仍不包含 margin。
3. `relative` 相对于自己原来的位置，不是相对于视口。
4. `absolute` 寻找最近的非 static 定位祖先，而不是只寻找 relative 或块元素。
5. `sticky` 吸顶需要 `top` 等偏移属性，不依赖 `position: relative`。
6. `overflow` 可能改变 sticky 的滚动参照，也可能裁剪元素。
7. `.modal` 设置 relative 是为了让关闭按钮相对弹窗右上角定位。
8. `z-index` 只在相应层叠上下文中比较，不能单看数值大小。
9. HTML 中文页面应使用 `lang="zh-CN"`，并使用有意义的 `<title>`。
10. 正式 HTML 中，`style` 应放在 `head` 内或外部 CSS 文件中，`script` 应放在 `</body>` 前或使用外部 JS 文件。

## 十一、最终验收回答

### 为什么 z-index 会失效？

`z-index` 只能在相应的层叠上下文中比较。子元素即使设置很大的数值，如果祖先层叠上下文层级较低，仍可能被其他层叠上下文遮挡。如果元素被祖先的 `overflow: hidden` 裁剪，增加 `z-index` 也无法解决。

### 什么是高度塌陷？

父元素没有固定高度，内部元素全部浮动时，浮动元素不会按普通流方式为父元素贡献高度，导致父元素没有被撑高。可使用 `display: flow-root` 创建 BFC，使父元素包含内部浮动。

## 十二、复习自测

1. `content-box` 和 `border-box` 的 `width` 分别包含什么？
2. 为什么 `width: 100%` 配合 content-box 的 padding 可能溢出？
3. 相邻垂直正外边距为什么不是简单相加？
4. 高度塌陷发生在父元素还是浮动子元素？
5. `display: flow-root` 有什么作用？
6. relative、absolute、fixed、sticky 的区别是什么？
7. absolute 如何寻找定位参照？
8. sticky 常见失效原因有哪些？
9. 为什么 `z-index: 9999` 可能输给 `z-index: 1`？
10. 双栏布局中为什么经常使用 `min-width: 0`？
