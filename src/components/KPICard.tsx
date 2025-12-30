import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/excel-parser';

interface KPICardProps {
  label: string;
  value: number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  icon?: React.ReactNode;
  delay?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  change,
  changeLabel = 'vs last period',
  trend,
  color = 'primary',
  icon,
  delay = 0
}) => {
  const colorClasses = {
    primary: 'glow-primary border-primary/30',
    success: 'glow-success border-success/30',
    warning: 'glow-warning border-warning/30',
    destructive: 'glow-destructive border-destructive/30'
  };

  const accentColors = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive'
  };

  const bgColors = {
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    destructive: 'bg-destructive/10'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'glass-card rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.05]',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] opacity-80">
            {label}
          </span>
          <span className="text-[9px] text-slate-500 font-medium italic">Click for details</span>
        </div>
        {icon && (
          <div className={cn('p-2.5 rounded-xl shadow-lg', bgColors[color])}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1 mb-4">
        <div className="flex items-baseline gap-1.5">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className={cn('text-4xl font-black tracking-tighter', accentColors[color])}
          >
            {formatNumber(value, unit)}
          </motion.span>
          {unit && !['%', '₹'].includes(unit) && (
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{unit}</span>
          )}
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.03]">
          <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-lg bg-opacity-10', trend === 'up' ? 'bg-success text-success' : 'bg-destructive text-destructive')}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold leading-none">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 tracking-tight">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
};

interface KPIGridProps {
  kpis: KPICardProps[];
}

export const KPIGrid: React.FC<KPIGridProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.label} {...kpi} delay={index * 0.1} />
      ))}
    </div>
  );
};
