import { describe, expect, it } from 'vitest';
import { ENVELOPE_PRESETS_SEED, sanitizePresets } from './envelope-presets.js';

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
