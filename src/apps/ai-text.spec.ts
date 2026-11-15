import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanAiTextInput, parseSuggestions, buildPrompt } from './ai-text.js';
import { AppsService } from './apps.service.js';

describe('cleanAiTextInput', () => {
  it('nhận đầu vào hợp lệ và đặt giá trị mặc định', () => {
    expect(cleanAiTextInput({ occasion: 'Đám cưới' })).toEqual({ occasion: 'Đám cưới', recipient: undefined, tone: 'trang-trong', count: 3 });
  });
  it('từ chối dịp trống hoặc quá dài', () => {
    expect(() => cleanAiTextInput({ occasion: '  ' })).toThrow();
    expect(() => cleanAiTextInput({ occasion: 'x'.repeat(121) })).toThrow();
  });
  it('giới hạn số lượng trong khoảng 1–5 và tông giọng hợp lệ', () => {
    expect(cleanAiTextInput({ occasion: 'a', count: 99, tone: 'lang-man' }).count).toBe(5);
    expect(cleanAiTextInput({ occasion: 'a', count: 0 }).count).toBe(1);
    expect(cleanAiTextInput({ occasion: 'a', tone: 'hack' }).tone).toBe('trang-trong');
  });
});

describe('parseSuggestions', () => {
  it('lấy mảng JSON từ văn bản có thêm chữ thừa', () => {
    expect(parseSuggestions('Đây là kết quả: ["Chúc mừng", "Hạnh phúc"]', 5)).toEqual(['Chúc mừng', 'Hạnh phúc']);
  });
  it('bỏ mục rỗng, cắt số lượng và độ dài', () => {
    expect(parseSuggestions('["a", "", "b", "c"]', 2)).toEqual(['a', 'b']);
    expect(parseSuggestions(`["${'x'.repeat(500)}"]`, 1)[0]).toHaveLength(300);
  });
  it('trả về [] khi không đọc được', () => {
    expect(parseSuggestions('không có mảng', 3)).toEqual([]);
    expect(parseSuggestions('[oops', 3)).toEqual([]);
  });
});

describe('buildPrompt', () => {
  it('đưa dịp, người nhận và giọng văn vào prompt', () => {
    const p = buildPrompt({ occasion: 'Sinh nhật', recipient: 'Mẹ', tone: 'vui-ve', count: 2 });
    expect(p).toContain('Sinh nhật');
    expect(p).toContain('Mẹ');
    expect(p).toContain('vui vẻ');
  });
});

describe('AppsService.aiText', () => {
  afterEach(() => vi.unstubAllGlobals());
  const cfg = (values: Record<string, string>) => ({ get: (k: string) => values[k] }) as never;

  it('từ chối khi chưa có khóa API (không gọi mạng)', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    await expect(new AppsService(cfg({})).aiText({ occasion: 'x' })).rejects.toThrow('ANTHROPIC_API_KEY');
    expect(f).not.toHaveBeenCalled();
  });

  it('gọi Anthropic với khóa phía máy chủ và trả về gợi ý', async () => {
    const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ content: [{ type: 'text', text: '["Chúc hai bạn trăm năm hạnh phúc"]' }] }), { status: 200 }));
    vi.stubGlobal('fetch', f);
    const r = await new AppsService(cfg({ ANTHROPIC_API_KEY: 'sk-test' })).aiText({ occasion: 'Đám cưới', count: 1 });
    expect(r.suggestions).toEqual(['Chúc hai bạn trăm năm hạnh phúc']);
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('sk-test');
  });

  it('báo lỗi rõ khi dịch vụ AI trả lỗi', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('no', { status: 401 })));
    await expect(new AppsService(cfg({ ANTHROPIC_API_KEY: 'bad' })).aiText({ occasion: 'x' })).rejects.toThrow('401');
  });
});
