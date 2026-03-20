import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { DealsService } from './deals.service';

@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get('lead/:leadId')
  findAllByLead(@Param('leadId') leadId: string) {
    return this.dealsService.findAllByLead(leadId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.dealsService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.dealsService.update(id, data);
  }
}

