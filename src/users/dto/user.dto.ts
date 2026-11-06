import { IsOptional, IsString, Matches, MaxLength, MinLength, IsEmail } from 'class-validator';
import { ArrayMaxSize, IsArray } from 'class-validator';

export class UpdateMeDto {
  @IsOptional() @IsString() @MaxLength(100) fullName?: string;
  @IsOptional() @IsString() @Matches(/^[0-9+\s().-]{6,20}$/, { message: 'Số điện thoại không hợp lệ' }) phone?: string;
  @IsOptional() @IsEmail() email?: string;
}

export class ChangePasswordDto {
  @IsString() currentPassword: string;
  @IsString() @MinLength(8) @MaxLength(72) newPassword: string;
}

export class DeletePersonalImagesDto {
  @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) urls: string[];
}
