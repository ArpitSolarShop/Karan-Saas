import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async getNextNumber(tenantId: string, entityType: string): Promise<string> {
    const sequence = await this.numberSequence.upsert({
      where: { tenantId_entityType: { tenantId, entityType } },
      update: { nextNumber: { increment: 1 } },
      create: {
        tenantId,
        entityType,
        prefix:
          entityType === 'INVOICE'
            ? 'INV'
            : entityType === 'ORDER'
              ? 'ORD'
              : entityType === 'QUOTE'
                ? 'QT'
                : 'SEQ',
        nextNumber: 2,
      },
    });

    const num = (sequence.nextNumber - 1)
      .toString()
      .padStart(sequence.padding, '0');
    const year = new Date().getFullYear();
    return `${sequence.prefix}-${year}-${num}${sequence.suffix || ''}`;
  }
}
