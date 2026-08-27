<script setup lang="ts">
import { computed } from 'vue'
import { GROUPS, LESSON_COUNT } from '../content/course'
import { useProgress } from '../composables/useProgress'

const { completed } = useProgress()
const doneCount = computed(() => completed.value.length)
const groupProgress = (ids: string[]) =>
  Math.round((ids.filter((id) => completed.value.includes(id)).length / ids.length) * 100)

const features = [
  { icon: '🧱', title: '覆盖全面', desc: '从基础类型到映射类型、模板字面量类型，20 课系统化进阶，不留死角' },
  { icon: '🎨', title: '生动易学', desc: '大量比喻、对比表格、图解与生活化例子，让抽象的类型概念变得具体' },
  { icon: '🧪', title: '场景演练', desc: '每课内置实战演练与参考答案，还有 4 个贴近真实业务的完整实战项目' },
  { icon: '⚡', title: '在线练习场', desc: '浏览器内实时 TypeScript 类型检查 + 编译运行，边学边练立刻见效' },
  { icon: '🎯', title: '面试冲刺', desc: '20+ 高频面试题深度解析 + 交互式面试挑战，自我检验学习成果' },
  { icon: '🗺️', title: '进阶路线', desc: '完整的知识地图与学习路线，从入门到精通的每一步都清晰可见' }
]
</script>

<template>
  <div>
    <section class="hero">
      <span class="hero-tag">📖 从零到精通的 TypeScript 完全教程</span>
      <h1>像侦探一样推理类型，<br />像工程师一样写出不会崩的代码</h1>
      <p>
        TypeScript 是 JavaScript 的"超集"——它在不改变你写代码习惯的前提下，给代码加上了一层
        <strong style="color: #fff">静态类型保险</strong>。本教程用 20 节课、4 个实战项目、20+ 道面试题，
        带你从「听说过 TS」到「写出优雅的类型安全代码」。
      </p>
      <div class="hero-actions">
        <RouterLink to="/lesson/01-why-typescript" class="btn btn-primary">🚀 开始第一课</RouterLink>
        <RouterLink to="/playground" class="btn btn-ghost">⚡ 先去练习场玩一玩</RouterLink>
      </div>
      <div class="stats-row">
        <div class="stat-card"><b>{{ LESSON_COUNT }}</b><span>节系统课程</span></div>
        <div class="stat-card"><b>4</b><span>个实战项目</span></div>
        <div class="stat-card"><b>20+</b><span>道面试题</span></div>
        <div class="stat-card"><b>100%</b><span>在线练习</span></div>
        <div class="stat-card"><b>{{ doneCount }}/{{ LESSON_COUNT }}</b><span>你的进度</span></div>
      </div>
    </section>

    <h2 class="section-title">📚 课程目录</h2>
    <p class="section-sub">按顺序学习效果最佳，也可以直接跳到感兴趣的章节。每课约 10~35 分钟。</p>

    <div v-for="(group, gi) in GROUPS" :key="group.name" class="module-card">
      <div class="module-head">
        <span class="icon">{{ group.icon }}</span>
        <h3>{{ gi + 1 }}. {{ group.name }}</h3>
        <span class="blurb">{{ group.blurb }}</span>
      </div>
      <div class="module-progress">
        <div :style="{ width: groupProgress(group.lessons.map(l => l.id)) + '%' }"></div>
      </div>
      <div class="lesson-grid">
        <RouterLink
          v-for="lesson in group.lessons"
          :key="lesson.id"
          :to="`/lesson/${lesson.id}`"
          class="lesson-card"
          :class="{ done: completed.includes(lesson.id) }"
        >
          <div class="row">
            <span class="num">{{ String(gi + 1).padStart(2, '0') }}-{{ String(group.lessons.indexOf(lesson) + 1).padStart(2, '0') }}</span>
            <h4>{{ lesson.title }}</h4>
          </div>
          <p>{{ lesson.desc }}</p>
          <div class="meta"><span>⏱ 约 {{ lesson.minutes }} 分钟</span><span v-if="completed.includes(lesson.id)" style="color: var(--green)">已完成 ✓</span></div>
        </RouterLink>
      </div>
    </div>

    <h2 class="section-title">✨ 本教程特色</h2>
    <p class="section-sub">为「真正学会」而设计，而不是只看看而已。</p>
    <div class="feature-grid">
      <div v-for="f in features" :key="f.title" class="feature-card">
        <div class="f-icon">{{ f.icon }}</div>
        <h4>{{ f.title }}</h4>
        <p>{{ f.desc }}</p>
      </div>
    </div>

    <h2 class="section-title">🧭 推荐学习路径</h2>
    <p class="section-sub">三种起点，任选其一，最终汇合到实战。</p>
    <div class="feature-grid">
      <div class="feature-card">
        <h4>🌱 零基础新手</h4>
        <p>01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15~18 实战 → 19 面试</p>
      </div>
      <div class="feature-card">
        <h4>🚶 熟悉 JS 的开发者</h4>
        <p>跳过 01~02，从 03 开始；重点攻克 09~12 的高级类型，然后直接进入 15~18 实战项目。</p>
      </div>
      <div class="feature-card">
        <h4>🏃 面试冲刺者</h4>
        <p>快速过 03~12 的代码示例，精读 19 面试深度解析，最后用「面试挑战」页自测。</p>
      </div>
    </div>
  </div>
</template>
