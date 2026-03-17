"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  totalDeductibles: number;
  estimatedTaxSavings: number;
}

const ReportPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateReport = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.rpc('generate_tax_report');

      if (error) {
        console.error('Error generating report:', error);
      } else {
        setReportData(data);
      }
      setLoading(false);
    };

    generateReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <p>Generating your report...</p>;
  if (!reportData) return <p>Could not generate report.</p>;

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tax Report</h1>
          <button onClick={handlePrint} className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">Print Report</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Total Income</h2>
            <p className="text-3xl font-bold text-green-500">₦{reportData.totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Total Expenses</h2>
            <p className="text-3xl font-bold text-red-500">₦{reportData.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Deductible Expenses</h2>
            <p className="text-3xl font-bold">₦{reportData.totalDeductibles.toLocaleString()}</p>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Estimated Tax Savings</h2>
            <p className="text-3xl font-bold text-blue-500">₦{reportData.estimatedTaxSavings.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
