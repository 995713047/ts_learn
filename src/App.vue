<script setup lang="ts">
import { computed } from 'vue'
import { useProgress } from './composables/useProgress'
import { LESSON_COUNT } from './content/course'

const { completed } = useProgress()
const doneCount = computed(() => completed.value.length)
const pct = computed(() => Math.round((doneCount.value / LESSON_COUNT) * 100))
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink to="/" class="logo">
        <span class="logo-badge">TS</span>
        <span>TypeScript 大师课<small> · 从入门到精通</small></span>
      </RouterLink>
      <nav class="main-nav">
        <RouterLink to="/" class="nav-link" :class="{ active: $route.path === '/' }">课程首页</RouterLink>
        <RouterLink to="/playground" class="nav-link" :class="{ active: $route.path === '/playground' }">类型练习场</RouterLink>
        <RouterLink to="/interview" class="nav-link" :class="{ active: $route.path === '/interview' }">面试挑战</RouterLink>
      </nav>
      <div class="header-right">
        <div class="progress-chip" :title="`已完成 ${doneCount} / ${LESSON_COUNT} 课`">
          📚 进度 <b>{{ pct }}%</b>
        </div>
      </div>
    </header>

    <div class="app-body">
      <SideNav v-if="$route.path.startsWith('/lesson')" />
      <main class="app-main" :style="$route.path.startsWith('/lesson') ? {} : { maxWidth: 1000, margin: '0 auto', width: '100%' }">
        <RouterView />
      </main>
    </div>

    <footer class="app-footer">
      TypeScript 大师课 · 免费开源教程 · 建议配合 <a href="https://www.typescriptlang.org/play" target="_blank" rel="noopener">TS Playground</a> 一起练习 💙
    </footer>
  </div>
</template>

<script lang="ts">
import SideNav from './components/SideNav.vue'
export default { components: { SideNav } }
</script>
