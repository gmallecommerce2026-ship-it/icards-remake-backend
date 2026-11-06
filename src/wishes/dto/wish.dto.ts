import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EmptyToUndefined } from '../../common/decorators/empty-to-undefined.decorator.js';

export class CreateWishDto {
  @IsString() @IsNotEmpty() @MaxLength(80) name: string;
  @IsString() @IsNotEmpty() @MaxLength(1000) message: string;
  /** token khách mời trong link (nếu có) để gắn lời chúc với khách */
  @EmptyToUndefined() @IsOptional() @IsString() @MaxLength(64) guestId?: string;
}

export class UpdateWishDto {
  @IsOptional() @IsBoolean() isApproved?: boolean;
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(1000) message?: string;
}
