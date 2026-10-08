import type { User } from '#src/database/entities/index.js';

type AvatarSource = Pick<User, 'avatarFilename'>;

export const toAvatarUrl = (user: AvatarSource): string | null =>
  user.avatarFilename ? `/avatars/${user.avatarFilename}` : null;

export const toUserResponse = (user: Pick<User, 'id' | 'email' | 'name' | 'bio' | 'avatarFilename'>) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  bio: user.bio,
  avatarUrl: toAvatarUrl(user),
});

export const toPublicUser = (user: Pick<User, 'id' | 'name' | 'bio' | 'avatarFilename' | 'createdAt'>) => ({
  id: user.id,
  name: user.name,
  bio: user.bio,
  avatarUrl: toAvatarUrl(user),
  createdAt: user.createdAt,
});

export const toAuthorSummary = (user: Pick<User, 'id' | 'name' | 'avatarFilename'>) => ({
  id: user.id,
  name: user.name,
  avatarUrl: toAvatarUrl(user),
});
