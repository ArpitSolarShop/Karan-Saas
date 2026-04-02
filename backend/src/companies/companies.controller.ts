import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: any) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId?: string) {
    return this.companiesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: any) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
