"use client";

import { SummaryCard } from "@/components/ui/summary-card";
import {
  Wallet,
  TrendingUp,
  BanknoteArrowDown,
  DollarSign,
  BanknoteArrowUp,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/cn";
import { Input } from "@/components/shared/form/input";
import { Project } from "@/types/project";
import { useFormContext } from "react-hook-form";
import { CurrencyInput } from "../shared/form/currency-input";
import { useGetTotalRAP } from "@/hooks/useWBS";
import { useGetCostSummary } from "@/hooks/useCostReport";
import { useParams } from "next/navigation";
import { useGetCostInSummary } from "@/hooks/useCostIn";

interface ProjectInfoSectionProps {
  project: Project;
  isEditing: boolean;
}

export default function ProjectInfoSection({
  project,
  isEditing,
}: ProjectInfoSectionProps) {
  const { getValues } = useFormContext();
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: totalRAPAPI } = useGetTotalRAP(projectId);
  const { data: costSummary } = useGetCostSummary(projectId);
  const { data: costInSummaryAPI } = useGetCostInSummary(projectId);

  const totalAdendum = project.total_adendum;
  const totalRAP = totalRAPAPI ?? 0;
  const totalExpenses = costSummary?.total_actual_cost ?? 0;
  const isOverBudget = totalExpenses > totalRAP;
  const totalCostIn = costInSummaryAPI?.total_cost_in ?? 0;

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        <SummaryCard
          label="Total RAP"
          icon={DollarSign}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-500"
        >
          {formatCurrency(totalRAP)}
        </SummaryCard>

        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={BanknoteArrowDown}
          iconBgColor={isOverBudget ? "bg-red-50" : "bg-orange-50"}
          iconColor={isOverBudget ? "text-red-500" : "text-orange-500"}
        />

        <SummaryCard
          label="Progress"
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-500"
        >
          <div className="flex items-center gap-3">
            <span>{project.progress}%</span>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn(
                  "h-full bg-purple-500 transition-all",
                  project.progress === 100 && "bg-green-500"
                )}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </SummaryCard>
      </div>
    );
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          name="location"
          label="Location"
          placeholder="e.g. Surabaya"
          validation={{ required: "Location is required" }}
        />
        <CurrencyInput
          name="budget"
          label="Budget"
          validation={{ required: "Budget is required" }}
        />
        <div className="flex gap-4">
          <Input
            name="start_date"
            label="Start Date"
            type="date"
            validation={{ required: "Start date is required" }}
          />
          <Input
            name="end_date"
            label="End Date"
            type="date"
            validation={{
              required: "End date is required",
              validate: (value) => {
                const startDate = getValues("start_date");
                if (startDate && value < startDate) {
                  return "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
                }
                return true;
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}
