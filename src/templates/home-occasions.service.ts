import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsService } from '../settings/settings.service.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';
import { HOME_OCCASIONS_KEY, sanitizeHomeOccasions, type HomeOccasionsConfig } from './home-occasions.js';

export type HomeOccasionsView = HomeOccasionsConfig & {
  /** ảnh xem trước của mẫu được chọn làm nền (null nếu chưa chọn hoặc mẫu không còn đăng) */
  backgroundImage: string | null;
};

@Injectable()
export class HomeOccasionsService {
  constructor(
    private readonly settings: SettingsService,
    @InjectRepository(InvitationTemplate) private readonly templates: Repository<InvitationTemplate>,
  ) {}

  private async view(cfg: HomeOccasionsConfig): Promise<HomeOccasionsView> {
    let backgroundImage: string | null = null;
    if (cfg.backgroundTemplateSlug) {
      const t = await this.templates.findOne({
        where: { slug: cfg.backgroundTemplateSlug, isPublished: true },
        select: ['_id', 'previewImage'],
      });
      backgroundImage = t?.previewImage ?? null;
    }
    return { ...cfg, backgroundImage };
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
