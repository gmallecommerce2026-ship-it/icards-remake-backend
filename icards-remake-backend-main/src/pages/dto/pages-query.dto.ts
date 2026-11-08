import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class PagesQueryDto {
  /** "true" = chỉ bài blog, "false" = chỉ trang tĩnh, bỏ trống = tất cả */
  @IsOptional() @IsIn(['true', 'false']) isBlog?: 'true' | 'false';
  @IsOptional() @IsString() @MaxLength(100) category?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}
