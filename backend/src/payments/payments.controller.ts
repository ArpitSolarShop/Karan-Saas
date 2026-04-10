import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create({ ...createPaymentDto, tenantId: req.user.tenantId });
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.paymentsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.paymentsService.remove(id, req.user.tenantId);
  }
}
