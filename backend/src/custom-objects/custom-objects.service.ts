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

  async findOneSchema(tenantId: string, id: string) {
    const schema = await this.prisma.customObjectSchema.findFirst({
      where: { id, tenantId },
      include: { records: { take: 50, orderBy: { createdAt: 'desc' } } },
    });
    if (!schema) throw new NotFoundException('Custom object schema not found');
    return schema;
  }

  async createSchema(tenantId: string, data: any) {
    return this.prisma.customObjectSchema.create({ data: { ...data, tenantId } });
  }

  async updateSchema(tenantId: string, id: string, data: any) {
    return this.prisma.customObjectSchema.update({ where: { id, tenantId }, data });
  }

  async removeSchema(tenantId: string, id: string) {
    await this.prisma.customObjectRecord.deleteMany({ where: { schema: { id, tenantId } } });
    return this.prisma.customObjectSchema.delete({ where: { id, tenantId } });
  }

  // ── Records ──
  async findAllRecords(tenantId: string, schemaId: string) {
    const schema = await this.prisma.customObjectSchema.findFirst({ where: { id: schemaId, tenantId }});
    if (!schema) throw new NotFoundException('Schema not found');
    return this.prisma.customObjectRecord.findMany({
      where: { schemaId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRecord(tenantId: string, schemaId: string, data: any) {
    const schema = await this.prisma.customObjectSchema.findFirst({ where: { id: schemaId, tenantId }});
    if (!schema) throw new NotFoundException('Schema not found');
    return this.prisma.customObjectRecord.create({
      data: { schemaId, data: data.data || data },
    });
  }

  async updateRecord(tenantId: string, id: string, data: any) {
    const record = await this.prisma.customObjectRecord.findFirst({ where: { id, schema: { tenantId } }});
    if (!record) throw new NotFoundException('Record not found');
    return this.prisma.customObjectRecord.update({
      where: { id },
      data: { data: data.data || data },
    });
  }

  async removeRecord(tenantId: string, id: string) {
    const record = await this.prisma.customObjectRecord.findFirst({ where: { id, schema: { tenantId } }});
    if (!record) throw new NotFoundException('Record not found');
    return this.prisma.customObjectRecord.delete({ where: { id } });
  }
}
