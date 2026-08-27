<script setup lang="ts">
import { ref, computed } from 'vue'
import { QUIZ } from '../content/quiz'
import { useProgress } from '../composables/useProgress'

const { recordQuiz } = useProgress()

interface AnswerState {
  picked: number | null
  submitted: boolean
}

const answers = ref<AnswerState[]>(QUIZ.map(() => ({ picked: null, submitted: false })))
const showResults = ref(false)

const score = computed(() => {
  let s = 0
  QUIZ.forEach((q, i) => {
    if (answers.value[i].submitted && answers.value[i].picked === q.answer) s++
  })
  return s
})

function submit() {
  answers.value = answers.value.map((a) => ({ ...a, submitted: true }))
  showResults.value = true
  recordQuiz(score.value)
}

function reset() {
  answers.value = QUIZ.map(() => ({ picked: null, submitted: false }))
  showResults.value = false
}

const verdict = computed(() => {
  const pct = (score.value / QUIZ.length) * 100
  if (pct >= 90) return { emoji: '🏆', text: '大神级别！你可以去面试官了' }
  if (pct >= 70) return { emoji: '🎉', text: '很不错！再巩固一下薄弱点' }
  if (pct >= 50) return { emoji: '💪', text: '有基础了，建议回看对应章节' }
  return { emoji: '📖', text: '建议系统重学一遍课程再回来挑战' }
})

function optClass(i: number, qIdx: number) {
  const a = answers.value[qIdx]
  if (!a.submitted) return a.picked === i ? 'selected' : ''
  if (i === QUIZ[qIdx].answer) return 'correct'
  if (a.picked === i) return 'wrong'
  return ''
}
</script>

<template>
  <div>
    <div class="quiz-head">
      <h1>🎯 面试挑战</h1>
      <p>共 {{ QUIZ.length }} 道高频面试选择题。先独立作答，再提交查看解析。答完记得查看课程第 19 课的深度解析。</p>
      <div class="quiz-score">
        <template v-if="!showResults">
          已作答 <b>{{ answers.filter(a => a.picked !== null).length }}</b> / {{ QUIZ.length }}
        </template>
        <template v-else>
          得分 <b>{{ score }} / {{ QUIZ.length }}</b>
          <span>{{ verdict.emoji }} {{ verdict.text }}</span>
        </template>
      </div>
    </div>

    <div v-if="showResults" class="container-box box-info" style="margin-bottom: 18px">
      <div class="box-title">{{ verdict.emoji }} {{ verdict.text }}</div>
      <p>正确率 {{ Math.round((score / QUIZ.length) * 100) }}%。做错的题目下方有解析，建议回到对应章节复习后重测。</p>
    </div>

    <div v-for="(q, qi) in QUIZ" :key="qi" class="quiz-card">
      <div class="quiz-q">
        <div class="q-num">{{ qi + 1 }}</div>
        <div class="q-title">
          {{ q.q }}
          <span class="q-tag">{{ q.tag }}</span>
        </div>
      </div>
      <div class="quiz-opts">
        <label
          v-for="(opt, oi) in q.options"
          :key="oi"
          class="quiz-opt"
          :class="optClass(oi, qi)"
        >
          <input
            type="radio"
            :name="'q' + qi"
            :value="oi"
            :disabled="answers[qi].submitted"
            v-model="answers[qi].picked"
          />
          <span>{{ String.fromCharCode(65 + oi) }}. {{ opt }}</span>
        </label>
      </div>
      <div class="quiz-actions">
        <button v-if="!answers[qi].submitted" class="btn btn-ghost btn-sm" :disabled="answers[qi].picked === null" @click="answers[qi].submitted = true">
          单独检查本题
        </button>
        <span v-if="answers[qi].submitted && answers[qi].picked === q.answer" style="color: var(--green); font-weight: 700; font-size: 14px">✓ 回答正确</span>
        <span v-if="answers[qi].submitted && answers[qi].picked !== q.answer" style="color: var(--red); font-weight: 700; font-size: 14px">✗ 正确答案是 {{ String.fromCharCode(65 + q.answer) }}</span>
      </div>
      <div v-if="answers[qi].submitted" class="quiz-answer">
        <div class="ans-body">
          <strong style="color: var(--accent-3)">📝 解析：</strong>{{ q.explain }}
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0 10px">
      <button v-if="!showResults" class="btn btn-primary" @click="submit">📊 提交全部答案</button>
      <button v-else class="btn btn-primary" @click="reset">🔄 重新挑战</button>
    </div>
  </div>
</template>
