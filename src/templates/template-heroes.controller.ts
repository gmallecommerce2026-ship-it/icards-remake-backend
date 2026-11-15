import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { SettingsService } from '../settings/settings.service.js';
import { TEMPLATE_HEROES_KEY, sanitizeHeroes } from './template-heroes.js';

/** Hero 3D theo danh mục cho trang /templates. Công khai. */
@ApiTags('templates')
@Controller('template-heroes')
export class TemplateHeroesController {
  constructor(private readonly settings: SettingsService) {}

  @SkipThrottle()
  @Get()
  async list() {
    return sanitizeHeroes(await this.settings.getContent<unknown>(TEMPLATE_HEROES_KEY, {}));
  }
}
