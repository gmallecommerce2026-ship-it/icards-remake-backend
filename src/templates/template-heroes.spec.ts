import { describe, expect, it } from 'vitest';
import { TEMPLATE_CATEGORY_TREE_SEED } from '../seed/data/template-tree.seed.js';
import { TEMPLATE_HEROES_SEED } from '../seed/data/template-heroes.seed.js';
import {
  DEFAULT_HERO_PRESET,
  HERO_CATEGORIES,
  HERO_PRESETS,
  migrateHeroesV18,
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

describe('migrateHeroesV18', () => {
  const seed = TEMPLATE_HEROES_SEED;

  it('giữ nguyên chỉnh sửa của admin ở danh mục đã có', () => {
    const raw = { wedding: { preset: 'ribbon', title: 'Cưới của tôi', subtitle: 'Mô tả', accent: '#112233', speed: 2, images: [] } };
    const out = migrateHeroesV18(raw, seed);
    expect(out.wedding).toEqual({ preset: 'envelope', title: 'Cưới của tôi', subtitle: 'Mô tả', accent: '#112233', speed: 2, images: [] });
  });

  it('thêm hero mặc định cho danh mục gốc mới', () => {
    const out = migrateHeroesV18({}, seed);
    expect(out.engagement).toEqual(seed.engagement);
    expect(out.festive).toEqual(seed.festive);
  });

  it('không tự bật lại bốn danh mục cũ mà admin đã tắt', () => {
    const out = migrateHeroesV18({ wedding: { preset: 'envelope', title: 'Có' } }, seed);
    expect(out.birthday).toBeUndefined();
    expect(out.event).toBeUndefined();
  });
});
