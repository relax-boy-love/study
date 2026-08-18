# 第 16 天：响应式与移动端

## 今日学习内容与时间

- 移动端 viewport：25 分钟
- 流式布局与相对单位：40 分钟
- 媒体查询与断点：40 分钟
- 图片与媒体适配：25 分钟
- 桌面页面三端响应式改造：75 分钟
- 375px、768px、1440px 综合测试：20 分钟
- 复习笔记与 Git 上传：15 分钟

总计约 4 小时。

## 一、移动端 viewport

```html
<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>
```

- `viewport`：浏览器展示网页的可视区域
- `width=device-width`：让布局视口宽度等于设备的 CSS 宽度
- `initial-scale=1.0`：页面初始缩放比例为 1
- 媒体查询依据 CSS 视口宽度，而不是屏幕物理像素总数

缺少 viewport 时，手机浏览器可能把页面当成较宽的桌面网页，再整体缩小显示，导致文字很小、媒体查询表现异常。

通常不建议使用：

```text
user-scalable=no
maximum-scale=1.0
```

它们会限制用户缩放，影响低视力用户阅读。

## 二、流式容器

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}

.page-container {
    width: 100%;
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: clamp(16px, 4vw, 40px);
}
```

- `width: 100%`：跟随可用宽度
- `max-width: 1200px`：宽屏时不无限拉宽
- `margin-inline: auto`：把左右剩余空间平均分配，使容器居中
- `padding-inline`：控制左右内边距
- `border-box`：width 包含 padding 和 border，降低溢出风险

固定 `width: 1200px` 放在 375px 视口中通常会导致内容溢出和横向滚动，而不是自动变成手机宽度。

## 三、相对单位

| 单位 | 主要参照 |
| --- | --- |
| `%` | 包含块或相关父尺寸 |
| `rem` | 根元素 `html` 的字体大小 |
| `em` | 通常是当前元素字体大小 |
| `vw` | 视口宽度的百分比 |
| `vh` | 视口高度的百分比 |

示例：

```text
父元素800px，width: 50% → 400px
根字号16px，2rem → 32px
按钮字号20px，1em → 20px
视口宽1000px，10vw → 100px
视口高800px，50vh → 400px
```

普通正文容器通常优先使用 `width: 100%`，而不是 `100vw`。部分环境中 `100vw` 可能包含滚动条宽度，再叠加 padding 或 margin 时更容易产生横向溢出。

## 四、clamp 流式尺寸

```css
.page-title {
    font-size: clamp(2rem, 5vw, 4rem);
}
```

语法：

```text
clamp(最小值, 理想值, 最大值)
```

根字号 16px 时：

```text
2rem = 32px
4rem = 64px

400px视口：5vw = 20px → 使用最小值32px
1000px视口：5vw = 50px → 使用理想值50px
1600px视口：5vw = 80px → 使用最大值64px
```

`clamp()` 也可以用于 padding、gap、width 和 margin，但应根据设计需要使用，不代表所有 px 都必须替换。

## 五、媒体查询

### 移动优先

```css
.responsive-layout {
    display: grid;
    grid-template-columns: 1fr;
}

