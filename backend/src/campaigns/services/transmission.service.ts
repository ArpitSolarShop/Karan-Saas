import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransmissionService {
  private readonly logger = new Logger(TransmissionService.name);

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { contactId: string; campaignId: string; serviceType?: string; retriesAllowed?: number }) {
    return this.prisma.transmission.create({
      data: {
        ...data,
        tenantId,
        serviceType: data.serviceType ?? 'VOICE',
        retriesAllowed: data.retriesAllowed ?? 3,
      },
    });
  }

  async findByCampaign(tenantId: string, campaignId: string, status?: string, page = 1, limit = 50) {
    const where: any = { campaignId, tenantId };
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

  async createSpool(tenantId: string, data: { transmissionId: string; phoneDialed?: string; agentId?: string }) {
    return this.prisma.callSpool.create({ data: { ...data, tenantId } });
  }

  async updateSpoolStatus(tenantId: string, spoolId: string, status: any, extra?: any) {
    return this.prisma.callSpool.update({
      where: { id: spoolId, tenantId } as any,
      data: { status, ...extra },
    });
  }

  async addSpoolResult(tenantId: string, spoolId: string, data: { resultType: string; resultData?: any; dispositionCode?: string; notes?: string }) {
    return this.prisma.spoolResult.create({
      data: { ...data, spoolId, tenantId },
    });
  }

  async getTransmissionStats(tenantId: string, campaignId: string) {
    const where = { campaignId, tenantId };
    const [total, pending, processing, completed, failed, retry] = await Promise.all([
      this.prisma.transmission.count({ where }),
      this.prisma.transmission.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.transmission.count({ where: { ...where, status: 'PROCESSING' } }),
      this.prisma.transmission.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.transmission.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.transmission.count({ where: { ...where, status: 'RETRY' } }),
    ]);

    return { total, pending, processing, completed, failed, retry };
  }
}
