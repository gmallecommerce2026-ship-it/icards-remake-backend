import { describe, expect, it } from 'vitest';
import { cleanDesignAssets, sanitizeDesignAssets, type DesignAssets } from './design-assets.js';
import { DESIGN_ASSETS_SEED_DATA } from '../seed/data/design-assets.seed.js';

const empty = (): DesignAssets => ({ fonts: [], colors: [], backdrops: [], elements: [], frames: [], grids: [] });
const el = (over: Record<string, unknown> = {}) => ({
  id: 'x-tri', name: 'Tam giác', category: 'shape', group: 'Đa giác', color: '#f59e0b',
  parts: [{ d: 'M50 6L94 90H6Z' }], ...over,
});

describe('dữ liệu seed', () => {
  it('seed vượt qua kiểm tra nghiêm ngặt và giữ nguyên số lượng', () => {
    const clean = cleanDesignAssets(DESIGN_ASSETS_SEED_DATA);
    expect(clean.elements).toHaveLength(DESIGN_ASSETS_SEED_DATA.elements.length);
    expect(clean.frames).toHaveLength(DESIGN_ASSETS_SEED_DATA.frames.length);
    expect(clean.grids).toHaveLength(DESIGN_ASSETS_SEED_DATA.grids.length);
    expect(clean.fonts.length).toBeGreaterThan(20);
    expect(clean.colors.length).toBeGreaterThan(30);
  });

  it('seed có đủ các nhóm chính như Canva: hình khối, đồ hoạ, 3D, khung, lưới', () => {
    const cats = new Set(DESIGN_ASSETS_SEED_DATA.elements.map((e) => e.category));
    expect(cats).toEqual(new Set(['shape', 'graphic', '3d']));
    expect(DESIGN_ASSETS_SEED_DATA.frames.length).toBeGreaterThanOrEqual(8);
    expect(DESIGN_ASSETS_SEED_DATA.grids.length).toBeGreaterThanOrEqual(6);
  });

  it('mã phần tử không trùng với mã có sẵn trong FE (tránh ghi đè)', () => {
    const builtIn = ['sq', 'rsq', 'circle', 'tri', 'star', 'heart', 'sparkle', 'cube', 'sphere', 'heart3d'];
    const ids = DESIGN_ASSETS_SEED_DATA.elements.map((e) => e.id);
    expect(ids.filter((i) => builtIn.includes(i))).toEqual([]);
  });
});

describe('cleanDesignAssets: phần tử, khung, lưới', () => {
  it('nhận phần tử hợp lệ và chuẩn hoá màu', () => {
    const r = cleanDesignAssets({ ...empty(), elements: [el({ color: '#FF0000' })] });
    expect(r.elements[0].color).toBe('#ff0000');
  });

  it('từ chối path có ký tự lạ (chống chèn mã)', () => {
    const bad = (d: string) => () => cleanDesignAssets({ ...empty(), elements: [el({ parts: [{ d }] })] });
    expect(bad('M0 0 L10 10"><script>')).toThrow();
    expect(bad('M0 0 onload=alert(1)')).toThrow();
  });

  it('từ chối loại, tone, màu và số mảnh không hợp lệ', () => {
    const run = (o: Record<string, unknown>) => () => cleanDesignAssets({ ...empty(), elements: [el(o)] });
    expect(run({ category: 'video' })).toThrow();
    expect(run({ parts: [{ d: 'M0 0', tone: 'neon' }] })).toThrow();
    expect(run({ color: 'red' })).toThrow();
    expect(run({ parts: [] })).toThrow();
    expect(run({ parts: Array.from({ length: 13 }, () => ({ d: 'M0 0' })) })).toThrow();
  });

  it('từ chối trùng mã phần tử', () => {
    expect(() => cleanDesignAssets({ ...empty(), elements: [el(), el()] })).toThrow('Trùng mã');
  });

  it('khung cần path hoặc bo góc; tỉ lệ trong khoảng cho phép', () => {
    const f = (o: Record<string, unknown>) => () => cleanDesignAssets({ ...empty(), frames: [{ id: 'f1', name: 'F', ...o }] });
    expect(f({ ratio: 1 })).toThrow();
    expect(f({ ratio: 9, radius: '10%' })).toThrow();
    expect(f({ ratio: 1, radius: 'url(x)' })).toThrow();
    expect(cleanDesignAssets({ ...empty(), frames: [{ id: 'f1', name: 'F', ratio: 1, radius: '50%' }] }).frames).toHaveLength(1);
  });

  it('lưới: ô phải là [x,y,w,h] với giá trị 0–1', () => {
    const g = (cells: unknown) => () => cleanDesignAssets({ ...empty(), grids: [{ id: 'g1', name: 'G', cells }] });
    expect(g([[0, 0, 1.5, 1]])).toThrow();
    expect(g([[0, 0, 1]])).toThrow();
    expect(g([])).toThrow();
    expect(cleanDesignAssets({ ...empty(), grids: [{ id: 'g1', name: 'G', cells: [[0, 0, 0.5, 1]] }] }).grids).toHaveLength(1);
  });

  it('thiếu mục nào thì coi như rỗng (form cũ vẫn lưu được)', () => {
    const r = cleanDesignAssets({ fonts: [], colors: [], backdrops: [] });
    expect(r.elements).toEqual([]);
  });
});

describe('sanitizeDesignAssets', () => {
  it('bỏ mục hỏng khi đọc, giữ mục đúng', () => {
    const r = sanitizeDesignAssets({
      ...empty(),
      elements: [el(), el({ id: 'bad', parts: [{ d: '<x>' }] })],
      grids: [{ id: 'g', name: 'G', cells: [[0, 0, 2, 2]] }],
    });
    expect(r.elements.map((e) => e.id)).toEqual(['x-tri']);
    expect(r.grids).toEqual([]);
  });

  it('dữ liệu rỗng hoặc sai kiểu trả về cấu trúc rỗng', () => {
    expect(sanitizeDesignAssets(null)).toEqual(empty());
    expect(sanitizeDesignAssets('oops')).toEqual(empty());
  });
});
