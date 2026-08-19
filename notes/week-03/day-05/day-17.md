# 第17天：CSS工程化与动画复习笔记

## 一、今日学习目标与用时

| 学习内容 | 参考用时 |
| --- | ---: |
| CSS变量 | 35分钟 |
| BEM命名思想 | 40分钟 |
| CSS样式拆分 | 25分钟 |
| `transition`过渡 | 35分钟 |
| `@keyframes`关键帧动画 | 35分钟 |
| 减少动画偏好 | 20分钟 |
| 按钮、弹窗、骨架屏、消息提示组件 | 40分钟 |
| 功能测试与口述验收 | 10分钟 |
| 修改、调试与复习 | 约20分钟 |
| **合计** | **约4小时20分钟** |

## 二、CSS变量

CSS变量用于集中管理重复的设计值，避免修改主题颜色、间距、圆角或动画时间时到处查找和修改。

```css
:root {
    --color-primary: #2563eb;
    --color-danger: #dc2626;
    --color-surface: #ffffff;
    --color-border: #d1d5db;

    --space-small: 8px;
    --space-medium: 16px;
    --space-large: 24px;

    --radius-small: 6px;
    --radius-large: 12px;
    --duration-fast: 200ms;
}

.button--primary {
    background-color: var(--color-primary);
}
```

要点：

- 自定义属性名必须以 `--` 开头。
- `var(--color-primary)` 用于读取变量。
- 变量放在 `:root` 中后，页面中的大多数元素都能继承和使用。
- `var(--unknown-color, black)` 中的 `black` 是变量不存在时的备用值。
- 变量保存的是CSS属性值，例如颜色、长度、阴影、字体和动画时间，不是完整的属性声明。
- 变量名称要符合用途：颜色变量不能误用在圆角或长度位置。

## 三、BEM命名思想

BEM将类名分为三类：

```text
Block：独立组件
Element：组件内部元素，使用两个下划线
Modifier：组件的版本或状态，使用两个短横线
```

```html
<article class="product-card">
    <h2 class="product-card__title">无线耳机</h2>
    <button class="button button--primary">加入购物车</button>
</article>
```

对应关系：

```text
product-card          Block
product-card__title   Element
button                独立Block
button--primary       Modifier
```

修饰类通常与基础类同时使用：

```html
<button class="button button--danger">删除</button>
```

`.button` 提供公共样式，`.button--danger` 只提供危险版本的差异样式。

BEM可以减少 `.title`、`.content`、`.active` 等普通类名引起的冲突，但不能彻底隔离CSS。标签选择器、`!important`、过深选择器和层叠顺序仍可能造成污染。

## 四、CSS文件拆分

推荐按照职责拆分：

```text
css/
├── variables.css
├── base.css
├── layout.css
├── components/
│   ├── button.css
│   ├── modal.css
│   ├── skeleton.css
│   └── message.css
└── main.css
```

职责：

- `variables.css`：颜色、间距、圆角、动画时间等变量。
- `base.css`：`box-sizing`、`body`、图片等基础规则。
- `layout.css`：页面整体宽度和主要布局。
- 组件文件：只管理对应组件。
- `main.css`：统一引入其他样式文件，HTML只需引入入口文件。

重要结论：

```text
文件拆分 ≠ 样式隔离
```

即使CSS位于不同文件，它们仍共同作用于同一页面，并遵循同一套层叠和优先级规则。

## 五、transition过渡

`transition` 用于在两个CSS状态之间平滑变化，通常写在基础状态中，使进入和退出都能播放。

```css
.button {
    transition:
        background-color 200ms ease,
        transform 200ms ease,
        box-shadow 200ms ease;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgb(0 0 0 / 18%);
}

.button:active {
    transform: translateY(0);
}
```

要点：

- `background-color 200ms ease` 分别是属性、持续时间和速度曲线。
- 多个过渡属性用逗号分隔。
- 不推荐随意使用 `transition: all`，否则可能产生意外动画和额外维护成本。
- `:hover` 定义鼠标移入后的状态，`transition` 控制状态变化的过程。
- `:active` 表示元素正在被按下。
- `:focus-visible` 主要为键盘等操作显示清晰的焦点提示。
- 动画通常优先改变 `transform` 和 `opacity`，因为它们通常不会改变普通文档流中的布局尺寸。

## 六、关键帧动画

`@keyframes` 定义动画各个进度的状态，`animation` 通过名字使用动画。

```css
@keyframes skeleton-pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.45;
    }

    100% {
        opacity: 1;
    }
}

.skeleton {
    animation:
        skeleton-pulse
        1.2s
        ease-in-out
        infinite;
}
```

注意：

- `opacity: 0` 表示完全透明，`opacity: 1` 表示完全不透明。
- `50%` 表示一次动画播放到一半时的状态，不固定代表“第二阶段”。
- `1.2s` 是一次动画的总时长。
- `ease-in-out` 是速度曲线。
- `infinite` 表示无限重复。

### transition与animation

