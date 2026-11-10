import { describe, expect, it } from 'vitest';
import { defaultBannerGroups, groupsFromLegacy, normalizeBannerGroups, publicBannerGroups } from './banner-layout.js';
import type { BannerGroup } from './site-config.types.js';

describe('defaultBannerGroups', () => {
  it('đúng 3 vị trí yêu cầu: trang chủ có nhóm cuối trang 3 banner, chuyên nghiệp có 1 hero + 2 dưới, cửa hàng và dịch vụ có 1 banner trên', () => {
    const groups = defaultBannerGroups();
    const count = (page: string, slot: string) =>
      groups.filter((g) => g.page === page && g.slot === slot).reduce((n, g) => n + g.banners.length, 0);
    expect(count('home', 'bottom')).toBe(3);
    expect(groups.find((g) => g.page === 'home' && g.slot === 'bottom')?.layout).toBe('mosaic-2-1');
    expect(groups.find((g) => g.page === 'professional')?.layout).toBe('hero-pair');
    expect(groups.find((g) => g.page === 'professional')?.banners).toHaveLength(3);
    expect(count('shop', 'top')).toBe(1);
    expect(count('services', 'top')).toBe(1);
  });

  it('trả về bản mới mỗi lần gọi (không dùng chung object)', () => {
    const a = defaultBannerGroups();
    a[0].banners.push({ id: 'x', name: 'x', isEnabled: true });
    expect(defaultBannerGroups()[0].banners.some((b) => b.id === 'x')).toBe(false);
  });
});

describe('groupsFromLegacy', () => {
  it('chuyển banner trang chủ cũ thành băng chuyền đầu trang, giữ tên, ảnh, liên kết và trạng thái', () => {
    const groups = groupsFromLegacy([
      { id: 'home-hero', name: 'Banner chính', displayPage: 'home', isEnabled: true, imgSrc: 'https://cdn.example/a.png', link: '/templates' },
      { id: 'home-2', name: 'Phụ', displayPage: 'home', isEnabled: false, imgSrc: null, link: '' },
    ]);
    const top = groups.find((g) => g.id === 'grp-home-top')!;
    expect(top.layout).toBe('slider');
    expect(top.banners.map((b) => b.id)).toEqual(['home-hero', 'home-2']);
    expect(top.banners[0].imgSrc).toBe('https://cdn.example/a.png');
    expect(top.banners[0].title).toBe('Banner chính');
    expect(top.banners[1].isEnabled).toBe(false);
    // nhóm cuối trang không có trong dữ liệu cũ nên vẫn có mặc định
    expect(groups.some((g) => g.page === 'home' && g.slot === 'bottom')).toBe(true);
  });

  it('bỏ qua banner trang templates / blog / all vì không hiển thị ở đâu', () => {
    const groups = groupsFromLegacy([{ id: 'b', name: 'b', displayPage: 'blog', isEnabled: true }]);
    expect(JSON.stringify(groups)).not.toContain('"id":"b"');
  });
});

describe('normalizeBannerGroups', () => {
  it('chưa có bannerGroups thì chuyển từ banners cũ', () => {
    const groups = normalizeBannerGroups({ banners: [{ id: 'h', name: 'H', displayPage: 'home', isEnabled: true }] });
    expect(groups.find((g) => g.id === 'grp-home-top')?.banners[0].id).toBe('h');
  });

  it('đọc lỏng: bỏ nhóm sai trang, thay bố cục lạ bằng băng chuyền, bỏ mục sai liên kết nguy hiểm', () => {
    const groups = normalizeBannerGroups({
      bannerGroups: [
        { id: 'g1', name: 'Ok', page: 'home', slot: 'bottom', layout: 'nope', isEnabled: true, banners: [{ id: 'a', name: 'A', imgSrc: 'javascript:alert(1)', link: 'javascript:x', isEnabled: true }] },
        { id: 'g2', name: 'Sai trang', page: 'templates', slot: 'top', layout: 'slider', isEnabled: true, banners: [] },
      ],
    });
    expect(groups).toHaveLength(1);
    expect(groups[0].layout).toBe('slider');
    expect(groups[0].banners[0].imgSrc).toBeNull();
    expect(groups[0].banners[0].link).toBeUndefined();
  });

  it('cấp id cho mục thiếu hoặc sai định dạng', () => {
    const [g] = normalizeBannerGroups({ bannerGroups: [{ page: 'shop', layout: 'stack', banners: [{ name: 'x' }, { id: 'bad id!', name: 'y' }] }] });
    expect(g.id).toBe('grp-0');
    expect(g.banners.map((b) => b.id)).toEqual(['grp-0-0', 'grp-0-1']);
  });
});

describe('publicBannerGroups', () => {
  const base = (over: Partial<BannerGroup>): BannerGroup => ({
    id: 'g', name: 'g', page: 'home', slot: 'top', layout: 'slider', isEnabled: true, banners: [],
    ...over,
  });

  it('bỏ nhóm tắt, nhóm không có banner bật, và banner tắt; giữ đúng thứ tự', () => {
    const out = publicBannerGroups([
      base({ id: 'off', isEnabled: false, banners: [{ id: 'a', name: 'a', isEnabled: true }] }),
      base({ id: 'empty', banners: [{ id: 'b', name: 'b', isEnabled: false }] }),
      base({ id: 'keep', banners: [{ id: 'c', name: 'c', isEnabled: false }, { id: 'd', name: 'd', isEnabled: true }, { id: 'e', name: 'e', isEnabled: true }] }),
    ]);
    expect(out.map((g) => g.id)).toEqual(['keep']);
    expect(out[0].banners.map((b) => b.id)).toEqual(['d', 'e']);
  });

  it('không giới hạn số banner trong nhóm', () => {
    const many = Array.from({ length: 500 }, (_, i) => ({ id: `b${i}`, name: `b${i}`, isEnabled: true }));
    expect(publicBannerGroups([base({ banners: many })])[0].banners).toHaveLength(500);
  });
});
