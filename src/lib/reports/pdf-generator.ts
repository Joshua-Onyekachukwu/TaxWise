import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportStats {
  totalIncome: number;
  totalExpenses: number;
  deductibleExpenses: number;
  estimatedTax: number;
  period?: string;
}

interface Transaction {
  date: string;
  description: string;
  amount: number | string;
  type: string;
  category?: string;
  is_deductible?: boolean;
}

export function generatePDF(stats: ReportStats, transactions: Transaction[]) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('Taxwise Report', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Financial Summary', 14, 45);

  const summaryData = [
    ['Total Income', `N${stats.totalIncome.toLocaleString()}`],
    ['Total Expenses', `N${stats.totalExpenses.toLocaleString()}`],
    ['Deductible Expenses', `N${stats.deductibleExpenses.toLocaleString()}`],
    ['Estimated Tax Liability', `N${stats.estimatedTax.toLocaleString()}`]
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Amount']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [102, 51, 153] }, // Purple
    columnStyles: { 1: { fontStyle: 'bold' } }
  });

  // Disclaimer
  doc.setFontSize(10);
  doc.setTextColor(100);
  const disclaimer = "Disclaimer: This report is an estimate based on provided data. Taxwise is not a certified tax practitioner. Please consult a professional for official filing.";
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(disclaimer, 14, finalY, { maxWidth: 180 });

  // Save
  doc.save('taxwise-report.pdf');
}
