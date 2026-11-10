// Dựng cây danh mục lồng nhau (đúng shape mà bộ lọc nhóm trên trang /templates dùng) từ các dòng phẳng trong DB.
// Hàm thuần, không đụng DB, nên có thể kiểm thử trực tiếp.

export interface CategoryNodeRow {
  _id: string;
  slug: string;
  label: string;
  parentId?: string | null;
  sortOrder: number;
}

export interface CategoryTemplateRow {
  _id: string;
  slug: string;
  name: string;
  previewImage?: string | null;
  /** _id của nút chứa mẫu (nút lá). */
  categoryId?: string | null;
}

export interface CategoryTreeTemplate {
  _id: string;
  slug: string;
  name: string;
  previewImage: string | null;
}

export interface CategoryTreeNode {
  /** Mã nút (slug), dùng làm tham số `category` / `group` trên URL. */
  id: string;
  label: string;
  /** Trang lọc: /templates?category=<gốc>[&group=<nút>] */
  path: string;
  /** Tổng số mẫu trong nút này và mọi nút con */
  count: number;
  /** Mẫu gắn trực tiếp vào nút này (không tính nút con). */
  templates: CategoryTreeTemplate[];
  children: CategoryTreeNode[];
}

/**
 * Nút rỗng (không có mẫu ở bất kỳ cấp nào) không được trả về.
 * `templates` phải đã lọc theo trạng thái đăng và sắp xếp theo thứ tự hiển thị mong muốn.
 */
export function buildCategoryTree(
  nodes: CategoryNodeRow[],
  templates: CategoryTemplateRow[],
): CategoryTreeNode[] {
  const childrenOf = new Map<string | null, CategoryNodeRow[]>();
  for (const n of nodes) {
    const key = n.parentId ?? null;
    const list = childrenOf.get(key) ?? [];
    list.push(n);
    childrenOf.set(key, list);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
  }

  const templatesOf = new Map<string, CategoryTreeTemplate[]>();
  for (const t of templates) {
    if (!t.categoryId) continue;
    const list = templatesOf.get(t.categoryId) ?? [];
    list.push({ _id: t._id, slug: t.slug, name: t.name, previewImage: t.previewImage ?? null });
    templatesOf.set(t.categoryId, list);
  }

  const build = (n: CategoryNodeRow, rootSlug: string): CategoryTreeNode | null => {
    const children = (childrenOf.get(n._id) ?? [])
      .map((c) => build(c, rootSlug))
      .filter((c): c is CategoryTreeNode => c !== null);
    const own = templatesOf.get(n._id) ?? [];
    const count = own.length + children.reduce((sum, c) => sum + c.count, 0);
    if (count === 0) return null;
    const path = n.parentId === null || n.parentId === undefined
      ? `/templates?category=${n.slug}`
      : `/templates?category=${rootSlug}&group=${n.slug}`;
    return { id: n.slug, label: n.label, path, count, templates: own, children };
  };

  return (childrenOf.get(null) ?? [])
    .map((r) => build(r, r.slug))
    .filter((r): r is CategoryTreeNode => r !== null);
}
