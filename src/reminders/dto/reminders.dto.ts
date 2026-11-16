import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsInt, IsOptional, Max, Min, ValidateNested } from 'class-validator';

class ReminderItemDto {
  @IsInt() @Min(1) @Max(365) daysBefore: number;
  @IsBoolean() isEnabled: boolean;
}

export class SaveRemindersDto {
  @IsOptional() @IsDateString() eventDate?: string;
  @IsArray() @ArrayMaxSize(10) @ValidateNested({ each: true }) @Type(() => ReminderItemDto)
  emailReminders: ReminderItemDto[];
}
