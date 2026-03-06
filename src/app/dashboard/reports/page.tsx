import React from "react";

export default function ReportsPage() {

    const handleGenerateReport = () => {
        // Placeholder for report generation logic
        alert("Generating report...");
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Reports</h1>

            <div className="p-6 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Generate Financial Report</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Report Format</label>
                        <select className="mt-1 block w-full p-2 border rounded-md">
                            <option>PDF</option>
                            <option>CSV</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleGenerateReport}
                    className="w-full bg-primary-500 text-white py-3 rounded-md font-medium hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    Generate Report
                </button>
            </div>
        </div>
    );
}