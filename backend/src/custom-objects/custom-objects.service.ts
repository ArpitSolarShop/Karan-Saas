import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomObjectsService {
  constructor(private prisma: PrismaService) {}

  // ── Schemas ──
  async findAllSchemas(tenantId: string) {
    return this.prisma.customObjectSchema.findMany({
      where: { tenantId },
      include: { _count: { select: { records: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneSchema(id: string) {
    const schema = await this.prisma.customObjectSchema.findUnique({
      where: { id },
      include: { records: { take: 50, orderBy: { createdAt: 'desc' } } },
    });
    if (!schema) throw new NotFoundException('Custom object schema not found');
    return schema;
  }

  async createSchema(data: any) {
    return this.prisma.customObjectSchema.create({ data });
  }

  async updateSchema(id: string, data: any) {
    return this.prisma.customObjectSchema.update({ where: { id }, data });
  }

  async removeSchema(id: string) {
    await this.prisma.customObjectRecord.deleteMany({ where: { schemaId: id } });
    return this.prisma.customObjectSchema.delete({ where: { id } });
  }

  // ── Records ──
  async findAllRecords(schemaId: string) {
    return this.prisma.customObjectRecord.findMany({
      where: { schemaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRecord(schemaId: string, data: any) {
    return this.prisma.customObjectRecord.create({
      data: { schemaId, data: data.data || data },
    });
  }

  async updateRecord(id: string, data: any) {
    return this.prisma.customObjectRecord.update({
      where: { id },
      data: { data: data.data || data },
    });
  }

  async removeRecord(id: string) {
    return this.prisma.customObjectRecord.delete({ where: { id } });
  }
}
