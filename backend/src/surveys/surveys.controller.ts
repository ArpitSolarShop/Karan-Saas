import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('surveys')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) { 
    return this.surveysService.create(req.user.tenantId, dto); 
  }

  @Get()
  findAll(@Req() req: any) { 
    return this.surveysService.findAll(req.user.tenantId); 
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { 
    return this.surveysService.findOne(id, req.user.tenantId); 
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { 
    return this.surveysService.update(id, req.user.tenantId, dto); 
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { 
    return this.surveysService.remove(id, req.user.tenantId); 
  }

  @Post(':id/questions')
  addQuestion(@Req() req: any, @Param('id') id: string, @Body() dto: any) { 
    return this.surveysService.addQuestion(id, req.user.tenantId, dto); 
  }

  @Patch('questions/:qid')
  updateQuestion(@Req() req: any, @Param('qid') qid: string, @Body() dto: any) { 
    return this.surveysService.updateQuestion(qid, req.user.tenantId, dto); 
  }

  @Delete('questions/:qid')
  removeQuestion(@Req() req: any, @Param('qid') qid: string) { 
    return this.surveysService.removeQuestion(qid, req.user.tenantId); 
  }
}
