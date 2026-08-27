> 函数是 JS 的灵魂，而 TS 给函数加上了"参数合同"与"返回值合同"。这一课把函数的类型能力全部解锁。

## 一、参数与返回值类型

```ts
// 基础：参数和返回值都标注类型
function add(a: number, b: number): number {
  return a + b
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b

// 返回值可推断时可不写，但推荐写（尤其复杂函数）
function greet(name: string) {
  return `你好，${name}`
}
```

## 二、可选参数与默认参数

```ts
// 可选参数：必须放在必选参数之后
function log(msg: string, level?: string) {
  console.log(`[${level ?? 'info'}]`, msg)
}

// 默认参数：相当于可选，且类型自动推断
function log2(msg: string, level: string = 'info') {
  console.log(`[${level}]`, msg)
}
log2('hi')        // level = 'info'
log2('hi', 'warn')

// 可选参数的类型其实是"值 | undefined"
function opt(x?: number) { /* x: number | undefined */ }
```

## 三、剩余参数

```ts
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0)
}
sum(1, 2, 3, 4)   // 10
```

## 四、函数类型：把函数"当作值"

```ts
// 类型别名描述函数形状
type Callback = (err: Error | null, data?: string) => void

// 或接口形式
interface Callback2 { (err: Error | null, data?: string): void }

// 用在参数/返回值上
function runTask(cb: Callback) {
  cb(null, '成功')
}
```

## 五、泛型函数：类型也可以当参数

```ts
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0]
}
firstElement([1, 2, 3])       // number | undefined
firstElement(['a'])           // string | undefined
firstElement<number>([1])     // 显式指定

// 多个类型参数
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b]
}
pair('x', 1)   // [string, number]
```

## 六、函数重载（Overload）

同一个函数，根据参数不同返回不同类型：

```ts
// 多个签名 + 一个实现
function format(input: string): string
function format(input: number): string
function format(input: string | number): string {
  return typeof input === 'string' ? input.toUpperCase() : input.toFixed(2)
}

console.log(format('abc'))  // 'ABC'
console.log(format(3.14159)) // '3.14'
```

::: warning
- 签名只是"声明"，**实现必须兼容所有签名**（参数类型取并集）；
- 实现签名**不对外可见**，调用方只看到签名列表；
- 重载顺序：**更具体的在前**。
:::

## 七、this 的类型

```ts
// 显式声明 this 参数（第一个参数，编译后被擦除）
interface User { name: string }
function sayHi(this: User, msg: string) {
  console.log(`${this.name}: ${msg}`)
}
const u = { name: '小明', sayHi }
u.sayHi('你好')    // ✓ this 类型正确
// sayHi('x')     // ❌ 需要正确的 this
```

## 八、参数解构也要类型

```ts
function draw({ x, y }: { x: number; y: number }) {
  console.log(x, y)
}
draw({ x: 1, y: 2 })
```

## 九、场景演练：事件处理器工厂

::: exercise
写一个 `createDebounce` 工厂：返回一个带 `cancel` 方法的防抖函数，且事件处理参数保持类型安全。
:::

::: solution
```ts
interface Debounced<Args extends unknown[]> {
  (...args: Args): void
  cancel(): void
}

function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | null = null

  const wrapped = (...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }
  return wrapped
}

// 用法：参数类型自动保持
const onSearch = debounce((keyword: string) => {
  console.log('搜索：', keyword)
}, 500)
onSearch('vue')      // ✓ keyword 是 string
// onSearch(123)     // ❌ 类型错误
onSearch.cancel()    // ✓ cancel 存在
```
:::

::: interview
**Q1：可选参数和默认参数的区别？**
A：可选参数用 `?`，没传时是 `undefined`；默认参数没传时用默认值，类型自动推断。两者都只能放在必选参数之后（JS 语法限制）。

**Q2：什么是函数重载？**
A：为同一个函数声明多个调用签名，调用时根据参数类型得到精确的返回类型。实现只有一个，参数类型是各签名的并集。

**Q3：泛型函数解决了什么问题？**
A：让函数在保持"输入输出类型关系"的前提下复用。如 `firstElement<T>(arr: T[]): T | undefined` 输入什么类型数组就返回什么类型的元素，避免用 any 丢失类型。
:::

## 📌 小结

- 参数/返回值标注、可选 `?`、默认值、剩余参数 `...rest: T[]`
- 函数类型：`(args) => ret`，可用于类型别名/接口
- 泛型函数保持输入输出类型关系
- 重载 = 多个签名 + 一个实现（具体在前）
- `this` 参数、解构参数都能类型化
