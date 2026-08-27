> 模板字面量类型是 TS 4.1 引入的"字符串类型编程"。它把字符串类型变成可以"拼接"和"解析"的模式——常被称为"字符串体操"。

## 一、基础：字符串拼接

```ts
type World = 'world'
type Greeting = `hello ${World}`   // 'hello world'

// 嵌入的类型可以是联合——结果自动展开
type Size = 'small' | 'large'
type ClassName = `btn-${Size}`      // 'btn-small' | 'btn-large'

// 三明治展开
type Lang = 'zh' | 'en'
type All = `${Size}-${Lang}`        // 4 种组合
// 'small-zh' | 'small-en' | 'large-zh' | 'large-en'
```

::: tip
模板字面量类型的拼接发生在**类型层面**，编译后消失，零运行时开销。常用于生成事件名、CSS 类名、路由路径等。
:::

## 二、内置字符串工具类型

```ts
type U = Uppercase<'abc'>      // 'ABC'
type L = Lowercase<'Hello'>    // 'hello'
type C = Capitalize<'hello'>   // 'Hello'
type Uc = Uncapitalize<'Hello'> // 'hello'
```

配合映射类型，一键生成 getter 命名：

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
interface User { name: string; age: number }
type UserGetters = Getters<User>
// { getName(): string; getAge(): number }
```

## 三、模式匹配：用 infer 解析字符串

模板字面量 + `infer` = 字符串"解构"：

```ts
// 判断字符串是否以某前缀开头
type StartsWith<T extends string, P extends string> =
  T extends `${P}${string}` ? true : false
type A = StartsWith<'getUser', 'get'>   // true

// 提取前缀
type Prefix<T extends string> =
  T extends `${infer P}-${string}` ? P : never
type B = Prefix<'user-id'>    // 'user'

// 提取后缀
type Suffix<T extends string> =
  T extends `${string}-${infer S}` ? S : never
type C = Suffix<'user-id'>    // 'id'

// 移除前缀
type RemovePrefix<T extends string, P extends string> =
  T extends `${P}${infer Rest}` ? Rest : T
type D = RemovePrefix<'getUserName', 'get'>  // 'UserName'
```

## 四、字符串分割（递归）

```ts
// Split<'a-b-c', '-'> = ['a', 'b', 'c']
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S]

type Parts = Split<'a-b-c', '-'>   // ['a', 'b', 'c']

// Join<['a','b'], '-'> = 'a-b'
type Join<T extends string[], D extends string> =
  T extends [infer F extends string, ...infer Rest extends string[]]
    ? Rest extends [] ? F : `${F}${D}${Join<Rest, D>}`
    : ''
```

## 五、场景演练①：类型安全的事件名

::: exercise
一个组件库，事件名为 `on 事件名` 格式（如 `onClick`、`onSubmit`）。定义一个 `Events` 类型：任何合法的 `onXxx` 事件名都能通过检查，并映射出事件处理器的参数类型。
:::

::: solution
```ts
// 事件名白名单（可以来自业务定义）
type KnownEvent = 'click' | 'submit' | 'change'

// 生成合法事件名联合
type EventName = `on${Capitalize<KnownEvent>}`
// 'onClick' | 'onSubmit' | 'onChange'

// 事件 → 参数 映射表
interface EventPayload {
  click: { x: number; y: number }
  submit: { formData: FormData }
  change: { value: string }
}

// 根据事件名反推参数类型
type PayloadOf<N extends EventName> =
  N extends `on${infer E}`
    ? E extends keyof EventPayload
      ? EventPayload[Uncapitalize<E>]   // 转回小写去查表
      : never
    : never

type ClickPayload = PayloadOf<'onClick'>   // { x: number; y: number }

function listen<N extends EventName>(name: N, handler: (p: PayloadOf<N>) => void) {}
listen('onClick', (e) => console.log(e.x, e.y))   // ✓ 类型精确
// listen('onClick', (e) => console.log(e.formData))  // ❌ 类型不匹配
```
:::

## 六、场景演练②：类型安全的路由

::: exercise
路由格式 `/user/:id/order/:oid`，要求：`buildPath` 的参数对象与路由占位符完全匹配，多传/漏传都报错。
:::

::: solution
```ts
// 提取路由参数名：'/user/:id' → ['id']
type RouteParams<S extends string> =
  S extends `${string}/:${infer P}${infer Rest}`
    ? [P, ...RouteParams<Rest>]
    : S extends `:${infer P}` ? [P] : []

// 占位符元组 → 参数对象
type ParamsOf<S extends string> =
  RouteParams<S>[number] extends infer K
    ? K extends string ? { [P in K]: string } : {}
    : {}

type P = ParamsOf<'/user/:id/order/:oid'>  // { id: string; oid: string }

function buildPath<S extends string>(route: S, params: ParamsOf<S>): string {
  return route.replace(/:\w+/g, (m) => {
    const key = m.slice(1)
    return (params as Record<string, string>)[key]
  })
}

const url = buildPath('/user/:id/order/:oid', { id: '7', oid: '99' })
console.log(url)  // '/user/7/order/99'
// buildPath('/user/:id', {})          // ❌ 缺少 id
// buildPath('/user/:id', { id: '1', x: '2' })  // ❌ 多余 x
```
:::

::: interview
**Q1：模板字面量类型能做什么？**
A：在类型层面约束/生成字符串模式：事件名、CSS 类、路由路径、getter 命名等。配合 infer 还能"解析"字符串提取子串。

**Q2：`${infer A}${infer B}` 的匹配规则？**
A：infer 在模板中按"从左到右、贪婪最小"的方式匹配：`${infer A}-${infer B}` 中 A 匹配到第一个 '-' 之前。多个连续 infer 需要小心边界。

**Q3：字符串体操在实际项目中真的用得上吗？**
A：主要用在**库/框架**层（表单校验错误映射、ORM 字段路径、事件系统、路由类型化）。业务代码偶尔用，但理解它是读懂现代 TS 类型库的钥匙。
:::

## 📌 小结

- 模板字面量类型：`` type = `prefix-${T}` ``，联合自动展开
- 字符串工具：Uppercase / Lowercase / Capitalize / Uncapitalize
- infer 模式匹配：StartsWith、Split、RemovePrefix
- 递归字符串类型：Split / Join / 路由参数提取
- 典型应用：事件名、路由、getter 命名、校验错误映射
