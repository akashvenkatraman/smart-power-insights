import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, TrendingUp, Fuel } from 'lucide-react';
import { Header } from '@/components/Header';
import { FileUploadZone } from '@/components/FileUploadZone';
import { SheetSelector } from '@/components/SheetSelector';
import { ObjectiveSelector } from '@/components/ObjectiveSelector';
import { KPIGrid } from '@/components/KPICard';
import { ChartCard, TrendChart, BarChartComponent, PieChartComponent, AreaChartComponent } from '@/components/Charts';
import { InsightsPanel, generateInsights } from '@/components/InsightsPanel';
import { ExportButtons } from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { parseExcelFile, ExcelAnalysis, ParsedSheet, parseNumericValue } from '@/lib/excel-parser';
import { AnalysisObjective, UploadState, Insight } from '@/types/analytics';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [analysis, setAnalysis] = useState<ExcelAnalysis | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [objective, setObjective] = useState<AnalysisObjective | null>(null);
  const [step, setStep] = useState<'upload' | 'configure' | 'dashboard'>('upload');
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadState({ status: 'uploading', progress: 10 });
    
    try {
      setUploadState({ status: 'parsing', progress: 30 });
      const result = await parseExcelFile(file);
      
      setUploadState({ status: 'analyzing', progress: 70 });
      await new Promise(r => setTimeout(r, 500));
      
      setAnalysis(result);
      setSelectedSheets(result.sheets.length > 0 ? [result.sheets[0].name] : []);
      setUploadState({ status: 'ready', progress: 100 });
      
      toast({ title: 'File Parsed', description: `Found ${result.sheets.length} sheets` });
      
      setTimeout(() => setStep('configure'), 500);
    } catch (error) {
      setUploadState({ status: 'error', progress: 0, error: 'Failed to parse Excel file' });
    }
  }, []);

  const handleAnalyze = () => {
    if (selectedSheets.length === 0) {
      toast({ title: 'Select Sheets', description: 'Please select at least one sheet', variant: 'destructive' });
      return;
    }
    setStep('dashboard');
  };

  // Get current sheet data
  const currentSheet: ParsedSheet | undefined = analysis && selectedSheets[0] 
    ? analysis.parsedSheets[selectedSheets[0]] 
    : undefined;

  // Generate KPIs from data
  const kpis = currentSheet ? currentSheet.columns
    .filter(c => c.type === 'numeric' && c.sum !== undefined && !c.isSummaryColumn)
    .slice(0, 4)
    .map((col, i) => ({
      label: col.name,
      value: col.sum || 0,
      unit: col.unit,
      color: (['primary', 'success', 'warning', 'destructive'] as const)[i % 4],
      icon: i === 0 ? <Zap className="w-4 h-4 text-primary" /> : 
            i === 1 ? <BarChart3 className="w-4 h-4 text-success" /> :
            i === 2 ? <TrendingUp className="w-4 h-4 text-warning" /> :
            <Fuel className="w-4 h-4 text-destructive" />
    })) : [];

  // Generate chart data
  const chartData = currentSheet?.cleanedData.slice(0, 12).map((row, i) => {
    const obj: Record<string, string | number> = { name: String(row[currentSheet.timeColumn || currentSheet.headers[0]] || `Period ${i + 1}`) };
    currentSheet.columns.filter(c => c.type === 'numeric' && !c.isSummaryColumn).slice(0, 4).forEach(col => {
      obj[col.name] = parseNumericValue(row[col.name]) || 0;
    });
    return obj;
  }) || [];

  const numericColNames = currentSheet?.columns.filter(c => c.type === 'numeric' && !c.isSummaryColumn).slice(0, 4).map(c => c.name) || [];

  // Source mix for pie chart
  const sourceMixData = currentSheet?.columns
    .filter(c => c.isPowerSource && c.sum)
    .map(c => ({ name: c.name, value: c.sum || 0 })) || [];

  // Generate insights
  const insights: Insight[] = currentSheet ? generateInsights(currentSheet.cleanedData, currentSheet.columns) : [];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto py-20">
              <div className="text-center mb-12">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Zap className="w-4 h-4" /> Industrial Energy Intelligence
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  Smart Power <span className="text-gradient">Analytics</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                  Upload any Excel file with power consumption data. Our AI adapts to your format automatically.
                </p>
              </div>
              <FileUploadZone
                onFileSelect={handleFileSelect}
                isLoading={['uploading', 'parsing', 'analyzing'].includes(uploadState.status)}
                progress={uploadState.progress}
                error={uploadState.error}
                acceptedFile={uploadState.status === 'ready' ? analysis?.fileName : undefined}
              />
            </motion.div>
          )}

          {step === 'configure' && analysis && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8">
              <SheetSelector
                sheets={analysis.sheets}
                selectedSheets={selectedSheets}
                onSelectionChange={setSelectedSheets}
                columns={Object.fromEntries(Object.entries(analysis.parsedSheets).map(([k, v]) => [k, v.columns]))}
                selectedColumns={selectedColumns}
                onColumnsChange={setSelectedColumns}
              />
              <ObjectiveSelector selected={objective} onSelect={setObjective} />
              <div className="flex justify-end">
                <Button onClick={handleAnalyze} size="lg" className="gap-2">
                  Generate Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'dashboard' && currentSheet && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{analysis?.fileName}</h2>
                  <p className="text-muted-foreground">{currentSheet.name} • {currentSheet.cleanedData.length} records</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={() => setStep('configure')}>Edit Selection</Button>
                  <ExportButtons targetRef={dashboardRef} fileName={`${analysis?.fileName}-report`} />
                </div>
              </div>

              <div ref={dashboardRef} className="space-y-6">
                {kpis.length > 0 && <KPIGrid kpis={kpis} />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {chartData.length > 0 && numericColNames.length > 0 && (
                    <ChartCard title="Consumption Trend" subtitle="Over time" delay={0.1}>
                      <TrendChart data={chartData} xKey="name" yKeys={numericColNames.slice(0, 2)} />
                    </ChartCard>
                  )}
                  {chartData.length > 0 && numericColNames.length > 0 && (
                    <ChartCard title="Source Comparison" subtitle="By category" delay={0.2}>
                      <BarChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 3)} />
                    </ChartCard>
                  )}
                  {sourceMixData.length > 0 && (
                    <ChartCard title="Power Source Mix" subtitle="Distribution" delay={0.3}>
                      <PieChartComponent data={sourceMixData} />
                    </ChartCard>
                  )}
                  {chartData.length > 0 && numericColNames.length > 0 && (
                    <ChartCard title="Cumulative Usage" subtitle="Stacked area" delay={0.4}>
                      <AreaChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 3)} />
                    </ChartCard>
                  )}
                </div>

                {insights.length > 0 && <InsightsPanel insights={insights} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
