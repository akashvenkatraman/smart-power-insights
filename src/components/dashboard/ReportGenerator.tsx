
import { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { DashboardMetrics } from "@/lib/power-parser";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { CostSheet } from "@/components/dashboard/CostSheet";
import { InsightsView } from "@/components/dashboard/InsightsView"; // Import
import { Leaf } from 'lucide-react';
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
                        scale: 2,
                        backgroundColor: '#020617', // Match Slate-950 exactly
                        logging: false,
                        useCORS: true,
                        width: section.offsetWidth,
                        height: section.offsetHeight
                    });

                    const imgData = canvas.toDataURL('image/png');
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

                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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
                backgroundColor: '#020617'
            }}
            ref={containerRef}
        >
            {/* 1. Overview Page - Remove min-h-screen to avoid white space */}
            <div className="p-8 bg-slate-950 space-y-8 border-4 border-slate-900">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                    <Leaf className="w-10 h-10 text-emerald-500" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">Executive Summary</h1>
                        <p className="text-slate-400">EcoPower Intelligence Report</p>
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
            <div className="p-8 bg-slate-950 space-y-8">
                <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold text-white">Financial Breakdown</h1>
                </div>
                <CostSheet
                    sources={metrics.sources}
                    overall={metrics.overall}
                    currencyUnit={metrics.meta.currencyUnit}
                    powerUnit={metrics.meta.powerUnit}
                />
            </div>

            {/* 3. Source Pages */}
            {metrics.sources.map(source => (
                <div key={source.id} className="p-8 bg-slate-950 space-y-8">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
                        <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: source.color }}>
                            {source.simpleName[0]}
                        </span>
                        <div>
                            <h1 className="text-4xl font-bold text-white">{source.simpleName} Analysis</h1>
                            <p className="text-slate-400">{source.name} Detailed Breakdown</p>
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
