# TypeScript 入门（学习计划第 25 天）

> 文件名按当前学习记录保存为 `day-23.md`；对应 12 周学习计划中的第 25 天。

## 今日学习目标

- 理解 TypeScript 与 JavaScript 的关系。
- 掌握类型注解和类型推导。
- 掌握基本类型、数组、元组和枚举。
- 理解 `strict`、`noImplicitAny` 和 `strictNullChecks`。
- 配置 `tsconfig.json` 并理解常用选项。
- 把一组 JavaScript 工具函数改写为 TypeScript。
- 在严格模式下完成类型检查、编译和运行验证。

---

## 今日学习安排

| 部分 | 内容 | 预计时间 |
| --- | --- | ---: |
| 一 | TypeScript、类型注解与类型推导 | 35 分钟 |
| 二 | 基本类型与数组 | 35 分钟 |
| 三 | 元组与枚举 | 35 分钟 |
| 四 | 严格模式与 `tsconfig.json` | 40 分钟 |
| 五 | JavaScript 工具函数迁移 TypeScript | 60 分钟 |
| 六 | 类型错误、编译和运行验证 | 35 分钟 |
| 七 | 综合验收、笔记和 Git | 20 分钟 |

**预计总学习时间：约 4 小时。实际学习时间待补充。**

---

## 一、TypeScript 与 JavaScript

TypeScript 是以 JavaScript 为基础的语言，主要增加静态类型系统和开发工具能力。

```text
编写 .ts 文件
→ TypeScript 在运行前检查类型
→ 编译生成 JavaScript
→ 浏览器或 Node.js 运行 JavaScript
```

TypeScript 不只检查变量，还可以检查：

- 函数参数；
- 函数返回值；
- 数组元素；
- 对象属性；
- 模块之间传递的数据。

类型注解主要存在于开发和编译阶段，编译生成 JavaScript 后通常不会保留。

---

## 二、类型注解与类型推导

### 1. 类型注解

类型注解是开发者主动写出类型：

```ts
const courseName: string = "TypeScript 入门";
let completed: boolean = false;
const scores: number[] = [80, 90, 95];
```

冒号后面的 `string`、`boolean`、`number[]` 都是类型注解。

### 2. 类型推导

TypeScript 能根据初始值自动判断类型：

```ts
let studyHours = 4;
```

推导结果：

```text
studyHours → number
```

因此，后续不能赋值为字符串：

```ts
// 类型错误：string 不能赋给 number
// studyHours = "四小时";
```

### 3. 小写基本类型

日常代码使用：

```ts
string
number
boolean
```

小写类型表示 JavaScript 基本值类型；大写的 `String`、`Number`、`Boolean` 表示包装对象类型，日常变量通常不使用。

---

## 三、数组

数组的两种常见类型写法：

```ts
const scores: number[] = [80, 90, 95];

const topics: Array<string> = [
    "类型注解",
    "类型推导",
    "严格模式"
];
```

两种写法含义相同：

```text
number[]      → number 元素组成的数组
Array<number> → number 元素组成的数组
```

数组操作也会检查元素类型：

```ts
scores.push(100);
topics.push("数组");

// TS2345：scores 只能接收 number
// scores.push("优秀");

// TS2345：topics 只能接收 string
// topics.push(25);
```

`TS2345` 表示传入函数的参数类型不符合参数要求。`push` 也是一次函数调用。

---

## 四、元组

元组是一种特殊数组，它同时限制：

1. 元素数量；
2. 每个位置的类型；
3. 类型排列顺序。

```ts
const position: [number, number] = [120, 30];

const employee: [string, number, boolean] = [
    "小红",
    25,
    true
];
```

位置关系：

```text
employee[0] → string
employee[1] → number
employee[2] → boolean
```

错误示例：

```ts
// 顺序错误
// const wrongOrder: [string, number] = [18, "小李"];

// 缺少第二项
// const missingValue: [string, number] = ["小王"];

// 多出第三项
// const extraValue: [string, number] = ["小张", 23, true];
```

需要区分：

```text
number[] → 任意长度的数字数组
[number] → 固定只有一个 number 位置的元组
```

---

## 五、枚举

枚举用于集中定义一组相关的命名常量，限制变量只能使用这组值，并减少魔法字符串和拼写错误。

### 1. 数字枚举

```ts
enum Direction {
    Up,
    Down,
    Left,
    Right
}
```

没有指定初始值时，默认从 `0` 开始递增：

```text
Direction.Up    → 0
Direction.Down  → 1
Direction.Left  → 2
Direction.Right → 3
```

### 2. 字符串枚举

