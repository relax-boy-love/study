# 第 27 天：interface 与 type

## 一、今日学习目标

- 使用 `type` 和 `interface` 描述对象结构。
- 理解必填属性、可选属性、只读属性和索引签名。
- 比较 `interface` 与 `type` 的共同点和主要差异。
- 使用 `extends` 和交叉类型 `&` 扩展对象结构。
- 理解 `interface` 的声明合并，以及 `type` 对联合类型和元组的表达能力。
- 为用户、角色、菜单和分页响应设计类型，并把它们组合成后台页面数据。

## 二、学习时间

| 部分 | 预计时间 | 完成状态 |
| --- | ---: | --- |
| 对象类型 | 30 分钟 | 已完成 |
| 可选属性与只读属性 | 30 分钟 | 已完成 |
| 索引签名 | 35 分钟 | 已完成 |
| `interface` 与 `type` 的共同点和扩展方式 | 35 分钟 | 已完成 |
| 声明合并、联合类型与元组 | 30 分钟 | 已完成 |
| 用户、角色、菜单和分页响应设计 | 75 分钟 | 已完成 |
| 综合类型设计、纠错与验证 | 35 分钟 | 已完成 |
| 复盘、运行与笔记整理 | 30 分钟 | 已完成 |

预计总学习时间：约 5 小时。由于中间增加了递归类型、值与类型的区分以及报错排查，超过了原计划的 4 小时。

## 三、对象类型

`type` 可以规定对象必须具有哪些属性，以及每个属性的类型。

```ts
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
```

关键结论：

- 缺少必填属性会报错。
- 属性值与声明的类型不一致会报错。
- 类型也可以用在函数参数和返回值位置。

```ts
function printUser(user: User): string {
    return user.id
        + "："
        + user.name
        + "："
        + (user.active ? "启用" : "停用");
}
```

## 四、可选属性与只读属性

```ts
interface Course {
    readonly id: number;
    title: string;
    description?: string;
}
```

- `readonly id`：创建对象时仍然要提供必填的 `id`，但创建后不能通过该属性重新赋值。
- `description?`：创建对象时可以省略 `description`。
- 读取可选属性时，它的类型是 `string | undefined`，因此使用前要处理缺失情况。

```ts
function getDescription(course: Course): string {
    if (course.description === undefined) {
        return "暂无介绍";
    }

    return course.description;
}
```

## 五、索引签名

当对象的属性名不能提前确定，但属性值的类型有统一要求时，可以使用索引签名。

```ts
interface PermissionMap {
    [permissionName: string]: boolean;
}

const permissions: PermissionMap = {
    read: true,
    write: false
};

permissions.delete = true;
```

`[permissionName: string]: boolean` 的含义：

- `permissionName` 只是索引参数的说明名称，不是对象必须有一个叫 `permissionName` 的属性。
- 属性名是字符串。
- 每个属性值都必须是布尔值。
- 可以增加事先没有明确列出的属性，但新值仍必须是布尔值。

动态读取权限：

```ts
function hasPermission(
    permissionMap: PermissionMap,
    permissionName: string
): boolean {
    return permissionMap[permissionName] ?? false;
}
```

`permissionMap[permissionName]` 根据变量中的属性名动态读取权限。`?? false` 表示读取结果为 `undefined` 或 `null` 时返回 `false`，因此不存在的权限默认视为没有权限。

## 六、interface 与 type 的共同点

两者都可以描述对象结构，包括：

- 对象有哪些属性；
- 每个属性是什么类型；
- 属性是必填还是可选；
- 属性是否只读；
- 作为函数参数或变量的类型。

```ts
interface InterfaceUser {
    id: number;
    name: string;
    active?: boolean;
}

type TypeUser = {
    id: number;
    name: string;
    active?: boolean;
};
```

## 七、interface 与 type 的主要差异

### 1. 扩展对象结构

`interface` 使用 `extends`：

```ts
interface BaseUser {
    id: number;
    name: string;
}

interface AdminUser extends BaseUser {
    permissions: string[];
}
```

