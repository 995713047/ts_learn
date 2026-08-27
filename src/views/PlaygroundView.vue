<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { checkTypes } from '../playground/tsCompiler'
import { runJs, type RunResult } from '../playground/runner'
import { SAMPLES } from '../playground/samples'

const code = ref(SAMPLES[0].code)
const sampleIdx = ref(0)
const diags = ref<{ message: string; line?: number; col?: number; kind: string }[]>([])
const jsOut = ref('')
const runResult = ref<RunResult | null>(null)
const running = ref(false)
const checking = ref(false)
const status = ref<'idle' | 'ok' | 'error'>('idle')
const statusText = ref('等待输入…')

let timer: number | undefined
let runSeq = 0

function doCheck() {
  let result
  try {
    result = checkTypes(code.value)
  } catch (e) {
    diags.value = [{ message: '类型检查器异常：' + String((e as Error)?.message ?? e), kind: 'error' }]
    jsOut.value = ''
    status.value = 'error'
    statusText.value = '类型检查器异常'
    return
  }
  diags.value = result.diagnostics
  jsOut.value = result.jsError ? '/* 编译失败 */\n' + result.jsError : result.js
  const errs = result.diagnostics.filter((d) => d.kind === 'error')
  if (errs.length > 0) {
    status.value = 'error'
    statusText.value = `发现 ${errs.length} 个类型错误`
  } else if (result.jsError) {
    status.value = 'error'
    statusText.value = '编译失败'
  } else {
    status.value = 'ok'
    statusText.value = '✓ 类型检查通过，无错误'
  }
}

function onInput() {
  checking.value = true
  statusText.value = '检查中…'
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    doCheck()
    checking.value = false
  }, 500)
}

async function onRun() {
  try {
    doCheck()
    runSeq++
    const seq = runSeq
    running.value = true
    const result = checkTypes(code.value)
    if (result.diagnostics.some((d) => d.kind === 'error')) {
      runResult.value = { kind: 'error', logs: [], error: '存在类型错误，请先修复再运行。' }
      running.value = false
      return
    }
    if (result.jsError) {
      runResult.value = { kind: 'error', logs: [], error: result.jsError }
      running.value = false
      return
    }
    const res = await runJs(result.js)
    if (seq === runSeq) {
      runResult.value = res
      running.value = false
    }
  } catch (e) {
    const msg = '运行失败：' + String((e as Error)?.message ?? e)
    runResult.value = { kind: 'error', logs: [], error: msg }
    running.value = false
    console.error(msg, e)
  }
}

function onSample() {
  code.value = SAMPLES[sampleIdx.value].code
  doCheck()
  runResult.value = null
}

onMounted(() => {
  doCheck()
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      onRun()
    }
  }
  window.addEventListener('keydown', onKey)
  ;(window as any).__pgKey = onKey
})
onBeforeUnmount(() => {
  window.clearTimeout(timer)
  const fn = (window as any).__pgKey
  if (fn) window.removeEventListener('keydown', fn)
})
</script>

<template>
  <div>
    <div class="playground-head">
      <h1>⚡ 类型练习场</h1>
      <span style="color: var(--text-dim); font-size: 14px">在浏览器里实时体验 TypeScript：输入代码，立即获得类型检查结果，并可编译运行。</span>
    </div>

    <div class="playground-layout">
      <div class="playground-panel pg-editor">
        <div class="panel-title"><span class="dot" style="background: #4f8cff"></span> 代码编辑区 <span style="margin-left:auto; color:var(--text-faint); font-weight:400">Ctrl/⌘ + Enter 运行</span></div>
        <textarea v-model="code" @input="onInput" spellcheck="false" placeholder="在这里输入 TypeScript 代码…"></textarea>
        <div class="pg-toolbar">
          <select v-model.number="sampleIdx" @change="onSample">
            <option v-for="(s, i) in SAMPLES" :key="i" :value="i">📄 {{ s.name }} — {{ s.desc }}</option>
          </select>
          <button class="btn btn-primary btn-sm" @click="onRun" :disabled="running">
            {{ running ? '运行中…' : '▶ 运行代码' }}
          </button>
          <div class="pg-status">
            <template v-if="status === 'ok'"><span class="ok">●</span>{{ statusText }}</template>
            <template v-else-if="status === 'error'"><span class="err">●</span>{{ statusText }}</template>
            <template v-else><span>○</span>{{ statusText }}</template>
          </div>
        </div>
      </div>

      <div class="playground-panel">
        <div class="panel-title"><span class="dot" style="background: #f87171"></span> 类型诊断</div>
        <div class="pg-output">
          <div v-if="diags.length === 0" class="pg-ok">✓ 严格模式下未发现类型错误</div>
          <div v-for="(d, i) in diags" :key="i" class="pg-error">
            <span class="err-pos" v-if="d.line !== undefined">[L{{ d.line }}:{{ d.col }}]</span>
            {{ d.kind === 'error' ? '❌' : d.kind === 'warning' ? '⚠️' : 'ℹ️' }} {{ d.message }}
          </div>
        </div>
        <div class="panel-title" style="border-top: 1px solid var(--border)"><span class="dot" style="background: #34d399"></span> 编译后的 JavaScript</div>
        <div class="pg-output" style="min-height: 180px">{{ jsOut }}</div>
        <div class="panel-title" style="border-top: 1px solid var(--border)"><span class="dot" style="background: #fbbf24"></span> 运行输出</div>
        <div class="pg-output" style="min-height: 160px">
          <div v-if="!runResult" class="pg-dim">点击「运行代码」查看输出…</div>
          <template v-else>
            <div v-if="runResult.kind === 'error'" class="pg-error">❌ {{ runResult.error }}</div>
            <div v-if="runResult.kind === 'timeout'" class="pg-error">⏱ {{ runResult.error }}</div>
            <div v-for="(l, i) in runResult.logs" :key="i" class="pg-log">{{ l }}</div>
            <div v-if="runResult.kind === 'ok' && runResult.logs.length === 0" class="pg-dim">（无 console 输出）</div>
          </template>
        </div>
      </div>
    </div>

    <div class="container-box box-info" style="margin-top: 22px">
      <div class="box-title">💡 使用提示</div>
      <p>· 编辑器采用 <strong>strict 严格模式</strong> 实时检查，写错类型立刻报错——这正是 TS 的价值所在。</p>
      <p>· 试试把示例里某行的类型改错，观察诊断区的报错信息，理解"为什么错"。</p>
      <p>· 支持 console.log / console.warn / console.error 输出；运行在沙箱 iframe 中，安全隔离。</p>
    </div>
  </div>
</template>
