import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronDown, FileSpreadsheet, Grid3X3, Calendar, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SheetInfo, ColumnAnalysis } from '@/types/excel';
import { Button } from '@/components/ui/button';

interface SheetSelectorProps {
  sheets: SheetInfo[];
  selectedSheets: string[];
  onSelectionChange: (sheets: string[]) => void;
  columns?: Record<string, ColumnAnalysis[]>;
  selectedColumns?: string[];
  onColumnsChange?: (columns: string[]) => void;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheets,
  selectedSheets,
  onSelectionChange,
  columns,
  selectedColumns = [],
  onColumnsChange
}) => {
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);

  const toggleSheet = (sheetName: string) => {
    if (selectedSheets.includes(sheetName)) {
      onSelectionChange(selectedSheets.filter(s => s !== sheetName));
    } else {
      onSelectionChange([...selectedSheets, sheetName]);
    }
  };

  const toggleColumn = (columnName: string) => {
    if (!onColumnsChange) return;
    if (selectedColumns.includes(columnName)) {
      onColumnsChange(selectedColumns.filter(c => c !== columnName));
    } else {
      onColumnsChange([...selectedColumns, columnName]);
    }
  };

  const getColumnIcon = (col: ColumnAnalysis) => {
    if (col.isTimeColumn) return <Calendar className="w-3.5 h-3.5" />;
    if (col.isPowerSource) return <Zap className="w-3.5 h-3.5" />;
    if (col.type === 'numeric' || col.type === 'currency') return <Grid3X3 className="w-3.5 h-3.5" />;
    return null;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      date: 'Date',
      numeric: 'Number',
      percentage: '%',
      currency: '₹',
      text: 'Text',
      mixed: 'Mixed'
    };
    return labels[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Select Sheets to Analyze</h3>
        <span className="text-sm text-muted-foreground">
          {selectedSheets.length} of {sheets.length} selected
        </span>
      </div>

      <div className="space-y-3">
        {sheets.map((sheet, index) => {
          const isSelected = selectedSheets.includes(sheet.name);
          const isExpanded = expandedSheet === sheet.name;
          const sheetColumns = columns?.[sheet.name] || [];

          return (
            <motion.div
              key={sheet.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'glass-card rounded-xl border transition-all duration-200',
                isSelected ? 'border-primary/50' : 'border-border/50'
              )}
            >
              {/* Sheet Header */}
              <div
                className="flex items-center p-4 cursor-pointer"
                onClick={() => toggleSheet(sheet.name)}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center mr-3 transition-colors',
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/40 hover:border-primary/60'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground truncate">{sheet.name}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{sheet.rowCount} rows</span>
                    <span>{sheet.colCount} columns</span>
                    <span>{sheet.headers.slice(0, 3).join(', ')}...</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSheet(isExpanded ? null : sheet.name);
                  }}
                  className="ml-2"
                >
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </Button>
              </div>

              {/* Columns Section */}
              {isExpanded && sheetColumns.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border/30 p-4"
                >
                  <p className="text-sm text-muted-foreground mb-3">Select columns to analyze:</p>
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Numeric Columns Group */}
                    {sheetColumns.filter(c => c.type === 'numeric' || c.type === 'currency').length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Metrics & Data</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {sheetColumns.filter(c => c.type === 'numeric' || c.type === 'currency').map((col) => {
                            const isColSelected = selectedColumns.includes(col.name);
                            return (
                              <button
                                key={col.name}
                                onClick={() => toggleColumn(col.name)}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                                  isColSelected
                                    ? 'bg-primary/20 text-primary border border-primary/40'
                                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent'
                                )}
                              >
                                {getColumnIcon(col)}
                                <span className="truncate flex-1">{col.name}</span>
                                {/* <span className="text-xs opacity-60">{getTypeLabel(col.type)}</span> */}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Other Columns Group */}
                    {sheetColumns.filter(c => c.type !== 'numeric' && c.type !== 'currency').length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground/70 mb-2 uppercase tracking-wider">Attributes & Labels</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {sheetColumns.filter(c => c.type !== 'numeric' && c.type !== 'currency').map((col) => {
                            const isColSelected = selectedColumns.includes(col.name);
                            return (
                              <button
                                key={col.name}
                                onClick={() => toggleColumn(col.name)}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                                  isColSelected
                                    ? 'bg-primary/20 text-primary border border-primary/40'
                                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent'
                                )}
                              >
                                {getColumnIcon(col)}
                                <span className="truncate flex-1">{col.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
