"use client";

import { Layout } from "@/layouts/Layout";
import { useParams } from "next/navigation";
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  BanknoteArrowDown,
  Wallet,
  BanknoteArrowUp,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { CBSSummaryTable } from "@/components/cost-monitoring-report/CBSSummaryTable";
import { WBSMonitoringTable } from "@/components/cost-monitoring-report/WBSMonitoringTable";
import { SummaryCard } from "@/components/ui/summary-card";
import { BudgetUsageChart } from "@/components/cost-monitoring-report/CostVisuals";
import Typography from "@/components/Typography";
import { useGetCostSummary, useGetWBSCostReport } from "@/hooks/useCostReport";
import { useProject } from "@/hooks/useProjects";
import { useGetTotalRAP } from "@/hooks/useWBS";
import Loading from "@/components/Loading";
import { useGetCostInSummary } from "@/hooks/useCostIn";

export default function CostReportPage() {
  const { projectId } = useParams() as { projectId: string };
  const [activeTab, setActiveTab] = useState<"summary" | "table">("summary");

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: costSummary, isLoading: isLoadingCostSummary } =
    useGetCostSummary(projectId);
  const { data: totalRAPAPI, isLoading: isLoadingTotalRAP } =
    useGetTotalRAP(projectId);
  const { data: wbsCostReportAPI } = useGetWBSCostReport(projectId);
  const { data: costInSummaryAPI, isLoading: isLoadingCostInSummary } =
    useGetCostInSummary(projectId);

  const totalAdendum = project?.total_adendum ?? 0;
  const budgetProject = project?.budget ?? 0;
  const totalRAP = totalRAPAPI ?? 0;
  const totalExpenses = costSummary?.total_actual_cost ?? 0;
  const remainingRAP = totalRAP - totalExpenses;
  const costByCBSSummary = costSummary?.by_cbs_category ?? [];
  const wbsCostReport = wbsCostReportAPI ?? [];
  const totalCostIn = costInSummaryAPI?.total_cost_in ?? 0;

  const isOverBudget = totalExpenses > totalRAP;

  const isLoading =
    isLoadingProject ||
    isLoadingCostSummary ||
    isLoadingTotalRAP ||
    isLoadingCostInSummary;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <Typography variant="title" weight="bold">
              Cost Report
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Pantau RAP vs Pengeluaran Proyek Disini
            </Typography>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            label="Budget"
            icon={Wallet}
            iconBgColor="bg-green-50"
            iconColor="text-green-500"
          >
            {formatCurrency(budgetProject)}
            <div className="flex flex-col">
              {totalAdendum > 0 && (
                <span className="mt-0.5 text-xs font-medium text-green-600">
                  + {formatCurrency(totalAdendum)}
                </span>
              )}
            </div>
          </SummaryCard>
          <SummaryCard
            label="Total Cost In"
            icon={BanknoteArrowUp}
            iconBgColor="bg-yellow-50"
            iconColor="text-yellow-500"
          >
            {formatCurrency(totalCostIn)}
          </SummaryCard>
          <SummaryCard
            label="Total RAP"
            value={formatCurrency(totalRAP)}
            icon={DollarSign}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-500"
          />
          <SummaryCard
            label="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={BanknoteArrowDown}
            iconBgColor={isOverBudget ? "bg-red-50" : "bg-orange-50"}
            iconColor={isOverBudget ? "text-red-500" : "text-orange-500"}
          />
          <SummaryCard
            label="RAP - Expenses"
            value={formatCurrency(remainingRAP)}
            icon={remainingRAP >= 0 ? TrendingDown : TrendingUp}
            iconBgColor={remainingRAP >= 0 ? "bg-green-50" : "bg-red-50"}
            iconColor={remainingRAP >= 0 ? "text-green-500" : "text-red-500"}
          />
        </div>

        {/* Progress Visualization */}
        <BudgetUsageChart totalRAP={totalRAP} totalExpenses={totalExpenses} />

        {/* View Selection */}
        <div className="mb-6 flex border-b">
          <button
            onClick={() => setActiveTab("summary")}
            className={cn(
              "hover:text-primary cursor-pointer border-b-2 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "summary"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={cn(
              "hover:text-primary cursor-pointer border-b-2 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "table"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            WBS Cost Table
          </button>
        </div>

        {activeTab === "summary" && (
          <div className="space-y-4">
            <CBSSummaryTable summary={costByCBSSummary} />
          </div>
        )}

        {activeTab === "table" && <WBSMonitoringTable data={wbsCostReport} />}
      </div>
    </Layout>
  );
}
