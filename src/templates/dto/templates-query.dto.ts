import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_FORMATS,
  TEMPLATE_ORIENTATIONS,
  type TemplateCategory,
  type TemplateFormat,
  type TemplateOrientation,
} from '../../catalog/catalog.types.js';

export const TEMPLATE_SORTS = ['popular', 'newest', 'price-asc'] as const;
export type TemplateSort = (typeof TEMPLATE_SORTS)[number];

export class TemplatesQueryDto {
  /** Nhóm gốc theo enum cũ (wedding | birthday | baby | event). Giữ để tương thích; bộ lọc mới dùng categoryId. */
  @IsOptional() @IsIn([...TEMPLATE_CATEGORIES]) category?: TemplateCategory;
  /** Mã nút trong cây danh mục (danh mục gốc hoặc nhóm con), vd 'engagement' hoặc 'wedding-style'. Lấy cả nhóm con. */
  @IsOptional() @IsString() @MaxLength(100) categoryId?: string;
  @IsOptional() @IsIn([...TEMPLATE_FORMATS]) format?: TemplateFormat;
  @IsOptional() @IsIn([...TEMPLATE_ORIENTATIONS]) orientation?: TemplateOrientation;
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional() @IsIn([...TEMPLATE_SORTS]) sort?: TemplateSort;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number;
}
