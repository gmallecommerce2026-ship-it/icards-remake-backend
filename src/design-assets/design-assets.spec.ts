import { describe, expect, it } from 'vitest';
import { cleanDesignAssets, sanitizeDesignAssets } from './design-assets.js';

const ok = {
  fonts: [{ id: 'playfair', name: 'Playfair Display' }],
  colors: ['#B5651D', '#3b2a1e'],
  backdrops: [
    { id: 'rose-grad', name: 'Hồng', type: 'gradient', value: 'linear-gradient(135deg,#ffb347,#ff5e62)' },
    { id: 'cream', name: 'Kem', type: 'color', value: '#fffaf0' },
    { id: 'paper', name: 'Giấy', type: 'image', value: 'https://cdn.example.com/p.jpg' },
  ],
};

describe('cleanDesignAssets', () => {
  it('nhận dữ liệu hợp lệ và chuẩn hoá màu về chữ thường', () => {
    const r = cleanDesignAssets(ok);
    expect(r.colors).toEqual(['#b5651d', '#3b2a1e']);
    expect(r.fonts[0]).toEqual({ id: 'playfair', name: 'Playfair Display' });
    expect(r.backdrops).toHaveLength(3);
  });

  it('từ chối mã font và tên phông có ký tự lạ', () => {
    expect(() => cleanDesignAssets({ ...ok, fonts: [{ id: 'Bad Id', name: 'x' }] })).toThrow();
    expect(() => cleanDesignAssets({ ...ok, fonts: [{ id: 'a', name: 'Font&family=evil' }] })).toThrow();
  });

  it('từ chối màu không đúng định dạng và màu trùng', () => {
    expect(() => cleanDesignAssets({ ...ok, colors: ['red'] })).toThrow();
    expect(() => cleanDesignAssets({ ...ok, colors: ['#ffffff', '#FFFFFF'] })).toThrow();
  });

  it('từ chối gradient chứa url() hoặc ký tự thoát chuỗi', () => {
    const bad = (value: string) =>
      cleanDesignAssets({ ...ok, backdrops: [{ id: 'x', name: 'x', type: 'gradient', value }] });
    expect(() => bad('linear-gradient(url(http://evil.com/a.png),#fff)')).toThrow();
    expect(() => bad('linear-gradient(red,"blue")')).toThrow();
    expect(() => bad('red')).toThrow();
  });

  it('chỉ nhận ảnh nền https', () => {
    const img = (value: string) => cleanDesignAssets({ ...ok, backdrops: [{ id: 'x', name: 'x', type: 'image', value }] });
    expect(() => img('http://insecure.example/a.jpg')).toThrow();
    expect(() => img('https://x.example/a.jpg")')).toThrow();
  });

  it('từ chối loại hình nền lạ', () => {
    expect(() => cleanDesignAssets({ ...ok, backdrops: [{ id: 'x', name: 'x', type: 'video', value: 'a' }] })).toThrow();
  });
});

describe('sanitizeDesignAssets', () => {
  it('bỏ mục hỏng và giữ mục đúng khi đọc', () => {
    const r = sanitizeDesignAssets({
      fonts: [{ id: 'ok', name: 'OK' }, { id: 'Bad Id', name: 'x' }],
      colors: ['#123456', 'nope'],
      backdrops: [{ id: 'g', name: 'G', type: 'gradient', value: 'url(x)' }],
    });
    expect(r.fonts.map((f) => f.id)).toEqual(['ok']);
    expect(r.colors).toEqual(['#123456']);
    expect(r.backdrops).toEqual([]);
  });

  it('dữ liệu rỗng hoặc sai kiểu trả về danh sách rỗng', () => {
    expect(sanitizeDesignAssets(null)).toEqual({ fonts: [], colors: [], backdrops: [] });
    expect(sanitizeDesignAssets('oops')).toEqual({ fonts: [], colors: [], backdrops: [] });
  });
});
