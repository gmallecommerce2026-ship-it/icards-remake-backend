import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildPrompt, cleanAiTextInput, parseSuggestions } from './ai-text.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-haiku-5-5';
const TIMEOUT_MS = 20_000;

/** Ứng dụng AI cho trình thiết kế. Khóa API chỉ nằm trên máy chủ (biến môi trường), không gửi xuống trình duyệt. */
@Injectable()
export class AppsService {
  constructor(private readonly config: ConfigService) {}

  async aiText(raw: unknown): Promise<{ suggestions: string[] }> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY')?.trim();
    if (!apiKey) throw new ServiceUnavailableException('Chưa cấu hình AI trên máy chủ (ANTHROPIC_API_KEY).');
    const input = cleanAiTextInput(raw);
    const model = this.config.get<string>('AI_MODEL')?.trim() || DEFAULT_MODEL;

    let res: Response;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 600, messages: [{ role: 'user', content: buildPrompt(input) }] }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch {
      throw new BadGatewayException('Không kết nối được dịch vụ AI, thử lại sau.');
    }
    if (!res.ok) throw new BadGatewayException(`Dịch vụ AI trả lỗi (${res.status}), kiểm tra khóa API và model.`);

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n');
    return { suggestions: parseSuggestions(text, input.count) };
  }
}
