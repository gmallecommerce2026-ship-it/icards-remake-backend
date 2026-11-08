import { TITLE_FONT_KEYS, type TemplateTitleStyle, type TitleFontKey } from '../catalog/catalog.types.js';

/** Cấu hình kiểu chữ lưu ở site_content, khóa 'template.titleStyles'. */
export type TitleStyleMap = Record<string, unknown>;

const num = (v: unknown, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : undefined);

/**
 * Chỉ giữ lại giá trị hợp lệ (font nằm trong danh sách cho phép, màu đúng dạng hex, số trong khoảng).
 * Dùng khi đọc để FE không bao giờ nhận CSS tùy ý, và dùng lại khi dashboard ghi.
 */
export function sanitizeTitleStyle(raw: unknown): TemplateTitleStyle | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const out: TemplateTitleStyle = {};
  if (typeof r.font === 'string' && (TITLE_FONT_KEYS as readonly string[]).includes(r.font)) out.font = r.font as TitleFontKey;
  const weight = num(r.weight, 100, 900);
  if (weight !== undefined && weight % 100 === 0) out.weight = weight;
  const size = num(r.size, 12, 40);
  if (size !== undefined) out.size = Math.round(size);
  if (typeof r.color === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(r.color)) out.color = r.color;
  if (r.align === 'left' || r.align === 'center' || r.align === 'right') out.align = r.align;
  if (typeof r.uppercase === 'boolean') out.uppercase = r.uppercase;
  const ls = num(r.letterSpacing, -0.05, 0.3);
  if (ls !== undefined) out.letterSpacing = ls;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Kiểu chữ của một mẫu. Thứ tự ưu tiên (mục sau đè mục trước, theo từng trường):
 *   'default' → 'category:<enum category>' → '<slug>'
 */
export function resolveTitleStyle(map: TitleStyleMap, slug: string, category: string): TemplateTitleStyle | undefined {
  const pick = (k: string) => (map[k] && typeof map[k] === 'object' ? (sanitizeTitleStyle(map[k]) ?? {}) : {});
  const merged = { ...pick('default'), ...pick(`category:${category}`), ...pick(slug) };
  return Object.keys(merged).length ? merged : undefined;
}
