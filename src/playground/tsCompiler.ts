import ts from 'typescript'
import { libs } from './libs'

const FILE = 'main.ts'

export interface Diag {
  message: string
  line?: number
  col?: number
  kind: 'error' | 'warning' | 'info'
}

export interface CheckResult {
  ok: boolean
  diagnostics: Diag[]
  js: string
  jsError?: string
}

/**
 * 在浏览器内对用户代码做完整的类型检查（严格模式），
 * 并转译出可运行的 JavaScript。
 *
 * 注意：浏览器中 ts.sys 为 undefined，直接调用 ts.createCompilerHost()
 * 会在内部读取 sys.useCaseSensitiveFileNames 而崩溃（Cannot read
 * properties of undefined），所以这里手动构造 CompilerHost。
 */
export function checkTypes(source: string): CheckResult {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleDetection: ts.ModuleDetectionKind.Force,
    lib: ['lib.es2020.full.d.ts', 'lib.dom.d.ts'],
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    allowJs: false
  }

  const norm = (f: string) => f.replace(/^\/+/g, '')

  // 手动构造 CompilerHost（提供类型检查所需的最小接口，全部走内存数据）
  const host: ts.CompilerHost = {
    getSourceFile: (fileName, languageVersion, onError) => {
      const n = norm(fileName)
      if (libs[n]) return ts.createSourceFile(fileName, libs[n], languageVersion, true, ts.ScriptKind.TS)
      if (fileName === FILE) return ts.createSourceFile(fileName, source, languageVersion, true, ts.ScriptKind.TS)
      onError?.('找不到文件: ' + fileName)
      return undefined
    },
    getDefaultLibFileName: () => 'lib.es2020.full.d.ts',
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (fileName) => norm(fileName),
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: (fileName) => libs[norm(fileName)] !== undefined || fileName === FILE,
    readFile: (fileName) => libs[norm(fileName)] ?? (fileName === FILE ? source : undefined),
    directoryExists: () => false,
    getDirectories: () => [],
    readDirectory: () => [],
    getEnvironmentVariable: () => '',
    createHash: (data: string) => data
  }

  const diagnostics: Diag[] = []
  try {
    const program = ts.createProgram([FILE], options, host)
    for (const d of ts.getPreEmitDiagnostics(program)) {
      const kind = d.category === ts.DiagnosticCategory.Error ? 'error' : d.category === ts.DiagnosticCategory.Warning ? 'warning' : 'info'
      let line: number | undefined
      let col: number | undefined
      if (d.file && d.start !== undefined) {
        const pos = d.file.getLineAndCharacterOfPosition(d.start)
        line = pos.line + 1
        col = pos.character + 1
      }
      diagnostics.push({ message: ts.flattenDiagnosticMessageText(d.messageText, '\n'), line, col, kind })
    }
  } catch (e) {
    diagnostics.push({ message: '内部错误：' + String((e as Error)?.message ?? e), kind: 'error' })
  }

  let js = ''
  let jsError: string | undefined
  try {
    const out = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        strict: true
      },
      fileName: FILE,
      reportDiagnostics: false
    })
    js = out.outputText
  } catch (e) {
    jsError = String((e as Error)?.message ?? e)
  }

  const hasError = diagnostics.some((d) => d.kind === 'error')
  return { ok: !hasError && !jsError, diagnostics, js, jsError }
}
