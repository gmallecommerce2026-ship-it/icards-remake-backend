import { BadRequestException, Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { SettingsService } from '../settings/settings.service.js';
import { StorageService } from '../storage/storage.service.js';
import { TEMPLATE_HEROES_KEY, sanitizeHeroes, type TemplateHeroes } from '../templates/template-heroes.js';

/** Cấu hình hero 3D theo danh mục mẫu thiệp. Chỉ role=admin. */
@ApiTags('admin')
@Controller('admin/template-heroes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminTemplateHeroesController {
  constructor(
    private readonly settings: SettingsService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  async get(): Promise<TemplateHeroes> {
    return sanitizeHeroes(await this.settings.getContent<unknown>(TEMPLATE_HEROES_KEY, {}));
  }

  @Put()
  async save(@Body() body: unknown): Promise<TemplateHeroes> {
    const clean = sanitizeHeroes(body);
    await this.settings.setContent(TEMPLATE_HEROES_KEY, clean);
    return clean;
  }

  /** Ảnh minh họa cho hero: trả về URL công khai để dán vào danh sách ảnh. */
  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file?: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Chưa chọn file ảnh.');
    if (!/^image\//.test(file.mimetype)) throw new BadRequestException('Chỉ nhận file ảnh.');
    const url = await this.storage.upload(file.buffer, file.mimetype, 'template-heroes');
    return { url };
  }
}
