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
import type { HeaderNavItem, TemplateBlockConfig, TemplateTreeNode } from '../settings/site-config.types.js';
import { assignMissingEnvelopes, isLegacyPresets, sanitizePresets } from '../templates/envelope-presets.js';
import { normalizeBannerGroups } from '../settings/banner-layout.js';
import { withRequiredMenuItems } from '../settings/menu-defaults.js';

/** Tăng số này khi thêm dữ liệu seed mới. Lần khởi động sau sẽ bổ sung phần còn thiếu. */
export const SEED_VERSION = 14;
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

/**
 * Gộp các nút còn thiếu từ `seed` vào `existing` theo id, không sửa nút đã có.
 * Dùng cho migration: thêm nhóm mới mà không ghi đè chỉnh sửa trên dashboard. Trả về cây mới và số nút đã thêm.
 */
export function mergeMissingTreeNodes(
  existing: TemplateTreeNode[],
  seed: TemplateTreeNode[],
): { tree: TemplateTreeNode[]; added: number } {
  let added = 0;
  const tree = existing.map((n) => ({ ...n }));
  for (const sn of seed) {
    const found = tree.find((n) => n.id === sn.id);
    if (!found) {
      tree.push(structuredClone(sn));
      added += 1 + countNodes(sn.children ?? []);
      continue;
    }
    if (sn.children?.length) {
      const sub = mergeMissingTreeNodes(found.children ?? [], sn.children);
      found.children = sub.tree;
      added += sub.added;
    }
  }
  return { tree, added };
}

