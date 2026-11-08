// Logic nạp dữ liệu danh mục và giao diện. Dùng chung cho CLI (npm run seed) và tự nạp khi khởi động (SEED_ON_BOOT=true).
//
// Mặc định KHÔNG ghi đè: bản ghi đã tồn tại (theo _id hoặc key) được giữ nguyên, nên chỉnh sửa từ dashboard không bị mất.
// Trạng thái đã nạp lưu ở key 'seed.state'. Chỉ khi SEED_VERSION tăng thì lần nạp sau mới chạy lại để bổ sung phần còn thiếu.
// Tham số force (CLI: npm run seed -- --force) ghi đè toàn bộ về dữ liệu gốc.
import type { EntityManager, EntityTarget } from 'typeorm';
import { stableId } from '../common/utils/stable-id.js';
import { PUBLIC_CONTENT_KEYS, type PublicContentKey } from '../catalog/catalog.types.js';
import { InvitationTemplate } from '../templates/schemas/invitation-template.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { Service } from '../services/schemas/service.schema.js';
import { Page } from '../pages/schemas/page.schema.js';
import { FaqItem } from '../pages/schemas/faq-item.schema.js';
import { SiteContent } from '../settings/schemas/site-content.schema.js';
import { CATALOG_SEED } from './data/catalog.seed.js';
import { SITE_CONFIG_SEED } from './data/site-config.seed.js';
import { EXTRA_TEMPLATES, TEMPLATE_TREE_SEED } from './data/template-tree.seed.js';

/** Tăng số này khi thêm dữ liệu seed mới. Lần khởi động sau sẽ bổ sung phần còn thiếu. */
export const SEED_VERSION = 4;
const STATE_KEY = 'seed.state';

export interface SeedSummary {
  skipped: boolean;
  version: number;
  inserted: Record<string, number>;
}

type WithId = { _id: string };

/** Thêm các bản ghi chưa có (theo _id). Với force, ghi đè bản ghi cũ. Trả về số bản ghi được thêm/ghi. */
async function insertMissing<E extends WithId>(
  m: EntityManager,
  target: EntityTarget<E>,
  rows: E[],
  force: boolean,
): Promise<number> {
  if (rows.length === 0) return 0;
  const repo = m.getRepository(target);
  if (force) {
    await repo.save(rows);
    return rows.length;
  }
  const found = await repo
    .createQueryBuilder('e')
    .select('e._id', '_id')
    .where('e._id IN (:...ids)', { ids: rows.map((r) => r._id) })
    .getRawMany<{ _id: string }>();
  const existing = new Set(found.map((r) => r._id));
  const missing = rows.filter((r) => !existing.has(r._id));
  if (missing.length) await repo.save(missing);
  return missing.length;
}

/** Ghi một khóa site_content. Không ghi đè nếu đã có, trừ khi force. */
async function setContentMissing(m: EntityManager, key: string, value: unknown, force: boolean): Promise<number> {
  const repo = m.getRepository(SiteContent);
  if (force) {
    await repo.save({ key, value });
    return 1;
  }
  if (await repo.exist({ where: { key } })) return 0;
  await repo.save({ key, value });
  return 1;
}

export async function seedAll(m: EntityManager, { force = false, repair = false }: { force?: boolean; repair?: boolean } = {}): Promise<SeedSummary> {
  const state = await m.getRepository(SiteContent).findOne({ where: { key: STATE_KEY } });
  const seededVersion = (state?.value as { version?: number } | undefined)?.version ?? 0;
  if (!force && !repair && seededVersion >= SEED_VERSION) {
    return { skipped: true, version: SEED_VERSION, inserted: {} };
  }

  const d = CATALOG_SEED;
  const cfg = SITE_CONFIG_SEED;
  const inserted: Record<string, number> = {};

  inserted.templates = await insertMissing(
    m,
    InvitationTemplate,
    [...d.templates, ...EXTRA_TEMPLATES].map((t) =>
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
    force,
  );

  inserted.products = await insertMissing(
    m,
    Product,
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
    force,
  );

  inserted.services = await insertMissing(
    m,
    Service,
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
    force,
  );

  inserted.posts = await insertMissing(
    m,
    Page,
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
    force,
  );

  inserted.faqItems = await insertMissing(
    m,
    FaqItem,
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
    force,
  );

  // Danh mục và nội dung công khai. Record<PublicContentKey, …> buộc mọi khóa công khai phải có dữ liệu.
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
    inserted[`content:${key}`] = await setContentMissing(m, key, content[key], force);
  }

  // Cấu hình giao diện: thông báo, menu, banner, giới thiệu, khối dịp
  inserted['content:settings'] = await setContentMissing(m, 'settings', cfg.settings, force);
  inserted['content:template.blocks'] = await setContentMissing(m, 'template.blocks', cfg.templateBlocks, force);
  // v4: cây danh mục mẫu thiệp nhiều cấp (menu + trang /templates). Không ghi đè nếu đã có.
  inserted['content:templates.tree'] = await setContentMissing(m, 'templates.tree', TEMPLATE_TREE_SEED, force);

  // Migration v3: menu và khối dịp phiên bản 2 còn rỗng, nên thay bằng dữ liệu đầy đủ.
  // Chỉ ghi đè hai phần này, giữ nguyên theme, banner, introText. Dashboard chưa tồn tại nên chưa có chỉnh sửa nào bị mất.
  if (seededVersion < 3 && !force) {
    const settingsRow = await m.getRepository(SiteContent).findOne({ where: { key: 'settings' } });
    if (settingsRow) {
      await m.getRepository(SiteContent).save({
        key: 'settings',
        value: { ...(settingsRow.value as object), headerNav: cfg.settings.headerNav },
      });
    }
    await setContentMissing(m, 'template.blocks', cfg.templateBlocks, true);
    inserted['migrate:v3'] = 1;
  }

  await setContentMissing(m, STATE_KEY, { version: SEED_VERSION, seededAt: new Date().toISOString() }, true);
  return { skipped: false, version: SEED_VERSION, inserted };
}
