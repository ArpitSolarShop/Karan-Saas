import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('custom-fields')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Post()
  create(@Req() req: any, @Body() createCustomFieldDto: CreateCustomFieldDto) {
    return this.customFieldsService.create(req.user.tenantId, createCustomFieldDto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('entityType') entityType?: string
  ) {
    return this.customFieldsService.findAll(req.user.tenantId, entityType);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.customFieldsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateCustomFieldDto: UpdateCustomFieldDto) {
    return this.customFieldsService.update(id, req.user.tenantId, updateCustomFieldDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.customFieldsService.remove(id, req.user.tenantId);
  }
}
