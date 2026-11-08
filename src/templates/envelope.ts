/**
 * Phong bì mặc định của mẫu thiệp: khi mở studio với mẫu đó, phong bì và lớp lót được chọn sẵn.
 * Lưu trong site_content, khóa 'template.envelopes' (không đổi cấu trúc bảng, không cần ALTER TABLE):
 *   { "default": { "envId": "burgundy", "linerId": "ink" }, "<slug mẫu>": { ... } }
 * Mẫu không có khóa riêng thì lấy 'default'. Id phong bì/lớp lót do FE quyết định (xem envelope.data.ts),
 * backend chỉ kiểm tra định dạng để không lưu chuỗi lạ.
 */
export type TemplateEnvelope = { envId?: string; linerId?: string };

export const ENVELOPES_KEY = 'template.envelopes';

const ID = /^[a-z0-9-]{1,40}$/;

export function sanitizeEnvelope(raw: unknown): TemplateEnvelope | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  const out: TemplateEnvelope = {};
  if (typeof r.envId === 'string' && ID.test(r.envId)) out.envId = r.envId;
  if (typeof r.linerId === 'string' && ID.test(r.linerId)) out.linerId = r.linerId;
  return Object.keys(out).length ? out : undefined;
}

export function resolveEnvelope(map: Record<string, unknown>, slug: string): TemplateEnvelope | undefined {
  return sanitizeEnvelope(map[slug]) ?? sanitizeEnvelope(map.default);
}
