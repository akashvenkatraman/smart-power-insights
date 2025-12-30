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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { cn } from '@/lib/utils';

// Chart color palette matching our design system
// Chart color palette - Premium, high-contrast colors
const CHART_COLORS = {
  eb: 'hsl(199, 89%, 48%)',       // Professional blue
  solar: 'hsl(38, 92%, 50%)',     // Warm amber
  wind: 'hsl(158, 64%, 52%)',     // Emerald/Green
  dg: 'hsl(346, 77%, 49%)',       // Ruby red
  grid: 'hsl(262, 52%, 47%)',     // Deep violet
  other: 'hsl(215, 16%, 47%)'      // Muted slate
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

export const ChartCard: React.FC<ChartCardProps & { badge?: string }> = ({
  title,
  subtitle,
  children,
  className,
  delay = 0,
  badge
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, ease: "circOut" }}
      className={cn(
        'glass-card rounded-2xl border border-white/5 overflow-hidden group hover:border-primary/30 transition-all duration-500',
        className
      )}
    >
      <div className="p-5 border-b border-white/5 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-100 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5 chart-container bg-gradient-to-b from-white/[0.02] to-transparent">
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
          stroke="hsl(215, 30%, 85%)"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="hsl(215, 30%, 85%)"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
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
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
          itemStyle={{ color: 'hsl(210, 40%, 96%)', padding: '2px 0' }}
          labelStyle={{ color: 'hsl(215, 20%, 75%)', fontWeight: '800', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}
          formatter={(value: any, name: string) => [
            `${name}: ${typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : value}`,
            ''
          ]}
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
          stroke="hsl(215, 30%, 85%)"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="hsl(215, 30%, 85%)"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
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
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
          itemStyle={{ color: 'hsl(210, 40%, 96%)', padding: '2px 0' }}
          labelStyle={{ color: 'hsl(215, 20%, 75%)', fontWeight: '800', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}
          formatter={(value: any, name: string) => [
            `${name}: ${typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : value}`,
            ''
          ]}
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
  // Group small slices into "Others" for clarity
  const processedData = React.useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const mainSlices = data.filter(item => (item.value / total) >= 0.03);
    const otherSlices = data.filter(item => (item.value / total) < 0.03);

    if (otherSlices.length === 0) return data;

    return [
      ...mainSlices,
      { name: 'Others', value: otherSlices.reduce((sum, item) => sum + item.value, 0) }
    ];
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
          labelLine={true}
          minAngle={5}
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
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
          itemStyle={{ color: 'hsl(210, 40%, 96%)', padding: '2px 0' }}
          labelStyle={{ color: 'hsl(215, 20%, 75%)', fontWeight: '800', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}
          formatter={(value: any, name: string) => [
            `${name}: ${typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : value}`,
            ''
          ]}
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
          stroke="hsl(215, 30%, 85%)"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="hsl(215, 30%, 85%)"
          fontSize={11}
          fontWeight={500}
          tickLine={false}
          axisLine={false}
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
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
          itemStyle={{ color: 'hsl(210, 40%, 96%)', padding: '2px 0' }}
          labelStyle={{ color: 'hsl(215, 20%, 75%)', fontWeight: '800', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}
          formatter={(value: any, name: string) => [
            `${name}: ${typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : value}`,
            ''
          ]}
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

interface RadarChartComponentProps {
  data: ChartData[];
  keys: string[];
  colors?: string[];
  height?: number;
}

export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  data,
  keys,
  colors = DEFAULT_COLORS,
  height = 300
}) => {
  // Normalize data for Radar
  // We need to transform data: { subject: 'Math', A: 120, B: 110, fullMark: 150 }
  // Our data: { name: 'Period 1', Value_1: 10, Value_2: 20 }
  // Transformation: We want to compare Key Metrics across one or more Periods? 
  // OR compare Periods across Metrics?
  // Let's assume we want to compare the selected keys (metrics) for the FIRST data point (or average).
  // AND/OR compare multiple data points (periods) on the same radar.

  // Simplified approach: Each 'key' becomes an axis. We plot the first 3 data points (or periods) as "players".

  // BETTER APPROACH for general use:
  // Axes = The selected Keys (e.g. Value_1, Value_2, Value_3)
  // Polygons = The Data Points (e.g. Period 1, Period 2)
  // We need to pivot the data or use it as is if we want axes to be Time?
  // Standard Radar: Axes = Categories (e.g. Quality, Speed). Series = Entity (e.g. Product A).

  // Let's make Axes = keys provided. 
  // Data points = rows in data.
  // We need to transpose data for the chart if we want axes to be the keys.
  // Actually, Recharts Radar expects: 
  // <RadarChart data={data}>
  //   <PolarAngleAxis dataKey="subject" />
  //   <Radar dataKey="A" />
  //   <Radar dataKey="B" />

  // So "data" array has objects. "dataKey" on Axis picks the label. "dataKey" on Radar picks the value.
  // If we pass our standard chartData: { name: 'P1', V1: 10, V2: 20 }
  // Axis dataKey="name" -> Label is 'P1', 'P2'.
  // Radar dataKey="V1" -> Polygon for V1.
  // Radar dataKey="V2" -> Polygon for V2.
  // This compares Trends of V1 vs V2 over time (circular).

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="hsl(217, 33%, 20%)" />
        <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(215, 30%, 85%)', fontSize: 11, fontWeight: 500 }} />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 'auto']}
          tick={{ fill: 'hsl(215, 30%, 85%)', fontSize: 10, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <Legend />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 10%)',
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
          itemStyle={{ color: 'hsl(210, 40%, 96%)', padding: '2px 0' }}
          labelStyle={{ color: 'hsl(215, 20%, 75%)', fontWeight: '800', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}
          formatter={(value: any, name: string) => [
            `${name}: ${typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : value}`,
            ''
          ]}
        />
        {keys.map((key, index) => (
          <Radar
            key={key}
            name={key}
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.4}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
};

interface RadialBarChartComponentProps {
  data: ChartData[];
  dataKey: string; // The metric to show
  nameKey?: string; // The category key
  colors?: string[];
  height?: number;
}

export const RadialBarChartComponent: React.FC<RadialBarChartComponentProps> = ({
  data,
  dataKey,
  nameKey = 'name',
  colors = DEFAULT_COLORS,
  height = 300
}) => {
  // Radial bar needs data sorted usually for better visuals, and a fill color in the data or mapped.
  const chartRefData = data.slice(0, 10).map((d, i) => ({
    ...d,
    fill: colors[i % colors.length]
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={chartRefData}>
        <RadialBar
          // minAngle={15}
          label={{ position: 'insideStart', fill: '#fff' }}
          background
          dataKey={dataKey}
        />
        <Legend
          iconSize={8}
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '11px'
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(222, 47%, 10%)',
            border: '1px solid hsl(217, 33%, 20%)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
          itemStyle={{ color: 'hsl(210, 40%, 96%)', padding: '2px 0' }}
          labelStyle={{ color: 'hsl(215, 20%, 75%)', fontWeight: '800', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase' }}
          formatter={(value: any, name: string) => [
            `${name}: ${typeof value === 'number'
              ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : value}`,
            ''
          ]}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};
