# TypeScript 大师课 · 从入门到精通

> 一份**可视化、可交互、可运行**的 TypeScript 完整教程。
> 20 节课 + 内置练习场 + 26 道测验题，零基础到面试冲刺一步到位。

一个基于 **Vue 3 + Vite** 的互动教学网站。它不只是"读"的教程——每一节课都配有代码示例，内置的 **TypeScript 练习场** 在浏览器里完成真实的类型检查与代码运行，让你边学边练。

---

## ✨ 功能特性

| 特性 | 说明 |
| --- | --- |
| 📚 **20 节课 · 8 大模块** | 从"为什么需要 TS"到"进阶路线图"，3882 行精心编写的内容 |
| 🖥️ **浏览器内 TypeScript 练习场** | 完整打包 TS 编译器，**严格模式**实时类型检查 + 沙箱运行你的代码 |
| 🎯 **26 道互动测验** | 每章配套选择题，答错有详细解析，可自我评分 |
| 💡 **面试专项** | 高频面试题深度解析：原理、对比、手写、易错点全覆盖 |
| 🧪 **4 个实战场景** | 类型安全 API 客户端、表单处理、Vue3 组合式 API、迷你状态管理库 |
| 📌 **进度追踪** | 学习进度自动保存在浏览器（localStorage），随时继续 |
| 🎨 **沉浸式阅读体验** | 深色主题、代码高亮、一键复制、提示/警告/练习/答案等富文本容器 |

## 🗺️ 课程目录

| 模块 | 课程 |
| --- | --- |
| 🚀 入门准备 | 01 为什么需要 TypeScript · 02 环境搭建与第一个程序 |
| 🧱 基础类型 | 03 基础类型全家桶 · 04 类型推断与类型断言 · 05 接口：描述对象形状 · 06 联合类型与类型收窄 |
| ⚙️ 函数与类 | 07 函数：参数、重载与 this · 08 类：封装、继承与抽象 |
| 🎁 泛型 | 09 泛型基础：类型参数化 · 10 泛型进阶：keyof 与条件类型 |
| 🔮 高级类型 | 11 高级类型：映射与工具类型 · 12 模板字面量类型 |
| 🏗️ 工程化 | 13 tsconfig 详解 · 14 模块与声明文件 |
| 🧪 实战演练 | 15 类型安全的 API 客户端 · 16 表单与事件处理 · 17 Vue3 组合式 API 类型设计 · 18 状态管理库的类型设计 |
| 🎯 面试冲刺 | 19 高频面试题深度解析 · 20 总结与进阶路线 |

## 🚀 快速开始

需要 **Node.js 18+**。

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 3. 构建生产版本（输出到 dist/）
npm run build

# 4. 本地预览生产构建
npm run preview
```

## 🎮 练习场使用指南

练习场是本站的核心亮点——**真实 TypeScript 编译器跑在浏览器里**：

- ✍️ **左侧编辑器**：写 TypeScript 代码（7 个内置示例可直接切换）
- ✅ **类型诊断面板**：实时（500ms 防抖）严格模式类型检查，错误精确到行/列
- ⚙️ **编译结果面板**：查看编译后的 JavaScript
- ▶️ **运行输出面板**：点击「运行代码」（或 Ctrl/⌘ + Enter），代码在沙箱 iframe 中执行，捕获 console 输出
- 🚦 有类型错误时禁止运行，先修复再执行——真实项目就是这样的

技术细节：类型检查通过 `typescript` npm 包 + 47 个标准库 `.d.ts` 声明文件在浏览器内完成（`moduleDetection: Force` 模块语义），执行走 `srcdoc` 沙箱 iframe。

## 📁 项目结构

```
ts-master-course/
├── index.html
├── vite.config.ts          # Vite 配置（@ 别名、端口）
├── tsconfig.json           # 严格模式 TS 配置
├── public/
│   └── favicon.svg
└── src/
    ├── main.ts             # 入口
    ├── App.vue             # 布局（导航/页脚）
    ├── router.ts           # Hash 路由
    ├── styles/main.css     # 全局样式（深色主题）
    ├── content/
    │   ├── course.ts       # 课程目录元数据（8 模块 / 20 课）
    │   ├── quiz.ts         # 26 道测验题
    │   └── lessons/        # 20 节课的 Markdown 源文件
    │       ├── 01-why-typescript.md
    │       └── ...
    ├── playground/
    │   ├── tsCompiler.ts   # 浏览器内类型检查 + 转译（手动 CompilerHost）
    │   ├── runner.ts       # 沙箱 iframe 代码执行器（srcdoc + ES Module）
    │   ├── samples.ts      # 7 个内置练习示例
    │   └── libs.ts         # 47 个 TS 标准库 .d.ts 声明（?raw 导入）
    ├── components/
    │   ├── MarkdownView.vue  # Markdown 渲染（高亮/复制/富容器）
    │   └── SideNav.vue       # 课程侧边导航
    ├── composables/
    │   └── useProgress.ts    # 进度持久化
    └── views/
        ├── HomeView.vue      # 首页（课程总览）
        ├── LessonView.vue    # 课程阅读页
        ├── PlaygroundView.vue# 练习场
        └── InterviewView.vue # 面试测验
```

## 🛠️ 技术栈

- **Vue 3.5** + **Vite 6** + **TypeScript 5.9**（全程 strict 模式）
- **vue-router 4**（hash 模式，适合静态部署）
- **markdown-it** + **markdown-it-container**（自定义提示/练习/面试容器）
- **highlight.js**（代码高亮，按需引入）
- **typescript**（浏览器内完整编译器，打包进练习场）

## 🌍 部署到 GitHub Pages

1. 在仓库 **Settings → Pages** 选择 `GitHub Actions` 部署
2. 或本地构建后推送 `dist/` 到 `gh-pages` 分支：

```bash
npm run build
npx gh-pages -d dist
```

> 路由使用 hash 模式，静态托管无需额外配置。

## 📄 License

MIT