@media (min-width: 768px) {
    .responsive-layout {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1200px) {
    .responsive-layout {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

```text
小于768px：1列
768px～1199px：2列
1200px及以上：4列
```

移动优先先写手机默认样式，再使用从小到大的 `min-width` 逐步增强。

在 1200px 时，`min-width: 768px` 和 `min-width: 1200px` 都匹配。如果选择器优先级相同且修改同一属性，后写的声明覆盖先写的声明。

### 桌面优先

桌面优先通常先写桌面默认样式，再使用从大到小排列的 `max-width` 逐步简化。

同一个组件不应无规律混用两种策略，否则容易出现规则重叠、覆盖顺序不清、样式空档和维护困难。

## 六、断点选择

断点不应完全按照某个设备型号选择，而应观察布局什么时候开始太挤、太空或错位。

例如两张 260px 卡片、间距 20px、页面左右 padding 各 16px：

```text
260 × 2 + 20 + 16 × 2 = 572px
```

这说明两列布局至少大约需要 572px。如果内容在 560px 已经错位，就应在真正需要的位置改变布局，不必坚持等到 768px。

375px、768px、1440px 是验收宽度，但仍应在它们之间缓慢拖动视口，检查中间宽度。

## 七、图片与媒体适配

```css
img,
video {
    display: block;
    max-width: 100%;
    height: auto;
}
```

- `max-width: 100%`：限制媒体不能超过容器，不强制小图片放大
- `height: auto`：按原比例计算高度，减少变形
- `width: 100%`：要求元素始终占满容器

### aspect-ratio 与 object-fit

```css
.card-image {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
}
```

- `aspect-ratio`：控制显示区域比例
- `cover`：保持比例并填满容器，可能裁剪内容
- `contain`：保持比例并完整显示，可能留下空白

卡片封面通常适合 `cover`；商品本体必须完整显示时通常适合 `contain`。

## 八、picture 响应式图片

```html
<picture>
    <source
        media="(max-width: 767px)"
        srcset="./images/banner-mobile.jpg"
    >

    <source
        media="(max-width: 1199px)"
        srcset="./images/banner-tablet.jpg"
    >

    <img
        src="./images/banner-desktop.jpg"
        alt="前端学习平台活动横幅"
    >
</picture>
```

- `media`：决定该 source 在什么条件下匹配
- `srcset`：保存候选图片地址
- `img`：默认和后备图片，不能删除
- `alt` 写在 `img` 上
- `picture` 适合为不同屏幕提供不同构图，而不只是改变显示宽度

## 九、移动优先后台页面

### 手机默认：375px

```css
.dashboard {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto;
    grid-template-areas:
        "header"
        "sidebar"
        "main"
        "footer";
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
    padding: clamp(16px, 4vw, 32px);
}

.dashboard-footer {
    grid-area: footer;
}

.sidebar-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.statistics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}
```

手机整体为单列；导航横向排列并允许换行；统计卡片为一列。

### 平板：768px

```css
@media (min-width: 768px) {
    .dashboard-main {
        padding: 24px;
    }

    .statistics-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
}
```

整体仍为单列，统计卡片增强为两列。移动优先只覆盖需要改变的属性，不必重新声明全部手机样式。

### 桌面：1200px以上

```css
@media (min-width: 1200px) {
    .dashboard {
        grid-template-columns: 240px 1fr;
        grid-template-rows: auto 1fr auto;
        grid-template-areas:
            "header  header"
            "sidebar main"
            "footer  footer";
    }

    .dashboard-sidebar {
        border-bottom: none;
        border-right: 1px solid var(--color-border);
    }

    .sidebar-nav {
        flex-direction: column;
        align-items: stretch;
    }

    .dashboard-main {
        padding: 32px;
    }

    .statistics-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

桌面整体为固定 240px 侧栏和自适应 main 两列；header 与 footer 横跨两列；导航纵向；统计卡片四列。

## 十、横向溢出与压力测试

不要使用：

```css
overflow-x: hidden;
```

假装解决横向滚动。它只会裁掉内容，可能让按钮或文字不可见。

优先排查：

1. 固定宽度是否大于视口
2. `width: 100%` 是否又叠加额外 padding 或 border
3. 是否存在不合理的 `min-width`
4. 连续英文、URL或数字是否不能换行
5. 图片、视频、表格是否超出容器
6. 绝对定位元素是否超出视口
7. 是否存在 `white-space: nowrap`

长内容防御：

```css
.stat-card,
.sidebar-nav a {
    min-width: 0;
    overflow-wrap: anywhere;
}
```

`overflow-wrap: anywhere` 允许连续英文、URL和数字在需要时断行，避免撑破容器。

## 十一、三端验收结果

| 视口宽度 | 整体布局 | 统计卡片 | 横向滚动 |
| --- | --- | --- | --- |
| 375px | 单列，导航横向换行 | 1列 | 无 |
| 768px | 仍为单列 | 2列 | 无 |
| 1440px | 240px侧栏 + 自适应main | 4列 | 无 |

测试结果：

- 图片不超出容器
- 长标题、连续数字、长导航均能换行
- 375px 下导航可正常点击
- 从 375px 缓慢拖动到 1440px 没有明显错位
- 不依赖隐藏横向溢出通过测试

## 十二、今日易错点

1. `width=device-width` 是让布局视口等于设备 CSS 宽度，不是 viewport 的定义。
2. 固定 1200px 页面在手机上会溢出，不会自动适配。
3. 百分比通常参考包含块，不是永远参考视口。
4. `max-width: 100%` 不会强制图片占满容器。
5. `cover` 可能裁剪；`contain` 可能留白。
6. 1200px 同时满足 768px 和 1200px 的 min-width 条件。
7. `align-items: stretch` 是交叉轴拉伸，不是居中。
8. 平板仍保持整体单列，只把统计卡片改为两列。
9. 不要用 `overflow-x: hidden` 掩盖真实错误。
10. 中文页面应使用 `<html lang="zh-CN">` 和有意义的 `<title>`。
11. `<style>` 应放在 `head` 中或外部 CSS 文件；`script` 应放在 `</body>` 前或外部 JS 文件。
12. 最终 CSS 中手机基础规则出现重复，应合并保留一份，减少维护成本。

## 十三、自测题

1. viewport 两个关键值分别有什么作用？
2. `%`、`rem`、`em`、`vw` 分别参考什么？
3. `clamp()` 的三个参数分别是什么？
4. 移动优先为什么通常使用 `min-width`？
5. 响应式断点应依据设备名称还是内容状态？
6. `width: 100%` 与 `max-width: 100%` 有什么区别？
7. `cover` 与 `contain` 如何处理图片？
8. 375px、768px、1440px 的布局分别是什么？
9. 出现横向滚动时应该怎样排查？
10. 为什么不能依赖 `overflow-x: hidden`？
