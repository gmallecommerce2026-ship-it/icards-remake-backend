import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { cleanDesign, cleanEnvelopeAssignment, cleanPresets, cleanTemplateInput, MAX_DESIGN_CHARS } from './admin-templates.validator.js';

const base = { slug: 'mau-moi', name: 'Mẫu mới', category: 'wedding', tagline: 'Ngắn', description: 'Mô tả', categorySlug: 'wedding-classic' };

describe('cleanTemplateInput', () => {
  it('tạo mới: điền mặc định cho trường không gửi', () => {
    const out = cleanTemplateInput(base, true);
    expect(out).toMatchObject({ price: 0, format: 'folding', orientation: 'portrait', isPublished: false, features: [] });
  });
  it('tạo mới: thiếu trường bắt buộc thì báo lỗi', () => {
    expect(() => cleanTemplateInput({ ...base, name: '  ' }, true)).toThrow(BadRequestException);
    expect(() => cleanTemplateInput({ ...base, categorySlug: undefined }, true)).toThrow(BadRequestException);
  });
  it('slug chỉ gồm chữ thường, số và gạch ngang', () => {
    expect(() => cleanTemplateInput({ ...base, slug: 'Mau Moi' }, true)).toThrow(BadRequestException);
  });
  it('cập nhật một phần: chỉ kiểm tra trường được gửi, cho phép bỏ gán nhóm', () => {
    expect(cleanTemplateInput({ categorySlug: null, isPublished: true }, false)).toEqual({ categorySlug: null, isPublished: true });
  });
  it('giá và enum sai thì từ chối', () => {
    expect(() => cleanTemplateInput({ price: -1 }, false)).toThrow(BadRequestException);
    expect(() => cleanTemplateInput({ format: 'pdf' }, false)).toThrow(BadRequestException);
  });
});

describe('cleanDesign', () => {
  const design = { pages: { cover: [{ kind: 'text' }], inside: [], back: [] }, backdrops: { cover: '#fff' }, format: 'folding', orientation: 'portrait' };
  it('nhận thiết kế đúng định dạng', () => {
    expect(cleanDesign(design)).toEqual(design);
  });
  it('thiếu pages hoặc backdrops thì từ chối', () => {
    expect(() => cleanDesign({ ...design, pages: undefined })).toThrow(BadRequestException);
    expect(() => cleanDesign({ ...design, pages: [] })).toThrow(BadRequestException);
  });
  it('quá dung lượng thì từ chối', () => {
    const big = { ...design, pages: { cover: [{ blob: 'x'.repeat(MAX_DESIGN_CHARS) }] } };
    expect(() => cleanDesign(big)).toThrow(/quá lớn/);
  });
});

describe('cleanEnvelopeAssignment', () => {
  it('nhận id hợp lệ hoặc null để bỏ gán', () => {
    expect(cleanEnvelopeAssignment({ envId: 'burgundy', linerId: null })).toEqual({ envId: 'burgundy', linerId: null });
    expect(cleanEnvelopeAssignment({})).toEqual({ envId: null, linerId: null });
  });
  it('id sai định dạng thì từ chối', () => {
    expect(() => cleanEnvelopeAssignment({ envId: '../x' })).toThrow(BadRequestException);
  });
});

describe('cleanPresets', () => {
  const ok = {
    envelopes: [{ id: 'rose', name: 'Hồng', color: '#c97b84', tone: 'pink' }],
    liners: [{ id: 'ink', name: 'Đen', background: '#1c1b1b', tone: 'dark' }],
  };
  it('nhận danh mục đúng', () => {
    expect(cleanPresets(ok).envelopes).toHaveLength(1);
  });
  it('màu không phải hex thì từ chối cả danh mục', () => {
    const bad = { ...ok, envelopes: [{ ...ok.envelopes[0], color: 'red' }] };
    expect(() => cleanPresets(bad)).toThrow(BadRequestException);
  });
  it('trùng mã phong bì thì từ chối', () => {
    const dup = { ...ok, envelopes: [ok.envelopes[0], { ...ok.envelopes[0], name: 'Khác' }] };
    expect(() => cleanPresets(dup)).toThrow(/Trùng mã phong bì/);
  });
  it('danh mục rỗng thì từ chối', () => {
    expect(() => cleanPresets({ envelopes: [], liners: ok.liners })).toThrow(BadRequestException);
  });
});
