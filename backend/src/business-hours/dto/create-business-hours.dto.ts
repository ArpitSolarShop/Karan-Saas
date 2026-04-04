import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusinessHourSlotDto {
  @IsNumber()
  dayOfWeek: number;

  @IsBoolean()
  isWorkingDay: boolean;

  @IsString()
  openTime: string;

  @IsString()
  closeTime: string;
}

export class CreateHolidayDto {
  @IsString()
  name: string;

  @IsDateString()
  date: string | Date;

  @IsOptional()
  @IsBoolean()
  isRecurringAnnually?: boolean;
}

export class CreateBusinessHoursDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsString()
  tenantId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessHourSlotDto)
  slots?: CreateBusinessHourSlotDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHolidayDto)
  holidays?: CreateHolidayDto[];
}
