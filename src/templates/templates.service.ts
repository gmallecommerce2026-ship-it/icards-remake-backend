import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { escapeLike } from '../common/utils/object-id.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';
import { SettingsService } from '../settings/settings.service.js';
import type { TemplatesQueryDto } from './dto/templates-query.dto.js';
import { resolveTitleStyle, type TitleStyleMap } from './title-style.js';

/** Hình dạng trả về khớp kiểu InvitationTemplate của FE (src/lib/templates.ts). */
export const toTemplateDto = (
  t: InvitationTemplate,
  styles: TitleStyleMap = {},
) => {
  const titleStyle = resolveTitleStyle(styles, t.slug, t.category);
  return {
    _id: t._id,
    slug: t.slug,
    name: t.name,
    category: t.category,
    tagline: t.tagline,
    description: t.description,
    price: t.price,
    popularity: t.popularity,
    createdAt: t.releasedOn,
    features: t.features,
    ...(t.previewImage ? { previewImage: t.previewImage } : {}),
    motif: t.motif,
    palette: t.palette,
    sample: t.sample,
    /** Kiểu chữ tên mẫu trên thẻ (font, cỡ, màu...). Không có thì FE dùng kiểu mặc định. */
    ...(titleStyle ? { titleStyle } : {}),
  };
};

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(InvitationTemplate)
    private readonly repo: Repository<InvitationTemplate>,
    private readonly settings: SettingsService,
  ) {}

  private titleStyles() {
    return this.settings.getContent<TitleStyleMap>('template.titleStyles', {});
  }

  async list(q: TemplatesQueryDto) {
    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.isPublished = :pub', { pub: true });
    if (q.category)
      qb.andWhere('t.category = :category', { category: q.category });
    if (q.search?.trim()) {
      qb.andWhere('(t.name LIKE :s OR t.tagline LIKE :s)', {
        s: `%${escapeLike(q.search.trim())}%`,
      });
    }
    if (q.sort === 'newest') qb.orderBy('t.releasedOn', 'DESC');
    else if (q.sort === 'price-asc') qb.orderBy('t.price', 'ASC');
    else qb.orderBy('t.popularity', 'DESC');
    qb.addOrderBy('t.slug', 'ASC');
    if (q.limit) qb.take(q.limit);
    const [rows, styles] = await Promise.all([
      qb.getMany(),
      this.titleStyles(),
    ]);
    return rows.map((t) => toTemplateDto(t, styles));
  }

  async findPublished(idOrSlug: string) {
    const t = await this.repo.findOne({
      where: [
        { slug: idOrSlug, isPublished: true },
        { _id: idOrSlug, isPublished: true },
      ],
    });
    if (!t) throw new NotFoundException('Không tìm thấy mẫu thiệp');
    return toTemplateDto(t, await this.titleStyles());
  }

  /** Mẫu đã đăng theo danh sách slug (dùng cho khối dịp trên trang chủ). */
  async findPublishedBySlugs(slugs: string[]) {
    if (!slugs.length) return [];
    const rows = await this.repo
      .createQueryBuilder('t')
      .where('t.slug IN (:...slugs)', { slugs })
      .andWhere('t.isPublished = :pub', { pub: true })
      .getMany();
    const styles = await this.titleStyles();
    return rows.map((t) => toTemplateDto(t, styles));
  }

  /** Tăng lượt dùng khi người dùng mở một mẫu. */
  async trackView(idOrSlug: string) {
    await this.repo
      .createQueryBuilder()
      .update(InvitationTemplate)
      .set({ popularity: () => 'popularity + 1' })
      .where('(slug = :k OR _id = :k) AND isPublished = :pub', {
        k: idOrSlug,
        pub: true,
      })
      .execute();
    return { ok: true };
  }
}
