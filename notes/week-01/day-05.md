第 5 天：原型、原型链与类

## 今日学习目标

- 理解构造函数、实例与 `prototype` 的关系
- 理解 `__proto__`、`Object.getPrototypeOf()` 和完整原型链
- 理解属性遮蔽
- 使用原型链实现继承
- 理解 ES6 `class`、`extends` 和 `super`
- 手写简化版 `myNew`
- 手写简化版 `myInstanceof`

---

## 一、构造函数与 prototype

### 1. 构造函数

```js
function Person(name) {
    this.name = name;
}

const personA = new Person("小明");
const personB = new Person("小红");
```

使用 `new Person()` 时会创建不同的实例，所以：

```js
personA !== personB; // true
```

`this.name = name` 添加的是实例自身属性：

```text
personA
└── name："小明"

personB
└── name："小红"
```

### 2. 方法写在构造函数中的问题

```js
function Person(name) {
    this.name = name;

    this.sayHello = function () {
        return "你好，我是" + this.name;
    };
}
```

每执行一次 `new Person()`，都会创建一个新的 `sayHello` 函数：

```js
personA.sayHello === personB.sayHello; // false
```

如果创建一万个实例，就会创建一万个函数。

### 3. 把共享方法放在 prototype 上

```js
function Person(name) {
    this.name = name;
}

Person.prototype.sayHello = function () {
    return "你好，我是" + this.name;
};
```

此时所有实例共享同一个方法：

```js
personA.sayHello === personB.sayHello; // true
```

注意：

- `name` 保存在实例自身。
- `sayHello` 保存在 `Person.prototype`。
- 调用 `personA.sayHello()` 时，`this` 仍然指向 `personA`。

---

## 二、prototype、__proto__ 与 constructor

### 1. 三者的关系

```js
function Person(name) {
    this.name = name;
}

const personA = new Person("小明");
```

关系如下：

```text
Person构造函数
    │
    │ prototype
    ▼
Person.prototype
    │
    │ constructor
    ▼
Person构造函数

personA实例
    │
    │ __proto__
    ▼
Person.prototype
```

对应代码：

```js
personA.__proto__ === Person.prototype; // true
Object.getPrototypeOf(personA) === Person.prototype; // true
Person.prototype.constructor === Person; // true
```

现代代码推荐使用：

```js
Object.getPrototypeOf(personA);
```

`__proto__` 主要用于帮助理解原型关系。

### 2. prototype 和 __proto__ 的区别

- `prototype`：构造函数拥有的属性，指向它的原型对象。
- `__proto__`：实例通向其原型对象的连接。

一句话记忆：

```text
实例.__proto__ === 构造函数.prototype
```

---

## 三、完整的原型链

```text
personA
   ↓
Person.prototype
   ↓
Object.prototype
   ↓
null
```

对应代码：

```js
Object.getPrototypeOf(personA) === Person.prototype;
Object.getPrototypeOf(Person.prototype) === Object.prototype;
Object.getPrototypeOf(Object.prototype) === null;
```

`null` 表示原型链已经到达终点。

### 属性和方法的查找顺序

读取：

```js
personA.sayHello
```

JavaScript 会按照下面的顺序寻找：

```text
1. personA自身
2. Person.prototype
3. Object.prototype
4. null，停止查找
```

找到后立即停止；到达 `null` 仍然没有找到，则结果为 `undefined`。

---

## 四、hasOwnProperty 与 in

### hasOwnProperty

只检查指定对象自身，不检查原型链：

```js
personA.hasOwnProperty("name");     // true
personA.hasOwnProperty("sayHello"); // false
```

### in

先检查对象自身，再沿原型链查找：

```js
"name" in personA;     // true
"sayHello" in personA; // true
```

区别：

```text
hasOwnProperty → 只查自身
in             → 查自身和整条原型链
```

---

## 五、属性遮蔽

