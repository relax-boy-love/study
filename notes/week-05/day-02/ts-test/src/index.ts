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

console.log(printValue("typescript"));
console.log(printValue(12));
console.log(printValue(false));

// 1. value 一共有哪三种可能类型？  string number boolean

// 2. 第一个 if 内，value 被收窄成什么类型？   string

// 3. 第二个 if 内，value 被收窄成什么类型？  number

// 4. 执行最后一个 return 时，value 还可能是哪种类型？  boolean

// 5. 三个 console.log 分别输出什么？  TYPESCRIPT  12.00  否  toFixed(2) 表示将数字格式化为保留两位小数的字符串

// 6. 如果在所有判断之前直接调用 value.toUpperCase()，为什么会报错？   因为value可能的值还要number和boolean类型

// 7. 联合类型中的竖线 | 表示“同时满足”，还是“可以是其中一种”？  可以是其中一种

type JobApplication = {
    company: string;
    status:
    | "pending"
    | "interview"
    | "offer"
    | "rejected";
    note?: string;
};

const application1: JobApplication = {
    company: "星海科技",
    status: "pending"
};

const application2: JobApplication = {
    company: "远方网络",
    status: "interview",
    note: "准备项目介绍"
};

// 错误："done" 不属于 status 允许的字面量
// const application3: JobApplication = {
//     company: "未来公司",
//     status: "done"
// };

function getApplicationNote(
    application: JobApplication
): string {
    // 如果 note 不存在，返回“没有备注”
    if (application.note === undefined) {
        return "没有备注";
    } else {
        return application.note.toUpperCase();
    }
    // 如果 note 存在，将它转换为大写并返回
}
console.log(getApplicationNote(application1));
console.log(getApplicationNote(application2));

// 1. status 是普通 string，还是字符串字面量联合类型？    字符串字面量联合类型

// 2. status 一共允许哪四个值？  pending   interview  offer   rejected

// 3. application1 没有 note，是否产生类型错误？为什么？ 不会  因为note是可选属性 有没有都不会报错

// 4. application2 的 note 是什么类型？ string|undefined

// 5. application3 为什么产生类型错误？  属性存在→ 属性值不符合字面量联合类型

// 6. application1.note 的类型是什么？ 静态类型：string | undefined  本次实际值：undefined

// 7. 为什么不能直接调用 application1.note.toUpperCase()？  因为undefined没有这个方法 调用会报错

// 8. 使用 note 前应该先做什么？  检测note是不是undefined


// 1. getApplicationNote 的完整代码。
// function getApplicationNote(
//     application: JobApplication
// ): string {
//     // 如果 note 不存在，返回“没有备注”
//     if(application.note === undefined){
//         return "没有备注";
//     }else{
//         return application.note.toUpperCase();
//     }
//     // 如果 note 存在，将它转换为大写并返回
// }

// 2. 类型检查是否通过？  是

// 3. 最后两行实际输出是什么？没有备注  准备项目介绍

// 4. 为什么函数的返回类型只需要 string，不需要 string | undefined？    因为已经进行了类型缩窄使用了if把undefined提前处理了


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

console.log(describeValue(null));
console.log(describeValue("typescript"));
console.log(describeValue(12));

// 1. value 最初可能是哪三种类型？  string   number  null

// 2. 第一个 if 内，value 是什么类型？  null

// 3. 通过第一个 if 后，剩下哪两种类型？  string   number

// 4. 第二个 if 内，value 被收窄成什么类型？  string

// 5. 执行最后一个 return 时，value 是什么类型？  number

// 6. 三次调用分别输出什么？  空值  TYPESCRIPT  12.0   都是字符串类型

// 7. 为什么不能只使用 typeof value === "object"来准确判断 null？    因为数组和对象的类型都是object  null的typeof也是object

// 8. typeof [] 的运行结果是 "array" 还是 "object"？不知道可以直接写“不知道”。   object


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
        return person.name
            + "教授"
            + person.subject;
    }

    return person.name
        + "就读"
        + person.grade
        + "年级";
}

// 1. person 最初是哪两个类型的联合？   Teacher 对象   Student 对象

// 2. 判断前为什么可以直接访问 person.name？   联合类型没有收窄之前，只能直接访问所有成员共同拥有的属性：共同属性：name

// 3. 判断前为什么不能直接访问 person.subject？  不一定安全，因为 Student 没有 subject。不是“不知道它在哪个对象里”，而是联合类型的某些成员根本没有这个属性。

