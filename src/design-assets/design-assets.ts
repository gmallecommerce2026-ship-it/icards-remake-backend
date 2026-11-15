import { BadRequestException } from '@nestjs/common';

/**
 * Tài nguyên thiết kế thiệp: phông, bảng màu, hình nền, phần tử (hình khối / đồ hoạ / 3D), khung, lưới.
 * Lưu ở site_content, khóa 'design.assets'. Không cần bảng riêng hay migration.
 * Dữ liệu ở đây được BỔ SUNG vào danh sách có sẵn trong mã nguồn FE, không thay thế.
 */
export const DESIGN_ASSETS_KEY = 'design.assets';

export type DesignFont = { id: string; name: string };
export type DesignBackdropType = 'color' | 'gradient' | 'image';
export type DesignBackdrop = { id: string; name: string; type: DesignBackdropType; value: string };

/** Mức tô của một mảnh: main = màu chủ đạo của phần tử; light/dark/white = lớp sáng/tối để tạo khối. */
export type ElementTone = 'main' | 'light' | 'dark' | 'white';
export type ElementPart = { d: string; tone?: ElementTone };
export type DesignElementCategory = 'shape' | 'graphic' | '3d';
/** Phần tử vector: các mảnh path trong khung 100×100. stroke = chỉ vẽ viền (đường kẻ, dấu tích). */
export type DesignElement = {
  id: string;
  name: string;
  category: DesignElementCategory;
  group: string;
  color: string;
  stroke?: boolean;
  parts: ElementPart[];
};
/** Khung ảnh: tỉ lệ + hoặc đường path chuẩn hoá 0–1, hoặc bo góc CSS (radius). */
export type DesignFrame = { id: string; name: string; ratio: number; d?: string; radius?: string };
/** Lưới: mỗi ô là [x, y, w, h] chuẩn hoá 0–1. */
export type DesignGrid = { id: string; name: string; cells: number[][] };

export type DesignAssets = {
  fonts: DesignFont[];
  colors: string[];
  backdrops: DesignBackdrop[];
  elements: DesignElement[];
  frames: DesignFrame[];
  grids: DesignGrid[];
};

