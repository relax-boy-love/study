type User = {
    id: number;
    name: string;
    active: boolean;
};

const user1: User = {
    id: 1,
    name: "小明",
    active: true
};

function printUser(user: User): string {
    return user.id
        + "："
        + user.name
        + "："
        + (user.active ? "启用" : "停用");
}

console.log(printUser(user1));

// const user2: User = {
//     id: 2,
//     name: "小红"
// };

// const user3: User = {
//     id: "3",
//     name: "小刚",
//     active: true
// };

// User 描述的是基本类型，还是对象的结构？ 对象的结构
// user1 必须具有哪三个属性？    id   name   active
// user2 如果取消注释，为什么会报错？   缺少属性active报错
// user3 如果取消注释，哪一个属性类型错误？  id的类型是number 赋值是字符串  出现类型错误
// printUser 的参数和返回值分别是什么类型？    参数是User   返回值是string
// 最后的 console.log 会输出什么？  1：小明：启用


interface Course {
    readonly id: number;
    title: string;
    description?: string;
}

const course1: Course = {
    id: 1,
    title: "TypeScript"
};

const course2: Course = {
    id: 2,
    title: "React",
    description: "学习组件开发"
};

course1.title = "TypeScript 基础";

// course1.id = 10;

function getDescription(course: Course): string {
    if (course.description === undefined) {
        return "暂无介绍";
    }

    return course.description;
}

console.log(course1);
console.log(getDescription(course1));
console.log(getDescription(course2));

// description? 中的 ? 表示什么？表示这个属性可以有也可以是 undefined  表示该属性可以省略。
// 读取 course.description 时，它的类型是什么？  string|undefined
// readonly id 表示创建对象时不能填写 id，还是创建后不能重新赋值？   不能重新赋值    readonly 要求创建对象时正常提供必填的 id，但创建后不能通过该属性重新赋值。
// course1.title = "TypeScript 基础" 是否报错？为什么？ 不会   因为course1.title = "TypeScript 基础"只是给course1的title重新赋值
// course1.id = 10 取消注释后是否报错？为什么？  会 因为id设置了readonly
// getDescription(course1) 返回什么？  暂无介绍
// getDescription(course2) 返回什么？  学习组件开发


interface PermissionMap {
    [permissionName: string]: boolean;
}

const permissions: PermissionMap = {
    read: true,
    write: false
};

permissions.delete = true;

// permissions.export = "允许";

function hasPermission(
    permissionMap: PermissionMap,
    permissionName: string
): boolean {
    return permissionMap[permissionName] ?? false;
}

console.log(permissions);
console.log(hasPermission(permissions, "read"));
console.log(hasPermission(permissions, "admin"));


// 为什么 PermissionMap 没有提前写出 read、write 和 delete？   因为属性名不确定  permissionName 只是索引参数的说明名称
// 索引签名规定属性名是什么类型？  string
// 索引签名规定属性值是什么类型？  boolean
// permissions.delete = true 是否报错？   没有
// permissions.export = "允许" 取消注释后为什么报错？  因为属性值的类型必须是boolean
// ?? false 在这里解决什么情况？
// 最后三行分别输出什么？
// {
//     read: true,
//     write: false,
//     delete:truw
// }

// true

// false


// [permissionName: string] 规定对象的属性名是什么类型？   string
// 后面的 boolean 规定什么必须是布尔值？     属性值
// 能否向对象添加一个事先没有明确写出的 download 属性？   可以 允许添加任意名称为 string 的属性，但每个属性值都必须是 boolean。
// 为什么下面这行会报错？    "允许" 是 string索引签名要求属性值必须是 boolean。
// permissions.download = "允许";

// permissionName 只是索引签名中的说明名称，还是对象必须存在一个叫 permissionName 的属性？   只是索引签名中的说明名称



// interface InterfaceUser {
//     id: number;
//     name: string;
//     active?: boolean;
// }

// type TypeUser = {
//     id: number;
//     name: string;
//     active?: boolean;
// };

// const interfaceUser: InterfaceUser = {
//     id: 1,
//     name: "小明"
// };

// const typeUser: TypeUser = {
//     id: 2,
//     name: "小红",
//     active: true
// };

// function getInterfaceUserName(
//     user: InterfaceUser
// ): string {
//     return user.name;
// }

// function getTypeUserName(
//     user: TypeUser
// ): string {
//     return user.name;
// }

// InterfaceUser 和 TypeUser 描述的对象结构是否相同？  是
// 两者能否都规定必填属性？  是
// 两者能否都使用可选属性 ?？  是
// 两者能否都用于函数参数的类型？  是
// 如果 typeUser 缺少 name，是否会报错？  是  因为name是必填属性
// 从这段代码看，interface 和 type 在描述对象结构时有什么共同点？用一句话回答。  对象有那些属性  可规定属性必填和可选  属性是什么类型



interface BaseUser {
    id: number;
    name: string;
}

interface AdminUser extends BaseUser {
    permissions: string[];
}

type BaseMenu = {
    id: number;
    title: string;
};

type LinkMenu = BaseMenu & {
    url: string;
};

const admin: AdminUser = {
    id: 1,
    name: "管理员",
    permissions: ["read", "write"]
};

