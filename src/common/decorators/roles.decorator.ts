import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Chỉ cho phép các role liệt kê. Dùng cùng JwtAuthGuard: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin'). */
export const Roles = (...roles: Array<'user' | 'admin'>) => SetMetadata(ROLES_KEY, roles);
