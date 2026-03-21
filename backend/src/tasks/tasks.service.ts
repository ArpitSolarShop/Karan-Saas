import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    leadId?: string;
    assignedTo: string;
    title: string;
    dueDate: Date;
    notes?: string;
  }) {
    return this.prisma.task.create({
      data: {
        leadId: data.leadId,
        assignedTo: data.assignedTo,
        title: data.title,
        dueDate: data.dueDate,
        notes: data.notes,
        status: 'PENDING',
      },
    });
  }

  async findByLead(leadId: string) {
    return this.prisma.task.findMany({
      where: { leadId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
