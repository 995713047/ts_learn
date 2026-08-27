> `tsconfig.json` 是 TS 项目的"控制台"。这一课精讲常用配置，重点是 `strict` 家族和与 Vite 的协作。

## 一、tsconfig.json 的三层结构

```jsonc
{
  // 1. 继承：复用公共配置
  "extends": "./tsconfig.base.json",

  // 2. 文件范围：编译哪些文件
  "include": ["src", "tests"],
  "exclude": ["node_modules", "dist"],

  // 3. 编译选项（核心）
  "compilerOptions": {
    // ...见下文
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true
  },
  "include": ["src"]
}
```

## 二、核心选项逐项解读

### 版本与模块

| 选项 | 含义 | 建议 |
| --- | --- | --- |
| `target` | 编译到哪个 JS 版本（`ES2015`…`ES2022`） | 现代项目 `ES2020`+ |
| `module` | 模块规范（`ESNext`/`CommonJS`…） | 打包器项目 `ESNext` |
| `moduleResolution` | 模块解析策略 | Vite 用 `bundler` |
| `lib` | 引用哪些环境类型库（`ES2020`、`DOM`） | 按需 |

### strict 家族（最重要！）

`strict: true` 一次开启以下全部：

| 开关 | 作用 | 价值 |
| --- | --- | --- |
| `strictNullChecks` | null/undefined 严格检查 | ⭐ 消灭 NPE |
| `noImplicitAny` | 隐式 any 报错 | ⭐ 逼你写类型 |
| `strictFunctionTypes` | 函数参数逆变检查 | 防止函数类型误用 |
| `strictBindCallApply` | bind/call/apply 严格检查 | |
| `strictPropertyInitialization` | 类属性必须初始化 | |
| `noImplicitThis` | this 隐式 any 报错 | |
| `useUnknownInCatchVariables` | catch 的 e 是 unknown | TS 4.4+ |
| `alwaysStrict` | 自动加 'use strict' | |

::: warning
**永远保持 `strict: true`**。这是 TS 60% 以上的价值所在。关闭 strictNullChecks 等于把最容易出错的部分交给运行时。
:::

### 其它常用选项

```jsonc
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] },   // 路径别名（需配合打包器）
    "baseUrl": ".",                    // paths 的基准
    "esModuleInterop": true,           // 让 import x from 'cjs-lib' 正常
    "isolatedModules": true,           // 单文件转译安全（Vite 必须）
    "verbatimModuleSyntax": true,      // import type 必须显式（TS 5+ 推荐）
    "noUnusedLocals": true,            // 未使用变量报错
    "noUnusedParameters": true,        // 未使用参数报错
    "noFallthroughCasesInSwitch": true,// switch 穿透报错
    "noUncheckedIndexedAccess": true,  // 索引访问可能 undefined（推荐进阶）
    "resolveJsonModule": true,         // 允许 import json
    "skipLibCheck": true,              // 跳过 .d.ts 内部检查（加速）
    "sourceMap": true                  // 生成调试用 sourcemap
  }
}
```

## 三、路径别名：告别 ../../..

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Vite 侧也要配（否则运行时找不到模块）：

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
})
```

之后 `import Foo from '@/components/Foo.vue'` 即可。

## 四、TS 与 Vite 的协作（本项目配置解读）

本项目 `tsconfig.json` 关键点：

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",   // 打包器模式
    "strict": true,
    "isolatedModules": true,         // 配合 esbuild 转译
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]         // 注入 import.meta.env 等类型
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"]
}
```

**职责划分**：
- **类型检查**：编辑器（VSCode + vue-tsc）实时做；CI 里 `vue-tsc --noEmit`
- **转译/打包**：Vite（esbuild）——它只做语法转译，**不做类型检查**
- 所以：esbuild 很快，但类型安全靠 tsc/vue-tsc 把关

## 五、场景演练：配置一个"严格模式"项目

::: exercise
写一个项目级 tsconfig，要求：strict 全开、路径别名 @、未使用变量报错、索引访问安全、支持 JSON 导入、模块解析适配 Vite。
:::

::: solution
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vite/client"],
    "noEmit": true
  },
  "include": ["src"]
}
```

配合 vite.config.ts 的 alias 配置，即开即用。`noUncheckedIndexedAccess` 会让 `arr[i]` 的类型变成 `T | undefined`，逼迫你处理边界——刚开始会不习惯，但值得。
:::

::: interview
**Q1：strict 包含哪些？**
A：strictNullChecks、noImplicitAny、strictFunctionTypes、strictBindCallApply、strictPropertyInitialization、noImplicitThis、useUnknownInCatchVariables、alwaysStrict 八个。

**Q2：为什么 Vite 项目要开 isolatedModules？**
A：Vite 用 esbuild 逐文件转译，不开 isolatedModules 时某些写法（如导出类型再导入）在单文件转译下会出问题。该选项强制每个文件可独立转译。

**Q3：moduleResolution 的 bundler 和 node 有什么区别？**
A：bundler 模式按打包器规则解析：支持 exports 字段、允许省略扩展名等；node 模式按 Node 传统 CJS/ESM 规则。

**Q4：paths 别名怎么配？**
A：tsconfig 里 baseUrl + paths，打包器里也要配 alias（如 Vite 的 resolve.alias），两边一致才生效。
:::

## 📌 小结

- `strict: true` 必开；strictNullChecks 是最值钱的一项
- 常用：paths 别名、esModuleInterop、isolatedModules、noUnused*
- 职责划分：esbuild 转译（快），tsc/vue-tsc 类型检查（严）
- `noUncheckedIndexedAccess` 值得进阶开启
