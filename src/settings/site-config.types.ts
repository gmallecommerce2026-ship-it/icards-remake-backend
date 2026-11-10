import type { TemplateTitleStyle } from '../catalog/catalog.types.js';

// Kiểu cấu hình giao diện công khai (khóa 'settings' và 'template.blocks' trong site_content).
// Dashboard sau này sẽ đọc/ghi đúng các kiểu này.

export interface HeaderNavItem {
  id: string;
  title: string;
  path?: string;
  order: number;
  isVisible: boolean;
  children: HeaderNavItem[];
}

/** Kiểu banner cũ (một danh sách phẳng, chọn trang bằng displayPage). Chỉ còn để đọc và chuyển sang BannerGroup. */
export interface HomeBanner {
  id: string;
  name: string;
  displayPage: string;
  isEnabled: boolean;
  imgSrc?: string | null;
  link?: string;
}

/** Trang có vị trí banner. Mỗi trang chỉ hiển thị các nhóm có đúng trang đó. */
export type BannerPage = 'home' | 'shop' | 'services' | 'professional';

/** Vị trí của nhóm trên trang: đầu trang (dưới menu) hoặc cuối trang. Trang không có vị trí cuối thì nhóm đó không hiển thị. */
export type BannerSlot = 'top' | 'bottom';

/**
 * Bố cục của một nhóm. Số banner trong nhóm không giới hạn; bố cục chỉ quyết định cách xếp.
 * - slider: băng chuyền xoay vòng, toàn chiều rộng
 * - stack: mỗi banner một hàng toàn chiều rộng
 * - hero-pair: banner đầu toàn chiều rộng, hai banner kế cạnh nhau; lặp lại theo chu kỳ 3
 * - mosaic-2-1: hai banner cạnh nhau, banner kế toàn chiều rộng; lặp lại theo chu kỳ 3
 * - grid-2 / grid-3: lưới đều 2 hoặc 3 cột
 */
export type BannerLayout = 'slider' | 'stack' | 'hero-pair' | 'mosaic-2-1' | 'grid-2' | 'grid-3';

export interface BannerItem {
  id: string;
  /** Tên dùng trong dashboard, không hiển thị ra ngoài. */
  name: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  ctaLabel?: string;
  imgSrc?: string | null;
  link?: string;
  isEnabled: boolean;
}

export interface BannerGroup {
  id: string;
  name: string;
  page: BannerPage;
  slot: BannerSlot;
  layout: BannerLayout;
  isEnabled: boolean;
  banners: BannerItem[];
}

export interface AnnouncementBar {
  isEnabled: boolean;
  text: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
  backgroundImage?: string;
  isMarquee: boolean;
}

export interface SiteSettings {
  theme: { companyName: string; logoUrl?: string | null; announcementBar: AnnouncementBar };
  headerNav: HeaderNavItem[];
  /** Nhóm banner của mọi trang. */
  bannerGroups: BannerGroup[];
  /** @deprecated Dữ liệu cũ, chỉ đọc để chuyển sang bannerGroups. Không ghi thêm. */
  banners?: HomeBanner[];
  introText: string;
  /** Chữ hiển thị trên trang cửa hàng, dịch vụ, tin tức. Đọc qua resolvePageCopy để luôn có đủ trường. */
  pageCopy?: import('./page-copy.js').PageCopy;
}

/** Khối "dịp" trên trang chủ. Lưu theo slug mẫu thiệp để dashboard dễ chỉnh; backend tự đổi sang _id khi trả về. */
export interface TemplateBlockConfig {
  title: string;
  slug: string;
  isActive: boolean;
  templateSlugs: string[];
  /** Font, cỡ, màu... của TÊN danh mục trên trang chủ. Bỏ trống thì FE dùng kiểu mặc định. */
  titleStyle?: TemplateTitleStyle;
}
