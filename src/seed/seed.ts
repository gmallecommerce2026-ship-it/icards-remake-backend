// Nạp dữ liệu mẫu (dữ liệu mock hiện tại của FE) vào DB.
// Chạy: npm run seed. Idempotent: chạy lại sẽ cập nhật đúng bản ghi cũ (theo slug), không nhân đôi.
// Không xoá bản ghi không còn trong seed; xoá tay nếu cần.
import 'reflect-metadata';
import { DataSource, type EntityManager } from 'typeorm';
import { stableId } from '../common/utils/stable-id.js';
import { PUBLIC_CONTENT_KEYS, type PublicContentKey } from '../catalog/catalog.types.js';
import { InvitationTemplate } from '../templates/schemas/invitation-template.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { Service } from '../services/schemas/service.schema.js';
import { ServiceRequest } from '../services/schemas/service-request.schema.js';
import { Page } from '../pages/schemas/page.schema.js';
import { FaqItem } from '../pages/schemas/faq-item.schema.js';
import { SiteContent } from '../settings/schemas/site-content.schema.js';
import { CATALOG_SEED } from './data/catalog.seed.js';

const ENTITIES = [InvitationTemplate, Product, Service, ServiceRequest, Page, FaqItem, SiteContent];

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name}`);
  return v;
}

async function seedCatalog(m: EntityManager) {
  const d = CATALOG_SEED;

  // 1. Mẫu thiệp
  await m.getRepository(InvitationTemplate).save(
    d.templates.map((t) =>
      Object.assign(new InvitationTemplate(), {
        _id: stableId('template', t.slug),
        slug: t.slug,
        name: t.name,
        category: t.category,
        tagline: t.tagline,
        description: t.description,
        price: t.price,
        popularity: t.popularity,
        releasedOn: t.createdAt,
        features: t.features,
        previewImage: t.previewImage ?? null,
        motif: t.motif,
        palette: t.palette,
        sample: t.sample,
        isPublished: true,
      }),
    ),
  );

  // 2. Sản phẩm cửa hàng
  await m.getRepository(Product).save(
    d.products.map((p, i) =>
      Object.assign(new Product(), {
        _id: stableId('product', p.slug),
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
        sortOrder: i,
        isPublished: true,
      }),
    ),
  );

  // 3. Dịch vụ
  await m.getRepository(Service).save(
    d.services.map((s, i) =>
      Object.assign(new Service(), {
        _id: stableId('service', s.slug),
        slug: s.slug,
        name: s.name,
        summary: s.summary,
        description: s.description,
        priceFrom: s.priceFrom,
        duration: s.duration,
        audience: s.audience,
        includes: s.includes,
        sortOrder: i,
        isPublished: true,
      }),
    ),
  );

  // 4. Blog
  await m.getRepository(Page).save(
    d.posts.map((p) =>
      Object.assign(new Page(), {
        _id: stableId('page', p.slug),
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        isBlog: true,
        publishedOn: p.date,
        readMinutes: p.readMinutes,
        author: p.author,
        tone: p.tone,
        content: p.content,
        isPublished: true,
      }),
    ),
  );

  // 5. FAQ
  await m.getRepository(FaqItem).save(
    d.faqItems.map((f, i) =>
      Object.assign(new FaqItem(), {
        _id: stableId('faq', f.id),
        code: f.id,
        groupSlug: f.group,
        q: f.q,
        a: f.a,
        sortOrder: i,
        isPublished: true,
      }),
    ),
  );

  // 6. Danh mục và nội dung cấu hình. Record<PublicContentKey, …> buộc mọi khóa công khai phải có dữ liệu.
  const content: Record<PublicContentKey, unknown> = {
    'templates.categories': d.templateCategories,
    'shop.categories': d.shopCategories,
    'services.process': d.servicesProcess,
    'blog.categories': d.blogCategories,
    'faq.groups': d.faqGroups,
    'professional.process': d.professionalProcess,
    'professional.tiers': d.professionalTiers,
    'professional.portfolio': d.professionalPortfolio,
  };
  for (const key of PUBLIC_CONTENT_KEYS) {
    await m.getRepository(SiteContent).save({ key, value: content[key] });
  }

  return {
    templates: d.templates.length,
    products: d.products.length,
    services: d.services.length,
    posts: d.posts.length,
    faqItems: d.faqItems.length,
    contentKeys: PUBLIC_CONTENT_KEYS.length,
  };
}

async function main() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: ENTITIES,
    synchronize: false,
  });
  await ds.initialize();
  try {
    // Tạo bảng nếu chưa có (chỉ đụng các bảng của catalog). Khi production đã tắt DB_SYNCHRONIZE thì bỏ qua.
    if (process.env.DB_SYNCHRONIZE !== 'false') await ds.synchronize();
    const summary = await ds.transaction((m) => seedCatalog(m));
    console.log('Seed xong:', summary);
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Seed lỗi:', err);
  process.exit(1);
});
