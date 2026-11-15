import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SettingsService } from '../settings/settings.service.js';
import { DESIGN_ASSETS_KEY, DESIGN_ASSETS_SEED, sanitizeDesignAssets } from '../design-assets/design-assets.js';

/** Tài nguyên thiết kế để trình thiết kế (studio và admin) bổ sung vào danh sách có sẵn. Công khai. */
@ApiTags('templates')
@Controller('design-assets')
export class DesignAssetsController {
  constructor(private readonly settings: SettingsService) {}

  @SkipThrottle()
  @Get()
  async list() {
    return sanitizeDesignAssets(await this.settings.getContent<unknown>(DESIGN_ASSETS_KEY, DESIGN_ASSETS_SEED));
  }
}