```js
function Person(name) {
    this.name = name;
}

Person.prototype.role = "普通用户";

const personA = new Person("小明");
const personB = new Person("小红");

personA.role = "管理员";
```

此时：

```text
personA自身
├── name："小明"
├── role："管理员"
└── 原型 → Person.prototype
             └── role："普通用户"

personB自身
├── name："小红"
└── 原型 → Person.prototype
             └── role："普通用户"
```

实例自身的 `role` 遮住了原型上的同名属性，但没有修改原型：

```js
personA.role; // "管理员"
personB.role; // "普通用户"
```

删除实例自身属性：

```js
delete personA.role;
```

再次访问 `personA.role` 时，实例自身找不到，于是重新沿原型链找到 `"普通用户"`。

方法也可以发生遮蔽：

```js
personA.sayHello = function () {
    return "实例自己的方法";
};
```

此时 `personA` 使用自身方法，其他实例仍然使用原型方法。

---

## 六、使用原型链实现继承

```js
function User(name) {
    this.name = name;
}

User.prototype.sayHello = function () {
    return "你好，我是" + this.name;
};

function Admin(name, role) {
    User.call(this, name);
    this.role = role;
}

Admin.prototype = Object.create(User.prototype);
Admin.prototype.constructor = Admin;

Admin.prototype.manage = function () {
    return this.name + "正在管理系统";
};
```

### 1. 继承实例属性

```js
User.call(this, name);
```

作用：

- 执行 `User` 构造函数。
- 让 `User` 中的 `this` 指向当前管理员实例。
- 给管理员实例添加 `name`。

一句话记忆：

```text
call复用父构造函数，获得实例属性。
```

### 2. 继承原型方法

```js
Admin.prototype = Object.create(User.prototype);
```

作用：

- 创建新的 `Admin.prototype`。
- 让它的原型指向 `User.prototype`。
- 使管理员实例可以沿原型链找到 `sayHello`。

不要直接写：

```js
Admin.prototype = User.prototype;
```

否则两个构造函数会直接共用同一个原型对象。

### 3. 修复 constructor

替换 `Admin.prototype` 后需要修复：

```js
Admin.prototype.constructor = Admin;
```

否则它继承到的 `constructor` 会指向 `User`。

### 4. 继承后的原型链

```text
admin实例
├── name
├── role
│
└── 原型 → Admin.prototype
             ├── manage()
             ├── constructor → Admin
             │
             └── 原型 → User.prototype
                          ├── sayHello()
                          ├── constructor → User
                          │
                          └── 原型 → Object.prototype
                                       ↓
                                      null
```

---

## 七、ES6 class

`class` 是更清晰的构造函数和原型语法，底层仍然使用原型机制。

```js
class User {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    introduce() {
        return "我是" + this.name + "，今年" + this.age + "岁";
    }
}
```

### constructor

使用 `new User()` 创建实例时自动执行：

```js
const user = new User("小明", 20);
```

`constructor` 中的：

```js
this.name
this.age
```

保存在实例自身。

### 类中的普通方法

```js
introduce() {}
```

实际保存在：

```js
User.prototype
```

因此：

```js
user.hasOwnProperty("introduce"); // false
```

---

## 八、class 继承：extends 与 super

```js
class Admin extends User {
    constructor(name, age, permission) {
        super(name, age);
        this.permission = permission;
    }

    deleteUser(username) {
        return this.name + "删除了用户：" + username;
    }
}
```

### extends

```js
class Admin extends User
```

负责建立子类与父类的继承关系，让管理员实例可以沿原型链使用 `User.prototype` 上的方法。

### super

```js
super(name, age);
```

调用父类 `User` 的 `constructor`，为当前管理员实例初始化 `name` 和 `age`。

派生类的 `constructor` 中，必须先调用 `super()`，才能使用 `this`：

```text
进入子类constructor
        ↓
this暂时不能使用
        ↓
调用super()
        ↓
父类constructor初始化当前实例
        ↓
现在可以使用this
```

