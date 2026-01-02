import { MetricCard } from "./MetricCard";
import { PowerSourceData } from "@/lib/power-parser";
import { IndianRupee, Zap, TrendingUp, Percent } from "lucide-react";

interface Props {
    source: PowerSourceData;
    currencyUnit?: string;
    powerUnit?: string;
}

export function MetricCards({ source, currencyUnit = "Lakhs", powerUnit = "Lakhs" }: Props) {
    const len = source.cost.length;
    let costGrowth = 0;
    let unitsGrowth = 0;

    if (len >= 2) {
        if (source.cost[len - 2] > 0) costGrowth = ((source.cost[len - 1] - source.cost[len - 2]) / source.cost[len - 2]) * 100;
        if (source.units[len - 2] > 0) unitsGrowth = ((source.units[len - 1] - source.units[len - 2]) / source.units[len - 2]) * 100;
    }

    const avgRent = source.rent.reduce((a, b) => a + b, 0) / (len || 1);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title={`${source.simpleName} Cost`}
                value={`₹ ${source.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subValue={`in ${currencyUnit}`}
                icon={<IndianRupee className="w-5 h-5" />}
                trend={costGrowth}
                trendLabel="MoM Change"
            />
            <MetricCard
                title={`${source.simpleName} Units`}
                value={`${source.totalUnits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subValue={`in ${powerUnit}`}
                icon={<Zap className="w-5 h-5" />}
                trend={unitsGrowth}
                trendLabel="MoM Change"
            />
            <MetricCard
                title="Avg. Unit Cost"
                value={`₹ ${source.avgPrice.toFixed(2)}`}
                subValue="Cost per Unit"
                icon={<Percent className="w-5 h-5" />}
            />
            <MetricCard
                title="Fixed Charges (Avg)"
                value={`₹ ${avgRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subValue={`in ${currencyUnit} (Avg)`}
                icon={<TrendingUp className="w-5 h-5" />}
            />
        </div>
    );
}
