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
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'glass-card rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02]',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <div className={cn('p-2 rounded-lg', bgColors[color])}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className={cn('text-3xl font-bold font-mono', accentColors[color])}
        >
          {formatNumber(value, unit)}
        </motion.span>
        {unit && !['%', '₹'].includes(unit) && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <TrendIcon className={cn('w-4 h-4', trendColor)} />
          <span className={cn('text-sm font-medium', trendColor)}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
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
