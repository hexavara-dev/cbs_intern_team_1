"use client";

import { Layout } from "@/layouts/Layout";
import { useParams } from "next/navigation";
import ProgressSummary from "@/components/progress-monitoring/ProgressSummary";
import ProgressChart from "@/components/progress-monitoring/ProgressChart";
import Typography from "@/components/Typography";
import { useProject } from "@/hooks/useProjects";
import Loading from "@/components/Loading";
import {
  useGetAllTerminAllocations,
  useGetProjectTermin,
} from "@/hooks/useTermin";
import { ProgressMonitoringTable } from "@/components/progress-monitoring/ProgressMonitoringTable";
import {
  ProgressUpdateModal,
  UpdateProgressFormValues,
} from "@/components/progress-monitoring/ProgressUpdateModal";
import ProgressHistoryTable from "@/components/progress-monitoring/ProgressHistoryTable";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  useCreateProgressRecord,
  useGetProgressHistory,
  useGetProgressSummary,
  useGetProgressTable,
} from "@/hooks/useProgressMonitoring";
import { toast } from "sonner";

export default function ProgressMonitoringPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "table" | "history">(
    "table"
  );

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: projectTermin, isLoading: isLoadingTermin } =
    useGetProjectTermin(projectId);
  const { data: progressTableAPI } = useGetProgressTable(projectId);
  const { data: progressHistoryAPI } = useGetProgressHistory(projectId);
  const { data: terminAllocationsAPI } = useGetAllTerminAllocations(projectId);
  const { data: progressSummaryAPI, isLoading: isLoadingSummary } =
    useGetProgressSummary(projectId);

  const { mutate: createProgressRecord } = useCreateProgressRecord(projectId);

  const termins = projectTermin ?? [];
  const progressTableData = progressTableAPI ?? [];
  const progressHistoryData = progressHistoryAPI ?? [];
  const terminAllocations = terminAllocationsAPI ?? [];

  const totalPlanned = progressSummaryAPI?.total_planned ?? 0;
  const totalExecuted = progressSummaryAPI?.total_executed ?? 0;
  const progressByTermin = progressSummaryAPI?.by_termin ?? [];
  const percentage =
    totalPlanned > 0 ? (totalExecuted / totalPlanned) * 100 : 0;

  const handleSaveProgress = ({
    wbs_id,
    actual_volume,
    description,
    photo,
  }: UpdateProgressFormValues) => {
    const formData = new FormData();

    if (photo) {
      formData.append("progress", photo[0]);
    }
    formData.append("wbs_id", wbs_id);
    formData.append("actual_volume", actual_volume.toString());
    formData.append("description", description);

    createProgressRecord(formData, {
      onSuccess: () => {
        toast.success("Berhasil menyimpan pembaruan progres!");
        setIsModalOpen(false);
      },
    });
  };

  const modalTasks = terminAllocations
    .filter((d) => d.is_leaf)
    .map((d) => ({
      wbs_id: d.id,
      description: d.description,
      planned_volume: d.volume,
      unit: d.unit,
      allocations: d.allocations,
    }));

  if (isLoadingProject || isLoadingTermin || isLoadingSummary) {
    return <Loading />;
  }

  if (!project || !projectTermin) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-500">Project not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="space-y-2">
          <Typography variant="title" weight="bold">
            Progress Monitoring
          </Typography>

          <div className="flex w-full justify-between">
            <Typography variant="body" className="text-muted-foreground">
              Pantau dan Update Progress Pengerjaan Proyek
            </Typography>

            {termins.length > 0 && (
              <Button leftIcon={Edit2} onClick={() => setIsModalOpen(true)}>
                Update Progress
              </Button>
            )}
          </div>
        </div>

        {/* View Selection */}
        <div className="mb-6 flex border-b">
          <button
            onClick={() => setActiveTab("table")}
            className={cn(
              "hover:text-primary cursor-pointer border-b-2 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "table"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            Progress Table
          </button>
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
            onClick={() => setActiveTab("history")}
            className={cn(
              "hover:text-primary cursor-pointer border-b-2 px-6 py-3 text-sm font-medium transition-colors",
              activeTab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            Progress History
          </button>
        </div>

        {/* Table View */}
        {activeTab === "table" && (
          <ProgressMonitoringTable data={progressTableData} termins={termins} />
        )}

        {/* Summary View */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            <ProgressSummary
              totalPlanned={totalPlanned}
              totalExecuted={totalExecuted}
              percentage={percentage}
              progressByTermin={progressByTermin}
            />

            <ProgressChart
              progressByTermin={progressByTermin}
            />
          </div>
        )}

        {activeTab === "history" && (
          <ProgressHistoryTable records={progressHistoryData} />
        )}

        <ProgressUpdateModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          tasks={modalTasks}
          onSave={handleSaveProgress}
        />
      </div>
    </Layout>
  );
}
