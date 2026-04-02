import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.survey.findMany({
      where: { tenantId },
      include: { questions: { orderBy: { order: 'asc' } }, _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!survey) throw new NotFoundException('Survey not found');
    return survey;
  }

  async create(data: any) {
    const { questions, ...surveyData } = data;
    return this.prisma.survey.create({
      data: {
        ...surveyData,
        questions: questions?.length ? { create: questions } : undefined,
      },
      include: { questions: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.survey.update({ where: { id }, data });
  }

  async remove(id: string) {
    // Delete questions first (cascade should handle this, but just in case)
    await this.prisma.surveyQuestion.deleteMany({ where: { surveyId: id } });
    return this.prisma.survey.delete({ where: { id } });
  }

  // Questions
  async addQuestion(surveyId: string, data: any) {
    return this.prisma.surveyQuestion.create({
      data: { ...data, surveyId },
    });
  }

  async updateQuestion(id: string, data: any) {
    return this.prisma.surveyQuestion.update({ where: { id }, data });
  }

  async removeQuestion(id: string) {
    return this.prisma.surveyQuestion.delete({ where: { id } });
  }
}
