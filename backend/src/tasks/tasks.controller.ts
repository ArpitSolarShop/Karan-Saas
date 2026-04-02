import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() body: any) {
    return this.tasksService.create(body);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string) {
    return this.tasksService.findByLead(leadId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
