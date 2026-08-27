> 类在 TS 中同时承担"运行时实现"与"类型形状"两个角色。这一课把修饰符、继承、抽象类、implements 讲透。

## 一、属性与构造函数

```ts
class Person {
  name: string            // 属性必须声明类型
  age: number
  readonly id: number     // 只读：构造时赋值后不可改

  constructor(name: string, age: number, id: number) {
    this.name = name
    this.age = age
    this.id = id
  }

  describe(): string {
    return `${this.name} 今年 ${this.age} 岁`
  }
}

const p = new Person('小明', 20, 1)
console.log(p.describe())
// p.id = 2  // ❌ readonly 不可改
```

**参数属性简写**：构造参数带修饰符，自动声明并赋值：

```ts
class Point {
  constructor(
    public x: number,      // 自动声明 x 并 this.x = x
    public y: number
  ) {}
}
```

## 二、访问修饰符

| 修饰符 | 类内部 | 子类 | 外部 |
| --- | --- | --- | --- |
| `public`（默认） | ✓ | ✓ | ✓ |
| `protected` | ✓ | ✓ | ❌ |
| `private` | ✓ | ❌ | ❌ |

```ts
class Animal {
  public name: string
  protected sound: string      // 子类可见
  private secret: string       // 只有自己可见

  constructor(name: string) {
    this.name = name
    this.sound = '...'
    this.secret = 's'
  }
}

class Dog extends Animal {
  bark() {
    console.log(this.sound)    // ✓ protected 可访问
    // console.log(this.secret) // ❌ private 不可访问
  }
}

const d = new Dog('旺财')
// d.sound   // ❌ protected 外部不可访问
```

::: warning
**TS 的 private 是"编译期"私有**，编译后属性仍在。ES 原生 `#` 私有字段才是运行时私有：

```ts
class Wallet {
  #balance = 0                 // ES 原生私有
  private log: string[] = []   // TS 编译期私有

  deposit(n: number) { this.#balance += n }
  get balance() { return this.#balance }
}
```
:::

## 三、getter / setter

```ts
class Temperature {
  private _celsius = 0

  get celsius(): number {
    return this._celsius
  }
  set celsius(v: number) {
    if (v < -273.15) throw new Error('温度不能低于绝对零度')
    this._celsius = v
  }
  get fahrenheit(): number {
    return this._celsius * 9 / 5 + 32
  }
}

const t = new Temperature()
t.celsius = 25        // 走 setter 校验
console.log(t.fahrenheit)  // 77
```

## 四、静态成员

```ts
class Counter {
  static count = 0                       // 静态属性（类级别）
  static reset() { Counter.count = 0 }   // 静态方法

  increment() { Counter.count++ }
}

const a = new Counter()
a.increment()
console.log(Counter.count)  // 1
```

## 五、继承与 super

```ts
class Base {
  constructor(protected name: string) {}
  greet() { return `你好，${this.name}` }
}

class Derived extends Base {
  constructor(name: string, private level: number) {
    super(name)                 // 必须先 super()
  }
  greet() {
    return super.greet() + `（Lv.${this.level}）`
  }
}
```

## 六、抽象类与抽象方法

`abstract` 类不能直接实例化，作为"模板"被继承；抽象方法子类必须实现：

```ts
abstract class Shape {
  abstract area(): number      // 抽象方法：没有实现

  describe() {                 // 普通方法：共享实现
    return `面积：${this.area()}`
  }
}

class Circle extends Shape {
  constructor(private radius: number) { super() }
  area() { return Math.PI * this.radius ** 2 }
}

class Square extends Shape {
  constructor(private side: number) { super() }
  area() { return this.side ** 2 }
}

// new Shape()  // ❌ 抽象类不能实例化
const shapes: Shape[] = [new Circle(1), new Square(2)]
shapes.forEach(s => console.log(s.describe()))
```

## 七、implements：类实现接口

接口描述"必须长什么样"，类负责实现：

```ts
interface Loggable {
  log(msg: string): void
}

class ConsoleLogger implements Loggable {
  log(msg: string) { console.log('[console]', msg) }
}

class FileLogger implements Loggable {
  log(msg: string) { console.log('[file]', msg) }
}
```

::: tip
implements 只检查"形状"，不强制继承实现。一个类可以实现多个接口：`class X implements A, B {}`。
:::

## 八、场景演练：领域模型

::: exercise
设计一个"订单领域"的类体系：抽象实体基类（id/时间戳）、订单类（状态流转带校验）、订单项类。
:::

::: solution
```ts
// 抽象基类：所有实体的公共部分
abstract class Entity {
  constructor(
    public readonly id: number,
    public createdAt: Date = new Date()
  ) {}
  abstract toJSON(): object
}

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

class OrderItem {
  constructor(
    public name: string,
    public price: number,
    public qty: number = 1
  ) {}
  get total() { return this.price * this.qty }
}

class Order extends Entity {
  private status: OrderStatus = 'pending'
  constructor(id: number, private items: OrderItem[]) {
    super(id)
  }
  get currentStatus() { return this.status }

  pay() {
    if (this.status !== 'pending') throw new Error('只有 pending 才能支付')
    this.status = 'paid'
  }
  ship() {
    if (this.status !== 'paid') throw new Error('只有 paid 才能发货')
    this.status = 'shipped'
  }
  get totalAmount() {
    return this.items.reduce((s, i) => s + i.total, 0)
  }
  toJSON() {
    return {
      id: this.id,
      status: this.status,
      total: this.totalAmount,
      items: this.items.map(i => ({ name: i.name, price: i.price, qty: i.qty }))
    }
  }
}

const order = new Order(1, [new OrderItem('键盘', 299, 1), new OrderItem('鼠标', 99)])
order.pay()
order.ship()
console.log(order.toJSON())
```

这个模型把"状态机"和"金额计算"都封装在类里，外部无法直接改状态——类型 + 封装双保险。
:::

::: interview
**Q1：public/protected/private 的区别？**
A：public 谁都可见；protected 类内和子类可见；private 仅类内可见。注意 TS 的 private 是编译期约束，ES 的 # 才是运行时私有。

**Q2：抽象类和接口的区别？**
A：抽象类可含实现与状态、用 extends 继承（单继承）；接口纯类型约定、可多 implements。模板方法用抽象类，契约用接口。

**Q3：readonly 和 const 的区别？**
A：readonly 用于"属性"（对象/类成员），初始化后不可再赋值，但对象内容可变；const 用于"变量"，绑定不可变。

**Q4：getter/setter 有什么用？**
A：拦截属性读写做校验/计算（如温度校验、派生属性 fahrenheit）。访问方式仍是 `obj.prop`，对外 API 不变。
:::

## 📌 小结

- 参数属性简写：构造参数带修饰符自动赋值
- `public` / `protected` / `private` / `readonly`
- getter/setter、静态成员、继承 + super、抽象类/方法
- `implements` 让类满足接口契约
- 私有化优先考虑 ES `#`（运行时真正私有）
