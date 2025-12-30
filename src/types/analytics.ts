// Analysis objective types
export type AnalysisObjective = 
  | 'overall-usage'
  | 'cost-analysis'
  | 'source-mix'
  | 'efficiency'
  | 'threshold-breach'
  | 'fuel-dependency'
  | 'green-power';

export interface AnalysisConfig {
  objective: AnalysisObjective;
  selectedSheets: string[];
  selectedColumns: string[];
  timeRange?: {
    start?: string;
    end?: string;
  };
  thresholds?: {
    costBenchmark?: number;
    usageThreshold?: number;
  };
}

export interface KPIData {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'stacked-bar' | 'pie' | 'donut' | 'area' | 'heatmap';
  title: string;
  data: Record<string, unknown>[];
  xKey?: string;
  yKeys?: string[];
  colors?: string[];
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: {
    kpis: string[];
    charts: ChartConfig[];
  };
}

export interface Insight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  message: string;
  metric?: string;
  value?: number;
}

export interface UploadState {
  status: 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'ready' | 'error';
  progress: number;
  error?: string;
}
