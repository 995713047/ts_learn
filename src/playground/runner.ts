export interface RunResult {
  kind: 'ok' | 'error' | 'timeout'
  logs: string[]
  error?: string
}

const TIMEOUT = 5000

/**
 * 把转译后的 JS 放进沙箱 iframe（srcdoc + ES Module）执行，
 * 捕获 console 输出与运行时错误。
 * 注意：sandbox='allow-scripts' 的 iframe 是跨源 opaque origin，
 * 不能用 contentDocument 写入，必须用 srcdoc 属性。
 */
export function runJs(js: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.setAttribute('sandbox', 'allow-scripts')
    iframe.setAttribute('aria-hidden', 'true')

    // 防止用户代码中的 </script> 提前闭合
    const safeJs = js.replace(/<\/script/gi, '<\\/script')

    // 经典脚本：先执行，做 console 捕获与错误监听
    const setup = [
      "<!doctype html><html><head><meta charset=\"utf-8\"></head><body>",
      '<scr'+'ipt>',
      ';(function () {',
      '  window.__tsrunLogs = []',
      '  var fmt = function (v) {',
      "    if (typeof v === 'string') return v",
      "    if (v === undefined) return 'undefined'",
      "    if (v === null) return 'null'",
      "    if (typeof v === 'function') return String(v)",
      "    if (typeof v === 'object') {",
      "      try { return JSON.stringify(v) } catch (e) { return String(v) }",
      '    }',
      '    return String(v)',
      '  }',
      '  function push(level) {',
      '    return function () {',
      '      var parts = []',
      '      for (var i = 0; i < arguments.length; i++) parts.push(fmt(arguments[i]))',
      '      var logs = window.__tsrunLogs',
      '      logs.push(level + ": " + parts.join(" "))',
      '    }',
      '  }',
      '  console.log = push("log")',
      '  console.info = push("info")',
      '  console.warn = push("warn")',
      '  console.error = push("error")',
      '  window.addEventListener("error", function (e) {',
      '    parent.postMessage({ __tsrun: true, type: "error", message: String(e.message || e), logs: window.__tsrunLogs || [] }, "*")',
      '  })',
      '})()',
      '</scr'+'ipt>',
      '<scr'+'ipt type="module">',
      '  ' + safeJs,
      '  parent.postMessage({ __tsrun: true, type: "done", logs: window.__tsrunLogs || [] }, "*")',
      '</scr'+'ipt>',
      '</body></html>'
    ].join('\n')

    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as { __tsrun?: boolean; type?: string; message?: string; logs?: string[] } | null
      if (!data || !data.__tsrun) return
      cleanup()
      if (data.type === 'error') resolve({ kind: 'error', logs: data.logs ?? [], error: data.message })
      else resolve({ kind: 'ok', logs: data.logs ?? [] })
    }

    const timeout = window.setTimeout(() => {
      cleanup()
      resolve({ kind: 'timeout', logs: [], error: '执行超时（可能死循环或等待中）' })
    }, TIMEOUT)

    const cleanup = () => {
      window.clearTimeout(timeout)
      window.removeEventListener('message', onMessage)
      setTimeout(() => iframe.remove(), 0)
    }

    window.addEventListener('message', onMessage)
    document.body.appendChild(iframe)
    // 关键：用 srcdoc 注入，而不是 contentDocument.write（sandbox 下为 null）
    iframe.srcdoc = setup
  })
}
