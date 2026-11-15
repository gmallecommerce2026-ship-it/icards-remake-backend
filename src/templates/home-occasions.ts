// Cấu hình khối "Những dịp lan tỏa niềm vui" trên trang chủ: ảnh nền của khối + font tên từng danh mục.
// Chỉ lưu KHÓA và số đã lọc, không nhận CSS hay URL tùy ý; ảnh nền được suy ra từ mẫu thiệp (previewImage) khi đọc.
import { TITLE_FONT_KEYS, type TitleFontKey } from '../catalog/catalog.types.js';

export const HOME_OCCASIONS_KEY = 'home.occasions';

export type HomeOccasionsConfig = {
  /** slug mẫu thiệp dùng làm hình nền của khối; null = không dùng nền */
  backgroundTemplateSlug: string | null;
  /** độ phủ lớp trắng mờ trên ảnh nền (%), giúp tiêu đề và thẻ luôn dễ đọc. 0 – 90 */
  overlay: number;
  /** font tên danh mục, khóa là slug danh mục gốc; thiếu thì dùng font mặc định */
  fonts: Record<string, TitleFontKey>;
};

export const DEFAULT_HOME_OCCASIONS: HomeOccasionsConfig = { backgroundTemplateSlug: null, overlay: 55, fonts: {} };

const SLUG = /^[a-z0-9][a-z0-9-_]{0,63}$/i;
const MAX_FONT_ENTRIES = 50;

export function sanitizeHomeOccasions(raw: unknown): HomeOccasionsConfig {
  const r = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const slug = typeof r.backgroundTemplateSlug === 'string' ? r.backgroundTemplateSlug.trim() : '';
  const overlayN = typeof r.overlay === 'number' && Number.isFinite(r.overlay) ? r.overlay : DEFAULT_HOME_OCCASIONS.overlay;

  const fonts: Record<string, TitleFontKey> = {};
  const rawFonts = r.fonts && typeof r.fonts === 'object' && !Array.isArray(r.fonts) ? (r.fonts as Record<string, unknown>) : {};
  for (const [k, v] of Object.entries(rawFonts).slice(0, MAX_FONT_ENTRIES)) {
    if (SLUG.test(k) && typeof v === 'string' && (TITLE_FONT_KEYS as readonly string[]).includes(v)) fonts[k] = v as TitleFontKey;
  }

  return {
    backgroundTemplateSlug: SLUG.test(slug) ? slug : null,
    overlay: Math.round(Math.min(90, Math.max(0, overlayN))),
    fonts,
  };
}
