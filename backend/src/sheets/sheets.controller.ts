import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SheetsService } from './sheets.service';

import { Req } from '@nestjs/common';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller()
export class SheetsController {
  constructor(private service: SheetsService) {}

  // â”€â”€ Workbooks â”€â”€
  @Get('workbooks')
  findAllWorkbooks(@Req() req: any) {
    return this.service.findAllWorkbooks(req.user.tenantId);
  }

  @Post('workbooks')
  createWorkbook(@Body() body: { name: string }, @Req() req: any) {
    return this.service.createWorkbook({ ...body, tenantId: req.user.tenantId });
  }

  // â”€â”€ Sheets â”€â”€
  @Get('sheets/:id')
  findSheet(@Param('id') id: string, @Req() req: any) {
    return this.service.findSheet(id, req.user.tenantId);
  }

  @Post('workbooks/:workbookId/sheets')
  createSheet(
    @Param('workbookId') workbookId: string,
    @Body() body: { name: string },
    @Req() req: any,
  ) {
    return this.service.createSheet(workbookId, req.user.tenantId, body);
  }

  // â”€â”€ Columns â”€â”€
  @Post('sheets/:sheetId/columns')
  addColumn(@Param('sheetId') sheetId: string, @Body() body: any, @Req() req: any) {
    return this.service.addColumn(sheetId, req.user.tenantId, body);
  }

  @Patch('columns/:id')
  updateColumn(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.updateColumn(id, req.user.tenantId, body);
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteColumn(id, req.user.tenantId);
  }

  // â”€â”€ Rows â”€â”€
  @Get('sheets/:sheetId/rows')
  getRows(
    @Param('sheetId') sheetId: string,
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.service.getRows(
      sheetId,
      req.user.tenantId,
      Number(skip) || 0,
      Number(take) || 200,
    );
  }

  @Post('sheets/:sheetId/rows')
  addRow(@Param('sheetId') sheetId: string, @Body() body: Record<string, any>, @Req() req: any) {
    return this.service.addRow(sheetId, req.user.tenantId, body);
  }

  @Post('sheets/:sheetId/import')
  bulkAddRows(
    @Param('sheetId') sheetId: string,
    @Body() body: Record<string, any>[],
    @Req() req: any,
  ) {
    return this.service.bulkAddRows(sheetId, req.user.tenantId, body);
  }

  @Patch('rows/:rowId/cell')
  updateCell(
    @Param('rowId') rowId: string,
    @Body() body: { column: string; value: any },
    @Req() req: any,
  ) {
    return this.service.updateCell(rowId, req.user.tenantId, body.column, body.value);
  }

  @Patch('rows/:rowId')
  updateRow(@Param('rowId') rowId: string, @Body() body: Record<string, any>, @Req() req: any) {
    return this.service.updateRow(rowId, req.user.tenantId, body);
  }

  @Delete('rows/:rowId')
  deleteRow(@Param('rowId') rowId: string, @Req() req: any) {
    return this.service.deleteRow(rowId, req.user.tenantId);
  }

  // â”€â”€ Views â”€â”€
  @Get('sheets/:sheetId/views')
  getViews(@Param('sheetId') sheetId: string, @Req() req: any) {
    return this.service.getViews(sheetId, req.user.tenantId);
  }

  @Post('sheets/:sheetId/views')
  createView(@Param('sheetId') sheetId: string, @Body() body: any, @Req() req: any) {
    return this.service.createView(sheetId, req.user.tenantId, body);
  }

  @Patch('views/:id')
  updateView(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.service.updateView(id, req.user.tenantId, body);
  }

  @Delete('views/:id')
  deleteView(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteView(id, req.user.tenantId);
  }
}
