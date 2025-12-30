import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, BarChart3, TrendingUp, Fuel } from 'lucide-react';
import { Header } from '@/components/Header';
import { FileUploadZone } from '@/components/FileUploadZone';
import { SheetSelector } from '@/components/SheetSelector';
import { ObjectiveSelector } from '@/components/ObjectiveSelector';
import { KPIGrid } from '@/components/KPICard';
import { ChartCard, TrendChart, BarChartComponent, PieChartComponent, AreaChartComponent, RadarChartComponent, RadialBarChartComponent } from '@/components/Charts';
import { ColumnRenamer } from '@/components/ColumnRenamer';
import { ColumnMapper } from '@/components/ColumnMapper';
import { InsightsPanel, generateInsights } from '@/components/InsightsPanel';
import { ExportButtons } from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { parseExcelFile, parseNumericValue } from '@/lib/excel-parser';
import type { ExcelAnalysis, ParsedSheet } from '@/types/excel';
import { AnalysisObjective, UploadState, Insight } from '@/types/analytics';
import { toast } from '@/hooks/use-toast';

const formatDateConcise = (value: any): string => {
  if (!value) return '';
  const str = String(value);

  // Handle long date strings like "Fri May 31 2024..."
  // Match "Month Day Year" or "Month-Year"
  const monthMatch = str.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[- ](\d{2,4})/i);
  if (monthMatch) {
    const month = monthMatch[1].substring(0, 3);
    let year = monthMatch[2];
    if (year.length === 4) year = year.substring(2);
    return `${month}-${year}`;
  }

  // Handle ISO dates
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]}-${String(date.getFullYear()).substring(2)}`;
    }
  }

  // Return original but truncated if too long
  return str.length > 15 ? str.substring(0, 12) + '...' : str;
};

const Index = () => {
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [analysis, setAnalysis] = useState<ExcelAnalysis | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [columnAliases, setColumnAliases] = useState<Record<string, string>>({});
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
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
      // Initialize aliases
      setColumnAliases({});
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

  // Filter columns based on objective and mapping
  const filteredColumns = React.useMemo(() => {
    if (!currentSheet) return [];

    // If mapping exists for the current objective, prioritize mapped columns
    const mappedValues = Object.values(columnMapping).filter(Boolean);
    if (mappedValues.length > 0) {
      // Return columns in the order they were mapped (if possible) or just all mapped columns
      // We need to map back from "Value_X" to the ColumnAnalysis object
      return mappedValues
        .map(name => currentSheet.columns.find(c => c.name === name))
        .filter((c): c is typeof currentSheet.columns[0] => !!c);
    }

    // Base numeric columns
    const allNumeric = currentSheet.columns.filter(c => c.type === 'numeric' && !c.isSummaryColumn);

    if (!objective || objective === 'overall-usage') {
      return allNumeric.slice(0, 5);
    }

    switch (objective) {
      case 'cost-analysis': {
        const costCols = allNumeric.filter(c => c.type === 'currency' || /cost|amount|bill|price|rate|inr|rs/i.test(c.name));
        return costCols.length > 0 ? costCols : allNumeric.slice(0, 5);
      }
      case 'source-mix': {
        const sourceCols = allNumeric.filter(c => c.isPowerSource);
        return sourceCols.length > 0 ? sourceCols : allNumeric.slice(0, 5);
      }
      case 'fuel-dependency': {
        const fuelCols = allNumeric.filter(c => /fuel|diesel|hfo|lit|gal|dg/i.test(c.name));
        return fuelCols.length > 0 ? fuelCols : allNumeric.slice(0, 5);
      }
      case 'efficiency': {
        const effCols = allNumeric.filter(c => /effic|factor|pf|loss/i.test(c.name));
        return effCols.length > 0 ? effCols : allNumeric.slice(0, 5);
      }
      case 'green-power': {
        const greenCols = allNumeric.filter(c => /solar|wind|renew/i.test(c.name));
        return greenCols.length > 0 ? greenCols : allNumeric.slice(0, 5);
      }
      case 'threshold-breach': {
        // for breaches, showing max values or specific limit columns would be ideal, 
        // but for now let's show everything to spot peaks
        return allNumeric.slice(0, 6);
      }
      default:
        return allNumeric.slice(0, 5);
    }
  }, [currentSheet, objective]);

  // Generate KPIs from data
  const kpis = filteredColumns
    .slice(0, 4)
    .map((col, i) => ({
      label: columnAliases[col.name] || col.name,
      value: col.sum || 0,
      unit: col.unit,
      color: (['primary', 'success', 'warning', 'destructive'] as const)[i % 4],
      icon: i === 0 ? <Zap className="w-4 h-4 text-primary" /> :
        i === 1 ? <BarChart3 className="w-4 h-4 text-success" /> :
          i === 2 ? <TrendingUp className="w-4 h-4 text-warning" /> :
            <Fuel className="w-4 h-4 text-destructive" />
    }));

  // Generate chart data
  const chartData = currentSheet?.cleanedData.slice(0, 12).map((row, i) => {
    const rawName = row[currentSheet.timeColumn || currentSheet.headers[0]] || `Period ${i + 1}`;
    const obj: Record<string, string | number> = { name: formatDateConcise(rawName) };
    filteredColumns.forEach(col => {
      obj[columnAliases[col.name] || col.name] = parseNumericValue(row[col.name]) || 0;
    });
    return obj;
  }) || [];

  const numericColNames = filteredColumns
    .map(c => columnAliases[c.name] || c.name);

  // Source mix for pie chart
  const sourceMixData = currentSheet?.columns
    .filter(c => c.isPowerSource && c.sum)
    .map(c => ({ name: columnAliases[c.name] || c.name, value: c.sum || 0 })) || [];

  // Generate insights
  const insights: Insight[] = currentSheet ? generateInsights(currentSheet.cleanedData, currentSheet.columns, objective) : [];

  const getObjectiveReportNarrative = () => {
    if (!objective) return null;
    const summaries: Record<string, string> = {
      'overall-usage': 'This report provides a high-level overview of electricity consumption across all tracked sources. It identifies the primary drivers of usage and compares historical trends to help you understand your general energy footprint.',
      'cost-analysis': 'Focusing on financial impact, this report breaks down expenditure by source and time period. Use this to identify billing spikes, high-cost periods, and opportunities for switching to more economical power sources.',
      'source-mix': 'A strategic breakdown of where your power comes from. This report evaluates the balance between Grid (EB) and captive generation (Solar, Wind, DG) to help optimize your energy portfolio.',
      'efficiency': 'This technical report analyzes system performance, focusing on losses, Power Factor (PF), and load balancing. It is designed to find "hidden waste" in your electrical distribution.',
      'green-power': 'Your Sustainability Scorecard. This report tracks the percentage of renewable energy used versus total consumption, helping you meet environmental goals and carbon footprint targets.',
      'fuel-dependency': 'A focused study on hydrocarbon usage (Diesel/HFO). This identifies how often the plant relies on generator power and the associated fuel efficiency or wastage.',
      'threshold-breach': 'An anomaly detection report highlighting every instance where power usage or costs exceeded predefined safety or budget limits.'
    };
    return summaries[objective] || summaries['overall-usage'];
  };

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

              <ColumnRenamer
                columns={selectedColumns.length > 0 ? selectedColumns : (currentSheet?.columns.filter(c => c.type === 'numeric').map(c => c.name) || [])}
                aliases={columnAliases}
                onChange={setColumnAliases}
              />

              <ObjectiveSelector selected={objective} onSelect={(obj) => {
                setObjective(obj);
                setColumnMapping({}); // Reset mapping on objective change
              }} />

              {objective && (
                <ColumnMapper
                  objective={objective}
                  columns={currentSheet?.columns.filter(c => c.type === 'numeric').map(c => c.name) || []}
                  mapping={columnMapping}
                  onChange={setColumnMapping}
                />
              )}

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

              {/* Executive Summary Banner */}
              {insights.length > 0 && (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 glow-primary">
                      <Zap className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 mb-1">
                        <h3 className="text-xl font-bold text-slate-100 italic tracking-tight uppercase">Executive Bottom Line</h3>
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 uppercase tracking-widest">{objective?.replace('-', ' ')} Report</span>
                      </div>
                      <p className="text-lg text-slate-300 font-medium leading-relaxed">
                        {insights[0]?.message || "Analyzing your energy data to find hidden cost-saving opportunities..."}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="px-6 py-4 rounded-xl bg-slate-900/40 border border-white/5"
                  >
                    <p className="text-sm text-slate-400 leading-relaxed italic">
                      <span className="text-primary font-bold not-italic mr-2">Report Focus:</span>
                      {getObjectiveReportNarrative()}
                    </p>
                  </motion.div>
                </div>
              )}

              <div ref={dashboardRef} className="space-y-6">
                {kpis.length > 0 && <KPIGrid kpis={kpis} />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Dynamic Storytelling Sections Based on Objective */}

                  {(!objective || objective === 'overall-usage') && (
                    <>
                      <ChartCard
                        title="Your Consumption Story"
                        subtitle="How has power usage changed over the last periods?"
                        delay={0.1}
                        className="lg:col-span-2"
                        badge="Main Trend"
                      >
                        <TrendChart data={chartData} xKey="name" yKeys={numericColNames.slice(0, 3)} />
                      </ChartCard>
                      <ChartCard title="Usage Distribution" subtitle="Where is the most power being used?" delay={0.2} badge="Breakdown">
                        <PieChartComponent data={sourceMixData} />
                      </ChartCard>
                      <ChartCard title="Daily Load Profile" subtitle="Average demand across periods" delay={0.3} badge="Efficiency">
                        <BarChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 1)} />
                      </ChartCard>
                    </>
                  )}

                  {objective === 'cost-analysis' && (
                    <>
                      <ChartCard
                        title="Where is the money going?"
                        subtitle="Detailed look at your power bill trends"
                        delay={0.1}
                        className="lg:col-span-2"
                        badge="Cost Driver"
                      >
                        <AreaChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 3)} />
                      </ChartCard>
                      <ChartCard title="Top Cost Centers" subtitle="Which areas are costing the most?" delay={0.2} badge="Highest Spend">
                        <PieChartComponent data={sourceMixData} />
                      </ChartCard>
                      <ChartCard title="Billing Benchmarks" subtitle="Comparing costs across periods" delay={0.3} badge="Savings Target">
                        <BarChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 2)} />
                      </ChartCard>
                    </>
                  )}

                  {objective === 'source-mix' && (
                    <>
                      <ChartCard
                        title="Green Power Performance"
                        subtitle="Are we meeting our renewable energy goals?"
                        delay={0.1}
                        badge="Sustainability"
                      >
                        <RadarChartComponent data={chartData.slice(-6)} keys={numericColNames.slice(0, 3)} />
                      </ChartCard>
                      <ChartCard title="Energy Portfolio" subtitle="Grid vs Renewable breakdown" delay={0.2} badge="Energy Mix">
                        <PieChartComponent data={sourceMixData} />
                      </ChartCard>
                      <ChartCard
                        title="Source Sustainability Trend"
                        subtitle="How our power sources shift over time"
                        delay={0.3}
                        className="lg:col-span-2"
                        badge="Global Trend"
                      >
                        <AreaChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 4)} />
                      </ChartCard>
                    </>
                  )}

                  {objective === 'efficiency' && (
                    <>
                      <ChartCard
                        title="Loss Analysis & Power Factor"
                        subtitle="Identifying waste in the electrical distribution"
                        delay={0.1}
                        className="lg:col-span-2"
                        badge="Performance"
                      >
                        <TrendChart data={chartData} xKey="name" yKeys={numericColNames.slice(0, 2)} />
                      </ChartCard>
                      <ChartCard title="Efficiency Distribution" subtitle="System vs Transmission losses" delay={0.2} badge="Waste Map">
                        <RadarChartComponent data={chartData.slice(-6)} keys={numericColNames.slice(0, 4)} />
                      </ChartCard>
                      <ChartCard title="Load Balance Score" subtitle="Variations across different phases/units" delay={0.3} badge="System Health">
                        <BarChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 1)} />
                      </ChartCard>
                    </>
                  )}

                  {objective === 'green-power' && (
                    <>
                      <ChartCard
                        title="Sustainability Scorecard"
                        subtitle="Renewable energy contribution vs Grid"
                        delay={0.1}
                        className="lg:col-span-2"
                        badge="Carbon Footprint"
                      >
                        <AreaChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 3)} />
                      </ChartCard>
                      <ChartCard title="Renewable Mix" subtitle="Solar and Wind utilization" delay={0.2} badge="Green Energy">
                        <PieChartComponent data={sourceMixData} />
                      </ChartCard>
                      <ChartCard title="Grid Offset Report" subtitle="How much Carbon emissions were avoided?" delay={0.3} badge="Impact">
                        <RadialBarChartComponent data={chartData} dataKey={numericColNames[0]} />
                      </ChartCard>
                    </>
                  )}

                  {objective === 'fuel-dependency' && (
                    <>
                      <ChartCard
                        title="Generator Dependency Study"
                        subtitle="Diesel/HFO usage and generator run-times"
                        delay={0.1}
                        className="lg:col-span-2"
                        badge="Fuel Audit"
                      >
                        <BarChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 3)} />
                      </ChartCard>
                      <ChartCard title="Fuel Efficiency Radar" subtitle="Generator performance across loads" delay={0.2} badge="Audit">
                        <RadarChartComponent data={chartData.slice(-6)} keys={numericColNames.slice(0, 3)} />
                      </ChartCard>
                      <ChartCard title="Fuel Consumption Trend" subtitle="Daily expenditure on captive power" delay={0.3} badge="Operational Cost">
                        <AreaChartComponent data={chartData} xKey="name" yKeys={numericColNames.slice(0, 1)} />
                      </ChartCard>
                    </>
                  )}

                  {/* Fallback for other objectives or overflow */}
                  {objective && !['overall-usage', 'cost-analysis', 'source-mix', 'efficiency', 'green-power', 'fuel-dependency'].includes(objective) && (
                    <>
                      <ChartCard title="Historical Trend" subtitle="Key metrics over time" delay={0.1} badge="Insight">
                        <TrendChart data={chartData} xKey="name" yKeys={numericColNames.slice(0, 2)} />
                      </ChartCard>
                      <ChartCard title="Metric Comparison" subtitle="How key values relate" delay={0.2} badge="Analysis">
                        <RadarChartComponent data={chartData.slice(-6)} keys={numericColNames.slice(0, 3)} />
                      </ChartCard>
                    </>
                  )}
                </div>

                {insights.length > 0 && <InsightsPanel insights={insights} />}

                {/* Technical Deep Dive Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl border border-white/5 overflow-hidden"
                >
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-100 tracking-tight">Technical Deep Dive</h3>
                      <p className="text-sm text-slate-400 mt-1">Detailed metric breakdown for this selection</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                      Audit Log
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-bold border-b border-white/5">Period</th>
                          {numericColNames.map(name => (
                            <th key={name} className="px-6 py-4 font-bold border-b border-white/5">{name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.02]">
                        {chartData.map((row, i) => (
                          <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">{row.name}</td>
                            {numericColNames.map(name => (
                              <td key={name} className="px-6 py-4 font-medium text-slate-200">
                                {typeof row[name] === 'number' ? (row[name] as number).toLocaleString(undefined, { maximumFractionDigits: 2 }) : row[name]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">
                    End of Report Section
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
