import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';

// Chart color palette matching our design system
const CHART_COLORS = {
  eb: 'hsl(192, 91%, 54%)',       // Electric cyan
  solar: 'hsl(48, 96%, 53%)',     // Gold
  wind: 'hsl(142, 76%, 46%)',     // Green
  dg: 'hsl(0, 72%, 51%)',         // Red
  grid: 'hsl(280, 68%, 60%)',     // Purple
  other: 'hsl(215, 20%, 55%)'     // Muted gray
};

const DEFAULT_COLORS = [
  CHART_COLORS.eb,
  CHART_COLORS.solar,
  CHART_COLORS.wind,
  CHART_COLORS.dg,
  CHART_COLORS.grid,
  CHART_COLORS.other
];

interface ChartData {
  [key: string]: string | number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'glass-card rounded-xl border border-border/50 overflow-hidden',
        className
      )}
    >
      <div className="p-4 border-b border-border/30">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="p-4 chart-container">
        {children}
      </div>
    </motion.div>
  );
};

interface TrendChartProps {
  data: ChartData[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  xKey,
  yKeys,
  colors = DEFAULT_COLORS,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
        <XAxis
          dataKey={xKey}
          stroke="hsl(215, 20%, 55%)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(215, 20%, 55%)"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value;
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 10%)',
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '8px',
            color: 'hsl(210, 40%, 96%)'
          }}
        />
        <Legend />
        {yKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ fill: colors[index % colors.length], strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(222, 47%, 6%)', strokeWidth: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

interface BarChartComponentProps {
  data: ChartData[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  stacked?: boolean;
  height?: number;
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
  data,
  xKey,
  yKeys,
  colors = DEFAULT_COLORS,
  stacked = false,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
        <XAxis
          dataKey={xKey}
          stroke="hsl(215, 20%, 55%)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(215, 20%, 55%)"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value;
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 10%)',
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '8px',
            color: 'hsl(210, 40%, 96%)'
          }}
        />
        <Legend />
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={stacked ? 0 : [4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

interface PieChartComponentProps {
  data: { name: string; value: number }[];
  colors?: string[];
  height?: number;
  innerRadius?: number;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  colors = DEFAULT_COLORS,
  height = 300,
  innerRadius = 60
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: 'hsl(215, 20%, 55%)' }}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
              stroke="hsl(222, 47%, 6%)"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 10%)',
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '8px',
            color: 'hsl(210, 40%, 96%)'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface AreaChartComponentProps {
  data: ChartData[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  stacked?: boolean;
  height?: number;
}

export const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  data,
  xKey,
  yKeys,
  colors = DEFAULT_COLORS,
  stacked = true,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
        <XAxis
          dataKey={xKey}
          stroke="hsl(215, 20%, 55%)"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(215, 20%, 55%)"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value;
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 10%)',
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '8px',
            color: 'hsl(210, 40%, 96%)'
          }}
        />
        <Legend />
        {yKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stackId={stacked ? 'stack' : undefined}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};