`type` 可以使用交叉类型 `&`：

```ts
type BaseMenu = {
    id: number;
    title: string;
};

type LinkMenu = BaseMenu & {
    url: string;
};
```

这里的 `&` 不是二选一，而是要求同时满足两边的结构。

### 2. 声明合并

同名的 `interface` 会自动合并：

```ts
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
```

最终的 `AppSettings` 同时要求 `theme` 和 `language`。同名的 `type` 不能重复声明。

### 3. type 的表达能力

`type` 除了对象，还能直接表示联合类型和元组等类型。

```ts
type LoadStatus = "loading" | "success" | "error";
type Position = [number, number];
```

- `LoadStatus` 只允许三个指定的字符串值。
- `Position` 是元组，规定元素数量、顺序以及每个位置的类型。

## 八、业务类型设计

### 1. 角色类型

```ts
interface Role {
    readonly id: number;
    name: string;
    permissions: string[];
}

const adminRole: Role = {
    id: 1,
    name: "管理员",
    permissions: ["user:read", "user:write"]
};
```

### 2. 递归菜单类型

```ts
interface MenuItem {
    id: number;
    title: string;
    path: string;
    children?: MenuItem[];
}
```

`children?: MenuItem[]` 表示：

- `children` 可以省略；
- 如果存在，它必须是数组；
- 数组中的每个元素仍是 `MenuItem`；
- 每个子菜单又可以拥有自己的 `children`，因此能够描述多层菜单。

```ts
const systemMenu: MenuItem = {
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
            id: 3,
            title: "角色管理",
            path: "/system/roles"
        }
    ]
};
```

### 3. 用户与角色组合

```ts
type UserWithRoles = User & {
    roles: Role[];
};

const userWithRoles: UserWithRoles = {
    id: 1,
    name: "hh",
    active: true,
    roles: [adminRole]
};
```

`UserWithRoles` 同时满足原来的 `User` 结构和新增的 `roles` 结构。

### 4. 分页响应

```ts
interface UserPageResponse {
    list: UserWithRoles[];
    total: number;
    page: number;
    pageSize: number;
}

const userPage: UserPageResponse = {
    list: [userWithRoles],
    total: 21,
    page: 2,
    pageSize: 10
};
```

- `list` 是当前页的用户数组。
- `total` 是所有页面的数据总数，不是当前 `list` 的长度。
- `page` 是当前页码。
- `pageSize` 是每页数量。

### 5. 后台页面综合数据

```ts
interface DashboardData {
    currentUser: UserWithRoles;
    menus: MenuItem[];
    userPage: UserPageResponse;
}

const dashboardData: DashboardData = {
    currentUser: userWithRoles,
    menus: [systemMenu],
    userPage
};
```

## 九、类型和值的区别

```ts
type UserWithRoles = User & {
    roles: Role[];
};

const userWithRoles: UserWithRoles = {
    id: 1,
    name: "hh",
    active: true,
    roles: [adminRole]
};
```

- `UserWithRoles` 是类型，相当于对象的设计图，出现在类型位置。
- `userWithRoles` 是通过 `const` 创建的实际值，出现在数据位置。

因此：

```ts
interface UserPageResponse {
    list: UserWithRoles[];
}

const userPage: UserPageResponse = {
    list: [userWithRoles]
};
```

`list: userWithRoles[]` 会报错，因为它把具体值当成了类型。

## 十、完整数据关系

```text
DashboardData
├─ currentUser: UserWithRoles
│  ├─ User 原有属性：id、name、active
│  └─ roles: Role[]
│     └─ adminRole
├─ menus: MenuItem[]
│  └─ systemMenu
│     └─ children: MenuItem[]
│        ├─ 用户管理
│        └─ 角色管理
└─ userPage: UserPageResponse
   ├─ list: UserWithRoles[]
   │  └─ userWithRoles
   ├─ total: 21
   ├─ page: 2
   └─ pageSize: 10
```

## 十一、今日易错点与修正

