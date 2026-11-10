import { BadRequestException } from '@nestjs/common';
import {
  TEMPLATE_FORMATS,
  TEMPLATE_ORIENTATIONS,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateFormat,
  type TemplateOrientation,
} from '../catalog/catalog.types.js';
import type { TemplateDesign } from '../templates/schemas/invitation-template.schema.js';
import { sanitizePresets, type EnvelopePresets } from '../templates/envelope-presets.js';

/** Kiểm tra dữ liệu ghi từ dashboard quản trị mẫu thiệp, phong bì. Mọi lỗi trả về BadRequest với thông báo tiếng Việt. */

const SLUG = /^[a-z0-9-]{1,100}$/;
const ENV_ID = /^[a-z0-9-]{1,40}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
/** Giới hạn thiết kế lưu một mẫu (ký tự JSON). Khớp với giới hạn body 15MB của API. */
export const MAX_DESIGN_CHARS = 12 * 1024 * 1024;
const MAX_FEATURES = 20;

type Obj = Record<string, unknown>;
const fail = (msg: string): never => {
  throw new BadRequestException(msg);
};

function asObject(raw: unknown, what = 'Dữ liệu'): Obj {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail(`${what} không hợp lệ`);
  return raw as Obj;
}

function text(v: unknown, field: string, max: number, required: boolean): string | undefined {
  if (v === undefined) {
    if (required) fail(`Thiếu ${field}`);
    return undefined;
  }
  if (typeof v !== 'string') fail(`${field} phải là chuỗi`);
  const s = (v as string).trim();
  if (!s) {
    if (required) fail(`Thiếu ${field}`);
    return undefined;
  }
  if (s.length > max) fail(`${field} tối đa ${max} ký tự`);
  return s;
}

function oneOf<T extends string>(v: unknown, list: readonly T[], field: string): T | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== 'string' || !(list as readonly string[]).includes(v)) fail(`${field} không hợp lệ`);
  return v as T;
}

function price(v: unknown): number | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 100_000_000) fail('Giá không hợp lệ');
  return v as number;
}

export interface TemplateInput {
  slug?: string;
  name?: string;
  category?: TemplateCategory;
  /** Mã nút trong cây danh mục (slug của nút). null = bỏ gán nhóm. */
  categorySlug?: string | null;
  tagline?: string;
  description?: string;
  price?: number;
  format?: TemplateFormat;
  orientation?: TemplateOrientation;
  isPublished?: boolean;
  features?: string[];
}

/**
 * Dữ liệu thông tin mẫu. create = true: các trường bắt buộc phải có. create = false: chỉ kiểm tra trường được gửi.
 */
