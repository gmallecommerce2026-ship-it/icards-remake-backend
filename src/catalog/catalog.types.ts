// Kiểu và giá trị dùng chung cho dữ liệu danh mục: mẫu thiệp, sản phẩm, dịch vụ, bài viết, FAQ.
// Các kiểu này khớp với FE (src/lib/templates.ts, shop.ts, services.ts, blog.ts, faq.ts, professional.ts).

export const TEMPLATE_CATEGORIES = ['wedding', 'birthday', 'baby', 'event'] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const TEMPLATE_MOTIFS = ['arch', 'circle', 'frame', 'stripe'] as const;
export type TemplateMotif = (typeof TEMPLATE_MOTIFS)[number];

/**
 * Kiểu thiệp của mẫu.
 *  - folding: thiệp gập 5:7 (bìa, ruột trái/phải, mặt sau) như trình chỉnh sửa hiện có.
 *  - card: thiệp 2 mặt phẳng (mặt trước + mặt sau), kích thước theo `orientation`.
 */
export const TEMPLATE_FORMATS = ['folding', 'card'] as const;
export type TemplateFormat = (typeof TEMPLATE_FORMATS)[number];

/** Kiểu dáng khung: ngang (rộng > cao), vuông, dọc (cao > rộng). */
export const TEMPLATE_ORIENTATIONS = ['landscape', 'square', 'portrait'] as const;
export type TemplateOrientation = (typeof TEMPLATE_ORIENTATIONS)[number];

/** Kích thước thiết kế (đơn vị px) của từng kiểu dáng. Dùng chung để FE và seed khớp nhau. */
export const TEMPLATE_CARD_SIZES: Record<TemplateOrientation, { w: number; h: number }> = {
  landscape: { w: 700, h: 500 },
  square: { w: 600, h: 600 },
  portrait: { w: 500, h: 700 },
};

/** Một phần tử trên một mặt thiệp. Toạ độ và kích thước là TỈ LỆ 0..1 so với chiều rộng (x, w, sz) hoặc chiều cao (y, h) của thiệp. */
export interface TemplateFaceElement {
  kind: 'text' | 'shape';
  x: number;
  y: number;
  w: number;
  h: number;
  /** text: nội dung. */
  text?: string;
  /** text: cỡ chữ, tỉ lệ theo chiều rộng thiệp (vd 0.06 = 6%). */
  sz?: number;
  /** text: khóa phông (display = tiêu đề, body = nội dung, script = chữ viết tay). */
  font?: 'display' | 'body' | 'script';
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Vai trò màu lấy từ palette của mẫu. */
  color?: 'ink' | 'accent' | 'soft' | 'bg';
  /** shape: hình dạng trang trí. */
  shape?: 'arch' | 'circle' | 'rect' | 'frame' | 'line';
  /** shape: màu nền/viền lấy từ palette. */
  fill?: 'ink' | 'accent' | 'soft' | 'bg';
}

/** Bố cục hai mặt của thiệp kiểu card. */
export interface TemplateCardLayout {
  front: TemplateFaceElement[];
  back: TemplateFaceElement[];
}

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

/**
 * Font chữ tên mẫu thiệp. Dữ liệu chỉ lưu KHÓA (vd 'script'), FE đổi khóa thành font thật (src/lib/title-style.ts).
 * Muốn thêm font: thêm khóa ở đây + ở FE + nạp font ở FE (scripts/build-local-fonts.mjs).
 */
export const TITLE_FONT_KEYS = ['sans', 'serif', 'script', 'display', 'mono'] as const;
export type TitleFontKey = (typeof TITLE_FONT_KEYS)[number];

/** Kiểu chữ của tên danh mục (khối dịp trên trang chủ). Mọi trường đều tùy chọn. */
export interface TemplateTitleStyle {
  font?: TitleFontKey;
  weight?: number; // 100..900, bước 100
  size?: number; // px, 12..40
  color?: string; // #rgb | #rrggbb | #rrggbbaa
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
  letterSpacing?: number; // em, -0.05..0.3
}
