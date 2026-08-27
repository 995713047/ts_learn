import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'ts-course-progress-v1'

interface Progress {
  completed: string[]      // 已完成的 lesson id
  quizScore: number         // 面试挑战最高分
  quizDone: boolean
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { completed: [], quizScore: 0, quizDone: false, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { completed: [], quizScore: 0, quizDone: false }
}

const progress = ref<Progress>(load())

watch(progress, (v) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch { /* ignore */ }
}, { deep: true })

export function useProgress() {
  const completed = computed(() => progress.value.completed)
  const isDone = (id: string) => progress.value.completed.includes(id)
  const toggleDone = (id: string) => {
    const i = progress.value.completed.indexOf(id)
    if (i >= 0) progress.value.completed.splice(i, 1)
    else progress.value.completed.push(id)
  }
  const recordQuiz = (score: number) => {
    if (score > progress.value.quizScore) progress.value.quizScore = score
    progress.value.quizDone = true
  }
  const reset = () => {
    progress.value.completed = []
    progress.value.quizScore = 0
    progress.value.quizDone = false
  }
  return { progress, completed, isDone, toggleDone, recordQuiz, reset }
}
