import { describe, expect, it } from 'vitest';
import { TEMPLATE_CATEGORY_TREE_SEED } from '../seed/data/template-tree.seed.js';
import { TEMPLATE_HEROES_SEED } from '../seed/data/template-heroes.seed.js';
import {
  DEFAULT_HERO_PRESET,
  HERO_CATEGORIES,
  HERO_PRESETS,
  fillMissingHeroes,
  sanitizeHero,
  sanitizeHeroes,
} from './template-heroes.js';

describe('danh mục hero khớp cây danh mục trên site', () => {
  it('mỗi danh mục gốc đều có hero, và không có hero thừa', () => {
    const roots = TEMPLATE_CATEGORY_TREE_SEED.map((r) => r.id).sort();
    expect([...HERO_CATEGORIES].sort()).toEqual(roots);
    expect(Object.keys(TEMPLATE_HEROES_SEED).sort()).toEqual(roots);
  });

  it('seed chỉ dùng kiểu 3D còn được hỗ trợ và giá trị hợp lệ', () => {
    for (const h of Object.values(TEMPLATE_HEROES_SEED)) {
      expect(HERO_PRESETS).toContain(h.preset);
      expect(sanitizeHero(h)).toEqual(h);
    }
  });
});

describe('kiểu 3D', () => {
  it('kiểu cũ (dải, trụ, tường) chuyển sang phong bì', () => {
    for (const old of ['ribbon', 'cylinder', 'wall']) {
      expect(sanitizeHero({ preset: old, title: 'Tên' })?.preset).toBe(DEFAULT_HERO_PRESET);
    }
    expect(DEFAULT_HERO_PRESET).toBe('envelope');
  });

  it('bỏ danh mục lạ và giữ kiểu hợp lệ', () => {
    const out = sanitizeHeroes({ wedding: { preset: 'flower', title: 'A' }, unknown: { title: 'x' } });
    expect(Object.keys(out)).toEqual(['wedding']);
    expect(out.wedding?.preset).toBe('flower');
  });
});

describe('fillMissingHeroes (migration v19)', () => {
  const seed = TEMPLATE_HEROES_SEED;

  it('giữ nguyên chỉnh sửa của admin và chỉ đổi kiểu cũ', () => {
    const raw = { wedding: { preset: 'ribbon', title: 'Cưới của tôi', subtitle: 'Mô tả', accent: '#112233', speed: 2, images: [] } };
    const out = fillMissingHeroes(raw, seed);
    expect(out.wedding).toEqual({ preset: 'envelope', title: 'Cưới của tôi', subtitle: 'Mô tả', accent: '#112233', speed: 2, images: [] });
  });

  it('điền hero mặc định cho mọi danh mục còn trống, kể cả 4 danh mục cũ', () => {
    const out = fillMissingHeroes({}, seed);
    expect(Object.keys(out).sort()).toEqual([...HERO_CATEGORIES].sort());
    expect(out.birthday).toEqual(seed.birthday);
    expect(out.baby).toEqual(seed.baby);
    expect(out.event).toEqual(seed.event);
  });

  it('không ghi đè danh mục admin đã có', () => {
    const out = fillMissingHeroes({ birthday: { preset: 'fan', title: 'Sinh nhật bé' } }, seed);
    expect(out.birthday?.preset).toBe('fan');
    expect(out.birthday?.title).toBe('Sinh nhật bé');
  });
});
