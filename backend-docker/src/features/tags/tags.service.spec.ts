import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { TagsService } from '#src/features/tags/tags.service.js';
import type { Tag } from '#src/database/entities/index.js';
import type { Repository } from 'typeorm';

describe('TagsService', () => {
  let service: TagsService;
  let mockTagRepo: { find: any; createQueryBuilder: any };
  let mockQb: { insert: any; into: any; values: any; orIgnore: any; execute: any };

  beforeEach(() => {
    mockQb = {
      insert: vi.fn(() => mockQb),
      into: vi.fn(() => mockQb),
      values: vi.fn(() => mockQb),
      orIgnore: vi.fn(() => mockQb),
      execute: vi.fn().mockResolvedValue({}),
    };
    mockTagRepo = {
      find: vi.fn(),
      createQueryBuilder: vi.fn(() => mockQb),
    };
    service = new TagsService(mockTagRepo as unknown as Repository<Tag>);
  });

  describe('normalizeTagName', () => {
    it('chuẩn hoá tag chữ hoa và khoảng trắng về chữ thường', () => {
      expect(service.normalizeTagName(' Docker ')).toBe('docker');
      expect(service.normalizeTagName('NESTJS')).toBe('nestjs');
      expect(service.normalizeTagName('multi-stage')).toBe('multi-stage');
      expect(service.normalizeTagName('ai_prompt')).toBe('ai_prompt');
      expect(service.normalizeTagName('node.js')).toBe('node.js');
    });

    it('báo lỗi nếu tag có ký tự đặc biệt hoặc quá ngắn/dài', () => {
      expect(() => service.normalizeTagName('a')).toThrow(BadRequestException);
      expect(() => service.normalizeTagName('tag with spaces')).toThrow(BadRequestException);
      expect(() => service.normalizeTagName('tag@special#')).toThrow(BadRequestException);
      expect(() => service.normalizeTagName('a'.repeat(31))).toThrow(BadRequestException);
    });
  });

  describe('getOrCreateTags', () => {
    it('báo lỗi nếu snippet có nhiều hơn 5 tag', async () => {
      const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'];
      await expect(service.getOrCreateTags(tags)).rejects.toThrow(BadRequestException);
    });

    it('insert idempotent (ON CONFLICT DO NOTHING) rồi trả các tag theo tên đã chuẩn hoá', async () => {
      mockTagRepo.find.mockResolvedValue([{ name: 'docker' }, { name: 'nestjs' }] as Tag[]);

      const result = await service.getOrCreateTags([' Docker', 'nestjs', 'DOCKER'], 'user-1');

      expect(result).toHaveLength(2);
      expect(mockQb.orIgnore).toHaveBeenCalledTimes(1);
      expect(mockQb.values).toHaveBeenCalledWith([
        { name: 'docker', createdBy: 'user-1', usageCount: 0 },
        { name: 'nestjs', createdBy: 'user-1', usageCount: 0 },
      ]);
    });

    it('trả mảng rỗng nếu không có tag nào', async () => {
      await expect(service.getOrCreateTags([])).resolves.toEqual([]);
      expect(mockTagRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});