const countNodes = (nodes: TemplateTreeNode[]): number =>
  nodes.reduce((t, n) => t + 1 + countNodes(n.children ?? []), 0);

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
        format: t.format ?? 'folding',
        orientation: t.orientation ?? 'portrait',
        layout: t.layout ?? null,
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
  // v6: kiểu chữ tên mẫu thiệp (font theo danh mục / theo mẫu). Không ghi đè nếu đã có.
  inserted['content:template.titleStyles'] = await setContentMissing(m, 'template.titleStyles', cfg.titleStyles, force);
  // v7: phong bì mặc định theo mẫu. Chỉ thêm khi chưa có, không ghi đè cấu hình dashboard.
  inserted['content:template.envelopes'] = await setContentMissing(m, 'template.envelopes', cfg.templateEnvelopes, force);
  // v8: danh mục phong bì + lớp lót (hoạ tiết). Chỉ thêm khi chưa có, không ghi đè dữ liệu dashboard.
  inserted['content:envelope.presets'] = await setContentMissing(m, 'envelope.presets', cfg.envelopePresets, force);
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

  // Migration v5: cây danh mục chuyển từ 2 sang 3 cấp (danh mục → nhóm → nhóm con → mẫu). Chỉ ghi đè khóa 'templates.tree'.
  if (seededVersion < 5 && !force) {
    await setContentMissing(m, 'templates.tree', TEMPLATE_TREE_SEED, true);
    inserted['migrate:v5'] = 1;
  }

  // Migration v7: font riêng cho TÊN danh mục nằm trong từng khối của 'template.blocks'.
  // Chỉ thêm titleStyle vào khối chưa có, không ghi đè chỉnh sửa đã có.
  if (seededVersion < 7 && !force) {
    const blocksRepo = m.getRepository(SiteContent);
    const blocksRow = await blocksRepo.findOne({ where: { key: 'template.blocks' } });
    if (blocksRow && Array.isArray(blocksRow.value)) {
      const seedBySlug = new Map(cfg.templateBlocks.map((b) => [b.slug, b]));
      const value = (blocksRow.value as TemplateBlockConfig[]).map((b) => {
        const seeded = seedBySlug.get(b.slug)?.titleStyle;
        return b.titleStyle || !seeded ? b : { ...b, titleStyle: seeded };
      });
      await blocksRepo.save({ key: 'template.blocks', value });
    }
    inserted['migrate:v7'] = 1;
  }

  // Migration v9: danh mục phong bì đa dạng hơn. Chỉ thay khi dữ liệu còn là bộ seed cũ (dashboard chưa sửa).
  if (seededVersion < 9 && !force) {
    const presetsRepo = m.getRepository(SiteContent);
    const presetsRow = await presetsRepo.findOne({ where: { key: 'envelope.presets' } });
    if (!presetsRow || isLegacyPresets(presetsRow.value)) {
      await presetsRepo.save({ key: 'envelope.presets', value: cfg.envelopePresets });
      inserted['migrate:v9'] = 1;
    }
  }

  // v10: mỗi mẫu thiệp một phong bì + lớp lót ngẫu nhiên (cố định theo slug). Chỉ gán cho mẫu chưa có cấu hình.
  {
    const envRepo = m.getRepository(SiteContent);
    const envRow = await envRepo.findOne({ where: { key: 'template.envelopes' } });
    const presetsRow = await envRepo.findOne({ where: { key: 'envelope.presets' } });
    const presets = sanitizePresets(presetsRow?.value ?? cfg.envelopePresets);
    const map = { ...((envRow?.value as Record<string, unknown>) ?? {}) };
    const slugs = (await m.getRepository(InvitationTemplate).find({ select: ['slug'] })).map((t) => t.slug);
    const added = assignMissingEnvelopes(map, slugs, presets);
    if (added) await envRepo.save({ key: 'template.envelopes', value: map });
    inserted['envelopes:assigned'] = added;
  }

  // Migration v12: thêm nhóm "Thiệp 2 mặt" vào cây danh mục đã có trong DB (khóa đã tồn tại nên bước nạp ở trên bỏ qua).
  // Chỉ thêm nút còn thiếu, không đụng vào nút hiện có. Phải là v12 vì DB đã ở v11 từ lần seed trước.
  if (seededVersion < 12 && !force) {
    const treeRepo = m.getRepository(SiteContent);
    const treeRow = await treeRepo.findOne({ where: { key: 'templates.tree' } });
    if (treeRow && Array.isArray(treeRow.value)) {
      const merged = mergeMissingTreeNodes(treeRow.value as TemplateTreeNode[], TEMPLATE_TREE_SEED);
      if (merged.added) await treeRepo.save({ key: 'templates.tree', value: merged.tree });
      inserted['migrate:v12'] = merged.added;
    }
  }

  // Migration v13: banner chuyển từ danh sách phẳng sang nhóm (đầu trang / cuối trang, bố cục).
  // Chỉ tạo bannerGroups khi chưa có; không ghi đè nhóm admin đã chỉnh.
  if (seededVersion < 13 && !force) {
    const settingsRepo = m.getRepository(SiteContent);
    const settingsRow = await settingsRepo.findOne({ where: { key: 'settings' } });
    const value = (settingsRow?.value ?? {}) as Record<string, unknown>;
    if (settingsRow && !Array.isArray(value.bannerGroups)) {
      await settingsRepo.save({ key: 'settings', value: { ...value, bannerGroups: normalizeBannerGroups(value) } });
      inserted['migrate:v13'] = 1;
    }
  }

  // Migration v14: menu trên web lấy hoàn toàn từ headerNav. Chỉ thêm mục bắt buộc còn thiếu, không đụng mục admin đã có.
  if (seededVersion < 14 && !force) {
    const settingsRepo = m.getRepository(SiteContent);
    const settingsRow = await settingsRepo.findOne({ where: { key: 'settings' } });
    if (settingsRow) {
      const value = settingsRow.value as Record<string, unknown>;
      const nav = Array.isArray(value.headerNav) ? (value.headerNav as HeaderNavItem[]) : [];
      const merged = withRequiredMenuItems(nav);
      if (merged.added) await settingsRepo.save({ key: 'settings', value: { ...value, headerNav: merged.nav } });
      inserted['migrate:v14'] = merged.added;
    }
  }

  await setContentMissing(m, STATE_KEY, { version: SEED_VERSION, seededAt: new Date().toISOString() }, true);
  return { skipped: false, version: SEED_VERSION, inserted };
}
