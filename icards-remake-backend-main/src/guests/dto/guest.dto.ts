import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsObject,
  IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { EmptyToUndefined } from '../../common/decorators/empty-to-undefined.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

const PHONE = /^[0-9+\s().-]{6,20}$/;

export class CreateGuestDto {
  @IsString() @IsNotEmpty() @MaxLength(120) name: string;
  @EmptyToUndefined() @IsOptional() @IsEmail() email?: string;
  @EmptyToUndefined() @IsOptional() @Matches(PHONE, { message: 'Số điện thoại không hợp lệ' }) phone?: string;
  /** Tên nhóm (AddGuestModal của FE gửi tên, vd "Gia đình") - tự tạo nhóm nếu chưa có */
  @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(60) group?: string;
  @IsOptional() @IsMongoId() groupId?: string;
  @IsOptional() @IsInt() @Min(0) @Max(20) companions?: number;
  @IsOptional() @IsNumber() @Min(0) giftAmount?: number;
  @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(1000) note?: string;
}

export class UpdateGuestDto extends PartialType(CreateGuestDto) {
  /** chủ thiệp xác nhận hộ khách */
  @IsOptional() @IsIn(['pending', 'attending', 'declined']) status?: 'pending' | 'attending' | 'declined';
}

export class BulkCreateGuestsDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => CreateGuestDto) guests: CreateGuestDto[];
}

class BulkPatchDto {
  /** null = bỏ nhóm */
  @IsOptional() @IsMongoId() groupId?: string | null;
  @IsOptional() @IsIn(['pending', 'attending', 'declined']) status?: 'pending' | 'attending' | 'declined';
  @IsOptional() @IsInt() @Min(0) @Max(20) companions?: number;
  @IsOptional() @IsNumber() @Min(0) giftAmount?: number;
}
export class BulkUpdateGuestsDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500) @IsMongoId({ each: true }) ids: string[];
  @IsObject() @ValidateNested() @Type(() => BulkPatchDto) update: BulkPatchDto;
}

export class BulkIdsDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(500) @IsMongoId({ each: true }) ids: string[];
}

export class SendEmailDto {
  @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(1000) message?: string;
}

export class BulkSendEmailDto extends SendEmailDto {
  /** bỏ trống = gửi cho tất cả khách có email */
  @IsOptional() @IsArray() @ArrayMaxSize(300) @IsMongoId({ each: true }) ids?: string[];
  /** chỉ gửi cho khách chưa gửi / gửi lỗi */
  @IsOptional() @IsBoolean() onlyUnsent?: boolean;
}

export class RsvpDto {
  @IsIn(['attending', 'declined']) status: 'attending' | 'declined';
  @IsOptional() @IsInt() @Min(0) @Max(20) companions?: number;
  @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(1000) message?: string;
}

export class GuestsQueryDto extends PaginationQueryDto {
  @IsOptional() @IsMongoId() groupId?: string;
  /** FE dùng "not-attending" cho "Không tham gia" */
  @IsOptional() @IsIn(['pending', 'attending', 'declined', 'not-attending']) status?: string;
  @IsOptional() @IsIn(['sent', 'failed', 'not-sent']) emailStatus?: string;
}

export class GroupDto {
  @IsString() @IsNotEmpty() @MaxLength(60) name: string;
  @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(20) color?: string;
}