1. `description?` 不是“必须存在但可以是 undefined”，而是该属性可以省略；读取时通常得到 `string | undefined`。
2. `readonly` 不是创建对象时不能填写属性，而是创建后不能通过该属性重新赋值。
3. 索引签名里的 `permissionName` 只是说明名称，不是对象必须存在的固定属性。
4. `?? false` 用于处理动态属性不存在时得到的 `undefined`，让函数稳定返回布尔值。
5. `interface` 更常用于描述对象结构；类可以 `implements` 接口，但“类”不是接口最主要的描述对象。
6. `MenuItem[]` 表示元素类型为 `MenuItem` 的数组；反引号只是 Markdown 标记，不能写进 TypeScript 属性名。
7. `roles` 的类型是 `Role[]`，实际值要写成 `[adminRole]`，不能写成 `{ permissions: adminRole }`。
8. `UserWithRoles` 是类型，`userWithRoles` 是值；大小写相近不代表作用相同。
9. `list: UserWithRoles[]` 是类型声明，`list: [userWithRoles]` 是实际数据。
10. `UserPageResponse.list` 不能放 `[adminRole]`，因为 `Role` 缺少 `UserWithRoles` 必填的 `active` 和 `roles`。
11. 对象类型注解后的赋值仍需要等号：`const dashboardData: DashboardData = { ... }`。
12. 单个值不要误写成数组：`currentUser` 是 `UserWithRoles`，只有 `menus` 和分页的 `list` 是数组。

## 十二、实际验证结果

执行严格类型检查：

```powershell
npx tsc --noEmit
```

结果：通过，无类型错误。

执行编译和运行：

```powershell
npx tsc
node src/index.js
```

结果：命令退出码为 `0`。关键输出包括：

```text
1：小明：启用
暂无介绍
学习组件开发
{ read: true, write: false, delete: true }
true
false
{ theme: 'dark', language: 'zh-CN' }
loading
[ 120, 30 ]
```

角色、带角色的用户和分页响应对象也均成功输出。

## 十三、验收结果

- [x] 能使用 `type` 或 `interface` 描述对象结构。
- [x] 能解释必填属性、可选属性和只读属性。
- [x] 能使用索引签名描述动态属性名。
- [x] 能解释 `interface` 与 `type` 的共同点。
- [x] 能说出 `interface` 的声明合并和 `type` 的联合类型、元组能力。
- [x] 能使用 `extends` 和 `&` 扩展结构。
- [x] 能设计用户、角色、递归菜单和分页响应类型。
- [x] 能区分类型位置和值位置。
- [x] 综合代码通过严格类型检查并成功运行。
- [ ] 清理源码中的旧提示注释和多余空行。
- [x] 已添加 `.gitignore`，排除 `node_modules` 和 TypeScript 生成文件。
- [x] 已检查 Git 提交范围，代码与笔记已提交并同步到远程仓库。

当前结论：第 27 天知识、代码、笔记与 Git 验收全部通过。

## 十四、最终评分

| 维度 | 得分 | 说明 |
| --- | ---: | --- |
| 概念理解 | 26 / 30 | 对对象类型、索引签名、声明合并和递归菜单理解正确；类型和值经过纠正后掌握。 |
| 代码实现 | 22 / 25 | 完成用户、角色、菜单、分页和综合数据设计；中间出现数组层级与赋值符号错误。 |
| 调试与验证 | 18 / 20 | 能根据报错修正代码，严格类型检查和实际运行均通过。 |
| 独立表达 | 12 / 15 | 主要概念可以表达；部分答案起初不够准确，纠正后能够复述。 |
| 笔记与提交 | 10 / 10 | 复习笔记、忽略规则、提交范围和远程同步均已检查。 |
| **最终总分** | **88 / 100** | **第 27 天全部验收通过。** |

## 十五、下次复习重点

1. 再用一句话区分“类型”和“值”，避免把 `userWithRoles` 写进类型位置。
2. 看到 `[]` 时先判断业务数据是“一个”还是“多个”，避免给单个对象误加数组。
3. 复习 `interface` 的声明合并与 `type` 的联合类型、元组表达能力。
