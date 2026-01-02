
import { useState, useRef, useEffect } from "react";
import { parsePowerExcel, DashboardMetrics, getExcelSheets } from "@/lib/power-parser";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { CostSheet } from "@/components/dashboard/CostSheet";
import { InsightsView } from "@/components/dashboard/InsightsView"; // Import
import { ReportGenerator, ReportGeneratorHandle } from "@/components/dashboard/ReportGenerator";
import { Input } from "@/components/ui/input";
import { Upload, Leaf, Download, FileSpreadsheet } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");

  // Sheet Selection State
  const [file, setFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>("");

  const reportRef = useRef<ReportGeneratorHandle>(null);

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

        <div className="flex items-center gap-4">
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
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <Leaf className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Example: Drag & Drop Excel</h2>
            <p className="text-slate-400 text-base max-w-sm mx-auto mt-2 leading-relaxed">
              Instant analysis of Costs, Units, and Green Score. <br />
              <span className="text-emerald-400/80">Premium Formatting.</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 fade-in">

          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto p-1 bg-black/40 border border-white/5 backdrop-blur-xl rounded-xl">
              <TabsTrigger
                value="overview"
                className="px-6 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 font-medium transition-all"
              >
                Overview
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
      )}

    </div>
  );
}
