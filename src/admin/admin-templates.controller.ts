import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { AdminTemplatesService } from './admin-templates.service.js';

/** Quản trị mẫu thiệp (tab Thiết kế), phong bì và lớp lót (tab Phong bì). Chỉ role=admin. */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminTemplatesController {
  constructor(private readonly templates: AdminTemplatesService) {}

  @Get('templates')
  list() {
    return this.templates.listTemplates();
  }

  @Post('templates')
  create(@Body() body: unknown) {
    return this.templates.createTemplate(body);
  }

  @Get('templates/:id')
  detail(@Param('id', ParseObjectIdPipe) id: string) {
    return this.templates.getTemplate(id);
  }

  @Put('templates/:id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: unknown) {
    return this.templates.updateTemplate(id, body);
  }

  @Put('templates/:id/design')
  design(@Param('id', ParseObjectIdPipe) id: string, @Body() body: unknown) {
    return this.templates.saveDesign(id, body);
  }

  @Put('templates/:id/envelope')
  envelope(@Param('id', ParseObjectIdPipe) id: string, @Body() body: unknown) {
    return this.templates.saveEnvelope(id, body);
  }

  @Get('template-categories')
  categories() {
    return this.templates.listCategories();
  }

  @Get('envelope-presets')
  presets() {
    return this.templates.presets();
  }

  @Put('envelope-presets')
  savePresets(@Body() body: unknown) {
    return this.templates.savePresets(body);
  }
}
