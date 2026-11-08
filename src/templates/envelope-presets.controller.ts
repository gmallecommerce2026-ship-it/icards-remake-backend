import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SettingsService } from '../settings/settings.service.js';
import { ENVELOPE_PRESETS_KEY, ENVELOPE_PRESETS_SEED, sanitizePresets } from './envelope-presets.js';

/** Danh mục phong bì và lớp lót cho studio và trang chủ. Công khai, không cần đăng nhập. */
@ApiTags('templates')
@Controller('envelope-presets')
export class EnvelopePresetsController {
  constructor(private readonly settings: SettingsService) {}

  @SkipThrottle()
  @Get()
  async list() {
    const raw = await this.settings.getContent<unknown>(ENVELOPE_PRESETS_KEY, ENVELOPE_PRESETS_SEED);
    return sanitizePresets(raw);
  }
}
