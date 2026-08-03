# 第 7 天：DOM 与事件机制

## 今日学习目标

- 掌握 DOM 元素的查询、创建、修改和删除
- 理解父子节点关系和 `closest()`
- 理解事件捕获、目标和冒泡阶段
- 区分 `event.target` 与 `event.currentTarget`
- 区分阻止事件传播与阻止默认行为
- 掌握事件委托
- 使用原生 JavaScript 完成可新增、修改和删除的任务列表

---

## 一、DOM 是什么

浏览器会把 HTML 解析成由节点组成的 DOM 树，JavaScript 通过 DOM API 查询和修改页面。

```text
HTML代码
   ↓ 浏览器解析
DOM树
   ↓ JavaScript操作
页面内容发生变化
```

简化的 DOM 树：

```text
document
└── html
    └── body
        └── main.task-app
            ├── input.task-input
            ├── button.add-button
            └── ul.task-list
                └── li.task-item
                    ├── span.task-text
                    └── div.task-actions
```

---

## 二、查询 DOM 元素

### querySelector

返回第一个匹配 CSS 选择器的元素；找不到时返回 `null`。

```js
const app = document.querySelector("#app");
const title = document.querySelector(".title");
const firstTask = document.querySelector(".task-item");
```

### querySelectorAll

返回全部匹配元素组成的 `NodeList`，不是数组。

```js
const taskItems = document.querySelectorAll(".task-item");

console.log(taskItems.length);

taskItems.forEach(function (item) {
    console.log(item);
});
```

需要转换为数组时：

```js
const taskArray = [...taskItems];
```

### 两者区别

```text
querySelector    → 返回第一个匹配元素或null
querySelectorAll → 返回所有匹配元素的NodeList
```

---

## 三、元素属性与内容

### textContent

用于读取或设置元素的纯文本内容。

```js
console.log(taskText.textContent);

taskText.textContent = "完成DOM练习";
```

在任务列表中使用 `textContent` 而不是 `innerHTML`，可以避免把用户输入当作 HTML 解析。

### dataset

HTML 自定义属性：

```html
<li data-id="3" data-task-name="学习DOM"></li>
```

JavaScript 读写：

```js
taskItem.dataset.id;
taskItem.dataset.taskName;

taskItem.dataset.id = "10";
```

命名转换：

```text
data-id        → dataset.id
data-user-id   → dataset.userId
data-task-name → dataset.taskName
```

`dataset` 中的值通常作为字符串使用。

### classList

```js
taskItem.classList.add("completed");
taskItem.classList.remove("completed");
taskItem.classList.toggle("completed");
```

```text
add    → 只添加，已存在时保持不变
remove → 删除类名
toggle → 有就删除，没有就添加
```

---

## 四、节点关系

```js
taskItem.parentElement;
taskItem.children;
taskItem.firstElementChild;
taskItem.lastElementChild;
deleteButton.closest(".task-item");
```

```text
parentElement     → 父元素
children          → 所有直接子元素
firstElementChild → 第一个子元素
lastElementChild  → 最后一个子元素
closest(selector) → 从自身开始，向父级查找最近的匹配元素
```

`closest()` 会先检查元素自身，自身不匹配时才继续向上。

---

## 五、创建、插入和删除元素

### createElement

创建 DOM 元素，但刚创建时它还没有进入页面。

```js
const taskItem = document.createElement("li");
const taskText = document.createElement("span");
const deleteButton = document.createElement("button");
```

### append

把一个或多个节点放入元素末尾。

```js
taskActions.append(editButton, deleteButton);
taskItem.append(taskText, taskActions);
taskList.append(taskItem);
```

推荐先在内存中组装完整结构，最后再插入页面：

```text
创建按钮
   ↓
放入taskActions
   ↓
把taskText和taskActions放入taskItem
   ↓
把taskItem放入taskList
```

### remove

删除调用它的元素自身，它内部的子节点也会一起被删除。

```js
taskItem.remove();
```

---

## 六、DOM 事件传播

