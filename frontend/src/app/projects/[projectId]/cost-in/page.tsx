"use client";

import React, { useState } from "react";
import { Layout } from "@/layouts/Layout";
import { cn } from "@/lib/cn";
import CostInTerminSummaryTable from "@/components/cost-in/CostInTerminSummaryTable";
import CostInHistoryTable from "@/components/cost-in/CostInHistoryTable";
import CostInFormDialog, {
  CostInFormValues,
} from "@/components/cost-in/CostInFormDialog";
import Typography from "@/components/Typography";
import { SummaryCard } from "@/components/ui/summary-card";
import { formatCurrency } from "@/utils/formatCurrency";
import { BanknoteArrowUp, Wallet } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useProject } from "@/hooks/useProjects";
import Loading from "@/components/Loading";
import {
  useCreateCostIn,
  useGetCostInRecords,
  useGetCostInSummary,
} from "@/hooks/useCostIn";

export default function CostInPage() {
  const { projectId } = useParams() as { projectId: string };

  const [activeTab, setActiveTab] = useState<"summary" | "history">("summary");

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: costInRecordsAPI, isLoading: isLoadingCostInRecords } =
    useGetCostInRecords(projectId);
  const { data: costInSummaryAPI, isLoading: isLoadingCostInSummary } =
    useGetCostInSummary(projectId);

  const { mutate: createCostIn } = useCreateCostIn(projectId);

  const isLoading =
    isLoadingProject ||
    isLoadingCostInRecords ||
    isLoadingCostInSummary;
  const totalAdendum = project?.total_adendum ?? 0;
  const costInRecords = costInRecordsAPI ?? [];

  const costInTerminSummary = costInSummaryAPI?.termin ?? [];
  const totalCostIn = costInSummaryAPI?.total_cost_in ?? 0;

  function onSubmit(data: CostInFormValues) {
    const formData = new FormData();

    // formData.append("termin_category", data.terminCategory);
    if (data.photo) {
      formData.append("receipt", data.photo[0]);
    }
    formData.append("transaction_date", data.date);
    formData.append("description", data.description);
    formData.append("amount", data.nominal?.toString() || "");

    createCostIn(formData);
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!project) {
    return notFound();
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="title" weight="bold">
              Cost In Monitoring
            </Typography>
            <Typography variant="body" className="text-muted-foreground mt-1">
              Pantau dan Catat Pemasukan Proyek per Termin
            </Typography>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryCard
            label="Budget"
            icon={Wallet}
            iconBgColor="bg-green-50"
            iconColor="text-green-500"
          >
            {formatCurrency(project.budget)}

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
        </div>

        <div className="mb-0 flex justify-end">
          <CostInFormDialog
            onCreateCostIn={onSubmit}
          />
        </div>
        {/* View Selection Tab */}
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
            Cost In Summary
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "hover:text-primary cursor-pointer border-b-2 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            Cost In History
          </button>
        </div>

        {activeTab === "summary" && (
          <CostInTerminSummaryTable data={costInTerminSummary} />
        )}

        {activeTab === "history" && <CostInHistoryTable data={costInRecords} />}
      </div>
    </Layout>
  );
}
