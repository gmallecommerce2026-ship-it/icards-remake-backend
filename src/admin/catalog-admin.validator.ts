import { BadRequestException } from '@nestjs/common';
import { PAGE_COPY_FIELDS, type PageCopy } from '../settings/page-copy.js';
import {
  SHIPPING_KINDS,
  SHOP_CATEGORY_IDS,
  THUMB_KINDS,
  type PostBlock,
  type ProductVariant,
  type LabeledValue,
  type ShippingKind,
  type ShopCategory,
  type ThumbKind,
  type Tone,
} from '../catalog/catalog.types.js';

// Kiểm tra dữ liệu ghi từ dashboard cho sản phẩm, dịch vụ, bài viết, chữ trang, chuyên mục blog.
// Sai thì ném BadRequestException với thông báo tiếng Việt để hiển thị ngay trên form.

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_LIST = 50;

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/** Chuỗi bắt buộc hoặc tuỳ chọn. Rỗng = '' khi không bắt buộc. */
function str(v: unknown, max: number, field: string, required = false): string {
  if (v === undefined || v === null) v = '';
  if (typeof v !== 'string') throw new BadRequestException(`${field} phải là chuỗi.`);
  const t = v.trim();
  if (required && !t) throw new BadRequestException(`${field} không được để trống.`);
  if (t.length > max) throw new BadRequestException(`${field} quá dài (tối đa ${max} ký tự).`);
  return t;
}

function int(v: unknown, field: string, min: number, max: number, fallback = 0): number {
  if (v === undefined || v === null || v === '') return fallback;
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isInteger(n)) throw new BadRequestException(`${field} phải là số nguyên.`);
  if (n < min || n > max) throw new BadRequestException(`${field} phải từ ${min} đến ${max}.`);
  return n;
}

function bool(v: unknown): boolean {
  return v === true || v === 'true';
}

function slug(v: unknown, field: string): string {
  const s = str(v, 100, field, true).toLowerCase();
  if (!SLUG.test(s)) throw new BadRequestException(`${field} chỉ gồm chữ thường, số và dấu gạch ngang.`);
  return s;
}

function list(v: unknown, field: string, max: number): unknown[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) throw new BadRequestException(`${field} phải là danh sách.`);
  if (v.length > max) throw new BadRequestException(`${field}: tối đa ${max} mục.`);
  return v;
}

function strings(v: unknown, field: string, max: number, itemMax: number): string[] {
  return list(v, field, max)
    .map((x, i) => str(x, itemMax, `${field} (mục ${i + 1})`))
    .filter((x) => x.length > 0);
}

function tone(v: unknown, field: string): Tone {
  const o = obj(v);
  const bg = str(o.bg, 7, `${field}: màu nền`) || '#FFFFFF';
  const ink = str(o.ink, 7, `${field}: màu chữ`) || '#0E1B2C';
  if (!HEX.test(bg) || !HEX.test(ink)) throw new BadRequestException(`${field}: màu phải có dạng #RRGGBB.`);
  return { bg, ink };
}

/** Mã biến thể: cho phép gạch dưới để tương thích dữ liệu seed cũ. */
function idOf(v: unknown, field: string): string {
  const s = str(v, 60, field, true);
  if (!/^[a-zA-Z0-9_-]+$/.test(s)) throw new BadRequestException(`${field} chỉ gồm chữ, số, gạch dưới hoặc gạch ngang.`);
  return s;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[], field: string): T {
  if (typeof v !== 'string' || !(allowed as readonly string[]).includes(v)) {
    throw new BadRequestException(`${field} không hợp lệ.`);
  }
  return v as T;
}

/* ---------- Sản phẩm ---------- */

export interface ProductInput {
  slug: string;
  name: string;
  category: ShopCategory;
  summary: string;
  description: string;
  thumb: ThumbKind;
  tone: Tone;
  variants: ProductVariant[];
  shipping: ShippingKind;
  leadTime: string;
  highlights: string[];
  specs: LabeledValue[];
  sortOrder: number;
  isPublished: boolean;
}

export function cleanProduct(raw: unknown): ProductInput {
  const o = obj(raw);
  const variants = list(o.variants, 'Biến thể', 30).map((x, i): ProductVariant => {
    const v = obj(x);
    const label = `Biến thể ${i + 1}`;
    return {
      id: idOf(v.id ?? `v${i + 1}`, `${label}: mã`),
      label: str(v.label, 100, `${label}: tên`, true),
      price: int(v.price, `${label}: giá`, 0, 1_000_000_000),
    };
  });
  if (variants.length === 0) throw new BadRequestException('Sản phẩm cần ít nhất một biến thể có giá.');
  const specs = list(o.specs, 'Thông số', 30).map((x, i): LabeledValue => {
    const s = obj(x);
    return { label: str(s.label, 100, `Thông số ${i + 1}: tên`, true), value: str(s.value, 200, `Thông số ${i + 1}: giá trị`, true) };
  });
  return {
    slug: slug(o.slug, 'Đường dẫn (slug)'),
    name: str(o.name, 200, 'Tên sản phẩm', true),
    category: oneOf(o.category, SHOP_CATEGORY_IDS, 'Danh mục'),
    summary: str(o.summary, 500, 'Mô tả ngắn'),
    description: str(o.description, 5000, 'Mô tả chi tiết'),
    thumb: oneOf(o.thumb, THUMB_KINDS, 'Hình minh hoạ'),
    tone: tone(o.tone, 'Màu sản phẩm'),
    variants,
    shipping: oneOf(o.shipping, SHIPPING_KINDS, 'Hình thức giao'),
    leadTime: str(o.leadTime, 200, 'Thời gian chuẩn bị'),
    highlights: strings(o.highlights, 'Điểm nổi bật', 20, 200),
    specs,
    sortOrder: int(o.sortOrder, 'Thứ tự', -1_000_000, 1_000_000),
    isPublished: bool(o.isPublished),
  };
}

