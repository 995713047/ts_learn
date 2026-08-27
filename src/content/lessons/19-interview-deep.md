> 这一课把面试中最常考的 20 类问题逐一击破：**概念对比、原理、手写代码、易错点**全覆盖。
> 配合「面试挑战」页面（顶部导航）做题自测，效果更佳。

## Q1. any / unknown / never 三兄弟

**核心区别**：

| 类型 | 含义 | 使用 |
| --- | --- | --- |
| `any` | 放弃类型检查 | 危险，项目应禁用 |
| `unknown` | 未知类型，先收窄再用 | 安全，替代 any |
| `never` | 永远不会发生的值 | 穷尽检查、空联合 |

```ts
let a: any = 1
a.foo.bar()            // 编译不报错，运行时崩

let u: unknown = "hi"
// u.toUpperCase()      // ❌ 必须先收窄
if (typeof u === "string") u.toUpperCase()  // ✓

type NeverDemo = string | never   // 结果就是 string
function assertNever(x: never): never { throw new Error("unreachable: " + x) }
```

**面试话术**：any 是"逃生舱"但会切断类型链；unknown 是"类型安全的 any"；never 常配合可辨识联合做穷尽检查。

## Q2. interface 和 type 怎么选？

**相同**：都能描述对象、都能被 implements。

**不同**：

| 能力 | interface | type |
| --- | --- | --- |
| 声明合并 | ✅ | ❌ |
| 联合/交叉/元组 | ❌ | ✅ |
| 继承 | extends | & 交叉 |
| 工具类型操作 | 一般 | 灵活 |

**答案模板**：对象优先 interface（可合并、语义清晰）；需要联合、元组、工具类型时用 type。库设计者优先 interface 方便用户扩展。

## Q3. 类型收窄（narrowing）有哪几种？

```text
1. typeof：typeof x === "string"
2. 真值：if (x) 排除 null/undefined/"" /0
3. 相等：x === y 取交集
4. in：判断属性存在
5. instanceof：判断类实例
6. 可辨识联合：switch (x.kind)
7. 自定义守卫：x is T 函数
8. 赋值收窄：let 变量按赋值推断
9. 控制流分析：return/throw 提前退出
```

**易错点**：typeof null === "object"；`x is T` 守卫要保证逻辑正确，否则会"骗"编译器。

## Q4. 泛型里的 extends 到底是什么？

**两种含义**（关键区分）：

- 在**泛型约束**中：`T extends Constraint` 表示 T 是 Constraint 的子类型（约束）；
- 在**条件类型**中：`T extends U ? X : Y` 是判断"T 是否可赋值给 U"。

```ts
// 约束：必须有 length
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

// 条件：判断并分支
type IsArray<T> = T extends unknown[] ? true : false
type R = IsArray<number[]>   // true
```

## Q5. keyof / T[K] / 索引签名

```ts
interface User { name: string; age: number }
type K = keyof User            // "name" | "age"
type N = User["name"]          // string（索引访问）

// 安全取属性
function get<T, K extends keyof T>(o: T, k: K): T[K] { return o[k] }

// 索引签名：任意键
interface Dict { [key: string]: number }
```

**注意**：`T[K]` 也叫索引访问类型；`keyof any = string | number | symbol`。

## Q6. 条件类型的"分发"是什么？

裸类型参数 + 联合类型时，条件类型会**逐项判断**：

```ts
type ToArray<T> = T extends unknown ? T[] : never
type A = ToArray<string | number>   // string[] | number[]（分发）

// 关闭分发：包一层元组
type NoDist<T> = [T] extends [unknown] ? T[] : never
type B = NoDist<string | number>    // (string | number)[]
```

Exclude / Extract 的实现就是利用了分发。

## Q7. infer 怎么用？手写 ReturnType

```ts
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never

type MyParameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never

type MyAwaited<T> =
  T extends Promise<infer U> ? (U extends Promise<any> ? MyAwaited<U> : U) : T
```

**要点**：infer 只能写在条件类型的 extends 右侧；它"抓取"匹配到的子结构。

## Q8. 手写 Partial / Pick / Omit / Record

```ts
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
type MyRecord<K extends keyof any, V> = { [P in K]: V }
type MyExclude<T, U> = T extends U ? never : T
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>
```

这是面试手写题最高频的一组，务必滚瓜烂熟。

## Q9. 声明合并是什么？

```ts
interface Window {}
interface Window { version: string }   // 合并

// 函数 + 命名空间（经典模式）
function format(n: number): string { return String(n) }
namespace format { export const pad = (n: number, l: number) => String(n).padStart(l, "0") }
```

**应用**：扩展全局对象、给第三方库补类型、函数附带静态工具。

## Q10. strictNullChecks 为什么重要？

