import { Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import type { Snippet } from '#src/database/entities/snippet.entity.js';
import type { Tag } from '#src/database/entities/tag.entity.js';

@Entity('snippet_tags')
export class SnippetTag {
  @PrimaryColumn({ name: 'snippet_id', type: 'uuid' })
  snippetId!: string;

  @PrimaryColumn({ name: 'tag_id', type: 'bigint' })
  tagId!: string;

  @ManyToOne('Snippet', (snippet: Snippet) => snippet.snippetTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snippet_id' })
  snippet!: Relation<Snippet>;

  @ManyToOne('Tag', (tag: Tag) => tag.snippetTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag!: Relation<Tag>;
}
