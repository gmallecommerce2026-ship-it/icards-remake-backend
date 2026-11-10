import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminSettingsController } from './admin-settings.controller.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { SettingsModule } from '../settings/settings.module.js';
import { User } from '../users/schemas/user.schema.js';
import { Invitation } from '../invitations/schemas/invitation.schema.js';
import { Wish } from '../wishes/schemas/wish.schema.js';
import { ServiceRequest } from '../services/schemas/service-request.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { Service } from '../services/schemas/service.schema.js';
import { Page } from '../pages/schemas/page.schema.js';
import { CatalogAdminController } from './catalog-admin.controller.js';
import { CatalogAdminService } from './catalog-admin.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invitation, Wish, ServiceRequest, Product, Service, Page]), PassportModule.register({}), SettingsModule],
  controllers: [AdminController, AdminSettingsController, CatalogAdminController],
  providers: [AdminService, CatalogAdminService, RolesGuard],
})
export class AdminModule {}
