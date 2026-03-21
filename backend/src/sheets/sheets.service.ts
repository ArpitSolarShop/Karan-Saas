import { Injectable, NotFoundException } from '@nestjs/common';
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
  async findAllWorkbooks(tenantId?: string) {
    return this.prisma.workbook.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: { sheets: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createWorkbook(data: { name: string; tenantId?: string }) {
    return this.prisma.workbook.create({
      data: { name: data.name, tenantId: data.tenantId || 'dev-tenant-001' },
    });
  }

  // ── Sheets ──
  async findSheet(sheetId: string) {
    const sheet = await this.prisma.sheet.findUnique({
      where: { id: sheetId },
      include: {
        columns: { orderBy: { position: 'asc' } },
        views: true,
      },
    });
    if (!sheet) throw new NotFoundException('Sheet not found');
    return sheet;
  }

  async createSheet(workbookId: string, data: { name: string }) {
    return this.prisma.sheet.create({
      data: { workbookId, name: data.name },
    });
  }

  // ── Columns ──
  async addColumn(
    sheetId: string,
    data: {
      key: string;
      name: string;
      dataType?: string;
      position?: number;
      width?: number;
    },
  ) {
    const maxPos = await this.prisma.sheetColumn.aggregate({
      where: { sheetId },
      _max: { position: true },
    });
    return this.prisma.sheetColumn.create({
      data: {
        sheetId,
        key: data.key,
        name: data.name,
        dataType: (data.dataType as any) || 'TEXT',
        position: data.position ?? (maxPos._max.position || 0) + 1,
        width: data.width || 120,
      },
    });
  }

  async updateColumn(colId: string, data: any) {
    return this.prisma.sheetColumn.update({ where: { id: colId }, data });
  }

  async deleteColumn(colId: string) {
    return this.prisma.sheetColumn.delete({ where: { id: colId } });
  }

  // ── Rows (the core JSONB engine) ──
  async getRows(sheetId: string, skip = 0, take = 200) {
    const rows = await this.prisma.sheetRow.findMany({
      where: { sheetId },
      orderBy: { rowIndex: 'asc' },
      skip,
      take,
    });

    const sheet = await this.prisma.sheet.findUnique({
      where: { id: sheetId },
      include: { columns: true },
    });

    if (!sheet) return rows;

    return rows.map((row) => this.formulaEngine.processRow(row, sheet.columns));
  }

  async addRow(sheetId: string, data: Record<string, any>) {
    await this.ensureColumnsExist(sheetId, Object.keys(data));

    // Enterprise Enforcement: Duplicate & DNC Check for Leads Sheets
    const phone = data.phone || data.phone_primary || data.phone_number;
    if (phone) {
      // 1. DNC Check
      const isDnc = await this.prisma.suppression.findFirst({
        where: { phoneE164: String(phone) },
      });
      if (isDnc) {
        throw new Error(
          `CRITICAL: Number ${phone} is on the Do-Not-Call (DNC) list.`,
        );
      }

      // 2. Duplicate Check within this sheet/campaign
      const existing = await this.prisma.sheetRow.findFirst({
        where: {
          sheetId,
          data: {
            path: ['phone'],
            equals: phone,
          },
        },
      });
      if (existing) {
        throw new Error(
          `Duplicate blocked: Number ${phone} already exists in this sheet.`,
        );
      }
    }

    const maxRow = await this.prisma.sheetRow.aggregate({
      where: { sheetId },
      _max: { rowIndex: true },
    });
    const result = await this.prisma.sheetRow.create({
      data: {
        sheetId,
        rowIndex: (maxRow._max.rowIndex || 0) + 1,
        data,
      },
    });
    this.sheetsGateway.broadcastUpdate('rowUpdated', result);
    return result;
  }

  async bulkAddRows(sheetId: string, payload: Record<string, any>[]) {
    // Extract all unique keys from all rows in the payload
    const allKeys = Array.from(
      new Set(payload.flatMap((row) => Object.keys(row))),
    );
    await this.ensureColumnsExist(sheetId, allKeys);

    const maxRow = await this.prisma.sheetRow.aggregate({
      where: { sheetId },
      _max: { rowIndex: true },
    });
    const startIdx = (maxRow._max.rowIndex || 0) + 1;

    const data = payload.map((d, i) => ({
      sheetId,
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

  private async ensureColumnsExist(sheetId: string, keys: string[]) {
    const log = (msg: string) =>
      fs.appendFileSync(
        'debug-schema.log',
        `[${new Date().toISOString()}] ${msg}\n`,
      );
    log(`Checking keys for sheet ${sheetId}: ${JSON.stringify(keys)}`);

    const existingColumns = await this.prisma.sheetColumn.findMany({
      where: { sheetId },
      select: { key: true },
    });

    const existingKeys = new Set(existingColumns.map((c) => c.key));
    const newKeys = keys.filter(
      (k) => !existingKeys.has(k) && k !== 'id' && k !== 'rowIndex',
    );
    log(`New keys detected: ${JSON.stringify(newKeys)}`);

    if (newKeys.length > 0) {
      const maxPos = await this.prisma.sheetColumn.aggregate({
        where: { sheetId },
        _max: { position: true },
      });
      const startPos = (maxPos._max.position || 0) + 1;
      log(
        `Creating ${newKeys.length} new columns starting at position ${startPos}`,
      );

      await this.prisma.sheetColumn.createMany({
        data: newKeys.map((key, i) => ({
          sheetId,
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

  async updateCell(rowId: string, columnKey: string, value: any) {
    // Partial JSONB update: only change one key
    const row = await this.prisma.sheetRow.findUnique({ where: { id: rowId } });
    if (!row) throw new NotFoundException('Row not found');

    const updatedData = { ...(row.data as any), [columnKey]: value };
    const result = await this.prisma.sheetRow.update({
      where: { id: rowId },
      data: { data: updatedData },
    });
    this.sheetsGateway.broadcastUpdate('rowUpdated', result);
    return result;
  }

  async updateRow(rowId: string, data: Record<string, any>) {
    const result = await this.prisma.sheetRow.update({
      where: { id: rowId },
      data: { data },
    });
    this.sheetsGateway.broadcastUpdate('rowUpdated', result);
    return result;
  }

  async deleteRow(rowId: string) {
    return this.prisma.sheetRow.delete({ where: { id: rowId } });
  }

  // ── Views ──
  async createView(
    sheetId: string,
    data: { name: string; filters?: any; sorts?: any; hiddenColumns?: any },
  ) {
    return this.prisma.sheetView.create({
      data: {
        sheetId,
        name: data.name,
        filters: data.filters || [],
        sorts: data.sorts || [],
        hiddenColumns: data.hiddenColumns || [],
      },
    });
  }

  async getViews(sheetId: string) {
    return this.prisma.sheetView.findMany({ where: { sheetId } });
  }

  async updateView(viewId: string, data: any) {
    return this.prisma.sheetView.update({ where: { id: viewId }, data });
  }

  async deleteView(viewId: string) {
    return this.prisma.sheetView.delete({ where: { id: viewId } });
  }
}
