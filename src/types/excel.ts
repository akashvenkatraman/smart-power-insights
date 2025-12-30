// Excel data types - standalone without complex unions

export interface SheetInfo {
  name: string;
  rowCount: number;
  colCount: number;
  headers: string[];
  preview: unknown[][];
}

export interface ColumnAnalysis {
  name: string;
  index: number;
  type: 'date' | 'numeric' | 'percentage' | 'currency' | 'text' | 'mixed';
  sampleValues: unknown[];
  nullCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  sum?: number;
  avg?: number;
  unit?: string;
  isPowerSource?: boolean;
  isTimeColumn?: boolean;
  isSummaryColumn?: boolean;
}

export interface ParsedSheet {
  name: string;
  rawData: unknown[][];
  headers: string[];
  columns: ColumnAnalysis[];
  timeColumn?: string;
  timeGranularity?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  powerSources: string[];
  hasSummaryRows: boolean;
  cleanedData: Record<string, unknown>[];
}

export interface ExcelAnalysis {
  fileName: string;
  sheets: SheetInfo[];
  parsedSheets: Record<string, ParsedSheet>;
}
