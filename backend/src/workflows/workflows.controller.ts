import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkflowsService } from './workflows.service';

@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.delete(id); }

  // Manual trigger for testing
  @Post('trigger')
  trigger(@Body() body: { trigger: string; context: any }) {
    return this.service.executeRules(body.trigger, body.context);
  }
}
