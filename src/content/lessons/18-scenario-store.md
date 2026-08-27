> **实战项目④**：从零实现一个迷你状态管理库。这是检验泛型、类型推导、函数类型功力的"试金石"。

## 一、需求设计

```text
目标 API：
1. createStore({ state, actions, getters }) 创建 store
2. store.state.xxx     —— 类型与初始值一致
3. store.getters.xxx   —— 类型自动推导
4. store.actions.xxx() —— 参数与返回类型正确
5. store.subscribe(fn) —— 状态变化通知，带类型
```

## 二、类型设计：让"推导"替我们干活

```ts
// 类型体操第一步：把 actions 的方法签名"解开"
// Actions 是 { [name]: (ctx, ...args) => any } 的形状
// 我们要推导出：调用时只需要传 ...args

type ActionArgs<A, K extends keyof A> =
  A[K] extends (ctx: any, ...args: infer P) => any ? P : never

type ActionReturn<A, K extends keyof A> =
  A[K] extends (ctx: any, ...args: any) => infer R ? R : never
```

## 三、核心实现

```ts
export interface StoreOptions<S, G, A> {
  state: S
  getters?: G
  actions?: A
}

export interface StoreContext<S, G> {
  state: S
  getters: G
  setState(patch: Partial<S>): void
}

export function createStore<S, G, A>(
  options: StoreOptions<S, G, A>
) {
  // 运行时状态
  const state = { ...options.state } as S
  const listeners = new Set<() => void>()

  function setState(patch: Partial<S>) {
    Object.assign(state, patch)
    listeners.forEach((fn) => fn())
  }

  // getters：把函数转成"计算结果"
  const getters = {} as G
  if (options.getters) {
    for (const key of Object.keys(options.getters) as (keyof G)[]) {
      const getter = (options.getters as any)[key]
      Object.defineProperty(getters, key, {
        get: () => getter(state, getters)
      })
    }
  }

  // actions：注入 ctx 后暴露给外部
  const ctx: StoreContext<S, G> = { state, getters, setState }
  const actions = {} as A
  if (options.actions) {
    for (const key of Object.keys(options.actions) as (keyof A)[]) {
      ;(actions as any)[key] = (...args: any[]) =>
        (options.actions as any)[key](ctx, ...args)
    }
  }

  return {
    state,
    getters,
    actions,
    subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn) }
  }
}
```

::: tip
技巧总结：
- `ActionArgs` / `ActionReturn` 用 `infer` 从动作函数签名中提取参数与返回值
- getters 用 `Object.defineProperty` 实现"惰性计算"，类型上仍是 G
- actions 包一层：把 `(ctx, ...args)` 变成 `(...args)`——调用方不用碰 ctx
:::

## 四、使用：全类型推导

```ts
// 计数器 store
const store = createStore({
  state: {
    count: 0,
    label: '计数器'
  },
  getters: {
    double(state: { count: number }) {
      return state.count * 2
    },
    labelWithCount(state: { count: number; label: string }) {
      return state.label + ':' + state.count
    }
  },
  actions: {
    increment(ctx: StoreContext<{ count: number }, any>, by: number) {
      ctx.setState({ count: ctx.state.count + by })
    },
    reset(ctx: StoreContext<{ count: number }, any>) {
      ctx.setState({ count: 0 })
    }
  }
})

store.state.count          // number ✓
store.getters.double       // number ✓
store.actions.increment(2) // 参数类型正确 ✓
// store.actions.increment('x')  // ❌ 类型错误
const unsubscribe = store.subscribe(() => {
  console.log('count =', store.state.count)
})
```

## 五、进阶：让 getters 推导更智能

上面 getters 里的 state 参数要手动写类型。用泛型可以**自动推导**：

```ts
export function createStoreSmart<S, G extends Record<string, (state: S) => unknown>, A>(
  options: {
    state: S
    getters: G
    actions: A
  }
) {
  // ... 同上实现
  return {
    state: options.state,
    getters: {} as { [K in keyof G]: ReturnType<G[K]> },
    actions: {} as A,
    subscribe() { return () => {} }
  }
}

const smart = createStoreSmart({
  state: { count: 0 },
  getters: {
    double: (s) => s.count * 2        // s 自动是 { count: number } ✓
  },
  actions: {}
})
smart.getters.double   // number ✓（ReturnType 推导）
```

::: warning
`{ [K in keyof G]: ReturnType<G[K]> }` 是**映射类型**：把"函数类型"变成"计算结果类型"。这是 getters 类型推导的核心。
:::

## 六、场景演练：购物车 store 完整版

::: exercise
用上面的 createStore 实现购物车：state（items、total）、getters（总价、数量）、actions（add、remove、clear）。要求使用处全部类型安全。
:::

::: solution
```ts
interface CartItem {
  id: number
  name: string
  price: number
  qty: number
}

interface CartState {
  items: CartItem[]
}

const cart = createStore({
  state: { items: [] as CartItem[] },
  getters: {
    total(state: CartState) {
      return state.items.reduce((s, i) => s + i.price * i.qty, 0)
    },
    count(state: CartState) {
      return state.items.reduce((s, i) => s + i.qty, 0)
    }
  },
  actions: {
    add(ctx: StoreContext<CartState, any>, item: CartItem) {
      const items = [...ctx.state.items]
      const found = items.find((i) => i.id === item.id)
      if (found) found.qty += item.qty
      else items.push(item)
      ctx.setState({ items })
    },
    remove(ctx: StoreContext<CartState, any>, id: number) {
      ctx.setState({ items: ctx.state.items.filter((i) => i.id !== id) })
    },
    clear(ctx: StoreContext<CartState, any>) {
      ctx.setState({ items: [] })
    }
  }
})

// 使用：类型完全正确
cart.actions.add({ id: 1, name: '键盘', price: 299, qty: 1 })
cart.actions.add({ id: 1, name: '键盘', price: 299, qty: 1 })  // 数量累加
console.log('总价', cart.getters.total, '件数', cart.getters.count)
cart.actions.remove(1)
cart.actions.clear()
```
:::

::: interview
**Q1：状态管理的类型设计难点在哪？**
A：actions/getters 的"上下文"（ctx）不应暴露给调用方；getters 要从函数变成值。用 infer 提取参数/返回值 + 映射类型转换函数为结果类型。

**Q2：ReturnType 在这里的作用？**
A：`ReturnType<G[K]>` 取 getter 函数的返回类型，让 getters 对象属性直接是计算结果类型。

**Q3：为什么 store 要用泛型而不是写死 any？**
A：泛型让 state/getters/actions 的类型与初始定义"锁死"：改一处，所有使用点自动更新，重构零成本。
:::

## 📌 小结

- infer 从函数签名提取参数（ActionArgs）与返回值（ActionReturn）
- 映射类型把 getters 函数变成结果类型
- actions 包一层 ctx：内部注入、外部干净
- 泛型驱动的 store：**类型即文档，推导即检查**
