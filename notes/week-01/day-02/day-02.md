# JavaScript 学习笔记（一）
# 数据类型、typeof、类型转换、数组求和

---

# 一、JavaScript 数据类型

JavaScript 一共有 **8 种数据类型**

| 数据类型 | 示例 | typeof结果 |
|----------|------|------------|
| String（字符串） | `"hello"` | `"string"` |
| Number（数字） | `123` | `"number"` |
| Boolean（布尔） | `true` | `"boolean"` |
| Undefined（未定义） | `undefined` | `"undefined"` |
| Null（空） | `null` | `"object"`（历史遗留问题） |
| Object（对象） | `{}` | `"object"` |
| Symbol（唯一值） | `Symbol()` | `"symbol"` |
| BigInt（大整数） | `10n` | `"bigint"` |

---

# 二、typeof 运算符

用于查看变量的数据类型。

```javascript
console.log(typeof "hello");      // string
console.log(typeof 123);          // number
console.log(typeof true);         // boolean
console.log(typeof undefined);    // undefined
console.log(typeof null);         // object（特殊）
console.log(typeof {});           // object
console.log(typeof []);           // object
console.log(typeof function(){}); // function
console.log(typeof NaN);          // number
console.log(typeof 10n);          // bigint
```

## 注意

### 1、typeof null

```javascript
typeof null
```

结果：

```text
object
```

这是 JavaScript 的历史遗留问题，不代表 null 是对象。

---

### 2、typeof 数组

```javascript
typeof []
```

结果：

```text
object
```

因为数组本质上也是对象。

正确判断数组：

```javascript
Array.isArray(arr)
```

返回：

```javascript
true
false
```

---

### 3、typeof 函数

```javascript
typeof function(){}
```

结果：

```text
function
```

函数是唯一一个 typeof 返回 `"function"` 的对象。

---

### 4、NaN

```javascript
typeof NaN
```

结果：

```text
number
```

NaN 的意思：

> Not a Number（不是一个有效数字）

判断 NaN：

```javascript
Number.isNaN(value)
```

---

# 三、封装数据类型判断函数

学习内容：

利用多个判断，把 JavaScript 类型判断得更准确。

```javascript
function getDataType(value){

    if(value === null){
        return "null";
    }

    if(Array.isArray(value)){
        return "array";
    }

    if(Number.isNaN(value)){
        return "nan";
    }

    return typeof value;

}
```

测试：

```javascript
getDataType("hello")
getDataType(123)
getDataType(true)
getDataType(undefined)
getDataType(null)
getDataType([])
getDataType({})
getDataType(function(){})
getDataType(NaN)
getDataType(10n)
```

输出：

```
string
number
boolean
undefined
null
array
object
function
nan
bigint
```

---

# 四、Number() 类型转换

将其他类型转换为 Number。

```javascript
Number("123")      //123
Number("")         //0
Number("hello")    //NaN
Number(null)       //0
```

总结：

| 原值 | Number()结果 |
|------|--------------|
| `"123"` | 123 |
| `""` | 0 |
| `"hello"` | NaN |
| `null` | 0 |

---

# 五、Boolean() 类型转换

```javascript
Boolean(0)         //false
Boolean("")        //false
Boolean("false")   //true
Boolean([])        //true
```

---

## 转换为 false 的值（牢记）

JavaScript 中只有下面几个值转换后是 false：

```javascript
false
0
-0
0n
""
null
undefined
NaN
```

除了这些，其余基本都为 true。

例如：

```javascript
Boolean([])
Boolean({})
Boolean("false")
Boolean("0")
```

结果都是：

```text
true
```

---

# 六、隐式类型转换

JavaScript 运算时会自动转换类型。

## 字符串拼接

```javascript
1 + "2"
```

结果：

```text
"12"
```

因为数字被转换成字符串。

---

## 减法

```javascript
"5" - 2
```

结果：

```text
3
```

因为字符串会转换成 Number。

---

# 七、== 与 ===

## ==

比较之前会进行类型转换。

例如：

```javascript
0 == false
```

结果：

```text
true
```

因为：

```
false → 0
```

所以：

```
0 == 0
```

---

再例如：

```javascript
"" == false
```

结果：

```text
true
```

---

```javascript
null == undefined
```

结果：

```text
true
```

---

```javascript
"1" == 1
```

结果：

```text
true
```

---

## ===

不会进行类型转换。

要求：

- 类型相同
- 值相同

例如：

```javascript
0 === false
```

结果：

```text
false
```

因为：

```
number
boolean
```

类型不同。

---

完整示例：

```javascript
0 == false          //true
0 === false         //false

"" == false         //true
"" === false        //false

null == undefined   //true
null === undefined  //false

"1" == 1            //true
"1" === 1           //false
```

---

# 八、数组求和练习

题目：

求数组中所有数字的和。

要求：

- 忽略字符串
- 忽略 null
- 忽略 NaN

实现：

```javascript
function sumArray(arr){

    let sum = 0;

    for(let i = 0; i < arr.length; i++){

        const element = arr[i];

        if(typeof element === "number" && !Number.isNaN(element)){
            sum += element;
        }

    }

    return sum;

}
```

测试：

```javascript
sumArray([1,2,3,4])          //10

sumArray([])                 //0

sumArray([-1,2,-3])          //-2

sumArray([1,"2",3,null])     //4

sumArray([1,NaN,2])          //3

sumArray(["1","2"])          //0
```

---

# 九、本次学习重点总结

## 1、typeof

```javascript
typeof value
```

用于查看变量的数据类型。

---

## 2、判断数组

```javascript
Array.isArray(value)
```

---

## 3、判断 NaN

```javascript
Number.isNaN(value)
```

---

## 4、判断 null

```javascript
value === null
```

---

## 5、Number()

用于转换数字。

---

## 6、Boolean()

掌握哪些值转换后为 false：

- false
- 0
- -0
- 0n
- ""
- null
- undefined
- NaN

---

## 7、== 与 ===

**==**

- 会自动转换类型
- 容易出现意料之外的结果

**===**

- 不进行类型转换
- 开发中推荐优先使用

---

## 8、遍历数组

经典写法：

```javascript
for(let i = 0; i < arr.length; i++){

    const element = arr[i];

}
```

---

# 今日收获

✅ 掌握 JavaScript 基本数据类型

✅ 熟悉 typeof 的使用及特殊情况

✅ 学会正确判断数组、null 和 NaN

✅ 理解 Number() 与 Boolean() 的类型转换规则

✅ 理解隐式类型转换

✅ 掌握 == 与 === 的区别

✅ 完成数组求和函数练习

---

