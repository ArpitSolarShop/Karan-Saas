import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { PaymentMethod, PaymentLogStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string | Date;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentLogStatus)
  status?: PaymentLogStatus;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  tenantId: string;

  @IsString()
  recordedBy: string;
}