const menu: LinkMenu = {
    id: 10,
    title: "首页",
    url: "/home"
};

console.log(admin);
console.log(menu);

// AdminUser 最终具有哪三个属性？id  name  permissions
// interface 使用哪个关键字继承另一个接口？  extends
// LinkMenu 最终具有哪三个属性？  id    title  url
// BaseMenu & { url: string } 中的 & 表示二选一，还是必须同时满足两边的结构？  必须满足两边的条件
// 如果 menu 缺少 id，是否会报错？为什么？    是  因为id是必填属性


interface AppSettings {
    theme: string;
}

interface AppSettings {
    language: string;
}

const settings: AppSettings = {
    theme: "dark",
    language: "zh-CN"
};

type LoadStatus =
    | "loading"
    | "success"
    | "error";

type Position = [number, number];

const status: LoadStatus = "loading";
const position: Position = [120, 30];

console.log(settings);
console.log(status);
console.log(position);

// settings 为什么必须同时具有 theme 和 language？  而是两个同名的 interface AppSettings 会自动合  所以 settings 必须同时包含 theme 和 language
// interface 出现两个同名声明时，是产生错误，还是自动合并？  自动合并
// type 能否直接表示 "loading" | "success" | "error" 这种联合类型？  可以
// type Position 描述的是普通数组还是元组？  元组
// interface 更常用于描述什么结构？   对象
// 除了对象，type 还能方便地表示哪些类型？根据代码写出两个。   联合类型 元组类型




// 这是基本类型，还是对象结构？   对象结构
// 可以使用 interface 描述它吗？   可以
// id 应该是什么类型？   number
// name 应该是什么类型？  string
// permissions 是单个字符串，还是字符串数组？   字符串数组
// 如果角色的 id 创建后不允许修改，应在 id 前添加哪个关键字？ readonly



const adminRole: Role =
// 根据上面的数据填写
{
    id: 1,
    name: "管理员",
    permissions: ["user:read", "user:write"]
};

console.log(adminRole);




const systemMenu:MenuItem = {
    id: 1,
    title: "系统管理",
    path: "/system",
    children: [
        {
            id: 2,
            title: "用户管理",
            path: "/system/users"
        },
        {
            id:3,
            title:"角色管理",
            path:"/system/roles"
        }
    ]
};

interface MenuItem {
    id: number;
    title: string;
    path: string;
    children ?: MenuItem[];
}

// children 是单个菜单，还是菜单数组？   菜单数组
// 有些菜单没有 children，这个属性是否应该是可选属性？   是
// 如果接口名叫 MenuItem，children 应该写成 MenuItem 还是 MenuItem[]？  MenuItem[]
// 可选的 children 属性需要使用哪个符号？   ？





interface Role {
    readonly id: number;
    name: string;
    permissions: string[];
}

type UserWithRoles = User & {
    roles: Role[];
};





const userWithRoles: UserWithRoles = {
    id:1,
    name:"hh",
    active:true,
    roles:[
        adminRole
    ]




    // name
    // active
    // roles 中放放已经存在的 adminRole
};

console.log(userWithRoles);
// 一个用户可能有多个角色，roles 应该是 Role 还是 Role[]？Role[]
// User & { roles: ... } 中的 & 表示二选一，还是两边都必须满足？  两边都必须满足
// UserWithRoles 最终会有哪四个属性？   id   name  active  roles
// 如果对象缺少原来 User 中的 active，是否会通过类型检查？为什么？  不能  因为active是必须属性




// list 应该是 UserWithRoles 还是 UserWithRoles[]？UserWithRoles[]
// total、page、pageSize 应分别是什么类型？  number
// 当前 list 中实际有几条用户数据？  1
// total: 21 是否表示当前 list 中有 21 条数据？ 不是
// 可以用 interface UserPageResponse 描述整个分页响应对象吗？   可以

interface UserPageResponse {
    // list
    list:UserWithRoles[];
    // total
    total:number;
    // page
    page:number;
    // pageSize
    pageSize:number;
}

const userPage: UserPageResponse = {
    list: [userWithRoles],
    total: 21,
    page: 2,
    pageSize: 10
};

console.log(userPage);


// interface 和 type 在描述对象结构时，有哪些共同点？
// 每个属性是什么类型；
// 属性是必填还是可选；
// 属性是否只读。
// 同名的 interface 会发生什么？   会发生合并
// type 除了对象，还能方便地表示哪两种类型？  联合类型 元组
// 扩展对象结构时，interface 和 type 分别可以使用什么写法？  interface extends  type &
// 为什么 list: userWithRoles[] 会报错，而 list: UserWithRoles[] 不会？  userWithRoles 不是类，它是通过 const 创建的具体对象，也就是一个“值”。    list: UserWithRoles[]是类型别名不是真正的类
// children?: MenuItem[] 中，?、MenuItem 和 [] 分别表示什么？?表示可以有这个属性也可以没有    数组中每个元素类型是MenuItem []表示数组类型


interface DashboardData{
    currentUser:UserWithRoles;
    menus:MenuItem[];
    userPage:UserPageResponse;
}

const  dashboardData: DashboardData = {
        currentUser:userWithRoles,
        menus:[systemMenu],
        userPage:userPage
}
