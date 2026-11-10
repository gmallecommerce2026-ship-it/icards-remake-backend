import type { HeaderNavItem } from './site-config.types.js';

/** Các mục menu luôn có trên web. Nếu admin chưa có mục nào trỏ tới đường dẫn này thì thêm vào cuối khi nâng cấp dữ liệu. */
export const REQUIRED_MENU_PATHS: { title: string; path: string }[] = [
  { title: 'Cửa hàng - Dịch vụ', path: '/shop' },
  { title: 'Tin tức', path: '/blog' },
  { title: 'Chuyên nghiệp', path: '/professional' },
];

const hasPath = (items: HeaderNavItem[], path: string): boolean =>
  items.some((i) => i.path === path || hasPath(i.children ?? [], path));

/** Thêm các mục bắt buộc còn thiếu (không ghi đè mục admin đã có). Trả về số mục đã thêm. */
export function withRequiredMenuItems(nav: HeaderNavItem[]): { nav: HeaderNavItem[]; added: number } {
  const out = [...nav];
  let added = 0;
  for (const r of REQUIRED_MENU_PATHS) {
    if (hasPath(out, r.path)) continue;
    out.push({
      id: `menu-${r.path.replace(/^\//, '')}`,
      title: r.title,
      path: r.path,
      order: out.length + 1,
      isVisible: true,
      children: [],
    });
    added++;
  }
  return { nav: out, added };
}
