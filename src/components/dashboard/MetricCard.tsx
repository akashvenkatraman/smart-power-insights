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

    const trendColor = isPositive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20";
    const trendIcon = isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />;

    return (
        <Card className="border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl overflow-hidden relative group hover:border-emerald-500/30 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
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
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{title}</h3>

                    <div className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                        {value}
                    </div>

                    {subValue && (
                        <p className="text-xs text-slate-500 font-medium">
                            {subValue}
                        </p>
                    )}
                </div>

                {/* Glow Effect */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-all" />
            </CardContent>
        </Card>
    );
}
