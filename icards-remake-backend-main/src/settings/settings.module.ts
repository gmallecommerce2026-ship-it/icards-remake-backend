import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';
import { SiteContent } from './schemas/site-content.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([SiteContent])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
