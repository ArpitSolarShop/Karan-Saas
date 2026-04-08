import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: any) {
    return this.companiesService.create({
      ...createCompanyDto,
      tenantId: req.user.tenantId,
    });
  }

  @Get()
  findAll(@Req() req: any) {
    return this.companiesService.findAll(req.user.tenantId);
  }

  @Get('search')
  search(@Query('q') query: string, @Req() req: any) {
    return this.companiesService.search(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.companiesService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto, @Req() req: any) {
    return this.companiesService.update(id, req.user.tenantId, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.companiesService.remove(id, req.user.tenantId);
  }
}
