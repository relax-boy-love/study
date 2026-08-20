# 第18天：页面还原挑战复习笔记

## 一、今日任务与结果

参考真实的 GitHub Pricing 页面，仅根据截图完成顶部导航、介绍区域和三张定价卡片的还原。

完成内容：

- 未使用任何UI组件库。
- 使用语义化HTML和BEM命名组织页面。
- 完成桌面、平板和手机响应式布局。
- 完成移动端菜单交互、键盘操作和ARIA状态同步。
- 在375px、768px、1440px下均无横向滚动。
- 使用Lighthouse检查性能、无障碍、最佳实践和SEO。
- 重点突出Team推荐方案。

## 二、学习时间

| 学习内容 | 参考用时 |
| --- | ---: |
| 截图观察与结构拆解 | 约25分钟 |
| 语义化HTML | 约35分钟 |
| 桌面端整体布局 | 约60分钟 |
| 定价卡片细节 | 约45分钟 |
| 响应式适配 | 约40分钟 |
| 菜单交互与基础无障碍 | 约25分钟 |
| Lighthouse检查 | 约25分钟 |
| 截图对照与修正 | 约15分钟 |
| **合计** | **约4小时30分钟** |

## 三、截图还原流程

页面还原不能直接从细节CSS开始，正确顺序是：

```text
观察截图
→ 划分主要区域
→ 判断语义标签
→ 建立HTML骨架
→ 完成大布局
→ 调整组件细节
→ 完成响应式
→ 补充交互和无障碍
→ Lighthouse检查
→ 固定视口对照截图
```

本页从上到下划分为：

```text
site-header     顶部导航
pricing-hero    页面标题和介绍
pricing         定价方案区域
pricing__grid   三张定价卡片
```

## 四、语义化HTML结构

### 1. 页面标题层级

```text
h1：整个定价页面的主标题
└── h2：定价方案区域标题
    ├── h3：Free
    │   └── h4：包含功能
    ├── h3：Team
    │   └── h4：包含Free全部功能，以及
    └── h3：Enterprise
        └── h4：包含Team全部功能，以及
```

标题标签用于表达内容层级，不根据字号大小选择。

### 2. 定价卡片结构

```html
<article class="pricing-card">
    <h3 class="pricing-card__title">Free</h3>

    <p class="pricing-card__description">
        适合个人和组织的基础功能
    </p>

    <p class="pricing-card__price">
        <span class="pricing-card__amount">$0</span>
        <span class="pricing-card__period">每月</span>
    </p>

    <a
        class="button button--outline pricing-card__button"
        href="/register"
    >
        免费开始
    </a>

    <h4 class="pricing-card__features-title">包含功能</h4>

    <ul class="pricing-card__features">
        <li class="pricing-card__feature">无限公共仓库</li>
        <li class="pricing-card__feature">无限私有仓库</li>
        <li class="pricing-card__feature">社区支持</li>
    </ul>
</article>
```

要点：

- 金额和时间单位分别使用 `span`，方便设置不同字号、颜色和间距。
- 跳转到其他页面的操作使用 `a`；执行当前页面行为才使用 `button`。
- 功能项目使用 `ul` 和 `li`，表达一组并列内容。
- 一个元素可以组合通用类、修饰类和组件位置类。

### 3. 方案递进关系

“包含前一个方案全部功能”是产品含义，不是HTML继承：

```text
Free：列出基础功能
Team：说明包含Free，然后只列出Team新增功能
Enterprise：说明包含Team，然后只列出Enterprise新增功能
```

## 五、BEM组件命名

```text
pricing-card              Block
pricing-card__title       Element
pricing-card__price       Element
pricing-card__feature     Element
pricing-card--featured    Modifier
```

Team同时使用基础类和修饰类：

```html
<article class="pricing-card pricing-card--featured">
```

`.pricing-card` 提供全部卡片共有样式，`.pricing-card--featured` 只提供推荐方案的差异样式。

