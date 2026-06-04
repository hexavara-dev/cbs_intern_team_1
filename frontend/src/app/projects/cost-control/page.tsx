"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/layouts/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import Typography from "@/components/Typography";
import CostHistoryTable from "@/components/cost-monitoring-report/CostHistoryTable";
import { PendingCostList } from "@/components/cost-monitoring-report/PendingCostList";
import { cn } from "@/lib/cn";
import { useGetAllCostOut } from "@/hooks/useCostOut";
import { CostActionDialog } from "@/components/cost-control/CostActionDialog";
import Loading from "@/components/Loading";
import TableSearchInput from "@/components/shared/TableSearchInput";
import { useDebounce } from "@/hooks/useDebounce";

export default function GlobalCostControlPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"approved" | "pending">("pending");

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "process" | null
  >(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: costRecordsAPI, isLoading } = useGetAllCostOut({
    projectName: debouncedSearchQuery,
  });
  const costRecords = useMemo(() => costRecordsAPI ?? [], [costRecordsAPI]);

  const filteredRecords = useMemo(() => {
    let records = costRecords;

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

  const handleAction = (id: string, type: "approve" | "reject" | "process") => {
    const record = costRecords.find((r) => r.id === id);
    setSelectedRecordId(id);
    setSelectedProjectId(record?.project_id ?? null);
    setActionType(type);
  };

  const handleActionSuccess = () => {
    setSelectedRecordId(null);
    setSelectedProjectId(null);
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
              Pantau dan Kelola Keseluruhan Ajuan Cost Out Semua Proyek
            </Typography>
          </div>
          <div className="flex gap-2">
            <Link href="/projects/cost-control/record-cost">
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
        <div className="flex w-full justify-end">
          <TableSearchInput
            placeholder="Search project name..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

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

        <CostActionDialog
          isOpen={!!selectedRecordId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRecordId(null);
              setSelectedProjectId(null);
              setActionType(null);
            }
          }}
          actionType={actionType}
          recordId={selectedRecordId}
          projectId={selectedProjectId ?? undefined}
          onSuccess={handleActionSuccess}
        />
      </div>
    </Layout>
  );
}
