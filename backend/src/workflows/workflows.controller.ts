import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import { WorkflowsService } from './workflows.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.tenantId || req.user.tenantId);
  }

  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.service.create({
      ...data,
      tenantId: req.tenantId || req.user.tenantId,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.service.update(id, req.tenantId || req.user.tenantId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.delete(id, req.tenantId || req.user.tenantId);
  }

  // Manual trigger for testing
  @Post('trigger')
  trigger(@Body() body: { trigger: string; context: any }, @Req() req: any) {
    return this.service.executeRules(body.trigger, {
      ...body.context,
      tenantId: req.tenantId || req.user.tenantId,
    });
  }
}
