import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { escapeLike } from '../common/utils/object-id.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';
import type { TemplatesQueryDto } from './dto/templates-query.dto.js';

/** Hình dạng trả về khớp kiểu InvitationTemplate của FE (src/lib/templates.ts). */
export const toTemplateDto = (t: InvitationTemplate) => ({
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
});

@Injectable()
export class TemplatesService {
  constructor(@InjectRepository(InvitationTemplate) private readonly repo: Repository<InvitationTemplate>) {}

  async list(q: TemplatesQueryDto) {
    const qb = this.repo.createQueryBuilder('t').where('t.isPublished = :pub', { pub: true });
    if (q.category) qb.andWhere('t.category = :category', { category: q.category });
    if (q.search?.trim()) {
      qb.andWhere('(t.name LIKE :s OR t.tagline LIKE :s)', { s: `%${escapeLike(q.search.trim())}%` });
    }
    if (q.sort === 'newest') qb.orderBy('t.releasedOn', 'DESC');
    else if (q.sort === 'price-asc') qb.orderBy('t.price', 'ASC');
    else qb.orderBy('t.popularity', 'DESC');
    qb.addOrderBy('t.slug', 'ASC');
    if (q.limit) qb.take(q.limit);
    const rows = await qb.getMany();
    return rows.map(toTemplateDto);
  }

  async findPublished(idOrSlug: string) {
    const t = await this.repo.findOne({
      where: [
        { slug: idOrSlug, isPublished: true },
        { _id: idOrSlug, isPublished: true },
      ],
    });
    if (!t) throw new NotFoundException('Không tìm thấy mẫu thiệp');
    return toTemplateDto(t);
  }

  /** Tăng lượt dùng khi người dùng mở một mẫu. */
  async trackView(idOrSlug: string) {
    await this.repo
      .createQueryBuilder()
      .update(InvitationTemplate)
      .set({ popularity: () => 'popularity + 1' })
      .where('(slug = :k OR _id = :k) AND isPublished = :pub', { k: idOrSlug, pub: true })
      .execute();
    return { ok: true };
  }
}
