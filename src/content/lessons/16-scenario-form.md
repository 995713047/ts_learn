> **实战项目②**：表单与事件处理。表单是前端最常见的"类型纠缠"场景——状态、校验、事件、防抖，处处是类型。

## 一、表单状态建模

```ts
// 字段名：从表单结构自动推导
interface LoginForm {
  username: string
  password: string
  remember: boolean
}

// 初始状态
const initialForm: LoginForm = {
  username: '',
  password: '',
  remember: false
}

// 校验错误：每个字段可有一条错误信息
type FormErrors = Partial<Record<keyof LoginForm, string>>

// 脏字段跟踪：哪个字段被用户改过
type DirtyFields = Partial<Record<keyof LoginForm, boolean>>
```

## 二、类型安全的校验器

```ts
type Validator<T> = (value: T) => string | null   // 返回错误信息或 null

const validators: { [K in keyof LoginForm]: Validator<LoginForm[K]> } = {
  username: (v) => {
    if (!v) return '用户名不能为空'
    if (v.length < 3) return '至少 3 个字符'
    return null
  },
  password: (v) => {
    if (!v) return '密码不能为空'
    if (v.length < 6) return '至少 6 位'
    return null
  },
  remember: () => null
}
```

::: tip
`{ [K in keyof LoginForm]: Validator<LoginForm[K]> }` ——**映射类型**保证校验器与字段一一对应：新增字段漏写校验器会编译报错！
:::

## 三、校验整个表单

```ts
function validateForm(form: LoginForm): FormErrors {
  const errors: FormErrors = {}
  for (const key of Object.keys(validators) as (keyof LoginForm)[]) {
    const error = validators[key](form[key])
    if (error) errors[key] = error
  }
  return errors
}
```

## 四、事件处理：类型要"对味"

```ts
// DOM 事件：输入框的 change / input
function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement   // 收窄目标
  console.log(target.value)
}

// 更精确：泛型事件处理
function handleInput<T extends HTMLElement>(e: Event, get: (el: T) => string): string {
  return get(e.target as T)
}

// 键盘事件
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    submitForm()
  }
}

// 提交事件：阻止默认行为
function onSubmit(e: SubmitEvent) {
  e.preventDefault()
  console.log('提交', form)
}
```

## 五、受控输入的完整组件（Vue 风格）

```vue
<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

interface LoginForm { username: string; password: string; remember: boolean }

const form = reactive<LoginForm>({ username: '', password: '', remember: false })
const errors = ref<FormErrors>({})
const submitting = ref(false)

function validateForm(form: LoginForm): FormErrors {
  const err: FormErrors = {}
  if (!form.username) err.username = '用户名不能为空'
  if (form.password.length < 6) err.password = '密码至少 6 位'
  return err
}

const isValid = computed(() => Object.keys(validateForm(form)).length === 0)

async function submit() {
  const e = validateForm(form)
  errors.value = e
  if (Object.keys(e).length > 0) return
  submitting.value = true
  try {
    // await api.login(form)
    console.log('登录中…', form)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="form.username" @input="errors.username = ''" placeholder="用户名" />
    <p v-if="errors.username" class="err">错误提示</p>

    <input v-model="form.password" type="password" @input="errors.password = ''" placeholder="密码" />
    <p v-if="errors.password" class="err">错误提示</p>

    <label><input v-model="form.remember" type="checkbox" /> 记住我</label>

    <button :disabled="!isValid || submitting">提交</button>
  </form>
</template>
```

## 六、场景演练：带防抖的搜索框

::: exercise
写一个"输入即搜索"的搜索框：输入防抖 300ms、支持请求竞态处理（只有最后一次请求的结果生效）、结果列表类型安全。
:::

::: solution
```ts
interface SearchResult { id: number; title: string; url: string }

function useSearch() {
  let timer: ReturnType<typeof setTimeout> | null = null
  let seq = 0

  async function search(keyword: string): Promise<SearchResult[]> {
    // 防抖
    return new Promise((resolve) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => resolve(doFetch(keyword)), 300)
    })
  }

  async function doFetch(keyword: string): Promise<SearchResult[]> {
    const mySeq = ++seq          // 竞态序号
    const data = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`).then(r => r.json()) as SearchResult[]
    // 只接受"最后一次"请求的结果
    if (mySeq === seq) return data
    return []
  }

  return { search }
}

// 使用
const { search } = useSearch()
search('vue').then((results) => {
  console.log(results.map(r => r.title))   // SearchResult[]
})
```
:::

::: interview
**Q1：表单校验的类型如何和字段联动？**
A：用映射类型 `Partial<Record<keyof T, string>>` 定义错误表，用 `{ [K in keyof T]: Validator<T[K]> }` 定义校验器——字段增删自动联动编译检查。

**Q2：事件处理中 e.target 为什么需要收窄？**
A：`e.target` 是 `EventTarget | null`，没有 value 属性。用 `as HTMLInputElement` 或 `instanceof HTMLInputElement` 收窄后才能安全访问。

**Q3：什么是竞态问题？如何类型安全地解决？**
A：快速连续输入时，旧请求可能后返回覆盖新结果。用序号（seq）标记请求，只接受最后一次。类型层面保证返回的仍是 SearchResult[]。
:::

## 📌 小结

- 表单模型三件套：Form、Errors（Partial<Record<keyof>>）、Dirty
- 映射类型让校验器与字段"锁死"
- DOM 事件类型：Event / KeyboardEvent / SubmitEvent + target 收窄
- 防抖 + 竞态序号是搜索框的标配
