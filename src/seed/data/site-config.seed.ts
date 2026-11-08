// Cấu hình giao diện gốc (viết tay). Khác catalog.seed.ts (sinh từ mock), file này là nguồn để sửa tay.
// Sau khi nạp, dashboard có thể đổi các khóa 'settings' và 'template.blocks' trong site_content.
import type { SiteSettings, TemplateBlockConfig } from '../../settings/site-config.types.js';
import type { TemplateTitleStyle } from '../../catalog/catalog.types.js';
import { CATALOG_SEED } from './catalog.seed.js';

const HERO_IMAGE = 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png';

const settings: SiteSettings = {
  theme: {
    companyName: 'iCards.com.vn',
    logoUrl: null,
    announcementBar: { isEnabled: false, text: '', isMarquee: false },
  },
  // Menu 3 cấp: danh mục -> cột (cùng tên danh mục) -> các mẫu thiệp thuộc danh mục đó.
  headerNav: CATALOG_SEED.templateCategories.map((c, i) => ({
    id: c.id,
    title: c.label,
    path: `/templates?category=${c.id}`,
    order: i + 1,
    isVisible: true,
    children: [
      {
        id: `${c.id}-col`,
        title: c.label,
        order: 1,
        isVisible: true,
        children: CATALOG_SEED.templates
          .filter((t) => t.category === c.id)
          .map((t, j) => ({ id: t.slug, title: t.name, path: `/templates/${t.slug}`, order: j + 1, isVisible: true, children: [] })),
      },
    ],
  })),
  banners: [{ id: 'home-hero', name: 'Banner chính', displayPage: 'home', isEnabled: true, imgSrc: HERO_IMAGE, link: '/templates' }],
  introText: '',
};

// Khối "dịp" trên trang chủ: mỗi danh mục một khối, lấy mẫu đầu tiên làm ảnh đại diện.
// Chỉ đưa một mẫu mỗi khối để phần "Mẫu thiệp nổi bật" vẫn còn mẫu hiển thị.
const templateBlocks: TemplateBlockConfig[] = CATALOG_SEED.templateCategories.map((c) => ({
  title: c.label,
  slug: c.id,
  isActive: true,
  templateSlugs: CATALOG_SEED.templates.filter((t) => t.category === c.id).slice(0, 1).map((t) => t.slug),
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

export const SITE_CONFIG_SEED = { settings, templateBlocks, titleStyles, templateEnvelopes };
