import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Insight } from '@/types/analytics';

interface InsightCardProps {
  insight: Insight;
  delay?: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, delay = 0 }) => {
  const iconMap = {
    info: <Info className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    success: <CheckCircle className="w-4 h-4" />,
    critical: <AlertTriangle className="w-4 h-4" />
  };

  const colorMap = {
    info: 'bg-info/10 text-info border-info/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    success: 'bg-success/10 text-success border-success/30',
    critical: 'bg-destructive/10 text-destructive border-destructive/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        colorMap[insight.type]
      )}
    >
      <div className="mt-0.5">{iconMap[insight.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{insight.message}</p>
        {insight.metric && (
          <p className="text-xs text-muted-foreground mt-1">
            {insight.metric}: {insight.value}
          </p>
        )}
      </div>
    </motion.div>
  );
};

interface InsightsPanelProps {
  insights: Insight[];
  title?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  title = 'Key Insights'
}) => {
  if (insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl border border-border/50 overflow-hidden"
    >
      <div className="p-4 border-b border-border/30 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-warning" />
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} delay={index * 0.1} />
        ))}
      </div>
    </motion.div>
  );
};

// Generate insights from parsed data
export function generateInsights(
  data: Record<string, unknown>[],
  columns: { name: string; type: string; sum?: number; avg?: number; min?: number; max?: number }[]
): Insight[] {
  const insights: Insight[] = [];
  let insightId = 0;

  const numericCols = columns.filter(c => 
    c.type === 'numeric' && c.sum !== undefined && c.avg !== undefined
  );

  for (const col of numericCols) {
    const { name, sum, avg, min, max } = col;
    
    // High variance insight
    if (max !== undefined && min !== undefined && avg !== undefined && avg > 0) {
      const variance = ((max - min) / avg) * 100;
      if (variance > 100) {
        insights.push({
          id: `insight-${++insightId}`,
          type: 'warning',
          message: `${name} shows high variability (${variance.toFixed(0)}% variance). Consider investigating peak periods.`,
          metric: name,
          value: variance
        });
      }
    }

    // Large sum insight
    if (sum !== undefined && sum > 1000000) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'info',
        message: `Total ${name}: ${(sum / 100000).toFixed(2)} Lacs. Track trends over time for optimization opportunities.`,
        metric: name,
        value: sum
      });
    }
  }

  // If we have EB and Solar/Wind columns, compare them
  const ebCol = columns.find(c => /eb|grid|utility/i.test(c.name));
  const renewableCol = columns.find(c => /solar|wind|renewable/i.test(c.name));

  if (ebCol?.sum && renewableCol?.sum) {
    const total = ebCol.sum + renewableCol.sum;
    const renewableShare = (renewableCol.sum / total) * 100;
    
    if (renewableShare < 20) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'warning',
        message: `Renewable energy accounts for only ${renewableShare.toFixed(1)}% of total consumption. Consider increasing green power share.`,
        metric: 'Renewable Share',
        value: renewableShare
      });
    } else if (renewableShare > 40) {
      insights.push({
        id: `insight-${++insightId}`,
        type: 'success',
        message: `Good renewable energy adoption at ${renewableShare.toFixed(1)}% of total consumption.`,
        metric: 'Renewable Share',
        value: renewableShare
      });
    }
  }

  // DG usage insight
  const dgCol = columns.find(c => /dg|diesel|generator/i.test(c.name));
  if (dgCol?.sum && dgCol.sum > 0) {
    insights.push({
      id: `insight-${++insightId}`,
      type: 'info',
      message: `DG usage detected. Monitor correlation with grid interruptions to optimize backup power strategy.`,
      metric: dgCol.name,
      value: dgCol.sum
    });
  }

  return insights;
}
