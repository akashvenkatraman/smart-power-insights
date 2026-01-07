import { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { DashboardMetrics } from "@/lib/power-parser";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { CostSheet } from "@/components/dashboard/CostSheet";
import { InsightsView } from "@/components/dashboard/InsightsView";
import { MonthlyComparison } from "@/components/dashboard/MonthlyComparison";
import { ResultsSummary } from "@/components/dashboard/ResultsSummary";
import { Leaf, Wind, Zap, Sun, Fuel } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface Props {
    metrics: DashboardMetrics;
}

export interface ReportGeneratorHandle {
    downloadPdf: () => Promise<void>;
}

export const ReportGenerator = forwardRef<ReportGeneratorHandle, Props>(({ metrics }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useImperativeHandle(ref, () => ({
        downloadPdf: async () => {
            if (!containerRef.current) return;
            setIsGenerating(true);
            const toastId = toast.loading("Generating PDF Report...");

            try {
                const sections = Array.from(containerRef.current.children) as HTMLElement[];

                // Initialize PDF with a dummy size, we'll set specific sizes per page
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: 'a4',
                    putOnlyUsedFonts: true
                });

                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i];
                    if (!section.offsetParent && !isGenerating) continue;

                    const canvas = await html2canvas(section, {
                        scale: 1.5, // Reduced from 2 to 1.5 for smaller file size
                        backgroundColor: '#020617', // Match Slate-950 exactly
                        logging: false,
                        useCORS: true,
                        width: section.offsetWidth,
                        height: section.offsetHeight,
                        removeContainer: true
                    });

                    // Use JPEG with 85% quality instead of PNG for much smaller file size
                    const imgData = canvas.toDataURL('image/jpeg', 0.85);
                    const imgWidth = section.offsetWidth;
                    const imgHeight = section.offsetHeight;

                    // Add page with the EXACT dimensions of the content section
                    if (i === 0) {
                        // Rescale first page
                        pdf.deletePage(1);
                        pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
                    } else {
                        pdf.addPage([imgWidth, imgHeight], imgWidth > imgHeight ? 'l' : 'p');
                    }

                    // Add image with JPEG compression
                    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
                }

                pdf.save(`EcoPower_Report_${new Date().toISOString().split('T')[0]}.pdf`);
                toast.success("Report Downloaded!");
            } catch (err) {
                console.error(err);
                toast.error("Failed to generate PDF");
            } finally {
                setIsGenerating(false);
                toast.dismiss(toastId);
            }
        }
    }));

    return (
        <div
            style={{
                position: 'absolute',
                left: '-9999px',
                top: 0,
                width: '1200px',
                backgroundColor: '#ffffff'
            }}
            ref={containerRef}
        >
            {/* 1. Overview Page - Remove min-h-screen to avoid white space */}
            <div className="p-8 bg-gray-50 space-y-8">
                {/* Professional Header with Gradient */}
                <div className="bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 border border-emerald-200 rounded-2xl p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="p-4 rounded-xl bg-white border-2 border-emerald-300">
                                <Leaf className="w-12 h-12 text-emerald-600" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black text-gray-900 mb-2">Power Analytics Report</h1>
                                <p className="text-emerald-700 text-xl font-bold">Delphi-TVS Energy Insights</p>
                                <p className="text-gray-600 text-sm mt-1">
                                    Generated: {new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-600 text-sm mb-1">Report Period</div>
                            <div className="text-gray-900 font-bold text-lg">{metrics.dates[0]} - {metrics.dates[metrics.dates.length - 1]}</div>
                        </div>
                    </div>
                </div>

                <MetricCards
                    source={metrics.overall}
                    currencyUnit={metrics.meta.currencyUnit}
                    powerUnit={metrics.meta.powerUnit}
                />

                {/* Added Insights to Report */}
                <InsightsView
                    insights={metrics.analysis}
                    sources={metrics.sources}
                    currencyUnit={metrics.meta.currencyUnit}
                />

                <PowerCharts
                    dates={metrics.dates}
                    data={metrics.overall}
                    breakdown={metrics.sources}
                    mode="overview"
                    currencyUnit={metrics.meta.currencyUnit}
                    powerUnit={metrics.meta.powerUnit}
                />
            </div>

            {/* 2. Detailed Cost Sheet Page */}
            <div className="p-8 bg-gray-50 space-y-8">
                <div className="flex items-center gap-4 mb-4 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Financial Breakdown</h1>
                </div>
                <CostSheet
                    sources={metrics.sources}
                    overall={metrics.overall}
                    currencyUnit={metrics.meta.currencyUnit}
                    powerUnit={metrics.meta.powerUnit}
                />

                <div className="mt-8">
                    <MonthlyComparison
                        sources={metrics.sources}
                        overall={metrics.overall}
                        dates={metrics.dates}
                        currencyUnit={metrics.meta.currencyUnit}
                    />
                </div>

                <div className="mt-8">
                    <ResultsSummary
                        summary={metrics.summary}
                        dates={metrics.dates}
                        currencyUnit={metrics.meta.currencyUnit}
                    />
                </div>
            </div>

            {/* 3. Source Pages */}
            {metrics.sources.map(source => (
                <div key={source.id} className="p-8 bg-gray-50 space-y-8">
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
                        <span className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ backgroundColor: source.color }}>
                            {source.type === 'Wind' && <Wind className="w-7 h-7" />}
                            {source.type === 'Grid' && <Zap className="w-7 h-7" />}
                            {source.type === 'Solar' && <Sun className="w-7 h-7" />}
                            {source.type === 'Diesel' && <Fuel className="w-7 h-7" />}
                            {!['Wind', 'Grid', 'Solar', 'Diesel'].includes(source.type) && <Zap className="w-7 h-7" />}
                        </span>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">{source.simpleName} Analysis</h1>
                            <p className="text-gray-600">{source.name} Detailed Breakdown</p>
                        </div>
                    </div>

                    <MetricCards
                        source={source}
                        currencyUnit={metrics.meta.currencyUnit}
                        powerUnit={metrics.meta.powerUnit}
                    />

                    <PowerCharts
                        dates={metrics.dates}
                        data={source}
                        mode="detail"
                        currencyUnit={metrics.meta.currencyUnit}
                        powerUnit={metrics.meta.powerUnit}
                    />
                </div>
            ))}

        </div>
    );
});

ReportGenerator.displayName = "ReportGenerator";
