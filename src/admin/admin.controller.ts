import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser, type JwtUser } from '../common/decorators/current-user.decorator.js';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe.js';
import { AdminService } from './admin.service.js';
import { AdminInvitationsQueryDto, AdminUsersQueryDto, UpdateUserAdminDto } from './dto/admin.dto.js';

/** Toàn bộ endpoint quản trị: chỉ tài khoản role=admin. */
@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats') stats() { return this.admin.stats(); }

  @Get('users') users(@Query() q: AdminUsersQueryDto) { return this.admin.listUsers(q); }

  @Patch('users/:id')
  updateUser(@CurrentUser() actor: JwtUser, @Param('id', ParseObjectIdPipe) id: string, @Body() dto: UpdateUserAdminDto) {
    return this.admin.updateUser(actor.userId, id, dto);
  }

  @Get('invitations') invitations(@Query() q: AdminInvitationsQueryDto) { return this.admin.listInvitations(q); }
}
