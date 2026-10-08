/** Normalizes free-text tag input: lowercase, spaces to dashes, strips invalid characters. */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
}

/** Quy tắc tag của backend (TagsService): 2-30 ký tự, tối đa 5 tag cho mỗi snippet. */
export const TAG_MIN_LENGTH = 2
export const TAG_MAX_LENGTH = 30
export const MAX_TAGS_PER_SNIPPET = 5

export function isValidTag(tag: string): boolean {
  return tag.length >= TAG_MIN_LENGTH && tag.length <= TAG_MAX_LENGTH
}
