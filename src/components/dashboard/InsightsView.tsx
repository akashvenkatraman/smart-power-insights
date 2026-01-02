
import { AnalysisInsight, PowerSourceData } from "@/lib/power-parser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface Props {
    insights: AnalysisInsight[];
    sources: PowerSourceData[];
    currencyUnit: string;
}

export function InsightsView({ insights, sources, currencyUnit }: Props) {

    // Sort sources by avg price for leaderboard
    const rankedSources = [...sources]
        .filter(s => s.avgPrice > 0 && s.totalUnits > 0)
        .sort((a, b) => a.avgPrice - b.avgPrice); // Cheapest first

    return (
        <div className="grid gap-6 md:grid-cols-2">

            {/* 1. Executive Summary */}
            <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-xl">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Executive Summary
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Smart Recommendations & Findings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {insights.length === 0 && (
                        <p className="text-slate-500 italic">No critical anomalies detected. Operations appearing normal.</p>
                    )}
                    {insights.map((insight, idx) => (
                        <Alert key={idx} className={`
                border-l-4 border-0 bg-white/5 
                ${insight.type === 'warning' ? 'border-l-amber-500' :
                                insight.type === 'danger' ? 'border-l-rose-500' :
                                    insight.type === 'success' ? 'border-l-emerald-500' : 'border-l-sky-500'}
             `}>
                            <div className="flex gap-3">
                                {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                                {insight.type === 'danger' && <TrendingDown className="h-5 w-5 text-rose-500" />}
                                {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                {insight.type === 'info' && <TrendingUp className="h-5 w-5 text-sky-500" />}

                                <div>
                                    <AlertTitle className="text-white font-bold mb-1">{insight.title}</AlertTitle>
                                    <AlertDescription className="text-slate-300 text-sm">
                                        {insight.message}
                                        {insight.impact && (
                                            <div className="mt-2 font-mono text-xs font-bold text-white/80 bg-black/30 px-2 py-1 rounded inline-block">
                                                {insight.impact}
                                            </div>
                                        )}
                                    </AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    ))}
                </CardContent>
            </Card>

            {/* 2. Efficiency Leaderboard */}
            <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl h-full">
                <CardHeader>
                    <CardTitle className="text-white text-xl">Efficiency Leaderboard</CardTitle>
                    <CardDescription className="text-slate-400">
                        Cost per Unit comparison (Cheapest to Most Expensive)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {rankedSources.map((s, i) => (
                        <div key={s.id} className="relative group">
                            <div className="flex justify-between items-end mb-1 text-sm">
                                <span className="text-slate-200 font-medium flex items-center gap-2">
                                    <span className="font-mono text-slate-500 w-4">#{i + 1}</span>
                                    {s.simpleName}
                                </span>
                                <span className={`font-bold font-mono ${s.avgPrice > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    ₹ {s.avgPrice.toFixed(2)}
                                </span>
                            </div>
                            {/* Bar */}
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${s.avgPrice > 20 ? 'bg-rose-500' : s.avgPrice > 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min((s.avgPrice / 50) * 100, 100)}%` }} // Scale max to 50
                                />
                            </div>
                        </div>
                    ))}
                    <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-500">
                        * Lower is better. Sources &gt; ₹20/unit are considered highly inefficient.
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
