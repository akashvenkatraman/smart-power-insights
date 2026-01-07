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
            <Card className="border border-gray-200 bg-white">
                <CardContent className="p-8 text-center text-gray-600">
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
        <Card className="border border-gray-200 bg-white hover:bg-gray-50 hover:border-emerald-300 hover:shadow-md transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-gray-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{value}</span>
                    <span className="text-xs text-gray-500">{unit}</span>
                    {trend && (
                        trend === 'up' ?
                            <TrendingUp className="h-4 w-4 text-emerald-600" /> :
                            <TrendingDown className="h-4 w-4 text-rose-600" />
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Yearly Avg: <span className="text-gray-800 font-semibold">{average}</span> {unit}
                </p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-8">
            {/* Business Overview */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Factory className="h-6 w-6 text-blue-600" />
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
            <Card className="border border-gray-200 bg-white">
                <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-600" />
                        Units Distribution
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Monthly breakdown by department/facility
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">MFI Units</span>
                                <span className="text-lg font-bold text-blue-600">{summary.mfiUnitsAvg.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{
                                        width: `${(summary.mfiUnitsAvg / (summary.mfiUnitsAvg + summary.cruiseUnitsAvg + summary.eodUnitsAvg)) * 100}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">Avg: {summary.mfiUnitsAvg.toFixed(3)} Lakhs</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Cruise (CRNHB) Units</span>
                                <span className="text-lg font-bold text-purple-600">{summary.cruiseUnitsAvg.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500"
                                    style={{
                                        width: `${(summary.cruiseUnitsAvg / (summary.mfiUnitsAvg + summary.cruiseUnitsAvg + summary.eodUnitsAvg)) * 100}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">Avg: {summary.cruiseUnitsAvg.toFixed(3)} Lakhs</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">E&D Units</span>
                                <span className="text-lg font-bold text-amber-600">{summary.eodUnitsAvg.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500"
                                    style={{
                                        width: `${(summary.eodUnitsAvg / (summary.mfiUnitsAvg + summary.cruiseUnitsAvg + summary.eodUnitsAvg)) * 100}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">Avg: {summary.eodUnitsAvg.toFixed(3)} Lakhs</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* DG Rent Split */}
            <Card className="border border-gray-200 bg-white">
                <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-gray-900">DG Rent Split</CardTitle>
                    <CardDescription className="text-gray-600">
                        Fixed monthly allocation across departments
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">MFI</p>
                            <p className="text-xl font-bold text-blue-600">₹{(summary.dgRentSplit.mfi / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">CRNHB</p>
                            <p className="text-xl font-bold text-purple-600">₹{(summary.dgRentSplit.crnhb / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">E&D</p>
                            <p className="text-xl font-bold text-amber-600">₹{(summary.dgRentSplit.eod / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-300">
                            <p className="text-xs text-emerald-700 mb-1">Total</p>
                            <p className="text-xl font-bold text-emerald-700">₹{(summary.dgRentSplit.total / 100000).toFixed(2)}L</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
