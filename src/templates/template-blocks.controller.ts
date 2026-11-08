import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { stableId } from '../common/utils/stable-id.js';
import { SettingsService } from '../settings/settings.service.js';
import type { TemplateBlockConfig } from '../settings/site-config.types.js';
import { TemplatesService } from './templates.service.js';

/** Các khối "dịp" trên trang chủ. Cấu hình ở site_content, khóa 'template.blocks'. Công khai, không cần đăng nhập. */
@ApiTags('templates')
@Controller('template-blocks')
export class TemplateBlocksController {
  constructor(
    private readonly settings: SettingsService,
    private readonly templates: TemplatesService,
  ) {}

  @SkipThrottle()
  @Get()
  async list() {
    const blocks = await this.settings.getContent<TemplateBlockConfig[]>('template.blocks', []);
    const slugs = [...new Set(blocks.flatMap((b) => b.templateSlugs))];
    const bySlug = new Map((await this.templates.findPublishedBySlugs(slugs)).map((t) => [t.slug, t]));

    return blocks.map((b) => ({
      _id: stableId('template-block', b.slug),
      title: b.title,
      slug: b.slug,
      isActive: b.isActive,
      templates: b.templateSlugs
        .map((s) => bySlug.get(s))
        .filter((t): t is NonNullable<typeof t> => !!t)
        .map((t) => ({ _id: t._id, imgSrc: t.previewImage })),
    }));
  }
}
