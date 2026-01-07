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
    const powerCostPercentData = dates.map((date, i) => ({
        period: date,
        percentage: summary.totalSales[i] > 0 ? (summary.powerCostSales[i] / summary.totalSales[i]) * 100 : 0
    }));

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

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Chart 1: Power Cost % Trend */}
            <Card className="border-2 border-emerald-500 shadow-md bg-white">
                <CardHeader className="pb-3 bg-emerald-50">
                    <CardTitle className="text-base font-bold text-gray-900">
                        Power Cost % trend w.r.t sales
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={powerCostPercentData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="period"
                                fontSize={9}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                stroke="#6b7280"
                            />
                            <YAxis
                                fontSize={10}
                                stroke="#6b7280"
                                domain={[4, 6]}
                                label={{ value: 'MFI %', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'white', border: '2px solid #d1d5db', fontSize: 12 }}
                                formatter={(value: number) => `${value.toFixed(2)}%`}
                            />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="#5B9BD5"
                                strokeWidth={3}
                                dot={{ fill: '#5B9BD5', r: 4 }}
                                name="MFI %"
                            >
                                <LabelList dataKey="percentage" position="top" formatter={(val: number) => `${val.toFixed(1)}%`} style={{ fontSize: 10, fontWeight: 'bold', fill: '#374151' }} />
                            </Line>
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 2: Cost / Unit Trend */}
            <Card className="border-2 border-cyan-500 shadow-md bg-white">
                <CardHeader className="pb-3 bg-cyan-50">
                    <CardTitle className="text-base font-bold text-gray-900">
                        Cost / Unit trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={costPerUnitData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="period"
                                fontSize={9}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                stroke="#6b7280"
                            />
                            <YAxis
                                fontSize={10}
                                stroke="#6b7280"
                                label={{ value: 'In Rupees', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'white', border: '2px solid #d1d5db', fontSize: 12 }}
                                formatter={(value: number) => `₹${value.toFixed(2)}`}
                            />
                            <Bar dataKey="cost" fill="#5B9BD5" barSize={25} name="Cost (₹)">
                                <LabelList dataKey="cost" position="top" formatter={(val: number) => val.toFixed(1)} style={{ fontSize: 9, fontWeight: 'bold', fill: '#374151' }} />
                            </Bar>
                            <Line
                                type="monotone"
                                dataKey="costPerUnit"
                                stroke="#F5A65B"
                                strokeWidth={2}
                                dot={{ fill: '#F5A65B', r: 3 }}
                                name="Cost/Unit"
                            >
                                <LabelList dataKey="costPerUnit" position="top" formatter={(val: number) => val.toFixed(1)} style={{ fontSize: 9, fontWeight: 'bold', fill: '#F5A65B' }} />
                            </Line>
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 3: RE vs NRE Pie */}
            <Card className="border-2 border-blue-500 shadow-md bg-white">
                <CardHeader className="pb-3 bg-blue-50">
                    <CardTitle className="text-base font-bold text-gray-900">
                        RE Vs NRE Status 2025-26
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={sustainabilityData}
                                cx="50%"
                                cy="45%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ percentage }) => `${percentage.toFixed(0)}%`}
                                labelLine={false}
                            >
                                <Cell fill={COLORS.re} />
                                <Cell fill={COLORS.nre} />
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'white', border: '2px solid #d1d5db' }}
                                formatter={(value: number, name: string, entry: any) =>
                                    `${entry.payload.percentage.toFixed(0)}% (${value.toFixed(2)} ${powerUnit})`
                                }
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={40}
                                iconType="square"
                                formatter={(value, entry: any) => `${value}`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 4: MFI Units Trend */}
            <Card className="border-2 border-emerald-500 shadow-md bg-white">
                <CardHeader className="pb-3 bg-emerald-50">
                    <CardTitle className="text-base font-bold text-gray-900">
                        MFI Units trend
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={220}>
                        <ComposedChart data={mfiUnitsData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="period"
                                fontSize={9}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                stroke="#6b7280"
                            />
                            <YAxis
                                fontSize={10}
                                stroke="#6b7280"
                                label={{ value: 'In Lakhs', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'white', border: '2px solid #d1d5db', fontSize: 12 }}
                                formatter={(value: number) => `${value.toFixed(2)} ${powerUnit}`}
                            />
                            <Bar dataKey="units" fill="#5B9BD5" barSize={25} name="MFI Units">
                                <LabelList dataKey="units" position="top" formatter={(val: number) => val.toFixed(1)} style={{ fontSize: 9, fontWeight: 'bold', fill: '#374151' }} />
                            </Bar>
                            <Line
                                type="monotone"
                                dataKey="units"
                                stroke="#F5A65B"
                                strokeWidth={2}
                                dot={{ fill: '#F5A65B', r: 3 }}
                                name="Trend"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
