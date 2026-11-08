import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { EmptyToUndefined } from '../../common/decorators/empty-to-undefined.decorator.js';

export class CreateServiceRequestDto {
  @IsString() @IsNotEmpty() @MaxLength(100) service: string;
  @IsString() @IsNotEmpty() @MaxLength(80) name: string;
  @Matches(/^\+?[0-9]{9,13}$/, { message: 'Số điện thoại không hợp lệ' }) phone: string;
  @EmptyToUndefined() @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày không hợp lệ' }) eventDate?: string;
  @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(500) note?: string;
}
