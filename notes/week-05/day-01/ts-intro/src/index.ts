const courseName: string = "TypeScript 入门";

let studyHours = 4;

let completed: boolean = false;

const scores: number[] = [80, 90, 95];

const topics: Array<string> = [
    "类型注解",
    "类型推导",
    "严格模式"
];

scores.push(100);
// 类型错误：scores 只能接收 number
// scores.push("优秀");

topics.push("数组");
// 类型错误：topics 只能接收 string
// topics.push(25);
console.log(courseName);
console.log(studyHours);
console.log(completed);
console.log(scores);
console.log(topics);

// 1. 五个空白分别应该填写什么？只有四个依次是string  boolean number[] Array<string>

// 2. studyHours 会被推导成什么类型？ number

// 3. scores.push(100) 是否报错？  不会

// 4. scores.push("优秀") 是否报错？为什么？是  因为数组是number类型，不能放string类型的值

// 5. topics.push(25) 是否报错？为什么？  是  因为数组是string类型，不能放number类型的值

// 6. number[] 和 Array<number> 的含义是否相同？  是的，它们是相同的

// 7. number[] 和 [number] 的含义是否相同？  不同，number[] 表示一个数字数组，而 [number] 表示一个包含单个数字的元组



const position: [number, number] = [120, 30];

const employee: [string, number, boolean] = [
    "小红",
    25,
    true
];

// const wrongOrder: [string, number] = [18, "小李"];

// const missingValue: [string, number] = ["小王"];

// const extraValue: [string, number] = [
//     "小张",
//     23,
//     true
// ];


// 1. position[0] 是什么值和什么类型？    120, number

// 2. employee[2] 是什么值和什么类型？  true, boolean

// 3. wrongOrder 为什么报错？  元组要求第一个是string类型，第二个是number类型，而wrongOrder的第一个元素是number类型，第二个元素是string类型，所以报错

// 4. missingValue 为什么报错？  因为元组要求有两个元素，分别是string和number类型，而missingValue只有一个元素，所以报错

// 5. extraValue 为什么报错？  因为元组要求有两个元素，分别是string和number类型，而extraValue有三个元素，所以报错

// 6. 普通数组和元组的主要区别是什么？ 元组限制数量和类型，而普通数组只限制类型，不限制数量

// 7. 哪个更适合表示固定格式的“姓名和年龄”？  元组


enum Direction {
    Up,
    Down,
    Left,
    Right
}

enum UserRole {
    Student = "student",
    Teacher = "teacher",
    Admin = "admin"
}

const firstDirection: Direction = Direction.Up;
let currentRole: UserRole = UserRole.Student;

currentRole = UserRole.Admin;
// currentRole = "teacher";

console.log(Direction.Up);
console.log(Direction.Left);
console.log(currentRole);

// 1. Direction.Up 的值是什么？ 0

// 2. Direction.Left 的值是什么？ 2

// 3. firstDirection 的类型是什么？ Direction

// 4. currentRole = UserRole.Admin 是否报错？  没有

// 5. currentRole = "teacher" 是否报错？ 注意右侧只是普通字符串，不是 UserRole.Teacher。  是

// 6. 如果注释掉错误行，最后一次 console.log(currentRole) 输出什么？  admin

// 7. 枚举主要解决什么问题？  
// 把一组相关的固定值集中定义
// → 为每个值提供清晰名称
// → 限制变量只能使用这组值
// → 减少魔法字符串和拼写错误


// 1. strict 是一个单独规则，还是一组严格检查的总开关？  一组严格检查的总开关

// 2. greet 的 name 为什么会出现隐式 any 错误？   因为greet里面的name没有类型规定

// 3. foundName 的类型为什么是 string | undefined？  因为find方法可能找不到匹配的元素，所以返回值可能是undefined

// 4. 如果 find 没找到结果，却执行 foundName.toUpperCase()，运行时可能发生什么？  如果是undefined，就会报错，提示不能读取undefined的属性

// 5. 应该直接使用 foundName， 还是先判断它不是 undefined？ 判断它不是 undefined

// 6. strict 已经是 true 时，还需要为了开启严格模式， 再把 noImplicitAny 和 strictNullChecks 单独写成 true 吗？先根据自己的理解回答。  不用 严格模式下就已经打开了这两个要求


// 1. rootDir 应该填写什么？  TypeScript 源文件目录

// 2. outDir 应该填写什么？  编译后的 JavaScript 输出目录

// 3. target 应该填写什么？   生成哪一代 JavaScript 语法。

// 4. module 应该填写什么？   生成哪一种模块格式。

// 5. strict 应该填写 true 还是 false？  true

