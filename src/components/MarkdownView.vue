<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItContainer from 'markdown-it-container'
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github-dark.min.css'

const props = defineProps<{ source: string }>()

const root = ref<HTMLElement | null>(null)

function render(source: string): string {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
    highlight(code: string, lang: string): string {
      const valid = lang && hljs.getLanguage(lang)
      const highlighted = valid ? hljs.highlight(code, { language: lang }).value : hljs.highlightAuto(code).value
      return `<pre><code class="hljs language-${lang || 'plaintext'}">${highlighted}</code><span class="code-lang">${lang || 'text'}</span><button class="code-copy" data-code="${encodeURIComponent(code)}">复制</button></pre>`
    }
  })

  // 自定义容器
  const box = (name: string, title: string) => {
    md.use(markdownItContainer, name, {
      validate: () => true,
      render(tokens: any[], idx: number) {
        const token = tokens[idx]
        if (token.nesting === 1) {
          return `<div class="container-box box-${name}"><div class="box-title">${title}</div>`
        }
        return '</div>\n'
      }
    })
  }
  box('tip', '💡 小贴士')
  box('warning', '⚠️ 注意')
  box('info', 'ℹ️ 说明')
  box('exercise', '🧪 场景演练')
  box('solution', '💡 参考答案')
  box('interview', '🎯 面试官爱问')

  return md.render(source)
}

const html = ref('')

function attachCopy() {
  root.value?.querySelectorAll<HTMLButtonElement>('.code-copy').forEach((btn) => {
    if (btn.dataset.bound) return
    btn.dataset.bound = '1'
    btn.addEventListener('click', async () => {
      const code = decodeURIComponent(btn.dataset.code || '')
      try {
        await navigator.clipboard.writeText(code)
        const old = btn.textContent
        btn.textContent = '已复制 ✓'
        setTimeout(() => (btn.textContent = old), 1400)
      } catch {
        btn.textContent = '复制失败'
      }
    })
  })
}

watch(
  () => props.source,
  async (v) => {
    html.value = render(v)
    await nextTick()
    attachCopy()
  },
  { immediate: true }
)

onMounted(() => attachCopy())
</script>

<template>
  <div ref="root" class="md-body" v-html="html"></div>
</template>