```ts
enum UserRole {
    Student = "student",
    Teacher = "teacher",
    Admin = "admin"
}

let currentRole: UserRole = UserRole.Student;
currentRole = UserRole.Admin;

// 错误：普通字符串不是 UserRole 枚举成员
// currentRole = "teacher";
```

使用 `string` 会允许任意字符串；使用 `UserRole` 才能真正限制取值范围。

---

## 六、严格模式

`strict` 是一组严格类型检查的总开关：

```jsonc
{
  "compilerOptions": {
    "strict": true
  }
}
```

### 1. noImplicitAny

没有参数类型且无法从上下文推导时，会产生隐式 `any`：

```ts
// TS7006：参数 name 隐式具有 any 类型
// function greet(name) {
//     return "你好，" + name;
// }
```

修复：

```ts
function greet(name: string): string {
    return "你好，" + name;
}
```

`TS7006` 说明参数隐式成为 `any`。显式添加参数类型后，TypeScript 才能继续检查调用方和函数内部的数据。

### 2. strictNullChecks

`find` 可能找不到元素，因此返回类型包含 `undefined`：

```ts
const studentNames: string[] = [
    "小明",
    "小红"
];

const foundName = studentNames.find(function (name) {
    return name === "小刚";
});
```

此时：

```text
foundName → string | undefined
```

不能直接调用：

```ts
// TS18048：foundName 可能是 undefined
// console.log(foundName.toUpperCase());
```

正确处理：

```ts
if (foundName !== undefined) {
    console.log(foundName.toUpperCase());
} else {
    console.log("没有找到学生");
}
```

类型变化：

```text
if 判断前：string | undefined
→ 排除 undefined
→ if 分支内：string
```

这个过程叫类型收窄。关闭 `strictNullChecks` 只会让检查消失，不代表运行时不会出现 `undefined` 错误。

---

## 七、tsconfig.json

今日最终配置：

```jsonc
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "noEmitOnError": true,
    "sourceMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 常用配置作用

| 配置 | 作用 |
| --- | --- |
| `rootDir` | TypeScript 源文件目录 |
| `outDir` | 编译生成的 JavaScript 输出目录 |
| `target` | 指定输出的 JavaScript 语法版本 |
| `module` | 指定输出的模块格式 |
| `strict` | 开启一组严格类型检查 |
| `noEmitOnError` | 有类型错误时禁止生成 JavaScript |
| `sourceMap` | 生成源码映射文件，方便调试 |
| `include` | 指定参与检查和编译的文件 |
| `exclude` | 排除不需要处理的目录 |

### --noEmit 与 noEmitOnError

```text
npx tsc --noEmit
→ 无论是否有错误，都只检查而不生成 JavaScript

noEmitOnError: true
→ 没有错误时正常生成 JavaScript
→ 有错误时禁止生成 JavaScript
```

编译流程：

```powershell
npx tsc --noEmit
npx tsc
node dist\index.js
```

生成文件：

```text
dist/index.js
dist/index.js.map
```

---

## 八、JavaScript 工具函数迁移 TypeScript

### 1. 计算总价

```ts
function calculateTotal(prices: number[]): number {
    return prices.reduce(function (total, price) {
        return total + price;
    }, 0);
}
```

数据流：

```text
prices: number[]
→ price 被推导为 number
→ 初始值 0 使 total 为 number
→ 返回 number
```

### 2. 格式化姓名

```ts
function formatFullName(
    firstName: string,
    lastName: string
): string {
    return lastName + firstName;
}
```

### 3. 判断成年人

```ts
function isAdult(age: number): boolean {
    return age >= 18;
}
```

### 4. 数组元素翻倍

```ts
function doubleNumbers(numbers: number[]): number[] {
    return numbers.map(function (number) {
        return number * 2;
    });
}
```

数据流：

```text
numbers: number[]
→ map 回调参数被推导为 number
→ 每次返回 number
→ map 最终返回 number[]
```

实际输出：

```text
60
王明
true
[2, 4, 6]
```

---

## 九、综合练习

### 1. 课程状态

```ts
enum CourseStatus {
    Learning = "learning",
    Completed = "completed"
}
```

### 2. 创建课程摘要

```ts
function createCourseSummary(
    courseName: string,
    scores: number[],
    status: CourseStatus
): [string, number, CourseStatus] {
    const total = scores.reduce(function (sum, score) {
        return sum + score;
    }, 0);

    return [courseName, total, status];
}
```

参数与返回值：

```text
courseName → string
scores     → number[]
status     → CourseStatus
返回值     → [string, number, CourseStatus]
```

如果把 `status` 写成 `string`，函数会允许枚举之外的任意字符串，从而失去枚举的约束作用。

### 3. 查找主题

```ts
function findTopic(
    topics: string[],
    keyword: string
): string {
    const result = topics.find(function (topic) {
        return topic === keyword;
    });

    if (result === undefined) {
        return "未找到";
    }

    return result;
}
```

为什么返回值只需要写 `string`：

```text
result 是 undefined
→ 返回“未找到”，类型是 string

