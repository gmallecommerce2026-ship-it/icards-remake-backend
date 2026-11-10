import { describe, expect, it } from 'vitest';
import { cleanBlogCategories, cleanPageCopy, cleanPost, cleanProduct, cleanService } from './catalog-admin.validator.js';

const product = (over: Record<string, unknown> = {}) => ({
  slug: 'phong-bi-in', name: 'Phong bì in', category: 'print', summary: 's', description: 'd', thumb: 'envelope',
  tone: { bg: '#FFFFFF', ink: '#0E1B2C' }, variants: [{ id: 'std', label: 'Tiêu chuẩn', price: 15000 }],
  shipping: 'ship', leadTime: '3 ngày', highlights: ['a'], specs: [{ label: 'Chất liệu', value: 'Giấy' }],
  sortOrder: 1, isPublished: true, ...over,
});

describe('cleanProduct', () => {
  it('nhận sản phẩm hợp lệ', () => {
    expect(cleanProduct(product()).slug).toBe('phong-bi-in');
  });
  it('chặn danh mục, hình, màu và giá sai', () => {
    expect(() => cleanProduct(product({ category: 'weird' }))).toThrow();
    expect(() => cleanProduct(product({ thumb: 'nope' }))).toThrow();
    expect(() => cleanProduct(product({ tone: { bg: 'red', ink: '#000000' } }))).toThrow();
    expect(() => cleanProduct(product({ variants: [{ id: 'a', label: 'x', price: -1 }] }))).toThrow();
  });
  it('bắt buộc có ít nhất một biến thể', () => {
    expect(() => cleanProduct(product({ variants: [] }))).toThrow();
  });
  it('slug phải là chữ thường, số và gạch ngang', () => {
    expect(() => cleanProduct(product({ slug: 'Phong Bi' }))).toThrow();
    expect(() => cleanProduct(product({ slug: '' }))).toThrow();
  });
  it('chấp nhận mã biến thể có gạch dưới (dữ liệu seed)', () => {
    expect(cleanProduct(product({ variants: [{ id: 'size_a4', label: 'A4', price: 1 }] })).variants[0].id).toBe('size_a4');
  });
});

describe('cleanService', () => {
  it('giá không âm và số nguyên', () => {
    const base = { slug: 'tu-van', name: 'Tư vấn', summary: '', description: '', duration: '', audience: '', includes: ['a', ''], sortOrder: 0, isPublished: false };
    expect(cleanService({ ...base, priceFrom: 500000 }).priceFrom).toBe(500000);
    expect(() => cleanService({ ...base, priceFrom: 1.5 })).toThrow();
    expect(() => cleanService({ ...base, priceFrom: -10 })).toThrow();
    expect(cleanService({ ...base, priceFrom: 0 }).includes).toEqual(['a']);
  });
});

describe('cleanPost', () => {
  const post = { slug: 'cach-viet-loi-moi', title: 'Cách viết lời mời', excerpt: '', category: 'loi-moi', publishedOn: '2026-11-01', readMinutes: 5, author: 'iCards', tone: { bg: '#FFFFFF', ink: '#0E1B2C' }, content: [{ t: 'h2', text: 'Mở đầu' }, { t: 'ul', items: ['a', 'b'] }, { t: 'tip', text: 'Mẹo' }], isPublished: true };
  it('nhận bài hợp lệ và giữ các khối nội dung', () => {
    const out = cleanPost(post);
    expect(out.content).toEqual([{ t: 'h2', text: 'Mở đầu' }, { t: 'ul', items: ['a', 'b'] }, { t: 'tip', text: 'Mẹo' }]);
  });
  it('ngày đăng sai định dạng bị chặn, rỗng thì thành null', () => {
    expect(() => cleanPost({ ...post, publishedOn: '01/11/2026' })).toThrow();
    expect(cleanPost({ ...post, publishedOn: '' }).publishedOn).toBeNull();
  });
  it('loại khối lạ bị chặn', () => {
    expect(() => cleanPost({ ...post, content: [{ t: 'script', text: 'x' }] })).toThrow();
  });
});

describe('cleanPageCopy', () => {
  it('nhóm từ khoá thiếu tên bị chặn', () => {
    expect(() => cleanPageCopy({ blog: { keywordGroups: [{ title: '', items: [] }] } })).toThrow();
  });
  it('giữ đủ trường và chặn chuỗi quá dài', () => {
    const out = cleanPageCopy({ shop: { adTitle: 'x' }, services: {}, blog: { keywordGroups: [{ title: 'Thiệp', items: [{ keyword: 'lời mời', blurb: 'b' }] }] } });
    expect(out.shop.adTitle).toBe('x');
    expect(out.blog.keywordGroups[0].items[0]).toEqual({ keyword: 'lời mời', blurb: 'b' });
    expect(() => cleanPageCopy({ shop: { adTitle: 'x'.repeat(501) } })).toThrow();
  });
});

describe('cleanBlogCategories', () => {
  it('trùng đường dẫn bị chặn', () => {
    expect(() => cleanBlogCategories([{ slug: 'a', label: 'A' }, { slug: 'a', label: 'B' }])).toThrow();
  });
  it('nhận danh sách hợp lệ', () => {
    expect(cleanBlogCategories([{ slug: 'loi-moi', label: 'Lời mời' }])).toEqual([{ slug: 'loi-moi', label: 'Lời mời' }]);
  });
});
