# 联合类型与类型收窄（学习计划第 26 天）

> 文件名按当前学习记录保存为 `day-24.md`；对应 12 周学习计划中的第 26 天。

## 今日学习目标

- 掌握联合类型、字面量类型和可选属性。
- 使用 `typeof`、`in`、`instanceof` 完成类型收窄。
- 使用判别联合描述加载、成功和失败状态。
- 在不使用 `any` 的情况下通过严格类型检查。
- 理解并实现二分查找。

---

## 一、联合类型

联合类型使用 `|` 表示一个值可以是多种类型中的一种：

```ts
function printValue(
    value: string | number | boolean
): string {
    if (typeof value === "string") {
        return value.toUpperCase();
    }

    if (typeof value === "number") {
        return value.toFixed(2);
    }

    return value ? "是" : "否";
}
```

在完成类型判断之前，只能使用联合类型所有成员都支持的操作。不能直接调用 `value.toUpperCase()`，因为 `number` 和 `boolean` 没有这个方法。

`toFixed()` 返回的是格式化后的字符串。例如：

```ts
(12).toFixed(2); // "12.00"，类型是 string
```

---

## 二、字面量类型与可选属性

字面量联合可以把属性限制为一组固定值：

```ts
type JobApplication = {
    company: string;
    status: "pending" | "interview" | "offer" | "rejected";
    note?: string;
};
```

- `status` 只能接收列出的四个字符串。
- `note?: string` 表示 `note` 是可选属性。
- 读取 `note` 时，其类型是 `string | undefined`。
- 使用 `note.toUpperCase()` 前，必须先排除 `undefined`。

```ts
function getApplicationNote(
    application: JobApplication
): string {
    if (application.note === undefined) {
        return "没有备注";
    }

    return application.note.toUpperCase();
}
```

所有执行路径都返回字符串，所以函数返回类型只需要写 `string`。

---

## 三、使用 typeof 收窄

```ts
function describeValue(
    value: string | number | null
): string {
    if (value === null) {
        return "空值";
    }

    if (typeof value === "string") {
        return value.toUpperCase();
    }

    return value.toFixed(1);
}
```

收窄过程：

```text
string | number | null
→ 排除 null
→ 剩余 string | number
→ 判断 string
→ 最后剩余 number
```

判断 `null` 时，优先直接使用 `value === null`。因为 JavaScript 中：

```ts
typeof null; // "object"
typeof [];   // "object"
```

所以仅使用 `typeof value === "object"` 不能准确证明它就是 `null`。

---

## 四、使用 in 收窄对象联合类型

```ts
type Teacher = {
    name: string;
    subject: string;
};

type Student = {
    name: string;
    grade: number;
};

function describePerson(
    person: Teacher | Student
): string {
    if ("subject" in person) {
        return person.name + "教授" + person.subject;
    }

    return person.name + "就读" + person.grade + "年级";
}
```

- 收窄前可以访问共同属性 `name`。
- 收窄前不能访问某个成员独有的 `subject` 或 `grade`。
- `"subject" in person` 判断的是属性是否存在。
- 条件成立时，`person` 被收窄为 `Teacher`；否则被收窄为 `Student`。

---

## 五、使用 instanceof 收窄类实例

```ts
function makeSound(animal: Dog | Cat): string {
    if (animal instanceof Dog) {
        return animal.bark();
    }

    return animal.meow();
}
```

`instanceof` 判断一个对象是否由某个类或构造函数创建。判断成功后，可以调用该类实例特有的方法。

类型别名不能写在 `instanceof` 右侧：

```ts
type Teacher = {
    name: string;
};
```

`Teacher` 只存在于 TypeScript 的类型检查阶段，编译后不存在；而 `instanceof` 右侧必须是运行时存在的类或构造函数。

---

## 六、判别联合与请求状态

```ts
type RequestState =
    | {
        status: "loading";
    }
    | {
        status: "success";
        data: string[];
    }
    | {
        status: "error";
        error: string;
    };
```

这里的 `status` 是判别字段。每个状态拥有固定结构：

- `loading`：不需要结果数据。
- `success`：必须包含 `data`。
- `error`：必须包含 `error`。

```ts
function renderState(state: RequestState): string {
    switch (state.status) {
        case "loading":
            return "正在加载";

        case "success":
            return "收到 " + state.data.length + " 条数据";

        case "error":
            return "请求失败：" + state.error;
    }
}
```

当 `state.status === "success"` 时，TypeScript 会排除其他状态，因此 `state.data` 是确定的 `string[]`，而不是 `string[] | undefined`。

判别联合不一定必须使用 `switch`；`if` 也可以完成收窄。

相比把所有属性都写成可选属性，判别联合可以防止以下不合理状态：

```ts
// 错误：success 状态缺少必填的 data
// const state: RequestState = { status: "success" };
```

---

## 七、二分查找

二分查找要求数组有序。比较目标值与中间值后，才能安全排除左半部分或右半部分。

```ts
function binarySearch(
    numbers: number[],
    target: number
): number {
    let left = 0;
    let right = numbers.length - 1;

    while (left <= right) {
        const middle = Math.floor((left + right) / 2);
        const middleValue = numbers[middle];

        if (middleValue === target) {
            return middle;
        }

        if (middleValue < target) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }

    return -1;
}
```

关键点：

- `right` 的初始值是 `numbers.length - 1`。
- 找到目标后返回索引 `middle`，不是目标值 `middleValue`。
- `left === right` 表示还剩一个候选元素，仍需检查。
- `left > right` 表示搜索区间为空。
- 没找到时返回 `-1`，因为 `0` 是合法数组索引。
- 每轮大约排除一半搜索范围，所以时间复杂度是 `O(log n)`。

例如搜索范围从 16 个元素缩小到 1 个元素大约需要 4 轮，从 32 个元素缩小到 1 个元素大约需要 5 轮。数据量翻倍时，查找次数通常只增加约一次。

---

## 八、常见类型收窄方式对比

| 方法 | 适用场景 | 示例 |
| --- | --- | --- |
| `typeof` | 基本类型 | `typeof value === "string"` |
| `in` | 判断对象是否存在某个属性 | `"subject" in person` |
| `instanceof` | 判断类的实例对象 | `animal instanceof Dog` |
| 判别字段 | 区分结构不同的对象状态 | `state.status === "success"` |
| 直接比较 | 排除 `null` 或 `undefined` | `value === null` |

---

## 九、今日验收结果

- 联合类型、字面量类型、可选属性：通过。
- `typeof`、`in`、`instanceof` 类型收窄：通过。
- 判别联合请求状态：通过。
- 二分查找：通过。
- `npx tsc --noEmit`：实际检查通过。
- 项目运行结果：实际验证通过。
- `any`：未使用。

### 需要继续巩固的两个细节

1. `left === right` 不是空区间，而是还剩一个候选元素。
2. 二分查找是 `O(log n)`，因为每轮将搜索范围大约缩小一半；数据量翻倍，查找轮数通常只增加约一次。

### 综合评价

今天的核心验收已经完成。能够根据不同数据结构选择 `typeof`、`in`、`instanceof` 或判别字段完成类型收窄，并且能够在严格模式下实现不使用 `any` 的请求状态类型。

