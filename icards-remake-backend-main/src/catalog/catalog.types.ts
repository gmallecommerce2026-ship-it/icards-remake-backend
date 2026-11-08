// Kiểu và giá trị dùng chung cho dữ liệu danh mục: mẫu thiệp, sản phẩm, dịch vụ, bài viết, FAQ.
// Các kiểu này khớp với FE (src/lib/templates.ts, shop.ts, services.ts, blog.ts, faq.ts, professional.ts).

export const TEMPLATE_CATEGORIES = ['wedding', 'birthday', 'baby', 'event'] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const TEMPLATE_MOTIFS = ['arch', 'circle', 'frame', 'stripe'] as const;
export type TemplateMotif = (typeof TEMPLATE_MOTIFS)[number];

export const SHOP_CATEGORY_IDS = ['print', 'onsite', 'digital'] as const;
export type ShopCategory = (typeof SHOP_CATEGORY_IDS)[number];

export const THUMB_KINDS = ['paper', 'qr', 'standee', 'envelope', 'message', 'gift'] as const;
export type ThumbKind = (typeof THUMB_KINDS)[number];

export const SHIPPING_KINDS = ['ship', 'digital'] as const;
export type ShippingKind = (typeof SHIPPING_KINDS)[number];

export const SERVICE_REQUEST_STATUSES = ['new', 'contacted', 'done'] as const;
export type ServiceRequestStatus = (typeof SERVICE_REQUEST_STATUSES)[number];

/** Các khóa cấu hình/danh mục mà FE được phép đọc qua GET /api/public/content/:key */
export const PUBLIC_CONTENT_KEYS = [
  'templates.categories',
  'shop.categories',
  'services.process',
  'blog.categories',
  'faq.groups',
  'professional.process',
  'professional.tiers',
  'professional.portfolio',
] as const;
export type PublicContentKey = (typeof PUBLIC_CONTENT_KEYS)[number];

export interface Tone {
  bg: string;
  ink: string;
}

export interface TemplatePalette {
  bg: string;
  ink: string;
  accent: string;
  soft: string;
}

export interface TemplateSample {
  kicker: string;
  titleLines: string[];
  date: string;
  time: string;
  place: string;
  address: string;
  message: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
}

export interface LabeledValue {
  label: string;
  value: string;
}

export interface CategoryItem {
  id: string;
  label: string;
}

export interface SlugCategoryItem {
  slug: string;
  label: string;
}

/** Khối nội dung bài viết (đúng kiểu Block của FE). */
export type PostBlock = { t: 'h2' | 'p' | 'tip'; text: string } | { t: 'ul'; items: string[] };
