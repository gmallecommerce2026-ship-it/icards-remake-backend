import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SettingsService } from '../settings/settings.service.js';
import type { TemplateTreeNode } from '../settings/site-config.types.js';
import { TemplatesService } from './templates.service.js';

interface TreeTemplate {
  _id: string;
  slug: string;
  name: string;
  previewImage?: string | null;
}
interface TreeNodeDto {
  id: string;
  label: string;
  /** Trang lọc: /templates?category=<gốc>&group=<nút> */
  path: string;
  /** Tổng số mẫu trong nút này và mọi nút con */
  count: number;
  templates: TreeTemplate[];
  children: TreeNodeDto[];
}

/**
 * Cây danh mục mẫu thiệp nhiều cấp cho menu và trang /templates. Công khai.
 * Cấu hình ở site_content, khóa 'templates.tree'; mẫu thiệp được gắn theo slug (xem seed/data/template-tree.seed.ts).
 * Mẫu đã ẩn hoặc không tồn tại sẽ bị bỏ qua. Nút rỗng (không có mẫu ở bất kỳ cấp nào) không được trả về.
 */
@ApiTags('templates')
@Controller('template-categories')
export class TemplateCategoriesController {
  constructor(
    private readonly settings: SettingsService,
    private readonly templates: TemplatesService,
  ) {}

  @SkipThrottle()
  @Get()
  async tree(): Promise<TreeNodeDto[]> {
    const roots = await this.settings.getContent<TemplateTreeNode[]>('templates.tree', []);
    const slugs: string[] = [];
    const collect = (nodes: TemplateTreeNode[]) =>
      nodes.forEach((n) => {
        slugs.push(...(n.templateSlugs ?? []));
        collect(n.children ?? []);
      });
    collect(roots);
    const bySlug = new Map((await this.templates.findPublishedBySlugs([...new Set(slugs)])).map((t) => [t.slug, t]));

    const convert = (n: TemplateTreeNode, rootId: string): TreeNodeDto | null => {
      const children = (n.children ?? []).map((c) => convert(c, rootId)).filter((c): c is TreeNodeDto => !!c);
      const templates = (n.templateSlugs ?? [])
        .map((s) => bySlug.get(s))
        .filter((t): t is NonNullable<typeof t> => !!t)
        .map((t) => ({ _id: t._id, slug: t.slug, name: t.name, previewImage: t.previewImage ?? null }));
      const count = templates.length + children.reduce((sum, c) => sum + c.count, 0);
      if (count === 0) return null;
      const path = n.id === rootId ? `/templates?category=${rootId}` : `/templates?category=${rootId}&group=${n.id}`;
      return { id: n.id, label: n.label, path, count, templates, children };
    };

    return roots.map((r) => convert(r, r.id)).filter((r): r is TreeNodeDto => !!r);
  }
}
