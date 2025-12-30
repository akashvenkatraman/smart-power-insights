import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileImage, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ExportButtonsProps {
  targetRef: React.RefObject<HTMLDivElement>;
  fileName?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  targetRef,
  fileName = 'power-analytics-report'
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const exportAsImage = async () => {
    if (!targetRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#0a0f1a',
        scale: 2,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: 'Export Successful',
        description: 'Dashboard exported as PNG image'
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export dashboard as image',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    if (!targetRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#0a0f1a',
        scale: 2,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
      
      toast({
        title: 'Export Successful',
        description: 'Dashboard exported as PDF document'
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export dashboard as PDF',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsImage}
        disabled={isExporting}
        className="gap-2"
      >
        <FileImage className="w-4 h-4" />
        Export PNG
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsPDF}
        disabled={isExporting}
        className="gap-2"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </Button>
    </motion.div>
  );
};
