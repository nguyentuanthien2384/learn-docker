import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import type { User } from '#src/database/entities/user.entity.js';
import type { Snippet } from '#src/database/entities/snippet.entity.js';

@Entity('snippet_stars')
export class SnippetStar {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ name: 'snippet_id', type: 'uuid' })
  snippetId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne('User', (user: User) => user.stars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @ManyToOne('Snippet', (snippet: Snippet) => snippet.stars, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snippet_id' })
  snippet!: Relation<Snippet>;
}
