export const SNIPPET_TYPES = ['docker_code', 'ai_prompt'] as const;
export type SnippetType = (typeof SNIPPET_TYPES)[number];
