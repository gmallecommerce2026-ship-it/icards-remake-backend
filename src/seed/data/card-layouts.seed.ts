// Bố cục hai mặt cho thiệp kiểu card (mặt trước + mặt sau), dùng cho mẫu sự kiện.
// Mỗi kiểu dáng (ngang / vuông / dọc) có 2 bố cục; mẫu chọn bố cục theo chỉ số (i % 2).
// Toạ độ là TỈ LỆ 0..1: x, w, sz tính theo chiều rộng thiệp; y, h tính theo chiều cao thiệp.
// Nội dung chữ được điền sẵn từ mẫu (sample), nên bố cục có thể nạp thẳng vào trình chỉnh sửa.
// Nền: mặt trước = palette.bg, mặt sau = palette.soft (FE tự áp dụng khi dựng thiệp).
import type {
  TemplateCardLayout,
  TemplateFaceElement,
  TemplateOrientation,
  TemplateSample,
} from '../../catalog/catalog.types.js';

export interface CardLayoutSource {
  /** Tiêu đề sự kiện (ghép các dòng tiêu đề của mẫu). */
  title: string;
  sample: TemplateSample;
}

const text = (
  x: number, y: number, w: number, h: number, text: string,
  o: Partial<TemplateFaceElement> = {},
): TemplateFaceElement => ({ kind: 'text', x, y, w, h, text, sz: 0.03, font: 'body', align: 'center', color: 'ink', ...o });

const shape = (
  x: number, y: number, w: number, h: number, s: TemplateFaceElement['shape'],
  fill: TemplateFaceElement['fill'] = 'soft',
): TemplateFaceElement => ({ kind: 'shape', x, y, w, h, shape: s, fill });

/** Hai dòng nội dung ngày giờ / địa điểm dùng chung cho mọi bố cục. */
const when = (s: TemplateSample) => `${s.date}\nLúc ${s.time}`;
const where = (s: TemplateSample) => `${s.place}\n${s.address}`;
const BACK_HEADING = 'Hẹn gặp bạn!';

function landscape(v: 0 | 1, { title, sample: s }: CardLayoutSource): TemplateCardLayout {
  if (v === 0) {
    // Ngang A: khối màu bên trái, tiêu đề và thông tin bên phải
    return {
      front: [
        shape(0, 0, 0.42, 1, 'rect', 'soft'),
        shape(0.12, 0.2, 0.26, 0.6, 'arch', 'accent'),
        text(0.47, 0.18, 0.46, 0.08, s.kicker, { sz: 0.03, color: 'accent', align: 'left' }),
        text(0.47, 0.28, 0.46, 0.34, title, { sz: 0.072, font: 'display', bold: true, align: 'left' }),
        text(0.47, 0.66, 0.46, 0.08, s.date, { sz: 0.03, color: 'accent', bold: true, align: 'left' }),
        text(0.47, 0.76, 0.46, 0.14, where(s), { sz: 0.027, align: 'left' }),
      ],
      back: [
        text(0.1, 0.1, 0.8, 0.2, s.message, { sz: 0.03 }),
        shape(0.3, 0.36, 0.4, 0.01, 'line', 'accent'),
        text(0.1, 0.42, 0.36, 0.3, when(s), { sz: 0.033, color: 'accent', bold: true }),
        text(0.54, 0.42, 0.36, 0.3, where(s), { sz: 0.029 }),
        text(0.1, 0.84, 0.8, 0.08, BACK_HEADING, { sz: 0.05, font: 'script', color: 'accent' }),
      ],
    };
  }
  // Ngang B: dải màu trên và dưới, tiêu đề căn giữa, khung viền ở mặt sau
  return {
    front: [
      shape(0, 0, 1, 0.08, 'rect', 'accent'),
      shape(0, 0.92, 1, 0.08, 'rect', 'accent'),
      text(0.1, 0.16, 0.8, 0.08, s.kicker, { sz: 0.03, color: 'accent' }),
      text(0.1, 0.27, 0.8, 0.32, title, { sz: 0.08, font: 'display', bold: true }),
      text(0.1, 0.63, 0.8, 0.09, s.date, { sz: 0.034, color: 'accent', bold: true }),
      text(0.1, 0.73, 0.8, 0.1, where(s), { sz: 0.028 }),
    ],
    back: [
      shape(0.06, 0.1, 0.88, 0.8, 'frame', 'accent'),
      text(0.14, 0.2, 0.72, 0.3, s.message, { sz: 0.032 }),
      text(0.14, 0.52, 0.72, 0.12, when(s), { sz: 0.033, color: 'accent', bold: true }),
      text(0.14, 0.66, 0.72, 0.14, where(s), { sz: 0.028 }),
    ],
  };
}

