import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AssignmentPolicyService } from '../services/assignment-policy.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/assignment-policies')
@UseGuards(JwtAuthGuard)
export class AssignmentPolicyController {
  constructor(private readonly service: AssignmentPolicyService) {}

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.service.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