```ts
// 关闭时：处处可能 NPE
const el = document.querySelector(".btn")   // 类型是 Element（骗人！可能为 null）
el.addEventListener("click", fn)            // 运行时崩

// 开启后：
const el = document.querySelector(".btn")   // Element | null
el?.addEventListener("click", fn)           // 必须处理空值
```

**话术**：它把"运行时才炸的空指针"变成"编译期必须处理的显式空值"，是 TS 最有价值的一项检查。

## Q11. 协变与逆变（函数参数）

```ts
// 属性类型：协变（子类型可赋给父类型位置）
type A = { name: string }
type B = { name: string; age: number }
const a: A = { name: "x", age: 1 } as B   // B 可赋给 A（结构多没关系）

// 函数参数：逆变（strictFunctionTypes 下）
type F1 = (x: A) => void
type F2 = (x: B) => void
// F2 可以赋给 F1 吗？不行！因为回调可能收到更窄的参数（缺少 age）
```

**一句话**：参数是"消费方"（逆变），返回值是"生产方"（协变）。多数人记住"返回值协变、参数逆变"即可。

## Q12. 类型擦除与运行时开销

```text
编译前：const n: number = 1; interface X {}
编译后：const n = 1;              （全部擦除）
```

类型注解、接口、泛型、类型别名编译后**全部消失**，运行时零开销。
少数生成运行时代码的：enum、装饰器、namespace、参数属性（public x）。

## Q13. 枚举有哪些坑？

```ts
enum Direction { Up, Down }   // 生成运行时对象 + 反向映射
const d: Direction = 999      // ⚠️ 数字枚举允许任意数字！

// 更安全：字符串字面量联合
type Dir = "up" | "down"
```

**建议**：业务枚举优先字符串字面量联合；需要"运行时值列表"时用 as const 数组。

## Q14. readonly 和 const 的区别

```ts
const obj = { x: 1 }          // const：变量绑定不可变
obj.x = 2                    // ✓ 对象内容可变

interface O { readonly x: number }
const o: O = { x: 1 }
// o.x = 2                   // ❌ 属性不可赋值
// 但：编译后没有运行时保护，Object.freeze 才有
```

## Q15. never 穷尽检查（面试加分项）

```ts
type Event = { kind: "open" } | { kind: "close" } | { kind: "error" }

function handle(e: Event) {
  switch (e.kind) {
    case "open": console.log("open"); break
    case "close": console.log("close"); break
    case "error": console.log("error"); break
    default:
      const _: never = e   // 新增事件类型时，这里编译报错
  }
}
```

**价值**：让"忘了处理新分支"变成编译期错误。

## Q16. 装饰器了解即可

```ts
function log(target: any, key: string) {
  console.log("called:", key)
}
class Foo { @log bar() {} }
```

注意：装饰器仍处于提案阶段（TS 5 默认 legacy 模式，实验性特性需开启 `experimentalDecorators`），新项目慎用。

## Q17. tsconfig 高频项（口述清单）

```text
- strict（含 strictNullChecks / noImplicitAny 等 8 项）
- target / module / moduleResolution（Vite 用 bundler）
- lib（ES2020 / DOM / DOM.Iterable）
- paths + baseUrl（路径别名）
- esModuleInterop（CJS 默认导入）
- isolatedModules（配合 esbuild 单文件转译）
- noUnusedLocals / noUnusedParameters
- noUncheckedIndexedAccess（进阶）
- skipLibCheck（加速构建）
```

## Q18. Vue3 + TS 的类型要点

```ts
// 1. props 泛型
defineProps<{ id: number; title?: string }>()
// 2. emit 泛型
const emit = defineEmits<{ (e: "save", data: object): void }>()
// 3. 泛型组件
// <script setup lang="ts" generic="T">
// 4. 注入类型化
import type { InjectionKey, Ref } from "vue"
export const key: InjectionKey<Ref<string>> = Symbol()
```

## Q19. JS 项目如何平滑迁移到 TS？

```text
1. 先开 allowJs + checkJs: false，让 .js 与 .ts 共存
2. tsconfig 先宽松（strict: false），业务跑通
3. 逐步开启 strict 家族（先 strictNullChecks）
4. 高价值文件优先：API 层、store、工具函数
5. 无类型库补 declare module 或升级到有类型的版本
6. CI 里加 vue-tsc / tsc --noEmit 把关
```

## Q20. 类型"性能"与报错排查

```text
- 深递归类型（如 DeepPartial）可能触发 "Type instantiation is excessively deep"
- 解决：加递归深度限制、避免笛卡尔积联合、用 interface 缓存
- 编辑器卡顿：减少巨型类型、tsc --incremental、skipLibCheck
- 排查技巧：悬停看推断、把复杂类型拆成中间步骤逐层验证
```

::: tip
**答题心法**：面试官问概念 → 先说定义，再给例子，最后补"易错点"。
问手写 → 先写骨架，再填细节。问对比 → 用表格/分点，展示结构化思维。
:::
