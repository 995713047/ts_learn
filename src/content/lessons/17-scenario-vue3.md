> **实战项目③**：Vue3 组合式 API 的类型设计。Vue3 + TS 是当前前端主流组合，这一课把 props、emit、ref、provide/inject 全部类型化。

## 一、defineProps：声明组件输入

```vue
<script setup lang="ts">
// 泛型写法：类型完整 + 编辑器自动补全（推荐）
defineProps<{
  title: string
  count?: number                 // 可选
  items: string[]
  status: 'loading' | 'ready' | 'error'   // 字面量联合
}>()

// 或运行时声明写法（更早的方式）
// const props = defineProps({ title: String, count: Number })
</script>
```

::: tip
泛型写法是 **Vue 3.3+ 正式支持**的。类型即文档：组件使用者悬停就能看到完整 props 类型。
:::

## 二、defineEmits：声明组件事件

```vue
<script setup lang="ts">
interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'submit', payload: { value: string; at: Date }): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

function handleSubmit() {
  emit('submit', { value: 'hi', at: new Date() })
  // emit('submit', { value: 42 })  // ❌ 类型错误：payload 形状不对
}
</script>
```

## 三、ref / computed：响应式推断

```ts
import { ref, computed } from 'vue'

const count = ref(0)              // Ref<number>，自动推断
count.value++                     // ✓
// count.value = 'x'              // ❌

const name = ref<string | null>(null)   // 显式指定联合
name.value = '小明'                // ✓
name.value = null                 // ✓

// computed：返回值类型自动推导
const double = computed(() => count.value * 2)   // ComputedRef<number>
const display = computed(() => {
  if (name.value) return `你好，${name.value}`
  return '未登录'
})  // ComputedRef<string>
```

## 四、泛型组件：props 类型参数化

```vue
<!-- ListBox.vue -->
<script setup lang="ts" generic="T extends { id: number; name: string }">
defineProps<{
  items: T[]
  selectedId: number | null
}>()

const emit = defineEmits<{ (e: 'select', id: number): void }>()
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id" @click="emit('select', item.id)">
      {{ item.name }}
    </li>
  </ul>
</template>
```

```vue
<!-- 使用：T 自动推断为 User -->
<script setup lang="ts">
import ListBox from './ListBox.vue'

interface User { id: number; name: string; email: string }
const users = ref<User[]>([])
</script>

<template>
  <ListBox :items="users" :selected-id="1" @select="(id) => console.log(id)" />
</template>
```

::: tip
`<script setup lang="ts" generic="T">` 让组件本身变成"泛型组件"——传入什么类型的 items，组件内部就按什么类型工作。Vue 3.3+ 支持。
:::
## 五、provide / inject：跨层依赖的类型化

```ts
// types.ts：共享的"注入键"类型
import type { InjectionKey, Ref } from 'vue'

export const themeKey: InjectionKey<Ref<'light' | 'dark'>> = Symbol('theme')

// 父组件提供
import { provide, ref } from 'vue'
import { themeKey } from './types'
const theme = ref<'light' | 'dark'>('light')
provide(themeKey, theme)

// 任意后代注入：类型自动正确
import { inject } from 'vue'
import { themeKey } from './types'
const theme = inject(themeKey)          // Ref<'light' | 'dark'> | undefined
if (theme) {
  theme.value = 'dark'                   // ✓ 类型安全
}
```

::: warning
inject 可能返回 `undefined`（祖先没提供时）。要么提供默认值 `inject(key, defaultVal)`，要么收窄处理。
:::

## 六、v-model 的类型化封装

```vue
<!-- 自定义 v-model 组件 -->
<script setup lang="ts">
// 组件上 v-model="x" 等价于 :model-value="x" + @update:model-value
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  emit('update:modelValue', el.value)
}
</script>

<template>
  <input :value="modelValue" @input="onInput" />
</template>
```

## 七、场景演练：类型安全的分页列表

::: exercise
封装一个分页列表组件：props（数据源类型 T 泛化、每页条数）、事件（翻页）、内部状态（loading/error），全部类型安全。
:::

::: solution
```vue
<!-- PagedList.vue -->
<script setup lang="ts" generic="T">
import { ref, computed } from 'vue'

const props = defineProps<{
  items: T[]
  pageSize?: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'item-click', item: T): void   // 泛型事件：点击哪一项类型都正确
}>()

const current = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.items.length / (props.pageSize ?? 10))))

function go(p: number) {
  if (p < 1 || p > totalPages.value) return
  current.value = p
  emit('page-change', p)
}
</script>

<template>
  <div>
    <div v-if="loading" class="dim">加载中…</div>
    <ul v-else>
      <li v-for="item in items" :key="(item as any).id" @click="emit('item-click', item)">
        {{ (item as any).name }}
      </li>
    </ul>
    <div class="pager">
      <button :disabled="current === 1" @click="go(current - 1)">上一页</button>
      <span>{{ current }} / {{ totalPages }}</span>
      <button :disabled="current === totalPages" @click="go(current + 1)">下一页</button>
    </div>
  </div>
</template>
```

```vue
<!-- 使用：T = Product，一切类型自动 -->
<script setup lang="ts">
import PagedList from './PagedList.vue'
interface Product { id: number; name: string; price: number }
const products = ref<Product[]>([])
</script>

<template>
  <PagedList
    :items="products"
    :page-size="20"
    @item-click="(p) => console.log(p.price)"   <!-- p 自动是 Product -->
  />
</template>
```
:::

::: interview
**Q1：defineProps 泛型写法有什么好处？**
A：`defineProps<{...}>()` 让 props 有完整类型推导与编辑器提示，还能与 defineEmits 泛型联动。3.3+ 正式支持。

**Q2：泛型组件是什么？**
A：`<script setup generic="T">` 让 props 类型参数化，组件传入什么类型就按什么类型工作，常用于列表/表格等复用组件。

**Q3：provide/inject 怎么类型化？**
A：用 `InjectionKey<T>` 声明注入键。提供方和注入方共用同一个 key，类型自动一致；inject 可能返回 undefined，需要默认值或收窄。
:::

## 📌 小结

- defineProps / defineEmits 泛型写法 = 组件接口的类型合同
- ref/computed 自动推断；必要时显式标注联合
- `generic="T"` 让组件泛型化
- InjectionKey 类型化跨层依赖
- v-model 的本质：modelValue + update:modelValue
