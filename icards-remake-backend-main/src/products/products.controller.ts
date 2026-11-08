import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ProductsQueryDto } from './dto/products-query.dto.js';
import { ProductsService } from './products.service.js';

/** Sản phẩm/dịch vụ cửa hàng (in ấn, đón khách, gửi thiệp online). Công khai. */
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @SkipThrottle()
  @Get()
  list(@Query() q: ProductsQueryDto) {
    return this.productsService.list(q);
  }

  @SkipThrottle()
  @Get(':idOrSlug')
  detail(@Param('idOrSlug') idOrSlug: string) {
    return this.productsService.findPublished(idOrSlug);
  }
}
