import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.tasksService.create({
      ...body,
      tenantId: req.user.tenantId,
    }, req.user?.id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.tasksService.findAll(req.user.tenantId);
  }

  @Get('lead/:leadId')
  findByLead(@Req() req: any, @Param('leadId') leadId: string) {
    return this.tasksService.findByLead(leadId, req.user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.tasksService.update(id, req.user.tenantId, body, req.user?.id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.tasksService.remove(id, req.user.tenantId);
  }
}
