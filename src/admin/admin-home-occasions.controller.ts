import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { HomeOccasionsService } from '../templates/home-occasions.service.js';

/** Tuỳ chỉnh khối "Những dịp lan tỏa niềm vui" (ảnh nền, font từng danh mục). Chỉ role=admin. */
@ApiTags('admin')
@Controller('admin/home-occasions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminHomeOccasionsController {
  constructor(private readonly occasions: HomeOccasionsService) {}

  @Get()
  get() {
    return this.occasions.get();
  }

  @Put()
  save(@Body() body: unknown) {
    return this.occasions.save(body);
  }
}
