import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: any) { return this.projectsService.create(dto); }

  @Get()
  findAll(@Query('tenantId') tenantId: string) { return this.projectsService.findAll(tenantId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.projectsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.projectsService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.projectsService.remove(id); }

  @Post(':id/milestones')
  createMilestone(@Param('id') id: string, @Body() dto: any) { return this.projectsService.createMilestone(id, dto); }

  @Patch('milestones/:mid')
  updateMilestone(@Param('mid') mid: string, @Body() dto: any) { return this.projectsService.updateMilestone(mid, dto); }

  @Delete('milestones/:mid')
  removeMilestone(@Param('mid') mid: string) { return this.projectsService.removeMilestone(mid); }
}
