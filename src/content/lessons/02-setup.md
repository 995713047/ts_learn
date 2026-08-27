> 这一课把环境搭起来：装 TypeScript、用 `tsc` 跑通第一个程序，再用 Vite 搭一个 Vue3 + TS 项目（本教程网站就是这么搭的）。

## 一、安装

需要先装好 **Node.js**（>= 18 推荐 20+）。然后全局安装 TypeScript 编译器：

```bash
npm install -g typescript
tsc --version   # 查看版本，如 Version 5.x.x
```

::: tip
实际项目中一般不全局装，而是装成项目依赖 `npm i -D typescript`，保证团队版本一致。
:::

## 二、第一个程序

新建 `hello.ts`：

```ts
// 类型注解：冒号后面是类型
const message: string = 'Hello TypeScript!'

function greet(name: string): string {
  return `你好，${name}！`
}

console.log(message)
console.log(greet('小明'))
```

编译并运行：

```bash
tsc hello.ts        # 生成 hello.js（类型已被擦除）
node hello.js       # 运行
# 输出：
# Hello TypeScript!
# 你好，小明！
```

看看编译产物 `hello.js`——注意 `: string` 全部消失了：

```js
var message = 'Hello TypeScript!';
function greet(name) { return "你好，" + name + "！"; }
console.log(message);
console.log(greet('小明'));
```

**这就是"类型擦除"**：类型只在编译期起作用，运行时和纯 JS 完全一致。

## 三、tsconfig.json：TS 的"配置文件"

不配置也能用，但真实项目必须配。最小配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",      // 编译到哪个 JS 版本
    "strict": true,          // 开启全部严格检查（强烈推荐）
    "module": "ESNext",      // 模块规范
    "outDir": "dist"         // 编译输出目录
  },
  "include": ["src"]         // 编译哪些文件
}
```

然后 `tsc` 就会按配置编译整个 `src` 目录。第 13 课会精讲每个选项。

::: warning
**`strict: true` 一定要开**。它集合了 `strictNullChecks`、`noImplicitAny` 等所有重要检查，是 TS 最有价值的部分。不开 strict 等于只用了 TS 一半功力。
:::

## 四、用 Vite 创建 Vue3 + TS 项目

命令行一行搞定（本教程网站就是 Vite + Vue3 + TS）：

```bash
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install
npm run dev      # 启动开发服务器，浏览器访问 http://localhost:5173
```

生成的项目结构：

```text
my-app/
├── index.html          # 入口 HTML
├── vite.config.ts      # Vite 配置（TS 编写！）
├── tsconfig.json       # TS 配置
└── src/
    ├── main.ts         # 应用入口
    ├── App.vue         # 根组件
    └── components/     # 组件目录
```

**tsc 与 Vite 的分工**：`tsc` 负责类型检查，Vite（esbuild）负责转译与打包——两者各司其职，互不干扰。开发时 Vite 转译极快，类型检查由编辑器（VSCode）实时完成。

## 五、场景演练：把一段 JS 改成 TS

::: exercise
下面这段 JS 有很多隐患（隐式 `any`、空值风险、字段拼写）。把它改成类型安全的 TS 版本。

```js
function calcTotal(cartItems) {
  let total = 0
  for (const item of cartItems) {
    total += item.price * item.qty
  }
  return total
}
```
:::

::: solution
```ts
interface CartItem {
  name: string
  price: number
  qty: number
}

function calcTotal(cartItems: CartItem[]): number {
  let total = 0
  for (const item of cartItems) {
    total += item.price * item.qty
  }
  return total
}

// 现在调用时传错形状立刻报错：
// calcTotal([{ name: 'x', price: '10', qty: 1 }])  // ❌ price 不是 number
// calcTotal([{ name: 'x', price: 10 }])            // ❌ 缺少 qty
```

要点：给函数**参数和返回值**都加上类型，让"合同"清晰可查。
:::

::: interview
**Q1：tsc 和 Vite 分别做什么？**
A：tsc 做类型检查 + 生成 .d.ts；Vite（内部用 esbuild/Rollup）做转译、打包和热更新。两者可独立使用，Vite 项目里通常由编辑器负责实时类型检查，tsc 用于 CI 校验。

**Q2：类型擦除是什么？**
A：TS 编译时把类型注解、接口、泛型等编译期概念全部删除，只保留 JS 语法。所以产物是纯 JS，运行无额外开销。

**Q3：项目里推荐全局装 TS 还是局部装？**
A：局部（`-D`）安装。保证团队版本一致、CI 可复现，也避免全局污染。
:::

## 📌 小结

- `tsc` 编译 = **类型检查 + 类型擦除**，产物是纯 JS
- `strict: true` 是必开项
- Vite + vue-ts 模板是最主流的 Vue3 + TS 起手式
- 编辑器（VSCode）实时类型提示，是 TS 体验的第一生产力
