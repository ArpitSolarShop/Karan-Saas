import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransmissionService {
  private readonly logger = new Logger(TransmissionService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { contactId: string; campaignId: string; serviceType?: string; tenantId: string; retriesAllowed?: number }) {
    return this.prisma.transmission.create({
      data: {
        contactId: data.contactId, campaignId: data.campaignId,
        serviceType: data.serviceType ?? 'VOICE', tenantId: data.tenantId,
        retriesAllowed: data.retriesAllowed ?? 3,
      },
    });
  }

  async findByCampaign(campaignId: string, status?: string, page = 1, limit = 50) {
    const where: any = { campaignId };
    if (status) where.status = status;

    const [records, total] = await Promise.all([
      this.prisma.transmission.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: {
          contact: { select: { firstName: true, lastName: true, phone: true } },
          spools: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transmission.count({ where }),
    ]);

    return { records, total, page, limit };
  }

  async createSpool(data: { transmissionId: string; phoneDialed?: string; agentId?: string; tenantId: string }) {
    return this.prisma.callSpool.create({ data });
  }

  async updateSpoolStatus(spoolId: string, status: any, extra?: any) {
    return this.prisma.callSpool.update({
      where: { id: spoolId },
      data: { status, ...extra },
    });
  }

  async addSpoolResult(spoolId: string, data: { resultType: string; resultData?: any; dispositionCode?: string; notes?: string }) {
    return this.prisma.spoolResult.create({
      data: { spoolId, ...data },
    });
  }

  async getTransmissionStats(campaignId: string) {
    const [total, pending, processing, completed, failed, retry] = await Promise.all([
      this.prisma.transmission.count({ where: { campaignId } }),
      this.prisma.transmission.count({ where: { campaignId, status: 'PENDING' } }),
      this.prisma.transmission.count({ where: { campaignId, status: 'PROCESSING' } }),
      this.prisma.transmission.count({ where: { campaignId, status: 'COMPLETED' } }),
      this.prisma.transmission.count({ where: { campaignId, status: 'FAILED' } }),
      this.prisma.transmission.count({ where: { campaignId, status: 'RETRY' } }),
    ]);

    return { total, pending, processing, completed, failed, retry };
  }
}
