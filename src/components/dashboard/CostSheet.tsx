
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
        <Card className="border border-gray-200 shadow-md bg-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 text-xl">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <IndianRupee className="w-5 h-5" />
                    </div>
                    Detailed Cost Sheet
                </CardTitle>
                <CardDescription className="text-gray-600">
                    Complete financial breakdown by source. Higher rates are highlighted.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
                            <TableHead className="w-[250px] text-gray-700 font-semibold">Power Source</TableHead>
                            <TableHead className="text-right text-gray-700 font-semibold">Consumption <span className="text-xs text-gray-500">({powerUnit})</span></TableHead>
                            <TableHead className="text-right text-blue-700 font-semibold">Avg Units <span className="text-xs text-blue-500">({powerUnit})</span></TableHead>
                            <TableHead className="text-right text-gray-700 font-semibold">Avg Rate <span className="text-xs text-gray-500">(₹/Unit)</span></TableHead>
                            <TableHead className="text-right text-blue-700 font-semibold">Avg Cost <span className="text-xs text-blue-500">({currencyUnit})</span></TableHead>
                            <TableHead className="text-right text-gray-700 font-semibold">Fixed/Rent <span className="text-xs text-gray-500">({currencyUnit})</span></TableHead>
                            <TableHead className="text-right text-emerald-700 font-bold">Total Cost <span className="text-xs text-emerald-600">({currencyUnit})</span></TableHead>
                            <TableHead className="text-right text-gray-700 font-semibold">Share</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSources.map((source) => {
                            const totalRent = source.rent.reduce((a, b) => a + b, 0);
                            const share = overall.totalCost > 0 ? (source.totalCost / overall.totalCost) * 100 : 0;

                            return (
                                <TableRow key={source.id} className="group hover:bg-gray-50 border-gray-200 transition-colors">
                                    <TableCell className="font-medium flex items-center gap-3 text-gray-800">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                                        {source.simpleName}
                                        {source.sustainability === 'Renewable' && (
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0 h-5">
                                                Green
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-gray-700 text-base">
                                        {source.totalUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-blue-700 text-base">
                                        {source.avgUnits > 0 ? source.avgUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-700">₹ {source.avgPrice.toFixed(2)}</span>
                                            {source.avgPrice > overall.avgPrice * 1.2 && (
                                                <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                                    Expensive
                                                </span>
                                            )}
                                            {source.avgPrice < overall.avgPrice * 0.8 && source.avgPrice > 0 && (
                                                <span className="text-[10px] text-emerald-600 font-bold">
                                                    Efficient
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-blue-700 text-base">
                                        {source.avgCost > 0 ? source.avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-gray-600">
                                        {totalRent > 0 ? totalRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono font-bold text-gray-900 text-lg">
                                        {source.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline" className="font-mono font-normal border-gray-300 text-gray-700">
                                            {share.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {/* Total Row */}
                        <TableRow className="bg-emerald-50 font-bold border-t-2 border-emerald-200 hover:bg-emerald-100">
                            <TableCell className="text-gray-900">TOTAL</TableCell>
                            <TableCell className="text-right font-mono text-gray-900">
                                {overall.totalUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-blue-700">
                                {overall.avgUnits > 0 ? overall.avgUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-emerald-700">
                                ₹ {overall.avgPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-blue-700">
                                {overall.avgCost > 0 ? overall.avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-gray-900">
                                {(overall.rent ? overall.rent.reduce((a, b) => a + b, 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xl text-emerald-800 font-black">
                                {overall.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right text-gray-900">100%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
