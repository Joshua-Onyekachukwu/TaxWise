import React from "react";

import { getDeductibleTransactions } from "@/app/actions/deductibles";

export default async function DeductiblesPage() {
    const transactions = await getDeductibleTransactions();
    const totalDeductibles = transactions.reduce((acc, tx) => acc + tx.amount, 0);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Deductibles</h1>

            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold">Total Deductible Amount</h2>
                <p className="text-2xl font-bold">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalDeductibles)}</p>
            </div>

            <div className="mb-4 flex space-x-4">
                {/* Placeholder for filters */}
                <input type="date" className="p-2 border rounded" />
                <select className="p-2 border rounded">
                    <option>All Categories</option>
                    <option>Office Expenses</option>
                    <option>Meals & Entertainment</option>
                    <option>Software</option>
                </select>
            </div>

            <table className="w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Description</th>
                        <th className="px-4 py-2">Category</th>
                        <th className="px-4 py-2">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t) => (
                        <tr key={t.id}>
                            <td className="border px-4 py-2">{t.date}</td>
                            <td className="border px-4 py-2">{t.description}</td>
                            <td className="border px-4 py-2">{t.category}</td>
                            <td className="border px-4 py-2">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(t.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}