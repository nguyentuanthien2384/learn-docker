import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import type { RefreshToken } from '#src/database/entities/refresh-token.entity.js';
import type { Snippet } from '#src/database/entities/snippet.entity.js';
import type { SnippetStar } from '#src/database/entities/snippet-star.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'citext', unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', default: '' })
  bio!: string;

  @Column({ name: 'avatar_filename', type: 'text', nullable: true })
  avatarFilename!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany('RefreshToken', (token: RefreshToken) => token.user, { cascade: true })
  refreshTokens!: Relation<RefreshToken>[];

  @OneToMany('Snippet', (snippet: Snippet) => snippet.author, { cascade: true })
  snippets!: Relation<Snippet>[];

  @OneToMany('SnippetStar', (star: SnippetStar) => star.user, { cascade: true })
  stars!: Relation<SnippetStar>[];
}
