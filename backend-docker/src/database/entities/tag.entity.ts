import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { User } from '#src/database/entities/user.entity.js';
import type { SnippetTag } from '#src/database/entities/snippet-tag.entity.js';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'text', unique: true })
  name!: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy!: string | null;

  @Column({ name: 'usage_count', type: 'integer', default: 0 })
  usageCount!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne('User', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator!: Relation<User> | null;

  @OneToMany('SnippetTag', (snippetTag: SnippetTag) => snippetTag.tag, { cascade: true })
  snippetTags!: Relation<SnippetTag>[];
}
