import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import {
  Snippet,
  SnippetLine,
  SnippetStar,
  SnippetTag,
  Tag,
} from '#src/database/entities/index.js';
import type { SnippetType } from '#src/common/constants/snippet.constants.js';
import { getPagination, toPaginated } from '#src/common/utils/paginate.js';
import { toAuthorSummary } from '#src/common/mappers/user.mapper.js';
import { TagsService } from '#src/features/tags/tags.service.js';
import { CodeLineDto, CreateSnippetDto } from '#src/features/snippets/dto/create-snippet.dto.js';
import { UpdateSnippetDto } from '#src/features/snippets/dto/update-snippet.dto.js';
import { QuerySnippetsDto } from '#src/features/snippets/dto/query-snippets.dto.js';

const SNIPPET_NOT_FOUND = 'Không tìm thấy snippet';

@Injectable()
export class SnippetsService {
  constructor(
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
    @InjectRepository(SnippetStar)
    private readonly starRepo: Repository<SnippetStar>,
    private readonly tagsService: TagsService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: QuerySnippetsDto, currentUserId?: string) {
    const pagination = getPagination(query);

    const qb = this.snippetRepo
      .createQueryBuilder('snippet')
      .leftJoinAndSelect('snippet.author', 'author')
      .leftJoinAndSelect('snippet.snippetTags', 'snippetTag')
      .leftJoinAndSelect('snippetTag.tag', 'tag')
      .leftJoinAndSelect('snippet.lines', 'line');

    // Chỉ hiển thị snippet công khai trừ khi đang xem của chính mình
    if (query.author_id && query.author_id === currentUserId) {
      qb.where('snippet.author_id = :authorId', { authorId: query.author_id });
    } else if (query.author_id) {
      qb.where('snippet.author_id = :authorId AND snippet.is_public = true', {
        authorId: query.author_id,
      });
    } else {
      qb.where('snippet.is_public = true');
    }

    if (query.type) {
      qb.andWhere('snippet.type = :type', { type: query.type });
    }

    if (query.tag) {
      const normalizedTag = query.tag.trim().toLowerCase();
      qb.andWhere((subQuery) => {
        const sub = subQuery
          .subQuery()
          .select('st.snippet_id')
          .from(SnippetTag, 'st')
          .innerJoin(Tag, 't', 't.id = st.tag_id')
          .where('t.name = :tagName', { tagName: normalizedTag })
          .getQuery();
        return `snippet.id IN ${sub}`;
      });
    }

    if (query.search) {
      qb.andWhere(
        '(snippet.title ILIKE :search OR snippet.description ILIKE :search OR snippet.content ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    if (query.sort === 'stars') {
      qb.orderBy('snippet.stars_count', 'DESC').addOrderBy('snippet.created_at', 'DESC');
    } else {
      qb.orderBy('snippet.created_at', 'DESC');
    }

    qb.skip(pagination.skip).take(pagination.limit);

    const [items, total] = await qb.getManyAndCount();
    const starredIds = await this.findStarredIds(items, currentUserId);

    return toPaginated(
      items.map((item) => this.formatSnippetResponse(item, starredIds.has(item.id))),
      total,
      pagination,
    );
  }

  async findOne(id: string, currentUserId?: string, manager?: EntityManager) {
    const snippetRepo = manager ? manager.getRepository(Snippet) : this.snippetRepo;
    const starRepo = manager ? manager.getRepository(SnippetStar) : this.starRepo;

    const snippet = await snippetRepo.findOne({
      where: { id },
      relations: {
        author: true,
        lines: true,
        snippetTags: { tag: true },
      },
      order: {
        lines: { position: 'ASC' },
      },
    });

    // Snippet riêng tư trả "không tìm thấy" với người khác
    if (!snippet || (!snippet.isPublic && snippet.authorId !== currentUserId)) {
      throw new NotFoundException(SNIPPET_NOT_FOUND);
    }

    const hasStarred = currentUserId
      ? Boolean(await starRepo.findOne({ where: { userId: currentUserId, snippetId: id } }))
      : false;

    return this.formatSnippetResponse(snippet, hasStarred);
  }

  async create(dto: CreateSnippetDto, authorId: string) {
    this.validateSnippetTypeData(dto.type, dto.filename, dto.content);

    return this.dataSource.transaction(async (manager) => {
      const snippet = await manager.save(
        Snippet,
        manager.create(Snippet, {
          authorId,
          type: dto.type,
          title: dto.title,
          description: dto.description ?? '',
          isPublic: dto.isPublic ?? true,
          filename: dto.type === 'docker_code' ? dto.filename || 'Dockerfile' : null,
          content: dto.type === 'ai_prompt' ? dto.content || '' : null,
          variables: dto.variables ?? {},
          starsCount: 0,
        }),
      );

      if (dto.type === 'docker_code') {
        await this.replaceLines(manager, snippet.id, dto.lines ?? []);
      }

      const tags = await this.tagsService.getOrCreateTags(dto.tags ?? [], authorId, manager);
      await this.tagsService.attachTags(manager, snippet.id, tags);

      return this.findOne(snippet.id, authorId, manager);
    });
  }

  async update(id: string, dto: UpdateSnippetDto, authorId: string) {
    return this.dataSource.transaction(async (manager) => {
      const snippet = await this.getOwnedOrFail(
        id,
        authorId,
        'Bạn không có quyền chỉnh sửa snippet này',
        manager,
      );

      if (dto.title !== undefined) snippet.title = dto.title;
      if (dto.description !== undefined) snippet.description = dto.description;
      if (dto.isPublic !== undefined) snippet.isPublic = dto.isPublic;
      if (snippet.type === 'docker_code') {
        if (dto.filename !== undefined) snippet.filename = dto.filename;
      } else {
        if (dto.content !== undefined) snippet.content = dto.content;
        if (dto.variables !== undefined) snippet.variables = dto.variables;
      }
      await manager.save(Snippet, snippet);

      if (snippet.type === 'docker_code' && dto.lines !== undefined) {
        await this.replaceLines(manager, id, dto.lines);
      }

      if (dto.tags !== undefined) {
        const newTags = await this.tagsService.getOrCreateTags(dto.tags, authorId, manager);
        const oldTagIds = (await manager.find(SnippetTag, { where: { snippetId: id } })).map(
          (st) => st.tagId,
        );
        const newTagIds = new Set(newTags.map((t) => t.id));

        await this.tagsService.detachTags(
          manager,
          id,
          oldTagIds.filter((tagId) => !newTagIds.has(tagId)),
        );
        await this.tagsService.attachTags(
          manager,
          id,
          newTags.filter((t) => !oldTagIds.includes(t.id)),
        );
      }

      return this.findOne(id, authorId, manager);
    });
  }

  async remove(id: string, authorId: string) {
    await this.dataSource.transaction(async (manager) => {
      const snippet = await this.getOwnedOrFail(
        id,
        authorId,
        'Bạn không có quyền xoá snippet này',
        manager,
      );
      const tagLinks = await manager.find(SnippetTag, { where: { snippetId: id } });

      await this.tagsService.decrementUsage(
        manager,
        tagLinks.map((st) => st.tagId),
      );
      // DB cascade sẽ tự xoá snippet_lines, snippet_tags, snippet_stars
      await manager.delete(Snippet, snippet.id);
    });

    return { message: 'Xoá snippet thành công' };
  }

  async star(snippetId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const snippet = await this.getOrFail(snippetId, manager);

      // Chỉ star được snippet công khai
      if (!snippet.isPublic) {
        throw new NotFoundException(SNIPPET_NOT_FOUND);
      }
      // Chủ snippet không được tự star snippet của mình
      if (snippet.authorId === userId) {
        throw new BadRequestException('Chủ snippet không được tự star snippet của mình');
      }

      // ON CONFLICT DO NOTHING: gọi star nhiều lần / đồng thời vẫn chỉ có một bản ghi
      await manager
        .createQueryBuilder()
        .insert()
        .into(SnippetStar)
        .values({ userId, snippetId })
        .orIgnore()
        .execute();

      return { starred: true, starsCount: await this.syncStarsCount(manager, snippetId) };
    });
  }

  async unstar(snippetId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      await this.getOrFail(snippetId, manager);
      await manager.delete(SnippetStar, { userId, snippetId });

      return { starred: false, starsCount: await this.syncStarsCount(manager, snippetId) };
    });
  }

  async findMySnippets(userId: string, query: QuerySnippetsDto) {
    return this.findAll({ ...query, author_id: userId }, userId);
  }

  async findMyStarred(userId: string, query: QuerySnippetsDto) {
    const pagination = getPagination(query);

    const [stars, total] = await this.starRepo.findAndCount({
      where: { userId, snippet: { isPublic: true } },
      relations: {
        snippet: { author: true, lines: true, snippetTags: { tag: true } },
      },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return toPaginated(
      stars.map((star) => this.formatSnippetResponse(star.snippet, true)),
      total,
      pagination,
    );
  }

  private async getOrFail(id: string, manager?: EntityManager): Promise<Snippet> {
    const repo = manager ? manager.getRepository(Snippet) : this.snippetRepo;
    const snippet = await repo.findOne({ where: { id } });
    if (!snippet) {
      throw new NotFoundException(SNIPPET_NOT_FOUND);
    }
    return snippet;
  }

  private async getOwnedOrFail(
    id: string,
    authorId: string,
    forbiddenMessage: string,
    manager: EntityManager,
  ): Promise<Snippet> {
    const snippet = await this.getOrFail(id, manager);
    if (snippet.authorId !== authorId) {
      throw new ForbiddenException(forbiddenMessage);
    }
    return snippet;
  }

  /** Đếm lại số star thực tế rồi ghi vào snippets.stars_count (idempotent, không lệch khi gọi lặp). */
  private async syncStarsCount(manager: EntityManager, snippetId: string): Promise<number> {
    const starsCount = await manager.count(SnippetStar, { where: { snippetId } });
    await manager.update(Snippet, snippetId, { starsCount });
    return starsCount;
  }

  private async findStarredIds(items: Snippet[], userId?: string): Promise<Set<string>> {
    if (!userId || items.length === 0) return new Set();
    const stars = await this.starRepo
      .createQueryBuilder('star')
      .select('star.snippet_id', 'snippetId')
      .where('star.user_id = :userId', { userId })
      .andWhere('star.snippet_id IN (:...ids)', { ids: items.map((s) => s.id) })
      .getRawMany<{ snippetId: string }>();
    return new Set(stars.map((s) => s.snippetId));
  }

  private async replaceLines(manager: EntityManager, snippetId: string, lines: CodeLineDto[]) {
    await manager.delete(SnippetLine, { snippetId });
    if (lines.length === 0) return;
    await manager.save(
      SnippetLine,
      lines.map((line, position) => ({
        snippetId,
        position,
        code: line.code ?? '',
        explanation: line.explanation ?? '',
      })),
    );
  }

  private validateSnippetTypeData(type: SnippetType, filename?: string, content?: string) {
    if (type === 'docker_code' && (!filename || !filename.trim())) {
      throw new BadRequestException('docker_code bắt buộc phải có tên file (filename)');
    }
    if (type === 'ai_prompt' && (content === undefined || content === null)) {
      throw new BadRequestException('ai_prompt bắt buộc phải có nội dung (content)');
    }
  }

  private formatSnippetResponse(snippet: Snippet, hasStarred = false) {
    const tags = (snippet.snippetTags ?? []).map((st) => st.tag?.name).filter(Boolean);
    const lines = [...(snippet.lines ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((l) => ({ code: l.code, explanation: l.explanation }));

    return {
      id: snippet.id,
      type: snippet.type,
      title: snippet.title,
      description: snippet.description,
      isPublic: snippet.isPublic,
      filename: snippet.filename,
      content: snippet.content,
      variables: snippet.variables,
      starsCount: snippet.starsCount,
      hasStarred,
      tags,
      lines: snippet.type === 'docker_code' ? lines : undefined,
      author: snippet.author ? toAuthorSummary(snippet.author) : undefined,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt,
    };
  }
}
