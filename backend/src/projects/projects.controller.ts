import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) { 
    return this.projectsService.create(req.user.tenantId, dto); 
  }

  @Get()
  findAll(@Req() req: any) { 
    return this.projectsService.findAll(req.user.tenantId); 
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { 
    return this.projectsService.findOne(id, req.user.tenantId); 
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { 
    return this.projectsService.update(id, req.user.tenantId, dto); 
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { 
    return this.projectsService.remove(id, req.user.tenantId); 
  }

  @Post(':id/milestones')
  createMilestone(@Req() req: any, @Param('id') id: string, @Body() dto: any) { 
    return this.projectsService.createMilestone(id, req.user.tenantId, dto); 
  }

  @Patch('milestones/:mid')
  updateMilestone(@Req() req: any, @Param('mid') mid: string, @Body() dto: any) { 
    return this.projectsService.updateMilestone(mid, req.user.tenantId, dto); 
  }

  @Delete('milestones/:mid')
  removeMilestone(@Req() req: any, @Param('mid') mid: string) { 
    return this.projectsService.removeMilestone(mid, req.user.tenantId); 
  }
}
