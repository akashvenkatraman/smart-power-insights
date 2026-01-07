import {
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, Bar, Line, BarChart, PieChart, Pie, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PowerSourceData } from "@/lib/power-parser";

interface ChartsProps {
    dates: string[];
    data: PowerSourceData;
    breakdown?: PowerSourceData[];
    mode: 'overview' | 'detail';
    currencyUnit?: string;
    powerUnit?: string;
}

export function PowerCharts({ dates, data, breakdown, mode, currencyUnit = "L", powerUnit = "L" }: ChartsProps) {

    const chartData = dates.map((date, i) => {
        const entry: any = { date };
        entry.cost = data.cost[i];
        entry.units = data.units[i];
        entry.unitPrice = data.units[i] > 0 ? data.cost[i] / data.units[i] : 0;
        entry.rent = data.rent[i];

        if (breakdown) {
            breakdown.forEach(s => {
                entry[`${s.id}Cost`] = s.cost[i];
                entry[`${s.id}Units`] = s.units[i];
            });
        }
        return entry;
    });

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
                                {p.name.includes('Rate') || p.name.includes('Price') ? `₹${p.value.toFixed(2)}` :
                                    p.name.includes('Cost') || p.name.includes('Fixed') ? `₹${p.value.toFixed(2)} ${currencyUnit}` :
                                        `${p.value.toFixed(2)} ${powerUnit}`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {mode === 'overview' ? (
                // OVERVIEW MODE: Full Width Stacked Charts
                <>
                    {/* Cost Breakdown */}
                    <Card className="border border-gray-200 shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-gray-900 text-xl">Monthly Cost Breakdown</CardTitle>
                            <CardDescription className="text-gray-600">Total spend by source (Currency: {currencyUnit})</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} stroke="#6b7280" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Legend wrapperStyle={{ color: '#111827', paddingTop: '10px' }} />
                                    {breakdown?.map(s => (
                                        <Bar key={s.id} dataKey={`${s.id}Cost`} name={s.simpleName} stackId="a" fill={s.color} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Consumption Breakdown */}
                    <Card className="border border-gray-200 shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-gray-900 text-xl">Consumption Breakdown</CardTitle>
                            <CardDescription className="text-gray-600">Energy usage in {powerUnit}</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Legend wrapperStyle={{ color: '#111827', paddingTop: '10px' }} />
                                    {breakdown?.map(s => (
                                        <Bar key={s.id} dataKey={`${s.id}Units`} name={s.simpleName} stackId="a" fill={s.color} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            ) : (
                // DETAIL MODE: Grid Layout (Cost Trend + Efficiency Trend)
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Cost Trend (Span 2) */}
                    <div className="md:col-span-2">
                        <Card className="border border-gray-200 shadow-md bg-white h-full">
                            <CardHeader>
                                <CardTitle className="text-gray-900 text-xl">Cost Trend Analysis</CardTitle>
                                <CardDescription className="text-gray-600">Total spend by source (Currency: {currencyUnit})</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <ResponsiveContainer width="100%" height={350}>
                                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                                        <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} stroke="#6b7280" />
                                        <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Legend wrapperStyle={{ color: '#111827', paddingTop: '10px' }} />
                                        <Area yAxisId="left" type="monotone" dataKey="cost" name={`Cost (${currencyUnit})`} stroke={data.color} fill={data.color} fillOpacity={0.1} strokeWidth={3} />
                                        <Bar yAxisId="right" dataKey="units" name={`Units (${powerUnit})`} fill="#fb923c" barSize={30} radius={[4, 4, 0, 0]} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Efficiency Trend (Span 1) - RESTORED for Detail View */}
                    <Card className="border border-gray-200 shadow-md bg-white">
                        <CardHeader>
                            <CardTitle className="text-gray-900 text-xl">Efficiency Trend</CardTitle>
                            <CardDescription className="text-gray-600">Cost per Unit Analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Legend wrapperStyle={{ color: '#111827', paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="unitPrice" name="Avg Rate (₹/Unit)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