```text
transition：需要CSS状态发生变化，适合hover、展开和关闭。
animation：可以自动播放、重复播放，并能定义多个关键阶段。
```

## 七、减少动画偏好

部分用户会因为明显的移动、缩放或闪烁感到不适，可以根据系统偏好减少动画：

```css
@media (prefers-reduced-motion: reduce) {
    .button {
        transition: none;
    }

    .skeleton,
    .modal-overlay,
    .modal,
    .message {
        animation: none;
    }

    .skeleton {
        opacity: 0.65;
    }
}
```

要点：

- 这是根据用户系统偏好判断，不是根据屏幕宽度判断。
- `transition: none` 只关闭过渡过程，属性仍然会改变。
- `animation: none` 停止动画，不等于删除元素。
- 减少动画属于无障碍体验。
- 可在浏览器开发者工具中模拟 `prefers-reduced-motion: reduce` 进行测试。

## 八、组件实现

### 1. 按钮组件

```html
<button class="button button--primary">保存</button>
<button class="button button--danger">删除</button>
```

基础类负责尺寸、圆角、交互和过渡；修饰类负责不同版本的颜色。

### 2. 骨架屏组件

```html
<section class="skeleton-card" aria-label="内容正在加载">
    <div class="skeleton skeleton--avatar"></div>

    <div class="skeleton-card__content">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-short"></div>
    </div>
</section>
```

骨架屏不依赖用户操作，需要循环明暗变化，所以适合使用 `animation`。

### 3. 弹窗组件

```css
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay[hidden] {
    display: none;
}

.modal {
    position: relative;
}

.modal__close {
    position: absolute;
    top: 12px;
    right: 12px;
}
```

- `fixed` 和 `inset: 0` 让遮罩覆盖整个视口，不随页面滚动离开。
- `.modal` 使用 `position: relative`，为关闭按钮提供定位参照。
- `[hidden]` 时明确使用 `display: none`。
- 点击遮罩时检查 `event.target === modalOverlay`，避免点击弹窗内部也触发关闭。
- 支持关闭按钮、取消按钮、点击遮罩和 `Escape` 四种关闭方式。

进入动画：

```css
@keyframes modal-enter {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### 4. 消息提示组件

```html
<div
    class="message-region"
    aria-live="polite"
    aria-atomic="true"
></div>
```

```css
.message {
    animation: message-enter 300ms ease-out;
}

.message--success {
    border-left: 5px solid #16a34a;
}

@keyframes message-enter {
    from {
        opacity: 0;
        transform: translateX(20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}
```

- `.message` 提供公共样式，`.message--success` 提供成功状态差异。
- `translateX(20px)` 表示元素开始位于原位置右侧。
- `aria-live="polite"` 让辅助技术在合适时机读出动态消息。
- 普通文字使用 `textContent`，避免把不可信字符串解析为HTML。
- 消息可以点击关闭，也会在3秒后自动删除。
- 多次调用 `showMessage` 可以在消息区域中纵向排列多条消息。

## 九、减少组件样式污染的方法

- 使用BEM明确组件归属。
- 避免 `.title`、`.content` 等过于普通的类名。
- 避免范围过大的标签选择器。
- 将通用基础类与修饰类分开。
- 每个组件只控制自己的样式。
- 按职责拆分CSS文件。
- 使用语义明确的CSS变量。
- 减少 `!important` 和过深选择器。
- 通过 `.modal__actions` 排列弹窗按钮，不直接覆盖页面中全部 `.button`。

## 十、代码结构注意事项

正确的单文件HTML结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS工程化与动画练习</title>
    <style>
        /* CSS */
    </style>
</head>
<body>
    <!-- HTML -->

    <script>
        // JavaScript
    </script>
</body>
</html>
```

不要把 `<style>` 或 `<script>` 放在 `</html>` 之后。实际项目中应进一步拆成外部CSS和JavaScript文件。

## 十一、今日验收结果

已完成并测试：

- 主按钮和危险按钮具有不同样式。
- 按钮悬停、按下和键盘焦点状态正常。
- 骨架屏循环动画正常。
- 弹窗可以打开，并支持四种关闭方式。
- 点击弹窗内部不会意外关闭。
- 确认操作后显示成功消息。
- 消息支持手动关闭、3秒自动删除和多条排列。
- 开启减少动画偏好后，动画停止但功能仍可正常使用。
- 组件之间没有发现明显的样式污染。

**第17天最终评分：9.2/10，学习目标已完成。**

## 十二、口述复习

1. CSS变量主要用于统一管理重复的设计值。
2. BEM分别表示块、元素和修饰符。
3. CSS文件拆分只改善组织，不会自动隔离选择器。
4. `transition` 依赖状态变化；`animation` 可以自动、重复和分阶段播放。
5. `transform` 和 `opacity` 通常更适合动画，因为它们通常不改变布局尺寸。
6. `prefers-reduced-motion` 用于照顾希望减少动态效果的用户。
7. BEM、组件边界、明确选择器和合理文件拆分可以共同减少样式污染。
