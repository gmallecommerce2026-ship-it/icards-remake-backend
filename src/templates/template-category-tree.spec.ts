import { describe, expect, it } from 'vitest';
import { buildCategoryTree } from './template-category-tree.js';

const nodes = [
  { _id: 'r1', slug: 'wedding', label: 'Thiệp cưới', parentId: null, sortOrder: 1 },
  { _id: 'g1', slug: 'wedding-style', label: 'Phong cách', parentId: 'r1', sortOrder: 1 },
  { _id: 'g2', slug: 'wedding-outdoor', label: 'Ngoài trời', parentId: 'r1', sortOrder: 2 },
  { _id: 'r2', slug: 'birthday', label: 'Sinh nhật', parentId: null, sortOrder: 2 },
  { _id: 'g3', slug: 'birthday-empty', label: 'Trống', parentId: 'r2', sortOrder: 1 },
];

const templates = [
  { _id: 't1', slug: 'som-mai', name: 'Sớm Mai', categoryId: 'g1', previewImage: null },
  { _id: 't2', slug: 'gio-bien', name: 'Gió Biển', categoryId: 'g2', previewImage: 'x.png' },
  { _id: 't3', slug: 'orphan', name: 'Mồ côi', categoryId: null },
];

describe('buildCategoryTree', () => {
  const tree = buildCategoryTree(nodes, templates);

  it('dựng cây theo parentId, đúng thứ tự sortOrder, có id/label/children như bộ lọc nhóm phía FE', () => {
    expect(tree.map((r) => r.id)).toEqual(['wedding']);
    expect(tree[0].children.map((c) => c.id)).toEqual(['wedding-style', 'wedding-outdoor']);
    expect(Object.keys(tree[0]).sort()).toEqual(['children', 'count', 'id', 'label', 'path', 'templates']);
  });

  it('đếm mẫu theo cả nhóm con và đường dẫn lọc đúng', () => {
    expect(tree[0].count).toBe(2);
    expect(tree[0].path).toBe('/templates?category=wedding');
    expect(tree[0].children[0].path).toBe('/templates?category=wedding&group=wedding-style');
    expect(tree[0].children[0].templates.map((t) => t.slug)).toEqual(['som-mai']);
    expect(tree[0].children[1].templates[0].previewImage).toBe('x.png');
  });

  it('bỏ nút rỗng và mẫu không có nhóm', () => {
    expect(tree.find((r) => r.id === 'birthday')).toBeUndefined();
    expect(JSON.stringify(tree)).not.toContain('orphan');
  });
});
