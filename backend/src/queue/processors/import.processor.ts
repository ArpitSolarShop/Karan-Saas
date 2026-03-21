import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUES } from '../queue.constants';

@Processor('import')
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('processImport')
  async handleImport(job: any) {
    const { sheetId, rows, tenantId } = job.data;
    this.logger.log(
      `[Import] Starting import of ${rows.length} rows for sheet ${sheetId}`,
    );

    let inserted = 0;
    let skipped = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      for (const row of batch) {
        try {
          // Deduplication: check phone or email
          const existing = await this.prisma.lead.findFirst({
            where: {
              tenantId,
              OR: [
                row.phone ? { phone: row.phone } : undefined,
                row.email ? { email: row.email } : undefined,
              ].filter(Boolean) as any,
            },
          });
          if (existing) {
            skipped++;
            continue;
          }

          await this.prisma.lead.create({
            data: {
              tenantId,
              name: row.name || row.firstName || 'Unknown',
              firstName: row.firstName || '',
              phone: row.phone || '',
              email: row.email || '',
              source: row.source || 'IMPORT',
              status: 'NEW',
              customFields: row,
            },
          });
          inserted++;
        } catch (e) {
          this.logger.warn(`[Import] Skipped row: ${(e as Error).message}`);
          skipped++;
        }
      }
      // Update job progress
      await job.progress(Math.round(((i + batch.length) / rows.length) * 100));
    }

    this.logger.log(
      `[Import] Completed: ${inserted} inserted, ${skipped} skipped`,
    );
    return { inserted, skipped };
  }
}
