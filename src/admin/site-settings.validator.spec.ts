import { describe, expect, it } from 'vitest';
import { cleanAnnouncementBar, cleanBannerGroups } from './site-settings.validator.js';

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

describe('cleanAnnouncementBar', () => {
  it('lưu thanh hợp lệ và kẹp tốc độ trong 20..200', () => {
    const bar = cleanAnnouncementBar({ isEnabled: true, text: ' Miễn phí giao hàng ', backgroundColor: '#27548A', textColor: '#fff', isMarquee: true, speed: 9999, link: '/shop' });
    expect(bar).toMatchObject({ isEnabled: true, text: 'Miễn phí giao hàng', backgroundColor: '#27548A', isMarquee: true, speed: 200, link: '/shop', isDismissible: false });
    expect(cleanAnnouncementBar({ speed: 1 }).speed).toBe(20);
  });

  it('cho phép tắt thanh khi chưa có nội dung, nhưng không cho bật thanh rỗng', () => {
    expect(cleanAnnouncementBar({ isEnabled: false }).text).toBe('');
    expect(() => cleanAnnouncementBar({ isEnabled: true, text: '  ' })).toThrow();
  });

  it('từ chối màu, liên kết và ảnh không an toàn', () => {
    expect(() => cleanAnnouncementBar({ backgroundColor: 'red; background:url(x)' })).toThrow();
    expect(() => cleanAnnouncementBar({ link: 'javascript:alert(1)' })).toThrow();
    expect(() => cleanAnnouncementBar({ backgroundImage: 'http://x.com/a.png' })).toThrow();
  });
});
