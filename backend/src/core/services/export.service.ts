import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';

@Injectable()
export class ExportService {
  /**
   * Generates a CSV string from an array of objects
   */
  async generateCsv(data: any[], headers?: string[]): Promise<string> {
    if (!data || data.length === 0) return '';
    
    const columns = headers || Object.keys(data[0]);
    const headerRow = columns.join(',');
    
    const rows = data.map(item => {
      return columns.map(col => {
        const val = item[col] === null || item[col] === undefined ? '' : item[col];
        // Escape quotes and wrap in quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    return [headerRow, ...rows].join('\n');
  }

  /**
   * Generates an Excel buffer from an array of objects
   */
  async generateExcelBuffer(data: any[], sheetName = 'Sheet1'): Promise<Buffer> {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
