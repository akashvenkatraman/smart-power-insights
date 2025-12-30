import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalysisObjective } from '@/types/analytics';

interface ColumnMapperProps {
    objective: AnalysisObjective | null;
    columns: string[];
    mapping: Record<string, string>;
    onChange: (mapping: Record<string, string>) => void;
}

const OBJECTIVE_FIELDS: Record<AnalysisObjective, { key: string; label: string; optional?: boolean }[]> = {
    'overall-usage': [
        { key: 'consumption', label: 'Total Consumption Column' },
        { key: 'demand', label: 'Maximum Demand Column (Optional)', optional: true }
    ],
    'cost-analysis': [
        { key: 'cost', label: 'Total Cost / Bill Amount' },
        { key: 'rate', label: 'Unit Rate / Price (Optional)', optional: true }
    ],
    'source-mix': [
        { key: 'eb', label: 'Grid / EB Consumption' },
        { key: 'solar', label: 'Solar Generation', optional: true },
        { key: 'dg', label: 'Diesel Gen / DG', optional: true },
        { key: 'wind', label: 'Wind Generation', optional: true }
    ],
    'efficiency': [
        { key: 'pf', label: 'Power Factor' },
        { key: 'losses', label: 'Transmission Losses', optional: true }
    ],
    'fuel-dependency': [
        { key: 'fuel', label: 'Fuel Consumed (Litres)', optional: true },
        { key: 'dg_units', label: 'DG Units Generated' }
    ],
    'threshold-breach': [
        { key: 'value', label: 'Monitored Value' },
        { key: 'limit', label: 'Threshold Limit', optional: true }
    ],
    'green-power': [
        { key: 'renewable', label: 'Renewable Energy Column' },
        { key: 'total', label: 'Total Energy Column' }
    ]
};

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
    objective,
    columns,
    mapping,
    onChange,
}) => {
    // Clear mapping when objective changes (optional, or handle in parent)
    // implementing basic field rendering for now.

    const handleMappingChange = (key: string, value: string) => {
        onChange({ ...mapping, [key]: value });
    };

    if (!objective || !OBJECTIVE_FIELDS[objective]) return null;

    const fields = OBJECTIVE_FIELDS[objective];

    return (
        <Card className="p-6 glass-card border-border/50 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Map Data Columns</h3>
                <p className="text-sm text-muted-foreground">
                    Tell us which columns match the required data fields for {objective.replace('-', ' ')}.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                    <div key={field.key} className="space-y-2">
                        <Label htmlFor={`map-${field.key}`} className="text-sm font-medium">
                            {field.label} {field.optional && <span className="text-muted-foreground font-normal">(Optional)</span>}
                        </Label>
                        <Select
                            value={mapping[field.key] || ''}
                            onValueChange={(val) => handleMappingChange(field.key, val)}
                        >
                            <SelectTrigger id={`map-${field.key}`} className="bg-background/50">
                                <SelectValue placeholder="Select column..." />
                            </SelectTrigger>
                            <SelectContent>
                                {columns.map((col) => (
                                    <SelectItem key={col} value={col}>
                                        {col}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>
        </Card>
    );
};
