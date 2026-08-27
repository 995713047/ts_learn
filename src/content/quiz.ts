export interface QuizQuestion {
  q: string
  tag: string
  options: string[]
  answer: number
  explain: string
  code?: string
}

export const QUIZ: QuizQuestion[] = [
  {
    q: "TypeScript 相比 JavaScript 最核心的价值是什么？",
    tag: "基础概念",
    options: ["运行速度更快", "在编译期提供静态类型检查，提前发现错误并提升可维护性", "让代码可以在任何浏览器运行", "替代 CSS"],
    answer: 1,
    explain: "TS 是 JS 的超集，核心价值是\"静态类型\"：在开发期（编译期）就能发现类型错误，配合编辑器提供智能提示与重构支持。运行时速度并不会因此变快。"
  },
  {
    q: "any 与 unknown 的区别是什么？",
    tag: "基础类型",
    options: ["没有区别", "unknown 是 any 的别名", "any 关闭类型检查；unknown 是\"未知类型\"，使用时必须先收窄，更安全", "any 只能用于数字"],
    answer: 2,
    explain: "any 相当于放弃类型检查，可以随便赋值和调用；unknown 表示\"还不知道是什么\"，直接使用（如调用方法）会报错，必须先通过 typeof 等收窄。unknown 是类型安全的 any。"
  },
  {
    q: "下面哪个类型能表示\"永远不会返回\"的函数？",
    tag: "基础类型",
    options: ["void", "never", "undefined", "null"],
    answer: 1,
    explain: "never 表示永远不会返回：抛异常、死循环等。void 表示\"返回 undefined\"，函数还是会结束。never 也是联合类型中被排除的空类型（string | never 就是 string）。"
  },
  {
    q: "interface 与 type alias 最主要的区别之一是？",
    tag: "接口",
    options: ["type 不能描述对象", "interface 支持声明合并（重复声明自动合并），type 不行", "interface 不能继承", "没有区别"],
    answer: 1,
    explain: "同名 interface 可以多次声明并自动合并（声明合并），type 不允许重复声明。另外 type 更灵活（联合、交叉、元组、工具类型等），interface 更擅长描述对象与类实现。"
  },
  {
    q: "关于 readonly 修饰符，下列说法正确的是？",
    tag: "接口",
    options: ["readonly 是运行时约束，运行时会拦截赋值", "readonly 只是编译期约束，运行时对象仍可被修改", "readonly 只能用于 class", "readonly 属性不能有默认值"],
    answer: 1,
    explain: "readonly 只在编译期阻止赋值，编译后的 JS 没有任何保护，对象在运行时仍可被改。真正的不可变需要 Object.freeze 等运行时手段。"
  },
  {
    q: "类型收窄（narrowing）指的是？",
    tag: "类型收窄",
    options: ["把宽类型变成窄类型的过程：通过 typeof / in / instanceof / 判别字段缩小联合类型范围", "压缩代码体积", "减少泛型数量", "删除多余属性"],
    answer: 0,
    explain: "收窄 = 在代码分支中，编译器根据条件判断（typeof、in、instanceof、可辨识联合的 kind 字段、自定义守卫）把联合类型缩窄为更具体的类型，从而安全访问属性。"
  },
  {
    q: "以下哪个是合法的自定义类型守卫写法？",
    tag: "类型收窄",
    options: ["function isNum(x: unknown): boolean { return typeof x === \"number\" }", "function isNum(x: unknown): x is number { return typeof x === \"number\" }", "function isNum(x: number): boolean { ... }", "type isNum = (x: unknown) => boolean"],
    answer: 1,
    explain: "类型守卫的签名是\"参数 is 类型\"，返回布尔值。编译器据此在 true 分支把参数收窄为指定类型。普通 boolean 返回值没有收窄能力。"
  },
  {
    q: "函数重载（overload）在 TS 中的作用是？",
    tag: "函数",
    options: ["同一函数可以定义多个运行时实现", "为同一个函数声明多个调用签名，让调用方根据参数获得精确的类型推导", "替代默认参数", "让函数可以递归"],
    answer: 1,
    explain: "重载 = 多个签名 + 一个实现。签名决定调用时的类型检查，实现必须兼容所有签名。运行时仍是同一个函数，没有多个实现。"
  },
  {
    q: "泛型 <T extends Constraint> 的含义是？",
    tag: "泛型",
    options: ["T 必须是 Constraint 的实例", "T 是 Constraint 的父类型", "T 必须满足（受限于）Constraint，即 T 是 Constraint 或其子类型", "T 只能等于 Constraint"],
    answer: 2,
    explain: "extends 在这里是\"约束/子类型关系\"：T 必须是 Constraint 或其子类型。例如 T extends { length: number } 表示 T 必须具有 length 属性。"
  },
  {
    q: "keyof T 的结果是什么？",
    tag: "泛型",
    options: ["T 的所有属性值的类型", "T 的所有键组成的联合类型（字符串字面量联合）", "T 的方法列表", "T 的长度"],
    answer: 1,
    explain: "keyof T 提取 T 的所有键组成联合类型，如 keyof {a: number; b: string} = \"a\" | \"b\"。常配合泛型约束 K extends keyof T 实现安全的属性访问。"
  },
  {
    q: "infer 关键字在条件类型中用于？",
    tag: "高级类型",
    options: ["声明变量", "从条件类型匹配的结构中\"提取\"并推断出类型变量", "实现类型继承", "禁用类型推断"],
    answer: 1,
    explain: "infer 只能出现在条件类型的 extends 右侧，如 T extends (infer E)[] ? E : never，把匹配到的元素类型\"抽取\"出来。内置 ReturnType、Parameters、Awaited 等都基于它。"
  },
  {
    q: "Omit<T, K> 与 Pick<T, K> 分别做什么？",
    tag: "工具类型",
    options: ["Omit 排除 K 得到剩余属性组成的类型；Pick 只保留 K 属性", "两者一样", "Omit 删除运行时属性；Pick 添加属性", "Omit 只能用于接口"],
    answer: 0,
    explain: "Pick<T, K> 从 T 中挑出 K 键；Omit<T, K> 从 T 中去掉 K 键。Omit 内部实现是 Pick<T, Exclude<keyof T, K>>。"
  },
  {
    q: "映射类型 { [K in keyof T]: ... } 的作用是？",
    tag: "高级类型",
    options: ["遍历数组", "对 T 的每个键批量生成新属性，可用于把属性改造成可选/只读/加 null 等", "创建新对象", "删除 T 的所有属性"],
    answer: 1,
    explain: "映射类型通过 keyof + in 遍历一个类型的键，批量转换每个属性的类型。Partial、Readonly 等都是用它实现的：{ [K in keyof T]?: T[K] }。"
  },
  {
    q: "strict: true 开启后，下列哪个检查不会自动开启？",
    tag: "工程化",
    options: ["strictNullChecks（null/undefined 严格检查）", "noImplicitAny（隐式 any 报错）", "skipLibCheck（跳过 .d.ts 检查）", "strictFunctionTypes（函数参数逆变检查）"],
    answer: 2,
    explain: "strict 是 noImplicitAny、strictNullChecks、strictFunctionTypes、strictBindCallApply、strictPropertyInitialization、noImplicitThis、useUnknownInCatchVariables、alwaysStrict 的合集。skipLibCheck 不在其中，需要单独开启。"
  },
  {
    q: "strictNullChecks 开启后，string | null 类型的变量直接调用 .length 会？",
    tag: "工程化",
    options: ["正常运行", "编译报错，必须先做空值收窄（如 if (v !== null) 或 ?. 可选链）", "运行时报错", "自动转为 any"],
    answer: 1,
    explain: "开启后 null/undefined 不再能赋给普通类型，必须显式处理。这是 TS 最\"值钱\"的检查之一，能消灭大量 NPE（空指针异常）。"
  },
  {
    q: "非空断言 ! 的作用与风险是？",
    tag: "类型断言",
    options: ["运行时把值变成非空", "告诉编译器\"这个值一定不是 null/undefined\"，绕过检查；若运行时真为空则崩", "删除属性", "把字符串转数字"],
    answer: 1,
    explain: "! 只是编译期断言，不产生任何运行时代码。它关闭了空值检查，若实际为空会在运行时报错。能用收窄或可选链解决时尽量不用 !。"
  },
  {
    q: "TS 编译后的运行时开销是？",
    tag: "基础概念",
    options: ["体积增加一倍", "类型在编译期被擦除，运行时几乎零开销（仅个别新语法需转译）", "运行变慢 50%", "必须依赖 Node 运行"],
    answer: 1,
    explain: "类型注解、接口、泛型都是编译期概念，编译后全部擦除，不产生运行时开销。enum、装饰器等会生成少量运行时代码，但整体开销极低。"
  },
  {
    q: "declare 关键字的作用是？",
    tag: "声明文件",
    options: ["声明变量并赋值", "告诉编译器\"这个变量/模块已存在于环境中\"，用于 .d.ts 描述 JS 库，不产生运行时代码", "创建一个新模块", "禁用类型检查"],
    answer: 1,
    explain: "declare 用于\"环境声明\"：描述运行时已经存在的全局变量、模块、函数等。declare const / declare module / declare global 常见于 .d.ts 文件与第三方库的类型描述。"
  },
  {
    q: "关于 .d.ts 文件，正确的说法是？",
    tag: "声明文件",
    options: ["里面可以写业务逻辑", "只包含类型声明，编译后不产生 JS 文件，用于描述模块的形状", "必须放在 src 目录", "只能手写，不能自动生成"],
    answer: 1,
    explain: ".d.ts = declaration file，只含类型信息。编译器用它做类型检查，但不产出运行代码。可以手写，也可用 tsc --declaration 自动从源码生成。"
  },
  {
    q: "class 中 private 与 #私有字段的区别是？",
    tag: "类",
    options: ["没有区别", "private 是编译期约束（运行时属性仍可访问）；# 是 JS 原生私有，运行时真正不可访问", "# 只能用于接口", "private 只能在构造函数中使用"],
    answer: 1,
    explain: "TS 的 private 只是编译期检查，编译后只是普通属性；#field 是 ES 原生私有字段，运行时也受保护（通过 WeakMap 实现），无法从外部访问。"
  },
  {
    q: "在 Vue3 + TS 中，defineProps 泛型写法的作用是？",
    tag: "实战",
    options: ["设置默认值", "让 props 获得完整的类型推导与编辑器提示（如 defineProps<{ id: number }>()）", "替代 defineEmits", "让组件无法传参"],
    answer: 1,
    explain: "defineProps<{...}>() 以泛型方式声明 props 类型，编译器与编辑器可据此推导出组件 props 的完整类型，实现类型安全与自动补全。"
  },
  {
    q: "实现一个\"深拷贝后保持类型\"的函数，最合适的签名是？",
    tag: "实战",
    options: ["function clone<T>(obj: T): T", "function clone(obj: any): any", "function clone<T extends object>(obj: T): T", "function clone(obj: object): object"],
    answer: 2,
    explain: "T extends object 约束传入必须是对象，返回值 T 保持原类型。用 any/object 会丢失类型信息。"
  },
  {
    q: "条件类型：type X = string extends any ? true : false 的结果是？",
    tag: "高级类型",
    options: ["true", "false", "any", "编译报错"],
    answer: 0,
    explain: "string 是 any 的子类型，条件成立，结果为 true 字面量类型。条件类型常用于基于类型关系的分支逻辑。"
  },
  {
    q: "关于模板字面量类型，正确的是？",
    tag: "高级类型",
    options: ["只在运行时拼接字符串", "可以在类型层面定义字符串模式（如 `on${Capitalize<string>}`），用于校验字符串结构", "与普通字符串类型没有区别", "只能用于 URL"],
    answer: 1,
    explain: "模板字面量类型在类型层面对字符串做\"模式匹配\"，如 type EventName = `on${Capitalize<string>}`，能约束事件名格式，还能与 infer 结合做字符串解析。"
  },
  {
    q: "tsconfig.json 中 moduleResolution 的 bundler 模式适合？",
    tag: "工程化",
    options: ["Node 传统 CJS 项目", "使用 Vite / webpack 等打包器的现代项目", "纯浏览器原生 ESM", "任何项目都一样"],
    answer: 1,
    explain: "bundler 模式允许按打包器的解析规则（支持 exports 字段、允许无扩展名导入等）解析模块，是 Vite + TS 项目的推荐配置。"
  },
  {
    q: "工具类型 Awaited<T> 的作用是？",
    tag: "工具类型",
    options: ["等待函数执行", "递归展开 Promise：Awaited<Promise<Promise<number>>> = number", "把普通类型变成异步", "取消 Promise"],
    answer: 1,
    explain: "Awaited<T> 递归地解开 Promise 类型，得到最终值类型。常配合 async 函数返回值使用，简化异步类型推导。"
  },
]
