import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { escapeLike } from '../common/utils/object-id.js';
import { Product } from './schemas/product.schema.js';
import type { ProductsQueryDto } from './dto/products-query.dto.js';

/** Hình dạng trả về khớp kiểu Product của FE (src/lib/shop.ts). */
export const toProductDto = (p: Product) => ({
  _id: p._id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  summary: p.summary,
  description: p.description,
  thumb: p.thumb,
  tone: p.tone,
  variants: p.variants,
  shipping: p.shipping,
  leadTime: p.leadTime,
  highlights: p.highlights,
  specs: p.specs,
});

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) {}

  async list(q: ProductsQueryDto) {
    const qb = this.repo.createQueryBuilder('p').where('p.isPublished = :pub', { pub: true });
    if (q.category) qb.andWhere('p.category = :category', { category: q.category });
    if (q.search?.trim()) {
      qb.andWhere('(p.name LIKE :s OR p.summary LIKE :s)', { s: `%${escapeLike(q.search.trim())}%` });
    }
    qb.orderBy('p.sortOrder', 'ASC').addOrderBy('p.slug', 'ASC');
    if (q.limit) qb.take(q.limit);
    const rows = await qb.getMany();
    return rows.map(toProductDto);
  }

  async findPublished(idOrSlug: string) {
    const p = await this.repo.findOne({
      where: [
        { slug: idOrSlug, isPublished: true },
        { _id: idOrSlug, isPublished: true },
      ],
    });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm');
    return toProductDto(p);
  }
}
