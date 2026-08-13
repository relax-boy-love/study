# 第 15 天：Flex 与 Grid

## 今日学习内容与时间

- Flex 核心概念与主轴、交叉轴：30 分钟
- Flex 导航与垂直居中：35 分钟
- Flex 卡片与自适应列表：40 分钟
- Grid 核心概念：35 分钟
- Grid 后台整体布局：50 分钟
- Flex 与 Grid 的选择：20 分钟
- 闭卷布局练习与验收：20 分钟
- 复习笔记与 Git 上传：10 分钟

总计约 4 小时。

## 一、Flex 容器与项目

```css
.container {
    display: flex;
}
```

- 设置 `display: flex` 的父元素是 Flex 容器
- 它的直接子元素是 Flex 项目
- Flex 只直接排列子元素，不会直接排列孙子元素
- 默认 `flex-direction: row`，项目横向排列

## 二、主轴与交叉轴

```text
flex-direction: row
主轴：水平
交叉轴：垂直

flex-direction: column
主轴：垂直
交叉轴：水平
```

对齐属性：

```css
.container {
    justify-content: center; /* 主轴 */
    align-items: center;     /* 交叉轴 */
}
```

不能把 `justify-content` 永远记成水平对齐，也不能把 `align-items` 永远记成垂直对齐，实际方向取决于 `flex-direction`。

## 三、Flex 导航

```css
.site-header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 16px 24px;
}

.main-nav {
    display: flex;
    gap: 16px;
}

.login-link {
    margin-left: auto;
}
```

- `.site-header` 排列 Logo、导航和登录链接
- `.main-nav` 排列内部的导航链接
- `margin-left: auto` 吸收登录链接左侧的剩余空间，把它推到最右侧
- `gap` 只在项目之间产生间距，不需要单独清除最后一项的 margin

## 四、Flex 水平和垂直居中

```css
.login-page {
    min-height: calc(100vh - 72px);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
}

.login-card {
    width: min(100%, 420px);
}
```

- `calc(100vh - 72px)`：视口高度减去导航高度
- 容器必须具有足够高度，才能看出垂直居中效果
- `min(100%, 420px)`：宽屏最多 `420px`，窄屏使用可用宽度

## 五、Flex 卡片内部布局

```css
.user-card {
    min-height: 260px;
    display: flex;
    flex-direction: column;
}

.user-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-card__avatar {
    flex: 0 0 56px;
    width: 56px;
    height: 56px;
}

.user-card__description {
    flex: 1;
}

.user-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

卡片主轴为垂直方向，描述区域的 `flex: 1` 会占据中间剩余高度，把 footer 推向底部。

一个组件可以嵌套多层 Flex，因为每层容器只排列自己的直接子元素。

## 六、Flex 伸缩简写

```css
flex: flex-grow flex-shrink flex-basis;
```

例如固定侧栏：

```css
.sidebar {
    flex: 0 0 240px;
}
```

含义：

```text
flex-grow: 0      不放大
flex-shrink: 0    不缩小
flex-basis: 240px 基础尺寸240px
```

自适应卡片：

```css
.user-card {
    flex: 1 1 260px;
    min-width: 220px;
}
```

- 有剩余空间时可以放大
- 空间不足时可以缩小
- 基础宽度为 `260px`
- 不能缩得小于 `220px`

## 七、Flex 自动换行列表

```css
.card-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}
```

- 默认 `flex-wrap: nowrap`，空间不足时先尝试挤压项目
- `wrap` 允许空间不足时换行
- `gap` 同时产生行间距和列间距

### 宽度计算

容器宽度 `880px`，每张卡片基础宽度 `260px`，间距 `20px`：

```text
三张卡片：260 × 3 + 20 × 2 = 820px
剩余空间：880 - 820 = 60px
每张分配：60 ÷ 3 = 20px
最终每张：280px

四张卡片：260 × 4 + 20 × 3 = 1100px
```

四张无法按基础宽度放入 `880px`，第四张会换到下一行。

## 八、Grid 基础

```css
.grid-container {
    display: grid;
    grid-template-columns: 200px 1fr 1fr;
    gap: 20px;
}
```

- `grid-template-columns` 定义列
- `grid-template-rows` 定义行
- `fr` 表示可分配的剩余空间份数
- `gap` 同时设置行间距和列间距

### fr 计算

容器宽度 `1000px`：

```css
grid-template-columns: 200px 1fr 2fr;
gap: 20px;
```

```text
固定列：200px
两个间距：40px
剩余空间：1000 - 200 - 40 = 760px
总份数：1 + 2 = 3份
1fr：约253.33px
2fr：约506.67px
```

计算顺序：先减固定轨道，再减 gap，最后按 fr 比例分配剩余空间。

## 九、repeat、minmax 与 auto-fit

```css
.card-list {
    display: grid;
    grid-template-columns:
        repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
}
```

- `repeat(3, 1fr)`：重复创建三条 `1fr` 网格列
- `auto-fit`：根据容器宽度自动决定列数
- `minmax(220px, 1fr)`：每列最小 `220px`，有剩余空间时平均放大
- 容器变窄放不下更多列时，后续项目进入下一行

注意：`repeat()` 重复的是网格轨道，不是创建 HTML 卡片。

列表改为 Grid 后，应删除卡片作为 Flex 项目时使用的：

```css
flex: 1 1 260px;
```

但卡片内部仍然可以继续使用：

```css
.user-card {
    display: flex;
    flex-direction: column;
}
```

## 十、Grid 后台整体布局

```css
.dashboard {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: 64px 1fr 48px;
    grid-template-areas:
        "header  header"
        "sidebar main"
        "footer  footer";
}

