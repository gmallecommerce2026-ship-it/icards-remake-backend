// Cấu hình giao diện gốc (viết tay). Khác catalog.seed.ts (sinh từ mock), file này là nguồn để sửa tay.
// Sau khi nạp, dashboard có thể đổi các khóa 'settings' và 'template.blocks' trong site_content (kể cả font của từng danh mục).
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

export const SITE_CONFIG_SEED = { settings, templateBlocks };
