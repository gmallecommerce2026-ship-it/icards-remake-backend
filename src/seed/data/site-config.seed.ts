// Cấu hình giao diện gốc (viết tay). Khác catalog.seed.ts (sinh từ mock), file này là nguồn để sửa tay.
// Sau khi nạp, dashboard có thể đổi các khóa 'settings' và 'template.blocks' trong site_content.
import type { SiteSettings, TemplateBlockConfig } from '../../settings/site-config.types.js';
import type { TemplateTitleStyle } from '../../catalog/catalog.types.js';
import { CATALOG_SEED } from './catalog.seed.js';
import { ENVELOPE_PRESETS_SEED } from '../../templates/envelope-presets.js';
import { groupsFromLegacy } from '../../settings/banner-layout.js';
import { arrangeHeaderNav } from '../../settings/menu-defaults.js';
import { templateHeaderNav, type HeaderTemplateRef } from '../../settings/template-header-nav.js';
import { EXTRA_TEMPLATES, TEMPLATE_CATEGORY_OF, TEMPLATE_CATEGORY_TREE_SEED } from './template-tree.seed.js';

const HERO_IMAGE = 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png';

/** Mẫu cho menu header: 8 mẫu gốc và mẫu bổ sung, kèm nút lá trong cây danh mục. */
export const HEADER_TEMPLATES: HeaderTemplateRef[] = [...CATALOG_SEED.templates, ...EXTRA_TEMPLATES].map((t) => ({
  slug: t.slug,
  name: t.name,
  popularity: t.popularity,
  categoryId: TEMPLATE_CATEGORY_OF[t.slug] ?? null,
}));

const settings: SiteSettings = {
  theme: {
    companyName: 'iCards.com.vn',
    logoUrl: null,
    announcementBar: { isEnabled: false, text: '', isMarquee: false },
  },
  // Menu gốc: danh mục thiệp (dựng từ cây danh mục seed, cùng nguồn với trang /templates), rồi Chuyên nghiệp, Cửa hàng, Sự kiện, Tin tức.
  headerNav: arrangeHeaderNav([], templateHeaderNav(TEMPLATE_CATEGORY_TREE_SEED, HEADER_TEMPLATES)),
  // Hero trang chủ mặc định + các nhóm còn lại (đầu trang / cuối trang các trang khác) theo bộ mặc định.
  bannerGroups: groupsFromLegacy([{ id: 'home-hero', name: 'Banner chính', displayPage: 'home', isEnabled: true, imgSrc: HERO_IMAGE, link: '/templates' }]),
  introText: '',
};

// Kiểu chữ TÊN danh mục trên khối "dịp" (trang chủ). Khóa là id danh mục (wedding, birthday, baby, event).
// Mỗi danh mục một font riêng. Dashboard sau này ghi đúng định dạng này vào trường titleStyle của khối trong 'template.blocks'.
// Các giá trị font/cỡ/màu phải nằm trong TITLE_FONT_KEYS và sanitizeTitleStyle (src/templates/title-style.ts).
const BLOCK_TITLE_STYLES: Record<string, TemplateTitleStyle> = {
  wedding: { font: 'script', weight: 400, size: 26, color: '#3b2f2a', align: 'center' },
  birthday: { font: 'display', weight: 600, size: 16, color: '#a3152f', align: 'center', uppercase: true, letterSpacing: 0.08 },
  baby: { font: 'serif', weight: 600, size: 22, color: '#222222', align: 'center' },
  event: { font: 'sans', weight: 600, size: 14, color: '#222222', align: 'center', uppercase: true, letterSpacing: 0.08 },
};

// Khối "dịp" trên trang chủ: mỗi danh mục một khối, lấy mẫu đầu tiên làm ảnh đại diện.
// Chỉ đưa một mẫu mỗi khối để phần "Mẫu thiệp nổi bật" vẫn còn mẫu hiển thị.
const templateBlocks: TemplateBlockConfig[] = CATALOG_SEED.templateCategories.map((c) => ({
  title: c.label,
  slug: c.id,
  isActive: true,
  templateSlugs: CATALOG_SEED.templates.filter((t) => t.category === c.id).slice(0, 1).map((t) => t.slug),
  ...(BLOCK_TITLE_STYLES[c.id] ? { titleStyle: BLOCK_TITLE_STYLES[c.id] } : {}),
}));

// Kiểu chữ tên mẫu thiệp trên thẻ "Mẫu thiệp nổi bật". Thứ tự ưu tiên: default < category:<enum> < <slug mẫu>.
// Dashboard sau này ghi cùng định dạng này vào khóa 'template.titleStyles' để mỗi mẫu có font riêng.
const titleStyles: Record<string, TemplateTitleStyle> = {
  default: { font: 'sans', weight: 600, size: 18, color: '#ffffff', align: 'center' },
  'category:wedding': { font: 'script', weight: 400, size: 30 },
  'category:birthday': { font: 'display', weight: 700, size: 20, uppercase: true, letterSpacing: 0.04 },
  'category:baby': { font: 'serif', weight: 600, size: 26 },
  'category:event': { font: 'sans', weight: 600, size: 17, uppercase: true, letterSpacing: 0.06 },
};

// Phong bì mặc định của mẫu thiệp (khóa 'template.envelopes'): mở studio là có sẵn phong bì nâu đỏ + lớp lót đen.
// Muốn riêng một mẫu: thêm khóa theo slug mẫu với envId / linerId khác.
const templateEnvelopes: Record<string, { envId?: string; linerId?: string }> = {
  default: { envId: 'burgundy', linerId: 'ink' },
};

export const SITE_CONFIG_SEED = { settings, templateBlocks, titleStyles, templateEnvelopes, envelopePresets: ENVELOPE_PRESETS_SEED };
