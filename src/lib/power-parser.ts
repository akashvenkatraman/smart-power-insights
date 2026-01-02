import { read, utils } from 'xlsx';

export type SourceType = 'Grid' | 'Diesel' | 'Solar' | 'Wind' | 'Total' | 'Other';
export type SustainabilityType = 'Renewable' | 'Non-Renewable' | 'Neutral';

export interface PowerSourceData {
    id: string;
    name: string;
    simpleName: string;
    type: SourceType;
    sustainability: SustainabilityType;
    color: string;

    cost: number[];
    units: number[];
    rent: number[];

    totalCost: number;
    totalUnits: number;
    avgPrice: number;
}

export interface AnalysisInsight {
    type: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    impact?: string;
}

export interface DashboardMetrics {
    dates: string[];
    timestamps: number[];
    sources: PowerSourceData[];
    overall: PowerSourceData;
    analysis: AnalysisInsight[];
    meta: {
        currencyUnit: string;
        powerUnit: string;
    }
}

const STATIC_CONFIG = [
    { id: 'solar', type: 'Solar' as SourceType, sustainability: 'Renewable' as SustainabilityType, name: 'Solar Power', simpleName: 'Solar (Sun)', color: '#10b981', keywords: ['solar', 'pv', 'sun'] },
    { id: 'ogpl', type: 'Wind' as SourceType, sustainability: 'Renewable' as SustainabilityType, name: 'Wind Power (OGPL)', simpleName: 'Wind (OGPL)', color: '#8b5cf6', keywords: ['ogpl'] },
    { id: 'watsun', type: 'Wind' as SourceType, sustainability: 'Renewable' as SustainabilityType, name: 'Wind Power (Cont)', simpleName: 'Wind (Cont)', color: '#c084fc', keywords: ['watsun', 'cont', 'contract'] },
    { id: 'grid', type: 'Grid' as SourceType, sustainability: 'Non-Renewable' as SustainabilityType, name: 'Grid (EB / TNEB)', simpleName: 'Grid (EB)', color: '#0ea5e9', keywords: ['eb', 'grid', 'utility', 'tneb', 'board', 'demand charges'] },
    { id: 'iex', type: 'Grid' as SourceType, sustainability: 'Non-Renewable' as SustainabilityType, name: 'IEX Power', simpleName: 'IEX', color: '#6366f1', keywords: ['iex'] },
    { id: 'diesel', type: 'Diesel' as SourceType, sustainability: 'Non-Renewable' as SustainabilityType, name: 'Diesel / HFO Generators', simpleName: 'Diesel (Gen)', color: '#f59e0b', keywords: ['diesel', 'dg', 'hsd', 'generator', 'fuel', 'hfo'] },
    { id: 'total', type: 'Total' as SourceType, sustainability: 'Neutral' as SustainabilityType, name: 'Total Power', simpleName: 'Total', color: '#64748b', keywords: ['total power cost'] }
];

// --- 1. Robust Value Parsing ---
const parseCell = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const clean = val.replace(/,/g, '').trim();
        if (/^[-–—]+$/.test(clean) || clean === '') return 0;
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

// --- 2. Date Helpers ---
const isLikelyDate = (val: any) => {
    if (typeof val === 'number') return val > 40000 && val < 49000;
    if (typeof val === 'string') {
        if (!isNaN(parseFloat(val)) && isFinite(val as any)) return false;
        // Avoid parsing "Avg 24-25" or similar as date
        if (val.toLowerCase().includes('avg')) return false;

        const d = new Date(val);
        return !isNaN(d.getTime()) && d.getFullYear() >= 2020 && d.getFullYear() < 2030;
    }
    return false;
};
const normalizeDate = (val: any): Date => {
    if (typeof val === 'number') return new Date((val - 25569) * 86400 * 1000);
    if (typeof val === 'string') return new Date(val);
    return new Date();
};

