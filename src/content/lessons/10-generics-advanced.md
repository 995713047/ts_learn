> 这一课把泛型的"高级形态"打通：`keyof`、索引访问、条件类型 + `infer`、递归类型。学完你就能读懂并写出各种"类型体操"。

## 一、keyof：取"键"的联合

```ts
interface User {
  name: string
  age: number
  email?: string
}
type UserKey = keyof User   // "name" | "age" | "email"

// 动态取属性：K 必须是 T 的键
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
get({ name: 'x' }, 'name')   // string
```

## 二、索引访问类型：T[K]

```ts
type Name = User['name']     // string
type Age = User['age']       // number
type Any = User[keyof User]  // string | number | undefined

// 数组的元素类型
type Arr = (string | number)[]
type El = Arr[number]        // string | number

// 嵌套索引
interface Api {
  data: { list: string[]; total: number }
}
type Total = Api['data']['total']   // number
```

::: tip
`T[K]` 是**索引访问类型**，类似 JS 的 `obj[key]`，但发生在类型层面。它让"类型的形状"可以被查询。
:::

## 三、条件类型：类型层面的 if/else

```ts
type IsString<T> = T extends string ? true : false

type A = IsString<'hello'>   // true
type B = IsString<42>        // false

// 分发（distributive）：联合类型会逐项判断
type ToArray<T> = T extends unknown ? T[] : never
type R = ToArray<string | number>   // string[] | number[]
```

::: warning
**分发**：裸类型参数（没被包在 []/对象里）遇到条件类型时，联合类型会"拆开逐项判断"。想关闭分发可以包一层：`type NoDistribute<T> = [T] extends [unknown] ? T[] : never`。
:::

## 四、infer：从类型中"提取"子类型

`infer` 只能在条件类型的 extends 右侧使用，表示"在这里推断出一个类型变量"：

```ts
// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never
type E1 = ElementType<number[]>        // number
type E2 = ElementType<(string | boolean)[]>  // string | boolean

// 提取函数返回类型（这就是内置 ReturnType 的原理）
type MyReturnType<T> = T extends (...args: never[]) => infer R ? R : never
type R1 = MyReturnType<() => string>   // string

// 提取 Promise 内部类型
type Unwrap<T> = T extends Promise<infer U> ? U : T
type U1 = Unwrap<Promise<number>>      // number
type U2 = Unwrap<Promise<Promise<string>>>  // Promise<string>（只解开一层）

// 递归解开多层
type DeepUnwrap<T> = T extends Promise<infer U> ? DeepUnwrap<U> : T
type U3 = DeepUnwrap<Promise<Promise<string>>>  // string
```

## 五、内置的条件类型三兄弟

```ts
// Exclude<T, U>：从 T 中排除 U
type A = Exclude<'a' | 'b' | 'c', 'a' | 'b'>   // 'c'

// Extract<T, U>：从 T 中提取 U 的部分
type B = Extract<'a' | 'b' | 'c', 'a' | 'c'>   // 'a' | 'c'

// NonNullable<T>：去掉 null / undefined
type C = NonNullable<string | null | undefined>  // string
```

## 六、递归类型：自己引用自己

```ts
// JSON 值：任何 JSON 数据都能用它描述
type JsonValue =
  | string | number | boolean | null
  | JsonValue[]
  | { [key: string]: JsonValue }

// 深层可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
interface Config { server: { host: string; port: number } }
const c: DeepPartial<Config> = { server: { host: 'x' } }  // ✓ port 可省略
```

## 七、场景演练：安全的深层读取

::: exercise
实现 `DeepPick`：`DeepPick<T, 'user.address.city'>` 能提取嵌套属性的类型；再实现一个类型安全的 `getPath` 运行时函数。
:::

::: solution
```ts
// 类型层面：按路径拆分并逐层提取
type PathOf<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T ? PathOf<T[K], Rest> : never
    : P extends keyof T ? T[P] : never

interface Data {
  user: { address: { city: string; zip: number } }
}
type City = PathOf<Data, 'user.address.city'>  // string
type Zip  = PathOf<Data, 'user.address.zip'>   // number

// 运行时：安全的路径读取（任意深度的键路径）
function getPath<T, P extends string>(obj: T, path: P): PathOf<T, P> | undefined {
  const keys = path.split('.')
  let cur: any = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[k]
  }
  return cur
}

const data: Data = { user: { address: { city: '北京', zip: 100000 } } }
const city = getPath(data, 'user.address.city')   // '北京'
// getPath(data, 'user.address.city2')  // ❌ 编译报错：路径不存在
```

`infer K` + `infer Rest` 在模板字面量上做"字符串模式匹配"，一层层剥开路径——这是 `infer` 的典型高级用法。
:::

::: interview
**Q1：keyof 和 T[K] 分别是什么？**
A：keyof T 取所有键的联合；T[K] 是索引访问类型，取键 K 对应的值类型。二者组合可做安全的属性读取。

**Q2：条件类型怎么读？**
A：`T extends U ? X : Y`——"如果 T 是 U 的子类型，结果是 X，否则是 Y"。联合类型会分发逐项判断。

**Q3：infer 的作用和限制？**
A：infer 在条件类型的 extends 右侧声明"待推断的类型变量"，用于从结构里提取子类型（如数组元素、函数返回值、Promise 内部类型）。只能在 extends 右侧使用。

**Q4：ReturnType / Parameters / Awaited 怎么实现的？**
A：都是条件类型 + infer：ReturnType 提取函数返回、Parameters 提取参数元组、Awaited 递归解 Promise。理解了 infer 就能读懂它们的源码。
:::

## 📌 小结

- `keyof T` 键联合；`T[K]` 索引访问类型
- 条件类型 `T extends U ? X : Y`（注意分发行为）
- `infer` 提取子类型：数组元素、函数返回、Promise 值……
- 递归类型：JSON 值、DeepPartial、路径类型
- Exclude / Extract / NonNullable 是内置条件类型
