import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendeeStatus, EventType } from '@prisma/client';

export class CreateEventAttendeeDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(AttendeeStatus)
  status?: AttendeeStatus;
}

export class CreateCalendarEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDatetime: string | Date;

  @IsDateString()
  endDatetime: string | Date;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsString()
  userId: string;

  @IsString()
  tenantId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventAttendeeDto)
  attendees?: CreateEventAttendeeDto[];
}