/* ---------- Dịch vụ ---------- */

export interface ServiceInput {
  slug: string;
  name: string;
  summary: string;
  description: string;
  priceFrom: number;
  duration: string;
  audience: string;
  includes: string[];
  sortOrder: number;
  isPublished: boolean;
}

export function cleanService(raw: unknown): ServiceInput {
  const o = obj(raw);
  return {
    slug: slug(o.slug, 'Đường dẫn (slug)'),
    name: str(o.name, 200, 'Tên dịch vụ', true),
    summary: str(o.summary, 500, 'Mô tả ngắn'),
    description: str(o.description, 5000, 'Mô tả chi tiết'),
    priceFrom: int(o.priceFrom, 'Giá từ', 0, 1_000_000_000),
    duration: str(o.duration, 100, 'Thời lượng'),
    audience: str(o.audience, 200, 'Đối tượng'),
    includes: strings(o.includes, 'Bao gồm', 30, 200),
    sortOrder: int(o.sortOrder, 'Thứ tự', -1_000_000, 1_000_000),
    isPublished: bool(o.isPublished),
  };
}

/* ---------- Bài viết ---------- */

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedOn: string | null;
  readMinutes: number;
  author: string;
  tone: Tone;
  content: PostBlock[];
  isPublished: boolean;
}

function blocks(v: unknown): PostBlock[] {
  return list(v, 'Nội dung bài', 300).map((x, i): PostBlock => {
    const b = obj(x);
    const label = `Khối nội dung ${i + 1}`;
    if (b.t === 'ul') {
      const items = strings(b.items, `${label}: danh sách`, 50, 1000);
      return { t: 'ul', items };
    }
    if (b.t === 'h2' || b.t === 'p' || b.t === 'tip') {
      return { t: b.t as 'h2' | 'p' | 'tip', text: str(b.text, 5000, `${label}: nội dung`, true) };
    }
    throw new BadRequestException(`${label}: loại khối không hợp lệ.`);
  });
}

export function cleanPost(raw: unknown): PostInput {
  const o = obj(raw);
  const publishedOn = str(o.publishedOn, 10, 'Ngày đăng');
  if (publishedOn && !DATE.test(publishedOn)) throw new BadRequestException('Ngày đăng phải có dạng yyyy-mm-dd.');
  return {
    slug: slug(o.slug, 'Đường dẫn (slug)'),
    title: str(o.title, 300, 'Tiêu đề', true),
    excerpt: str(o.excerpt, 500, 'Tóm tắt'),
    category: str(o.category, 100, 'Chuyên mục'),
    publishedOn: publishedOn || null,
    readMinutes: int(o.readMinutes, 'Thời gian đọc (phút)', 0, 600),
    author: str(o.author, 120, 'Tác giả'),
    tone: tone(o.tone, 'Màu bài viết'),
    content: blocks(o.content),
    isPublished: bool(o.isPublished),
  };
}

/* ---------- Chữ trang (pageCopy) ---------- */

export function cleanPageCopy(raw: unknown): PageCopy {
  const o = obj(raw);
  const pick = <K extends string>(src: Record<string, unknown>, keys: readonly K[], label: string) =>
    Object.fromEntries(keys.map((k) => [k, str(src[k], 500, `${label}: ${k}`)])) as Record<K, string>;
  const blog = obj(o.blog);
  const keywordGroups = list(blog.keywordGroups, 'Nhóm từ khoá', 20).map((x, i) => {
    const g = obj(x);
    const label = `Nhóm từ khoá ${i + 1}`;
    const items = list(g.items, `${label}: từ khoá`, 50).map((it, j) => {
      const k = obj(it);
      return {
        keyword: str(k.keyword, 100, `${label}, từ khoá ${j + 1}`, true),
        blurb: str(k.blurb, 300, `${label}, từ khoá ${j + 1}: mô tả`),
      };
    });
    return { title: str(g.title, 100, `${label}: tên nhóm`, true), items };
  });
  return {
    shop: pick(obj(o.shop), PAGE_COPY_FIELDS.shop, 'Trang cửa hàng'),
    services: pick(obj(o.services), PAGE_COPY_FIELDS.services, 'Trang dịch vụ'),
    blog: { ...pick(blog, PAGE_COPY_FIELDS.blog, 'Trang tin tức'), keywordGroups },
  };
}

/* ---------- Chuyên mục blog ---------- */

export function cleanBlogCategories(raw: unknown): { slug: string; label: string }[] {
  const items = list(raw, 'Chuyên mục', 50).map((x, i) => {
    const o = obj(x);
    return {
      slug: slug(o.slug, `Chuyên mục ${i + 1}: đường dẫn`),
      label: str(o.label, 100, `Chuyên mục ${i + 1}: tên`, true),
    };
  });
  const seen = new Set<string>();
  for (const c of items) {
    if (seen.has(c.slug)) throw new BadRequestException(`Trùng đường dẫn chuyên mục: ${c.slug}`);
    seen.add(c.slug);
  }
  return items;
}
