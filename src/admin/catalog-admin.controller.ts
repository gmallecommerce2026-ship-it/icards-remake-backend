import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { CatalogAdminService } from './catalog-admin.service.js';

/** Quản trị cửa hàng, dịch vụ, tin tức. Chỉ role=admin. */
@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class CatalogAdminController {
  constructor(private readonly catalog: CatalogAdminService) {}

  @Get('products') listProducts(@Query('search') search?: string) { return this.catalog.listProducts(search); }
  @Post('products') createProduct(@Body() body: unknown) { return this.catalog.createProduct(body); }
  @Put('products/:id') updateProduct(@Param('id', ParseObjectIdPipe) id: string, @Body() body: unknown) { return this.catalog.updateProduct(id, body); }
  @Delete('products/:id') removeProduct(@Param('id', ParseObjectIdPipe) id: string) { return this.catalog.removeProduct(id); }

  @Get('services') listServices() { return this.catalog.listServices(); }
  @Post('services') createService(@Body() body: unknown) { return this.catalog.createService(body); }
  @Put('services/:id') updateService(@Param('id', ParseObjectIdPipe) id: string, @Body() body: unknown) { return this.catalog.updateService(id, body); }
  @Delete('services/:id') removeService(@Param('id', ParseObjectIdPipe) id: string) { return this.catalog.removeService(id); }

  @Get('posts') listPosts() { return this.catalog.listPosts(); }
  @Post('posts') createPost(@Body() body: unknown) { return this.catalog.createPost(body); }
  @Put('posts/:id') updatePost(@Param('id', ParseObjectIdPipe) id: string, @Body() body: unknown) { return this.catalog.updatePost(id, body); }
  @Delete('posts/:id') removePost(@Param('id', ParseObjectIdPipe) id: string) { return this.catalog.removePost(id); }

  @Put('blog-categories') saveBlogCategories(@Body() body: { categories?: unknown }) { return this.catalog.saveBlogCategories(body?.categories); }
}