## 六、桌面端布局

### 1. 顶部导航使用Flex

```css
.site-header {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
}

.site-header__actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-left: auto;
}
```

`margin-left: auto` 吸收操作区域左侧的剩余空间，将搜索、登录和注册推到最右侧。

```css
.site-header__logo {
    flex: 0 0 auto;
}
```

`flex: 0 0 auto` 表示不放大、不缩小，基础尺寸由元素自身内容决定。

### 2. 定价卡片使用Grid

```css
.pricing__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-lg);
    align-items: stretch;
    padding-top: 34px;
}
```

- `repeat(3, 1fr)` 创建三列并平均分配可用宽度。
- `align-items: stretch` 让同一行卡片保持等高。
- `padding-top` 给Team顶部的推荐标签预留空间。

### 3. 流式容器

```css
.pricing {
    width: min(
        calc(100% - 40px),
        var(--page-max-width)
    );

    margin-inline: auto;
}
```

`min()` 从可用宽度减40px和最大页面宽度中选择较小值，使窄屏留出边距、宽屏限制内容宽度。

## 七、卡片内部细节

```css
.pricing-card {
    position: relative;
    display: flex;
    flex-direction: column;
}

.pricing-card__price {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
}
```

- `flex-direction: column` 让卡片内容从上到下排列。
- `align-items: baseline` 让大号金额和小号时间单位按文字基线对齐。

功能列表使用伪元素添加对勾：

```css
.pricing-card__feature {
    position: relative;
    padding-left: 24px;
}

.pricing-card__feature::before {
    content: "✓";
    position: absolute;
    left: 0;
}
```

## 八、突出Team方案

```css
.pricing-card--featured {
    z-index: 1;
    border: 2px solid var(--color-featured);
    background-color: #f6faff;
    box-shadow: 0 16px 40px rgb(9 105 218 / 20%);
    transform: translateY(-8px);
}

.pricing-card__badge {
    position: absolute;
    top: -34px;
    left: -2px;
    right: -2px;
    height: 34px;
}
```

`.pricing-card` 设置 `position: relative` 后，绝对定位的推荐标签以卡片为定位参照。

推荐方案通过以下方式形成视觉层级：

- 蓝色粗边框
- “最受欢迎”标签
- 浅蓝背景
- 更明显的阴影
- 桌面端轻微上移
- 强调色按钮

手机单列可以取消上移：

```css
@media (max-width: 767px) {
    .pricing-card--featured {
        transform: none;
    }
}
```

## 九、响应式布局

本项目采用桌面优先的 `max-width` 媒体查询。

### 1440px桌面

```text
完整导航
三张卡片一行三列
Team重点突出
```

### 768px平板

```css
@media (max-width: 1023px) {
    .site-nav {
        display: none;
    }

    .menu-button {
        display: inline-flex;
    }

    .pricing__grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

### 375px手机

```css
@media (max-width: 767px) {
    .site-header__actions {
        display: none;
    }

    .menu-button {
        margin-left: auto;
    }

    .pricing__grid {
        grid-template-columns: 1fr;
    }

    .pricing-card__actions {
        grid-template-columns: 1fr;
    }
}
```

最终效果：

```text
1440px：整体桌面导航，定价卡片3列
768px：菜单按钮出现，定价卡片2列
375px：Logo和菜单按钮，定价卡片1列
```

三个宽度均无横向滚动，长内容可以正常换行。

## 十、移动端菜单交互

### 1. CSS状态类

```css
.site-nav {
    display: none;
}

.site-nav.site-nav--open {
    display: flex;
}
```

没有空格的复合选择器表示同一个元素必须同时具有两个类：

```html
<nav class="site-nav site-nav--open">
```

### 2. JavaScript状态切换

```js
const menuButton =
    document.querySelector("#menu-button");

const siteNav =
    document.querySelector("#site-nav");