// 6. include 应该怎样匹配 src 中的所有 .ts 文件？    指定文件

// 7. 如果存在类型错误，noEmitOnError: true 会发生什么？  不会生成JavaScript

// 8. rootDir 和 outDir 的职责有什么区别？  rootDir 是 TypeScript 源文件目录，outDir 是编译后的 JavaScript 输出目录

// {
//   "compilerOptions": {
//     "rootDir": "./src",
//     "outDir": "./dist",
//     "target": "ES2022",
//     "module": "CommonJS",
//     "strict": true,
//     "noEmitOnError": true,
//     "sourceMap": true
//   },
//   "include": ["src/**/*.ts"],
//   "exclude": ["node_modules", "dist"]
// }

// 1. npx tsc --noEmit 是否报错？  没有

// 2. dist 中生成了哪些文件？  index.js 和 index.js.map

// 3. node dist\index.js 的完整输出是什么？  
// TypeScript 入门
// 4
// false
// [ 80, 90, 95, 100 ]
// [ '类型注解', '类型推导', '严格模式', '数组' ]
// 0
// 2
// admin

// 4. 为什么第一次检查使用 --noEmit，第二次编译不使用 --noEmit？  
// --noEmit 参数用于在检查 TypeScript 代码时禁用 JavaScript 文件的生成，而第二次编译不使用该参数，因此会生成相应的 JavaScript 文件。



function calculateTotal(
    prices: number[]
): number {
    return prices.reduce(function (total, price) {
        return total + price;
    }, 0);
}

function formatFullName(
    firstName: string,
    lastName: string
): string {
    return lastName + firstName;
}

function isAdult(
    age: number
): boolean {
    return age >= 18;
}

function doubleNumbers(
    numbers: number[]
): number[] {
    return numbers.map(function (number) {
        return number * 2;
    });
}
console.log(calculateTotal([10, 20, 30]));
console.log(formatFullName("明", "王"));
console.log(isAdult(20));
console.log(doubleNumbers([1, 2, 3]));
// calculateTotal([10, "20"]);

// formatFullName("明", 20);

// isAdult("20");

// doubleNumbers([1, "2"]);

// 1. 类型检查是否通过？是
// 2. 最后四行实际输出是什么？  
// 60
// 王明
// true
// [ 2, 4, 6 ]
// 1. calculateTotal 的 reduce 回调中， total 和 price 为什么能被推导为 number？   因为 reduce 的初始值是 0，total 的类型被推导为 number，而 price 是 prices 数组中的元素，prices 是 number[] 类型，所以 price 也被推导为 number。
// 2. doubleNumbers 的 map 回调中，number 为什么能被推导为 number？ 因为 numbers 是 number[] 类型，所以 map 回调中的 number 被推导为 number。
// 3. 如果去掉函数参数 prices: number[]，ènable strict 后可能出现什么问题？  可能会出现类型错误，因为 TypeScript 无法推导出 prices 的类型，从而导致类型检查失败。




// function greet(name) {
//     return "你好，" + name;
// }

function greet(
    name: string
): string {
    return "你好，" + name;
}

const studentNames: string[] = [
    "小明",
    "小红"
];

const foundName = studentNames.find(function (name) {
    return name === "小刚";
});

if (foundName !== undefined) {
    console.log(foundName.toUpperCase());
} else {
    console.log("没有找到学生");
}

// 1. greet 的 name 会产生什么类型错误？ 出现隐式any错误

// 2. TypeScript 为什么无法推导 name 的类型？   因为 greet 函数的参数 name 没有明确的类型注解，TypeScript 无法从上下文中推导出它的类型，因此会将其视为 any 类型，从而触发隐式 any 错误。

// 3. foundName 的类型是什么？  string | undefined

// 4. foundName 为什么可能是 undefined？  因为 studentNames 数组中没有 "小刚" 这个元素，所以 find 方法可能找不到匹配的元素，从而返回 undefined。

// 5. foundName 为 undefined 时调用 toUpperCase()，运行时会发生什么？  如果 foundName 为 undefined，调用 toUpperCase() 会导致运行时错误，因为 undefined 没有 toUpperCase 方法。

// 6. 这段代码预计有几处类型错误？  两处，greet 函数的参数 name 没有类型注解，导致隐式 any 错误；foundName 可能为 undefined，调用 toUpperCase() 会导致运行时错误。

// 7. 关闭 strictNullChecks 后不再报错，是否代表运行时一定安全？为什么？  不代表。关闭 strictNullChecks 后，TypeScript 不再检查 null 和 undefined 的情况，但这并不意味着运行时一定安全，因为程序在运行时仍可能遇到 null 或 undefined 值，导致运行时错误。



