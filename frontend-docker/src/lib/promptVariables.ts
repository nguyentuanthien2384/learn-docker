/**
 * Prompt content declares variables as {{variable_name}}. These helpers keep
 * that mini-templating logic in one place so the Prompt Lab and the Create
 * screen (which detects variables as you type) stay in sync.
 */

export const VARIABLE_PATTERN = /\{\{\s*([a-z0-9_]+)\s*\}\}/gi

export type PromptValues = Record<string, string>

export interface PromptSegment {
  key: number
  text: string
  isVariable: boolean
}

/** Ordered, de-duplicated list of variable names declared in the content. */
export function extractVariableNames(content: string): string[] {
  const names: string[] = []
  let match: RegExpExecArray | null
  const pattern = new RegExp(VARIABLE_PATTERN)
  while ((match = pattern.exec(content))) {
    if (!names.includes(match[1])) names.push(match[1])
  }
  return names
}

/** Replaces each filled-in variable with its value; leaves blanks untouched. */
export function fillPromptContent(content: string, values: PromptValues): string {
  return content.replace(VARIABLE_PATTERN, (whole, name: string) => {
    const value = values[name]
    return value && value.trim() ? value : whole
  })
}

/** Splits content into plain-text and variable segments, for highlighted preview rendering. */
export function segmentPromptContent(content: string, values: PromptValues): PromptSegment[] {
  const parts = content.split(/(\{\{\s*[a-z0-9_]+\s*\}\})/i).filter(Boolean)
  return parts.map((part, index) => {
    const match = part.match(/^\{\{\s*([a-z0-9_]+)\s*\}\}$/i)
    if (match) {
      const value = values[match[1]]
      const hasValue = Boolean(value && value.trim())
      return { key: index, text: hasValue ? value : part, isVariable: true }
    }
    return { key: index, text: part, isVariable: false }
  })
}
