import React from 'react';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ExportManagerProps {
  moduleName?: string;
  data?: any[];
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  moduleName = 'Event',
  data = [],
}) => {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${moduleName} Report`, 10, 10);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 20);

    // Simple dump for now, real implementation would use autoTable
    let yPos = 30;
    data.slice(0, 20).forEach((item, index) => {
      const line = JSON.stringify(item).substring(0, 80);
      doc.text(`${index + 1}. ${line}...`, 10, yPos);
      yPos += 7;
    });

    doc.save(`${moduleName}_Report.pdf`);
    toast.success('PDF Report generated');
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${moduleName}_Export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-xl font-black uppercase tracking-widest text-xs"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-xl w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4 text-red-500" />
          <span>Polished PDF Report</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Raw Data CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
