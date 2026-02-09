import React from "react";
import WelcomeBanner from "@/components/Dashboard/WelcomeBanner";
import FinancialStats from "@/components/Dashboard/Finance/FinancialStats";
import SpendingOverview from "@/components/Dashboard/Finance/SpendingOverview";
import RecentTransactions from "@/components/Dashboard/Finance/RecentTransactions";
import IncomeVsExpenses from "@/components/Dashboard/Finance/IncomeVsExpenses";
import DeductibleStatus from "@/components/Dashboard/Finance/DeductibleStatus";
import ActiveEmptyState from "@/components/Dashboard/ActiveEmptyState";
import { getDashboardStats } from "@/app/actions/dashboard";

export default async function Dashboard() {
  const data = await getDashboardStats();

  if (!data.hasData) {
    return <ActiveEmptyState />;
  }

  return (
    <>
      {/* 1. Welcome Banner */}
      <WelcomeBanner />

      {/* 2. Financial Stats (Top Cards) */}
      <FinancialStats stats={data.stats} />

      {/* 3. Charts Row (Income vs Expenses + Deductible Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px] mb-[25px]">
        <div className="lg:col-span-2">
          <IncomeVsExpenses data={data.incomeVsExpense} />
        </div>
        <div className="lg:col-span-1">
          <DeductibleStatus series={data.deductibleSeries} />
        </div>
      </div>

      {/* 4. Bottom Grid (Spending + Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[25px]">
        {/* Left Column: Spending Chart */}
        <div className="lg:col-span-1">
          <SpendingOverview data={data.spendingOverview} />
        </div>

        {/* Right Column: Recent Transactions (Wider) */}
        <div className="lg:col-span-2">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>
    </>
  );
}