/** Danh mục hiển thị trong trình thiết kế. Các mục không có phần tử (ảnh, video, âm thanh...) cần tải lên hoặc tính năng riêng. */
export const DESIGN_ELEMENT_CATEGORIES = [
  { id: 'shape', label: 'Hình dạng' },
  { id: 'graphic', label: 'Đồ họa' },
  { id: 'motion', label: 'Hiệu ứng động' },
  { id: 'photo', label: 'Ảnh' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Âm thanh' },
  { id: 'chart', label: 'Biểu đồ' },
  { id: 'frame', label: 'Khung' },
  { id: 'grid', label: 'Lưới' },
  { id: 'mockup', label: 'Mockup' },
  { id: '3d', label: '3D' },
] as const;

const MAX_FONTS = 60;
const MAX_COLORS = 200;
const MAX_BACKDROPS = 100;
const MAX_ELEMENTS = 500;
const MAX_FRAMES = 100;
const MAX_GRIDS = 100;
const MAX_PARTS = 12;
const MAX_CELLS = 16;

const ID = /^[a-z0-9-]{1,40}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
/** Tên phông Google: chỉ chữ, số và khoảng trắng. */
const FONT_NAME = /^[A-Za-z0-9 ]{1,60}$/;
const GRADIENT = /^(linear|radial)-gradient\([^;{}<>"'\\]{1,400}\)$/i;
const FORBIDDEN = /url\(|expression|@import/i;
const IMAGE_URL = /^https:\/\/[^\s"'<>\\]{1,500}$/;
/** Dữ liệu path SVG: chỉ các lệnh và số, không có gì khác. */
const PATH = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s+-]{1,3000}$/;
const RADIUS = /^[0-9.%\s/]{1,40}$/;
const TONES: readonly ElementTone[] = ['main', 'light', 'dark', 'white'];
const CATEGORIES: readonly DesignElementCategory[] = ['shape', 'graphic', '3d'];

const fail = (msg: string): never => {
  throw new BadRequestException(msg);
};
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (v: unknown, what: string): unknown[] => (Array.isArray(v) ? v : fail(`Thiếu danh sách ${what}`));

function uniqueIds(items: { id: string }[], what: string) {
  if (new Set(items.map((x) => x.id)).size !== items.length) fail(`Trùng mã ${what}`);
}

function cleanFont(o: Record<string, unknown>, i: number): DesignFont {
  const id = str(o.id, 40);
  const name = str(o.name, 60);
  if (!ID.test(id)) fail(`Mã font \"${id || i + 1}\" chỉ gồm chữ thường, số và dấu gạch ngang`);
  if (!name || !FONT_NAME.test(name)) fail(`Tên font \"${id}\" chỉ gồm chữ, số và khoảng trắng, trùng tên trên Google Fonts`);
  return { id, name };
}

function cleanBackdrop(o: Record<string, unknown>, i: number): DesignBackdrop {
  const id = str(o.id, 40);
  const name = str(o.name, 60);
  const value = str(o.value, 600);
  if (!ID.test(id)) fail(`Mã hình nền \"${id || i + 1}\" chỉ gồm chữ thường, số và dấu gạch ngang`);
  if (!name) fail(`Tên hình nền \"${id}\" không được để trống`);
  if (o.type === 'color') {
    if (!HEX.test(value)) fail(`Hình nền \"${name}\": màu phải dạng #RRGGBB`);
  } else if (o.type === 'gradient') {
    if (!GRADIENT.test(value) || FORBIDDEN.test(value)) fail(`Hình nền \"${name}\": gradient CSS không hợp lệ`);
  } else if (o.type === 'image') {
    if (!IMAGE_URL.test(value)) fail(`Hình nền \"${name}\": cần đường dẫn ảnh https`);
  } else {
    fail(`Hình nền \"${name}\": loại phải là color, gradient hoặc image`);
  }
  return { id, name, type: o.type as DesignBackdropType, value };
}

function cleanElement(o: Record<string, unknown>, i: number): DesignElement {
  const id = str(o.id, 40);
  const name = str(o.name, 60);
  const group = str(o.group, 60);
  if (!ID.test(id)) fail(`Mã phần tử \"${id || i + 1}\" chỉ gồm chữ thường, số và dấu gạch ngang`);
  if (!name) fail(`Tên phần tử \"${id}\" không được để trống`);
  if (!CATEGORIES.includes(o.category as DesignElementCategory)) fail(`Phần tử \"${name}\": loại phải là shape, graphic hoặc 3d`);
  if (typeof o.color !== 'string' || !HEX.test(o.color)) fail(`Phần tử \"${name}\": màu phải dạng #RRGGBB`);
  if (o.stroke !== undefined && typeof o.stroke !== 'boolean') fail(`Phần tử \"${name}\": stroke phải là đúng/sai`);
  const partsIn = list(o.parts, `mảnh của phần tử \"${name}\"`);
  if (partsIn.length === 0 || partsIn.length > MAX_PARTS) fail(`Phần tử \"${name}\": cần từ 1 đến ${MAX_PARTS} mảnh`);
  const parts: ElementPart[] = partsIn.map((item) => {
    const p = isObj(item) ? item : fail(`Phần tử \"${name}\": mảnh không hợp lệ`);
    if (typeof p.d !== 'string' || !PATH.test(p.d.trim())) fail(`Phần tử \"${name}\": dữ liệu path không hợp lệ`);
    const d = (p.d as string).trim();
    if (p.tone === undefined) return { d };
    if (!TONES.includes(p.tone as ElementTone)) fail(`Phần tử \"${name}\": tone không hợp lệ`);
    return { d, tone: p.tone as ElementTone };
  });
  return {
    id,
    name,
    category: o.category as DesignElementCategory,
    group: group || 'Khác',
    color: (o.color as string).toLowerCase(),
    ...(o.stroke ? { stroke: true } : {}),
    parts,
  };
}

function cleanFrame(o: Record<string, unknown>): DesignFrame {
  const id = str(o.id, 40);
  const name = str(o.name, 60);
  if (!ID.test(id)) fail(`Mã khung \"${id}\" chỉ gồm chữ thường, số và dấu gạch ngang`);
  if (!name) fail(`Tên khung \"${id}\" không được để trống`);
  const ratio = o.ratio;
  if (typeof ratio !== 'number' || !(ratio >= 0.2 && ratio <= 3)) fail(`Khung \"${name}\": tỉ lệ phải từ 0.2 đến 3`);
  const out: DesignFrame = { id, name, ratio: ratio as number };
  if (o.d !== undefined) {
    if (typeof o.d !== 'string' || !PATH.test(o.d.trim())) fail(`Khung \"${name}\": đường path không hợp lệ`);
    out.d = (o.d as string).trim();
  } else if (o.radius !== undefined) {
    if (typeof o.radius !== 'string' || !RADIUS.test(o.radius.trim())) fail(`Khung \"${name}\": bo góc không hợp lệ`);
    out.radius = (o.radius as string).trim();
  } else {
    fail(`Khung \"${name}\": cần path (d) hoặc bo góc (radius)`);
  }
  return out;
}

function cleanGrid(o: Record<string, unknown>): DesignGrid {
  const id = str(o.id, 40);
  const name = str(o.name, 60);
  if (!ID.test(id)) fail(`Mã lưới \"${id}\" chỉ gồm chữ thường, số và dấu gạch ngang`);
  if (!name) fail(`Tên lưới \"${id}\" không được để trống`);
  const cells = list(o.cells, `ô của lưới \"${name}\"`);
  if (cells.length === 0 || cells.length > MAX_CELLS) fail(`Lưới \"${name}\": cần từ 1 đến ${MAX_CELLS} ô`);
  const out = cells.map((c) => {
    if (!Array.isArray(c) || c.length !== 4 || !c.every((n) => typeof n === 'number' && n >= 0 && n <= 1)) {
      fail(`Lưới \"${name}\": mỗi ô là [x, y, w, h] với giá trị từ 0 đến 1`);
    }
    return c as number[];
  });
  return { id, name, cells: out };
}

/** Kiểm tra nghiêm ngặt dữ liệu admin gửi lên. Lỗi trả về tiếng Việt. Thiếu mục nào thì coi như rỗng. */
export function cleanDesignAssets(raw: unknown): DesignAssets {
  if (!isObj(raw)) fail('Dữ liệu tài nguyên không hợp lệ');
  const b = raw as Record<string, unknown>;
  const fontsIn = list(b.fonts ?? [], 'font');
  const colorsIn = list(b.colors ?? [], 'màu');
  const backdropsIn = list(b.backdrops ?? [], 'hình nền');
  const elementsIn = list(b.elements ?? [], 'phần tử');
  const framesIn = list(b.frames ?? [], 'khung');
  const gridsIn = list(b.grids ?? [], 'lưới');
  if (fontsIn.length > MAX_FONTS) fail(`Tối đa ${MAX_FONTS} font`);
  if (colorsIn.length > MAX_COLORS) fail(`Tối đa ${MAX_COLORS} màu`);
  if (backdropsIn.length > MAX_BACKDROPS) fail(`Tối đa ${MAX_BACKDROPS} hình nền`);
  if (elementsIn.length > MAX_ELEMENTS) fail(`Tối đa ${MAX_ELEMENTS} phần tử`);
  if (framesIn.length > MAX_FRAMES) fail(`Tối đa ${MAX_FRAMES} khung`);
  if (gridsIn.length > MAX_GRIDS) fail(`Tối đa ${MAX_GRIDS} lưới`);

  const fonts = fontsIn.map((f, i) => (isObj(f) ? cleanFont(f, i) : fail(`Font ${i + 1} không hợp lệ`)));
  const colors = colorsIn.map((c, i) => {
    if (typeof c !== 'string' || !HEX.test(c)) fail(`Màu thứ ${i + 1} phải dạng #RRGGBB`);
    return (c as string).toLowerCase();
  });
  const backdrops = backdropsIn.map((x, i) => (isObj(x) ? cleanBackdrop(x, i) : fail(`Hình nền ${i + 1} không hợp lệ`)));
  const elements = elementsIn.map((x, i) => (isObj(x) ? cleanElement(x, i) : fail(`Phần tử ${i + 1} không hợp lệ`)));
  const frames = framesIn.map((x) => (isObj(x) ? cleanFrame(x) : fail('Khung không hợp lệ')));
  const grids = gridsIn.map((x) => (isObj(x) ? cleanGrid(x) : fail('Lưới không hợp lệ')));

  uniqueIds(fonts, 'font');
  if (new Set(colors).size !== colors.length) fail('Có màu bị trùng');
  uniqueIds(backdrops, 'hình nền');
  uniqueIds(elements, 'phần tử');
  uniqueIds(frames, 'khung');
  uniqueIds(grids, 'lưới');
  return { fonts, colors, backdrops, elements, frames, grids };
}

/** Đọc dữ liệu đã lưu (trang công khai và trình thiết kế): bỏ mục hỏng thay vì báo lỗi. */
export function sanitizeDesignAssets(raw: unknown): DesignAssets {
  const r = isObj(raw) ? raw : {};
  const keep = <T>(items: unknown, pick: (o: Record<string, unknown>, i: number) => T, max: number): T[] => {
    const out: T[] = [];
    for (const [i, x] of (Array.isArray(items) ? items : []).entries()) {
      try {
        if (isObj(x)) out.push(pick(x, i));
      } catch {
        /* bỏ mục hỏng */
      }
    }
    return out.slice(0, max);
  };
  const dedupe = <T extends { id: string }>(items: T[]) => items.filter((x, i) => items.findIndex((y) => y.id === x.id) === i);
  return {
    fonts: dedupe(keep(r.fonts, cleanFont, MAX_FONTS)),
    colors: [...new Set((Array.isArray(r.colors) ? r.colors : []).filter((c): c is string => typeof c === 'string' && HEX.test(c)).map((c) => c.toLowerCase()))].slice(0, MAX_COLORS),
    backdrops: dedupe(keep(r.backdrops, cleanBackdrop, MAX_BACKDROPS)),
    elements: dedupe(keep(r.elements, cleanElement, MAX_ELEMENTS)),
    frames: dedupe(keep(r.frames, (o) => cleanFrame(o), MAX_FRAMES)),
    grids: dedupe(keep(r.grids, (o) => cleanGrid(o), MAX_GRIDS)),
  };
}
