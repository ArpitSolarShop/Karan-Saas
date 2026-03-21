import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { leadId: string; agentId: string; note: string }) {
    return this.prisma.note.create({
      data: {
        leadId: data.leadId,
        agentId: data.agentId,
        note: data.note,
      },
    });
  }

  async findByLead(leadId: string) {
    return this.prisma.note.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
