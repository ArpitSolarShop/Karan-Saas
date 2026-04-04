import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ColumnType } from '@prisma/client';

export class CreateCustomFieldDto {
  @IsString()
  entityType: string;

  @IsString()
  name: string;

  @IsString()
  label: string;

  @IsEnum(ColumnType)
  type: ColumnType;

  @IsOptional()
  options?: any;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsString()
  tenantId: string;
}
