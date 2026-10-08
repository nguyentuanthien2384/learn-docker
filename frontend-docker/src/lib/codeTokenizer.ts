import type { LintResult } from '@/lib/dockerfileLint'

const KEYWORD_PATTERN = /^(FROM|RUN|COPY|CMD|WORKDIR|ENV|EXPOSE|USER|ARG|ENTRYPOINT|VOLUME|LABEL|HEALTHCHECK|ADD|SHELL|STOPSIGNAL|ONBUILD|AS|docker|docker-compose|npm|pip|apt-get|sudo)$/

export type TokenKind = 'keyword' | 'string' | 'comment' | 'variable' | 'yamlKey' | 'text' | 'error'

export interface CodeToken {
  key: number
  text: string
  kind: TokenKind
}

function pushToken(out: CodeToken[], text: string, kind: TokenKind, errorWord: string | null): string | null {
  if (!text) return errorWord
  const isErroredWord = errorWord !== null && text === errorWord
  out.push({ key: out.length, text, kind: isErroredWord ? 'error' : kind })
  return isErroredWord ? null : errorWord
}

function tokenizeInline(segment: string, out: CodeToken[], errorWord: string | null, useKeywords: boolean): string | null {
  const parts = (segment || '').split(/("[^"]*"|\{\{\s*[a-z0-9_]+\s*\}\}|\s+)/i).filter((part) => part !== '' && part !== undefined)
  for (const part of parts) {
    if (/^"/.test(part)) errorWord = pushToken(out, part, 'string', errorWord)
    else if (/^\{\{/.test(part)) errorWord = pushToken(out, part, 'variable', errorWord)
    else if (useKeywords && KEYWORD_PATTERN.test(part)) errorWord = pushToken(out, part, 'keyword', errorWord)
    else errorWord = pushToken(out, part, 'text', errorWord)
  }
  return errorWord
}

/**
 * Tokenizes editor content for the highlighted overlay in the Create screen.
 * `byLine` (from `lintDockerfile`) marks which word on which line should be
 * rendered as an error; pass `{}` for prompt content where linting is off.
 */
export function tokenizeCode(text: string, byLine: LintResult['byLine']): CodeToken[] {
  const out: CodeToken[] = []
  const lines = (text || '').split('\n')

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) pushToken(out, '\n', 'text', null)
    let errorWord = byLine[lineIndex] ? byLine[lineIndex].word : null
    const trimmed = line.trim()

    if (trimmed.startsWith('#')) {
      pushToken(out, line, 'comment', null)
      return
    }

    const yamlMatch = line.match(/^(\s*-?\s*)([A-Za-z_][\w.-]*)(:)(.*)$/)
    if (yamlMatch && !KEYWORD_PATTERN.test(yamlMatch[2])) {
      pushToken(out, yamlMatch[1], 'text', null)
      pushToken(out, yamlMatch[2], 'yamlKey', null)
      pushToken(out, ':', 'text', null)
      tokenizeInline(yamlMatch[4], out, errorWord, false)
      return
    }

    tokenizeInline(line, out, errorWord, true)
  })

  return out
}

interface InstructionHint {
  word: string
  hint: string
}

const INSTRUCTION_DICTIONARY: InstructionHint[] = [
  { word: 'FROM', hint: 'image nền' },
  { word: 'WORKDIR', hint: 'thư mục làm việc' },
  { word: 'COPY', hint: 'copy file vào image' },
  { word: 'RUN', hint: 'chạy lệnh lúc build' },
  { word: 'CMD', hint: 'lệnh mặc định, dạng exec' },
  { word: 'ENTRYPOINT', hint: 'lệnh cố định' },
  { word: 'ENV', hint: 'biến môi trường' },
  { word: 'EXPOSE', hint: 'khai báo cổng' },
  { word: 'USER', hint: 'chạy bằng user thường' },
  { word: 'ARG', hint: 'biến lúc build' },
  { word: 'VOLUME', hint: 'mount point' },
  { word: 'HEALTHCHECK', hint: 'kiểm tra service sẵn sàng' },
  { word: 'services:', hint: 'compose: danh sách service' },
  { word: 'image:', hint: 'compose: image dùng sẵn' },
  { word: 'build:', hint: 'compose: build từ Dockerfile' },
  { word: 'ports:', hint: 'compose: map cổng' },
  { word: 'environment:', hint: 'compose: biến môi trường' },
  { word: 'depends_on:', hint: 'compose: thứ tự khởi động' },
  { word: 'healthcheck:', hint: 'compose: healthcheck' },
  { word: 'volumes:', hint: 'compose: volume' },
]

export interface InstructionSuggestion {
  key: string
  label: string
  hint: string
  /** Start index of the partial word being completed, for splicing the replacement in. */
  wordStart: number
  wordLength: number
}

/** Suggests Dockerfile/compose instructions matching the partial word before the caret. */
export function suggestInstructions(content: string, caret: number): InstructionSuggestion[] {
  const before = content.slice(0, caret)
  const match = before.match(/[A-Za-z_][A-Za-z0-9_:-]*$/)
  if (!match || match[0].length < 1) return []
  const word = match[0]
  return INSTRUCTION_DICTIONARY.filter(
    (entry) => entry.word.toLowerCase().startsWith(word.toLowerCase()) && entry.word.toLowerCase() !== word.toLowerCase(),
  )
    .slice(0, 5)
    .map((entry) => ({
      key: entry.word,
      label: entry.word,
      hint: entry.hint,
      wordStart: caret - word.length,
      wordLength: word.length,
    }))
}