// --- 3. Identification ---
const identifySource = (rowStr: string) => {
    const lower = rowStr.toLowerCase();

    if (lower.includes('hfo') || lower.includes('hsd')) return STATIC_CONFIG.find(s => s.id === 'diesel');
    if (lower.includes('iex')) return STATIC_CONFIG.find(s => s.id === 'iex');
    if (lower.includes('ogpl')) return STATIC_CONFIG.find(s => s.id === 'ogpl');
    if (lower.includes('watsun')) return STATIC_CONFIG.find(s => s.id === 'watsun');
    if (lower.includes('total')) return STATIC_CONFIG.find(s => s.id === 'total');

    for (const config of STATIC_CONFIG) { if (config.keywords.some(k => lower.includes(k))) return config; }
    return null;
};
const identifyMetricType = (rowStr: string): 'COST' | 'UNITS' | 'RENT' | 'UNKNOWN' => {
    const lower = rowStr.toLowerCase();

    // 1. Definite Exclusions (Avoid Rate rows and non-energy units like Liters/KGs)
    if (lower.includes('/kwh') || lower.includes('/unit') || lower.includes('rate') || lower.includes('price')) return 'UNKNOWN';
    if (lower.includes(' lts') || lower.includes(' ltr') || lower.includes(' kgs') || lower.includes(' kg ') || lower.includes(' k.l')) return 'UNKNOWN';

    // 2. Direct Recognition
    if (lower.includes('fixed') || lower.includes('demand') || (lower.includes('md') && lower.includes('charge')) || lower.includes('rent')) return 'RENT';
    if (lower.includes('unit') || lower.includes('consumption') || lower.includes('kwh')) return 'UNITS';
    if (lower.includes('cost') || lower.includes('bill') || lower.includes('amount') || lower.includes('rs')) return 'COST';

    return 'UNKNOWN';
};
const detectUnits = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('crore') || lower.includes('cr')) return 'Cr';
    if (lower.includes('lakh') || lower.includes('lac') || lower.includes('lacs')) return 'Lakhs';
    if (lower.includes('million')) return 'M';
    if (lower.includes('units') && !lower.includes('cost')) return 'Units';
    return '';
};

export const getExcelSheets = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try { resolve(read(e.target?.result, { type: 'array' }).SheetNames); } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
    });
};

const analyzeData = (sources: PowerSourceData[], overall: PowerSourceData, meta: any): AnalysisInsight[] => {
    const insights: AnalysisInsight[] = [];

    // 1. Efficiency Check
    const grid = sources.find(s => s.id === 'grid');
    const iex = sources.find(s => s.id === 'iex');
    const diesel = sources.find(s => s.type === 'Diesel' && !s.id.includes('rent') && s.totalUnits > 0);

    const benchmarkPrice = grid?.avgPrice || 8.5; // Fallback to common grid rate

    if (iex && benchmarkPrice > 0 && iex.avgPrice > benchmarkPrice * 1.1) {
        insights.push({
            type: 'warning',
            title: 'IEX Rate Higher than EB',
            message: `IEX Market price (₹${iex.avgPrice.toFixed(2)}) is higher than EB Board rate (₹${benchmarkPrice.toFixed(2)}).`,
            impact: `Check exchange purchase timing to optimize cost.`
        });
    }

    if (diesel && benchmarkPrice > 0 && diesel.avgPrice > benchmarkPrice * 2) {
        const diff = diesel.avgPrice - benchmarkPrice;
        const wasted = diff * diesel.totalUnits;
        insights.push({
            type: 'danger',
            title: 'Extreme Diesel Overhead',
            message: `Diesel generation is ₹${diesel.avgPrice.toFixed(2)}/unit, double the Grid benchmark.`,
            impact: `Potential Savings: ₹${wasted.toFixed(2)} ${meta.currencyUnit} by maximizing EB/Wind uptime.`
        });
    }

    // 2. Department Analysis (Rent)
    const departments = sources.filter(s => s.rent.reduce((a, b) => a + b, 0) > 0 && s.id !== 'grid' && s.id !== 'solar' && s.id !== 'wind' && s.id !== 'diesel');
    if (departments.length > 0) {
        const topDept = departments.sort((a, b) => b.rent.reduce((x, y) => x + y, 0) - a.rent.reduce((x, y) => x + y, 0))[0];
        const rentSum = topDept.rent.reduce((a, b) => a + b, 0);
        insights.push({
            type: 'info',
            title: 'Department Fixed Costs',
            message: `${topDept.simpleName} contributes the most to fixed overheads.`,
            impact: `Total Rent: ₹${rentSum.toFixed(2)} ${meta.currencyUnit}`
        });
    }

    // 3. Green Scroe
    const renewable = sources.filter(s => s.sustainability === 'Renewable').reduce((a, b) => a + b.totalUnits, 0);
    const total = overall.totalUnits;
    if (total > 0) {
        const score = (renewable / total) * 100;
        if (score > 80) {
            insights.push({ type: 'success', title: 'Sustainability Champion', message: `Excellent Green Score of ${score.toFixed(1)}%.`, impact: 'Greatly reduced carbon footprint.' });
        } else if (score < 20) {
            insights.push({ type: 'danger', title: 'Low Renewable Mix', message: `Green energy is only ${score.toFixed(1)}% of total consumption.`, impact: 'Consider increasing Solar/Wind procurement.' });
        }
    }

    return insights;
};

