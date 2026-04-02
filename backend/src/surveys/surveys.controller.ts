import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SurveysService } from './surveys.service';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  create(@Body() dto: any) { return this.surveysService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.surveysService.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.surveysService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.surveysService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.surveysService.remove(id); }

  @Post(':id/questions')
  addQuestion(@Param('id') id: string, @Body() dto: any) { return this.surveysService.addQuestion(id, dto); }

  @Patch('questions/:qid')
  updateQuestion(@Param('qid') qid: string, @Body() dto: any) { return this.surveysService.updateQuestion(qid, dto); }

  @Delete('questions/:qid')
  removeQuestion(@Param('qid') qid: string) { return this.surveysService.removeQuestion(qid); }
}
