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
  DESIGN_ASSETS_SEED,
  cleanDesignAssets,
  sanitizeDesignAssets,
  type DesignAssets,
} from '../design-assets/design-assets.js';

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
  async get(): Promise<DesignAssets> {
    return sanitizeDesignAssets(await this.settings.getContent<unknown>(DESIGN_ASSETS_KEY, DESIGN_ASSETS_SEED));
  }

  @Put()
  async save(@Body() body: unknown): Promise<DesignAssets> {
    const clean = cleanDesignAssets(body);
    await this.settings.setContent(DESIGN_ASSETS_KEY, clean);
    return clean;
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
