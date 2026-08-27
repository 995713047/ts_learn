> 类型从哪来？——这一课讲 TS 如何"猜"类型（推断），以及如何"纠正"它的猜测（断言）。

## 一、类型推断：让 TS 自己猜

TS 非常聪明，大多数时候不用写注解：

```ts
let count = 42          // 推断为 number
let name = 'TS'         // 推断为 string
const arr = [1, 2, 3]   // 推断为 number[]

// 函数返回值自动推断
function add(a: number, b: number) {
  return a + b          // 推断返回 number
}

// 对象属性推断
const user = { name: '小明', age: 20 }
// user.name 是 string，user.age 是 number
```

**几条关键推断规则**：

1. **初始化推断**：声明时给的值决定类型；
2. **最佳公共类型**：数组/联合会取"最具体的公共类型"：
   ```ts
   const x = [1, 'a', true]   // (string | number | boolean)[]
   const y = [1, 2, 3]        // number[]，不会退化成 (number)[]
   ```
3. **上下文类型**：根据"预期位置"推断（如回调参数）：
   ```ts
   const fn: (x: number) => number = (x) => x * 2  // x 自动是 number
   ```

::: tip
**把鼠标悬停在变量上**，编辑器会显示推断出的类型——这是学习推断规则最快的方式。
:::

## 二、字面量拓宽（Literal Widening）

声明为 `let` 时，TS 会把字面量"放宽"：

```ts
let status = 'pending'   // 推断为 string（可被改成任意字符串）
const status2 = 'pending' // 推断为 'pending' 字面量类型（不可变）
```

这就是为什么 `const` 声明能保留更精确的类型。

## 三、类型断言：告诉 TS"我比你更清楚"

```ts
// as 语法（推荐）
const input = document.getElementById('name') as HTMLInputElement
input.value = 'hello'    // 没有断言时 input 是 HTMLElement | null

// 尖括号语法（不推荐，会和 JSX 冲突）
const input2 = <HTMLInputElement>document.getElementById('name')

// 断言"拆开"联合类型
type Fish = { swim(): void }
type Bird = { fly(): void }
declare const pet: Fish | Bird
const fish = pet as Fish   // 告诉编译器"它一定是鱼"
```

::: warning
**断言 ≠ 转换**：`as` 只改变类型视角，不改变运行时值。断言两个完全不相关的类型会报错：

```ts
// const n = '123' as number   // ❌ 报错：转换可能错误
const n = '123' as unknown as number  // 双重断言：强行通过（慎用）
```
:::

## 四、非空断言 !

`!` 表示"我确定这个值不为空"：

```ts
function getFirst(list: string[]): string {
  return list[0]!   // 告诉编译器：数组一定非空
}

const el = document.querySelector('.btn')!  // 一定存在
el.addEventListener('click', () => {})
```

::: warning
`!` 只影响编译期，运行时空值照样崩。**能用收窄就用收窄**，`!` 是"最后的手段"。
:::

## 五、const 断言：锁死字面量

`as const` 让类型"冻结"成最精确的字面量：

```ts
const config = {
  apiUrl: 'https://api.example.com',
  retries: 3
} as const
// config.apiUrl 的类型是 'https://api.example.com'（字面量）
// config.retries 的类型是 3
// 而且整个对象 readonly

const statusList = ['pending', 'paid'] as const
// 类型是 readonly ['pending', 'paid']
// 常用于配合联合类型：
type Status = (typeof statusList)[number]  // 'pending' | 'paid'
```

## 六、场景演练：安全地处理未知数据

::: exercise
从 `localStorage` 读一个用户对象。存储的内容可能是坏的/不完整的。写一个函数安全解析并给出明确错误。
:::

::: solution
```ts
interface StoredUser {
  id: number
  name: string
}

function loadUser(): StoredUser | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)      // 先当作 unknown
    // 用类型守卫做运行时校验（收窄）
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'name' in parsed &&
      typeof (parsed as any).id === 'number' &&
      typeof (parsed as any).name === 'string'
    ) {
      return parsed as StoredUser                 // 通过校验才断言
    }
    return null
  } catch {
    return null
  }
}

// 使用时再配合非空断言/收窄
const user = loadUser()
if (user) {
  console.log(user.name.toUpperCase())
}
```

关键思想：**"先 unknown 收窄，再 as 断言"**——信任边界上的数据，一定要运行时校验后才信。
:::

::: interview
**Q1：类型推断和类型断言的区别？**
A：推断是 TS 根据赋值/上下文自动确定类型；断言是开发者手动告诉 TS"这里就是这个类型"。断言不改变运行时，只影响编译期视角。

**Q2：as const 的作用？**
A：把表达式的类型"冻结"为字面量类型并加 readonly，常用于配置对象、状态列表，以及从数组提取联合类型。

**Q3：as 和 ! 有什么风险？**
A：都是编译期"我保证"机制，运行时不做任何事。断言错误会绕过检查，导致运行时崩溃。原则：优先收窄，其次断言，最后才是 any。
:::

## 📌 小结

- 推断规则：初始化、最佳公共类型、上下文类型
- `const` 保留字面量，`let` 拓宽为宽类型
- `as` 断言、`!` 非空断言、`as const` 冻结——都是编译期机制
- 信任边界（网络/存储/用户输入）的数据：**unknown 收窄 → 运行时校验 → 断言**
