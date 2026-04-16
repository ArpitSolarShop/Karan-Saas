import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { SheetsGateway } from './sheets.gateway';
import { FormulaEngineService } from './formula-engine/formula-engine.service';

@Injectable()
export class SheetsService {
  constructor(
    private prisma: PrismaService,
    private sheetsGateway: SheetsGateway,
    private formulaEngine: FormulaEngineService,
  ) {}

  // ── Workbooks ──
  async findAllWorkbooks(tenantId: string) {
    return this.prisma.workbook.findMany({
      where: { tenantId },
      include: { sheets: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWorkbook(data: { name: string; tenantId: string }) {
    return this.prisma.workbook.create({
      data: { name: data.name, tenantId: data.tenantId },
    });
  }

  // ── Sheets ──
  async findSheet(sheetId: string, tenantId: string) {
    const sheet = await this.prisma.sheet.findFirst({
      where: { id: sheetId, tenantId },
      include: {
        columns: { orderBy: { position: 'asc' } },
        views: true,
      },
    });
    if (!sheet) throw new NotFoundException('Sheet not found in this tenant context.');

    // @ts-ignore
    await (this.prisma.sheetView.upsert as any)({
      where: { id: 'view-001' },
      update: { tenantId },
      create: { 
        id: 'view-001', 
        tenantId,
        sheetId: sheet.id, 
        name: 'All Leads', 
        filters: [], 
        sorts: [{ column: 'name', direction: 'asc' }], 
        hiddenColumns: [] 
      },
    });
    return sheet;
  }

  async createSheet(workbookId: string, tenantId: string, data: { name: string }) {
    return this.prisma.sheet.create({
      data: { workbookId, tenantId, name: data.name },
    });
  }

  // ── Columns ──
  async addColumn(
    sheetId: string,
    tenantId: string,
    data: {
      key: string;
      name: string;
      dataType?: string;
      position?: number;
      width?: number;
    },
  ) {
    const maxPos = await this.prisma.sheetColumn.aggregate({
      where: { sheetId, tenantId },
      _max: { position: true },
    });
    return this.prisma.sheetColumn.create({
      data: {
        sheetId,
        tenantId,
        key: data.key,
        name: data.name,
        dataType: (data.dataType as any) || 'TEXT',
        position: data.position ?? (maxPos._max.position || 0) + 1,
        width: data.width || 120,
      },
    });
  }

  async updateColumn(colId: string, tenantId: string, data: any) {
    return this.prisma.sheetColumn.update({ where: { id: colId, tenantId }, data });
  }

  async deleteColumn(colId: string, tenantId: string) {
    return this.prisma.sheetColumn.delete({ where: { id: colId, tenantId } });
  }

  // ── Rows (the core JSONB engine) ──
  async getRows(sheetId: string, tenantId: string, skip = 0, take = 200) {
    const rows = await this.prisma.sheetRow.findMany({
      where: { sheetId, tenantId },
      orderBy: { rowIndex: 'asc' },
      skip,
      take,
    });

    const sheet = await this.prisma.sheet.findFirst({
      where: { id: sheetId, tenantId },
      include: { columns: true },
    });

    if (!sheet) return rows;

    return rows.map((row) => this.formulaEngine.processRow(row, (sheet as any).columns));
  }

  async addRow(sheetId: string, tenantId: string, data: Record<string, any>) {
    await this.ensureColumnsExist(sheetId, tenantId, Object.keys(data));

    // Enterprise Enforcement: Duplicate & DNC Check for Leads Sheets
    const phone = data.phone || data.phone_primary || data.phone_number;
    if (phone) {
      // 1. DNC Check
      const isDnc = await this.prisma.suppression.findFirst({
        where: { phoneE164: String(phone), tenantId },
      });
      if (isDnc) {
        throw new BadRequestException(
          `CRITICAL: Number ${phone} is on the Do-Not-Call (DNC) list. Registration aborted.`,
        );
      }

      // 2. Duplicate Check within this sheet/campaign
      const existing = await this.prisma.sheetRow.findFirst({
        where: {
          sheetId,
          tenantId,
          data: {
            path: ['phone'],
            equals: phone,
          },
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Duplicate blocked: Number ${phone} already exists in this registry.`,
        );
      }
    }

    const maxRow = await this.prisma.sheetRow.aggregate({
      where: { sheetId, tenantId },
      _max: { rowIndex: true },
    });
    const result = await this.prisma.sheetRow.create({
      data: {
        sheetId,
        tenantId,
        rowIndex: (maxRow._max.rowIndex || 0) + 1,
        data,
      },
    });
    this.sheetsGateway.broadcastUpdate('rowUpdated', result);
    return result;
  }

  async bulkAddRows(sheetId: string, tenantId: string, payload: Record<string, any>[]) {
    // Extract all unique keys from all rows in the payload
    const allKeys = Array.from(
      new Set(payload.flatMap((row) => Object.keys(row))),
    );
    await this.ensureColumnsExist(sheetId, tenantId, allKeys);

    const maxRow = await this.prisma.sheetRow.aggregate({
      where: { sheetId, tenantId },
      _max: { rowIndex: true },
    });
    const startIdx = (maxRow._max.rowIndex || 0) + 1;

    const data = payload.map((d, i) => ({
      sheetId,
      tenantId,
      rowIndex: startIdx + i,
      data: d,
    }));

    const result = await this.prisma.sheetRow.createMany({
      data,
      skipDuplicates: true,
    });

    this.sheetsGateway.broadcastUpdate('sheetUpdated', { sheetId });
    return result;
  }

  private async ensureColumnsExist(sheetId: string, tenantId: string, keys: string[]) {
    const log = (msg: string) =>
      fs.appendFileSync(
        'debug-schema.log',
        `[${new Date().toISOString()}] ${msg}\n`,
      );
    log(`Checking keys for sheet ${sheetId}: ${JSON.stringify(keys)}`);

    const existingColumns = await this.prisma.sheetColumn.findMany({
      where: { sheetId, tenantId },
      select: { key: true },
    });

    const existingKeys = new Set(existingColumns.map((c) => c.key));
    const newKeys = keys.filter(
      (k) => !existingKeys.has(k) && k !== 'id' && k !== 'rowIndex',
    );
    log(`New keys detected: ${JSON.stringify(newKeys)}`);

    if (newKeys.length > 0) {
      const maxPos = await this.prisma.sheetColumn.aggregate({
        where: { sheetId, tenantId },
        _max: { position: true },
      });
      const startPos = (maxPos._max.position || 0) + 1;
      log(
        `Creating ${newKeys.length} new columns starting at position ${startPos}`,
      );

      await this.prisma.sheetColumn.createMany({
        data: newKeys.map((key, i) => ({
          sheetId,
          tenantId,
          key,
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          dataType: 'TEXT',
          position: startPos + i,
          width: 150,
        })),
      });
      log(`Successfully created new columns: ${JSON.stringify(newKeys)}`);
      this.sheetsGateway.broadcastUpdate('sheetUpdated', { sheetId });
    }
  }

  async updateCell(rowId: string, tenantId: string, columnKey: string, value: any) {
    // Partial JSONB update: only change one key
    const row = await this.prisma.sheetRow.findFirst({ where: { id: rowId, tenantId } });
    if (!row) throw new NotFoundException('Row not found');

    const updatedData = { ...(row.data as any), [columnKey]: value };
    const result = await this.prisma.sheetRow.update({
      where: { id: rowId, tenantId },
      data: { data: updatedData },
    });
    this.sheetsGateway.broadcastUpdate('rowUpdated', result);
    return result;
  }

  async updateRow(rowId: string, tenantId: string, data: Record<string, any>) {
    const result = await this.prisma.sheetRow.update({
      where: { id: rowId, tenantId },
      data: { data },
    });
    this.sheetsGateway.broadcastUpdate('rowUpdated', result);
    return result;
  }

  async deleteRow(rowId: string, tenantId: string) {
    return this.prisma.sheetRow.delete({ where: { id: rowId, tenantId } });
  }

  // ── Views ──
  async createView(
    sheetId: string,
    tenantId: string,
    data: { name: string; filters?: any; sorts?: any; hiddenColumns?: any },
  ) {
    return this.prisma.sheetView.create({
      data: {
        sheetId,
        tenantId,
        name: data.name,
        filters: data.filters || [],
        sorts: data.sorts || [],
        hiddenColumns: data.hiddenColumns || [],
      },
    });
  }

  async getViews(sheetId: string, tenantId: string) {
    return this.prisma.sheetView.findMany({ where: { sheetId, tenantId } });
  }

  async updateView(viewId: string, tenantId: string, data: any) {
    return this.prisma.sheetView.update({ where: { id: viewId, tenantId }, data });
  }

  async deleteView(viewId: string, tenantId: string) {
    return this.prisma.sheetView.delete({ where: { id: viewId, tenantId } });
  }
}
