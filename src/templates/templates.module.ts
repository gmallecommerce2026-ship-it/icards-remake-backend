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
import { DesignAssetsController } from './design-assets.controller.js';
import { TemplateHeroesController } from './template-heroes.controller.js';
import { HomeOccasionsController } from './home-occasions.controller.js';
import { HomeOccasionsService } from './home-occasions.service.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';
import { TemplateCategoryNode } from './schemas/template-category-node.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationTemplate, TemplateCategoryNode]), SettingsModule],
  controllers: [TemplatesController, TemplateBlocksController, TemplateCategoriesController, EnvelopePresetsController, DesignAssetsController, TemplateHeroesController, HomeOccasionsController],
  providers: [TemplatesService, TemplateBlocksService, TemplateCategoriesService, HomeOccasionsService],
  exports: [TemplatesService, TemplateBlocksService, TemplateCategoriesService, HomeOccasionsService],
})
export class TemplatesModule {}
