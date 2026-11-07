import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PagesQueryDto } from './dto/pages-query.dto.js';
import { PagesService } from './pages.service.js';

/** Blog và trang tĩnh. Route "faq" phải khai báo trước ":slug". */
@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @SkipThrottle()
  @Get()
  list(@Query() q: PagesQueryDto) {
    return this.pagesService.list(q);
  }

  @SkipThrottle()
  @Get('faq')
  faq() {
    return this.pagesService.faq();
  }

  @SkipThrottle()
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.pagesService.findPublished(slug);
  }
}
