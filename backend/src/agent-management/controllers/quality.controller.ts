import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { QualityService } from '../services/quality.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('agent-management/quality')
@UseGuards(JwtAuthGuard)
export class QualityController {
  constructor(private readonly service: QualityService) {}

  // Forms
  @Post('forms')
  createForm(@Body() body: any) { return this.service.createForm(body); }

  @Get('forms')
  findAllForms(@Query('tenantId') tenantId: string) { return this.service.findAllForms(tenantId); }

  @Get('forms/:id')
  findOneForm(@Param('id') id: string) { return this.service.findOneForm(id); }

  @Patch('forms/:id')
  updateForm(@Param('id') id: string, @Body() body: any) { return this.service.updateForm(id, body); }

  @Delete('forms/:id')
  deleteForm(@Param('id') id: string) { return this.service.deleteForm(id); }

  // Evaluations
  @Post('evaluations')
  createEval(@Body() body: any) { return this.service.createEvaluation(body); }

  @Get('evaluations')
  findEvals(@Query('tenantId') tenantId: string, @Query('agentId') agentId?: string, @Query('page') page?: string) {
    return this.service.findEvaluations(tenantId, agentId, page ? parseInt(page) : 1);
  }

  @Get('evaluations/agent/:agentId/stats')
  getAgentStats(@Param('agentId') agentId: string) { return this.service.getAgentQualityStats(agentId); }
}
