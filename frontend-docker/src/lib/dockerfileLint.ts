/**
 * A deliberately small linter: it only turns on when the first non-comment
 * line looks like `INSTRUCTION arg` (a Dockerfile), and never fires on YAML
 * compose files or plain shell scripts. Good enough to catch typos in the
 * Create screen without pretending to be a real Dockerfile parser.
 */

const VALID_INSTRUCTIONS = [
  'FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY',
  'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL',
  'HEALTHCHECK', 'SHELL',
]

export interface LintProblem {
  key: number
  line: number
  word: string
  message: string
}

export interface LintResult {
  byLine: Record<number, { word: string }>
  problems: LintProblem[]
}

function looksLikeDockerfile(lines: string[]): boolean {
  const firstReal = lines.find((line) => line.trim() && !line.trim().startsWith('#'))
  if (!firstReal) return false
  const trimmed = firstReal.trim()
  return /^[A-Za-z]+\b/.test(trimmed) && trimmed.indexOf(':') !== 1 && !/^\s*[a-z_]+:\s*$/.test(trimmed)
}

export function lintDockerfile(text: string): LintResult {
  const lines = (text || '').split('\n')
  if (!looksLikeDockerfile(lines)) return { byLine: {}, problems: [] }

  const byLine: LintResult['byLine'] = {}
  const problems: LintProblem[] = []
  let seenInstruction = false
  let previousLineContinues = false

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    const wasContinuation = previousLineContinues
    previousLineContinues = /\\\s*$/.test(trimmed)
    if (!trimmed || trimmed.startsWith('#') || wasContinuation) return

    const match = trimmed.match(/^([A-Za-z][A-Za-z0-9_]*)(\s+(.*))?$/)
    if (!match) {
      const word = trimmed.split(/\s+/)[0]
      byLine[index] = { word }
      problems.push({ key: index, line: index + 1, word, message: 'Dòng này không theo dạng LỆNH tham_số.' })
      return
    }

    const word = match[1]
    const rest = (match[3] || '').trim()
    const upper = word.toUpperCase()

    if (!VALID_INSTRUCTIONS.includes(upper)) {
      byLine[index] = { word }
      problems.push({ key: index, line: index + 1, word, message: 'Không phải lệnh Dockerfile hợp lệ.' })
      return
    }
    if (word !== upper) {
      byLine[index] = { word }
      problems.push({ key: index, line: index + 1, word, message: `Lệnh Dockerfile nên viết hoa: ${upper}.` })
      return
    }
    if (!rest) {
      byLine[index] = { word }
      problems.push({ key: index, line: index + 1, word, message: `${upper} thiếu tham số.` })
      return
    }
    if (!seenInstruction && upper !== 'FROM' && upper !== 'ARG') {
      byLine[index] = { word }
      problems.push({ key: index, line: index + 1, word, message: 'Dockerfile phải bắt đầu bằng FROM (hoặc ARG trước FROM).' })
    }
    seenInstruction = true
  })

  return { byLine, problems }
}
