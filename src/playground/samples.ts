export interface Sample {
  name: string
  desc: string
  code: string
}

export const SAMPLES: Sample[] = [
  {
    name: '基础类型与推断',
    desc: '看看 TS 如何推断与约束类型',
    code: `// TS 会通过"初始化"自动推断类型
let age = 25           // 推断为 number
let name = '小明'       // 推断为 string
let isOk = true        // 推断为 boolean

// 显式标注类型（当作"合同"）
const score: number = 99
const tags: string[] = ['ts', 'vue', 'vite']

// 尝试取消注释下面这行，看看类型错误
// age = '二十岁'  // ❌ 不能把 string 赋给 number

// 元组：固定长度与顺序
const user: [string, number] = ['小明', 18]

// 联合类型 + 收窄
let id: number | string = 'abc123'
if (typeof id === 'string') {
  console.log('是字符串，长度', id.length)
} else {
  console.log('是数字，值', id)
}

console.log('age =', age, '| name =', name)
console.log('tags =', tags, '| user =', user)`
  },
  {
    name: '接口与对象',
    desc: '用 interface 描述对象形状',
    code: `// 接口 = 对象的"合同"
interface User {
  id: number
  name: string
  age?: number        // 可选属性
  readonly email: string  // 只读属性
  greet(msg: string): string  // 方法
}

const user: User = {
  id: 1,
  name: '小红',
  email: 'hong@example.com',
  greet: (m) => m + ', 我是' + '小红'
}

console.log(user.greet('你好'))
// user.email = 'x'   // ❌ 只读属性不能赋值

// 接口可以继承
interface Admin extends User {
  role: 'admin' | 'super'
}

const admin: Admin = {
  id: 2,
  name: '管理员',
  email: 'admin@example.com',
  role: 'admin',
  greet: (m) => m
}

// 索引签名：任意键都是 string
interface Dict {
  [key: string]: number
}
const scores: Dict = { math: 90, english: 85 }
console.log('scores:', scores)`
  },
  {
    name: '联合类型与收窄',
    desc: '类型守卫：像侦探一样缩小范围',
    code: `type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rect'; w: number; h: number }

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2
    case 'square': return s.side ** 2
    case 'rect':   return s.w * s.h
  }
}

console.log('圆面积 =', area({ kind: 'circle', radius: 2 }).toFixed(2))
console.log('方形面积 =', area({ kind: 'square', side: 3 }))
console.log('矩形面积 =', area({ kind: 'rect', w: 4, h: 5 }))

// 自定义类型守卫
function isString(v: unknown): v is string {
  return typeof v === 'string'
}
const maybe: unknown = 'hello'
if (isString(maybe)) {
  console.log('确认是字符串：', maybe.toUpperCase())
}`
  },
  {
    name: '泛型函数',
    desc: '让类型像参数一样复用',
    code: `// 泛型 = 类型的"占位符"，调用时确定
function identity<T>(value: T): T {
  return value
}
console.log(identity<string>('abc'))
console.log(identity(42))          // 自动推断 T = number

// 泛型约束：T 必须满足某些条件
function first<T extends { length: number }>(arr: T): number {
  return arr.length
}
console.log('length:', first('hello'), first([1, 2, 3]))

// 泛型 + keyof：安全的属性读取
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const person = { name: '小明', age: 20, city: '北京' }
console.log(getProp(person, 'name'), getProp(person, 'age'))
// getProp(person, 'xxx')  // ❌ 类型错误：xxx 不在 keyof 里

// 泛型工具：数组反转后保持类型
function reverse<T>(list: T[]): T[] {
  return [...list].reverse()
}
console.log(reverse([1, 2, 3]), reverse(['a', 'b']))`
  },
  {
    name: '类与修饰符',
    desc: '面向对象 + 类型设计',
    code: `abstract class Animal {
  constructor(protected name: string) {}
  abstract speak(): void          // 抽象方法：子类必须实现
  describe(): void {
    console.log(\`\${this.name} 在叫\`)
  }
}

class Dog extends Animal {
  constructor(name: string, private breed: string) {
    super(name)
  }
  speak(): void { console.log('汪汪！') }
  get fullName(): string { return \`\${this.name}(\${this.breed})\` }
}

class Cat extends Animal {
  speak(): void { console.log('喵～') }
}

const dog = new Dog('旺财', '金毛')
dog.speak()
dog.describe()
console.log('名字:', dog.fullName)
// console.log(dog.breed)  // ❌ private，外部不可访问

const cat = new Cat('咪咪')
cat.speak()

// 接口 + implements：类必须符合形状
interface Logger { log(msg: string): void }
class ConsoleLogger implements Logger {
  log(msg: string): void { console.log('[LOG]', msg) }
}
new ConsoleLogger().log('hello')`
  },
  {
    name: '工具类型与映射',
    desc: '从已有类型"推导"新类型',
    code: `interface Todo {
  title: string
  desc: string
  done: boolean
  id: number
}

// Partial：全部变为可选
type PartialTodo = Partial<Todo>
// Readonly：全部变为只读
type ReadonlyTodo = Readonly<Todo>
// Pick：挑选部分属性
type TodoPreview = Pick<Todo, 'title' | 'done'>
// Omit：排除部分属性
type TodoWithoutId = Omit<Todo, 'id'>
// Record：构造键值映射
type NameMap = Record<string, number>

const p: PartialTodo = { title: '只填一个字段也行' }
const preview: TodoPreview = { title: '写作业', done: false }

console.log('Partial 示例:', p)
console.log('Pick 示例:', preview)

// 映射类型：批量改写属性
type Nullable<T> = { [K in keyof T]: T[K] | null }
const n: Nullable<Todo> = { title: null, desc: 'x', done: null, id: null }
console.log('Nullable:', n)

// 条件类型 + infer
type ElementOf<T> = T extends (infer E)[] ? E : never
type Num = ElementOf<number[]>   // number
const x: Num = 42
console.log('ElementOf<number[]> =', typeof x)`
  },
  {
    name: '类型安全购物车',
    desc: '综合小案例：多态 + 收窄 + 泛型',
    code: `// 用可辨识联合建模"购物车条目"
type CartItem =
  | { kind: 'book'; title: string; price: number; pages: number }
  | { kind: 'digital'; name: string; price: number; sizeMB: number }
  | { kind: 'coupon'; code: string; discount: number }

const cart: CartItem[] = [
  { kind: 'book', title: 'TS 大师课', price: 59, pages: 400 },
  { kind: 'digital', name: '电子书', price: 29, sizeMB: 5 },
  { kind: 'coupon', code: 'TS2024', discount: 10 }
]

function checkout(items: CartItem[]): number {
  let total = 0
  for (const item of items) {
    switch (item.kind) {
      case 'book':
        total += item.price
        console.log('📖', item.title, item.pages, '页')
        break
      case 'digital':
        total += item.price
        console.log('💾', item.name, item.sizeMB, 'MB')
        break
      case 'coupon':
        total -= item.discount
        console.log('🎟️', item.code, '优惠', item.discount)
        break
    }
  }
  return Math.max(0, total)
}

console.log('合计:', checkout(cart))`
  },
]
