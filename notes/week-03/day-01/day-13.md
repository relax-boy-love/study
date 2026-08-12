# 第 13 天：语义化 HTML、表单与基础无障碍

## 今日学习目标

- 理解语义化 HTML 和标题层级
- 掌握表单常用标签与属性
- 理解 `label`、`id`、`name` 和 `value`
- 掌握键盘操作与基础无障碍
- 使用 HTML 原生属性完成基础表单校验
- 使用 JavaScript 完成密码一致性和技能至少选择一项的校验

## 一、语义化 HTML

语义化 HTML 是根据内容的用途，选择具有明确含义的标签，而不是所有区域都使用 `div`。

常用语义化标签：

| 标签 | 作用 |
| --- | --- |
| `header` | 页面或某个区域的头部 |
| `nav` | 主要导航区域 |
| `main` | 页面的主要内容 |
| `section` | 有明确主题的内容区域 |
| `article` | 可以独立阅读或传播的内容 |
| `footer` | 页面或某个区域的尾部信息 |

语义化的好处：

- 代码结构更容易理解和维护
- 有利于搜索引擎理解页面
- 有利于屏幕阅读器等辅助技术理解内容
- 不能为了替换 `div` 而滥用语义标签，应根据内容用途选择

### 标题层级

```text
h1：页面主要标题
├── h2：主要章节
│   └── h3：章节中的子内容
└── h2：另一个主要章节
```

标题标签应表达内容层级，不能只因为字号合适而选择。

## 二、表单基本结构

```html
<form action="/register" method="post">
    <!-- 表单控件 -->
</form>
```

- `action`：表单提交地址
- `method="get"`：数据通常出现在 URL 中，适合搜索
- `method="post"`：数据放在请求体中，适合注册和登录
- `POST` 不等于加密，传输敏感信息仍需要 HTTPS

### 常用表单控件

| 需求 | 控件 |
| --- | --- |
| 用户名 | `input type="text"` |
| 邮箱 | `input type="email"` |
| 密码 | `input type="password"` |
| 单选 | `input type="radio"` |
| 多选 | `input type="checkbox"` |
| 多行文字 | `textarea` |
| 提交 | `button type="submit"` |
| 重置 | `button type="reset"` |
| 普通按钮 | `button type="button"` |

## 三、name、value 与 id

- `name`：提交数据时的字段名；相同 `name` 也可以把多个 `radio` 划分为一组
- `value`：控件被提交给服务器的值
- `id`：页面中元素的唯一标识，也可以与 `label for` 建立关联

```html
<input
    id="frontend"
    type="radio"
    name="direction"
    value="frontend"
>
```

提交的数据类似：

```text
direction=frontend
```

没有 `name` 的输入控件，通常不会包含在原生表单提交数据中。

## 四、fieldset 与 legend

`fieldset` 把有关联的表单控件分成一组，`legend` 是这一组的标题。

```html
<fieldset>
    <legend>请选择求职方向</legend>
    <!-- 单选框 -->
</fieldset>
```

它们不只是为了显示边框，也能表达控件之间的关系，对辅助技术更友好。

## 五、label 与基础无障碍

```html
<label for="username">用户名</label>
<input id="username" name="username" type="text">
```

关联规则：

```text
label 的 for 值 === 对应控件的 id 值
```

正确关联后，点击文字会让对应输入框获得焦点。每个 `id` 在页面中必须唯一。

### 键盘操作

- `Tab`：进入下一个可操作元素
- `Shift + Tab`：返回上一个可操作元素
- 方向键：切换同组单选框
- 空格：切换复选框或触发获得焦点的按钮
- `Enter`：通常用于提交表单或触发按钮

原生 `input`、`textarea`、`select` 和 `button` 默认具有键盘能力，应优先使用原生控件，不要用 `div` 模拟按钮。

### tabindex

- `tabindex="0"`：进入正常 Tab 顺序
- `tabindex="-1"`：不能通过 Tab 到达，但可由 JavaScript 调用 `.focus()`
- 通常不要使用 `tabindex="1"`、`2` 等正数，否则容易打乱阅读和焦点顺序

如果 Tab 顺序不合理，应优先调整 HTML 元素顺序。

### 焦点样式

```css
input:focus-visible,
textarea:focus-visible,
button:focus-visible {
    outline: 3px solid #f59e0b;
    outline-offset: 2px;
}
```

不能随意写 `outline: none`。如果删除轮廓却没有提供替代样式，键盘用户将无法判断当前焦点位置。

## 六、HTML 原生校验

| 属性 | 作用 |
| --- | --- |
| `required` | 必须填写或选择 |
| `minlength` | 最少字符数 |
| `maxlength` | 最多字符数 |
| `type="email"` | 检查基本邮箱格式 |
| `pattern` | 使用正则表达式限制格式 |
| `min`、`max` | 限制数字或日期范围 |

项目规则：

