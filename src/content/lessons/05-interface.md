> 接口是 TS 描述"对象形状"的主力。这一课把它讲透：可选、只读、索引签名、继承、声明合并，以及和 type 的抉择。

## 一、基本用法：对象的"合同"

```ts
interface User {
  id: number
  name: string
  age?: number                 // 可选：可以没有
  readonly email: string       // 只读：初始化后不能改
  greet(msg: string): string   // 方法
}

const u: User = {
  id: 1,
  name: '小明',
  email: 'x@example.com',
  greet: (m) => m + '!'
}
// u.email = 'y'   // ❌ 只读
```

**结构化类型（鸭子类型）**：只要"形状"匹配就行，不要求同一个类：

```ts
class Person {
  constructor(public id: number, public name: string, public email: string, public age?: number) {}
  greet(msg: string) { return msg }
}
const u2: User = new Person(2, '小红', 'h@example.com')  // ✓ 形状匹配即可
```

## 二、索引签名：描述"键值表"

```ts
// 所有键都是 string，值都是 number
interface Dict {
  [key: string]: number
}
const scores: Dict = { math: 90, english: 85 }

// 数字索引：类似数组
interface StringArray {
  [index: number]: string
}
const names: StringArray = ['a', 'b']

// 混合：同时有固定属性和索引签名（值类型必须兼容）
interface Book {
  title: string
  [key: string]: string | number   // 其它任意键的值也得是 string | number
}
```

::: warning
索引签名要求**所有属性（含固定属性）的值类型都兼容**索引的值类型，否则报错。
:::

## 三、函数类型

```ts
interface SearchFn {
  (source: string, sub: string): boolean
}
const contains: SearchFn = (s, sub) => s.includes(sub)

// 也可以直接用类型别名（更简洁）
type SearchFn2 = (source: string, sub: string) => boolean
```

## 四、继承（extends）

接口可以继承接口，也可以多继承：

```ts
interface Base { id: number }
interface Timestamped { createdAt: Date; updatedAt: Date }

interface Product extends Base, Timestamped {
  name: string
  price: number
}

const p: Product = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: '键盘',
  price: 299
}
```

也可以继承类（继承类的"形状"，含私有成员时有限制）：

```ts
class Point { x = 0; y = 0 }
interface Point3D extends Point { z: number }
```

## 五、声明合并：同名接口自动合并

```ts
interface Window { }
interface Window { myGlobal: string }
// 上面两个 Window 合并为一个，含 myGlobal
```

::: tip
声明合并是 interface 的**独有特性**，type 不能重复声明。这也是给第三方库"打补丁"的常用手段。
:::

## 六、interface vs type：怎么选？

| 维度 | interface | type alias |
| --- | --- | --- |
| 描述对象 | ✅ 强项 | ✅ |
| 联合/交叉/元组 | ❌ 不行 | ✅ 强项 |
| 声明合并 | ✅ 支持 | ❌ 不支持 |
| 继承 | `extends` | `&` 交叉 |
| 类实现 | `implements` | 也可以 |
| 工具类型操作 | 一般 | 灵活 |

**业界主流建议**（TS 官方手册也这么说）：

- 描述**对象/类**的形状 → 优先 `interface`
- 需要**联合类型、交叉、元组、工具类型操作** → 用 `type`
- 库的作者 → 用 `interface`（方便用户扩展合并）

```ts
// type 适合的场景
type ID = string | number            // 联合
type Point = { x: number } & { y: number }  // 交叉
type Pair = [string, number]          // 元组
type PartialUser = Partial<User>      // 工具类型
```

## 七、场景演练：设计用户中心的数据模型

::: exercise
设计一个用户中心的类型体系：基础用户、带角色的管理员、用户配置。要求体现：可选、只读、继承、方法。
:::

::: solution
```ts
interface BaseUser {
  readonly id: number          // 只读：用户 id 不可改
  name: string
  avatar?: string              // 可选
  login(): void
}

// 角色用字面量联合
type Role = 'user' | 'admin' | 'super_admin'

interface AdminUser extends BaseUser {
  role: Role                   // 管理员有角色
  permissions: string[]        // 权限列表
  ban(targetId: number): void
}

interface UserConfig {
  theme: 'light' | 'dark'
  notifications: boolean
}

// 使用
function renderUser(u: BaseUser) {
  console.log(u.name)
  u.login()
}

const admin: AdminUser = {
  id: 1,
  name: '管理员',
  role: 'admin',
  permissions: ['order:read', 'user:ban'],
  login: () => console.log('登录'),
  ban: (id) => console.log('封禁', id)
}
renderUser(admin)   // AdminUser 是 BaseUser 的子类型，可直接传入
```
:::

::: interview
**Q1：interface 和 type 的区别？**
A：interface 支持声明合并、更适合对象与类实现；type 更灵活（联合/交叉/元组/工具类型）。对象优先 interface，复杂类型用 type。

**Q2：什么是结构化类型？**
A：TS 判断兼容性看"形状"而非"血缘"。只要属性与类型匹配（含多余属性检查例外），不同类/接口之间也能互相赋值，这叫鸭子类型/结构化类型。

**Q3：索引签名有什么限制？**
A：键只能是 string / number / symbol；固定属性的值类型必须兼容索引值的类型；空对象字面量赋给有索引签名的类型会报错。

**Q4：声明合并是什么？**
A：同名 interface 多次声明自动合并为一个。常用于扩展全局对象（如 Window）或给第三方库补类型。
:::

## 📌 小结

- interface 描述对象形状：可选 `?`、只读 `readonly`、方法
- 索引签名 `[key: string]: T` 描述键值表
- 接口可以 `extends` 继承、可以声明合并
- 抉择：**对象用 interface，复杂类型用 type**
- TS 是结构化类型：形状匹配即可
