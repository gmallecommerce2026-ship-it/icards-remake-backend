import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { escapeLike } from '../common/utils/object-id.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';
import { TemplateCategoryNode } from './schemas/template-category-node.schema.js';
import { SettingsService } from '../settings/settings.service.js';
import type { TemplatesQueryDto } from './dto/templates-query.dto.js';
import { resolveTitleStyle, type TitleStyleMap } from './title-style.js';
import { ENVELOPES_KEY, resolveEnvelope } from './envelope.js';

/** Hình dạng trả về khớp kiểu InvitationTemplate của FE (src/lib/templates.ts). */
export const toTemplateDto = (
  t: InvitationTemplate,
  styles: TitleStyleMap = {},
  envelopes: Record<string, unknown> = {},
) => {
  const titleStyle = resolveTitleStyle(styles, t.slug, t.category);
  const envelope = resolveEnvelope(envelopes, t.slug);
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
    /** folding (gập) hoặc card (2 mặt phẳng). Mẫu cũ không có trường này nên mặc định folding. */
    format: t.format ?? 'folding',
    /** landscape | square | portrait. */
    orientation: t.orientation ?? 'portrait',
    /** Bố cục hai mặt (chỉ với format = card). */
    ...(t.format === 'card' && t.layout ? { layout: t.layout } : {}),
    /** Kiểu chữ tên mẫu trên thẻ (font, cỡ, màu...). Không có thì FE dùng kiểu mặc định. */
    ...(titleStyle ? { titleStyle } : {}),
    /** Phong bì mặc định khi mở studio với mẫu này (envId / linerId). Không có thì FE dùng mặc định chung. */
    ...(envelope ? { envelope } : {}),
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

  private envelopes() {
    return this.settings.getContent<Record<string, unknown>>(ENVELOPES_KEY, {});
  }

  async list(q: TemplatesQueryDto) {
    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.isPublished = :pub', { pub: true });
    if (q.category)
      qb.andWhere('t.category = :category', { category: q.category });
    if (q.categoryId) {
      // Lọc theo nút trong cây: lấy mẫu gắn đúng nút đó hoặc gắn ở mọi nút con (keyPath bắt đầu bằng keyPath của nút + '/').
      qb.innerJoin(TemplateCategoryNode, 'tc', 'tc._id = t.categoryId')
        .innerJoin(TemplateCategoryNode, 'tn', 'tn.slug = :categoryId', { categoryId: q.categoryId })
        .andWhere(
          '(tc.keyPath = tn.keyPath OR SUBSTRING(tc.keyPath, 1, CHAR_LENGTH(tn.keyPath) + 1) = CONCAT(tn.keyPath, \'/\'))',
        );
    }
    if (q.format) qb.andWhere('t.format = :format', { format: q.format });
    if (q.orientation) qb.andWhere('t.orientation = :orientation', { orientation: q.orientation });
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
    const [rows, styles, envelopes] = await Promise.all([
      qb.getMany(),
      this.titleStyles(),
      this.envelopes(),
    ]);
    return rows.map((t) => toTemplateDto(t, styles, envelopes));
  }

  async findPublished(idOrSlug: string) {
    const t = await this.repo.findOne({
      where: [
        { slug: idOrSlug, isPublished: true },
        { _id: idOrSlug, isPublished: true },
      ],
    });
    if (!t) throw new NotFoundException('Không tìm thấy mẫu thiệp');
    const dto = toTemplateDto(t, await this.titleStyles(), await this.envelopes());
    // Chỉ trang chi tiết mới trả thiết kế (danh sách không cần, và thiết kế có thể lớn)
    return t.design ? { ...dto, design: t.design } : dto;
  }

  /** Mẫu đã đăng theo danh sách slug (dùng cho khối dịp trên trang chủ). */
  async findPublishedBySlugs(slugs: string[]) {
    if (!slugs.length) return [];
    const rows = await this.repo
      .createQueryBuilder('t')
      .where('t.slug IN (:...slugs)', { slugs })
      .andWhere('t.isPublished = :pub', { pub: true })
      .getMany();
    const [styles, envelopes] = await Promise.all([this.titleStyles(), this.envelopes()]);
    return rows.map((t) => toTemplateDto(t, styles, envelopes));
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
