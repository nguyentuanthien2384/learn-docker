import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type EntityManager, Repository } from 'typeorm';
import { SnippetTag, Tag } from '#src/database/entities/index.js';

export const TAG_REGEX = /^[a-z0-9._-]{2,30}$/;
export const MAX_TAGS_PER_SNIPPET = 5;

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  normalizeTagName(rawName: string): string {
    const normalized = rawName.trim().toLowerCase();
    if (!TAG_REGEX.test(normalized)) {
      throw new BadRequestException(
        `Tag "${rawName}" không hợp lệ. Tag chỉ gồm chữ thường, số, dấu '.', '_', '-' và dài từ 2-30 ký tự.`,
      );
    }
    return normalized;
  }

  async findTopTags(limit = 30, search?: string) {
    const qb = this.tagRepo.createQueryBuilder('tag');
    if (search) {
      qb.where('tag.name ILIKE :search', { search: `%${search.trim().toLowerCase()}%` });
    }
    qb.orderBy('tag.usage_count', 'DESC')
      .addOrderBy('tag.name', 'ASC')
      .take(limit);

    return qb.getMany();
  }

  /**
   * Lấy các tag theo tên, tạo tag còn thiếu. Insert dùng ON CONFLICT DO NOTHING
   * nên hai request cùng tạo một tag mới không gây lỗi unique.
   */
  async getOrCreateTags(
    tagNames: string[],
    userId?: string,
    manager?: EntityManager,
  ): Promise<Tag[]> {
    if (!tagNames || tagNames.length === 0) return [];

    const names = [...new Set(tagNames.map((name) => this.normalizeTagName(name)))];
    if (names.length > MAX_TAGS_PER_SNIPPET) {
      throw new BadRequestException(`Mỗi snippet chỉ được gắn tối đa ${MAX_TAGS_PER_SNIPPET} tag`);
    }

    const repo = manager ? manager.getRepository(Tag) : this.tagRepo;
    await repo
      .createQueryBuilder()
      .insert()
      .into(Tag)
      .values(names.map((name) => ({ name, createdBy: userId ?? null, usageCount: 0 })))
      .orIgnore()
      .execute();

    return repo.find({ where: { name: In(names) } });
  }

  /** Gắn tag vào snippet và tăng usage_count. Phải gọi trong transaction của caller. */
  async attachTags(manager: EntityManager, snippetId: string, tags: Tag[]): Promise<void> {
    if (tags.length === 0) return;
    await manager.save(
      SnippetTag,
      tags.map((tag) => ({ snippetId, tagId: tag.id })),
    );
    await manager.increment(Tag, { id: In(tags.map((t) => t.id)) }, 'usageCount', 1);
  }

  /** Gỡ tag khỏi snippet và giảm usage_count. Phải gọi trong transaction của caller. */
  async detachTags(manager: EntityManager, snippetId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;
    await manager.delete(SnippetTag, { snippetId, tagId: In(tagIds) });
    await this.decrementUsage(manager, tagIds);
  }

  /** Chỉ giảm usage_count (dùng khi xoá snippet, DB tự cascade bảng snippet_tags). */
  async decrementUsage(manager: EntityManager, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;
    await manager.decrement(Tag, { id: In(tagIds) }, 'usageCount', 1);
  }
}
