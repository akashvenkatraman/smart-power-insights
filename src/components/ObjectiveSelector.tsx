import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Zap, 
  AlertTriangle, 
  Fuel, 
  Leaf 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisObjective } from '@/types/analytics';

interface ObjectiveOption {
  id: AnalysisObjective;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const objectives: ObjectiveOption[] = [
  {
    id: 'overall-usage',
    label: 'Overall Power Usage',
    description: 'Total consumption trends and patterns',
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    id: 'cost-analysis',
    label: 'Cost Analysis',
    description: 'Cost vs units and billing insights',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'source-mix',
    label: 'Power Source Mix',
    description: 'EB, Solar, Wind, DG breakdown',
    icon: <PieChart className="w-5 h-5" />
  },
  {
    id: 'efficiency',
    label: 'Efficiency Analysis',
    description: 'Loss detection and inefficiencies',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'threshold-breach',
    label: 'Threshold Breach',
    description: 'Alert when limits exceeded',
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    id: 'fuel-dependency',
    label: 'Fuel Dependency',
    description: 'HFO and diesel usage analysis',
    icon: <Fuel className="w-5 h-5" />
  },
  {
    id: 'green-power',
    label: 'Green Power Share',
    description: 'Renewable vs non-renewable',
    icon: <Leaf className="w-5 h-5" />
  }
];

interface ObjectiveSelectorProps {
  selected: AnalysisObjective | null;
  onSelect: (objective: AnalysisObjective) => void;
}

export const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  selected,
  onSelect
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-foreground">Select Analysis Objective</h3>
      <p className="text-sm text-muted-foreground">
        Choose what insights you want to extract from your data
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {objectives.map((obj, index) => {
          const isSelected = selected === obj.id;

          return (
            <motion.button
              key={obj.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(obj.id)}
              className={cn(
                'glass-card p-4 rounded-xl border text-left transition-all duration-200',
                'hover:scale-[1.02] hover:border-primary/40',
                isSelected
                  ? 'border-primary/60 bg-primary/10 glow-primary'
                  : 'border-border/50'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors',
                  isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                )}
              >
                {obj.icon}
              </div>
              <h4 className={cn(
                'font-medium mb-1 transition-colors',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {obj.label}
              </h4>
              <p className="text-xs text-muted-foreground">{obj.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
