import { describe, expect, it } from 'vitest';
import { cleanBannerGroups } from './site-settings.validator.js';

const group = (over: Record<string, unknown> = {}) => ({
  id: 'g1', name: 'Nhóm', page: 'home', slot: 'bottom', layout: 'mosaic-2-1', isEnabled: true, banners: [], ...over,
});

describe('cleanBannerGroups', () => {
  it('nhận nhiều banner không giới hạn trong một nhóm', () => {
    const banners = Array.from({ length: 120 }, (_, i) => ({ id: `b${i}`, name: `B${i}`, isEnabled: true }));
    expect(cleanBannerGroups([group({ banners })])[0].banners).toHaveLength(120);
  });

  it('từ chối bố cục, trang, vị trí không hợp lệ', () => {
    expect(() => cleanBannerGroups([group({ layout: 'x' })])).toThrow();
    expect(() => cleanBannerGroups([group({ page: 'blog' })])).toThrow();
    expect(() => cleanBannerGroups([group({ slot: 'middle' })])).toThrow();
  });

  it('từ chối đường dẫn không an toàn', () => {
    const bad = group({ banners: [{ name: 'a', link: 'javascript:alert(1)', isEnabled: true }] });
    expect(() => cleanBannerGroups([bad])).toThrow();
    const badImg = group({ banners: [{ name: 'a', imgSrc: 'http://insecure.example/a.png', isEnabled: true }] });
    expect(() => cleanBannerGroups([badImg])).toThrow();
  });

  it('cấp id mới khi trùng, không trùng nhau trong toàn bộ danh sách', () => {
    const out = cleanBannerGroups([
      group({ id: 'same', banners: [{ id: 'dup', name: 'a', isEnabled: true }] }),
      group({ id: 'same', banners: [{ id: 'dup', name: 'b', isEnabled: true }] }),
    ]);
    const ids = [out[0].id, out[0].banners[0].id, out[1].id, out[1].banners[0].id];
    expect(new Set(ids).size).toBe(4);
  });

  it('không cho phép tên trống', () => {
    expect(() => cleanBannerGroups([group({ name: '   ' })])).toThrow();
  });
});
