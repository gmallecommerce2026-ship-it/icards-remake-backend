import { BadRequestException } from '@nestjs/common';

/** Đầu vào của "AI viết lời chúc": đã kiểm tra độ dài và giá trị để tránh lạm dụng. */
export type AiTextInput = { occasion: string; recipient?: string; tone: AiTone; count: number };
export const AI_TONES = ['trang-trong', 'vui-ve', 'lang-man', 'ngan-gon'] as const;
export type AiTone = (typeof AI_TONES)[number];

const TONE_LABEL: Record<AiTone, string> = {
  'trang-trong': 'trang trọng, lịch sự',
  'vui-ve': 'vui vẻ, thân mật',
  'lang-man': 'lãng mạn, ấm áp',
  'ngan-gon': 'ngắn gọn, súc tích',
};

export function cleanAiTextInput(raw: unknown): AiTextInput {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const occasion = typeof b.occasion === 'string' ? b.occasion.trim() : '';
  if (!occasion || occasion.length > 120) throw new BadRequestException('Cần nhập dịp (tối đa 120 ký tự)');
  const recipient = typeof b.recipient === 'string' ? b.recipient.trim() : '';
  if (recipient.length > 80) throw new BadRequestException('Tên người nhận tối đa 80 ký tự');
  const tone = AI_TONES.includes(b.tone as AiTone) ? (b.tone as AiTone) : 'trang-trong';
  const count = typeof b.count === 'number' && Number.isInteger(b.count) ? Math.min(Math.max(b.count, 1), 5) : 3;
  return { occasion, recipient: recipient || undefined, tone, count };
}

/** Prompt gửi cho mô hình. Yêu cầu trả về JSON mảng chuỗi để dễ phân tích. */
export function buildPrompt(i: AiTextInput): string {
  return [
    `Viết ${i.count} lời chúc tiếng Việt cho thiệp mời, mỗi lời 1–2 câu.`,
    `Dịp: ${i.occasion}.`,
    i.recipient ? `Người nhận: ${i.recipient}.` : '',
    `Giọng văn: ${TONE_LABEL[i.tone]}.`,
    'Chỉ trả về một mảng JSON gồm các chuỗi, không kèm giải thích.',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Lấy mảng chuỗi từ phản hồi. Trả về [] nếu không đọc được, không ném lỗi thô ra ngoài. */
export function parseSuggestions(text: string, max: number): string[] {
  const m = text.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try {
    const arr = JSON.parse(m[0]) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      .map((x) => x.trim().slice(0, 300))
      .slice(0, max);
  } catch {
    return [];
  }
}
