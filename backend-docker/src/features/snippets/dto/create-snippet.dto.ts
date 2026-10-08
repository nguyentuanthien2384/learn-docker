import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SNIPPET_TYPES, type SnippetType } from '#src/common/constants/snippet.constants.js';
import { Trim } from '#src/common/decorators/transform.decorators.js';
import type { PromptVariableMeta } from '#src/database/entities/index.js';

export class CodeLineDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateSnippetDto {
  @IsIn(SNIPPET_TYPES, {
    message: 'Type phải là "docker_code" hoặc "ai_prompt"',
  })
  type!: SnippetType;

  @Trim()
  @IsString({ message: 'Tiêu đề phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title!: string;

  @IsOptional()
  @Trim()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  // Dành riêng cho docker_code
  @IsOptional()
  @Trim()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeLineDto)
  lines?: CodeLineDto[];

  // Dành riêng cho ai_prompt
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, PromptVariableMeta>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
