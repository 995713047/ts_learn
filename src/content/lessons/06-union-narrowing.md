> 联合类型是 TS 处理"多种可能"的核心工具，而**类型收窄**是使用联合类型的必备技能。这一课把它们练成肌肉记忆。

## 一、联合类型：或

```ts
let id: string | number = 'abc'   // 可以是字符串或数字
id = 123                          // ✓
// id = true                     // ❌ 布尔不行

// 数组元素也可以是联合
const values: (string | number)[] = ['a', 1, 'b', 2]
```

::: tip
联合类型用 `|`（或）。`string | number` 读作"string 或 number"。`null` 通常也和值类型组成联合：`string | null`。
:::

## 二、交叉类型：且

```ts
type A = { name: string }
type B = { age: number }
type AB = A & B   // 同时具有 A 和 B 的所有属性

const ab: AB = { name: 'x', age: 1 }   // 两个都要有

// 冲突属性的处理：交叉取"交集"（无法同时满足时变成 never）
type X = { a: string } & { a: number }  // a: string & number ≈ never
```

## 三、类型收窄（Narrowing）

**问题**：`string | number` 的变量，能直接调用 `.length` 吗？——不行，因为 `number` 没有 `length`。必须先**收窄**。

收窄 = 通过条件判断，让编译器知道"在这个分支里，类型更具体"。

### 1. typeof 收窄

```ts
function printLen(x: string | number) {
  if (typeof x === 'string') {
    console.log(x.length)      // 这里 x 是 string
  } else {
    console.log(x.toFixed(2))  // 这里 x 是 number
  }
}
```

### 2. 真值收窄

```ts
function foo(s: string | null | undefined) {
  if (s) {           // 真值：排除了 ''、null、undefined
    console.log(s.length)
  }
}
```

### 3. 相等性收窄

```ts
function bar(x: string | number, y: string | boolean) {
  if (x === y) {     // 都相等时，两者交集：string
    console.log(x.toUpperCase())
  }
}
```

### 4. in 收窄（属性存在性）

```ts
type Fish = { swim(): void }
type Bird = { fly(): void }

function move(pet: Fish | Bird) {
  if ('swim' in pet) {
    pet.swim()       // Fish
  } else {
    pet.fly()        // Bird
  }
}
```

### 5. instanceof 收窄

```ts
function show(d: Date | string) {
  if (d instanceof Date) {
    console.log(d.toISOString())
  } else {
    console.log(d.toUpperCase())
  }
}
```

### 6. 可辨识联合（Discriminated Union）：最强大的收窄

用一个**判别字段**（通常是 `kind`/`type`）区分联合成员：

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rect'; width: number; height: number }

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2
    case 'square': return s.side ** 2
    case 'rect':   return s.width * s.height
  }
}
```

每个分支里 TS 都精确知道形状，能安全访问对应属性。**这是真实项目建模"多态数据"（消息、事件、API 响应、表单字段）的标准姿势**。

### 7. 自定义类型守卫

把"判断逻辑"封装成带类型谓词的函数，可复用：

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}

const pets: (Fish | Bird)[] = []
for (const p of pets) {
  if (isFish(p)) {
    p.swim()   // TS 知道是 Fish
  }
}
```

### 8. never 穷尽检查

`switch` 都走完时，剩余的变量类型是 `never`，可以"捕捉漏网之鱼"：

```ts
function assertNever(x: never): never {
  throw new Error('不该走到这里: ' + x)
}

function area2(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2
    case 'square': return s.side ** 2
    case 'rect':   return s.width * s.height
    default: return assertNever(s)   // 以后新增 Shape 分支，这里会编译报错！
  }
}
```

以后给 `Shape` 加一个 `triangle`，编译器会**自动提醒**所有需要处理它的地方——这就是"可辨识联合 + never"的组合威力。

## 四、场景演练：表单字段渲染器

::: exercise
表单支持三种字段：文本、数字、下拉。用一个可辨识联合建模，写一个 `renderField` 函数，要求新增字段类型时编译器能提醒你。
:::

::: solution
```ts
type Field =
  | { type: 'text'; label: string; value: string }
  | { type: 'number'; label: string; value: number; min?: number; max?: number }
  | { type: 'select'; label: string; value: string; options: string[] }

function renderField(field: Field): string {
  switch (field.type) {
    case 'text':
      return `<input type="text" value="${field.value}">`
    case 'number':
      return `<input type="number" min="${field.min ?? ''}" max="${field.max ?? ''}" value="${field.value}">`
    case 'select':
      return `<select>${field.options.map(o => `<option>${o}</option>`).join('')}</select>`
    default:
      const _exhaustive: never = field   // 新增字段类型时这里报错
      return _exhaustive
  }
}
```
:::

::: interview
**Q1：联合类型和交叉类型区别？**
A：`A | B` 是"或"（值是 A 或 B 之一）；`A & B` 是"且"（值同时是 A 和 B）。联合常用 `string | number`、`T | null`；交叉用于合并对象类型。

**Q2：类型收窄有哪些方式？**
A：typeof、真值判断、相等判断、in 操作符、instanceof、可辨识联合的判别字段、自定义类型守卫（`x is T`）、switch + never 穷尽检查。

**Q3：什么是可辨识联合？**
A：联合的每个成员共用一个判别字段（如 `kind`），编译器根据该字段的值精确收窄成员类型。适合建模事件、消息、表单字段、API 响应等多态数据。

**Q4：自定义类型守卫怎么写？**
A：`function isX(v: unknown): v is X { return ... }`。返回布尔值，编译器在 true 分支把参数收窄为 X。
:::

## 📌 小结

- 联合 `|`（或）、交叉 `&`（且）
- 收窄八式：typeof / 真值 / 相等 / in / instanceof / 判别字段 / 自定义守卫 / never 穷尽
- **可辨识联合是建模多态数据的核心武器**
- 永远让编译器"替你检查穷尽性"——新增分支自动报错
