import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SettingsService } from './settings.service.js';

/** Cấu hình và danh mục công khai cho FE. */
@ApiTags('public')
@Controller('public')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @SkipThrottle()
  @Get('settings')
  settings() {
    return this.settingsService.getPublicSettings();
  }

  @SkipThrottle()
  @Get('content/:key')
  content(@Param('key') key: string) {
    return this.settingsService.getPublicContent(key);
  }
}
