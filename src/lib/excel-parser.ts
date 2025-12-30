import * as XLSX from 'xlsx';
import type { SheetInfo, ColumnAnalysis, ParsedSheet, ExcelAnalysis } from '@/types/excel';

// Re-export types
export type { SheetInfo, ColumnAnalysis, ParsedSheet, ExcelAnalysis };

// Power source keywords for detection
const POWER_SOURCE_KEYWORDS = [
  'eb', 'electricity board', 'grid', 'utility',
  'solar', 'pv', 'photovoltaic',
  'wind', 'turbine',
  'dg', 'diesel', 'generator', 'genset',
  'hfo', 'heavy fuel oil', 'furnace oil',
  'captive', 'cogen', 'chp'
];

// Time column detection patterns
const TIME_PATTERNS = {
  date: /^(date|day|timestamp|datetime)$/i,
  month: /^(month|mon|period|billing.?period)$/i,
  year: /^(year|yr|fy|fiscal.?year)$/i,
  week: /^(week|wk)$/i
};

// Unit detection patterns
const UNIT_PATTERNS = {
  kwh: /k?wh|kwhr|kilowatt/i,
  mwh: /mwh|megawatt/i,
  units: /units?|consumption/i,
  cost: /cost|rs\.?|inr|₹|amount|bill|lac|lakh|cr|crore/i,
  percentage: /%|percent|pct|ratio/i,
  fuel: /ltr|litre|liter|gallon|kg|mt|ton/i
};

// Parse numeric value from various formats
export function parseNumericValue(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return null;

  const cleaned = val
    .replace(/[₹$€£,\s]/g, '')
    .replace(/lac|lakh/i, 'e5')
    .replace(/cr|crore/i, 'e7')
    .replace(/%/g, '')
    .trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Check if value is a date string
function isDateString(val: unknown): boolean {
  if (typeof val !== 'string') return false;

  const patterns = [
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/,
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    /^\d{1,2}-(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i
  ];

  return patterns.some(p => p.test(val));
}

// Generate descriptive column name based on data analysis
function inferColumnName(index: number, sampleData: unknown[][], colIndex: number): string {
  const samples = sampleData.slice(0, 10).map(row => (row as unknown[])[colIndex]).filter(v => v !== null && v !== undefined && v !== '');

  // Check if it's a date column
  const dateCount = samples.filter(v => v instanceof Date || isDateString(v)).length;
  if (dateCount > samples.length * 0.5) {
    return `Date_${index + 1}`;
  }

  // Check if it's numeric
  const numericCount = samples.filter(v => typeof v === 'number' || (typeof v === 'string' && parseNumericValue(v) !== null)).length;
  if (numericCount > samples.length * 0.5) {
    return `Value_${index + 1}`;
  }

  // Check for percentage
  const percentCount = samples.filter(v => typeof v === 'string' && String(v).includes('%')).length;
  if (percentCount > samples.length * 0.3) {
    return `Percentage_${index + 1}`;
  }

  return `Field_${index + 1}`;
}

// Parse Excel file and return analysis
export async function parseExcelFile(file: File): Promise<ExcelAnalysis> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const sheets: SheetInfo[] = [];
  const parsedSheets: Record<string, ParsedSheet> = {};

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as unknown[][];

    if (jsonData.length === 0) continue;


    // Check for matrix/horizontal layout (metrics in rows, dates in columns)
    const transposedData = checkAndTransposeMatrix(jsonData);

    // Use transposed data if it was transformed, otherwise original
    const dataToAnalyze = transposedData || jsonData;

    const { headerRowIndex, headers } = detectHeaders(dataToAnalyze);

    sheets.push({
      name: sheetName,
      rowCount: dataToAnalyze.length - headerRowIndex,
      colCount: headers.length,
      headers,
      preview: dataToAnalyze.slice(headerRowIndex, headerRowIndex + 6)
    });

    const parsed = analyzeSheet(sheetName, dataToAnalyze, headerRowIndex, headers);
    parsedSheets[sheetName] = parsed;
  }

  return {
    fileName: file.name,
    sheets,
    parsedSheets
  };
}

// Detect header row and extract headers
function detectHeaders(data: unknown[][]): { headerRowIndex: number; headers: string[] } {
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i] as unknown[];
    if (!row || row.length === 0) continue;

    const nonNullValues = row.filter(v => v !== null && v !== undefined && v !== '');
    const stringValues = nonNullValues.filter(v => typeof v === 'string');

    if (nonNullValues.length >= 2 && stringValues.length / nonNullValues.length > 0.6) {
      return {
        headerRowIndex: i,
        headers: row.map((v, idx) => {
          if (v && String(v).trim()) {
            return String(v).trim();
          }
          return inferColumnName(idx, data.slice(i + 1), idx);
        })
      };
    }
  }

  const firstRow = data[0] as unknown[] | undefined;
  return {
    headerRowIndex: 0,
    headers: firstRow?.map((v, idx) => {
      if (v && String(v).trim()) {
        return String(v).trim();
      }
      return inferColumnName(idx, data.slice(1), idx);
    }) || []
  };
}

