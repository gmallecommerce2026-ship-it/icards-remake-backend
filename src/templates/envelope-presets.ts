/**
 * Danh mục phong bì và lớp lót (hoạ tiết bên trong) mà studio cho chọn.
 * Seed vào site_content, khóa 'envelope.presets'. Dashboard sau này sửa khóa này để thêm/bớt mẫu.
 * Mỗi lần đọc đều được kiểm tra lại: id đúng định dạng, màu là hex, lớp lót chỉ là CSS nền (không chứa dấu nguy hiểm).
 */
export const ENVELOPE_PRESETS_KEY = 'envelope.presets';

export type EnvelopePreset = { id: string; name: string; color: string; tone: string };
export type LinerPreset = { id: string; name: string; background: string; tone: string };
export type EnvelopePresets = { envelopes: EnvelopePreset[]; liners: LinerPreset[] };

export const ENVELOPE_PRESETS_SEED: EnvelopePresets = {
  envelopes: [
    { id: 'burgundy', name: 'Nâu đỏ', color: '#6e2b22', tone: 'red' },
    { id: 'terracotta', name: 'Đất nung', color: '#b5573e', tone: 'red' },
    { id: 'ivory', name: 'Ngà', color: '#efe7d6', tone: 'neutral' },
    { id: 'sand', name: 'Cát', color: '#d9c6a0', tone: 'neutral' },
    { id: 'sage', name: 'Xanh rêu', color: '#5d6b4e', tone: 'green' },
    { id: 'forest', name: 'Xanh rừng', color: '#2f4a35', tone: 'green' },
    { id: 'navy', name: 'Xanh đêm', color: '#1f2e4d', tone: 'blue' },
    { id: 'dusty-blue', name: 'Xanh khói', color: '#7d93ad', tone: 'blue' },
    { id: 'blush', name: 'Hồng phấn', color: '#e9c9bd', tone: 'pink' },
    { id: 'rose', name: 'Hồng đất', color: '#c97b84', tone: 'pink' },
    { id: 'plum', name: 'Mận', color: '#5b2a4f', tone: 'purple' },
    { id: 'mustard', name: 'Vàng mù tạt', color: '#c9a24a', tone: 'yellow' },
    { id: 'charcoal', name: 'Than chì', color: '#3a3a3c', tone: 'dark' },
    { id: 'cream', name: 'Kem', color: '#f6efe2', tone: 'neutral' },
  ],
  liners: [
    { id: 'ink', name: 'Đen mực', background: '#1c1b1b', tone: 'dark' },
    { id: 'gold-dots', name: 'Chấm vàng', background: 'radial-gradient(circle at 20% 30%, #c9a24a 1.2px, transparent 1.6px) 0 0/14px 14px, #1c1b1b', tone: 'dark' },
    { id: 'cream-stripes', name: 'Sọc kem', background: 'repeating-linear-gradient(90deg, #efe7d6 0 6px, #d9cbb0 6px 12px)', tone: 'neutral' },
    { id: 'blush-floral', name: 'Hoa hồng', background: 'radial-gradient(circle at 25% 25%, #f4b6c2 3px, transparent 4px) 0 0/22px 22px, radial-gradient(circle at 75% 75%, #f8d7de 2px, transparent 3px) 0 0/22px 22px, #8b3a4a', tone: 'pink' },
    { id: 'sage-linen', name: 'Vải lanh', background: 'repeating-linear-gradient(45deg, #7f9176 0 2px, transparent 2px 8px), repeating-linear-gradient(-45deg, #7f9176 0 2px, transparent 2px 8px), #5d6b4e', tone: 'green' },
    { id: 'navy-stars', name: 'Sao đêm', background: 'radial-gradient(circle, #ffffff 0.8px, transparent 1.2px) 0 0/18px 18px, #1f2e4d', tone: 'blue' },
    { id: 'rust-floral', name: 'Hoa đất', background: 'radial-gradient(circle at 20% 30%, #b5573e 2.5px, transparent 3px) 0 0/20px 20px, radial-gradient(circle at 70% 70%, #d9a441 2px, transparent 2.5px) 0 0/20px 20px, #f3e6d3', tone: 'red' },
    { id: 'lavender-dots', name: 'Chấm oải hương', background: 'radial-gradient(circle at 30% 40%, #c9b6e4 2px, transparent 2.5px) 0 0/16px 16px, #f5f0fa', tone: 'purple' },
    { id: 'mint-check', name: 'Caro bạc hà', background: 'repeating-linear-gradient(0deg, #cfe9dd 0 8px, transparent 8px 16px), repeating-linear-gradient(90deg, #cfe9dd 0 8px, #eef8f3 8px 16px)', tone: 'green' },
    { id: 'marigold-stripes', name: 'Sọc vàng', background: 'repeating-linear-gradient(90deg, #f0b93a 0 10px, #fbf1d0 10px 20px)', tone: 'yellow' },
  ],
};

// Id của bộ seed cũ (v8). Dùng để biết dữ liệu còn nguyên từ seed hay đã được dashboard sửa.
export const LEGACY_ENVELOPE_IDS = ['burgundy', 'ivory', 'sage', 'navy', 'blush', 'mustard'];
export const LEGACY_LINER_IDS = ['ink', 'gold-dots', 'cream-stripes', 'blush-floral', 'sage-linen', 'navy-stars'];

/** true nếu danh mục đang lưu chỉ gồm các mục của bộ seed cũ (chưa bị sửa). */
export function isLegacyPresets(raw: unknown): boolean {
  const r = (raw ?? {}) as Record<string, unknown>;
  const ids = (list: unknown) => (Array.isArray(list) ? list.map((x) => (x as { id?: unknown })?.id) : []);
  const env = ids(r.envelopes), lin = ids(r.liners);
  return env.every((id) => LEGACY_ENVELOPE_IDS.includes(id as string)) && lin.every((id) => LEGACY_LINER_IDS.includes(id as string));
}

const ID = /^[a-z0-9-]{1,40}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const BG_FORBIDDEN = /[;{}<>"'\\]|url\(|expression|@import/i;

const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim().length > 0 && v.length <= max ? v.trim() : undefined);

export function sanitizePresets(raw: unknown): EnvelopePresets {
  const r = (raw ?? {}) as Record<string, unknown>;
  const envelopes: EnvelopePreset[] = [];
  for (const e of Array.isArray(r.envelopes) ? r.envelopes : []) {
    const o = e as Record<string, unknown>;
    const id = str(o?.id, 40), name = str(o?.name, 60), tone = str(o?.tone, 20), color = str(o?.color, 9);
    if (id && ID.test(id) && name && tone && color && HEX.test(color)) envelopes.push({ id, name, color, tone });
  }
  const liners: LinerPreset[] = [];
  for (const l of Array.isArray(r.liners) ? r.liners : []) {
    const o = l as Record<string, unknown>;
    const id = str(o?.id, 40), name = str(o?.name, 60), tone = str(o?.tone, 20), bg = str(o?.background, 600);
    if (id && ID.test(id) && name && tone && bg && !BG_FORBIDDEN.test(bg)) liners.push({ id, name, background: bg, tone });
  }
  // Danh mục trống hoặc hỏng hoàn toàn thì dùng bộ seed để studio không bị rỗng
  return envelopes.length && liners.length ? { envelopes, liners } : ENVELOPE_PRESETS_SEED;
}
