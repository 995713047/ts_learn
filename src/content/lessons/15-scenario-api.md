> **实战项目①**：封装一个类型安全的 API 客户端。这是前端最常见的场景——网络请求层，类型安全收益最大。

## 一、需求分析

```text
需求：
1. 统一的 request 函数：GET/POST/PUT/DELETE，返回类型化数据
2. 统一的错误类型：网络错误 / HTTP 错误 / 解析错误
3. 业务接口按"实体"建模，自动获得类型提示
4. 支持请求拦截（如自动带 token）
```

## 二、先设计错误类型（可辨识联合）

```ts
// 错误统一用可辨识联合，调用方可以精确收窄
export type ApiError =
  | { kind: 'network'; message: string }
  | { kind: 'http'; status: number; message: string }
  | { kind: 'parse'; message: string }

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'kind' in e
}
```

## 三、核心 request 函数

```ts
interface RequestOptions<TBody> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: TBody
  headers?: Record<string, string>
  timeout?: number
}

export async function request<TRes, TBody = never>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TRes> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeout ?? 15000)

  try {
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal
    })

    if (!res.ok) {
      throw {
        kind: 'http',
        status: res.status,
        message: `HTTP ${res.status}: ${res.statusText}`
      } satisfies ApiError
    }

    // 204 无内容
    if (res.status === 204) return undefined as TRes

    try {
      return (await res.json()) as TRes
    } catch {
      throw { kind: 'parse', message: '响应不是合法 JSON' } satisfies ApiError
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw { kind: 'network', message: '请求超时或已取消' } satisfies ApiError
    }
    if (isApiError(e)) throw e
    throw { kind: 'network', message: String((e as Error)?.message ?? e) } satisfies ApiError
  } finally {
    clearTimeout(timer)
  }
}
```

::: tip
`satisfies` 操作符（TS 4.9+）：保证对象符合类型**同时保留字面量类型**，比 `as` 更严格安全。
:::

## 四、按业务建模接口

```ts
// 实体类型
export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface CreateUserInput {
  name: string
  email: string
  role?: 'user' | 'admin'
}

// API 层：每个函数返回精确类型
export const userApi = {
  list: () => request<User[]>('/api/users'),
  get: (id: number) => request<User>(`/api/users/${id}`),
  create: (input: CreateUserInput) =>
    request<User, CreateUserInput>('/api/users', { method: 'POST', body: input }),
  update: (id: number, input: Partial<CreateUserInput>) =>
    request<User, Partial<CreateUserInput>>(`/api/users/${id}`, { method: 'PUT', body: input }),
  remove: (id: number) =>
    request<void>(`/api/users/${id}`, { method: 'DELETE' })
}
```

## 五、调用方的"天堂体验"

```ts
async function loadUser(id: number) {
  try {
    const user = await userApi.get(id)
    // user 自动是 User：有完整字段提示
    console.log(user.name.toUpperCase())

    // 批量操作
    const users = await userApi.list()
    const admins = users.filter((u) => u.role === 'admin')
  } catch (e) {
    if (isApiError(e)) {
      switch (e.kind) {
        case 'network':
          console.error('网络问题：', e.message)
          break
        case 'http':
          if (e.status === 404) console.error('用户不存在')
          else if (e.status === 401) console.error('未登录')
          break
        case 'parse':
          console.error('数据解析失败')
      }
    }
  }
}
```

**后端接口一旦变更**（字段改名/类型变化），所有调用点瞬间报错——这就是类型安全 API 层的价值：**错误发生在编译期，而不是线上运行时**。

## 六、场景演练：加上"自动重试"

::: exercise
为 request 增加"失败自动重试"能力：`retry` 选项（次数 + 延迟），网络错误时自动重试，HTTP 4xx/5xx 不重试（或可配置）。
:::

::: solution
```ts
interface RetryOptions { times: number; delayMs?: number }

async function requestWithRetry<TRes, TBody = never>(
  url: string,
  options: RequestOptions<TBody> & { retry?: RetryOptions } = {}
): Promise<TRes> {
  const { retry, ...rest } = options
  let lastError!: ApiError

  for (let attempt = 0; attempt <= (retry?.times ?? 0); attempt++) {
    try {
      return await request<TRes, TBody>(url, rest)
    } catch (e) {
      if (!isApiError(e)) throw e
      lastError = e
      // 只对网络错误重试；HTTP 错误默认不重试
      if (e.kind !== 'network') throw e
      if (attempt < (retry?.times ?? 0)) {
        await new Promise((r) => setTimeout(r, retry?.delayMs ?? 500 * 2 ** attempt))
      }
    }
  }
  throw lastError
}

// 使用：网络抖动最多重试 3 次，指数退避
const user = await requestWithRetry<User>('/api/users/1', {
  retry: { times: 3 }
})
```
:::

::: interview
**Q1：为什么 API 层最值得上类型？**
A：网络边界数据最不可信，类型让"后端约定"变成"编译期合同"；后端字段变更立即在编辑器暴露所有调用点。

**Q2：泛型在 request 里怎么用？**
A：`request<TRes, TBody>`——TRes 是响应类型，TBody 是请求体类型。调用时只传 TRes，TBody 由 body 参数推断。

**Q3：可辨识联合在错误处理里的好处？**
A：错误类型统一为 `{ kind: ... }`，switch 收窄后每个分支都安全；新增错误种类时，`default: never` 穷尽检查提醒所有处理点。
:::

## 📌 小结

- 统一 request：泛型返回值 + JSON 序列化 + 超时
- 错误用**可辨识联合**：network / http / parse
- 业务接口按实体建模，调用点全类型化
- `satisfies` 保证"形状正确且类型精确"
- 重试策略：只对网络错误重试，指数退避
