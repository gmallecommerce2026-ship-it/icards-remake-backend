import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsObject, IsOptional,
  IsString, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { ParseJson } from '../../common/decorators/parse-json.decorator.js';
import { EVENT_TYPES } from '../schemas/invitation.schema.js';

/** Dùng cho cả multipart/form-data (field JSON là string) lẫn application/json. */
export class CreateInvitationDto {
  @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @IsOptional() @IsIn(EVENT_TYPES) eventType?: (typeof EVENT_TYPES)[number];
  @IsOptional() @IsString() @MaxLength(100) templateSlug?: string;
  @IsOptional() @IsDateString() eventDate?: string;
  @IsOptional() @IsString() @MaxLength(1000) coverUrl?: string;
  @IsOptional() @IsIn(['draft', 'published']) status?: 'draft' | 'published';
  @IsOptional() @ParseJson() @IsObject() info?: Record<string, unknown>;
  @IsOptional() @ParseJson() @IsObject() page?: Record<string, unknown>;
  @IsOptional() @ParseJson() @IsObject() design?: Record<string, unknown>;
}
export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {}

export class UpdateSettingsDto {
  @IsOptional() @IsBoolean() allowRsvp?: boolean;
  @IsOptional() @IsBoolean() allowWishes?: boolean;
  @IsOptional() @IsBoolean() moderateWishes?: boolean;
  @IsOptional() @IsBoolean() showGuestList?: boolean;
  @IsOptional() @IsInt() @Min(0) @Max(20) maxCompanions?: number;
  @IsOptional() @IsDateString() rsvpDeadline?: string;
}

export class PublishDto {
  @IsBoolean() published: boolean;
}

class BudgetItemDto {
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsNumber() @Min(0) estimate?: number;
  @IsOptional() @IsNumber() @Min(0) actual?: number;
  @IsOptional() @IsBoolean() paid?: boolean;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
export class BudgetDto {
  @IsOptional() @IsNumber() @Min(0) total?: number;
  @IsOptional() @IsArray() @ArrayMaxSize(300) @ValidateNested({ each: true }) @Type(() => BudgetItemDto) items?: BudgetItemDto[];
}

class TaskDto {
  @IsOptional() @IsString() _id?: string;
  @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @IsOptional() @IsBoolean() done?: boolean;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() @MaxLength(60) category?: string;
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
}
export class UpdateTasksDto {
  @IsArray() @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => TaskDto) tasks: TaskDto[];
}