一个 DOM 事件通常经历三个阶段：

```text
1. 捕获阶段：document → body → ul → li → button
2. 目标阶段：到达真正点击的button
3. 冒泡阶段：button → li → ul → body → document
```

### 捕获阶段监听

```js
list.addEventListener(
    "click",
    function () {
        console.log("ul捕获");
    },
    true
);
```

第三个参数为 `true` 时，处理函数在捕获阶段执行。默认为 `false`，在冒泡阶段执行。

点击按钮时的顺序示例：

```text
ul捕获
li捕获
button
li冒泡
ul冒泡
```

### 什么是事件冒泡

事件从真正触发的目标元素开始，逐层向父元素传播，并执行父元素上对应类型的事件处理函数。

---

## 七、target 与 currentTarget

```js
taskList.addEventListener("click", function (event) {
    console.log(event.target);
    console.log(event.currentTarget);
});
```

```text
event.target
→ 真正被点击的最深层元素

event.currentTarget
→ 当前正在执行事件处理函数的绑定元素
```

在 `taskList` 的事件中点击删除按钮：

```text
event.target        → 删除按钮，或按钮内被点击的span图标
event.currentTarget → taskList这个ul
```

---

## 八、阻止传播与阻止默认行为

### stopPropagation

阻止事件继续向上或向下传播，不会自动阻止默认行为。

```js
button.addEventListener("click", function (event) {
    console.log("button事件依然执行");
    event.stopPropagation();
});
```

### preventDefault

阻止浏览器默认行为，例如链接跳转或表单提交刷新。

```js
helpLink.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("已阻止链接跳转");
});
```

```text
stopPropagation → 阻止事件传播
preventDefault  → 阻止默认行为
```

---

## 九、事件委托

### 定义

事件委托是把子元素需要处理的事件绑定在它们的共同父元素上，利用事件冒泡确定真正点击的子元素。

```js
taskList.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(".delete-button");

    if (deleteButton === null) {
        return;
    }

    const taskItem = deleteButton.closest(".task-item");
    taskItem.remove();
});
```

### 为什么使用 closest

按钮内可能包含 `span` 或图标：

```html
<button class="delete-button">
    <span>删除</span>
</button>
```

如果点击 `span`，`event.target` 是 `span`。使用：

```js
event.target.closest(".delete-button");
```

仍然能找到对应按钮。如果只判断 `event.target.className`，就可能失败。

### 事件委托的优点

- 父元素只绑定一次事件
- 不需要给每个按钮分别绑定
- 后来动态新增的任务也能自动处理修改和删除

```text
addButton → 绑定1次添加事件
taskList  → 绑定1次修改/删除事件
editButton和deleteButton → 不单独绑定
```

---

## 十、任务列表项目思路

### 新增任务

```text
读取taskInput.value
   ↓
trim()删除两端空格
   ↓
空内容直接return
   ↓
创建li、span、修改按钮、删除按钮
   ↓
把节点组装成完整taskItem
   ↓
插入taskList
   ↓
清空输入框，id加1
```

### 修改任务

```js
const editButton = event.target.closest(".edit-button");

if (editButton !== null) {
    const taskItem = editButton.closest(".task-item");
    const taskText = taskItem.querySelector(".task-text");

    const newContent = prompt(
        "请输入新任务内容",
        taskText.textContent
    );

    if (newContent === null) {
        return;
    }

    const trimmedContent = newContent.trim();

    if (trimmedContent !== "") {
        taskText.textContent = trimmedContent;
    }

    return;
}
```

`prompt()` 返回的是字符串或 `null`，不是 DOM 输入框，所以应该写：

```js
newContent.trim();
```

不能写：

```js
newContent.value.trim();
```

### 删除任务

```text
判断是否点击delete-button
   ↓
找到它所属的task-item
   ↓
调用remove()
   ↓
更新空列表提示
```

### 空列表提示

```js
function updateEmptyMessage() {
    const taskCount = taskList.children.length;

    if (taskCount === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}
```