export function cleanTemplateInput(raw: unknown, create: boolean): TemplateInput {
  const b = asObject(raw);
  const out: TemplateInput = {};

  const slug = text(b.slug, 'Mã mẫu (slug)', 100, create);
  if (slug !== undefined) {
    if (!SLUG.test(slug)) fail('Mã mẫu chỉ gồm chữ thường, số và dấu gạch ngang');
    out.slug = slug;
  }
  const name = text(b.name, 'Tên mẫu', 200, create);
  if (name !== undefined) out.name = name;
  const category = oneOf(b.category, TEMPLATE_CATEGORIES, 'Loại thiệp');
  if (category !== undefined) out.category = category;
  else if (create) fail('Thiếu loại thiệp');

  if (b.categorySlug === null) out.categorySlug = null;
  else if (b.categorySlug !== undefined) {
    const c = text(b.categorySlug, 'Nhóm danh mục', 100, false);
    if (c !== undefined) {
      if (!SLUG.test(c)) fail('Nhóm danh mục không hợp lệ');
      out.categorySlug = c;
    }
  } else if (create) fail('Thiếu nhóm danh mục');

  const tagline = text(b.tagline, 'Mô tả ngắn', 300, create);
  if (tagline !== undefined) out.tagline = tagline;
  const description = text(b.description, 'Mô tả', 5000, create);
  if (description !== undefined) out.description = description;

  const p = price(b.price);
  if (p !== undefined) out.price = p;
  else if (create) out.price = 0;

  const format = oneOf(b.format, TEMPLATE_FORMATS, 'Kiểu thiệp');
  if (format !== undefined) out.format = format;
  const orientation = oneOf(b.orientation, TEMPLATE_ORIENTATIONS, 'Kiểu dáng');
  if (orientation !== undefined) out.orientation = orientation;
  if (create) {
    out.format = out.format ?? 'folding';
    out.orientation = out.orientation ?? 'portrait';
  }

  if (b.isPublished !== undefined) {
    if (typeof b.isPublished !== 'boolean') fail('Trạng thái đăng phải là đúng/sai');
    out.isPublished = b.isPublished as boolean;
  } else if (create) out.isPublished = false;

  if (b.features !== undefined) {
    if (!Array.isArray(b.features) || b.features.length > MAX_FEATURES) fail('Danh sách tính năng không hợp lệ');
    out.features = (b.features as unknown[]).map((f, i) => text(f, `Tính năng ${i + 1}`, 200, true) as string);
  } else if (create) out.features = [];

  return out;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/**
 * Thiết kế canvas của studio: pages là object theo từng trang (cover/inside/back), mỗi trang là mảng phần tử;
 * backdrops là object theo trang. Kèm format và orientation. Giới hạn dung lượng.
 */
export function cleanDesign(raw: unknown): TemplateDesign {
  const b = asObject(raw, 'Thiết kế');
  if (!isPlainObject(b.pages) || !isPlainObject(b.backdrops)) fail('Thiết kế thiếu pages hoặc backdrops');
  if (!Object.values(b.pages as Record<string, unknown>).every((list) => Array.isArray(list))) fail('Trang thiết kế không hợp lệ');
  const format = text(b.format, 'Kiểu thiệp', 20, true) as string;
  const orientation = text(b.orientation, 'Kiểu dáng', 20, true) as string;
  const design: TemplateDesign = { pages: b.pages as Record<string, unknown>, backdrops: b.backdrops as Record<string, unknown>, format, orientation };
  if (JSON.stringify(design).length > MAX_DESIGN_CHARS) fail('Thiết kế quá lớn (tối đa 12MB). Hãy giảm kích thước ảnh.');
  return design;
}

/** Gán phong bì/lớp lót cho mẫu. null = bỏ gán (dùng mặc định). Kiểm tra tồn tại ở service. */
export function cleanEnvelopeAssignment(raw: unknown): { envId: string | null; linerId: string | null } {
  const b = asObject(raw);
  const pick = (v: unknown, field: string): string | null => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v !== 'string' || !ENV_ID.test(v)) fail(`${field} không hợp lệ`);
    return v as string;
  };
  return { envId: pick(b.envId, 'Phong bì'), linerId: pick(b.linerId, 'Lớp lót') };
}

/** Danh mục phong bì và lớp lót. Từ chối cả danh sách nếu có mục sai (không lặng lẽ bỏ). */
export function cleanPresets(raw: unknown): EnvelopePresets {
  const b = asObject(raw, 'Danh mục phong bì');
  const envelopesIn = Array.isArray(b.envelopes) ? b.envelopes : fail('Thiếu danh sách phong bì');
  const linersIn = Array.isArray(b.liners) ? b.liners : fail('Thiếu danh sách lớp lót');
  if (envelopesIn.length === 0 || linersIn.length === 0) fail('Cần ít nhất một phong bì và một lớp lót');
  for (const e of envelopesIn) {
    const o = asObject(e, 'Phong bì');
    if (typeof o.color !== 'string' || !HEX.test(o.color)) fail(`Màu phong bì "${String(o.name ?? o.id)}" phải dạng #RRGGBB`);
  }
  const clean = sanitizePresets(b);
  if (clean.envelopes.length !== envelopesIn.length || clean.liners.length !== linersIn.length) {
    fail('Có phong bì hoặc lớp lót không hợp lệ (mã, tên, màu hoặc nền sai định dạng)');
  }
  if (new Set(clean.envelopes.map((e) => e.id)).size !== clean.envelopes.length) fail('Trùng mã phong bì');
  if (new Set(clean.liners.map((l) => l.id)).size !== clean.liners.length) fail('Trùng mã lớp lót');
  return clean;
}