### 旧写法与 class 对应关系

| 原型写法 | class 写法 | 作用 |
|---|---|---|
| `function User(){}` | `class User {}` | 定义构造方式 |
| 构造函数中的 `this.name` | `constructor` 中的 `this.name` | 添加实例属性 |
| `User.prototype.say()` | 类中的 `say(){}` | 添加原型方法 |
| `Object.create(User.prototype)` | `extends User` | 建立继承关系 |
| `User.call(this, name)` | `super(name)` | 执行父类构造逻辑 |

注意：类名通常使用大驼峰命名，应写 `User7`，不要混用 `user7` 和 `User7`。JavaScript 严格区分大小写。

---

## 九、手写简化版 myNew（重点）

普通调用：

```js
const person = new Person("小明", 20);
```

手写调用：

```js
const person = myNew(Person, "小明", 20);
```

参数对应关系：

```text
Constructor → Person
args        → ["小明", 20]
```

### 1. 基础版本

```js
function myNew(Constructor, ...args) {
    const newObject = Object.create(Constructor.prototype);

    Constructor.call(newObject, ...args);

    return newObject;
}
```

### 2. 逐行理解

第一行：

```js
const newObject = Object.create(Constructor.prototype);
```

作用：

```text
创建新对象
并让新对象的原型指向Constructor.prototype
```

解决的问题：

> 新对象应该从哪里继承原型方法？

第二行：

```js
Constructor.call(newObject, ...args);
```

假设调用：

```js
myNew(Person, "小明", 20);
```

这一行相当于：

```js
Person.call(newObject, "小明", 20);
```

它让构造函数中的 `this` 指向 `newObject`：

```js
this.name = name;
this.age = age;
```

相当于：

```js
newObject.name = "小明";
newObject.age = 20;
```

解决的问题：

> 怎样给新对象添加构造函数中定义的实例属性？

第三行：

```js
return newObject;
```

把创建并初始化完成的实例交给外面的变量。

### 3. 一句话记忆

```text
Object.create连接原型，
call添加实例属性，
return交出实例。
```

### 4. 增强版：处理构造函数返回值

```js
function myNew2(Constructor, ...args) {
    const newObject = Object.create(Constructor.prototype);

    const result = Constructor.call(newObject, ...args);

    const isObject =
        result !== null &&
        (typeof result === "object" || typeof result === "function");

    if (isObject) {
        return result;
    }

    return newObject;
}
```

规则：

```text
构造函数主动返回对象或函数
→ result胜出

构造函数返回基本类型、null或undefined
→ 忽略result，newObject胜出
```

示例：

```js
function Product(name) {
    this.name = name;
    return 100;
}
```

数字不能替代实例，所以最终返回带有 `name` 的 `newObject`。

```js
function SpecialProduct(name) {
    this.name = name;

    return {
        name: "构造函数主动返回的对象"
    };
}
```

主动返回的是对象，所以最终采用这个对象。

---

## 十、手写简化版 myInstanceof（重点）

`instanceof` 检查的不是属性是否相同，而是：

> `Constructor.prototype` 是否存在于 `object` 的原型链上？

### 1. 基础代码

```js
function myInstanceof(object, Constructor) {
    let currentPrototype = Object.getPrototypeOf(object);
    const targetPrototype = Constructor.prototype;

    while (currentPrototype !== null) {
        if (currentPrototype === targetPrototype) {
            return true;
        }

        currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    return false;
}
```

### 2. 两个重要变量

```js
let currentPrototype = Object.getPrototypeOf(object);
```

表示当前检查到原型链的哪一层。

```js
const targetPrototype = Constructor.prototype;
```

表示需要寻找的目标。

### 3. 查找过程

```js
function Person(name) {
    this.name = name;
}

const person = new Person("小明");
```

原型链：

```text
person
   ↓
Person.prototype
   ↓
Object.prototype
   ↓
null
```

执行：

