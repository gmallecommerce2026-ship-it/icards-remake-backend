import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(3) @MaxLength(40) @Matches(/^[a-zA-Z0-9_.-]+$/, { message: 'Tên đăng nhập chỉ gồm chữ, số, _ . -' }) username: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(72) password: string;
}

export class LoginDto {
  /** username hoặc email */
  @IsString() @MinLength(3) @MaxLength(100) login: string;
  @IsString() @MaxLength(72) password: string;
}

export class ForgotPasswordDto {
  @IsEmail() email: string;
}

export class ResetPasswordDto {
  @IsString() @MinLength(8) @MaxLength(72) password: string;
}
