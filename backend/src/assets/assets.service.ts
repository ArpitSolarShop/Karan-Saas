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

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { reservations: { orderBy: { startTime: 'desc' }, take: 20 } },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async create(data: any) {
    return this.prisma.asset.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.asset.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.asset.delete({ where: { id } });
  }

  // Reservations
  async reserve(assetId: string, data: any) {
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
      data: { ...data, assetId, status: 'ACTIVE' },
    });
  }

  async cancelReservation(id: string) {
    return this.prisma.assetReservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async getReservations(assetId: string) {
    return this.prisma.assetReservation.findMany({
      where: { assetId },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { startTime: 'desc' },
    });
  }
}
