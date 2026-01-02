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

    let sustainabilityData = [];
    if (mode === 'overview' && breakdown) {
        // Filter out departments for the pie chart as they don't represent primary power generation units
        const primaryBreakdown = breakdown.filter(s => !s.id.startsWith('dept_'));

        const renewable = primaryBreakdown.filter(s => s.sustainability === 'Renewable').reduce((a, b) => a + b.totalUnits, 0);
        const nonRenewable = primaryBreakdown.filter(s => s.sustainability === 'Non-Renewable').reduce((a, b) => a + b.totalUnits, 0);

        const totalUnitsForPie = renewable + nonRenewable;

        sustainabilityData = [
            { name: 'Green Power (Clean)', value: renewable, color: '#10b981' },
            { name: 'Regular Power (Grey)', value: nonRenewable, color: '#475569' }
        ];

        // Store the percentage for center text
        const greenPercent = totalUnitsForPie > 0 ? (renewable / totalUnitsForPie) * 100 : 0;
        (sustainabilityData as any).percent = greenPercent;
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md text-sm">
                    <p className="font-bold text-white mb-3 text-base border-b border-white/10 pb-2">{label}</p>
                    {payload.map((p: any) => (
                        <div key={p.name} className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color, color: p.color }} />
                                <span className="font-medium text-slate-300">{p.name}</span>
                            </div>
                            <span className="font-mono text-white font-bold">
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
            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Charts */}
                <div className="md:col-span-2 space-y-8">
                    {/* Cost Breakdown */}
                    <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-xl">
                                {mode === 'overview' ? 'Monthly Cost Breakdown' : 'Cost Trend Analysis'}
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Total spend by source (Currency: {currencyUnit})
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <ResponsiveContainer width="100%" height={300}>
                                {mode === 'overview' && breakdown ? (
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} stroke="#94a3b8" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Legend wrapperStyle={{ color: '#fff' }} />
                                        {breakdown.map(s => (
                                            <Bar key={s.id} dataKey={`${s.id}Cost`} name={s.simpleName} stackId="a" fill={s.color} />
                                        ))}
                                    </BarChart>
                                ) : (
                                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Legend />
                                        <Area yAxisId="left" type="monotone" dataKey="cost" name={`Cost (${currencyUnit})`} stroke={data.color} fill={data.color} fillOpacity={0.1} strokeWidth={3} />
                                        <Bar yAxisId="right" dataKey="units" name={`Units (${powerUnit})`} fill="#fb923c" barSize={12} radius={[4, 4, 4, 4]} />
                                    </ComposedChart>
                                )}
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Units Breakdown (Only in Overview) */}
                    {mode === 'overview' && breakdown && (
                        <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-white text-xl">Consumption Breakdown</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Energy usage in {powerUnit}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Legend />
                                        {breakdown.map(s => (
                                            <Bar key={s.id} dataKey={`${s.id}Units`} name={s.simpleName} stackId="b" fill={s.color} />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Pie / Efficiency Chart */}
                {mode === 'overview' && sustainabilityData.length > 0 ? (
                    <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-xl">Green Energy Score</CardTitle>
                            <CardDescription className="text-slate-400">Clean vs Regular Usage</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center items-center">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={sustainabilityData}
                                        cx="50%" cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {sustainabilityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    {/* Center Text */}
                                    <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-3xl font-black">
                                        {(sustainabilityData as any).percent.toFixed(0)}%
                                    </text>
                                    <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-emerald-400 text-sm font-medium">
                                        CLEAN
                                    </text>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-xl">Efficiency Trend</CardTitle>
                            <CardDescription className="text-slate-400">Cost per Unit Analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <ResponsiveContainer width="100%" height={350}>
                                <ComposedChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#94a3b8" />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Line type="monotone" dataKey="unitPrice" name="Avg Rate (₹/Unit)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
