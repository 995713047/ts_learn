> 这一课解锁"类型也能编程"的高级能力：映射类型批量改写属性、内置工具类型全集、声明合并。

## 一、映射类型：批量"改造"属性

核心语法 `{ [K in keyof T]: ... }`——遍历 T 的每个键，生成新类型：

```ts
interface Todo {
  title: string
  desc: string
  done: boolean
}

// 全部变可选
type MutablePartial<T> = { [K in keyof T]?: T[K] }
// 全部变只读
type MutableReadonly<T> = { readonly [K in keyof T]: T[K] }
// 全部值加 null
type Nullable<T> = { [K in keyof T]: T[K] | null }
// 全部变数组
type ToArrays<T> = { [K in keyof T]: T[K][] }

const p: MutablePartial<Todo> = { title: '只填一个' }
```

### 修饰符与重映射

```ts
// 移除修饰符：-? 和 -readonly
type Required<T> = { [K in keyof T]-?: T[K] }
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

// as 重映射：改写键名（TS 4.1+）
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
type G = Getters<Todo>
// { getTitle(): string; getDesc(): string; getDone(): boolean }
```

::: tip
`as` 重映射可以**过滤**键：`as K extends 'done' ? never : K` 会剔除 done。配合模板字面量类型，能实现很多"类型魔法"。
:::

## 二、内置工具类型全集

### 对象形状类

| 工具 | 作用 | 例子 |
| --- | --- | --- |
| `Partial<T>` | 全部可选 | `Partial<Todo>` |
| `Required<T>` | 全部必填 | `Required<{a?: number}>` |
| `Readonly<T>` | 全部只读 | `Readonly<Todo>` |
| `Pick<T, K>` | 挑选部分键 | `Pick<Todo, 'title'>` |
| `Omit<T, K>` | 排除部分键 | `Omit<Todo, 'desc'>` |
| `Record<K, V>` | 构造键值映射 | `Record<'a'|'b', number>` |

```ts
// Record：最常见的"字典"类型
type Role = 'admin' | 'user'
const perms: Record<Role, string[]> = {
  admin: ['create', 'delete'],
  user: ['read']
}

// Pick + Omit 实战：编辑表单只需要部分字段
type TodoForm = Pick<Todo, 'title' | 'desc'>
type TodoId = Omit<Todo, 'desc' | 'done'>
```

### 联合类型类

| 工具 | 作用 |
| --- | --- |
| `Exclude<T, U>` | 从 T 排除 U |
| `Extract<T, U>` | 提取 T 与 U 的交集 |
| `NonNullable<T>` | 去掉 null/undefined |

### 函数类

```ts
type Fn = (a: string, b: number) => boolean

type Params = Parameters<Fn>      // [a: string, b: number]
type Ret = ReturnType<Fn>         // boolean
type First = Params[0]            // string

// 实例类型
class Point { x = 0 }
type Inst = InstanceType<typeof Point>  // Point
```

### 字符串类（TS 4.1+）

```ts
type U = Uppercase<'abc'>      // 'ABC'
type L = Lowercase<'ABC'>      // 'abc'
type C = Capitalize<'hello'>   // 'Hello'
type Uc = Uncapitalize<'Hello'> // 'hello'
```

### 异步类

```ts
type V = Awaited<Promise<Promise<number>>>  // number（递归解开）
```

## 三、手写核心工具类型（面试必背）

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
type MyRecord<K extends keyof any, V> = { [P in K]: V }
type MyExclude<T, U> = T extends U ? never : T
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any
type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never
```

## 四、声明合并

除了 interface 同名合并，还有 namespace 合并：

```ts
// interface + namespace：类型和值共存
interface Product { name: string }
namespace Product {
  export const create = (name: string): Product => ({ name })
}
Product.create('键盘')  // ✓ 命名空间提供"值"

// 函数 + namespace（经典模式）
function format(x: number): string { return String(x) }
namespace format {
  export const pad = (x: number, len: number) =>
    String(x).padStart(len, '0')
}
format.pad(5, 3)   // '005'
```

## 五、场景演练：实体转表单模型

::: exercise
后端实体 `UserEntity` 有很多字段，前端表单只需要部分、且 id 只读。用工具类型组合出表单模型。
:::

::: solution
```ts
interface UserEntity {
  id: number
  name: string
  email: string
  phone: string
  address: string
  createdAt: Date
}

// 表单字段：不需要 id 和 createdAt，且都允许"还没填"
type UserForm = Partial<Omit<UserEntity, 'id' | 'createdAt'>>

// 校验错误：每个字段对应一条错误信息（也可以无）
type FormErrors = Partial<Record<keyof UserForm, string>>

// 展示模型：挑出展示需要的字段并只读
type UserView = Readonly<Pick<UserEntity, 'id' | 'name' | 'email'>>

// 实战组合
const form: UserForm = { name: '小明' }   // ✓ 其他字段可省略
const errors: FormErrors = { email: '格式错误' }
const view: UserView = { id: 1, name: '小明', email: 'x@example.com' }

// 类型组合的"积木感"：用一个工具类型定义出各种变体，而不是重复写接口
```
:::

::: interview
**Q1：什么是映射类型？**
A：`{ [K in keyof T]: ... }` 遍历 T 的键批量生成新类型。Partial/Readonly/Required 都是它的应用。配合 as 可重命名/过滤键。

**Q2：Pick 和 Omit 的区别？**
A：Pick 保留指定键；Omit 删除指定键。Omit = Pick<T, Exclude<keyof T, K>>。

**Q3：Record 有什么用？**
A：构造"键 → 值"的映射类型，如 `Record<Role, string[]>`，比手写索引签名更精确、可枚举。

**Q4：ReturnType / Parameters 怎么实现的？**
A：`T extends (...args: infer P) => infer R ? R : any`——用条件类型 + infer 提取。理解这两个就能举一反三。

**Q5：声明合并有哪些形式？**
A：同名 interface 合并、namespace 与 interface/函数/类合并。常用于库的类型扩展。
:::

## 📌 小结

- 映射类型 `{ [K in keyof T]?: T[K] }`：批量改造属性
- `as` 重映射：改名、过滤键
- 工具类型全家桶：对象类（Partial/Pick/Omit/Record…）、联合类（Exclude/Extract…）、函数类（ReturnType/Parameters…）、字符串类、Awaited
- 手写工具类型是面试高频，务必熟练
