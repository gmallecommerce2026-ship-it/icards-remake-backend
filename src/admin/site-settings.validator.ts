import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { HeaderNavItem, HomeBanner } from '../settings/site-config.types.js';

/** Các trang có thể đặt banner. Giữ đồng bộ với FE (trang chủ, chuyên nghiệp, tất cả). */
export const BANNER_PAGES = ['home', 'templates', 'shop', 'services', 'blog', 'professional', 'all'] as const;

const MAX_BANNERS = 30;
const MAX_NAV = 50;
const MAX_DEPTH = 3;

const newId = () => randomBytes(6).toString('hex');

const text = (v: unknown, max: number, field: string): string => {
  if (v === undefined || v === null) return '';
  if (typeof v !== 'string') throw new BadRequestException(`${field} phải là chuỗi.`);
  if (v.length > max) throw new BadRequestException(`${field} quá dài (tối đa ${max} ký tự).`);
  return v.trim();
};

/** Chỉ cho phép đường dẫn nội bộ (/...) hoặc https. Chặn javascript:, data:, http:... */
const safeUrl = (v: string, field: string): string => {
  if (!v) return '';
  if (v.startsWith('/') && !v.startsWith('//')) return v;
  if (/^https:\/\/[^\s]+$/i.test(v)) return v;
  throw new BadRequestException(`${field} phải bắt đầu bằng / hoặc https://`);
};

const validId = (v: unknown): string =>
  typeof v === 'string' && /^[a-zA-Z0-9_-]{1,60}$/.test(v) ? v : newId();

const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export function cleanBanners(input: unknown): HomeBanner[] {
  if (!Array.isArray(input)) throw new BadRequestException('Danh sách banner không hợp lệ.');
  if (input.length > MAX_BANNERS) throw new BadRequestException(`Tối đa ${MAX_BANNERS} banner.`);
  return input.map((raw, i) => {
    const o = asObject(raw);
    const label = `Banner ${i + 1}`;
    const name = text(o.name, 100, `${label}: tên`);
    if (!name) throw new BadRequestException(`${label}: tên không được để trống.`);
    const displayPage = text(o.displayPage, 30, `${label}: trang hiển thị`) || 'home';
    if (!(BANNER_PAGES as readonly string[]).includes(displayPage)) {
      throw new BadRequestException(`${label}: trang hiển thị "${displayPage}" không hợp lệ.`);
    }
    const imgSrc = safeUrl(text(o.imgSrc, 2000, `${label}: ảnh`), `${label}: ảnh`);
    const link = safeUrl(text(o.link, 500, `${label}: liên kết`), `${label}: liên kết`);
    return {
      id: validId(o.id),
      name,
      displayPage,
      isEnabled: o.isEnabled === true,
      imgSrc: imgSrc || null,
      link: link || undefined,
    };
  });
}

export function cleanNav(input: unknown, depth = 1): HeaderNavItem[] {
  if (input === undefined || input === null) return [];
  if (!Array.isArray(input)) throw new BadRequestException('Danh sách menu không hợp lệ.');
  if (depth > MAX_DEPTH) {
    if (input.length) throw new BadRequestException(`Menu chỉ được lồng tối đa ${MAX_DEPTH} cấp.`);
    return [];
  }
  if (input.length > MAX_NAV) throw new BadRequestException(`Tối đa ${MAX_NAV} mục menu mỗi cấp.`);
  return input.map((raw, i) => {
    const o = asObject(raw);
    const title = text(o.title, 120, 'Tên menu');
    if (!title) throw new BadRequestException('Tên menu không được để trống.');
    const path = safeUrl(text(o.path, 500, `Menu "${title}": đường dẫn`), `Menu "${title}": đường dẫn`);
    return {
      id: validId(o.id),
      title,
      path: path || undefined,
      order: i + 1,
      isVisible: o.isVisible !== false,
      children: cleanNav(o.children, depth + 1),
    };
  });
}
