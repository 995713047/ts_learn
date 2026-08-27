> 泛型是 TS 类型系统的"灵魂"。它让"类型"本身也能像参数一样被复用——**写一次，适用于任意类型，同时保持类型关系不丢失**。

## 一、为什么需要泛型？

看这个需求：实现一个"取出数组第一个元素"的函数。

**用 any 写**——类型关系丢了：

```ts
function first(arr: any[]): any {
  return arr[0]
}
const n = first([1, 2, 3])
n.toUpperCase()   // 编译不报错，运行时崩！类型安全归零
```

**为每种类型各写一个**——代码爆炸：

```ts
function firstNumber(arr: number[]): number { return arr[0] }
function firstString(arr: string[]): string { return arr[0] }
```

**用泛型**——输入输出类型关系自动保持：

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const n = first([1, 2, 3])      // T 推断为 number，n: number | undefined
const s = first(['a', 'b'])     // T 推断为 string，s: string | undefined
```

::: tip
`<T>` 里的 T 就是**类型参数**——调用时由编译器根据实参推断（也可以显式指定 `first<number>([1])`）。习惯上 T/U/V 或 K（键）/V（值）。
:::

## 二、泛型可以出现在哪里？

### 1. 泛型函数（含箭头函数）

```ts
function identity<T>(x: T): T { return x }
const identity2 = <T>(x: T): T => x   // 箭头函数
```

### 2. 泛型接口

```ts
interface Box<T> {
  value: T
}
const numBox: Box<number> = { value: 42 }
const strBox: Box<string> = { value: 'hi' }

// 泛型接口可以继承/约束
interface Pair<A, B> { first: A; second: B }
```

### 3. 泛型类型别名

```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: string }
const r: Result<number> = { ok: true, data: 100 }
```

### 4. 泛型类

```ts
class Stack<T> {
  private items: T[] = []
  push(item: T) { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
}

const s = new Stack<number>()
s.push(1)
// s.push('x')  // ❌ 类型错误
```

## 三、泛型约束（extends）

`T extends X` 表示"T 必须是 X 或其子类型"：

```ts
// 约束：T 必须有 length 属性
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
longest('abc', 'de')        // ✓ 字符串有 length
longest([1, 2], [3])        // ✓ 数组有 length
// longest(1, 2)            // ❌ number 没有 length

// 约束 + keyof：安全读取对象属性
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { name: '小明', age: 20 }
getValue(user, 'name')   // string
getValue(user, 'age')    // number
// getValue(user, 'xxx') // ❌ 'xxx' 不是 user 的键
```

## 四、默认类型参数

```ts
interface Config<T = string> {
  value: T
}
const c1: Config = { value: '默认 string' }      // 不指定时用默认
const c2: Config<number> = { value: 42 }
```

## 五、泛型中的"类型参数命名"约定

| 命名 | 习惯含义 |
| --- | --- |
| T / U / V | 任意类型 |
| K | 键（key） |
| V | 值（value） |
| E | 元素（element） |
| R | 返回类型（result） |
| P / Props | 属性/参数 |

## 六、常见误区

::: warning
**误区 1：`extends` 在泛型里是"约束"，不是"继承"**——它表示子类型关系。

**误区 2：泛型约束只约束"输入"**——输出也要正确使用 T：

```ts
function bad<T>(x: T): T {
  // return x.toUpperCase()  // ❌ 编译报错：T 没保证有 toUpperCase
  return x
}
```

**误区 3：不要为了"灵活"用 any 替代泛型**——any 会切断类型链条。
:::

## 七、场景演练：类型安全的缓存

::: exercise
实现一个泛型 `createCache`：`get`/`set`/`clear`，且每个 key 与 value 类型保持关联。
:::

::: solution
```ts
function createCache<T>() {
  const store = new Map<string, T>()

  return {
    set(key: string, value: T) { store.set(key, value) },
    get(key: string): T | undefined { return store.get(key) },
    has(key: string) { return store.has(key) },
    clear() { store.clear() }
  }
}

const userCache = createCache<{ name: string }>()
userCache.set('u1', { name: '小明' })
const u = userCache.get('u1')       // { name: string } | undefined
// userCache.set('u1', 42)          // ❌ 类型错误

const numCache = createCache<number>()
numCache.set('score', 100)
```

泛型让"一个实现，多种安全用法"成为可能——这就是类型复用的力量。
:::

::: interview
**Q1：泛型解决了什么问题？**
A：在不使用 any（丢失类型安全）的前提下，让函数/接口/类适用于多种类型，并**保持输入与输出的类型关系**。

**Q2：泛型约束怎么写？**
A：`T extends Constraint`，表示 T 必须是 Constraint 的子类型。常配合 `keyof`：`K extends keyof T`。

**Q3：泛型和 any 的区别？**
A：any 切断类型检查；泛型在调用时才确定具体类型并**全程保持检查**。泛型是"带关系的类型复用"，any 是"放弃类型"。

**Q4：怎么显式指定类型参数？**
A：`fn<number>(arg)`。通常可以省略让编译器推断；推断不出来或想强制时显式指定。
:::

## 📌 小结

- `<T>` 类型参数：写一次，适用所有类型，关系不丢
- 可用于函数、接口、类型别名、类
- `T extends X` 约束子类型关系；`K extends keyof T` 约束键
- 默认类型参数 `= T`
- 泛型 ≠ any：泛型保持检查，any 放弃检查
