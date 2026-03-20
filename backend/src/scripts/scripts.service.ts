import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScriptsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.script.findMany({
      where: { tenantId },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }

  async findByCampaign(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { script: true },
    });
    if (!campaign || !campaign.script) return null;
    return campaign.script;
  }

  async create(data: any) {
    return this.prisma.script.create({ data });
  }

  async findOne(id: string) {
    const script = await this.prisma.script.findUnique({ where: { id } });
    if (!script) throw new NotFoundException('Script not found');
    return script;
  }
}
