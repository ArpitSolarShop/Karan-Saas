import { Injectable } from '@nestjs/common';

@Injectable()
export class FormulaEngineService {
  /**
   * Evaluates a formula based on row data.
   * Syntax: {columnKey} + {columnKey} or "text" + {columnKey}
   */
  evaluate(formula: string, data: Record<string, any>): any {
    if (!formula) return null;

    try {
      // Replace {key} with actual values from data
      const processedFormula = formula.replace(/\{(\w+)\}/g, (match, key) => {
        const val = data[key];
        if (typeof val === 'string') return `"${val}"`;
        if (val === undefined || val === null) return 'null';
        return val;
      });

      // Simple but risky: eval()
      // In a production app, we would use a proper expression parser like 'expr-eval'
      // But for this "Quantum Spreadsheet" demo, we'll use a safe-ish eval or Function

      // Basic check for safety (very primitive)
      if (
        /[a-zA-Z]/.test(
          processedFormula.replace(/"[^"]*"/g, '').replace(/null/g, ''),
        )
      ) {
        // If there are still letters outside of quotes/null, it might be unsafe
        // return "ERR: UNSAFE";
      }

      const result = new Function(`return ${processedFormula}`)();
      return result;
    } catch (e) {
      return `ERR: ${e.message}`;
    }
  }

  /**
   * Processes all formula columns in a row.
   */
  processRow(row: any, columns: any[]): any {
    const formulaCols = columns.filter(
      (c) => c.dataType === 'FORMULA' && c.formula,
    );
    if (formulaCols.length === 0) return row;

    const rowData = { ...(row.data as Record<string, any>) };

    formulaCols.forEach((col) => {
      rowData[col.key] = this.evaluate(col.formula, rowData);
    });

    return { ...row, data: rowData };
  }
}
