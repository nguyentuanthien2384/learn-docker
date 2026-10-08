import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SnippetsService } from '#src/features/snippets/snippets.service.js';
import type { Snippet, SnippetStar } from '#src/database/entities/index.js';
import type { TagsService } from '#src/features/tags/tags.service.js';
import type { DataSource, Repository } from 'typeorm';

describe('SnippetsService', () => {
  let service: SnippetsService;
  let mockSnippetRepo: any;
  let mockStarRepo: any;
  let mockTagsService: any;
  let mockManager: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockSnippetRepo = {
      findOne: vi.fn(),
      findAndCount: vi.fn(),
    };
    mockStarRepo = {
      findOne: vi.fn(),
      findAndCount: vi.fn(),
    };
    mockTagsService = {};
    mockManager = {
      getRepository: vi.fn(() => mockSnippetRepo),
      createQueryBuilder: vi.fn(() => {
        const qb: any = {};
        for (const method of ['insert', 'into', 'values', 'orIgnore']) {
          qb[method] = vi.fn(() => qb);
        }
        qb.execute = vi.fn().mockResolvedValue({});
        return qb;
      }),
      count: vi.fn().mockResolvedValue(11),
      update: vi.fn(),
      delete: vi.fn(),
    };
    mockDataSource = {
      transaction: vi.fn((cb: (manager: unknown) => unknown) => cb(mockManager)),
    };

    service = new SnippetsService(
      mockSnippetRepo as unknown as Repository<Snippet>,
      mockStarRepo as unknown as Repository<SnippetStar>,
      mockTagsService as unknown as TagsService,
      mockDataSource as unknown as DataSource,
    );
  });

  describe('star', () => {
    it('không cho phép chủ snippet tự star snippet của mình', async () => {
      const authorId = 'author-uuid-123';
      mockSnippetRepo.findOne.mockResolvedValue({
        id: 'snippet-1',
        authorId,
        isPublic: true,
        starsCount: 5,
      } as Snippet);

      await expect(service.star('snippet-1', authorId)).rejects.toThrow(BadRequestException);
    });

    it('không cho phép star snippet riêng tư', async () => {
      mockSnippetRepo.findOne.mockResolvedValue({
        id: 'snippet-private',
        authorId: 'other-user',
        isPublic: false,
        starsCount: 0,
      } as Snippet);

      await expect(service.star('snippet-private', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('báo lỗi nếu snippet không tồn tại', async () => {
      mockSnippetRepo.findOne.mockResolvedValue(null);

      await expect(service.star('missing', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('ghi star idempotent rồi đồng bộ starsCount theo số star thực tế', async () => {
      mockSnippetRepo.findOne.mockResolvedValue({
        id: 'snippet-public',
        authorId: 'author-uuid',
        isPublic: true,
        starsCount: 10,
      } as Snippet);

      const result = await service.star('snippet-public', 'fan-user');

      expect(result).toEqual({ starred: true, starsCount: 11 });
      expect(mockManager.createQueryBuilder).toHaveBeenCalled();
      expect(mockManager.update).toHaveBeenCalledWith(expect.anything(), 'snippet-public', {
        starsCount: 11,
      });
    });
  });

  describe('unstar', () => {
    it('xoá star rồi đồng bộ lại starsCount', async () => {
      mockSnippetRepo.findOne.mockResolvedValue({ id: 'snippet-1', isPublic: true } as Snippet);
      mockManager.count.mockResolvedValue(9);

      const result = await service.unstar('snippet-1', 'fan-user');

      expect(result).toEqual({ starred: false, starsCount: 9 });
      expect(mockManager.delete).toHaveBeenCalledWith(expect.anything(), {
        userId: 'fan-user',
        snippetId: 'snippet-1',
      });
    });
  });

  describe('create validation', () => {
    it('báo lỗi nếu docker_code không có filename', async () => {
      await expect(
        service.create({ type: 'docker_code', title: 'Test', filename: '' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('báo lỗi nếu ai_prompt không có content', async () => {
      await expect(
        service.create({ type: 'ai_prompt', title: 'Test Prompt', content: undefined }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
