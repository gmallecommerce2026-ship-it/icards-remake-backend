import type { TemplateCategorySeed } from '../seed/data/template-tree.seed.js';
import type { HeaderNavItem } from './site-config.types.js';

/** Số liên kết mẫu tối đa trong một cột của menu thả xuống. */
export const MAX_HEADER_LINKS = 8;

export interface HeaderTemplateRef {
  slug: string;
  name: string;
  popularity: number;
  /** Mã nút lá của mẫu trong cây danh mục. */
  categoryId?: string | null;
}

/** Mọi mã nút nằm trong nút này (kể cả chính nó). */
const subtreeIds = (node: TemplateCategorySeed, out = new Set<string>()): Set<string> => {
  out.add(node.id);
  node.children.forEach((c) => subtreeIds(c, out));
  return out;
};

/**
 * Danh mục thiệp cho menu trên header, dựng từ cùng cây seed với trang /templates.
 * Mỗi danh mục gốc là một mục; mỗi nhóm con là một cột; cột liệt kê tối đa MAX_HEADER_LINKS mẫu, nhiều lượt dùng trước.
 */
export function templateHeaderNav(tree: TemplateCategorySeed[], templates: HeaderTemplateRef[]): HeaderNavItem[] {
  return tree.map((root, i) => {
    const columns: HeaderNavItem[] = root.children.map((group, j) => {
      const ids = subtreeIds(group);
      const links = templates
        .filter((t) => t.categoryId && ids.has(t.categoryId))
        .sort((a, b) => b.popularity - a.popularity || a.slug.localeCompare(b.slug))
        .slice(0, MAX_HEADER_LINKS)
        .map((t, k) => ({
          id: t.slug,
          title: t.name,
          path: `/templates/${t.slug}`,
          order: k + 1,
          isVisible: true,
          children: [],
        }));
      return {
        id: group.id,
        title: group.label,
        path: `/templates?category=${root.id}&group=${group.id}`,
        order: j + 1,
        isVisible: true,
        children: links,
      };
    });
    return {
      id: root.id,
      title: root.label,
      path: `/templates?category=${root.id}`,
      order: i + 1,
      isVisible: true,
      children: columns,
    };
  });
}