`taskList.children.length` 返回 `taskList` 的直接子元素数量，不是布尔值。

调用时机：

```text
页面初始化 → 调用1次
添加任务后 → 重新调用
删除任务后 → 重新调用
修改任务后 → 数量没变，不用调用
```

### Enter 添加任务

```js
taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addButton.click();
    }
});
```

使用 `addButton.click()` 复用已有的添加逻辑，避免重复编写创建 DOM 的代码。

---

## 十一、今日易错点

### 1. querySelector 找不到时是 null

```js
document.querySelector(".not-exist"); // null
```

### 2. querySelectorAll 返回 NodeList

`NodeList` 可以使用 `length` 和 `forEach()`，但不是数组。

### 3. dataset 使用小驼峰命名

```text
data-user-id → dataset.userId
```

不是 `dataset.userid` 或 `dataset.Id`。

### 4. target 与 currentTarget

```text
target        → 真正点击的元素
currentTarget → 当前事件绑定元素
```

### 5. stopPropagation 不能阻止默认行为

需要阻止链接跳转时应使用 `preventDefault()`。

### 6. 修改分支不能放在删除的提前 return 后面

错误执行路线：

```text
点击修改
→ 找不到delete-button
→ 立即return
→ 修改逻辑永远无法执行
```

应先处理修改分支，修改完成后 `return`，再处理删除分支。

### 7. 事件委托内不要重复绑定按钮事件

不要在 `taskList` 的事件中再写：

```js
editButton.addEventListener("click", function () {});
```

否则会出现延迟处理和重复绑定。事件委托的分支里应该直接执行修改或删除逻辑。

### 8. 新增任务要与原有任务保持相同 DOM 结构

```text
task-item
├── task-text
└── task-actions
    ├── edit-button
    └── delete-button
```

如果漏掉 `task-actions`，功能元素可能仍然存在，但新旧任务的布局会不一致。

### 9. Enter 判断使用 event.key

```js
event.key === "Enter";
```

当前练习不要写成 `event.code === "Enter"`。

---

## 十二、验收口述

### querySelector 和 querySelectorAll

`querySelector` 返回第一个匹配元素，找不到返回 `null`；`querySelectorAll` 返回所有匹配元素组成的 `NodeList`。

### 事件委托

将子元素事件统一绑定在共同父元素上，利用冒泡和 `event.target` 判断实际点击的元素。

### 为什么新增任务无需重新绑定

因为事件一直绑定在已经存在的 `taskList` 上。新任务中的按钮被点击后，事件同样会冒泡到 `taskList`，由父元素的处理函数统一处理。

---

## 十三、复习自测

1. `querySelector()` 找不到元素时返回什么？
2. `querySelectorAll()` 返回数组吗？
3. `data-task-id` 如何通过 `dataset` 读取？
4. `classList.add()` 和 `classList.toggle()` 有什么区别？
5. `createElement()`、`append()` 和 `remove()` 分别做什么？
6. `closest()` 从哪里开始查找？
7. 事件捕获和事件冒泡的方向是什么？
8. `event.target` 和 `event.currentTarget` 有什么区别？
9. `stopPropagation()` 和 `preventDefault()` 有什么区别？
10. 什么是事件委托？
11. 为什么动态新增的任务无需重新绑定事件？
12. `prompt()` 点击取消时返回什么？
13. `taskList.children.length` 表示什么？
14. 为什么 Enter 添加任务可以调用 `addButton.click()`？

---

## 十四、今日背诵版

```text
1. querySelector返回第一个匹配元素，找不到返回null。
2. querySelectorAll返回NodeList，不是数组。
3. createElement创建节点，append插入节点，remove删除调用元素。
4. target是真正点击的元素，currentTarget是当前绑定事件的元素。
5. 捕获从外向内，冒泡从目标向外。
6. stopPropagation阻止传播，preventDefault阻止默认行为。
7. 事件委托是把子元素事件绑定在共同父元素上，利用冒泡统一处理。
8. 动态新增元素也会冒泡到父元素，所以无需重新绑定。
```