function square(v: 0 | 1, { title, sample: s }: CardLayoutSource): TemplateCardLayout {
  if (v === 0) {
    // Vuông A: huy hiệu tròn ở giữa, tiêu đề nằm trong vòng tròn
    return {
      front: [
        text(0.1, 0.05, 0.8, 0.07, s.kicker, { sz: 0.03, color: 'accent' }),
        shape(0.2, 0.15, 0.6, 0.52, 'circle', 'soft'),
        text(0.26, 0.28, 0.48, 0.28, title, { sz: 0.06, font: 'display', bold: true }),
        text(0.1, 0.74, 0.8, 0.08, s.date, { sz: 0.032, color: 'accent', bold: true }),
        text(0.1, 0.83, 0.8, 0.1, where(s), { sz: 0.027 }),
      ],
      back: [
        text(0.12, 0.12, 0.76, 0.28, s.message, { sz: 0.03 }),
        shape(0.35, 0.44, 0.3, 0.008, 'line', 'accent'),
        text(0.1, 0.5, 0.8, 0.14, BACK_HEADING, { sz: 0.06, font: 'script', color: 'accent' }),
        text(0.1, 0.68, 0.8, 0.1, when(s), { sz: 0.032, bold: true }),
        text(0.1, 0.8, 0.8, 0.12, where(s), { sz: 0.028 }),
      ],
    };
  }
  // Vuông B: vòm cửa ở giữa, khung viền ở mặt sau
  return {
    front: [
      text(0.1, 0.04, 0.8, 0.06, s.kicker, { sz: 0.03, color: 'accent' }),
      shape(0.22, 0.12, 0.56, 0.6, 'arch', 'soft'),
      text(0.28, 0.3, 0.44, 0.3, title, { sz: 0.055, font: 'display', bold: true }),
      text(0.1, 0.78, 0.8, 0.07, s.date, { sz: 0.032, color: 'accent', bold: true }),
      text(0.1, 0.87, 0.8, 0.06, s.place, { sz: 0.026 }),
    ],
    back: [
      shape(0.08, 0.08, 0.84, 0.84, 'frame', 'accent'),
      text(0.16, 0.2, 0.68, 0.3, s.message, { sz: 0.03 }),
      text(0.16, 0.54, 0.68, 0.1, when(s), { sz: 0.032, color: 'accent', bold: true }),
      text(0.16, 0.68, 0.68, 0.16, where(s), { sz: 0.027 }),
    ],
  };
}

function portrait(v: 0 | 1, { title, sample: s }: CardLayoutSource): TemplateCardLayout {
  if (v === 0) {
    // Dọc A: giống bìa thiệp cưới, vòm cửa phía trên, tiêu đề bên dưới
    return {
      front: [
        text(0.1, 0.14, 0.8, 0.05, s.kicker, { sz: 0.03, color: 'accent' }),
        shape(0.3, 0.22, 0.4, 0.36, 'arch', 'soft'),
        text(0.05, 0.62, 0.9, 0.16, title, { sz: 0.075, font: 'display', bold: true }),
        text(0.1, 0.8, 0.8, 0.06, s.date, { sz: 0.03, color: 'accent', bold: true }),
        text(0.1, 0.87, 0.8, 0.07, s.place, { sz: 0.028 }),
      ],
      back: [
        text(0.05, 0.1, 0.9, 0.1, BACK_HEADING, { sz: 0.06, font: 'script', color: 'accent' }),
        text(0.12, 0.24, 0.76, 0.2, s.message, { sz: 0.03 }),
        shape(0.35, 0.48, 0.3, 0.008, 'line', 'accent'),
        text(0.1, 0.54, 0.8, 0.1, when(s), { sz: 0.034, color: 'accent', bold: true }),
        text(0.1, 0.68, 0.8, 0.14, where(s), { sz: 0.03 }),
      ],
    };
  }
  // Dọc B: khung viền bao quanh, tiêu đề ở giữa trang
  return {
    front: [
      shape(0.08, 0.06, 0.84, 0.88, 'frame', 'accent'),
      text(0.12, 0.18, 0.76, 0.05, s.kicker, { sz: 0.03, color: 'accent' }),
      text(0.1, 0.34, 0.8, 0.22, title, { sz: 0.075, font: 'display', bold: true }),
      shape(0.35, 0.62, 0.3, 0.008, 'line', 'accent'),
      text(0.1, 0.68, 0.8, 0.06, s.date, { sz: 0.032, color: 'accent', bold: true }),
      text(0.1, 0.76, 0.8, 0.12, where(s), { sz: 0.028 }),
    ],
    back: [
      shape(0.08, 0.06, 0.84, 0.88, 'frame', 'accent'),
      text(0.14, 0.18, 0.72, 0.3, s.message, { sz: 0.031 }),
      text(0.14, 0.52, 0.72, 0.12, when(s), { sz: 0.033, color: 'accent', bold: true }),
      text(0.14, 0.68, 0.72, 0.18, where(s), { sz: 0.028 }),
    ],
  };
}

/** Dựng bố cục hai mặt. variant (0 | 1) chọn một trong hai bố cục của kiểu dáng. */
export function buildCardLayout(
  orientation: TemplateOrientation,
  variant: number,
  src: CardLayoutSource,
): TemplateCardLayout {
  const v = (variant % 2 === 0 ? 0 : 1) as 0 | 1;
  switch (orientation) {
    case 'landscape': return landscape(v, src);
    case 'square': return square(v, src);
    case 'portrait': return portrait(v, src);
  }
}
