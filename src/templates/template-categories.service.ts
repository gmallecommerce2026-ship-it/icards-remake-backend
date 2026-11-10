import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, IsNull, Repository } from 'typeorm';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';
import { TemplateCategoryNode } from './schemas/template-category-node.schema.js';
import { buildCategoryTree, type CategoryTreeNode } from './template-category-tree.js';

@Injectable()
export class TemplateCategoriesService {
  constructor(
    @InjectRepository(TemplateCategoryNode)
    private readonly nodes: Repository<TemplateCategoryNode>,
    @InjectRepository(InvitationTemplate)
    private readonly templates: Repository<InvitationTemplate>,
  ) {}

  /** Cây danh mục công khai: chỉ mẫu đã đăng, nút rỗng bị bỏ qua. */
  async tree(): Promise<CategoryTreeNode[]> {
    const [nodes, templates] = await Promise.all([
      this.nodes.find({ select: ['_id', 'slug', 'label', 'parentId', 'sortOrder'] }),
      this.templates.find({
        where: { isPublished: true, categoryId: Not(IsNull()) },
        select: ['_id', 'slug', 'name', 'previewImage', 'categoryId', 'popularity'],
        order: { popularity: 'DESC', slug: 'ASC' },
      }),
    ]);
    return buildCategoryTree(nodes, templates);
  }

  /** Tìm nút theo mã (slug). Trả về null nếu không có. */
  findBySlug(slug: string): Promise<TemplateCategoryNode | null> {
    return this.nodes.findOne({ where: { slug } });
  }
}
