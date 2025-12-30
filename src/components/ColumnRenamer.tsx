import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColumnRenamerProps {
    columns: string[];
    aliases: Record<string, string>;
    onChange: (aliases: Record<string, string>) => void;
}

export const ColumnRenamer: React.FC<ColumnRenamerProps> = ({
    columns,
    aliases,
    onChange,
}) => {
    const [localAliases, setLocalAliases] = useState<Record<string, string>>(aliases);

    useEffect(() => {
        setLocalAliases(aliases);
    }, [aliases]);

    const handleInputChange = (column: string, value: string) => {
        const newAliases = { ...localAliases, [column]: value };
        setLocalAliases(newAliases);
        onChange(newAliases);
    };

    if (columns.length === 0) return null;

    return (
        <Card className="p-6 glass-card border-border/50">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Rename Columns</h3>
                <p className="text-sm text-muted-foreground">
                    Provide meaningful names for your data columns to improve chart readability.
                </p>
            </div>

            <ScrollArea className="h-[200px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {columns.map((col) => (
                        <div key={col} className="space-y-2">
                            <Label htmlFor={`alias-${col}`} className="text-xs font-medium text-muted-foreground">
                                Original: <span className="text-foreground">{col}</span>
                            </Label>
                            <Input
                                id={`alias-${col}`}
                                value={localAliases[col] || ''}
                                placeholder={col}
                                onChange={(e) => handleInputChange(col, e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>
    );
};
