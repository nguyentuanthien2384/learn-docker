import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import type { Snippet } from '#src/database/entities/snippet.entity.js';

@Entity('snippet_lines')
export class SnippetLine {
  @PrimaryColumn({ name: 'snippet_id', type: 'uuid' })
  snippetId!: string;

  @PrimaryColumn({ type: 'integer' })
  position!: number;

  @Column({ type: 'text', default: '' })
  code!: string;

  @Column({ type: 'text', default: '' })
  explanation!: string;

  @ManyToOne('Snippet', (snippet: Snippet) => snippet.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snippet_id' })
  snippet!: Relation<Snippet>;
}
