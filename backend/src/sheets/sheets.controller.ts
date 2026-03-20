import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { SheetsService } from './sheets.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class SheetsController {
  constructor(private service: SheetsService) {}

  // â”€â”€ Workbooks â”€â”€
  @Get('workbooks')
  findAllWorkbooks() { return this.service.findAllWorkbooks(); }

  @Post('workbooks')
  createWorkbook(@Body() body: { name: string }) { return this.service.createWorkbook(body); }

  // â”€â”€ Sheets â”€â”€
  @Get('sheets/:id')
  findSheet(@Param('id') id: string) { return this.service.findSheet(id); }

  @Post('workbooks/:workbookId/sheets')
  createSheet(@Param('workbookId') workbookId: string, @Body() body: { name: string }) {
    return this.service.createSheet(workbookId, body);
  }

  // â”€â”€ Columns â”€â”€
  @Post('sheets/:sheetId/columns')
  addColumn(@Param('sheetId') sheetId: string, @Body() body: any) {
    return this.service.addColumn(sheetId, body);
  }

  @Patch('columns/:id')
  updateColumn(@Param('id') id: string, @Body() body: any) {
    return this.service.updateColumn(id, body);
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id') id: string) { return this.service.deleteColumn(id); }

  // â”€â”€ Rows â”€â”€
  @Get('sheets/:sheetId/rows')
  getRows(@Param('sheetId') sheetId: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.service.getRows(sheetId, Number(skip) || 0, Number(take) || 200);
  }

  @Post('sheets/:sheetId/rows')
  addRow(@Param('sheetId') sheetId: string, @Body() body: Record<string, any>) {
    return this.service.addRow(sheetId, body);
  }

  @Post('sheets/:sheetId/import')
  bulkAddRows(@Param('sheetId') sheetId: string, @Body() body: Record<string, any>[]) {
    return this.service.bulkAddRows(sheetId, body);
  }

  @Patch('rows/:rowId/cell')
  updateCell(@Param('rowId') rowId: string, @Body() body: { column: string; value: any }) {
    return this.service.updateCell(rowId, body.column, body.value);
  }

  @Patch('rows/:rowId')
  updateRow(@Param('rowId') rowId: string, @Body() body: Record<string, any>) {
    return this.service.updateRow(rowId, body);
  }

  @Delete('rows/:rowId')
  deleteRow(@Param('rowId') rowId: string) { return this.service.deleteRow(rowId); }

  // â”€â”€ Views â”€â”€
  @Get('sheets/:sheetId/views')
  getViews(@Param('sheetId') sheetId: string) { return this.service.getViews(sheetId); }

  @Post('sheets/:sheetId/views')
  createView(@Param('sheetId') sheetId: string, @Body() body: any) {
    return this.service.createView(sheetId, body);
  }

  @Patch('views/:id')
  updateView(@Param('id') id: string, @Body() body: any) { return this.service.updateView(id, body); }

  @Delete('views/:id')
  deleteView(@Param('id') id: string) { return this.service.deleteView(id); }
}

