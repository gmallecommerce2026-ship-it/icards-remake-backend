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

export interface HomeBanner {
  id: string;
  name: string;
  displayPage: string;
  isEnabled: boolean;
  imgSrc?: string | null;
  link?: string;
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
  banners: HomeBanner[];
  introText: string;
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

/**
 * Cây danh mục mẫu thiệp nhiều cấp (khóa 'templates.tree' trong site_content).
 * Cấp tùy ý: mỗi nút có thể chứa nút con (children) và/hoặc mẫu thiệp (templateSlugs).
 * Chỉ nút gốc cần `category` (giá trị enum lưu trong bảng invitation_templates).
 */
export interface TemplateTreeNode {
  id: string;
  label: string;
  children?: TemplateTreeNode[];
  templateSlugs?: string[];
}
