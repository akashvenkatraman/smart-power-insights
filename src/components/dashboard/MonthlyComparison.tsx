
import { PowerSourceData } from "@/lib/power-parser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
    sources: PowerSourceData[];
    overall: PowerSourceData | null;
    dates: string[];
    currencyUnit: string;
}

export function MonthlyComparison({ sources, overall, dates, currencyUnit }: Props) {
    // Replicating the Excel Slide exactly:
    // 1. Demand Charges + ST (from Grid)
    // 2. HFO Cost (from Diesel)
    // 3. Diesel Cost (from Diesel)
    // 4. DG Rent (from Diesel)
    // 5. IEX Power
    // 6. EB (Variable Grid)
    // 7. OGPL Wind
    // 8. Cont Wind
    // 9. Solar
    // 10. Total Power Cost (Actual)

    const findSource = (id: string) => sources.find(s => s.id === id);

    const getRowData = (label: string, costArray: number[], colorCls: string = "text-slate-300") => (
        <TableRow key={label} className="border-white/5 hover:bg-white/5 transition-colors group">
            <TableCell className={`font-medium ${colorCls} bg-black/40 group-hover:bg-white/5 sticky left-0 z-10 border-r border-white/5 min-w-[150px]`}>
                {label}
            </TableCell>
            {costArray.map((val, i) => (
                <TableCell key={i} className="text-center font-mono text-slate-400 text-sm">
                    {val > 0 ? val.toFixed(2) : "-"}
                </TableCell>
            ))}
            <TableCell className={`text-right font-bold ${colorCls} bg-white/5 border-l border-white/5`}>
                {costArray.reduce((a, b) => a + b, 0).toFixed(2)}
            </TableCell>
        </TableRow>
    );

    // Manual Component Extraction for 100% Fidelity
    const grid = findSource('grid');
    const diesel = findSource('diesel');
    const iex = findSource('iex');
    const ogpl = findSource('ogpl');
    const cont = findSource('watsun');
    const solar = findSource('solar');
    const totalSource = overall || { cost: dates.map(() => 0), rent: dates.map(() => 0), totalCost: 0 };

    return (
        <Card className="border border-white/10 shadow-3xl bg-black/40 backdrop-blur-3xl overflow-hidden ring-1 ring-white/10">
            <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
                <CardTitle className="text-white text-xl flex items-center gap-2">
                    Monthly Performance Analytics (Financial)
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Source-wise monthly expenditure in {currencyUnit} (Matches Excel Slide)
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent bg-white/5">
                                <TableHead className="text-slate-100 font-black uppercase text-xs tracking-wider bg-slate-900 sticky left-0 z-10 border-r border-white/10">Power Component</TableHead>
                                {dates.map((date, i) => (
                                    <TableHead key={i} className="text-slate-300 font-bold text-center min-w-[90px] text-xs uppercase">{date}</TableHead>
                                ))}
                                <TableHead className="text-white font-black text-right bg-slate-900 border-l border-white/10 text-xs">ANNUAL TOTAL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grid && getRowData("Demand Charges + ST", grid.rent, "text-sky-400")}
                            {diesel && getRowData("Diesel / HFO Variable", diesel.cost, "text-amber-400")}
                            {diesel && getRowData("DG Rent / Fixed", diesel.rent, "text-amber-600")}
                            {iex && getRowData("IEX Power", iex.cost, "text-indigo-400")}
                            {grid && getRowData("EB Board (Variable)", grid.cost, "text-sky-500")}
                            {ogpl && getRowData("Wind Power (OGPL)", ogpl.cost, "text-purple-400")}
                            {cont && getRowData("Wind Power (Cont)", cont.cost, "text-purple-500")}
                            {solar && getRowData("Solar Power", solar.cost, "text-emerald-400")}

                            {/* GRAND TOTAL ROW */}
                            <TableRow className="border-t-2 border-white/20 bg-emerald-500/10 hover:bg-emerald-500/20">
                                <TableCell className="font-black text-emerald-400 text-base uppercase sticky left-0 z-10 bg-black/90 border-r border-white/10">
                                    Total Power Cost
                                </TableCell>
                                {dates.map((_, i) => {
                                    const monthlyTotal = (totalSource.cost[i] || 0) + (totalSource.rent[i] || 0);
                                    return (
                                        <TableCell key={i} className="text-center font-black text-emerald-400 text-base">
                                            {monthlyTotal.toFixed(1)}
                                        </TableCell>
                                    );
                                })}
                                <TableCell className="text-right font-black text-emerald-400 text-lg bg-emerald-500/20 border-l border-white/20">
                                    {totalSource.totalCost.toFixed(1)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
