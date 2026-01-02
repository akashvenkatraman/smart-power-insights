
import { useState } from "react";
import { parsePowerExcel, DashboardMetrics } from "@/lib/power-parser";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { Input } from "@/components/ui/input";
import { Upload, Leaf } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Dashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const handleFile = async (file: File) => {
        setLoading(true);
        try {
            const data = await parsePowerExcel(file);
            setMetrics(data);
            toast.success("Ready!", { description: "Data analyzed successfully." });
        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Could not read data." });
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 space-y-8 animate-in fade-in duration-700">

            {/* Header - Simple & Clean */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Leaf className="w-8 h-8 text-green-500" />
                        Eco<span className="text-primary">Power</span> Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Simple. Smart. Sustainable.
                    </p>
                </div>

                {/* Drop Zone */}
                <div
                    className={cn(
                        "relative group cursor-pointer border-2 border-dashed rounded-xl px-6 py-2 transition-colors",
                        dragActive ? "border-green-500 bg-green-500/5" : "border-slate-200 dark:border-slate-800 hover:border-green-500/50"
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
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-green-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        {metrics ? "Analyze another file" : "Upload Excel File"}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {!metrics ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center animate-bounce">
                        <Leaf className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Waiting for your Excel file...</h2>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-2">
                            Drop it here. I'll read it and tell you how much Green energy you used!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-700 fade-in">

                    <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                            <TabsTrigger value="overview" className="px-6 py-2">Overview</TabsTrigger>
                            {metrics.sources.map(s => (
                                <TabsTrigger key={s.id} value={s.id} className="px-6 py-2 capitalize">
                                    {s.simpleName} {/* Use Simple Name for 8th Grade level */}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <MetricCards source={metrics.overall} />
                            <PowerCharts
                                dates={metrics.dates}
                                data={metrics.overall}
                                breakdown={metrics.sources}
                                mode="overview"
                            />
                        </TabsContent>

                        {metrics.sources.map(source => (
                            <TabsContent key={source.id} value={source.id} className="space-y-6 mt-6">
                                <MetricCards source={source} />
                                <PowerCharts
                                    dates={metrics.dates}
                                    data={source}
                                    mode="detail"
                                />
                            </TabsContent>
                        ))}
                    </Tabs>

                </div>
            )}

        </div>
    );
}