// Analyze a sheet and extract column info
function analyzeSheet(
  name: string,
  data: unknown[][],
  headerRowIndex: number,
  headers: string[]
): ParsedSheet {
  const dataRows = data.slice(headerRowIndex + 1).filter(row => {
    const r = row as unknown[];
    return r.some(cell => cell !== null && cell !== undefined && cell !== '');
  });

  const columns: ColumnAnalysis[] = headers.map((header, index) =>
    analyzeColumn(header, index, dataRows)
  );

  const timeColumn = columns.find(c => c.isTimeColumn);
  const timeGranularity = timeColumn ? detectTimeGranularity(timeColumn, dataRows) : undefined;
  const powerSources = detectPowerSources(headers);
  const summaryRowIndices = detectSummaryRows(dataRows);
  const hasSummaryRows = summaryRowIndices.length > 0;

  const cleanedData = dataRows
    .filter((_, idx) => !summaryRowIndices.includes(idx))
    .map(row => {
      const r = row as unknown[];
      const obj: Record<string, unknown> = {};
      headers.forEach((h, i) => {
        obj[h] = r[i] ?? null;
      });
      return obj;
    });

  return {
    name,
    rawData: data,
    headers,
    columns,
    timeColumn: timeColumn?.name,
    timeGranularity,
    powerSources,
    hasSummaryRows,
    cleanedData
  };
}

// Analyze a single column
function analyzeColumn(
  name: string,
  index: number,
  dataRows: unknown[][]
): ColumnAnalysis {
  const values = dataRows.map(row => (row as unknown[])[index]);
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');

  const type = detectColumnType(name, nonNullValues);

  let min: number | undefined;
  let max: number | undefined;
  let sum: number | undefined;
  let avg: number | undefined;

  if (type === 'numeric' || type === 'percentage' || type === 'currency') {
    const nums = nonNullValues
      .map(v => parseNumericValue(v))
      .filter((n): n is number => n !== null);

    if (nums.length > 0) {
      min = Math.min(...nums);
      max = Math.max(...nums);
      sum = nums.reduce((a, b) => a + b, 0);
      avg = sum / nums.length;
    }
  }

  const unit = detectUnit(name);
  const isPowerSource = POWER_SOURCE_KEYWORDS.some(k =>
    name.toLowerCase().includes(k.toLowerCase())
  );
  const isTimeColumn = detectIfTimeColumn(name, nonNullValues);
  const isSummaryColumn = /total|sum|avg|average|grand/i.test(name);

  return {
    name,
    index,
    type,
    sampleValues: nonNullValues.slice(0, 5),
    nullCount: values.length - nonNullValues.length,
    uniqueCount: new Set(nonNullValues.map(String)).size,
    min,
    max,
    sum,
    avg,
    unit,
    isPowerSource,
    isTimeColumn,
    isSummaryColumn
  };
}

// Detect column type
function detectColumnType(name: string, values: unknown[]): ColumnAnalysis['type'] {
  if (values.length === 0) return 'text';

  if (UNIT_PATTERNS.percentage.test(name)) return 'percentage';
  if (UNIT_PATTERNS.cost.test(name)) return 'currency';

  const sampleSize = Math.min(values.length, 20);
  const samples = values.slice(0, sampleSize);

  let dateCount = 0;
  let numCount = 0;
  let percentCount = 0;

  for (const val of samples) {
    if (val instanceof Date || isDateString(val)) {
      dateCount++;
    } else if (typeof val === 'number') {
      numCount++;
    } else if (typeof val === 'string') {
      if (val.includes('%')) {
        percentCount++;
      } else if (parseNumericValue(val) !== null) {
        numCount++;
      }
    }
  }

  const threshold = sampleSize * 0.6;

  if (dateCount > threshold) return 'date';
  if (percentCount > threshold) return 'percentage';
  if (numCount > threshold) return 'numeric';
  if (numCount > 0 && numCount < threshold) return 'mixed';

  return 'text';
}

// Detect if column is a time column
function detectIfTimeColumn(name: string, values: unknown[]): boolean {
  for (const pattern of Object.values(TIME_PATTERNS)) {
    if (pattern.test(name)) return true;
  }

  const samples = values.slice(0, 10);
  const dateCount = samples.filter(v => v instanceof Date || isDateString(v)).length;

  return dateCount > samples.length * 0.6;
}

