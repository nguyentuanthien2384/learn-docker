import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '#src/common/dto/pagination.dto.js';
import { SNIPPET_TYPES, type SnippetType } from '#src/common/constants/snippet.constants.js';

export class QuerySnippetsDto extends PaginationDto {
  @IsOptional()
  @IsIn(SNIPPET_TYPES)
  type?: SnippetType;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsUUID()
  author_id?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['latest', 'stars'])
  sort: 'latest' | 'stars' = 'latest';
}
