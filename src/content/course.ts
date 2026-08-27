// 课程目录元数据
export interface Lesson {
  id: string
  title: string
  desc: string
  minutes: number
  file: () => Promise<unknown>
}

export interface LessonGroup {
  name: string
  icon: string
  blurb: string
  lessons: Lesson[]
}

export const GROUPS: LessonGroup[] = [
  {
    name: '入门准备',
    icon: '🚀',
    blurb: '认识 TypeScript 是什么、为什么值得学，并搭好开发环境',
    lessons: [
      { id: '01-why-typescript', title: '为什么需要 TypeScript', desc: 'JS 的痛点、TS 的承诺、静态类型能带来什么', minutes: 10, file: () => import('./lessons/01-why-typescript.md?raw') },
      { id: '02-setup', title: '环境搭建与第一个程序', desc: '安装、tsc、Vite 集成、hello world', minutes: 12, file: () => import('./lessons/02-setup.md?raw') }
    ]
  },
  {
    name: '基础类型',
    icon: '🧱',
    blurb: '类型系统的地基：基本类型、推断、接口、联合类型',
    lessons: [
      { id: '03-basic-types', title: '基础类型全家桶', desc: 'boolean/number/string/数组/元组/枚举/any/unknown/never…', minutes: 25, file: () => import('./lessons/03-basic-types.md?raw') },
      { id: '04-inference-assertion', title: '类型推断与类型断言', desc: '推断规则、as、!、const 断言、双重断言', minutes: 18, file: () => import('./lessons/04-inference-assertion.md?raw') },
      { id: '05-interface', title: '接口：描述对象形状', desc: '可选/只读/索引签名/函数类型/继承/interface vs type', minutes: 22, file: () => import('./lessons/05-interface.md?raw') },
      { id: '06-union-narrowing', title: '联合类型与类型收窄', desc: '联合/交叉类型、typeof/in/instanceof、类型守卫', minutes: 20, file: () => import('./lessons/06-union-narrowing.md?raw') }
    ]
  },
  {
    name: '函数与类',
    icon: '⚙️',
    blurb: '把逻辑组织起来：函数的类型体操与面向对象的类型设计',
    lessons: [
      { id: '07-functions', title: '函数：参数、重载与 this', desc: '默认值/可选/剩余参数/重载/this/泛型函数', minutes: 20, file: () => import('./lessons/07-functions.md?raw') },
      { id: '08-classes', title: '类：封装、继承与抽象', desc: '修饰符、readonly、getter/setter、抽象类、implements', minutes: 22, file: () => import('./lessons/08-classes.md?raw') }
    ]
  },
  {
    name: '泛型',
    icon: '🎁',
    blurb: '类型系统的灵魂：让类型像参数一样被复用',
    lessons: [
      { id: '09-generics-basic', title: '泛型基础：类型参数化', desc: '泛型函数/接口/类、extends 约束、默认类型', minutes: 25, file: () => import('./lessons/09-generics-basic.md?raw') },
      { id: '10-generics-advanced', title: '泛型进阶：keyof 与条件类型', desc: 'keyof、infer、条件类型、递归类型', minutes: 25, file: () => import('./lessons/10-generics-advanced.md?raw') }
    ]
  },
  {
    name: '高级类型',
    icon: '🔮',
    blurb: '从会用走向精通：映射类型、模板字面量、工具类型',
    lessons: [
      { id: '11-advanced-types', title: '高级类型：映射与工具类型', desc: '映射类型、内置工具类型全集、声明合并', minutes: 25, file: () => import('./lessons/11-advanced-types.md?raw') },
      { id: '12-template-literal-types', title: '模板字面量类型', desc: '字符串模板类型、模式匹配、字符串体操实战', minutes: 18, file: () => import('./lessons/12-template-literal-types.md?raw') }
    ]
  },
  {
    name: '工程化',
    icon: '🏗️',
    blurb: '把 TypeScript 用进真实项目：配置、模块与声明文件',
    lessons: [
      { id: '13-tsconfig', title: 'tsconfig 详解', desc: 'compilerOptions 精讲、strict 家族、路径别名、与 Vite 协作', minutes: 22, file: () => import('./lessons/13-tsconfig.md?raw') },
      { id: '14-modules-declarations', title: '模块与声明文件', desc: 'ESM 语义、import type、d.ts、@types、declare 模块', minutes: 20, file: () => import('./lessons/14-modules-declarations.md?raw') }
    ]
  },
  {
    name: '实战演练',
    icon: '🧪',
    blurb: '把知识用起来：四个贴近真实业务的场景项目',
    lessons: [
      { id: '15-scenario-api', title: '实战①：类型安全的 API 客户端', desc: '泛型封装 fetch、统一错误处理、接口类型设计', minutes: 30, file: () => import('./lessons/15-scenario-api.md?raw') },
      { id: '16-scenario-form', title: '实战②：表单与事件处理', desc: '受控表单、校验、事件类型、防抖与类型安全', minutes: 25, file: () => import('./lessons/16-scenario-form.md?raw') },
      { id: '17-scenario-vue3', title: '实战③：Vue3 组合式 API 类型设计', desc: 'ref/computed/props/emit/slots 的类型安全', minutes: 30, file: () => import('./lessons/17-scenario-vue3.md?raw') },
      { id: '18-scenario-store', title: '实战④：状态管理库的类型设计', desc: '从零实现迷你 store：泛型、订阅、类型推导', minutes: 30, file: () => import('./lessons/18-scenario-store.md?raw') }
    ]
  },
  {
    name: '面试冲刺',
    icon: '🎯',
    blurb: '高频面试题深度解析与完整的进阶路线图',
    lessons: [
      { id: '19-interview-deep', title: '高频面试题深度解析', desc: '20+ 道高频题：原理、对比、手写、易错点', minutes: 35, file: () => import('./lessons/19-interview-deep.md?raw') },
      { id: '20-roadmap', title: '总结与进阶路线', desc: '知识地图、学习路线、推荐资源、避坑清单', minutes: 15, file: () => import('./lessons/20-roadmap.md?raw') }
    ]
  }
]

export const ALL_LESSONS = GROUPS.flatMap(g => g.lessons)
export const LESSON_COUNT = ALL_LESSONS.length

export function findLesson(id: string) {
  const idx = ALL_LESSONS.findIndex(l => l.id === id)
  return { lesson: idx >= 0 ? ALL_LESSONS[idx] : null, index: idx }
}
