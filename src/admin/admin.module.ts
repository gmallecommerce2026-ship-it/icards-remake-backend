import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { User } from '../users/schemas/user.schema.js';
import { Invitation } from '../invitations/schemas/invitation.schema.js';
import { Wish } from '../wishes/schemas/wish.schema.js';
import { ServiceRequest } from '../services/schemas/service-request.schema.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invitation, Wish, ServiceRequest]), PassportModule.register({})],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