// 1. greet 的两个空白分别填写什么？  string  string    

// 2. foundName 判断中的空白填写什么？ undefined

// 3. 进入 if 内部后，foundName 是什么类型？   string

// 4. 这次实际运行会进入 if 还是 else？为什么？ else，因为 studentNames 数组中没有 "小刚" 这个元素，所以 find 方法返回 undefined，进入 else 分支.


// 1. TypeScript 和 JavaScript 的关系是什么？  TypeScript 是以 JavaScript 为基础的语言，主要增加静态类型系统和相关开发工具能力。
// TypeScript 代码经过检查和编译后生成 JavaScript，最终由浏览器或 Node.js 运行 JavaScript。    typescript只是负责规范变量的类型，编译后会生成JavaScript代码，最终运行的是JavaScript代码。

// 2. TypeScript 类型检查主要发生在运行前还是运行时？类型注解编译后通常还会保留吗？  运行前  类型注解编译后通常不会保留

// 3. 什么是类型注解？什么是类型推导？各写一个简单例子。  类型注解是申明变量主动规定变量类型 例如 let a: number = 5; // 类型注解 类型推导是根据变量的值自动推断变量类型 例如 let b = 5; // 类型推导

// 4. string、number、boolean 为什么建议使用小写？   小写表示 JavaScript 的基本值类型   大写表示对应的包装对象类型。日常变量通常保存基本值，所以应使用小写类型。

// 5. number[]、Array<number> 和 [number] 有什么区别？ 前两个没有区别，都是表示一个数字数组，而 [number] 表示一个包含单个数字的元组。

// 6. 元组主要限制哪三件事？  数量  元素类型 位置

// 7. enum 主要解决什么问题？数字枚举未指定初始值时默认从多少开始？  enum 主要解决的是为一组相关的常量提供一个有意义的名称，使代码更具可读性和维护性。数字枚举未指定初始值时默认从 0 开始。

// 8. strict 是什么？noImplicitAny 和 strictNullChecks 分别检查什么？ strict 是 TypeScript 的严格模式开关，启用后会开启一系列严格的类型检查规则。noImplicitAny 检查是否存在隐式 any 类型的变量或参数，而 strictNullChecks 检查是否允许 null 和 undefined 值赋给其他类型。

// 9. 请解释下面两个配置：

//    rootDir    typescript 源文件目录
//    outDir    typescript 编译后输出目录

// 10. --noEmit 和 noEmitOnError 有什么区别？ --noEmit 无论有没有类型错误，都不生成 JavaScript。 它通常用于只做类型检查  noEmitOnError: true 没有错误时正常生成 JavaScript；存在类型错误时才禁止生成。

// 11. find 的返回值为什么经常包含 undefined？使用结果前应该怎样处理？因为find没有找到匹配的值就会是undefined 使用前应该使用if判断

// 12. 下面代码中有哪些类型错误？逐行说明原因。

//    let score = 90;
//    score = "100";
// score是number类型，不能赋值为string类型

//    function formatName(name) {
//        return "姓名：" + name;
//    }
// name没有类型注解 会产生any报错

//    const userInfo: [string, number] = [
//        18,
//        "小明"
//    ];

// 元组要求第一个元素是string类型，第二个元素是number类型，而userInfo的第一个元素是number类型，第二个元素是string类型，所以报错

//    const names: string[] = ["小明", "小红"];
//    const result = names.find(function (name) {
//        return name === "小刚";
//    });

//    console.log(result.toUpperCase());

// 如果是undefined使用toUpperCase方法就会产生报错




enum CourseStatus {
    Learning = "learning",
    Completed = "completed"
}

function createCourseSummary(
    courseName: string,
    scores: number[],
    status: CourseStatus
): [string, number, CourseStatus] {
    const total = scores.reduce(function (
        sum,
        score
    ) {
        return sum + score;
    }, 0);

    return [
        courseName,
        total,
        status
    ];
}

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

const summary = createCourseSummary(
    "TypeScript",
    [80, 90, 100],
    CourseStatus.Learning
);

const matchedTopic = findTopic(
    ["类型注解", "类型推导", "严格模式"],
    "泛型"
);

console.log(summary);
console.log(matchedTopic);

// 1. createCourseSummary 的三个参数分别是什么类型？ string number[]  CourseStatus

// 2. 它返回的元组类型是什么？  [string, number, CourseStatus]

// 3. findTopic 的三个空白分别填写什么？  string[]  string string

// 4. summary 的总分是多少？270

// 5. matchedTopic 最终是什么？  未找到

// 6. result 为 undefined 时返回“未找到”；
//    否则 result 被收窄为 string。
//    所有执行路径最终都返回 string。