// Detect unit from column name
function detectUnit(name: string): string | undefined {
  if (UNIT_PATTERNS.kwh.test(name)) return 'kWh';
  if (UNIT_PATTERNS.mwh.test(name)) return 'MWh';
  if (UNIT_PATTERNS.cost.test(name)) return '₹';
  if (UNIT_PATTERNS.percentage.test(name)) return '%';
  if (UNIT_PATTERNS.fuel.test(name)) return 'L';
  if (UNIT_PATTERNS.units.test(name)) return 'units';
  return undefined;
}

// Detect time granularity from data
function detectTimeGranularity(
  timeColumn: ColumnAnalysis,
  dataRows: unknown[][]
): 'daily' | 'weekly' | 'monthly' | 'yearly' {
  const values = dataRows
    .map(row => (row as unknown[])[timeColumn.index])
    .filter(v => v !== null && v !== undefined)
    .slice(0, 10);

  if (values.length < 2) return 'monthly';

  if (TIME_PATTERNS.date.test(timeColumn.name)) return 'daily';
  if (TIME_PATTERNS.week.test(timeColumn.name)) return 'weekly';
  if (TIME_PATTERNS.year.test(timeColumn.name)) return 'yearly';
  if (TIME_PATTERNS.month.test(timeColumn.name)) return 'monthly';

  const monthNames = /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;
  if (values.some(v => typeof v === 'string' && monthNames.test(v))) {
    return 'monthly';
  }

  const dates = values
    .filter((v): v is Date => v instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length >= 2) {
    const diff = dates[1].getTime() - dates[0].getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days <= 2) return 'daily';
    if (days <= 10) return 'weekly';
    if (days <= 45) return 'monthly';
    return 'yearly';
  }

  return 'monthly';
}

// Detect power sources from headers
function detectPowerSources(headers: string[]): string[] {
  const sources: string[] = [];

  for (const header of headers) {
    const lower = header.toLowerCase();

    if (/eb|electricity\s*board|grid|utility/i.test(lower)) {
      sources.push('EB');
    } else if (/solar|pv|photovoltaic/i.test(lower)) {
      sources.push('Solar');
    } else if (/wind|turbine/i.test(lower)) {
      sources.push('Wind');
    } else if (/dg|diesel|generator/i.test(lower)) {
      sources.push('DG');
    } else if (/hfo|heavy\s*fuel|furnace/i.test(lower)) {
      sources.push('HFO');
    }
  }

  return [...new Set(sources)];
}

// Detect summary rows
function detectSummaryRows(dataRows: unknown[][]): number[] {
  const summaryIndices: number[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] as unknown[];
    const firstCell = row[0];

    if (typeof firstCell === 'string') {
      if (/^(total|sum|grand|sub-?total|average|avg|subtotal)/i.test(firstCell.trim())) {
        summaryIndices.push(i);
      }
    }
  }

  return summaryIndices;
}

// Format number for display
export function formatNumber(value: number, unit?: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }

  if (Math.abs(value) >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  }

  if (Math.abs(value) >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  }

  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toFixed(value % 1 === 0 ? 0 : 2);
}

// Get chart-friendly data for a specific metric
export function getChartData(
  sheet: ParsedSheet,
  valueColumn: string,
  groupByColumn?: string
): { name: string; value: number }[] {
  const timeCol = sheet.timeColumn || groupByColumn;
  if (!timeCol) return [];

  return sheet.cleanedData
    .map(row => ({
      name: String(row[timeCol] || ''),
      value: parseNumericValue(row[valueColumn]) || 0
    }))
    .filter(d => d.name && d.value !== 0);
}

// Generate insights from data
export function generateBasicInsights(sheet: ParsedSheet): string[] {
  const insights: string[] = [];

  const numericCols = sheet.columns.filter(c =>
    c.type === 'numeric' && c.sum !== undefined && !c.isSummaryColumn
  );

  for (const col of numericCols.slice(0, 3)) {
    if (col.max !== undefined && col.min !== undefined && col.avg !== undefined) {
      const variance = ((col.max - col.min) / col.avg * 100).toFixed(0);
      if (parseFloat(variance) > 50) {
        insights.push(`High variance (${variance}%) detected in ${col.name}`);
      }
    }
  }

  if (sheet.powerSources.length > 0) {
    insights.push(`Detected power sources: ${sheet.powerSources.join(', ')}`);
  }

  if (sheet.timeGranularity) {
    insights.push(`Data granularity: ${sheet.timeGranularity}`);
  }

  return insights;
}

