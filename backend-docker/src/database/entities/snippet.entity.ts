import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import type { User } from '#src/database/entities/user.entity.js';
import type { SnippetLine } from '#src/database/entities/snippet-line.entity.js';
import type { SnippetTag } from '#src/database/entities/snippet-tag.entity.js';
import type { SnippetStar } from '#src/database/entities/snippet-star.entity.js';

export type SnippetType = 'docker_code' | 'ai_prompt';

export interface PromptVariableMeta {
  placeholder?: string;
  rows?: number;
}

@Entity('snippets')
export class Snippet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId!: string;

  @Column({
    type: 'enum',
    enum: ['docker_code', 'ai_prompt'],
    enumName: 'snippet_type',
  })
  type!: SnippetType;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic!: boolean;

  @Column({ type: 'text', nullable: true })
  filename!: string | null;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  variables!: Record<string, PromptVariableMeta>;

  @Column({ name: 'stars_count', type: 'integer', default: 0 })
  starsCount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne('User', (user: User) => user.snippets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: Relation<User>;

  @OneToMany('SnippetLine', (line: SnippetLine) => line.snippet, { cascade: true })
  lines!: Relation<SnippetLine>[];

  @OneToMany('SnippetTag', (snippetTag: SnippetTag) => snippetTag.snippet, { cascade: true })
  snippetTags!: Relation<SnippetTag>[];

  @OneToMany('SnippetStar', (star: SnippetStar) => star.snippet, { cascade: true })
  stars!: Relation<SnippetStar>[];
}
