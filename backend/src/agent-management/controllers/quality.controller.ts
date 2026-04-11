import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { QualityService } from '../services/quality.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TenantGuard } from "../../auth/tenant.guard";

@Controller('agent-management/quality')
@UseGuards(JwtAuthGuard, TenantGuard)
export class QualityController {
  constructor(private readonly service: QualityService) {}

  // Forms
  @Post('forms')
  createForm(@Req() req: any, @Body() body: any) { return this.service.createForm(req.user.tenantId, body); }

  @Get('forms')
  findAllForms(@Req() req: any) { return this.service.findAllForms(req.user.tenantId); }

  @Get('forms/:id')
  findOneForm(@Req() req: any, @Param('id') id: string) { return this.service.findOneForm(req.user.tenantId, id); }

  @Patch('forms/:id')
  updateForm(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.updateForm(req.user.tenantId, id, body); }

  @Delete('forms/:id')
  deleteForm(@Req() req: any, @Param('id') id: string) { return this.service.deleteForm(req.user.tenantId, id); }

  // Evaluations
  @Post('evaluations')
  createEval(@Req() req: any, @Body() body: any) { return this.service.createEvaluation(req.user.tenantId, body); }

  @Get('evaluations')
  findEvals(@Req() req: any, @Query('agentId') agentId?: string, @Query('page') page?: string) {
    return this.service.findEvaluations(req.user.tenantId, agentId, page ? parseInt(page) : 1);
  }

  @Get('evaluations/agent/:agentId/stats')
  getAgentStats(@Req() req: any, @Param('agentId') agentId: string) { return this.service.getAgentQualityStats(req.user.tenantId, agentId); }
}