// 4. if 分支中的 person 被收窄成什么类型？   Teacher

// 5. 最后一个 return 中的 person 是什么类型？  Student

// 6. 下面两次调用分别输出什么？  王老师教授数学   小明就读3年级





console.log(describePerson({
    name: "王老师",
    subject: "数学"
}));
console.log(describePerson({
    name: "小明",
    grade: 3
}));

// 7. in 判断的是属性的值，还是属性是否存在？   是否存在


class Dog {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    bark(): string {
        return this.name + "：汪汪";
    }
}

class Cat {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    meow(): string {
        return this.name + "：喵喵";
    }
}
function makeSound(animal: Dog | Cat): string {
    if (animal instanceof Dog) {
        return animal.bark();
    }

    return animal.meow();
}
console.log(makeSound(new Dog("旺财")));
console.log(makeSound(new Cat("咪咪")));
// 1. 进入函数但还没有判断时，animal 能否直接调用 bark？为什么？    不能因为不知道animal实列的类是谁

// 2. animal instanceof Dog 为 true 后，animal 被收窄成什么类型？ Dog 

// 3. instanceof 判断为 false 后，当前联合类型中只剩什么类型？  Cat

// 4. makeSound(new Dog("旺财")) 返回什么？  旺财：汪汪

// 5. makeSound(new Cat("咪咪")) 返回什么？   咪咪：喵喵


// 1. type Teacher = {...} 定义的 Teacher，能不能写在 instanceof 右侧？为什么？  Teacher 不能写在 instanceof 右侧，因为Teacher是类型别名 ，编译后不存在；instanceof 需要运行时存在的类或构造函数。
// 2. 判断 person 是否有 subject 属性，应该使用 in 还是 instanceof？  in

// 3. 判断 animal 是否由 Dog 类创建，应该使用 in 还是 instanceof？instanceof


