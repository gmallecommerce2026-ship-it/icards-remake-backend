import type { HeaderNavItem } from './site-config.types.js';

/**
 * Mục menu luôn có trên web. Nếu admin chưa có mục nào trỏ tới đường dẫn này thì thêm vào khi nâng cấp dữ liệu.
 * Thứ tự là thứ tự thêm vào; mục "Chuyên nghiệp" đứng ngay trước ba mục cuối.
 */
export const REQUIRED_MENU_ITEMS: { id: string; title: string; path: string }[] = [
  { id: 'menu-professional', title: 'Chuyên nghiệp', path: '/professional' },
  { id: 'menu-shop', title: 'Cửa hàng', path: '/shop' },
  { id: 'menu-events', title: 'Sự kiện', path: '/blog?category=su-kien' },
  { id: 'menu-blog', title: 'Tin tức', path: '/blog' },
];

/** Ba mục đứng cuối menu, sau mọi danh mục thiệp: Cửa hàng, Sự kiện, Tin tức. */
export const END_MENU_PATHS = ['/shop', '/blog?category=su-kien', '/blog'];

const hasPath = (items: HeaderNavItem[], path: string): boolean =>
  items.some((i) => i.path === path || hasPath(i.children ?? [], path));

/** Thêm các mục bắt buộc còn thiếu (không ghi đè mục admin đã có). Trả về số mục đã thêm. */
export function withRequiredMenuItems(nav: HeaderNavItem[]): { nav: HeaderNavItem[]; added: number } {
  const out = [...nav];
  let added = 0;
  for (const r of REQUIRED_MENU_ITEMS) {
    if (hasPath(out, r.path)) continue;
    out.push({ id: r.id, title: r.title, path: r.path, order: out.length + 1, isVisible: true, children: [] });
    added++;
  }
  return { nav: out, added };
}

const isTemplateRoot = (i: HeaderNavItem) => !!i.path?.startsWith('/templates');

/**
 * Sắp xếp lại menu gốc: [danh mục thiệp] → [mục khác của admin] → [Chuyên nghiệp] → [Cửa hàng, Sự kiện, Tin tức].
 * - templateRoots: danh mục thiệp mới (dựng từ cây). Bỏ trống thì giữ nguyên danh mục thiệp đang có.
 * - Mục bắt buộc đã có ở cấp gốc được giữ id/cấu hình (chỉ đổi tên "Cửa hàng - Dịch vụ" thành "Cửa hàng").
 * - Mục bắt buộc chỉ nằm trong mục con thì không thêm lại ở cấp gốc.
 */
export function arrangeHeaderNav(nav: HeaderNavItem[], templateRoots?: HeaderNavItem[]): HeaderNavItem[] {
  const requiredPaths = new Set(REQUIRED_MENU_ITEMS.map((r) => r.path));
  const roots = templateRoots ?? nav.filter(isTemplateRoot);
  const others = nav.filter((i) => !isTemplateRoot(i) && !requiredPaths.has(i.path ?? ''));

  const placed = (path: string, def: { id: string; title: string }): HeaderNavItem[] => {
    const existing = nav.find((i) => i.path === path);
    if (existing) {
      const title = path === '/shop' && existing.title === 'Cửa hàng - Dịch vụ' ? 'Cửa hàng' : existing.title;
      return [{ ...existing, title }];
    }
    if (hasPath(nav, path)) return []; // đã có ở mục con: không thêm lại ở cấp gốc
    return [{ id: def.id, title: def.title, path, order: 0, isVisible: true, children: [] }];
  };

  const def = (path: string) => REQUIRED_MENU_ITEMS.find((r) => r.path === path)!;
  const middle = placed(def('/professional').path, def('/professional'));
  const end = END_MENU_PATHS.flatMap((p) => placed(p, def(p)));

  return [...roots, ...others, ...middle, ...end].map((item, i) => ({ ...item, order: i + 1 }));
}
