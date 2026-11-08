import { describe, expect, it } from 'vitest';
import { ENVELOPE_PRESETS_SEED, assignMissingEnvelopes, isLegacyPresets, sanitizePresets } from './envelope-presets.js';

describe('sanitizePresets', () => {
  it('giữ nguyên bộ seed', () => {
    expect(sanitizePresets(ENVELOPE_PRESETS_SEED)).toEqual(ENVELOPE_PRESETS_SEED);
  });

  it('bỏ mục hỏng và lớp lót có ký tự nguy hiểm', () => {
    const out = sanitizePresets({
      envelopes: [
        { id: 'ok', name: 'OK', color: '#abcdef', tone: 'red' },
        { id: 'Bad ID', name: 'x', color: '#abcdef', tone: 'red' },
        { id: 'css', name: 'x', color: 'red', tone: 'red' },
      ],
      liners: [
        { id: 'good', name: 'Good', background: '#111111', tone: 'dark' },
        { id: 'evil', name: 'Evil', background: 'url(http://x)', tone: 'dark' },
        { id: 'semi', name: 'Semi', background: 'red; background-image: url(x)', tone: 'dark' },
      ],
    });
    expect(out.envelopes.map((e) => e.id)).toEqual(['ok']);
    expect(out.liners.map((l) => l.id)).toEqual(['good']);
  });

  it('danh mục hỏng hoàn toàn thì trả về bộ seed', () => {
    expect(sanitizePresets('rác')).toEqual(ENVELOPE_PRESETS_SEED);
    expect(sanitizePresets({ envelopes: [], liners: [] })).toEqual(ENVELOPE_PRESETS_SEED);
  });
});

describe('isLegacyPresets', () => {
  it('nhận ra bộ seed cũ và bộ đã sửa', () => {
    const legacy = { envelopes: [{ id: 'burgundy' }, { id: 'sage' }], liners: [{ id: 'ink' }] };
    const custom = { envelopes: [{ id: 'my-brand' }], liners: [{ id: 'ink' }] };
    expect(isLegacyPresets(legacy)).toBe(true);
    expect(isLegacyPresets(custom)).toBe(false);
  });
});

describe('assignMissingEnvelopes', () => {
  const slugs = ['a', 'b', 'c', 'd'];

  it('gán cho mọi mẫu chưa có, màu không trùng khi đủ màu', () => {
    const map: Record<string, unknown> = { default: { envId: 'burgundy', linerId: 'ink' } };
    const n = assignMissingEnvelopes(map, slugs, ENVELOPE_PRESETS_SEED);
    expect(n).toBe(4);
    const envs = slugs.map((s) => (map[s] as { envId: string }).envId);
    expect(new Set(envs).size).toBe(4);
    for (const s of slugs) expect((map[s] as { linerId: string }).linerId).toBeTruthy();
    expect(map.default).toEqual({ envId: 'burgundy', linerId: 'ink' });
  });

  it('không đụng tới mẫu đã có cấu hình và kết quả ổn định theo slug', () => {
    const m1: Record<string, unknown> = { a: { envId: 'plum' } };
    const m2: Record<string, unknown> = { a: { envId: 'plum' } };
    assignMissingEnvelopes(m1, slugs, ENVELOPE_PRESETS_SEED);
    assignMissingEnvelopes(m2, slugs, ENVELOPE_PRESETS_SEED);
    expect(m1.a).toEqual({ envId: 'plum' });
    expect(m1).toEqual(m2);
  });
});
