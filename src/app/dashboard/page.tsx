import React from "react";
import WelcomeBanner from "@/components/Dashboard/WelcomeBanner";
import FinancialStats from "@/components/Dashboard/Finance/FinancialStats";
import SpendingOverview from "@/components/Dashboard/Finance/SpendingOverview";
import RecentTransactions from "@/components/Dashboard/Finance/RecentTransactions";
import IncomeVsExpenses from "@/components/Dashboard/Finance/IncomeVsExpenses";
import DeductibleStatus from "@/components/Dashboard/Finance/DeductibleStatus";
import ActiveEmptyState from "@/components/Dashboard/ActiveEmptyState";
import { getDashboardStats } from "@/app/actions/dashboard";

export default async function Dashboard({ searchParams }: { searchParams: { accountId?: string } }) {
  const data = await getDashboardStats(searchParams.accountId);

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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[30px] mb-[30px]">
        <div className="xl:col-span-2">
          <IncomeVsExpenses data={data.incomeVsExpense} />
        </div>
        <div className="xl:col-span-1">
          <DeductibleStatus series={data.deductibleSeries} savedAmount={data.stats.estTaxSaved} />
        </div>
      </div>

      {/* 4. Bottom Grid (Spending + Transactions) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[30px]">
        {/* Left Column: Spending Chart */}
        <div className="xl:col-span-1">
          <SpendingOverview data={data.spendingOverview} />
        </div>

        {/* Right Column: Recent Transactions (Wider) */}
        <div className="xl:col-span-2">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>
    </>
  );
}
