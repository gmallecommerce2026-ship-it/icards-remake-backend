// Cấu hình giao diện gốc (viết tay). Khác catalog.seed.ts (sinh từ mock), file này là nguồn để sửa tay.
// Sau khi nạp, dashboard có thể đổi các khóa 'settings' và 'template.blocks' trong site_content.
import type { SiteSettings, TemplateBlockConfig } from '../../settings/site-config.types.js';
import { CATALOG_SEED } from './catalog.seed.js';

const HERO_IMAGE = 'https://pub-f720e3221ef5464a93d19bbdae2cfb86.r2.dev/herohome.png';

const settings: SiteSettings = {
  theme: {
    companyName: 'iCards.com.vn',
    logoUrl: null,
    announcementBar: { isEnabled: false, text: '', isMarquee: false },
  },
  // Mỗi danh mục thiệp là một mục menu. Phần con (children) để trống, dashboard sẽ điền sau.
  headerNav: CATALOG_SEED.templateCategories.map((c, i) => ({
    id: c.id,
    title: c.label,
    path: '/templates',
    order: i + 1,
    isVisible: true,
    children: [],
  })),
  banners: [{ id: 'home-hero', name: 'Banner chính', displayPage: 'home', isEnabled: true, imgSrc: HERO_IMAGE, link: '/templates' }],
  introText: '',
};

// Chưa có dữ liệu gốc cho khối "dịp". Thêm vào đây khi có, ví dụ { title, slug, isActive: true, templateSlugs: [...] }.
const templateBlocks: TemplateBlockConfig[] = [];

export const SITE_CONFIG_SEED = { settings, templateBlocks };
