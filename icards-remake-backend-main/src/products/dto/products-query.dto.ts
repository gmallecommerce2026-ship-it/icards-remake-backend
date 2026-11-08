import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { SHOP_CATEGORY_IDS, type ShopCategory } from '../../catalog/catalog.types.js';

export class ProductsQueryDto {
  @IsOptional() @IsIn([...SHOP_CATEGORY_IDS]) category?: ShopCategory;
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}
