import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from '../settings/settings.module.js';
import { PagesController } from './pages.controller.js';
import { PagesService } from './pages.service.js';
import { Page } from './schemas/page.schema.js';
import { FaqItem } from './schemas/faq-item.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([Page, FaqItem]), SettingsModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
