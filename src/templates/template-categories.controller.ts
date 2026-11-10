import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { TemplateCategoriesService } from './template-categories.service.js';
import type { CategoryTreeNode } from './template-category-tree.js';

/**
 * Cây danh mục mẫu thiệp nhiều cấp cho menu và các nút lọc trên trang /templates. Công khai.
 * Dữ liệu nằm ở bảng template_category_nodes; mẫu gắn nhóm qua invitation_templates.categoryId (xem seed).
 */
@ApiTags('templates')
@Controller('template-categories')
export class TemplateCategoriesController {
  constructor(private readonly categories: TemplateCategoriesService) {}

  @SkipThrottle()
  @Get()
  tree(): Promise<CategoryTreeNode[]> {
    return this.categories.tree();
  }
}
