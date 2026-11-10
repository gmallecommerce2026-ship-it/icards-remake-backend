import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from '../settings/settings.module.js';
import { TemplateCategoriesController } from './template-categories.controller.js';
import { TemplateCategoriesService } from './template-categories.service.js';
import { TemplateBlocksController } from './template-blocks.controller.js';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';
import { TemplateBlocksService } from './template-blocks.service.js';
import { EnvelopePresetsController } from './envelope-presets.controller.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';
import { TemplateCategoryNode } from './schemas/template-category-node.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationTemplate, TemplateCategoryNode]), SettingsModule],
  controllers: [TemplatesController, TemplateBlocksController, TemplateCategoriesController, EnvelopePresetsController],
  providers: [TemplatesService, TemplateBlocksService, TemplateCategoriesService],
  exports: [TemplatesService, TemplateBlocksService, TemplateCategoriesService],
})
export class TemplatesModule {}