result 不是 undefined
→ result 被收窄为 string 并返回

所有执行路径
→ 都返回 string
```

实际输出：

```text
[ 'TypeScript', 270, 'learning' ]
未找到
```

---

## 十、项目结构与连接关系

```text
ts-intro/
├─ src/
│  └─ index.ts         TypeScript 源码
├─ dist/
│  ├─ index.js         编译后的 JavaScript
│  └─ index.js.map     源码映射
├─ package.json        项目信息与依赖
├─ package-lock.json   锁定依赖版本
└─ tsconfig.json       类型检查与编译配置
```

完整流程：

```text
src/index.ts
→ tsconfig.json 决定检查规则和编译方式
→ npx tsc --noEmit 只检查类型
→ npx tsc 检查并生成 dist/index.js
→ Node.js 运行 dist/index.js
```

开发依赖：

```json
{
  "devDependencies": {
    "typescript": "^7.0.2"
  }
}
```

本次环境：

```text
Node.js：v24.14.0
npm：10.5.0
TypeScript：7.0.2
```

---

## 十一、重点易错点

1. TypeScript 不只规范变量，还能检查参数、返回值、数组、对象和模块数据。
2. 类型注解由开发者明确写出；类型推导由 TypeScript 根据上下文判断。
3. 日常基本类型使用小写的 `string`、`number`、`boolean`。
4. `number[]` 与 `Array<number>` 等价，但 `[number]` 是固定长度元组。
5. 元组同时限制数量、每个位置的类型和排列顺序。
6. 使用枚举类型才能限制为枚举成员；写成 `string` 会允许任意字符串。
7. `strict` 是总开关，不是一条单独规则。
8. 函数声明中的参数无法根据调用自动推导，缺少注解可能产生隐式 `any`。
9. `find` 可能返回 `undefined`，使用结果前必须处理未找到的情况。
10. 关闭严格空值检查只会隐藏类型错误，不会消除运行时风险。
11. `--noEmit` 始终不生成文件；`noEmitOnError` 只在有错误时禁止生成。
12. 回调参数可以从外层数组类型继续推导，不必重复标注每个回调参数。

---

## 十二、今日验收

- [x] 能解释 TypeScript 与 JavaScript 的关系。
- [x] 能区分类型注解和类型推导。
- [x] 掌握 `string`、`number`、`boolean` 和数组类型。
- [x] 能区分普通数组与元组。
- [x] 能使用数字枚举和字符串枚举。
- [x] 能解释 `strict`、`noImplicitAny` 和 `strictNullChecks`。
- [x] 能读懂 `TS2345`、`TS7006` 和 `TS18048`。
- [x] 完成 `tsconfig.json` 配置。
- [x] 将四个 JavaScript 工具函数改写为 TypeScript。
- [x] 正确处理 `find` 返回的 `undefined`。
- [x] `npx tsc --noEmit` 在严格模式下无类型错误。
- [x] 编译后的 JavaScript 可以正常运行。
- [ ] 完成 Git 提交并同步到 GitHub。
- [ ] 完成额外的面试训练记录。

**学习结论：TypeScript 入门知识与代码验收通过；Git 提交和面试训练待完成。**

---

## 十三、今日评分

| 维度 | 得分 | 说明 |
| --- | ---: | --- |
| 概念理解 | 28 / 30 | 核心概念已掌握，枚举约束和函数返回路径经纠正后理解 |
| 代码实现 | 25 / 25 | 数组、元组、枚举、工具函数和综合练习均完成 |
| 调试与验证 | 20 / 20 | 能读取错误编号，并完成类型检查、编译和运行验证 |
| 独立表达 | 14 / 15 | 大部分回答准确，少量术语经过修正 |
| 笔记与提交 | 5 / 10 | 复习笔记已生成，Git 提交与推送待完成 |
| **总分** | **92 / 100** | **知识与代码通过，仓库同步后再补全提交项** |

明天需要复习：

1. `string` 与 `String` 的区别。
2. `string | undefined` 的判断和类型收窄。
3. `--noEmit` 与 `noEmitOnError` 的区别。

---

## 十四、参考资料

- [TypeScript：Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript：Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript：TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [TypeScript：Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
