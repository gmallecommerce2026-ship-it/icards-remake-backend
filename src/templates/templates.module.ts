import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';
import { InvitationTemplate } from './schemas/invitation-template.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([InvitationTemplate])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
