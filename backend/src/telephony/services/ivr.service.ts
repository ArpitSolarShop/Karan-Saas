import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IvrService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string; description?: string; greeting?: string;
    timeout?: number; retries?: number; nodes?: any; tenantId: string;
  }) {
    return this.prisma.ivrMenu.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.ivrMenu.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const ivr = await this.prisma.ivrMenu.findUnique({ where: { id } });
    if (!ivr) throw new NotFoundException(`IVR Menu ${id} not found`);
    return ivr;
  }

  async update(id: string, data: any) {
    return this.prisma.ivrMenu.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.ivrMenu.delete({ where: { id } });
  }
}
