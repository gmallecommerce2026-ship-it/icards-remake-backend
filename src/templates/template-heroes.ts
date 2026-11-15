// Cấu hình phần hero 3D theo danh mục mẫu thiệp (trang /templates?category=...).
// Admin chọn kiểu + nội dung; KHÔNG nhận code tùy ý để tránh chạy mã lạ trên trang công khai.

export const TEMPLATE_HEROES_KEY = 'template.heroes';

/** Mã các danh mục gốc hiện có trên site (khớp cây danh mục ở seed/data/template-tree.seed.ts). */
export const HERO_CATEGORIES = [
  'wedding',
  'engagement',
  'birthday',
  'baby',
  'event',
  'opening',
  'housewarming',
  'graduation',
  'anniversary',
  'festive',
] as const;
export type HeroCategory = (typeof HERO_CATEGORIES)[number];

/** Các danh mục đã có hero từ trước phiên bản seed 18. Với danh mục khác, migration sẽ tự thêm hero mặc định. */
export const LEGACY_HERO_CATEGORIES: readonly HeroCategory[] = ['wedding', 'birthday', 'baby', 'event'];

/** Kiểu 3D có sẵn: phong bì lật lấy thiệp · xòe quạt · album lật trang · hoa nở · khối xoay. */
export const HERO_PRESETS = ['envelope', 'fan', 'book', 'flower', 'cube'] as const;
export type HeroPreset = (typeof HERO_PRESETS)[number];
/** Kiểu mặc định khi giá trị không hợp lệ (kể cả các kiểu cũ đã bỏ: ribbon, cylinder, wall). */
export const DEFAULT_HERO_PRESET: HeroPreset = 'envelope';

export type TemplateHero = {
  preset: HeroPreset;
  title: string;
  subtitle: string;
  /** màu nhấn, dạng #RRGGBB */
  accent: string;
  /** hệ số tốc độ chạy theo cuộn, 0.2 – 3 */
  speed: number;
  /** ảnh minh họa, chỉ nhận https://, tối đa 12 ảnh */
  images: string[];
};

export type TemplateHeroes = Partial<Record<HeroCategory, TemplateHero>>;

const MAX_IMAGES = 12;
const HEX = /^#[0-9a-fA-F]{6}$/;

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function isHttpsUrl(u: string): boolean {
  if (!u || u.length > 500) return false;
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeHero(raw: unknown): TemplateHero | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const preset = (HERO_PRESETS as readonly string[]).includes(r.preset as string) ? (r.preset as HeroPreset) : DEFAULT_HERO_PRESET;
  const title = text(r.title, 120);
  const subtitle = text(r.subtitle, 240);
  const images = (Array.isArray(r.images) ? r.images : [])
    .map((u) => text(u, 500))
    .filter(isHttpsUrl)
    .slice(0, MAX_IMAGES);
  // hero không có chữ và không có ảnh thì coi như chưa cấu hình
  if (!title && !subtitle && images.length === 0) return null;
  const speedN = typeof r.speed === 'number' && Number.isFinite(r.speed) ? r.speed : 1;
  return {
    preset,
    title,
    subtitle,
    accent: HEX.test(text(r.accent, 7)) ? text(r.accent, 7) : '#A3152F',
    speed: Math.min(3, Math.max(0.2, speedN)),
    images,
  };
}

/** Làm sạch toàn bộ cấu hình: chỉ giữ các danh mục đã biết, bỏ mục không hợp lệ. */
export function sanitizeHeroes(raw: unknown): TemplateHeroes {
  const out: TemplateHeroes = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const id of HERO_CATEGORIES) {
    const h = sanitizeHero((raw as Record<string, unknown>)[id]);
    if (h) out[id] = h;
  }
  return out;
}

/**
 * Migration phiên bản seed 18: mở rộng hero sang toàn bộ danh mục gốc và chuyển kiểu cũ sang phong bì.
 * - Giữ nguyên cấu hình admin đã lưu (chỉ đổi preset cũ). Đây là điểm quan trọng: không ghi đè chỉnh sửa.
 * - Danh mục gốc mới (chưa có trong cấu hình) được thêm hero mặc định từ `seed`.
 * - Bốn danh mục cũ không có hero thì giữ nguyên là không có: admin đã chủ động tắt, không tự bật lại.
 */
export function migrateHeroesV18(raw: unknown, seed: TemplateHeroes): TemplateHeroes {
  const current = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const out: TemplateHeroes = {};
  for (const id of HERO_CATEGORIES) {
    const existing = sanitizeHero(current[id]);
    if (existing) out[id] = existing;
    else if (!LEGACY_HERO_CATEGORIES.includes(id) && seed[id]) out[id] = seed[id];
  }
  return out;
}
