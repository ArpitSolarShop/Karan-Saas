import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.asset.findMany({
      where: { tenantId },
      include: { reservations: { where: { status: 'ACTIVE' }, take: 5, orderBy: { startTime: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      include: { reservations: { orderBy: { startTime: 'desc' }, take: 20 } },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async create(tenantId: string, data: any) {
    return this.prisma.asset.create({ data: { ...data, tenantId } });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.asset.update({ where: { id, tenantId }, data });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.asset.delete({ where: { id, tenantId } });
  }

  // Reservations
  async reserve(tenantId: string, userId: string, assetId: string, data: any) {
    const asset = await this.prisma.asset.findFirst({ where: { id: assetId, tenantId }});
    if (!asset) throw new NotFoundException('Asset not found');

    // Check for conflicts
    const conflicts = await this.prisma.assetReservation.findMany({
      where: {
        assetId,
        status: 'ACTIVE',
        OR: [
          { startTime: { lte: new Date(data.endTime) }, endTime: { gte: new Date(data.startTime) } },
        ],
      },
    });
    if (conflicts.length > 0) throw new BadRequestException('Time slot already reserved');

    return this.prisma.assetReservation.create({
      data: { ...data, assetId, userId, status: 'ACTIVE' },
    });
  }

  async cancelReservation(tenantId: string, id: string) {
    const reservation = await this.prisma.assetReservation.findFirst({ where: { id, asset: { tenantId } }});
    if (!reservation) throw new NotFoundException('Reservation not found');
    return this.prisma.assetReservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getReservations(tenantId: string, assetId: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id: assetId, tenantId }});
    if (!asset) throw new NotFoundException('Asset not found');
    return this.prisma.assetReservation.findMany({
      where: { assetId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { startTime: 'desc' },
    });
  }
}
