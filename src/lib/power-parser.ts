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
    { id: 'solar', type: 'Solar', sustainability: 'Renewable', name: 'Solar Power', simpleName: 'Solar (Sun)', color: '#10b981', keywords: ['solar', 'pv', 'sun'] },
    { id: 'wind', type: 'Wind', sustainability: 'Renewable', name: 'Wind Power', simpleName: 'Wind', color: '#8b5cf6', keywords: ['wind', 'ogpl', 'watsun', 'green'] },
    { id: 'grid', type: 'Grid', sustainability: 'Non-Renewable', name: 'Grid (EB / IEX)', simpleName: 'Grid (EB)', color: '#0ea5e9', keywords: ['eb', 'grid', 'utility', 'tneb', 'board', 'iex'] },
    { id: 'diesel', type: 'Diesel', sustainability: 'Non-Renewable', name: 'Diesel / HFO Generators', simpleName: 'Diesel (Gen)', color: '#f59e0b', keywords: ['diesel', 'dg', 'hsd', 'generator', 'fuel', 'hfo'] },
    { id: 'total', type: 'Total', sustainability: 'Neutral', name: 'Total Power', simpleName: 'Total', color: '#64748b', keywords: ['total'] }
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
    if (lower.includes('iex')) return STATIC_CONFIG.find(s => s.id === 'grid');
    if (lower.includes('ogpl') || lower.includes('watsun')) return STATIC_CONFIG.find(s => s.id === 'wind');
    if (lower.includes('total')) return STATIC_CONFIG.find(s => s.id === 'total');

    for (const config of STATIC_CONFIG) { if (config.keywords.some(k => lower.includes(k))) return config; }
    return null;
};
const identifyMetricType = (rowStr: string): 'COST' | 'UNITS' | 'RENT' | 'UNKNOWN' => {
    const lower = rowStr.toLowerCase();

    // Exclusions (Rate/Price should NEVER be Cost)
    if (lower.includes('/kwh') || lower.includes('/unit') || lower.includes('rate') || lower.includes('price')) return 'UNKNOWN';

    if (lower.includes('fixed') || lower.includes('demand') || (lower.includes('md') && lower.includes('charge')) || lower.includes('rent')) return 'RENT';
    if ((lower.includes('unit') || lower.includes('consumption') || lower.includes('kwh'))) return 'UNITS';
    if (lower.includes('cost') || lower.includes('bill') || lower.includes('amount') || lower.includes('rs')) return 'COST';
    return 'UNKNOWN';
};
const detectUnits = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('crore') || lower.includes('cr')) return 'Cr';
    if (lower.includes('lakh') || lower.includes('lac') || lower.includes('lacs')) return 'Lakhs';
    if (lower.includes('million')) return 'M';
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
    const grid = sources.find(s => s.type === 'Grid');
    const diesel = sources.find(s => s.type === 'Diesel' && !s.id.includes('rent') && s.totalUnits > 0);

    if (grid && diesel && diesel.avgPrice > grid.avgPrice * 1.5) {
        const diff = diesel.avgPrice - grid.avgPrice;
        const wasted = diff * diesel.totalUnits;
        insights.push({
            type: 'warning',
            title: 'High Diesel Cost',
            message: `Diesel generation is costing ₹${diesel.avgPrice.toFixed(2)}/unit, which is substantially higher than Grid (₹${grid.avgPrice.toFixed(2)}).`,
            impact: `Potential Savings: ₹${wasted.toFixed(2)} ${meta.currencyUnit} by shifting to Grid.`
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

                    rows.forEach((row, rIdx) => {
                        if (timeline && rIdx === timeline.dateRowIdx && sheetName === timeline.sheetName) return;
                        const rowStr = JSON.stringify(row);
                        const rowLower = rowStr.toLowerCase();

                        if (rowLower.includes('dg rent split')) { activeContext = 'DIESEL_RENT'; return; }

                        const sourceConfig = identifySource(rowStr);
                        let metricType = identifyMetricType(rowStr);
                        let targetId = sourceConfig?.id;

                        // Dynamic Department Logic
                        if (!targetId && activeContext === 'DIESEL_RENT') {
                            const labelCell = row[0];
                            if (typeof labelCell === 'string' && labelCell.trim().length > 1) {
                                const label = labelCell.trim();
                                targetId = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                metricType = 'RENT';
                                if (!sourcesMap.has(targetId)) {
                                    sourcesMap.set(targetId, {
                                        cost: new Array(timelineLength).fill(0), units: new Array(timelineLength).fill(0), rent: new Array(timelineLength).fill(0),
                                        meta: { id: targetId, type: 'Diesel', sustainability: 'Non-Renewable', name: label, simpleName: label, color: '#f59e0b', keywords: [] }
                                    });
                                }
                            }
                        }
                        if (sourceConfig && activeContext === 'DIESEL_RENT') activeContext = null;
                        if (!targetId || metricType === 'UNKNOWN') return;

                        timeline!.colIndices.forEach((colIdx, tIdx) => {
                            let val = parseCell(row[colIdx]);
                            if (val) {
                                // Scaling Logic
                                if (detectedCurrencyUnit === 'Lakhs' && (metricType === 'COST' || metricType === 'RENT') && val > 5000) val = val / 100000;
                                else if (detectedCurrencyUnit === 'Cr' && (metricType === 'COST' || metricType === 'RENT') && val > 500) val = val / 10000000;

                                const store = sourcesMap.get(targetId!)!;
                                if (metricType === 'COST') store.cost[tIdx] = val; // Assuming monthly aggregate, replace or add? USUALLY one Cost row per source. ADD might be safer but if duplicates? "Total" row implies one row.
                                // Let's stick to += for now, as sometimes there are sub-rows.
                                // BUT for 'Total Power Cost', we want to be strict.
                                if (targetId === 'total' && rowStr.toLowerCase().includes('total power cost')) {
                                    // This is the definitive total line. Overwrite any accidental accumulation.
                                    // But we can't easily 'overwrite' if we iterated column by column. 
                                    // Check if this is the FIRST time we hit this definitive row?
                                    // Hard to know.
                                    // Let's just trust += but ensure we don't match other things as 'total'.
                                    // (Previously identified 'Total' config handles this).
                                    store.cost[tIdx] = val; // Force overwrite for Total?
                                } else if (metricType === 'COST') {
                                    store.cost[tIdx] += val;
                                }

                                if (metricType === 'UNITS') store.units[tIdx] += val;
                                if (metricType === 'RENT') store.rent[tIdx] += val;
                            }
                        });
                    });
                });

                const buildSource = (id: string): PowerSourceData => {
                    const store = sourcesMap.get(id)!;
                    const sMeta = store.meta;
                    const totalCost = store.cost.reduce((a, b) => a + b, 0);
                    const totalUnits = store.units.reduce((a, b) => a + b, 0);
                    const totalRent = store.rent.reduce((a, b) => a + b, 0);
                    return {
                        id: sMeta.id, name: sMeta.name, simpleName: sMeta.simpleName,
                        type: sMeta.type as SourceType, sustainability: sMeta.sustainability as SustainabilityType,
                        color: sMeta.color,
                        cost: store.cost, units: store.units, rent: store.rent,
                        totalCost, totalUnits, avgPrice: totalUnits > 0 ? (totalCost + totalRent) / totalUnits : 0
                    };
                };

                const resultSources = Array.from(sourcesMap.keys()).map(id => buildSource(id))
                    .filter(s => s.totalCost > 0 || s.totalUnits > 0 || s.rent.some(r => r > 0))
                    .sort((a, b) => b.totalCost - a.totalCost);

                let overall = buildSource('total');
                // If we found a definitive "Total" source with data, use it.
                // Otherwise, sum up components.
                if (overall.totalCost === 0 && resultSources.length > 0) {
                    const len = timeline.timestamps.length;
                    const sCost = new Array(len).fill(0), sUnits = new Array(len).fill(0), sRent = new Array(len).fill(0);
                    resultSources.forEach(s => {
                        if (s.id !== 'total') { for (let i = 0; i < len; i++) { sCost[i] += s.cost[i]; sUnits[i] += s.units[i]; sRent[i] += s.rent[i]; } }
                    });
                    // Logic for Overall aggregation
                    const totalC = sCost.map((c, i) => c + sRent[i]);
                    overall = {
                        ...overall, cost: totalC, units: sUnits, rent: sRent,
                        totalCost: totalC.reduce((a, b) => a + b, 0), totalUnits: sUnits.reduce((a, b) => a + b, 0)
                    };
                    overall.avgPrice = overall.totalUnits > 0 ? overall.totalCost / overall.totalUnits : 0;

                    // Also add rent to individual sources totalCost for display consistency?
                    resultSources.forEach(s => {
                        const rSum = s.rent.reduce((a, b) => a + b, 0);
                        if (rSum > 0 && s.totalCost < rSum) { s.totalCost += rSum; }
                    });
                }

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
