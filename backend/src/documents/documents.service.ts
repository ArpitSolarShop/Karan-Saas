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

  async createFolder(tenantId: string, data: any) {
    return this.prisma.documentFolder.create({ 
      data: { ...data, tenantId } 
    });
  }

  async updateFolder(id: string, tenantId: string, data: any) {
    return this.prisma.documentFolder.update({ 
      where: { id, tenantId }, 
      data 
    });
  }

  async removeFolder(id: string, tenantId: string) {
    return this.prisma.documentFolder.delete({ 
      where: { id, tenantId } 
    });
  }

  // ── Documents ──
  async findAll(tenantId: string, folderId?: string) {
    return this.prisma.document.findMany({
      where: { tenantId, ...(folderId ? { folderId } : {}) },
      include: { folder: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, tenantId },
      include: { folder: true },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.document.create({ 
      data: { ...data, tenantId } 
    });
  }

  async update(id: string, tenantId: string, data: any) {
    return this.prisma.document.update({ 
      where: { id, tenantId }, 
      data 
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.document.delete({ 
      where: { id, tenantId } 
    });
  }
}
