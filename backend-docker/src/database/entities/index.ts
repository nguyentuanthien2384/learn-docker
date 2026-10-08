export { User } from '#src/database/entities/user.entity.js';
export { RefreshToken } from '#src/database/entities/refresh-token.entity.js';
export { Snippet, type SnippetType, type PromptVariableMeta } from '#src/database/entities/snippet.entity.js';
export { SnippetLine } from '#src/database/entities/snippet-line.entity.js';
export { Tag } from '#src/database/entities/tag.entity.js';
export { SnippetTag } from '#src/database/entities/snippet-tag.entity.js';
export { SnippetStar } from '#src/database/entities/snippet-star.entity.js';

import { User } from '#src/database/entities/user.entity.js';
import { RefreshToken } from '#src/database/entities/refresh-token.entity.js';
import { Snippet } from '#src/database/entities/snippet.entity.js';
import { SnippetLine } from '#src/database/entities/snippet-line.entity.js';
import { Tag } from '#src/database/entities/tag.entity.js';
import { SnippetTag } from '#src/database/entities/snippet-tag.entity.js';
import { SnippetStar } from '#src/database/entities/snippet-star.entity.js';

/** Danh sách entity dùng chung cho TypeOrmModule.forFeature. */
export const ENTITIES = [User, RefreshToken, Snippet, SnippetLine, Tag, SnippetTag, SnippetStar];
