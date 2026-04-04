import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessHoursDto } from './create-business-hours.dto';

export class UpdateBusinessHoursDto extends PartialType(CreateBusinessHoursDto) {}