export const parsePowerExcel = async (file: File, targetSheetName?: string): Promise<DashboardMetrics> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = read(e.target?.result, { type: 'array' });

                let timeline: { dates: string[], timestamps: number[], sheetName: string, dateRowIdx: number, colIndices: number[] } | null = null;
                let detectedCurrencyUnit = 'Lakhs';
                let detectedPowerUnit = 'Lakhs';

                const sheetsToScan = targetSheetName ? [targetSheetName] : workbook.SheetNames;

                for (const sheetName of sheetsToScan) {
                    const sheet = workbook.Sheets[sheetName];
                    if (!sheet) continue;
                    const rows = utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                    let bestRowIdx = -1, maxDates = 0, cols: number[] = [];

                    rows.forEach((row, idx) => {
                        const rowStr = JSON.stringify(row);
                        if (idx < 5) {
                            const u = detectUnits(rowStr);
                            if (rowStr.toLowerCase().includes('cost') && u) detectedCurrencyUnit = u;
                            if ((rowStr.toLowerCase().includes('unit') || rowStr.toLowerCase().includes('consumption')) && u) detectedPowerUnit = u;
                        }
                        const indices = row.map((c, i) => isLikelyDate(c) ? i : -1).filter(i => i !== -1);
                        if (indices.length > maxDates) { maxDates = indices.length; bestRowIdx = idx; cols = indices; }
                    });

                    if (maxDates > 2) {
                        const dateRow = rows[bestRowIdx];
                        const dates = cols.map(i => normalizeDate(dateRow[i]).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
                        const timestamps = cols.map(i => normalizeDate(dateRow[i]).getTime());
                        timeline = { dates, timestamps, sheetName, dateRowIdx: bestRowIdx, colIndices: cols };
                        break;
                    }
                }

                if (!timeline) throw new Error("Could not find a valid timeline.");
                const timelineLength = timeline.timestamps.length;
                const sourcesMap = new Map<string, { cost: number[], units: number[], rent: number[], meta: any }>();
                STATIC_CONFIG.forEach(c => sourcesMap.set(c.id, { cost: new Array(timelineLength).fill(0), units: new Array(timelineLength).fill(0), rent: new Array(timelineLength).fill(0), meta: c }));

                sheetsToScan.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    if (!sheet) return;
                    const rows = utils.sheet_to_json(sheet, { header: 1 }) as any[][];
                    let activeContext: 'DIESEL_RENT' | null = null;
                    let activeSection: 'COST' | 'UNITS' | null = null;

                    rows.forEach((row, rIdx) => {
                        if (timeline && rIdx === timeline.dateRowIdx && sheetName === timeline.sheetName) return;
                        const rowStr = JSON.stringify(row);
                        const rowLower = rowStr.toLowerCase();

                        // 1. UPDATE GLOBAL SECTION CONTEXT (More Resilient)
                        if (rowLower.includes('cost in lakhs') || rowLower.includes('cost in cr') || (rowLower.includes('cost') && !rowLower.includes('unit') && !rowLower.includes('rate'))) {
                            activeSection = 'COST';
                        } else if ((rowLower.includes('unit') || rowLower.includes('consumption') || rowLower.includes('kwh')) && !rowLower.includes('rate')) {
                            activeSection = 'UNITS';
                        }

                        // 2. DYNAMIC CONTEXT MAPPING (DEPARTMENTS)
                        if (rowLower.includes('dg rent split') || rowLower.includes('dept wise') || rowLower.includes('department summary')) {
                            activeContext = 'DIESEL_RENT';
                            return;
                        }

                        // IF HSD or HFO row, we MUST ensure they are both treated as DIESEL cost or units.
                        const sourceConfig = identifySource(rowStr);
                        let metricType = identifyMetricType(rowStr);

                        // 3. APPLY SECTION CONTEXT IF UNDEFINED
                        if (sourceConfig && metricType === 'UNKNOWN' && activeSection) {
                            metricType = activeSection;
                        }

                        let targetId = sourceConfig?.id;

                        // IF we found a source, and we are in a definitive section, enforce metric
                        if (targetId && activeSection && metricType === 'UNKNOWN') metricType = activeSection;

                        // Dynamic Department Logic
                        if (!targetId && activeContext === 'DIESEL_RENT') {
                            const labelCell = row[0];
                            if (typeof labelCell === 'string' && labelCell.trim().length > 1 && !labelCell.toLowerCase().includes('total')) {
                                const label = labelCell.trim();
                                targetId = 'dept_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                metricType = 'RENT';
                                if (!sourcesMap.has(targetId)) {
                                    sourcesMap.set(targetId, {
                                        cost: new Array(timelineLength).fill(0), units: new Array(timelineLength).fill(0), rent: new Array(timelineLength).fill(0),
                                        meta: { id: targetId, type: 'Diesel', sustainability: 'Non-Renewable', name: label, simpleName: label, color: '#f59e0b', keywords: [] }
                                    });
                                }
                            }
                        }

                        // Reset context if we hit a main source
                        if (sourceConfig && activeContext === 'DIESEL_RENT') activeContext = null;
                        if (!targetId || metricType === 'UNKNOWN') return;

                        timeline!.colIndices.forEach((colIdx, tIdx) => {
                            let val = parseCell(row[colIdx]);
                            if (val) {
                                // Scaling Logic (Initial Lakhs/Cr)
                                if (detectedCurrencyUnit === 'Lakhs' && (metricType === 'COST' || metricType === 'RENT') && val > 10000) val = val / 100000;
                                else if (detectedCurrencyUnit === 'Cr' && (metricType === 'COST' || metricType === 'RENT') && val > 500) val = val / 10000000;

                                const store = sourcesMap.get(targetId!)!;

                                // TOTAL ROW HANDLING: Use it, but we will recalculate OVERALL safely later
                                if (metricType === 'COST') store.cost[tIdx] += val;
                                if (metricType === 'UNITS') store.units[tIdx] += val;
                                if (metricType === 'RENT') store.rent[tIdx] += val;
                            }
                        });
                    });
                });

                const buildSource = (id: string): PowerSourceData => {
                    const store = sourcesMap.get(id)!;
                    const sMeta = store.meta;
                    let totalVariableCost = store.cost.reduce((a, b) => a + b, 0);
                    let totalUnits = store.units.reduce((a, b) => a + b, 0);
                    const totalRent = store.rent.reduce((a, b) => a + b, 0);

                    // --- AUTO-CALIBRATION LOGIC ---
                    if (totalUnits > 0 && totalVariableCost > 0) {
                        const rawRate = totalVariableCost / totalUnits;
                        if (rawRate < 0.5) {
                            totalUnits = totalUnits / 100000;
                            store.units = store.units.map(u => u / 100000);
                        }
                    }

                    // For individual sources, totalCost = Variable + Fixed
                    const grandTotalSource = totalVariableCost + totalRent;

                    return {
                        id: sMeta.id, name: sMeta.name, simpleName: sMeta.simpleName,
                        type: sMeta.type as SourceType, sustainability: sMeta.sustainability as SustainabilityType,
                        color: sMeta.color,
                        cost: store.cost, units: store.units, rent: store.rent,
                        totalCost: grandTotalSource, totalUnits,
                        // IMPORTANT: avgPrice (Efficiency) = Variable Cost / Units
                        // This fixes the "109 Diesel rate" by excluding DG Rent from the efficiency metric.
                        avgPrice: totalUnits > 0 ? totalVariableCost / totalUnits : 0
                    };
                };

                const allFoundSources = Array.from(sourcesMap.keys()).map(id => buildSource(id))
                    .filter(s => s.id !== 'total' && (s.totalCost > 0 || s.totalUnits > 0 || s.rent.some(r => r > 0)));

                const resultSources = allFoundSources.sort((a, b) => b.totalCost - a.totalCost);

                // --- ROBUST OVERALL GENERATION ---
                // We sum all primary sources (Grid, Diesel, Wind, Solar, IEX) 
                // but WE MUST include their Rent parts to match the Excel's "Total Power cost".
                const len = timeline.timestamps.length;
                let finalOverallCost = new Array(len).fill(0);
                let finalOverallUnits = new Array(len).fill(0);
                let finalOverallRent = new Array(len).fill(0);

                // Filter for PRIMARY sources (exclude departments)
                const primarySources = allFoundSources.filter(s => !s.id.startsWith('dept_'));

                primarySources.forEach(s => {
                    for (let i = 0; i < len; i++) {
                        finalOverallCost[i] += s.cost[i];
                        finalOverallUnits[i] += s.units[i];
                        finalOverallRent[i] += s.rent[i];
                    }
                });

                const overall: PowerSourceData = {
                    id: 'total', name: 'Total Power', simpleName: 'Total',
                    type: 'Total', sustainability: 'Neutral', color: '#64748b',
                    cost: finalOverallCost, units: finalOverallUnits, rent: finalOverallRent,
                    totalCost: finalOverallCost.reduce((a, b) => a + b, 0),
                    totalUnits: finalOverallUnits.reduce((a, b) => a + b, 0),
                    avgPrice: 0
                };
                // OVERALL GRAND TOTAL = Cost (which now includes HSD/HFO/Demand) + Rent (DG Rent/Demand)
                overall.totalCost = finalOverallCost.reduce((a, b) => a + b, 0) + finalOverallRent.reduce((a, b) => a + b, 0);
                overall.avgPrice = overall.totalUnits > 0 ? overall.totalCost / overall.totalUnits : 0;

                const analysis = analyzeData(resultSources, overall, { currencyUnit: detectedCurrencyUnit, powerUnit: detectedPowerUnit });

                resolve({
                    dates: timeline.dates, timestamps: timeline.timestamps,
                    sources: resultSources, overall, analysis,
                    meta: { currencyUnit: detectedCurrencyUnit, powerUnit: detectedPowerUnit }
                });

            } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
    });
};
