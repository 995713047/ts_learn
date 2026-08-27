<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MarkdownView from '../components/MarkdownView.vue'
import { ALL_LESSONS, findLesson } from '../content/course'
import { useProgress } from '../composables/useProgress'

const props = defineProps<{ id: string }>()
const { isDone, toggleDone } = useProgress()

const source = ref('')
const loading = ref(true)
const notFound = ref(false)

const lesson = computed(() => findLesson(props.id).lesson)
const index = computed(() => findLesson(props.id).index)
const prev = computed(() => (index.value > 0 ? ALL_LESSONS[index.value - 1] : null))
const next = computed(() => (index.value < ALL_LESSONS.length - 1 ? ALL_LESSONS[index.value + 1] : null))

watch(
  () => props.id,
  async (id) => {
    loading.value = true
    notFound.value = false
    source.value = ''
    const found = findLesson(id)
    if (!found.lesson) {
      notFound.value = true
      loading.value = false
      return
    }
    try {
      const mod = (await found.lesson!.file()) as { default: string }
      source.value = mod.default
    } catch (e) {
      notFound.value = true
      console.error(e)
    }
    loading.value = false
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="loading" class="empty">加载中…</div>
  <div v-else-if="notFound || !lesson" class="empty">
    <p style="font-size: 18px; margin-bottom: 12px">😢 找不到这节课</p>
    <RouterLink to="/" class="btn btn-ghost btn-sm">回到首页</RouterLink>
  </div>
  <div v-else>
    <div class="lesson-head">
      <div class="crumb">课程 {{ String(index + 1).padStart(2, '0') }} / {{ ALL_LESSONS.length }} · 约 {{ lesson.minutes }} 分钟</div>
      <h1>{{ lesson.title }}</h1>
      <p class="sub">{{ lesson.desc }}</p>
      <div class="lesson-toolbar">
        <button class="btn btn-sm" :class="isDone(lesson.id) ? 'btn-primary' : 'btn-ghost'" @click="toggleDone(lesson.id)">
          {{ isDone(lesson.id) ? '✓ 已学完，点击取消' : '✔ 标记为已学完' }}
        </button>
        <RouterLink to="/playground" class="btn btn-ghost btn-sm">⚡ 边学边练：打开练习场</RouterLink>
      </div>
    </div>

    <MarkdownView :source="source" />

    <nav class="pager">
      <RouterLink v-if="prev" :to="`/lesson/${prev.id}`">
        <span class="dir">← 上一课</span>
        <span class="tt">{{ prev.title }}</span>
      </RouterLink>
      <span v-else></span>
      <RouterLink v-if="next" :to="`/lesson/${next.id}`" class="next">
        <span class="dir">下一课 →</span>
        <span class="tt">{{ next.title }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
