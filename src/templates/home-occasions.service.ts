import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service.js';
import { TemplatesService } from './templates.service.js';
import { TemplateCategoriesService } from './template-categories.service.js';
import type { CategoryTreeNode, CategoryTreeTemplate } from './template-category-tree.js';
import { HOME_OCCASIONS_KEY, sanitizeHomeOccasions, type HomeOccasionsConfig } from './home-occasions.js';

type TemplateDto = Awaited<ReturnType<TemplatesService['findPublishedBySlugs']>>[number];

export type HomeOccasionsView = HomeOccasionsConfig & {
  /**
   * Mẫu được chọn làm nền, dạng đầy đủ như danh sách mẫu thiệp để FE dựng đúng "ảnh xem trước"
   * (thiệp + phong bì giống các thẻ mẫu). null nếu chưa chọn hoặc mẫu không còn đăng.
   */
  backgroundTemplate: TemplateDto | null;
  /** Mẫu đại diện của từng danh mục gốc (khóa = slug danh mục): mẫu đầu tiên theo thứ tự cây. */
  coverTemplates: Record<string, TemplateDto>;
};

/** Mẫu đầu tiên theo thứ tự cây (mẫu của nút trước, rồi tới nhóm con). */
function firstTemplate(node: CategoryTreeNode): CategoryTreeTemplate | undefined {
  if (node.templates[0]) return node.templates[0];
  for (const c of node.children) {
    const t = firstTemplate(c);
    if (t) return t;
  }
  return undefined;
}

@Injectable()
export class HomeOccasionsService {
  constructor(
    private readonly settings: SettingsService,
    private readonly templatesService: TemplatesService,
    private readonly categories: TemplateCategoriesService,
  ) {}

  private async view(cfg: HomeOccasionsConfig): Promise<HomeOccasionsView> {
    const tree = await this.categories.tree();
    const coverSlugs: Record<string, string> = {};
    for (const root of tree) {
      const t = firstTemplate(root);
      if (t) coverSlugs[root.id] = t.slug;
    }
    const wanted = [...new Set([...Object.values(coverSlugs), ...(cfg.backgroundTemplateSlug ? [cfg.backgroundTemplateSlug] : [])])];
    const found = new Map((await this.templatesService.findPublishedBySlugs(wanted)).map((t) => [t.slug, t]));

    const coverTemplates: Record<string, TemplateDto> = {};
    for (const [rootId, slug] of Object.entries(coverSlugs)) {
      const t = found.get(slug);
      if (t) coverTemplates[rootId] = t;
    }
    return { ...cfg, backgroundTemplate: (cfg.backgroundTemplateSlug && found.get(cfg.backgroundTemplateSlug)) || null, coverTemplates };
  }

  async get(): Promise<HomeOccasionsView> {
    return this.view(sanitizeHomeOccasions(await this.settings.getContent<unknown>(HOME_OCCASIONS_KEY, {})));
  }

  async save(body: unknown): Promise<HomeOccasionsView> {
    const clean = sanitizeHomeOccasions(body);
    await this.settings.setContent(HOME_OCCASIONS_KEY, clean);
    return this.view(clean);
  }
}
