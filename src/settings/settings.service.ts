import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PUBLIC_CONTENT_KEYS, type PublicContentKey } from '../catalog/catalog.types.js';
import { SiteContent } from './schemas/site-content.schema.js';
import { normalizeBannerGroups, publicBannerGroups } from './banner-layout.js';
import { resolvePageCopy } from './page-copy.js';

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(SiteContent) private readonly repo: Repository<SiteContent>) {}

  /** Đọc nội bộ (không kiểm tra whitelist). Trả về fallback nếu chưa seed. */
  async getContent<T>(key: string, fallback: T): Promise<T> {
    const row = await this.repo.findOne({ where: { key } });
    return row ? (row.value as T) : fallback;
  }

  /**
   * Ghi nội bộ (upsert). Không gắn trực tiếp vào route: chỉ gọi từ service đã kiểm tra dữ liệu,
   * ví dụ TemplateBlocksService cho dashboard sau này.
   */
  async setContent<T>(key: string, value: T): Promise<void> {
    await this.repo.save({ key, value } as SiteContent);
  }

  /** Đọc công khai: chỉ cho phép các khóa trong PUBLIC_CONTENT_KEYS. */
  async getPublicContent(key: string) {
    if (!(PUBLIC_CONTENT_KEYS as readonly string[]).includes(key)) {
      throw new NotFoundException('Không tìm thấy nội dung');
    }
    const row = await this.repo.findOne({ where: { key: key as PublicContentKey } });
    if (!row) throw new NotFoundException('Không tìm thấy nội dung');
    return row.value;
  }

  /** Cấu hình công khai: chỉ nhóm banner đang bật và banner đang bật. Dữ liệu banner cũ không trả về. */
  async getPublicSettings() {
    const s = await this.getContent<Record<string, unknown>>('settings', {});
    const { banners: _legacy, ...rest } = s;
    return { ...rest, bannerGroups: publicBannerGroups(normalizeBannerGroups(s)), pageCopy: resolvePageCopy(s.pageCopy) };
  }
}
