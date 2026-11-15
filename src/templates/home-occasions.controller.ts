import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { HomeOccasionsService } from './home-occasions.service.js';

/** Ảnh nền + font tên danh mục của khối "Những dịp lan tỏa niềm vui" trên trang chủ. Công khai. */
@ApiTags('templates')
@Controller('home-occasions')
export class HomeOccasionsController {
  constructor(private readonly occasions: HomeOccasionsService) {}

  @SkipThrottle()
  @Get()
  get() {
    return this.occasions.get();
  }
}
