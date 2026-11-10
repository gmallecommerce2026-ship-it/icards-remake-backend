import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { BannerGroup, BannerItem, HeaderNavItem } from '../settings/site-config.types.js';
import { isBannerLayout, isBannerPage, isBannerSlot } from '../settings/banner-layout.js';

const MAX_GROUPS = 200;
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

const validId = (v: unknown): string | undefined =>
  typeof v === 'string' && /^[a-zA-Z0-9_-]{1,60}$/.test(v) ? v : undefined;

const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/**
 * Ghi nhóm banner. Số banner trong mỗi nhóm không giới hạn; chỉ chặn số nhóm bất thường để tránh payload quá lớn.
 * Mọi id đều duy nhất trong toàn bộ danh sách; id trùng hoặc sai định dạng được cấp mới.
 */
export function cleanBannerGroups(input: unknown): BannerGroup[] {
  if (!Array.isArray(input)) throw new BadRequestException('Danh sách nhóm banner không hợp lệ.');
  if (input.length > MAX_GROUPS) throw new BadRequestException(`Tối đa ${MAX_GROUPS} nhóm banner.`);

  const used = new Set<string>();
  const uniqueId = (raw: unknown): string => {
    let id = validId(raw) ?? newId();
    while (used.has(id)) id = newId();
    used.add(id);
    return id;
  };

  return input.map((raw, i): BannerGroup => {
    const o = asObject(raw);
    const label = `Nhóm ${i + 1}`;
    const name = text(o.name, 100, `${label}: tên`);
    if (!name) throw new BadRequestException(`${label}: tên không được để trống.`);

    const page = text(o.page, 30, `${label}: trang`);
    if (!isBannerPage(page)) throw new BadRequestException(`${label}: trang "${page}" không hợp lệ.`);

    const slot = text(o.slot, 10, `${label}: vị trí`) || 'top';
    if (!isBannerSlot(slot)) throw new BadRequestException(`${label}: vị trí "${slot}" không hợp lệ.`);

    const layout = text(o.layout, 20, `${label}: bố cục`) || 'slider';
    if (!isBannerLayout(layout)) throw new BadRequestException(`${label}: bố cục "${layout}" không hợp lệ.`);

    if (!Array.isArray(o.banners)) throw new BadRequestException(`${label}: danh sách banner không hợp lệ.`);

    const banners: BannerItem[] = o.banners.map((rawItem, j) => {
      const it = asObject(rawItem);
      const bl = `${label}, banner ${j + 1}`;
      const title = text(it.title, 120, `${bl}: tiêu đề`);
      const itemName = text(it.name, 100, `${bl}: tên`) || title || 'Banner';
      const imgSrc = safeUrl(text(it.imgSrc, 2000, `${bl}: ảnh`), `${bl}: ảnh`);
      const link = safeUrl(text(it.link, 500, `${bl}: liên kết`), `${bl}: liên kết`);
      return {
        id: uniqueId(it.id),
        name: itemName,
        eyebrow: text(it.eyebrow, 60, `${bl}: nhãn nhỏ`) || undefined,
        title: title || undefined,
        text: text(it.text, 300, `${bl}: mô tả`) || undefined,
        ctaLabel: text(it.ctaLabel, 40, `${bl}: chữ nút`) || undefined,
        imgSrc: imgSrc || null,
        link: link || undefined,
        isEnabled: it.isEnabled === true,
      };
    });

    return {
      id: uniqueId(o.id),
      name,
      page,
      slot,
      layout,
      isEnabled: o.isEnabled === true,
      banners,
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
      id: validId(o.id) ?? newId(),
      title,
      path: path || undefined,
      order: i + 1,
      isVisible: o.isVisible !== false,
      children: cleanNav(o.children, depth + 1),
    };
  });
}