// Check if data is in matrix format (dates across columns) and transpose if needed
function checkAndTransposeMatrix(data: unknown[][]): unknown[][] | null {
  if (data.length < 2) return null;

  // 1. Identify potential header rows (usually first few rows)
  // Look for a row with many date-like strings
  let dateHeaderRowIndex = -1;
  let dateCountMax = 0;

  // Check first 5 rows
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i] as unknown[];
    if (!row) continue;

    let currentRowDateCount = 0;
    for (const cell of row) {
      if (cell && (isDateString(cell) || cell instanceof Date)) {
        currentRowDateCount++;
      } else if (typeof cell === 'string' && /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(cell)) {
        // Strong indicator for Month-Year headers like "Apr-24"
        currentRowDateCount++;
      }
    }

    // If more than 30% of non-empty cells are dates, it's a strong candidate
    const nonEmptyCount = row.filter(c => c !== null && c !== undefined && c !== '').length;
    if (nonEmptyCount > 2 && currentRowDateCount / nonEmptyCount > 0.3) {
      if (currentRowDateCount > dateCountMax) {
        dateCountMax = currentRowDateCount;
        dateHeaderRowIndex = i;
      }
    }
  }

  // If no date header row found, assume standard vertical format
  if (dateHeaderRowIndex === -1) return null;

  // 2. Check which column contains Metric Names
  // Scan first 3 columns to find the one with the most text strings below the header
  let bestLabelColIndex = -1;
  let maxTextCount = 0;

  const sampleRowsToCheck = Math.min(data.length - dateHeaderRowIndex - 1, 15);
  if (sampleRowsToCheck <= 0) return null;

  for (let colIdx = 0; colIdx < 3; colIdx++) { // Check Col 0, 1, 2
    let textCount = 0;
    for (let i = 1; i <= sampleRowsToCheck; i++) {
      const row = data[dateHeaderRowIndex + i] as unknown[];
      if (!row) continue;
      const cell = row[colIdx];
      // Must be string, not date, longer than 1 char
      if (typeof cell === 'string' && cell.trim().length > 1 && !isDateString(cell) && !/^\d+$/.test(cell.trim())) {
        textCount++;
      }
    }

    if (textCount > maxTextCount) {
      maxTextCount = textCount;
      bestLabelColIndex = colIdx;
    }
  }

  // Threshold: At least 30% of rows should have a label in this column
  if (bestLabelColIndex !== -1 && maxTextCount / sampleRowsToCheck > 0.3) {
    console.log(`Detected Matrix Layout. Label Column: ${bestLabelColIndex}. Transposing...`);
    return transposeData(data, dateHeaderRowIndex, bestLabelColIndex);
  }

  return null;
}

function transposeData(data: unknown[][], headerRowIndex: number, labelColIndex: number): unknown[][] {
  const headers = data[headerRowIndex] as unknown[];
  const newData: unknown[][] = [];

  // Find valid data rows (rows with a label in the identified column)
  const labeledRows = data.slice(headerRowIndex + 1).filter(row => {
    const r = row as unknown[];
    // Strict: Row must have a valid label in the target column
    return r && typeof r[labelColIndex] === 'string' && (r[labelColIndex] as string).trim().length > 0;
  });

  // Extract Metric Names (and handle duplicates if any, though map keys usually handle unique)
  // We'll use the EXACT text from the label column
  const metricNames = labeledRows.map(r => (r as unknown[])[labelColIndex] as string);

  // Create New Header: ["Period", "Metric 1", "Metric 2", ...]
  const newHeaderRow = ["Period", ...metricNames];
  newData.push(newHeaderRow);

  // Iterate through DATE columns of the original data (which will become ROWS)
  for (let colIdx = 0; colIdx < headers.length; colIdx++) {
    // Skip the label column itself (and columns before it/dates that are invalid?)
    // Actually we only want columns that ARE DATES in the header

    const headerCell = headers[colIdx];
    // Check if this specific header column is a Date/Period
    // We relax the check slightly to include "Avg" or "Total" if they are part of the time series structure?
    // Usually just Dates.

    const isDate = headerCell && (isDateString(headerCell) || headerCell instanceof Date || /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(String(headerCell)));

    if (isDate) {
      const newRow: unknown[] = [headerCell]; // First cell is the Period Name

      // Now fetch values for each metric row at this column index
      labeledRows.forEach(originalRow => {
        const r = originalRow as unknown[];
        newRow.push(r[colIdx]);
      });

      newData.push(newRow);
    }
  }

  // Fallback: If no date columns found (unlikely if we passed detection), return null (or newData if it has rows)
  return newData.length > 1 ? newData : null;
}
