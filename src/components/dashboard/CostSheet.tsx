
import { PowerSourceData } from "@/lib/power-parser";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee } from "lucide-react";

interface Props {
    sources: PowerSourceData[];
    overall: PowerSourceData;
    currencyUnit: string;
    powerUnit: string;
}

export function CostSheet({ sources, overall, currencyUnit, powerUnit }: Props) {

    const sortedSources = [...sources].sort((a, b) => b.totalCost - a.totalCost);

    return (
        <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-xl">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                    Detailed Cost Sheet
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Complete financial breakdown by source. Higher rates are highlighted.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="w-[250px] text-slate-400 font-semibold">Power Source</TableHead>
                            <TableHead className="text-right text-slate-400 font-semibold">Consumption <span className="text-xs text-slate-600">({powerUnit})</span></TableHead>
                            <TableHead className="text-right text-slate-400 font-semibold">Avg Rate <span className="text-xs text-slate-600">(₹/Unit)</span></TableHead>
                            <TableHead className="text-right text-slate-400 font-semibold">Fixed/Rent <span className="text-xs text-slate-600">({currencyUnit})</span></TableHead>
                            <TableHead className="text-right text-emerald-400 font-bold">Total Cost <span className="text-xs text-emerald-500/50">({currencyUnit})</span></TableHead>
                            <TableHead className="text-right text-slate-400 font-semibold">Share</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSources.map((source) => {
                            const totalRent = source.rent.reduce((a, b) => a + b, 0);
                            const share = overall.totalCost > 0 ? (source.totalCost / overall.totalCost) * 100 : 0;

                            return (
                                <TableRow key={source.id} className="group hover:bg-white/5 border-white/5 transition-colors">
                                    <TableCell className="font-medium flex items-center gap-3 text-slate-200">
                                        <span className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: source.color, color: source.color }} />
                                        {source.simpleName}
                                        {source.sustainability === 'Renewable' && (
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-1.5 py-0 h-5">
                                                Green
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-slate-300 text-base">
                                        {source.totalUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        <div className="flex flex-col items-end">
                                            <span className="text-slate-300">₹ {source.avgPrice.toFixed(2)}</span>
                                            {source.avgPrice > overall.avgPrice * 1.2 && (
                                                <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                                    Expensive
                                                </span>
                                            )}
                                            {source.avgPrice < overall.avgPrice * 0.8 && source.avgPrice > 0 && (
                                                <span className="text-[10px] text-emerald-400 font-bold">
                                                    Efficient
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-slate-400">
                                        {totalRent > 0 ? totalRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-white text-lg">
                                        {source.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="font-mono font-normal border-white/20 text-slate-400">
                                            {share.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {/* Total Row */}
                        <TableRow className="bg-white/5 font-bold border-t border-white/10 hover:bg-white/10">
                            <TableCell className="text-white">TOTAL</TableCell>
                            <TableCell className="text-right font-mono text-white">
                                {overall.totalUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-emerald-400">
                                ₹ {overall.avgPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-white">
                                {(overall.rent ? overall.rent.reduce((a, b) => a + b, 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xl text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                {overall.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right text-white">100%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
