import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppsController } from './apps.controller.js';
import { AppsService } from './apps.service.js';

@Module({ imports: [PassportModule.register({})], controllers: [AppsController], providers: [AppsService] })
export class AppsModule {}