type RequestState =
    {
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

function renderState(
    state: RequestState
): string {
    switch (state.status) {
        case "loading":
            return "正在加载";

        case "success":
            return "收到 "
                + state.data.length
                + " 条数据";

        case "error":
            return "请求失败："
                + state.error;
    }

    
}

console.log(renderState({
    status: "loading"
}));

console.log(renderState({
    status: "success",
    data: ["用户", "岗位"]
}));

console.log(renderState({
    status: "error",
    error: "网络异常"
}));

// 1. RequestState 由哪三个对象类型组成？  
//     {
//         status: "loading";
//     }
//     | {
//         status: "success";
//         data: string[];
//     }
//     | {
//         status: "error";
//         error: string;
//     }

// 2. 哪个属性是判别字段？   status

// 3. status 为 success 时，可以安全访问哪个特有属性？  data

// 4. status 为 error 时，可以安全访问哪个特有属性？  error

// 5. 为什么不能在收窄前直接访问 state.data？   因为 data只在status的success里存在它是特有属性

// 6. WeakState 为什么会允许不合理状态？   data和error都是可有可没有  列：如果status在loading 有data就不合理
 
// 7. 判别联合怎样保证 success 一定带有 data？     联合判别里就可以定义多个对象啊 里面的多个对象只需要一个判别字段就可以区别

// 8. 三次调用分别返回什么？   正在加载      收到2条数据    请求失败：网络异常

// renderState({ status: "loading" });

// renderState({
//     status: "success",
//     data: ["用户", "岗位"]
// });

// renderState({
//     status: "error",
//     error: "网络异常"
// });




function binarySearch(
    numbers: number[],
    target: number
): number {
    let left = 0;
    let right = numbers.length-1;

    while (left <= right) {
        const middle = Math.floor(
            (left + right) / 2
        );

        const middleValue = numbers[middle];

        if (middleValue === target) {
            return middle;
        }

        if (middleValue < target) {
            // 目标在右半部分
            left = middle+1;
        } else {
            // 目标在左半部分
            right = middle-1;
        }
    }

    return -1;
}

const orderedNumbers: number[] = [
    2,
    5,
    8,
    12,
    16,
    23
];

console.log(binarySearch(orderedNumbers, 16));
console.log(binarySearch(orderedNumbers, 2));
console.log(binarySearch(orderedNumbers, 23));
console.log(binarySearch(orderedNumbers, 7));

// 第一轮：

// left =0
// right =5
// middle =Math.floor((left+right)/2)
// numbers[middle] = 8

// 16 比中间值大还是小？大
// 下一轮 left 或 right 怎样变化？  left = middle+1


// 第二轮：

// left =middle+1
// right =5
// middle =Math.floor((3+5)/2)
// numbers[middle] =16

// 是否找到目标？ 是
// 最终返回哪个索引？ 4


// 1. 二分查找为什么要求数组有序？  如何是无序的就会不能对半分

// 2. 每次比较后，大约能够排除多少搜索范围？   50%

// 3. 如果直到 left > right 仍未找到目标，通常应该返回 -1 还是 0？为什么不能随便返回 0？  -1  数组索引 0 是合法位置



// 1. 补全后的函数。


// 2. 四次调用分别应该返回什么？  4    0    5    -1

// 3. while 为什么使用 left <= right，而不是 left < right？   如果left < right就不能判断下标为o和最右边的那个数

// type ApiResult =
//     | { status: "loading" }
//     | { status: "success"; data: string[] }
//     | { status: "error"; message: string };

// function getResultText(result: ApiResult): string {
//     if (result.status === "success") {
//         return result.data.join(",");
//     }

//     if (result.status === "error") {
//         return result.message;
//     }

//     return "加载中";
// }


// // ApiResult 是普通对象类型还是联合类型？  联合类型
// // 哪个属性是判别字段？  status
// // success 分支中，result 被收窄成什么结构？   { status: "success"; data: string[] }
// // 为什么不能在第一个 if 之前直接访问 result.data？    因为 data只在status的success里存在它是特有属性
// // { status: "success" } 能否赋给 ApiResult？为什么？   不能 因为success里必须有data



// type User = {
//     name: string;
//     phone?: string;
// };

// function formatValue(value: string | number): string {
//     if (typeof value === "number") {
//         return value.toFixed(1);
//     }

//     return value.toUpperCase();
// }


// // phone?: string 中的 ? 表示什么？   phone?: string：表示 phone 是可选属性，对象可以有，也可以没有该属性。读取时类型是 string | undefined。
// // 读取 user.phone 时，它的类型是什么？   string|undefined
// // 使用 user.phone.toUpperCase() 前应该先做什么？   判断的是 user.phone 是否为 undefined
// // typeof value === "number" 分支中，value 被收窄成什么类型？   number
// // 最后一个 return 中，value 是什么类型？  string
// // formatValue(12) 返回的值是什么？返回值是 number 还是 string？   返回值：12.0  是string


// type Admin = {
//     name: string;
//     permissions: string[];
// };

// type Customer = {
//     name: string;
//     points: number;
// };

// function describeUser(user: Admin | Customer): string {
//     if ("permissions" in user) {
//         return user.name + "：" + user.permissions.length;
//     }

//     return user.name + "：" + user.points;
// }


// class FileError extends Error {
//     fileName: string;

//     constructor(message: string, fileName: string) {
//         super(message);
//         this.fileName = fileName;
//     }
// }


// // 为什么收窄前可以访问 user.name？    因为name是共有属性
// // "permissions" in user 判断的是属性值，还是属性是否存在？属性是否存在
// // if 分支中的 user 被收窄成什么类型？   Admin
// // 最后一个 return 中的 user 是什么类型？  Customer
// // 判断 error 是否为 FileError 的实例，应该使用 in、typeof 还是 instanceof？instanceof
// // Admin 是类型别名，能否写成 user instanceof Admin？为什么？  不能  Admin是类型别名编译后不存在 


// type SaveState =
//     | { status: "idle" }
//     | { status: "saving" }
//     | { status: "success"; id: number }
//     | { status: "error"; message: string };

// function showSaveResult(state: SaveState): string {
//     if (state.status === "success") {
//         return "编号：" + state.id;
//     }

//     if (state.status === "error") {
//         return state.message;
//     }

//     return "处理中";
// }


// // { status: "success", message: "完成" } 为什么不能赋给 SaveState？   不能  success 状态必须具有 id，而 message 是 error 状态的属性。
// // state.status === "error" 后，可以安全访问哪个特有属性？  message
// // 这段函数是否使用了 any？  没有
// // 二分查找找到目标时为什么返回 middle，而不是 numbers[middle]？  numbers[middle]返回的是值不是索引
// // 二分查找没有找到目标时，什么条件说明搜索区间已经为空？   left>right  
// // 用完整的一句话说明二分查找为什么是 O(log n)。  查找的数组翻倍查询次数只会增加1  