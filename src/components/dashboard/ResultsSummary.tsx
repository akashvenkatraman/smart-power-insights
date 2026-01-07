import { SummaryMetrics } from "@/lib/power-parser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Factory, Zap } from "lucide-react";

interface Props {
    summary: SummaryMetrics | null;
    dates: string[];
    currencyUnit: string;
}

export function ResultsSummary({ summary, dates, currencyUnit }: Props) {
    if (!summary) {
        return (
            <Card className="border border-white/10 bg-black/40">
                <CardContent className="p-8 text-center text-slate-400">
                    No summary data available. Please upload a file with summary metrics.
                </CardContent>
            </Card>
        );
    }

    const MetricCard = ({
        title,
        value,
        average,
        unit,
        icon: Icon,
        trend
    }: {
        title: string;
        value: string;
        average: string;
        unit: string;
        icon: any;
        trend?: 'up' | 'down'
    }) => (
        <Card className="border border-white/10 bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-slate-400" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    <span className="text-xs text-slate-400">{unit}</span>
                    {trend && (
                        trend === 'up' ?
                            <TrendingUp className="h-4 w-4 text-emerald-400" /> :
                            <TrendingDown className="h-4 w-4 text-rose-400" />
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Yearly Avg: <span className="text-slate-300 font-semibold">{average}</span> {unit}
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            {/* Business Overview */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-emerald-400" />
                    Business Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Total Sales"
                        value={summary.totalSalesAvg.toFixed(1)}
                        average={summary.totalSalesAvg.toFixed(2)}
                        unit={currencyUnit}
                        icon={DollarSign}
                    />
                    <MetricCard
                        title="Power Cost / Sales"
                        value={summary.powerCostSalesAvg.toFixed(1)}
                        average={summary.powerCostSalesAvg.toFixed(2)}
                        unit={currencyUnit}
                        icon={Zap}
                    />
                    <MetricCard
                        title="MFI Power Cost"
                        value={summary.mfiPowerCostAvg.toFixed(1)}
                        average={summary.mfiPowerCostAvg.toFixed(2)}
                        unit={currencyUnit}
                        icon={Factory}
                    />
                </div>
            </div>

            {/* MFI Analysis */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Factory className="h-6 w-6 text-blue-400" />
                    MFI Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard
                        title="MFI % of Sales"
                        value={summary.mfiSalesPercentAvg.toFixed(2)}
                        average={summary.mfiSalesPercentAvg.toFixed(3)}
                        unit="%"
                        icon={TrendingUp}
                    />
                    <MetricCard
                        title="MFI Units Consumed"
                        value={summary.mfiUnitsAvg.toFixed(2)}
                        average={summary.mfiUnitsAvg.toFixed(3)}
                        unit="Lakhs"
                        icon={Zap}
                    />
                </div>
            </div>

            {/* Units Distribution */}
            <Card className="border border-white/10 bg-black/40">
                <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-400" />
                        Units Distribution
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Monthly breakdown by department/facility
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-300">MFI Units</span>
                                <span className="text-lg font-bold text-blue-400">{summary.mfiUnitsAvg.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{
                                        width: `${(summary.mfiUnitsAvg / (summary.mfiUnitsAvg + summary.cruiseUnitsAvg + summary.eodUnitsAvg)) * 100}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500">Avg: {summary.mfiUnitsAvg.toFixed(3)} Lakhs</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-300">Cruise (CRNHB) Units</span>
                                <span className="text-lg font-bold text-purple-400">{summary.cruiseUnitsAvg.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500"
                                    style={{
                                        width: `${(summary.cruiseUnitsAvg / (summary.mfiUnitsAvg + summary.cruiseUnitsAvg + summary.eodUnitsAvg)) * 100}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500">Avg: {summary.cruiseUnitsAvg.toFixed(3)} Lakhs</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-300">E&D Units</span>
                                <span className="text-lg font-bold text-amber-400">{summary.eodUnitsAvg.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500"
                                    style={{
                                        width: `${(summary.eodUnitsAvg / (summary.mfiUnitsAvg + summary.cruiseUnitsAvg + summary.eodUnitsAvg)) * 100}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500">Avg: {summary.eodUnitsAvg.toFixed(3)} Lakhs</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* DG Rent Split */}
            <Card className="border border-white/10 bg-black/40">
                <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-white">DG Rent Split</CardTitle>
                    <CardDescription className="text-slate-400">
                        Fixed monthly allocation across departments
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <p className="text-xs text-slate-400 mb-1">MFI</p>
                            <p className="text-xl font-bold text-blue-400">₹{(summary.dgRentSplit.mfi / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <p className="text-xs text-slate-400 mb-1">CRNHB</p>
                            <p className="text-xl font-bold text-purple-400">₹{(summary.dgRentSplit.crnhb / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <p className="text-xs text-slate-400 mb-1">E&D</p>
                            <p className="text-xl font-bold text-amber-400">₹{(summary.dgRentSplit.eod / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg border border-emerald-500/30">
                            <p className="text-xs text-slate-400 mb-1">Total</p>
                            <p className="text-xl font-bold text-emerald-400">₹{(summary.dgRentSplit.total / 100000).toFixed(2)}L</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
