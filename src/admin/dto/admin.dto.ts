import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

export class AdminUsersQueryDto extends PaginationQueryDto {
  @IsOptional() @IsIn(['user', 'admin']) role?: 'user' | 'admin';
}

export class AdminInvitationsQueryDto extends PaginationQueryDto {
  @IsOptional() @IsIn(['draft', 'published']) status?: 'draft' | 'published';
}

export class UpdateUserAdminDto {
  @IsOptional() @IsIn(['user', 'admin']) role?: 'user' | 'admin';
  @IsOptional() @Type(() => Boolean) @IsBoolean() isActive?: boolean;
}
