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
    { id: 'ivory', name: 'Ngà', color: '#efe7d6', tone: 'neutral' },
    { id: 'sage', name: 'Xanh rêu', color: '#5d6b4e', tone: 'green' },
    { id: 'navy', name: 'Xanh đêm', color: '#1f2e4d', tone: 'blue' },
    { id: 'blush', name: 'Hồng phấn', color: '#e9c9bd', tone: 'pink' },
    { id: 'mustard', name: 'Vàng mù tạt', color: '#c9a24a', tone: 'yellow' },
  ],
  liners: [
    { id: 'ink', name: 'Đen mực', background: '#1c1b1b', tone: 'dark' },
    { id: 'gold-dots', name: 'Chấm vàng', background: 'radial-gradient(circle at 20% 30%, #c9a24a 1.2px, transparent 1.6px) 0 0/14px 14px, #1c1b1b', tone: 'dark' },
    { id: 'cream-stripes', name: 'Sọc kem', background: 'repeating-linear-gradient(90deg, #efe7d6 0 6px, #d9cbb0 6px 12px)', tone: 'neutral' },
    { id: 'blush-floral', name: 'Hoa hồng', background: 'radial-gradient(circle at 25% 25%, #f4b6c2 3px, transparent 4px) 0 0/22px 22px, radial-gradient(circle at 75% 75%, #f8d7de 2px, transparent 3px) 0 0/22px 22px, #8b3a4a', tone: 'pink' },
    { id: 'sage-linen', name: 'Vải lanh', background: 'repeating-linear-gradient(45deg, #7f9176 0 2px, transparent 2px 8px), repeating-linear-gradient(-45deg, #7f9176 0 2px, transparent 2px 8px), #5d6b4e', tone: 'green' },
    { id: 'navy-stars', name: 'Sao đêm', background: 'radial-gradient(circle, #ffffff 0.8px, transparent 1.2px) 0 0/18px 18px, #1f2e4d', tone: 'blue' },
  ],
};

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
