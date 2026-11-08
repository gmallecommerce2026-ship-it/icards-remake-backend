import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service.js';
import type { TemplateBlockConfig } from '../settings/site-config.types.js';
import { sanitizeTitleStyle } from './title-style.js';

/** Khóa site_content chứa các khối "dịp" trên trang chủ. */
export const TEMPLATE_BLOCKS_KEY = 'template.blocks';

/**
 * Điểm mở rộng cho dashboard: mọi đọc/ghi cấu hình khối dịp đi qua đây.
 * Dữ liệu luôn được chuẩn hóa trước khi trả về hoặc lưu, nên route ghi (khi làm) chỉ cần gọi các hàm dưới đây.
 *
 * Dashboard sau này (admin) có thể dùng:
 *  - getBlocks()                 đọc toàn bộ khối (đã chuẩn hóa)
 *  - saveBlocks(blocks)          ghi toàn bộ danh sách khối (kiểm tra slug trùng, dữ liệu sai → 400)
 *  - setTitleStyle(slug, style)  đổi font/cỡ/màu của tên một danh mục; style = null để xóa, về mặc định
 */
@Injectable()
export class TemplateBlocksService {
  constructor(private readonly settings: SettingsService) {}

  async getBlocks(): Promise<TemplateBlockConfig[]> {
    const raw = await this.settings.getContent<unknown>(TEMPLATE_BLOCKS_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeBlock).filter((b): b is TemplateBlockConfig => !!b);
  }

  async saveBlocks(input: unknown): Promise<TemplateBlockConfig[]> {
    if (!Array.isArray(input)) throw new BadRequestException('Danh sách khối phải là một mảng');
    const blocks: TemplateBlockConfig[] = [];
    for (const [i, raw] of input.entries()) {
      const b = normalizeBlock(raw);
      if (!b) throw new BadRequestException(`Khối thứ ${i + 1} không hợp lệ (cần title, slug, isActive, templateSlugs)`);
      blocks.push(b);
    }
    const slugs = blocks.map((b) => b.slug);
    if (new Set(slugs).size !== slugs.length) throw new BadRequestException('Slug của các khối bị trùng');
    await this.settings.setContent(TEMPLATE_BLOCKS_KEY, blocks);
    return blocks;
  }

  async setTitleStyle(slug: string, style: unknown): Promise<TemplateBlockConfig> {
    const blocks = await this.getBlocks();
    const block = blocks.find((b) => b.slug === slug);
    if (!block) throw new NotFoundException('Không tìm thấy danh mục');

    if (style === null || style === undefined) {
      delete block.titleStyle;
    } else {
      const clean = sanitizeTitleStyle(style);
      if (!clean) throw new BadRequestException('Kiểu chữ không hợp lệ');
      block.titleStyle = clean;
    }
    await this.saveBlocks(blocks);
    return block;
  }
}

/** Chuẩn hóa một khối. Trả về undefined nếu thiếu trường bắt buộc. */
function normalizeBlock(raw: unknown): TemplateBlockConfig | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Record<string, unknown>;
  if (typeof r.title !== 'string' || !r.title.trim()) return undefined;
  if (typeof r.slug !== 'string' || !r.slug.trim()) return undefined;
  if (!Array.isArray(r.templateSlugs) || !r.templateSlugs.every((s) => typeof s === 'string')) return undefined;
  const titleStyle = sanitizeTitleStyle(r.titleStyle);
  return {
    title: r.title.trim(),
    slug: r.slug.trim(),
    isActive: r.isActive !== false,
    templateSlugs: r.templateSlugs as string[],
    ...(titleStyle ? { titleStyle } : {}),
  };
}
