import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SlugCategoryItem } from '../catalog/catalog.types.js';
import { SettingsService } from '../settings/settings.service.js';
import { FaqItem } from './schemas/faq-item.schema.js';
import { Page } from './schemas/page.schema.js';
import type { PagesQueryDto } from './dto/pages-query.dto.js';

/** Thông tin tóm tắt (dùng cho danh sách, không kèm nội dung). Khớp kiểu Post của FE. */
const toSummaryDto = (p: Page) => ({
  _id: p._id,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt ?? '',
  category: p.category ?? '',
  date: p.publishedOn ?? '',
  readMinutes: p.readMinutes ?? 0,
  author: p.author ?? '',
  tone: p.tone ?? { bg: '#FFFFFF', ink: '#0E1B2C' },
  isBlog: p.isBlog,
});

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page) private readonly pages: Repository<Page>,
    @InjectRepository(FaqItem) private readonly faqItems: Repository<FaqItem>,
    private readonly settings: SettingsService,
  ) {}

  async list(q: PagesQueryDto) {
    const qb = this.pages.createQueryBuilder('p').where('p.isPublished = :pub', { pub: true });
    if (q.isBlog !== undefined) qb.andWhere('p.isBlog = :isBlog', { isBlog: q.isBlog === 'true' });
    if (q.category) qb.andWhere('p.category = :category', { category: q.category });
    qb.orderBy('p.publishedOn', 'DESC').addOrderBy('p.slug', 'ASC');
    if (q.limit) qb.take(q.limit);
    const rows = await qb.getMany();
    return rows.map(toSummaryDto);
  }

  /** Toàn bộ câu hỏi thường gặp + nhóm. Trả về { groups, items } để FE lọc theo nhóm. */
  async faq() {
    const [rows, groups] = await Promise.all([
      this.faqItems.find({ where: { isPublished: true }, order: { sortOrder: 'ASC' } }),
      this.settings.getContent<SlugCategoryItem[]>('faq.groups', []),
    ]);
    return {
      groups,
      items: rows.map((r) => ({ id: r.code, group: r.groupSlug, q: r.q, a: r.a })),
    };
  }

  async findPublished(slug: string) {
    const p = await this.pages.findOne({ where: { slug, isPublished: true } });
    if (!p) throw new NotFoundException('Không tìm thấy trang');
    return { ...toSummaryDto(p), content: p.content ?? [] };
  }
}
