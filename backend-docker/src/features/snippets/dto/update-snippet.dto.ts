import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateSnippetDto } from '#src/features/snippets/dto/create-snippet.dto.js';

/** Mọi trường đều tùy chọn, riêng `type` không được đổi sau khi tạo. */
export class UpdateSnippetDto extends PartialType(OmitType(CreateSnippetDto, ['type'] as const)) {}
