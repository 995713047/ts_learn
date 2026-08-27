> 当项目变大，模块、声明文件、类型引用就成了工程化的主战场。这一课把 ESM 语义、import type、.d.ts、@types、declare 讲清楚。

## 一、模块：ESM 是唯一正解

TS 原生支持 ES 模块语法，并提供了"类型专用"的导入导出：

```ts
// 普通导入：值 + 类型（运行时需要）
import { ref } from 'vue'
import type { Ref } from 'vue'   // ← 只导入类型，运行时被擦除

// 混合
import { ref, type Ref } from 'vue'

// 导出类型
export type { User }
export interface Config { theme: string }
```

::: tip
**`import type` 的价值**：告诉编译器"这只是类型，不要生成运行时导入"。配合 `verbatimModuleSyntax`，能确保类型导入不产生多余的运行时依赖（尤其避免循环依赖）。
:::

## 二、namespace 的"前世今生"

ES 模块出现前，TS 用 `namespace` 组织代码：

```ts
namespace Utils {
  export function format(n: number): string { return String(n) }
  export const VERSION = '1.0'
}
Utils.format(42)
```

**现代建议**：新代码一律用 ES 模块（import/export），namespace 只用于：声明合并、`.d.ts` 中的全局命名空间、个别 UMD 库。

## 三、声明文件 .d.ts

`.d.ts` 只含类型，不含实现，编译后不产生 JS：

```ts
// math.d.ts
export function add(a: number, b: number): number
export const PI: number
```

**什么时候需要 .d.ts？**

1. **手写的 JS 库**——给消费者提供类型；
2. **为无类型的第三方库补类型**；
3. **全局环境声明**（window 上的全局变量、自定义环境）。

## 四、@types：生态的类型"仓库"

DefinitelyTyped 收录了大量库的类型包：

```bash
npm install -D @types/node      # Node 内置 API 的类型
npm install -D @types/lodash    # lodash 的类型
npm install -D @types/express   # express 的类型
```

**判断规则**：

- 库自带类型 → 直接可用（包里有 `types` 或 `typings` 字段，或 `lib/index.d.ts`）；
- 库没带 → 找 `@types/库名`（TypeScript 默认自动包含 `node_modules/@types` 下所有包）；
- 都没有 → 自己写 `declare module`。

## 五、declare module：给"没类型"的库补类型

```ts
// 某老库只有 JS，没有类型
declare module 'legacy-utils' {
  export function parse(text: string): Record<string, string>
  export const version: string
}

// 或者：完全放弃检查（不推荐，但能跑）
declare module 'png-encoder' {
  const encoder: any
  export default encoder
}
```

## 六、declare global：扩展全局环境

```ts
// 给 window 挂自定义属性
declare global {
  interface Window {
    __APP_CONFIG__: { env: string; version: string }
  }
  // 自定义全局函数
  function trackEvent(name: string, data?: Record<string, unknown>): void
}

// 使用
window.__APP_CONFIG__.env        // ✓ 类型存在
trackEvent('click', { page: 'home' })
```

::: tip
`declare global` 必须写在**模块文件**里（有 import/export 的文件）才会生效；配合 `declare module` 可以给第三方库"打补丁"而不改库本身。
:::

## 七、三斜线指令（了解即可）

老式引用写法，现代项目几乎不用：

```ts
/// <reference types="node" />
/// <reference path="./other.d.ts" />
```

## 八、场景演练：封装一个类型安全的 localStorage

::: exercise
为 localStorage 写一个带类型的包装模块：`get`/`set`/`remove`，自动 JSON 序列化，并在类型层面约束。
:::

::: solution
```ts
// storage.ts
const PREFIX = 'app:'

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function getItem<T>(key: string): T | null {
  const raw = localStorage.getItem(PREFIX + key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

// 使用：调用方声明类型，读写自动安全
interface Prefs { theme: 'light' | 'dark'; lang: string }
setItem<Prefs>('prefs', { theme: 'dark', lang: 'zh' })
const prefs = getItem<Prefs>('prefs')   // Prefs | null
if (prefs) console.log(prefs.theme)

// 进阶：为它写一个 .d.ts 声明，让别的模块引用（可选）
```
:::

::: interview
**Q1：import type 有什么用？**
A：只导入类型、运行时擦除，避免多余运行时导入与循环依赖。TS 5 + `verbatimModuleSyntax` 会强制你写清楚。

**Q2：.d.ts 文件的作用？**
A：纯类型声明文件，描述 JS 模块/全局的类型形状，编译后不产出 JS。手写或 `tsc --declaration` 自动生成。

**Q3：@types 什么时候需要装？**
A：库没自带类型时装 `@types/库名`（如 @types/node）。现代库大多自带类型（TS 编写的直接发布 d.ts）。

**Q4：declare module 和 declare global 的区别？**
A：declare module 声明"模块"的类型（针对无类型库）；declare global 扩展"全局作用域"（如 window、全局函数）。两者常配合使用。

**Q5：namespace 还要用吗？**
A：新代码用 ES 模块替代。namespace 仅用于声明合并、全局命名空间等少数场景。
:::

## 📌 小结

- 类型导入：`import type` / `export type`，避免运行时导入
- `.d.ts` = 纯类型声明文件
- 类型来源顺序：库自带 → @types → 手写 declare module
- `declare global` 扩展全局；namespace 已过时
- 信任边界封装：泛型 + JSON 序列化 + 失败兜底
