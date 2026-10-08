import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SeedService } from './seed.service.js';
import type { Repository } from 'typeorm';
import type {
  Snippet,
  SnippetLine,
  SnippetStar,
  SnippetTag,
  Tag,
  User,
} from '#src/database/entities/index.js';

describe('SeedService', () => {
  let service: SeedService;
  let mockUserRepo: any;
  let mockSnippetRepo: any;
  let mockTagRepo: any;
  let mockSnippetTagRepo: any;
  let mockLineRepo: any;
  let mockStarRepo: any;

  beforeEach(() => {
    mockUserRepo = {
      count: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((x) => ({ id: 'uuid-1', ...x })),
      save: vi.fn((x) => Promise.resolve(x)),
    };
    mockSnippetRepo = {
      count: vi.fn(),
      find: vi.fn(),
      create: vi.fn((x) => ({ id: 'snippet-1', ...x })),
      save: vi.fn((x) => Promise.resolve(x)),
      update: vi.fn(),
    };
    mockTagRepo = {
      count: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((x) => ({ id: 'tag-1', ...x })),
      save: vi.fn((x) => Promise.resolve(x)),
      increment: vi.fn(),
    };
    mockSnippetTagRepo = {
      create: vi.fn((x) => x),
      save: vi.fn((x) => Promise.resolve(x)),
    };
    mockLineRepo = {
      create: vi.fn((x) => x),
      save: vi.fn((x) => Promise.resolve(x)),
    };
    mockStarRepo = {
      count: vi.fn(),
      create: vi.fn((x) => x),
      save: vi.fn((x) => Promise.resolve(x)),
    };

    service = new SeedService(
      mockUserRepo as unknown as Repository<User>,
      mockSnippetRepo as unknown as Repository<Snippet>,
      mockTagRepo as unknown as Repository<Tag>,
      mockSnippetTagRepo as unknown as Repository<SnippetTag>,
      mockLineRepo as unknown as Repository<SnippetLine>,
      mockStarRepo as unknown as Repository<SnippetStar>,
    );
  });

  it('bỏ qua seed toàn bộ nếu các models đã có dữ liệu (count > 0)', async () => {
    mockUserRepo.count.mockResolvedValue(5);
    mockTagRepo.count.mockResolvedValue(12);
    mockSnippetRepo.count.mockResolvedValue(7);
    mockStarRepo.count.mockResolvedValue(10);

    await service.seedData();

    expect(mockUserRepo.save).not.toHaveBeenCalled();
    expect(mockTagRepo.save).not.toHaveBeenCalled();
    expect(mockSnippetRepo.save).not.toHaveBeenCalled();
    expect(mockStarRepo.save).not.toHaveBeenCalled();
  });

  it('tiến hành tạo fake data nếu các models count = 0', async () => {
    mockUserRepo.count.mockResolvedValue(0);
    mockTagRepo.count.mockResolvedValue(0);
    mockSnippetRepo.count.mockResolvedValue(0);
    mockStarRepo.count.mockResolvedValue(0);

    mockUserRepo.findOne.mockResolvedValue({ id: 'user-1' });
    mockUserRepo.find.mockResolvedValue([
      { id: 'user-1', email: 'hoidanit@example.com' },
      { id: 'user-2', email: 'thu.nguyen@example.com' },
    ]);
    mockSnippetRepo.find.mockResolvedValue([
      { id: 'snippet-1', authorId: 'user-1', isPublic: true },
    ]);

    await service.seedData();

    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockTagRepo.save).toHaveBeenCalled();
    expect(mockSnippetRepo.save).toHaveBeenCalled();
    expect(mockStarRepo.save).toHaveBeenCalled();
  });
});
