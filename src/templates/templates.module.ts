import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from '../settings/settings.module.js';
import { TemplateCategoriesController } from './template-categories.controller.js';
import { TemplateBlocksController } from './template-blocks.controller.js';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationTemplate]), SettingsModule],
  controllers: [TemplatesController, TemplateBlocksController, TemplateCategoriesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