function closeMenu() {
    siteNav.classList.remove(
        "site-nav--open"
    );

    menuButton.setAttribute(
        "aria-expanded",
        "false"
    );

    menuButton.setAttribute(
        "aria-label",
        "打开导航菜单"
    );
}

menuButton.addEventListener(
    "click",
    function () {
        const isOpen =
            siteNav.classList.toggle(
                "site-nav--open"
            );

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "关闭导航菜单"
                : "打开导航菜单"
        );
    }
);
```

注意：

```text
querySelector使用CSS选择器：".site-nav"
classList使用纯类名："site-nav--open"
```

### 3. setAttribute

```js
element.setAttribute("属性名", "属性值");
```

`aria-expanded` 描述菜单是否展开，不直接控制显示。真正控制显示的是 `site-nav--open` 类名。

### 4. 菜单定位

```css
.site-header {
    position: relative;
}

.site-nav.site-nav--open {
    position: absolute;
    top: 100%;
}
```

`top: 100%` 表示菜单顶部距离定位参照顶部一个完整的参照元素高度，因此菜单正好出现在header底部。

### 5. 菜单关闭方式

- 再次点击菜单按钮。
- 按 `Escape`。
- 点击任意导航链接。

## 十一、基础无障碍

```html
<button
    id="menu-button"
    type="button"
    aria-label="打开导航菜单"
    aria-controls="site-nav"
    aria-expanded="false"
>
    ☰
</button>
```

- `aria-label` 提供按钮说明。
- `aria-controls` 指出按钮控制的元素。
- `aria-expanded` 描述菜单展开状态。
- `label for` 与搜索框 `id` 建立关联。
- 页面只有一个 `h1`。
- 链接、搜索框和按钮均有明显的 `:focus-visible` 轮廓。
- 支持只使用键盘操作页面。

## 十二、Lighthouse结果

| 类别 | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 90 | 90 |

性能诊断中的渲染阻塞请求、网络依赖关系树和少量文档请求延迟，在Performance为100时无需过度优化。

SEO后续优化：

- 添加明确的 `meta description`。
- 将 `href="#"` 替换为真实地址、内部锚点或有效路径。
- 保持明确的页面标题和语言属性。

## 十三、代码整理注意事项

1. `<script>` 不能放在 `</html>` 后面，应放在 `</body>` 前或使用外部JS文件。
2. 学习问答注释不应作为第二个 `<script>` 放在完整HTML结束后。
3. CSS中重复的 `.pricing__grid` 规则应合并，避免维护时遗漏覆盖关系。
4. `setAttribute("aria-expanded", false)` 会被转换为字符串，但明确写 `"false"` 更容易阅读。
5. 当前代码中的推荐卡片只有边框与标签；若要获得最终验收时的背景、阴影和上移效果，应确认增强规则已保存到CSS文件。

## 十四、今日验收

- 主要布局、间距和字号接近参考页面。
- 定价卡片在桌面、平板和手机下行为正确。
- Team推荐方案能够被优先注意到。
- 菜单交互、悬停、键盘焦点和Escape关闭正常。
- 375px、768px、1440px无明显错位和横向滚动。
- Lighthouse性能、无障碍和最佳实践均为100。

**第18天最终评分：9.3/10，学习目标已完成。**

## 十五、口述复习

1. 截图还原应先拆区域和结构，再处理细节样式。
2. Flex适合导航等一维布局，Grid适合定价卡片等规则行列。
3. `repeat(3, 1fr)` 创建三列并平均分配空间。
4. `margin-left: auto` 可以把Flex项目推到主轴末端。
5. BEM修饰类必须配合基础组件类使用。
6. 移动菜单通过状态类控制视觉显示，通过ARIA属性描述无障碍状态。
7. `top: 100%` 可以让绝对定位菜单出现在header底部。
8. Lighthouse分数之外，还要阅读具体失败项目和诊断建议。
