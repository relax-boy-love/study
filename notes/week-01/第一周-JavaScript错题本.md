# 第一周 JavaScript 错题本

## 1. Array.isArray

错误预测：一个对象使用这个我的判断是true

正确结果：false

错误原因：Array.isArray只判断数组

我现在的理解：Array.isArray判断是否是数组


## 2. Number("hello")

错误预测：  null

正确结果：  NaN

错误原因：字符串 "hello" 不能转换成有效数字，所以结果是 NaN。

我现在的理解：Number() 转换无法解析为有效数字的普通字符串时，结果是 NaN；但空字符串、null和布尔值有各自的数字转换规则。


## 3. Boolean("0")

错误预测：false

正确结果：true

错误原因："0"虽然内容看起来是数字0，但它是一个非空字符串。所有非空字符串转换为Boolean后都是true。

我现在的理解：Boolean判断字符串时主要看它是不是空字符串，不看字符串里面写的是什么。"0"和"false"都是非空字符串，所以都是true。

## 4. "10" - null

错误预测：不知道

正确结果：10

转换过程：减法运算会把两边转换为数字。Number("10")是10，Number(null)是0，所以结果是10 - 0，也就是10。

我现在的理解：减法通常会把操作数转换成数字；null转换为数字是0。


## 5. 严格模式下的 this

错误理解：直接调用普通函数时，this指向window。

正确理解：严格模式下直接调用普通函数，this是undefined；非严格模式的浏览器普通脚本中，this通常是window。

为什么提取对象方法后会丢失this：this由调用方式决定。user.showName()是对象方法调用，this指向user；把方法赋值给show后执行show()，它变成普通函数直接调用，前面没有user作为调用者，所以不会继续指向user。


## 6. prototype、__proto__、constructor

prototype属于谁： 构造函数或class

实例的__proto__指向哪里： 构造函数.prototype

原型对象的constructor指向哪里：对应的构造函数


## 7. super() 与 this

错误理解：调用super()前，this指向原型对象。

正确理解：在继承父类的子类constructor中，调用super()之前，this还没有完成初始化，不能访问this。

为什么必须先调用super()：super()会调用父类的constructor，并初始化当前正在创建的子类实例。初始化完成后，子类constructor才能使用this给实例添加自己的属性。