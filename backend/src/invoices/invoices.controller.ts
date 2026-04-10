import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard, TenantGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req: any) {
    return this.invoicesService.create({ ...createInvoiceDto, tenantId: req.user.tenantId });
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.invoicesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Req() req: any) {
    return this.invoicesService.update(id, req.user.tenantId, updateInvoiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.invoicesService.remove(id, req.user.tenantId);
  }
}
