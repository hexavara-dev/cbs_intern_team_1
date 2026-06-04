"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import Typography from "@/components/Typography";
import CostHistoryTable from "@/components/cost-monitoring-report/CostHistoryTable";
import { PendingCostList } from "@/components/cost-monitoring-report/PendingCostList";
import { cn } from "@/lib/cn";
import { CostActionDialog } from "@/components/cost-control/CostActionDialog";
import Loading from "@/components/Loading";
import { useGetProjectCostOut } from "@/hooks/useCostOut";

export default function CostControlPage() {
  const { projectId } = useParams() as { projectId: string };

  const { data: costRecordsAPI, isLoading } = useGetProjectCostOut(projectId);

  const costRecords = useMemo(() => costRecordsAPI ?? [], [costRecordsAPI]);

  const [viewMode, setViewMode] = useState<"approved" | "pending">("pending");

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "process" | null
  >(null);

  const filteredRecords = useMemo(() => {
    let records = costRecords;

    // Filter by Status
    if (viewMode === "approved") {
      records = records.filter(
        (r) => r.status === "approved" || r.status === "rejected"
      );
    } else {
      records = records.filter(
        (r) => r.status === "pending" || r.status === "onproses"
      );
    }

    return records;
  }, [costRecords, viewMode]);

  // Approval Handlers
  const handleAction = (id: string, type: "approve" | "reject" | "process") => {
    setSelectedRecordId(id);
    setActionType(type);
  };

  const handleActionSuccess = () => {
    setSelectedRecordId(null);
    setActionType(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <Typography variant="title" weight="bold">
              Cost Control
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Pantau dan Ajukan History Pengeluaran Disini
            </Typography>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${projectId}/cost-control/record-cost`}>
              <Button className="gap-2">
                <Plus size={18} /> Record Cost Out
              </Button>
            </Link>
          </div>
        </div>

        {/* View Selection */}
        <div className="mb-6 flex border-b">
          <button
            onClick={() => setViewMode("pending")}
            className={cn(
              "hover:text-primary flex cursor-pointer items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors",
              viewMode === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            Pending Requests
            {costRecords.filter((r) => r.status === "pending").length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {costRecords.filter((r) => r.status === "pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode("approved")}
            className={cn(
              "hover:text-primary cursor-pointer border-b-2 px-6 py-3 text-sm font-medium transition-colors",
              viewMode === "approved"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500"
            )}
          >
            Cost Out History
          </button>
        </div>

        {/* Content Area */}
        <div className="flex min-h-[400px] flex-col rounded-xl border bg-white p-4 shadow-sm md:p-6">
          {viewMode === "approved" ? (
            <CostHistoryTable records={filteredRecords} />
          ) : (
            <PendingCostList
              records={filteredRecords}
              onAction={handleAction}
            />
          )}
        </div>

        {/* Approval Dialog */}
        <CostActionDialog
          isOpen={!!selectedRecordId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRecordId(null);
              setActionType(null);
            }
          }}
          actionType={actionType}
          recordId={selectedRecordId}
          onSuccess={handleActionSuccess}
        />
      </div>
    </Layout>
  );
}