```html
<input
    id="username"
    type="text"
    name="username"
    required
    minlength="3"
    maxlength="20"
>

<input
    id="email"
    type="email"
    name="email"
    required
>

<input
    id="password"
    type="password"
    name="password"
    required
    minlength="8"
    maxlength="20"
>
```

前端校验用于尽早提醒用户、改善体验，不能替代服务器校验。用户可以修改 HTML 或绕过页面直接发送请求，因此服务器必须再次校验。

## 七、radio 与 checkbox 的校验区别

### radio

相同 `name` 的单选框属于同一组。只要给组内一个单选框添加 `required`，浏览器就会要求整组至少选择一个。

### checkbox

复选框上的 `required` 只要求添加该属性的那个复选框必须选中，不能表达“多个选项中任选一个”。因此“技能至少选择一项”需要 JavaScript 判断。

## 八、自定义校验

### setCustomValidity

```js
input.setCustomValidity("错误信息");
```

非空错误信息会让控件处于无效状态，并阻止表单提交。

```js
input.setCustomValidity("");
```

传入空字符串表示清除旧错误。自定义错误不会自动消失，校验通过后必须清除。

### 密码一致性校验

```js
const registerForm = document.querySelector("#registerForm");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector(
    "#confirmPassword"
);

registerForm.addEventListener("submit", function (event) {
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity(
            "两次输入的密码不一致"
        );
        confirmPasswordInput.reportValidity();
        event.preventDefault();
        return;
    }

    confirmPasswordInput.setCustomValidity("");
});

confirmPasswordInput.addEventListener("input", function () {
    confirmPasswordInput.setCustomValidity("");
});
```

### 技能至少选择一项

```js
const skillInputs = document.querySelectorAll(
    'input[name="skills"]'
);

registerForm.addEventListener("submit", function (event) {
    const skills = Array.from(skillInputs);

    const hasSelectedSkill = skills.some(function (skill) {
        return skill.checked;
    });

    if (hasSelectedSkill === false) {
        skillInputs[0].setCustomValidity(
            "请至少选择一项技能"
        );
        skillInputs[0].reportValidity();
        event.preventDefault();
        return;
    }

    skillInputs[0].setCustomValidity("");
});

skillInputs.forEach(function (skill) {
    skill.addEventListener("change", function () {
        skillInputs[0].setCustomValidity("");
    });
});
```

`skill.checked` 返回布尔值。`.some()` 在数组中至少有一个元素符合条件时返回 `true`。

## 九、页面布局与样式重点

```css
body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.page-main {
    flex: 1;
    display: flex;
    justify-content: center;
}

form,
.form-field {
    display: flex;
    flex-direction: column;
}

.form-field input,
.form-field textarea {
    width: 100%;
}

.option-item,
.form-actions {
    display: flex;
}
```

- `min-height: 100vh`：页面最小高度等于浏览器可视区域
- `body` 使用纵向 Flex 布局排列头部、主体和底部
- `.page-main { flex: 1; }`：主体占据剩余空间
- 输入框使用 `width: 100%` 保持宽度一致
- `textarea { resize: vertical; }`：只允许纵向调整大小

## 十、项目中的易错点

1. 中文页面应该使用：

```html
<html lang="zh-CN">
```

不能继续使用 `lang="en"`，否则可能影响屏幕阅读器发音和搜索引擎理解。

2. `<script>` 应放在 `</body>` 之前：

```html
    <script>
        // JavaScript
    </script>
</body>
</html>
```

3. 每个控件都应有唯一 `id`，且 `label for` 必须与其对应。

4. 同组 `radio` 的 `name` 相同，但 `id` 必须不同。

5. 密码最少长度是 8，不要误写成 3。

6. 如果使用多个 `submit` 监听器，逻辑容易分散。实际项目可以把密码和技能校验集中到同一个提交处理函数中。

7. 重置表单后，如有自定义错误，最好同时清除：

```js
registerForm.addEventListener("reset", function () {
    confirmPasswordInput.setCustomValidity("");
    skillInputs[0].setCustomValidity("");
});
```

## 十一、验收结果

- 空表单会被原生校验阻止
- 用户名长度校验正常
- 邮箱格式校验正常
- 密码长度校验正常
- 两次密码不一致时显示自定义错误
- 求职方向必须选择
- 技能至少选择一项
- 只选择 CSS 或 JavaScript 可以通过技能校验
- 可以使用键盘完成所有操作
- 焦点具有明显橙色轮廓
- 所有输入控件都有明确标签

## 十二、口述复习

1. 语义化 HTML 是根据内容用途选择有明确含义的标签。
2. `label for` 必须等于对应控件的 `id`。
3. `name` 是提交字段名，`value` 是提交值，`id` 是页面唯一标识。
4. `radio` 用于单选，`checkbox` 用于多选。
5. `fieldset` 用于表单分组，`legend` 是分组标题。
6. 焦点轮廓帮助键盘用户确认当前操作位置。
7. `setCustomValidity("错误")` 设置自定义错误，`setCustomValidity("")` 清除错误。
8. HTML 原生校验用于改善体验，服务器校验负责保证数据安全和正确。
