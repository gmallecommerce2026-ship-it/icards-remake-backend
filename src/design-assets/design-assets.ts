import { BadRequestException } from '@nestjs/common';

/**
 * Tài nguyên dùng để thiết kế thiệp: font thêm, bảng màu thêm, hình nền thêm.
 * Lưu ở site_content, khóa 'design.assets'. Không cần bảng riêng hay migration.
 * Các tài nguyên có sẵn trong mã nguồn FE (sticker, khung, hình hình học...) vẫn giữ nguyên;
 * dữ liệu ở đây chỉ BỔ SUNG vào danh sách có sẵn.
 */
export const DESIGN_ASSETS_KEY = 'design.assets';

/** `name` là tên phông Google Fonts (cũng là tên phông dùng trong thiệp). */
export type DesignFont = { id: string; name: string };
export type DesignBackdropType = 'color' | 'gradient' | 'image';
export type DesignBackdrop = { id: string; name: string; type: DesignBackdropType; value: string };
export type DesignAssets = { fonts: DesignFont[]; colors: string[]; backdrops: DesignBackdrop[] };

export const DESIGN_ASSETS_SEED: DesignAssets = { fonts: [], colors: [], backdrops: [] };

const MAX_FONTS = 60;
const MAX_COLORS = 200;
const MAX_BACKDROPS = 100;

const ID = /^[a-z0-9-]{1,40}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
/** Tên phông Google: chỉ chữ, số và khoảng trắng, để ghép vào URL an toàn. */
const GOOGLE_FAMILY = /^[A-Za-z0-9 ]{1,60}$/;
/** Gradient CSS: không chứa dấu nguy hiểm, không gọi url(). */
const GRADIENT = /^(linear|radial)-gradient\([^;{}<>"'\\]{1,400}\)$/i;
const FORBIDDEN = /url\(|expression|@import/i;
/** Ảnh nền: chỉ https và không có ký tự thoát chuỗi. */
const IMAGE_URL = /^https:\/\/[^\s"'<>\\]{1,500}$/;

const fail = (msg: string): never => {
  throw new BadRequestException(msg);
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Kiểm tra nghiêm ngặt dữ liệu admin gửi lên. Lỗi trả về tiếng Việt. */
export function cleanDesignAssets(raw: unknown): DesignAssets {
  if (!isObj(raw)) fail('Dữ liệu tài nguyên không hợp lệ');
  const b = raw as Record<string, unknown>;

  const fontsIn = Array.isArray(b.fonts) ? b.fonts : fail('Thiếu danh sách font');
  if (fontsIn.length > MAX_FONTS) fail(`Tối đa ${MAX_FONTS} font`);
  const fonts: DesignFont[] = fontsIn.map((f, i) => {
    if (!isObj(f)) fail(`Font ${i + 1} không hợp lệ`);
    const o = f as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';
    const name = typeof o.name === 'string' ? o.name.trim() : '';
    if (!ID.test(id)) fail(`Mã font \"${id || i + 1}\" chỉ gồm chữ thường, số và dấu gạch ngang`);
    if (!name || name.length > 60 || !GOOGLE_FAMILY.test(name)) {
      fail(`Tên font \"${id}\" chỉ gồm chữ, số và khoảng trắng (1–60 ký tự), trùng tên phông trên Google Fonts`);
    }
    return { id, name };
  });
  if (new Set(fonts.map((f) => f.id)).size !== fonts.length) fail('Trùng mã font');

  const colorsIn = Array.isArray(b.colors) ? b.colors : fail('Thiếu danh sách màu');
  if (colorsIn.length > MAX_COLORS) fail(`Tối đa ${MAX_COLORS} màu`);
  const colors = colorsIn.map((c, i) => {
    if (typeof c !== 'string' || !HEX.test(c)) fail(`Màu thứ ${i + 1} phải dạng #RRGGBB`);
    return (c as string).toLowerCase();
  });
  if (new Set(colors).size !== colors.length) fail('Có màu bị trùng');

  const backdropsIn = Array.isArray(b.backdrops) ? b.backdrops : fail('Thiếu danh sách hình nền');
  if (backdropsIn.length > MAX_BACKDROPS) fail(`Tối đa ${MAX_BACKDROPS} hình nền`);
  const backdrops: DesignBackdrop[] = backdropsIn.map((x, i) => {
    if (!isObj(x)) fail(`Hình nền ${i + 1} không hợp lệ`);
    const o = x as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id.trim() : '';
    const name = typeof o.name === 'string' ? o.name.trim() : '';
    const type = o.type;
    const value = typeof o.value === 'string' ? o.value.trim() : '';
    if (!ID.test(id)) fail(`Mã hình nền \"${id || i + 1}\" chỉ gồm chữ thường, số và dấu gạch ngang`);
    if (!name || name.length > 60) fail(`Tên hình nền \"${id}\" không hợp lệ (1–60 ký tự)`);
    if (type === 'color') {
      if (!HEX.test(value)) fail(`Hình nền \"${name}\": màu phải dạng #RRGGBB`);
    } else if (type === 'gradient') {
      if (!GRADIENT.test(value) || FORBIDDEN.test(value)) {
        fail(`Hình nền \"${name}\": gradient CSS không hợp lệ`);
      }
    } else if (type === 'image') {
      if (!IMAGE_URL.test(value)) fail(`Hình nền \"${name}\": cần đường dẫn ảnh https`);
    } else {
      fail(`Hình nền \"${name}\": loại phải là color, gradient hoặc image`);
    }
    return { id, name, type: type as DesignBackdropType, value };
  });
  if (new Set(backdrops.map((x) => x.id)).size !== backdrops.length) fail('Trùng mã hình nền');

  return { fonts, colors, backdrops };
}

/** Đọc dữ liệu đã lưu (cho trang công khai và trình thiết kế): bỏ mục hỏng thay vì báo lỗi. */
export function sanitizeDesignAssets(raw: unknown): DesignAssets {
  const r = isObj(raw) ? raw : {};
  const fonts: DesignFont[] = [];
  for (const f of Array.isArray(r.fonts) ? r.fonts : []) {
    try { fonts.push(cleanDesignAssets({ fonts: [f], colors: [], backdrops: [] }).fonts[0]); } catch { /* bỏ mục hỏng */ }
  }
  const colors: string[] = [];
  for (const c of Array.isArray(r.colors) ? r.colors : []) {
    if (typeof c === 'string' && HEX.test(c)) colors.push(c.toLowerCase());
  }
  const backdrops: DesignBackdrop[] = [];
  for (const x of Array.isArray(r.backdrops) ? r.backdrops : []) {
    try { backdrops.push(cleanDesignAssets({ fonts: [], colors: [], backdrops: [x] }).backdrops[0]); } catch { /* bỏ mục hỏng */ }
  }
  return {
    fonts: fonts.slice(0, MAX_FONTS),
    colors: [...new Set(colors)].slice(0, MAX_COLORS),
    backdrops: backdrops.slice(0, MAX_BACKDROPS),
  };
}
