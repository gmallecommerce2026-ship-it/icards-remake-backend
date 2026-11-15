import { BadRequestException, Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { SettingsService } from '../settings/settings.service.js';
import { StorageService } from '../storage/storage.service.js';
import {
  DESIGN_ASSETS_KEY,
  DESIGN_ELEMENT_CATEGORIES,
  cleanDesignAssets,
  sanitizeDesignAssets,
  type DesignAssets,
} from '../design-assets/design-assets.js';
import { DESIGN_ASSETS_SEED_DATA } from '../seed/data/design-assets.seed.js';

/** Tài nguyên thiết kế (font, màu, hình nền) cho trình thiết kế. Chỉ role=admin. */
@ApiTags('admin')
@Controller('admin/design-assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminDesignAssetsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  async get(): Promise<DesignAssets & { categories: typeof DESIGN_ELEMENT_CATEGORIES }> {
    return { ...(await this.current()), categories: DESIGN_ELEMENT_CATEGORIES };
  }

  /**
   * Lưu toàn bộ tài nguyên. Mục nào request không gửi (vd. form chỉ sửa font/màu/hình nền)
   * thì giữ nguyên giá trị đang lưu, để không mất phần tử/khung/lưới.
   */
  @Put()
  async save(@Body() body: unknown): Promise<DesignAssets> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) cleanDesignAssets(body);
    const current = await this.current();
    const merged = { ...current, ...(body as Partial<DesignAssets>) };
    const clean = cleanDesignAssets(merged);
    await this.settings.setContent(DESIGN_ASSETS_KEY, clean);
    return clean;
  }

  private current(): Promise<DesignAssets> {
    return this.settings
      .getContent<unknown>(DESIGN_ASSETS_KEY, DESIGN_ASSETS_SEED_DATA)
      .then((raw) => sanitizeDesignAssets(raw));
  }

  /** Ảnh nền dạng hình: trả về URL công khai để lưu vào hình nền type=image. */
  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file?: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Chưa chọn file ảnh.');
    const url = await this.storage.upload(file.buffer, file.mimetype, 'design-assets');
    return { url };
  }
}
