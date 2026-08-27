> 类型系统的"地基"：这一课把 TS 的基础类型一网打尽。学完后你会对"类型即合同"有肌肉记忆。

## 一、三个最常用的基本类型

```ts
const isDone: boolean = false      // 布尔
const count: number = 42           // 数字（含 NaN、Infinity）
const decimal: number = 3.14
const big: bigint = 9007199254740993n  // 大整数
const name: string = 'TypeScript'  // 字符串
const sym: symbol = Symbol('id')   // 唯一标识
```

::: tip
大多数情况下不用写注解，TS 会**自动推断**：
`const count = 42` 自动就是 `number`。把注解当成"合同"，只在关键边界写。
:::

## 二、数组与元组

```ts
// 数组：两种等价写法
const nums1: number[] = [1, 2, 3]
const nums2: Array<number> = [1, 2, 3]   // 泛型写法

// 只读数组：不能 push / 修改
const names: readonly string[] = ['a', 'b']
// names.push('c')  // ❌ 只读数组没有 push

// 元组：固定长度 + 固定位置类型（常用于"一对值"）
const point: [number, number] = [10, 20]
const user: [string, number] = ['小明', 18]

// 可选元素（TS 4+）
const pair: [string, number?] = ['ok']   // 第二个可缺省
```

**数组 vs 元组**：数组是同类型元素的集合，长度不限；元组是"长度和位置都有约定"的列表，像一条"定制的座位表"。

## 三、对象类型

```ts
const user: { name: string; age: number } = {
  name: '小明',
  age: 20
}
// 多一个/少一个属性都会报错
```

对象类型更专业的写法是 `interface`（第 5 课专讲）：

```ts
interface User { name: string; age: number }
const user: User = { name: '小明', age: 20 }
```

## 四、特殊类型：any / unknown / void / never / null / undefined

这是面试的重灾区，务必分清：

| 类型 | 含义 | 能不能随便用 |
| --- | --- | --- |
| `any` | 关闭类型检查，什么都能赋、什么都能调 | ❌ 尽量别用，等于回到 JS |
| `unknown` | "未知"，要先收窄才能用 | ✅ 安全的 any |
| `void` | 函数没有返回值 | ✅ |
| `never` | 永远不会返回（抛错/死循环） | ✅ 特殊场景 |
| `null` / `undefined` | 空值 | 配合 strictNullChecks |

```ts
let a: any = 1
a = '字符串也行'       // ✓ 不报错
a.foo.bar()            // ✓ 也不报错（运行时才崩）——这就是 any 的危险

let u: unknown = 'hello'
// u.toUpperCase()     // ❌ unknown 不能直接调用
if (typeof u === 'string') {
  u.toUpperCase()      // ✓ 收窄之后才行
}

function error(msg: string): never {
  throw new Error(msg) // 永远不会正常返回
}

function loop(): never {
  while (true) {}      // 死循环，也"不返回"
}

let n: void = undefined  // void 只能赋 undefined
```

::: warning
**`null`/`undefined` 是两种不同的类型**。`strictNullChecks` 开启后，`string` 类型变量**不能**赋 `null`，必须写成 `string | null`。这是消灭空指针 bug 的关键设计。
:::

## 五、枚举 enum

```ts
// 数字枚举：默认从 0 开始
enum Direction { Up, Down, Left, Right }
console.log(Direction.Up)     // 0
console.log(Direction[0])     // "Up"（反向映射）

// 手动赋值
enum Color { Red = 1, Green = 2, Blue = 4 }

// 字符串枚举（更常用，值可读）
enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Shipped = 'shipped'
}
console.log(OrderStatus.Paid) // "paid"

// 常量枚举：编译时直接内联，不产生对象
const enum PI { Three = 3 }
```

::: warning
enum 会生成**运行时对象**（不是纯类型），且数字枚举允许"任意数字"赋值（如 `Direction[99]` 不报错）。新代码中，很多团队更推荐用**字符串字面量联合**替代 enum：

```ts
type OrderStatus = 'pending' | 'paid' | 'shipped'  // 更简单、更安全
```
:::

## 六、字面量类型与类型别名

```ts
// 字面量类型：把"具体的值"当作类型
type Status = 'pending' | 'paid'   // 字符串字面量联合
type Code = 200 | 404 | 500        // 数字字面量联合
let s: Status = 'pending'
// s = 'done'  // ❌ 不在联合里

// 类型别名：给类型起名字，方便复用
type UserId = number
type Callback = (msg: string) => void
```

## 七、场景演练：建模订单状态机

::: exercise
为电商订单设计类型：状态只能是 `pending | paid | shipped | cancelled` 之一；订单必须含订单号（字符串）、金额（数字）、可选的优惠券码。
:::

::: solution
```ts
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

interface Order {
  id: string            // 订单号
  amount: number        // 金额
  status: OrderStatus   // 状态机
  coupon?: string       // 可选优惠券码
  createdAt: Date
}

// 使用：非法状态在编译期就被拦下
const order: Order = {
  id: 'ORD-2024-001',
  amount: 99.9,
  status: 'paid',
  createdAt: new Date()
}
// order.status = 'done'  // ❌ 编译报错
```
:::

::: interview
**Q1：any 和 unknown 的区别？**
A：any 关闭类型检查，可随意赋值/调用；unknown 是"类型安全的 any"，必须先收窄（typeof 等）才能使用。项目规范应禁止 any，用 unknown 代替。

**Q2：void 和 never 的区别？**
A：void 表示"返回 undefined，函数正常结束"；never 表示"永远不会返回"（抛异常、死循环）。never 还能表示"不可能的值"，用于穷尽检查。

**Q3：元组和数组的区别？**
A：数组元素类型一致、长度不限；元组固定长度和每个位置的类型，适合表示"一对值"（如坐标、键值对）。

**Q4：枚举有什么坑？**
A：数字枚举生成运行时对象且有反向映射，允许越界数字赋值；const enum 会内联但破坏了某些工具链。很多团队用字符串字面量联合替代。
:::

## 📌 小结

- 基础类型：`boolean` `number` `string` `bigint` `symbol`
- 集合：数组（`T[]`）、只读数组、元组（`[A, B]`）
- 特殊类型：`any`（危险）、`unknown`（安全）、`void`、`never`
- `strictNullChecks` 让 `null`/`undefined` 显式化
- 用**字符串字面量联合**建模业务枚举更安全
