import { describe, expect, it } from 'vitest';
import { arrangeHeaderNav, END_MENU_PATHS } from './menu-defaults.js';
import { templateHeaderNav } from './template-header-nav.js';
import type { HeaderNavItem } from './site-config.types.js';

const item = (id: string, title: string, path: string, children: HeaderNavItem[] = []): HeaderNavItem => ({
  id,
  title,
  path,
  order: 0,
  isVisible: true,
  children,
});

describe('arrangeHeaderNav', () => {
  it('đưa Cửa hàng, Sự kiện, Tin tức xuống cuối, sau mọi danh mục thiệp', () => {
    const nav = [
      item('blog', 'Tin tức', '/blog'),
      item('wedding', 'Thiệp cưới', '/templates?category=wedding'),
      item('shop', 'Cửa hàng - Dịch vụ', '/shop'),
      item('birthday', 'Sinh nhật', '/templates?category=birthday'),
    ];
    const roots = [item('wedding', 'Thiệp cưới', '/templates?category=wedding'), item('birthday', 'Sinh nhật', '/templates?category=birthday'), item('engagement', 'Lễ hỏi', '/templates?category=engagement')];
    const out = arrangeHeaderNav(nav, roots);
    expect(out.map((i) => i.path)).toEqual([
      '/templates?category=wedding',
      '/templates?category=birthday',
      '/templates?category=engagement',
      '/professional',
      '/shop',
      '/blog?category=su-kien',
      '/blog',
    ]);
    expect(out.find((i) => i.path === '/shop')?.title).toBe('Cửa hàng');
    expect(out.map((i) => i.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('giữ danh mục thiệp đang có khi admin đã tự chỉnh (không có danh mục mới)', () => {
    const nav = [item('custom', 'Quà tặng', '/templates?category=custom'), item('shop', 'Cửa hàng', '/shop')];
    const out = arrangeHeaderNav(nav);
    expect(out[0].id).toBe('custom');
    expect(out.slice(-3).map((i) => i.path)).toEqual(['/shop', '/blog?category=su-kien', '/blog']);
  });

  it('không thêm trùng mục đã có ở cấp con', () => {
    const nav = [item('wrap', 'Khác', '/x', [item('blog', 'Tin', '/blog')])];
    const out = arrangeHeaderNav(nav);
    expect(out.filter((i) => i.path === '/blog')).toHaveLength(0);
    expect(END_MENU_PATHS.every((p) => out.some((i) => i.path === p) || p === '/blog')).toBe(true);
  });
});

describe('templateHeaderNav', () => {
  const tree = [
    {
      id: 'wedding',
      label: 'Thiệp cưới',
      children: [
        { id: 'wedding-style', label: 'Phong cách', children: [{ id: 'wedding-classic', label: 'Cổ điển', children: [] }] },
      ],
    },
  ];
  it('mỗi danh mục gốc là một mục, mỗi nhóm con là một cột, và mẫu lấy theo cây con', () => {
    const out = templateHeaderNav(tree, [
      { slug: 'a', name: 'A', popularity: 10, categoryId: 'wedding-classic' },
      { slug: 'b', name: 'B', popularity: 99, categoryId: 'wedding-classic' },
      { slug: 'c', name: 'C', popularity: 1, categoryId: null },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].path).toBe('/templates?category=wedding');
    const col = out[0].children[0];
    expect(col.path).toBe('/templates?category=wedding&group=wedding-style');
    expect(col.children.map((l) => l.title)).toEqual(['B', 'A']);
    expect(col.children[0].path).toBe('/templates/b');
  });
});
