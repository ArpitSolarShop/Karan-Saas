import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async createArticle(tenantId: string, authorId: string, data: any) {
    return this.prisma.knowledgeArticle.create({
      data: {
        tenantId,
        authorId,
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/ /g, '-'),
        content: data.content,
        category: data.category,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      },
    });
  }

  async getArticles(tenantId: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: { tenantId },
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getArticleBySlug(tenantId: string, slug: string) {
    const article = await this.prisma.knowledgeArticle.findFirst({
      where: { tenantId, slug },
    });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async updateArticle(id: string, tenantId: string, data: any) {
    return this.prisma.knowledgeArticle.updateMany({
      where: { id, tenantId },
      data,
    });
  }

  async deleteArticle(id: string, tenantId: string) {
    return this.prisma.knowledgeArticle.deleteMany({
      where: { id, tenantId },
    });
  }
}
