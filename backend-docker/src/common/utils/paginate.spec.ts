import { describe, expect, it } from 'vitest';
import { getPagination, toPaginated } from '#src/common/utils/paginate.js';
import { toAvatarUrl, toPublicUser, toUserResponse } from '#src/common/mappers/user.mapper.js';

describe('paginate', () => {
  it('dùng mặc định page=1, limit=20', () => {
    expect(getPagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  it('kẹp limit tối đa 100 và page tối thiểu 1', () => {
    expect(getPagination({ page: 0, limit: 500 })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(getPagination({ page: 3, limit: 10 })).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it('tính totalPages', () => {
    const result = toPaginated(['a'], 25, { page: 1, limit: 10, skip: 0 });
    expect(result).toEqual({ data: ['a'], total: 25, page: 1, limit: 10, totalPages: 3 });
  });
});

describe('user.mapper', () => {
  const user = {
    id: 'u1',
    email: 'a@b.com',
    name: 'A',
    bio: '',
    avatarFilename: 'x.webp',
    createdAt: new Date(0),
  };

  it('ghép avatarUrl hoặc null', () => {
    expect(toAvatarUrl(user)).toBe('/avatars/x.webp');
    expect(toAvatarUrl({ avatarFilename: null })).toBeNull();
  });

  it('không lộ email ở profile công khai', () => {
    expect(toPublicUser(user)).not.toHaveProperty('email');
    expect(toUserResponse(user)).toMatchObject({ id: 'u1', email: 'a@b.com', avatarUrl: '/avatars/x.webp' });
  });
});
