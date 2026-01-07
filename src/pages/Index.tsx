
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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(() => {
    // Restore metrics from localStorage on mount
    const saved = localStorage.getItem('dashboardMetrics');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Restore last active tab from localStorage
    return localStorage.getItem('activeTab') || 'overview';
  });

  // Sheet Selection State
  const [file, setFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>(() => {
    const saved = localStorage.getItem('availableSheets');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSheet, setCurrentSheet] = useState<string>(() => {
    return localStorage.getItem('currentSheet') || '';
  });

  const reportRef = useRef<ReportGeneratorHandle>(null);

  // Persist active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Persist metrics to localStorage whenever they change
  useEffect(() => {
    if (metrics) {
      localStorage.setItem('dashboardMetrics', JSON.stringify(metrics));
    } else {
      localStorage.removeItem('dashboardMetrics');
    }
  }, [metrics]);

  // Persist sheets data to localStorage
  useEffect(() => {
    if (availableSheets.length > 0) {
      localStorage.setItem('availableSheets', JSON.stringify(availableSheets));
    }
  }, [availableSheets]);

  useEffect(() => {
    if (currentSheet) {
      localStorage.setItem('currentSheet', currentSheet);
    }
  }, [currentSheet]);

  const handleReset = () => {
    setMetrics(null);
    setFile(null);
    setAvailableSheets([]);
    setCurrentSheet('');
    setActiveTab('overview');
    localStorage.removeItem('activeTab');
    localStorage.removeItem('dashboardMetrics');
    localStorage.removeItem('availableSheets');
    localStorage.removeItem('currentSheet');
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
    // LIGHT MODE: white/light gray background, dark text
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-emerald-500/30 p-6 space-y-8 animate-in fade-in duration-700 font-sans">

      {/* Header - Show ONLY when dashboard is loaded */}
      {metrics && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div>
            {/* Icon and Title */}
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-md">
                <img src="/eco-power-logo.png" alt="Eco Power" className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3 drop-shadow-sm">
                Eco<span className="text-emerald-600">Power</span>
              </h1>
            </div>
            <p className="text-gray-600 mt-2 text-base font-medium pl-1">
              Professional Energy Intelligence Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Home Button */}
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="bg-white border-gray-300 hover:bg-gray-100 hover:border-emerald-500 text-gray-700 h-10"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>

            {/* Sheet Selector */}
            {availableSheets.length > 0 && (
              <Select value={currentSheet} onValueChange={onSheetChange}>
                <SelectTrigger className="w-[200px] bg-white border-gray-300 text-gray-900 h-10">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                  <SelectValue placeholder="Select Sheet" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900">
                  {availableSheets.map(s => (
                    <SelectItem key={s} value={s} className="hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:text-gray-900">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Download Button */}
            <Button
              variant="outline"
              className="gap-2 border-gray-300 bg-white hover:bg-emerald-50 text-gray-700 transition-all h-10"
              onClick={() => reportRef.current?.downloadPdf()}
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Export Report
            </Button>
          </div>
        </div>
      )}

      {/* Report Generator (Hidden) */}
      {metrics && <ReportGenerator ref={reportRef} metrics={metrics} />}

      {/* Main Content */}
      {!metrics ? (
        <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-12">
          {/* Animated Logo & Brand - Centered */}
          <div className="space-y-8 animate-in zoom-in duration-1000">
            <div className="relative flex justify-center">
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 blur-3xl bg-emerald-200 animate-pulse opacity-30" />

              {/* Main logo container with rotation animation */}
              <div className="relative w-40 h-40 rounded-3xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-cyan-50 border-2 border-emerald-300 flex items-center justify-center shadow-2xl shadow-emerald-200/50 animate-[spin_20s_linear_infinite]">
                {/* Inner container - counter-rotate to keep icon upright */}
                <div className="animate-[spin_20s_linear_infinite_reverse]">
                  <Zap className="w-20 h-20 text-emerald-600 drop-shadow-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3 animate-in slide-in-from-bottom-5 duration-1000 delay-300">
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight drop-shadow-sm">
                Power Analytics
              </h1>
              <p className="text-emerald-600 font-bold text-xl animate-pulse">Delphi-TVS Energy Insights</p>
              <p className="text-gray-500 text-sm font-medium">Created: January 2026</p>
            </div>
          </div>

          {/* Drag & Drop Zone - Centered */}
          <div
            className={cn(
              "relative w-full max-w-3xl group cursor-pointer transition-all duration-500 animate-in fade-in duration-1000 delay-500",
              dragActive && "scale-105"
            )}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div
              className={cn(
                "relative border-3 border-dashed rounded-2xl p-20 transition-all duration-300 bg-white shadow-xl",
                dragActive
                  ? "border-emerald-500 bg-emerald-50 shadow-[0_0_80px_rgba(16,185,129,0.3)]"
                  : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-[0_0_50px_rgba(16,185,129,0.2)]"
              )}
            >
              <div className="flex flex-col items-center gap-8">
                <div className={cn(
                  "p-8 rounded-2xl border-2 transition-all duration-300",
                  dragActive
                    ? "border-emerald-500 bg-emerald-100 scale-110 animate-bounce"
                    : "border-gray-300 bg-gray-50 group-hover:border-emerald-400 group-hover:scale-110"
                )}>
                  <Upload className={cn(
                    "w-16 h-16 transition-all duration-300",
                    dragActive ? "text-emerald-600 animate-bounce" : "text-emerald-600 group-hover:scale-110"
                  )} />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {dragActive ? "Drop Your Excel File" : "Drag & Drop Excel File"}
                  </h2>
                  <p className="text-gray-600 font-medium text-lg">
                    or <span className="text-emerald-600 underline font-bold cursor-pointer">click to browse</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-4">
                    Supports .xlsx and .xls formats • Instant AI-powered analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full animate-in slide-in-from-bottom-10 duration-1000 delay-700">
            <div className="p-8 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 shadow-sm transition-all hover:scale-105 hover:shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                <Zap className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Real-time Analysis</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Instant insights from power consumption data with automated intelligence</p>
            </div>
            <div className="p-8 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 shadow-sm transition-all hover:scale-105 hover:shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                <Leaf className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Green Energy Tracking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Monitor renewable vs non-renewable sources for sustainability goals</p>
            </div>
            <div className="p-8 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 shadow-sm transition-all hover:scale-105 hover:shadow-lg">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-5">
                <Download className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Export Reports</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Professional PDF reports with comprehensive charts and insights</p>
            </div>
          </div>

          {/* Developer Watermark */}
          <div className="mt-16 pt-8 border-t border-gray-200 animate-in fade-in duration-1000 delay-1000">
            <p className="text-sm text-gray-600 font-medium">
              Developed by <span className="text-emerald-600 font-bold">Akash V</span> & <span className="text-emerald-600 font-bold">Raghul Sah VRT</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Delphi-TVS • Energy Management System</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 fade-in">

          <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto p-1 bg-white border border-gray-200 shadow-sm rounded-xl">
              <TabsTrigger
                value="overview"
                className="px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 font-medium transition-all"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md text-gray-600 font-medium transition-all"
              >
                Results
              </TabsTrigger>
              {metrics.sources.map(s => (
                <TabsTrigger
                  key={s.id}
                  value={s.id}
                  className="px-6 py-2.5 capitalize data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-gray-600 font-medium transition-all"
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
