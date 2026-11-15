import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AppsService } from './apps.service.js';

/** Ứng dụng trong sidebar trình thiết kế. Cần đăng nhập; giới hạn số lượt để kiểm soát chi phí AI. */
@ApiTags('apps')
@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly apps: AppsService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('ai/text')
  aiText(@Body() body: unknown) {
    return this.apps.aiText(body);
  }
}
