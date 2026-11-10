import { BadRequestException, Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { SettingsService } from '../settings/settings.service.js';
import type { SiteSettings } from '../settings/site-config.types.js';
import { StorageService } from '../storage/storage.service.js';
import { cleanBannerGroups, cleanNav } from './site-settings.validator.js';
import { cleanPageCopy } from './catalog-admin.validator.js';
import { resolvePageCopy } from '../settings/page-copy.js';
import { normalizeBannerGroups } from '../settings/banner-layout.js';

const DEFAULT_THEME = { companyName: 'iCards', announcementBar: { isEnabled: false, text: '', isMarquee: false } };

/** Cấu hình giao diện (banner, menu trang chủ) và upload ảnh cho admin. Chỉ role=admin. */
@ApiTags('admin')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminSettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  get(): Promise<SiteSettings> {
    return this.load();
  }

  /** Ghi toàn bộ nhóm banner. Dữ liệu cũ (banners) được bỏ khỏi bản ghi sau lần lưu này. */
  @Put('banner-groups')
  async saveBannerGroups(@Body() body: { bannerGroups?: unknown }): Promise<SiteSettings> {
    const current = await this.load();
    const { banners: _legacy, ...rest } = current;
    const next: SiteSettings = { ...rest, bannerGroups: cleanBannerGroups(body?.bannerGroups) } as SiteSettings;
    await this.settings.setContent('settings', next);
    return next;
  }

  @Put('page-copy')
  async savePageCopy(@Body() body: { pageCopy?: unknown }): Promise<SiteSettings> {
    const current = await this.load();
    const next: SiteSettings = { ...current, pageCopy: cleanPageCopy(body?.pageCopy) };
    await this.settings.setContent('settings', next);
    return next;
  }

  @Put('header-nav')
  async saveHeaderNav(@Body() body: { headerNav?: unknown }): Promise<SiteSettings> {
    const current = await this.load();
    const next: SiteSettings = { ...current, headerNav: cleanNav(body?.headerNav) };
    await this.settings.setContent('settings', next);
    return next;
  }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file?: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Chưa chọn file ảnh.');
    const url = await this.storage.upload(file.buffer, file.mimetype, 'site');
    return { url };
  }

  private async load(): Promise<SiteSettings> {
    const s = await this.settings.getContent<Partial<SiteSettings>>('settings', {});
    const { banners: _legacy, ...rest } = s;
    return {
      ...rest,
      theme: s.theme ?? DEFAULT_THEME,
      headerNav: s.headerNav ?? [],
      bannerGroups: normalizeBannerGroups(s),
      introText: s.introText ?? '',
      pageCopy: resolvePageCopy(s.pageCopy),
    } as SiteSettings;
  }
}