```js
myInstanceof(person, Person);
```

寻找的是 `Person.prototype`，第一层就能找到，因此返回 `true`。

执行：

```js
myInstanceof(person, Object);
```

寻找的是 `Object.prototype`，继续向上一层能够找到，因此返回 `true`。

执行：

```js
myInstanceof(person, Animal);
```

如果一直走到 `null` 仍然没有找到 `Animal.prototype`，返回 `false`。

### 4. 一句话记忆

```text
从对象的直接原型开始，
一层一层寻找Constructor.prototype；
找到返回true，到null仍未找到就返回false。
```

### 5. 常见错误

错误：

```js
Object.getPrototypeOf(object.prototype);
```

`object` 是实例，实例通常没有 `prototype` 属性。应该写：

```js
Object.getPrototypeOf(object);
```

循环中也不能固定获取某一个原型：

```js
Object.getPrototypeOf(Person.prototype);
```

应该根据当前位置继续向上：

```js
Object.getPrototypeOf(currentPrototype);
```

---

## 十一、最终完整关系图

```text
admin实例
├── name："小明"
├── age：20
├── permission："all"
│
└── 原型 → Admin.prototype
             ├── deleteUser()
             ├── constructor → Admin
             │
             └── 原型 → User.prototype
                          ├── introduce()
                          ├── constructor → User
                          │
                          └── 原型 → Object.prototype
                                       │
                                       └── 原型 → null
```

验证代码：

```js
Object.getPrototypeOf(admin) === Admin.prototype;
Object.getPrototypeOf(Admin.prototype) === User.prototype;
Object.getPrototypeOf(User.prototype) === Object.prototype;
Object.getPrototypeOf(Object.prototype) === null;
```

---

## 十二、今日易错点

### 易错点 1：共享原型方法

当方法保存在 `Person.prototype` 时：

```js
personA.sayHello === personB.sayHello; // true
```

两个实例沿原型链找到了同一个函数。

### 易错点 2：hasOwnProperty

类中定义的普通方法保存在原型上：

```js
user.hasOwnProperty("introduce"); // false
User.prototype.hasOwnProperty("introduce"); // true
```

### 易错点 3：原型链向上移动

应该对当前原型继续取原型：

```js
currentPrototype = Object.getPrototypeOf(currentPrototype);
```

### 易错点 4：class 名称大小写

```js
class User7 {}
class Admin7 extends User7 {}
```

`user7` 与 `User7` 是两个不同的标识符。

### 易错点 5：myNew 的返回值

```text
result是对象或函数 → 返回result
否则             → 返回newObject
```

---

## 十三、复习自测

1. 实例的 `__proto__` 通常指向哪里？
2. 构造函数的 `prototype` 与原型对象的 `constructor` 是什么关系？
3. `hasOwnProperty` 和 `in` 有什么区别？
4. 什么是属性遮蔽？
5. 原型链的终点是什么？
6. `User.call(this, name)` 负责什么？
7. `Object.create(User.prototype)` 负责什么？
8. 类中的普通方法保存在实例还是原型上？
9. `extends` 和 `super()` 分别负责什么？
10. `myNew` 中 `Object.create()`、`call()` 和 `return` 分别负责什么？
11. 构造函数主动返回对象时，`new` 最终采用哪个对象？
12. `myInstanceof` 在原型链上寻找什么？

---

## 十四、今日背诵版

```text
1. 实例.__proto__ === 构造函数.prototype
2. 原型对象.constructor === 构造函数
3. 属性查找先找自身，再沿原型链向上，终点是null
4. hasOwnProperty只查自身，in查自身和原型链
5. 实例同名属性会遮蔽原型属性，但不会修改原型
6. call复用父构造函数，Object.create建立继承原型链
7. class底层仍然基于原型
8. extends建立继承关系，super调用父类constructor
9. myNew：连接原型、执行构造函数、返回实例
10. myInstanceof：沿原型链寻找Constructor.prototype
```
