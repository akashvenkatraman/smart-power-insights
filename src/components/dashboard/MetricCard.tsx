import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon?: React.ReactNode;
    trend?: number;
    trendLabel?: string;
}

export function MetricCard({ title, value, subValue, icon, trend, trendLabel }: MetricCardProps) {
    const isPositive = trend && trend > 0;

    // Logic: 
    // For 'Cost', Increase (Pos) is Bad (Red), Decrease (Neg) is Good (Green).
    // For 'Green Score', Increase is Good.
    // We'll stick to a generic "Up = Green" to avoid confusion unless user specifically asked.
    // Actually, let's use a "Neon" palette:
    // Up = Neon Green
    // Down = Neon Red

    const trendColor = isPositive ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200";
    const trendIcon = isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />;

    return (
        <Card className="border border-gray-200 shadow-md bg-white overflow-hidden relative group hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        {icon}
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border ${trendColor}`}>
                            {trendIcon}
                            {Math.abs(trend).toFixed(1)}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-widest">{title}</h3>

                    <div className="text-3xl font-black tracking-tight text-gray-900">
                        {value}
                    </div>

                    {subValue && (
                        <p className="text-xs text-gray-500 font-medium">
                            {subValue}
                        </p>
                    )}
                </div>

                {/* Subtle glow effect on hover */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-100 opacity-0 group-hover:opacity-50 blur-2xl rounded-full transition-all" />
            </CardContent>
        </Card>
    );
}
