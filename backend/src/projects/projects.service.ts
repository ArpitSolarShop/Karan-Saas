import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId },
      include: { milestones: true, company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { milestones: true, company: { select: { name: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(data: any) {
    return this.prisma.project.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  // Milestones
  async createMilestone(projectId: string, data: any) {
    return this.prisma.projectMilestone.create({
      data: { ...data, projectId },
    });
  }

  async updateMilestone(id: string, data: any) {
    return this.prisma.projectMilestone.update({ where: { id }, data });
  }

  async removeMilestone(id: string) {
    return this.prisma.projectMilestone.delete({ where: { id } });
  }
}
