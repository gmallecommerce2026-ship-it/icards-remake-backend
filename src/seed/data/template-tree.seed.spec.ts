import { describe, expect, it } from 'vitest';
import { CATALOG_SEED } from './catalog.seed.js';
import {
  EXTRA_TEMPLATES,
  TEMPLATE_CATEGORY_OF,
  TEMPLATE_CATEGORY_TREE_SEED,
  flattenCategorySeed,
  type TemplateCategorySeed,
} from './template-tree.seed.js';

const walk = (nodes: TemplateCategorySeed[], out: TemplateCategorySeed[] = []) => {
  nodes.forEach((n) => {
    out.push(n);
    walk(n.children, out);
  });
  return out;
};

describe('seed danh mục mẫu thiệp', () => {
  const all = walk(TEMPLATE_CATEGORY_TREE_SEED);
  const rows = flattenCategorySeed(TEMPLATE_CATEGORY_TREE_SEED);

  it('mỗi nút chỉ có id, label, children (đúng shape nút lọc nhóm phía FE)', () => {
    for (const n of all) expect(Object.keys(n).sort()).toEqual(['children', 'id', 'label']);
  });

  it('mã nút là duy nhất', () => {
    const ids = all.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mọi mẫu đều gán vào một nút lá có thật, và mẫu gốc cũng được gán', () => {
    const leafIds = new Set(all.filter((n) => n.children.length === 0).map((n) => n.id));
    for (const t of [...CATALOG_SEED.templates, ...EXTRA_TEMPLATES]) {
      const cat = TEMPLATE_CATEGORY_OF[t.slug];
      expect(cat, `mẫu ${t.slug} chưa có nhóm`).toBeTruthy();
      expect(leafIds.has(cat), `${t.slug} trỏ tới nút không phải lá: ${cat}`).toBe(true);
    }
  });

  it('keyPath là đường đi từ gốc, và nút cha đứng trước con', () => {
    const byKey = new Map(rows.map((r) => [r.slug, r]));
    for (const r of rows) {
      const parts = r.keyPath.split('/');
      expect(parts.at(-1)).toBe(r.slug);
      if (r.parentSlug) expect(parts.slice(0, -1).join('/')).toBe(byKey.get(r.parentSlug)?.keyPath);
      else expect(parts).toHaveLength(1);
    }
  });

  it('mẫu bổ sung có categoryId trùng với nhóm đã gán', () => {
    for (const t of EXTRA_TEMPLATES) expect(t.categoryId).toBe(TEMPLATE_CATEGORY_OF[t.slug]);
  });
});
