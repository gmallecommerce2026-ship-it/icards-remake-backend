import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Product } from '../products/schemas/product.schema.js';
import { toProductDto } from '../products/products.service.js';
import { Service as ServiceEntity } from '../services/schemas/service.schema.js';
import { toServiceDto } from '../services/services.service.js';
import { Page } from '../pages/schemas/page.schema.js';
import { SettingsService } from '../settings/settings.service.js';
import { cleanBlogCategories, cleanPost, cleanProduct, cleanService } from './catalog-admin.validator.js';

/** Quản trị sản phẩm, dịch vụ, bài viết và chuyên mục blog. Mọi thao tác ghi đều đi qua validator. */
@Injectable()
export class CatalogAdminService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(ServiceEntity) private readonly services: Repository<ServiceEntity>,
    @InjectRepository(Page) private readonly pages: Repository<Page>,
    private readonly settings: SettingsService,
  ) {}

  /* ---------- Sản phẩm ---------- */

  async listProducts(search?: string) {
    const qb = this.products.createQueryBuilder('p').orderBy('p.sortOrder', 'ASC').addOrderBy('p.slug', 'ASC');
    if (search?.trim()) qb.where('(p.name LIKE :s OR p.slug LIKE :s)', { s: `%${search.trim()}%` });
    const rows = await qb.getMany();
    return rows.map((p) => ({ ...toProductDto(p), isPublished: p.isPublished }));
  }

  async createProduct(body: unknown) {
    const input = cleanProduct(body);
    await this.assertSlugFree(this.products, input.slug);
    const row = await this.products.save(this.products.create(input));
    return { ...toProductDto(row), isPublished: row.isPublished };
  }

  async updateProduct(id: string, body: unknown) {
    const row = await this.products.findOne({ where: { _id: id } });
    if (!row) throw new NotFoundException('Không tìm thấy sản phẩm');
    const input = cleanProduct(body);
    await this.assertSlugFree(this.products, input.slug, id);
    Object.assign(row, input);
    const saved = await this.products.save(row);
    return { ...toProductDto(saved), isPublished: saved.isPublished };
  }

  async removeProduct(id: string) {
    const res = await this.products.delete({ _id: id });
    if (!res.affected) throw new NotFoundException('Không tìm thấy sản phẩm');
    return { ok: true };
  }

  /* ---------- Dịch vụ ---------- */

  async listServices() {
    const rows = await this.services.find({ order: { sortOrder: 'ASC', slug: 'ASC' } });
    return rows.map((s) => ({ ...toServiceDto(s), sortOrder: s.sortOrder, isPublished: s.isPublished }));
  }

  async createService(body: unknown) {
    const input = cleanService(body);
    await this.assertSlugFree(this.services, input.slug);
    const row = await this.services.save(this.services.create(input));
    return { ...toServiceDto(row), sortOrder: row.sortOrder, isPublished: row.isPublished };
  }

  async updateService(id: string, body: unknown) {
    const row = await this.services.findOne({ where: { _id: id } });
    if (!row) throw new NotFoundException('Không tìm thấy dịch vụ');
    const input = cleanService(body);
    await this.assertSlugFree(this.services, input.slug, id);
    Object.assign(row, input);
    const saved = await this.services.save(row);
    return { ...toServiceDto(saved), sortOrder: saved.sortOrder, isPublished: saved.isPublished };
  }

  async removeService(id: string) {
    const res = await this.services.delete({ _id: id });
    if (!res.affected) throw new NotFoundException('Không tìm thấy dịch vụ');
    return { ok: true };
  }

  /* ---------- Tin tức (bài blog) ---------- */

  async listPosts() {
    const rows = await this.pages.find({ where: { isBlog: true }, order: { publishedOn: 'DESC', slug: 'ASC' } });
    return rows.map(postDto);
  }

  async createPost(body: unknown) {
    const input = cleanPost(body);
    await this.assertSlugFree(this.pages, input.slug);
    const row = await this.pages.save(this.pages.create({ ...input, isBlog: true }));
    return postDto(row);
  }

  async updatePost(id: string, body: unknown) {
    const row = await this.pages.findOne({ where: { _id: id, isBlog: true } });
    if (!row) throw new NotFoundException('Không tìm thấy bài viết');
    const input = cleanPost(body);
    await this.assertSlugFree(this.pages, input.slug, id);
    Object.assign(row, input);
    return postDto(await this.pages.save(row));
  }

  async removePost(id: string) {
    const res = await this.pages.delete({ _id: id, isBlog: true });
    if (!res.affected) throw new NotFoundException('Không tìm thấy bài viết');
    return { ok: true };
  }

  /* ---------- Chuyên mục blog (khóa content 'blog.categories') ---------- */

  async saveBlogCategories(raw: unknown) {
    const categories = cleanBlogCategories(raw);
    await this.settings.setContent('blog.categories', categories);
    return { categories };
  }

  /* ---------- Tiện ích ---------- */

  private async assertSlugFree<T extends { slug: string; _id: string }>(repo: Repository<T>, slug: string, selfId?: string) {
    const where = selfId ? { slug, _id: Not(selfId) } : { slug };
    const exists = await repo.exists({ where: where as never });
    if (exists) throw new BadRequestException(`Đường dẫn "${slug}" đã được dùng.`);
  }
}

const postDto = (p: Page) => ({
  _id: p._id,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt ?? '',
  category: p.category ?? '',
  publishedOn: p.publishedOn ?? '',
  readMinutes: p.readMinutes ?? 0,
  author: p.author ?? '',
  tone: p.tone ?? { bg: '#FFFFFF', ink: '#0E1B2C' },
  content: p.content ?? [],
  isPublished: p.isPublished,
});
