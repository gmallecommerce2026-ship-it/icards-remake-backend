import { describe, expect, it } from 'vitest';
import { withRequiredMenuItems } from './menu-defaults.js';
import { DEFAULT_PAGE_COPY, resolvePageCopy } from './page-copy.js';

describe('withRequiredMenuItems', () => {
  it('thêm đủ mục bắt buộc khi menu trống', () => {
    const r = withRequiredMenuItems([]);
    expect(r.added).toBe(4);
    expect(r.nav.map((i) => i.path)).toEqual(['/professional', '/shop', '/blog?category=su-kien', '/blog']);
  });
  it('không thêm trùng khi đã có mục trỏ tới cùng đường dẫn (kể cả trong mục con)', () => {
    const nav = [{ id: 'x', title: 'Mua', path: '/shop', order: 1, isVisible: true, children: [{ id: 'y', title: 'Tin', path: '/blog', order: 1, isVisible: true, children: [] }] }];
    const r = withRequiredMenuItems(nav);
    expect(r.added).toBe(2);
    expect(r.nav.filter((i) => i.path === '/blog')).toHaveLength(0);
    expect(r.nav.at(-1)?.path).toBe('/blog?category=su-kien');
  });
});

describe('resolvePageCopy', () => {
  it('chưa có dữ liệu thì trả về mặc định', () => {
    expect(resolvePageCopy(undefined)).toEqual(DEFAULT_PAGE_COPY);
  });
  it('trường admin để trống vẫn giữ là chuỗi rỗng, không bị thay bằng mặc định', () => {
    const out = resolvePageCopy({ shop: { adTitle: '' } });
    expect(out.shop.adTitle).toBe('');
    expect(out.shop.adCta).toBe(DEFAULT_PAGE_COPY.shop.adCta);
  });
  it('nhóm từ khoá đã lưu (kể cả rỗng) được giữ nguyên', () => {
    expect(resolvePageCopy({ blog: { keywordGroups: [] } }).blog.keywordGroups).toEqual([]);
  });
  it('mặc định có 3 nhóm, 15 từ khoá', () => {
    const groups = DEFAULT_PAGE_COPY.blog.keywordGroups;
    expect(groups).toHaveLength(3);
    expect(groups.flatMap((g) => g.items)).toHaveLength(15);
  });
});
