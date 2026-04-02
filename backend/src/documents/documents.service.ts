import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // ── Folders ──
  async findAllFolders(tenantId: string) {
    return this.prisma.documentFolder.findMany({
      where: { tenantId },
      include: { _count: { select: { documents: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createFolder(data: any) {
    return this.prisma.documentFolder.create({ data });
  }

  async updateFolder(id: string, data: any) {
    return this.prisma.documentFolder.update({ where: { id }, data });
  }

  async removeFolder(id: string) {
    return this.prisma.documentFolder.delete({ where: { id } });
  }

  // ── Documents ──
  async findAll(tenantId: string, folderId?: string) {
    return this.prisma.document.findMany({
      where: { tenantId, ...(folderId ? { folderId } : {}) },
      include: { folder: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { folder: true },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async create(data: any) {
    return this.prisma.document.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.document.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
