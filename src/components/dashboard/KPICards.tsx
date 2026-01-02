
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, IndianRupee, Activity, TrendingUp } from "lucide-react";

interface KPICardsProps {
    totalCost: number;
    totalUnits: number;
    avgCost: number;
    avgUnits: number;
}

export function KPICards({ totalCost, totalUnits, avgCost, avgUnits }: KPICardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Power Cost</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹ {totalCost.toFixed(2)} L</div>
                    <p className="text-xs text-muted-foreground">Actual cost for the period</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Units Consumed</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalUnits.toFixed(2)} L</div>
                    <p className="text-xs text-muted-foreground">in Lakhs</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Monthly Cost</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹ {avgCost.toFixed(2)} L</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Monthly Units</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgUnits.toFixed(2)} L</div>
                </CardContent>
            </Card>
        </div>
    );
}
