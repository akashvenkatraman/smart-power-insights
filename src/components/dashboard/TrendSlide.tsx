import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Label, LabelList } from "recharts";
import { PowerSourceData, SummaryMetrics } from "@/lib/power-parser";

interface TrendSlideProps {
    summary: SummaryMetrics;
    sources: PowerSourceData[];
    dates: string[];
    currencyUnit: string;
    powerUnit: string;
}

export function TrendSlide({ summary, sources, dates, currencyUnit, powerUnit }: TrendSlideProps) {

    // Chart 1: Power Cost % trend w.r.t sales
    // Chart 1: Power Cost % trend w.r.t sales
    // Excel values might be decimals (0.04) OR numbers (4.0).
    // We infer the format: if value is small usually < 1.0 (meaning < 100%), it's likely a decimal fraction.
    // We treat anything <= 1.5 as decimal scaling (multiply by 100).
    // Anything > 1.5 is passed as is. This handles the 4% vs 400% ambiguity.
    const powerCostPercentData = dates.map((date, i) => {
        let val = summary.mfiSalesPercent && summary.mfiSalesPercent[i] !== undefined ? summary.mfiSalesPercent[i] : 0;
        if (val > 0 && val <= 1.5) {
            val = val * 100;
        }
        return {
            period: date,
            percentage: val
        };
    });

    // Chart 2: Cost / Unit trend
    const costPerUnitData = dates.map((date, i) => {
        const totalUnits = sources.reduce((sum, s) => sum + s.units[i], 0);
        const totalCost = sources.reduce((sum, s) => sum + s.cost[i] + s.rent[i], 0);
        return {
            period: date,
            cost: totalUnits > 0 ? totalCost : 0,
            costPerUnit: totalUnits > 0 ? totalCost / totalUnits : 0
        };
    });

    // Chart 3: RE vs NRE Status pie chart
    const renewableUnits = sources.filter(s => s.sustainability === 'Renewable').reduce((sum, s) => sum + s.totalUnits, 0);
    const nonRenewableUnits = sources.filter(s => s.sustainability === 'Non-Renewable').reduce((sum, s) => sum + s.totalUnits, 0);
    const total = renewableUnits + nonRenewableUnits;

    const sustainabilityData = [
        { name: 'RE Power', value: renewableUnits, percentage: (renewableUnits / total) * 100 },
        { name: 'NRE Power', value: nonRenewableUnits, percentage: (nonRenewableUnits / total) * 100 }
    ];

    // Chart 4: MFI Units trend
    const mfiUnitsData = dates.map((date, i) => ({
        period: date,
        units: summary.mfiUnits[i]
    }));

    const COLORS = {
        re: '#5B9BD5', // Blue for RE
        nre: '#F5A65B'  // Orange for NRE
    };

    // --- Custom Tooltip (Matched to PowerCharts) ---
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border-2 border-gray-300 p-4 rounded-xl shadow-lg text-sm">
                    <p className="font-bold text-gray-900 mb-3 text-base border-b border-gray-200 pb-2">{label}</p>
                    {payload.map((p: any) => (
                        <div key={p.name} className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="font-medium text-gray-700">{p.name}</span>
                            </div>
                            <span className="font-mono text-gray-900 font-bold">
                                {typeof p.value === 'number' ? (
                                    p.name.includes('%') ? `${p.value.toFixed(2)}%` :
                                        p.name.includes('Cost') || p.name.includes('Price') ? `₹${p.value.toFixed(2)}` :
                                            p.value.toFixed(2)
                                ) : p.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const cardClass = "border border-gray-200 shadow-md bg-white overflow-hidden relative group hover:border-emerald-400 hover:shadow-lg transition-all duration-300";
    const headerClass = "pb-3";

    // Theme Colors
    const THEME = {
        bar: '#fb923c',      // Orange (Units/Cost)
        line: '#8b5cf6',     // Purple (Trend/Rate)
        re: '#10b981',       // Emerald (RE)
        nre: '#f59e0b'       // Amber (NRE)
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Chart 1: Power Cost % Trend */}
            <Card className={cardClass}>
                <CardHeader className={headerClass}>
                    <CardTitle className="text-base font-bold text-gray-900">
                        Power Cost % trend w.r.t sales
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={powerCostPercentData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="period"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#6b7280"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#6b7280"
                                domain={[0, 'auto']}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke={THEME.line}
                                strokeWidth={3}
                                dot={{ fill: THEME.line, r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="MFI %"
                            >
                                <LabelList dataKey="percentage" position="top" formatter={(val: number) => `${val.toFixed(1)}%`} style={{ fontSize: 11, fontWeight: 'bold', fill: '#374151' }} />
                            </Line>
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 2: Cost / Unit Trend */}
            <Card className={cardClass}>
                <CardHeader className={headerClass}>
                    <CardTitle className="text-base font-bold text-gray-900">
                        Cost / Unit trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={costPerUnitData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="period"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#6b7280"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                yAxisId="left"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#6b7280"
                                tickFormatter={(v) => `₹${v}`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#6b7280"
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar yAxisId="left" dataKey="cost" fill={THEME.bar} barSize={30} radius={[4, 4, 0, 0]} name="Cost (₹)">
                                {/* Removed LabelList for cleaner look or keep if needed? User asked for smoothness -> clutter less? Kept simple. */}
                            </Bar>
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="costPerUnit"
                                stroke={THEME.line}
                                strokeWidth={3}
                                dot={{ fill: THEME.line, r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Cost/Unit (₹)"
                            >
                                <LabelList dataKey="costPerUnit" position="top" formatter={(val: number) => val.toFixed(1)} style={{ fontSize: 11, fontWeight: 'bold', fill: THEME.line }} />
                            </Line>
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 3: RE vs NRE Pie */}
            <Card className={cardClass}>
                <CardHeader className={headerClass}>
                    <CardTitle className="text-base font-bold text-gray-900">
                        RE Vs NRE Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={sustainabilityData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ percentage }) => `${percentage.toFixed(0)}%`}
                            >
                                <Cell fill={THEME.re} />
                                <Cell fill={THEME.nre} />
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 4: MFI Units Trend */}
            <Card className={cardClass}>
                <CardHeader className={headerClass}>
                    <CardTitle className="text-base font-bold text-gray-900">
                        MFI Units trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={mfiUnitsData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="period"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#6b7280"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                stroke="#6b7280"
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="units" fill={THEME.bar} barSize={30} radius={[4, 4, 0, 0]} name="MFI Units" />
                            <Line
                                type="monotone"
                                dataKey="units"
                                stroke={THEME.line}
                                strokeWidth={3}
                                dot={{ fill: THEME.line, r: 4, strokeWidth: 0 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Trend"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

