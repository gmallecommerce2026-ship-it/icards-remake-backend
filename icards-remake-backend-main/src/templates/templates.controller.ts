import { Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { TemplatesQueryDto } from './dto/templates-query.dto.js';
import { TemplatesService } from './templates.service.js';

/** Danh mục mẫu thiệp công khai. Không cần đăng nhập. */
@ApiTags('templates')
@Controller('invitation-templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @SkipThrottle()
  @Get()
  list(@Query() q: TemplatesQueryDto) {
    return this.templatesService.list(q);
  }

  @SkipThrottle()
  @Get(':idOrSlug')
  detail(@Param('idOrSlug') idOrSlug: string) {
    return this.templatesService.findPublished(idOrSlug);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(200)
  @Post(':idOrSlug/view')
  view(@Param('idOrSlug') idOrSlug: string) {
    return this.templatesService.trackView(idOrSlug);
  }
}
