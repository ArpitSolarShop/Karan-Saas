import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IvrService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: {
    name: string; description?: string; greeting?: string;
    timeout?: number; retries?: number; nodes?: any; tenantId: string;
  }) {
    return this.prisma.ivrMenu.create({ data });
  }

  async findAll(tenantId: string) {
    return this.prisma.ivrMenu.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async findOne(tenantId: string, id: string) {
      const ivr = await this.prisma.ivrMenu.findFirst({ where: { id, tenantId } });
      if (!ivr) throw new NotFoundException(`IVR Menu ${id} not found`);
      return ivr;
  }

  async update(tenantId: string, id: string, data: any) {
      return this.prisma.ivrMenu.update({ where: { id, tenantId }, data });
  }

  async remove(tenantId: string, id: string) {
      return this.prisma.ivrMenu.delete({ where: { id, tenantId } });
  }
}
