import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CreateServiceRequestDto } from './dto/service-request.dto.js';
import { ServicesService } from './services.service.js';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @SkipThrottle()
  @Get()
  list() {
    return this.servicesService.list();
  }

  @SkipThrottle()
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.servicesService.findPublished(slug);
  }
}

@ApiTags('services')
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private readonly servicesService: ServicesService) {}

  /** Khách gửi yêu cầu từ trang dịch vụ. Không cần đăng nhập. */
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(201)
  @Post()
  create(@Body() dto: CreateServiceRequestDto) {
    return this.servicesService.createRequest(dto);
  }
}
