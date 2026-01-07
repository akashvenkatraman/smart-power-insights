
import { useState, useRef, useEffect } from "react";
import { parsePowerExcel, DashboardMetrics, getExcelSheets } from "@/lib/power-parser";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { InsightsView } from "@/components/dashboard/InsightsView";
import { CostSheet } from "@/components/dashboard/CostSheet";
import { MonthlyComparison } from "@/components/dashboard/MonthlyComparison";
import { ResultsSummary } from "@/components/dashboard/ResultsSummary";
import { ReportGenerator, ReportGeneratorHandle } from "@/components/dashboard/ReportGenerator";
import { Input } from "@/components/ui/input";
import { Upload, Leaf, Download, FileSpreadsheet, Home, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Index() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Restore last active tab from localStorage
    return localStorage.getItem('activeTab') || 'overview';
  });

  // Sheet Selection State
  const [file, setFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>("");

  const reportRef = useRef<ReportGeneratorHandle>(null);

  // Persist active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleReset = () => {
    setMetrics(null);
    setFile(null);
    setAvailableSheets([]);
    setCurrentSheet('');
    setActiveTab('overview');
    localStorage.removeItem('activeTab');
    toast.info('Dashboard Reset', { description: 'Ready to analyze new data' });
  };

  const handleFile = async (uploadedFile: File) => {
    setLoading(true);
    try {
      setFile(uploadedFile);
      const sheets = await getExcelSheets(uploadedFile);
      setAvailableSheets(sheets);
      const firstSheet = sheets[0];
      setCurrentSheet(firstSheet);
      await parseSheet(uploadedFile, firstSheet);
    } catch (error) {
      console.error(error);
      toast.error("Error", { description: "Could not read Excel file." });
    } finally {
      setLoading(false);
    }
  };

  const parseSheet = async (f: File, sheetName: string) => {
    setLoading(true);
    try {
      const data = await parsePowerExcel(f, sheetName);
      setMetrics(data);
      toast.success(`Analyzed: ${sheetName}`, { description: `Detected units: ${data.meta.currencyUnit} / ${data.meta.powerUnit}` });
    } catch (err) {
      toast.error("Analysis Failed", { description: "Could not read data from this sheet." });
    } finally {
      setLoading(false);
    }
  };

  const onSheetChange = (newSheet: string) => {
    if (file && newSheet !== currentSheet) {
      setCurrentSheet(newSheet);
      parseSheet(file, newSheet);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    // FORCE DARK MODE: min-h-screen bg-slate-950 text-slate-100
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 p-6 space-y-8 animate-in fade-in duration-700 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-lg">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
              <Leaf className="w-8 h-8 text-emerald-400" />
            </div>
            Eco<span className="text-emerald-400">Power</span>
          </h1>
          <p className="text-slate-400 mt-2 text-base font-medium pl-1">
            Professional Energy Intelligence Dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Home Button - Show when dashboard is loaded */}
          {metrics && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="bg-black/40 border-white/10 hover:bg-white/10 hover:border-emerald-500/30 text-white h-10"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}

          {/* Sheet Selector */}
          {availableSheets.length > 0 && (
            <Select value={currentSheet} onValueChange={onSheetChange}>
              <SelectTrigger className="w-[200px] bg-black/40 border-white/10 text-white backdrop-blur-md h-10">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" />
                <SelectValue placeholder="Select Sheet" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                {availableSheets.map(s => (
                  <SelectItem key={s} value={s} className="hover:bg-white/5 cursor-pointer focus:bg-white/10 focus:text-white">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Download Button */}
          {metrics && (
            <Button
              variant="outline"
              className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all h-10"
              onClick={() => reportRef.current?.downloadPdf()}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export Report
            </Button>
          )}

          {/* Drop Zone */}
          <div
            className={cn(
              "relative group cursor-pointer border-2 border-dashed rounded-xl px-8 py-3 transition-all duration-300 backdrop-blur-sm",
              dragActive
                ? "border-emerald-500 bg-emerald-500/10 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                : "border-white/10 hover:border-emerald-500/50 hover:bg-white/5"
            )}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
          >
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">
              <Upload className="w-4 h-4" />
              {metrics ? "Analyze New File" : "Upload Data File"}
            </div>
          </div>
        </div>
      </div>

      {/* Report Generator (Hidden) */}
      {metrics && <ReportGenerator ref={reportRef} metrics={metrics} />}

      {/* Main Content */}
      {!metrics ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
          {/* Logo & Brand */}
          <div className="space-y-6 animate-in zoom-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-emerald-500/20 animate-pulse" />
              <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                <Zap className="w-16 h-16 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Power Analytics
              </h2>
              <p className="text-emerald-400 font-bold text-lg">Delphi-TVS Energy Insights</p>
              <p className="text-slate-500 text-sm font-medium">Created: January 2026</p>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            className={cn(
              "relative w-full max-w-2xl group cursor-pointer transition-all duration-500",
              dragActive && "scale-105"
            )}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
          >
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept=".xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div
              className={cn(
                "relative border-3 border-dashed rounded-2xl p-16 transition-all duration-300 backdrop-blur-md",
                dragActive
                  ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_80px_rgba(16,185,129,0.4)]"
                  : "border-white/20 bg-white/5 hover:border-emerald-500/50 hover:bg-white/10 hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]"
              )}
            >
              <div className="flex flex-col items-center gap-6">
                <div className={cn(
                  "p-6 rounded-2xl border-2 transition-all duration-300",
                  dragActive
                    ? "border-emerald-500 bg-emerald-500/20 scale-110"
                    : "border-white/10 bg-black/40 group-hover:border-emerald-500/30 group-hover:scale-105"
                )}>
                  <Upload className={cn(
                    "w-12 h-12 transition-colors",
                    dragActive ? "text-emerald-300" : "text-emerald-400"
                  )} />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {dragActive ? "Drop Your Excel File" : "Drag & Drop Excel File"}
                  </h3>
                  <p className="text-slate-400 font-medium">
                    or <span className="text-emerald-400 underline">click to browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-3">
                    Supports .xlsx and .xls formats • Instant AI-powered analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mt-8">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white mb-2">Real-time Analysis</h4>
              <p className="text-sm text-slate-400">Instant insights from power consumption data</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white mb-2">Green Energy Tracking</h4>
              <p className="text-sm text-slate-400">Monitor renewable vs non-renewable sources</p>
            </div>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:scale-105">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white mb-2">Export Reports</h4>
              <p className="text-sm text-slate-400">Professional PDF reports with charts</p>
            </div>
          </div>

          {/* Developer Watermark */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-slate-500 font-medium">
              Developed by <span className="text-emerald-400 font-bold">Akash V</span> & <span className="text-emerald-400 font-bold">Raghul Sah VRT</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">Delphi-TVS • Energy Management System</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 fade-in">

          <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto p-1 bg-black/40 border border-white/5 backdrop-blur-xl rounded-xl">
              <TabsTrigger
                value="overview"
                className="px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all"
              >
                Results
              </TabsTrigger>
              {metrics.sources.map(s => (
                <TabsTrigger
                  key={s.id}
                  value={s.id}
                  className="px-6 py-2.5 capitalize data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 font-medium transition-all"
                >
                  {s.simpleName}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-8 mt-8">
              {/* 1. Metrics */}
              <MetricCards
                source={metrics.overall}
                currencyUnit={metrics.meta.currencyUnit}
                powerUnit={metrics.meta.powerUnit}
              />

              {/* 2. Insights Engine (NEW) */}
              <InsightsView
                insights={metrics.analysis}
                sources={metrics.sources}
                currencyUnit={metrics.meta.currencyUnit}
              />

              {/* 3. Charts */}
              <PowerCharts
                dates={metrics.dates}
                data={metrics.overall}
                breakdown={metrics.sources}
                mode="overview"
                currencyUnit={metrics.meta.currencyUnit}
                powerUnit={metrics.meta.powerUnit}
              />

              {/* 4. Detailed Cost Sheet */}
              <CostSheet
                sources={metrics.sources}
                overall={metrics.overall}
                currencyUnit={metrics.meta.currencyUnit}
                powerUnit={metrics.meta.powerUnit}
              />

              {/* 5. Monthly Comparison (REPLICATING EXCEL SLIDE) */}
              <MonthlyComparison
                sources={metrics.sources}
                overall={metrics.overall}
                dates={metrics.dates}
                currencyUnit={metrics.meta.currencyUnit}
              />
            </TabsContent>

            {/* RESULTS TAB */}
            <TabsContent value="results" className="space-y-8 mt-8">
              <ResultsSummary
                summary={metrics.summary}
                dates={metrics.dates}
                currencyUnit={metrics.meta.currencyUnit}
              />
            </TabsContent>

            {metrics.sources.map(source => (
              <TabsContent key={source.id} value={source.id} className="space-y-8 mt-8">
                <MetricCards
                  source={source}
                  currencyUnit={metrics.meta.currencyUnit}
                  powerUnit={metrics.meta.powerUnit}
                />
                <PowerCharts
                  dates={metrics.dates}
                  data={source}
                  mode="detail"
                  currencyUnit={metrics.meta.currencyUnit}
                  powerUnit={metrics.meta.powerUnit}
                />
              </TabsContent>
            ))}
          </Tabs>

        </div>
      )
      }

    </div >
  );
}