.dashboard-header {
    grid-area: header;
}

.dashboard-sidebar {
    grid-area: sidebar;
}

.dashboard-main {
    grid-area: main;
    min-width: 0;
}

.dashboard-footer {
    grid-area: footer;
}
```

`grid-template-areas` 是父容器画出的命名区域；子元素通过 `grid-area` 进入对应区域。

`"header header"` 表示同一个 header 横跨两列。

主内容设置 `min-width: 0`，允许其在可用空间内缩小，避免长文本、表格或图表撑破布局。

## 十一、外层 Grid 嵌套内层 Grid

```css
.statistics-grid {
    display: grid;
    grid-template-columns:
        repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}
```

- 外层 `.dashboard` 排列 header、sidebar、main、footer
- 内层 `.statistics-grid` 排列统计卡片
- 每个 Grid 只排列自己的直接子元素，因此不会冲突

## 十二、Grid 响应式后台

```css
@media (max-width: 768px) {
    .dashboard {
        grid-template-columns: 1fr;
        grid-template-rows: 64px auto 1fr 48px;
        grid-template-areas:
            "header"
            "sidebar"
            "main"
            "footer";
    }
}
```

- 宽屏：侧栏与 main 并排
- 窄屏：header、sidebar、main、footer 从上到下排列
- sidebar 行使用 `auto`，由菜单内容自动撑高
- 不需要修改 HTML 顺序
- 内层统计卡片仍可自动改变列数

## 十三、Flex 与 Grid 的选择

### Flex 更适合

- 一行导航
- 图标和文字对齐
- 简单的左固定、右自适应双栏
- 弹窗内部从上到下排列
- 宽度由内容决定的自动换行标签

### Grid 更适合

- 后台页面整体框架
- 规则的商品或用户卡片矩阵
- 同时控制行和列
- 内容跨行或跨列

两者都可能实现对方的一些布局。选择时应判断哪种方式更符合页面结构、代码更清楚，而不是只看“能不能实现”。

## 十四、闭卷验收：左固定、右自适应

```css
.work-layout {
    display: flex;
    gap: 20px;
}

.work-sidebar {
    flex: 0 0 240px;
}

.work-content {
    flex: 1;
    min-width: 0;
}
```

- 左侧不放大、不缩小，基础宽度 `240px`
- 右侧占据剩余空间
- `min-width: 0` 允许右侧缩小，避免长内容撑破布局
- 这个布局主要沿水平方向排列两个区域，属于一维布局，使用 Flex 更直接
- 若再加入横跨两栏的 header 和 footer，使用 Grid 描述整体二维结构更清楚

## 十五、今日易错点

1. Flex 默认是 `row`，不是纵向排列。
2. `justify-content` 控制主轴，`align-items` 控制交叉轴。
3. Grid 的 `columns` 是列，`rows` 是行。
4. `gap` 在 Flex 换行或 Grid 中同时产生横向、纵向间距。
5. `1fr + 2fr` 是三份，不是两份。
6. 计算 fr 前必须先减去固定列和 gap。
7. Grid 外层与 Flex 内层可以同时使用，并不会冲突。
8. 卡片列表改为 Grid 后，要删除卡片作为 Flex 项目的伸缩属性。
9. `min-width: 0` 不是用于空内容，而是允许项目被压缩，避免长内容撑破布局。
10. HTML 中文页面应使用 `lang="zh-CN"`，并使用有意义的标题。
11. 正式页面应把 CSS 放入 `head` 或外部文件，把脚本放在 `</body>` 前或外部文件中。

## 十六、自测题

1. Flex 容器默认主轴是什么方向？
2. `justify-content` 和 `align-items` 分别控制什么？
3. `margin-left: auto` 在导航中有什么作用？
4. `flex: 0 0 240px` 的三个值分别表示什么？
5. 为什么自适应主内容经常需要 `min-width: 0`？
6. `1fr` 表示什么？
7. fr 宽度的计算顺序是什么？
8. `repeat(auto-fit, minmax(220px, 1fr))` 表示什么？
9. `grid-template-areas` 与 `grid-area` 如何配合？
10. 哪些场景更适合 Flex，哪些场景更适合 Grid？
