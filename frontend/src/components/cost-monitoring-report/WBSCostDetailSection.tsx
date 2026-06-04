"use client";

import React, { useMemo, useState } from "react";
import Typography from "@/components/Typography";
import { SummaryCard } from "@/components/cost-monitoring-report/SummaryCard";
import { useGetWBSCostReportDetail } from "@/hooks/useCostReport";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/cn";
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import Loading from "../Loading";

interface WBSCostDetailSectionProps {
  projectId: string;
  wbsId: string;
  mode?: "page" | "inline";
}

const formatDisplayDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, "dd MMM yyyy");
};

const toDescriptionText = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "-";
};

export const WBSCostDetailSection: React.FC<WBSCostDetailSectionProps> = ({
  projectId,
  wbsId,
  mode = "page",
}) => {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(
    new Set()
  );
  const { data: wbsCostRecord, isLoading } = useGetWBSCostReportDetail(
    projectId,
    wbsId
  );

  const displayWbsId =
    wbsCostRecord?.wbs_info?.wbs_id || decodeURIComponent(wbsId);
  const displayDesc = wbsCostRecord?.wbs_info?.description || "-";
  const displayPlannedCost = wbsCostRecord?.wbs_info?.planned_cost || 0;
  const totalActualCost = wbsCostRecord?.wbs_info?.actual_cost || 0;
  const variance = displayPlannedCost - totalActualCost;

  const allApprovedRecords = useMemo(
    () =>
      (wbsCostRecord?.cost_records || []).filter(
        (r) => r.status === "approved"
      ),
    [wbsCostRecord?.cost_records]
  );

  const isInline = mode === "inline";

  const toggleRecordExpand = (recordId: string) => {
    setExpandedRecords((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!wbsCostRecord || allApprovedRecords.length === 0) {
    return (
      <div className="rounded-sm border bg-white p-6 shadow-sm">
        {!isInline && (
          <div className="mb-4">
            <Typography variant="title" weight="bold">
              WBS Cost Detail
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Belum ada history pengeluaran
            </Typography>
          </div>
        )}
        <div className="rounded-lg border-2 border-dashed py-12 text-center">
          <Typography variant="label" className="text-muted-foreground italic">
            Belum ada data Cost Out untuk WBS ini.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isInline && (
        <div>
          <Typography variant="title" weight="bold">
            WBS Cost Detail
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            Data Pengeluaran WBS Item: {displayWbsId} - {displayDesc}
          </Typography>
        </div>
      )}

      {isInline && (
        <div>
          <Typography variant="h6" weight="semibold">
            {displayWbsId} - {displayDesc}
          </Typography>
          <Typography variant="label" className="text-muted-foreground">
            Ringkasan dan history cost out WBS.
          </Typography>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          label="Total RAP"
          value={formatCurrency(displayPlannedCost)}
          icon={Activity}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-500"
        />

        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(totalActualCost)}
          icon={CheckCircle2}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-500"
          valueClassName={
            totalActualCost > displayPlannedCost
              ? "text-red-600"
              : "text-green-600"
          }
        />

        <SummaryCard
          label="Remaining"
          value={formatCurrency(variance)}
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-500"
          valueClassName={variance < 0 ? "text-red-600" : "text-primary"}
        />
      </div>

      <div className="overflow-hidden rounded-sm border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Date
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Vendor
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Activity
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Total
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Status
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allApprovedRecords.map((record) => {
                const isExpanded = expandedRecords.has(record.id);
                return (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center text-sm">
                        {formatDisplayDate(record.transaction_date)}
                      </td>
                      <td className="px-3 py-2 text-center text-sm">
                        {record.vendor?.name || "No Vendor"}
                      </td>
                      <td className="max-w-[240px] truncate px-3 py-2 text-center text-sm">
                        {record.activity_name || "-"}
                      </td>
                      <td className="px-3 py-2 text-center text-sm font-semibold">
                        {formatCurrency(record.total_amount)}
                      </td>
                      <td className="px-3 py-2 text-center text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800 uppercase">
                          {record.status || "approved"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-sm">
                        <button
                          type="button"
                          onClick={() => toggleRecordExpand(record.id)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown size={12} />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronRight size={12} />
                              Details
                            </>
                          )}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50/70">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div className="rounded-md border bg-white p-3">
                                <Typography
                                  variant="label"
                                  className="text-muted-foreground block"
                                >
                                  Submitted By
                                </Typography>
                                <Typography variant="label" weight="semibold">
                                  {record.submitted_by?.full_name || "-"}
                                </Typography>
                              </div>
                              <div className="rounded-md border bg-white p-3">
                                <Typography
                                  variant="label"
                                  className="text-muted-foreground block"
                                >
                                  Approved By
                                </Typography>
                                <Typography variant="label" weight="semibold">
                                  {record.approved_by?.full_name || "-"}
                                  {record.approved_at
                                    ? ` (${formatDisplayDate(record.approved_at)})`
                                    : ""}
                                </Typography>
                              </div>
                            </div>

                            <div className="overflow-hidden rounded-sm border bg-white">
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-sm">
                                  <thead>
                                    <tr className="bg-gray-600 text-white">
                                      <th className="border-b px-3 py-2 text-left text-xs font-semibold  uppercase">
                                        Description
                                      </th>
                                      <th className="border-b px-3 py-2 text-left text-xs font-semibold  uppercase">
                                        CBS
                                      </th>
                                      <th className="border-b px-3 py-2 text-right text-xs font-semibold  uppercase">
                                        Qty x Unit
                                      </th>
                                      <th className="border-b px-3 py-2 text-right text-xs font-semibold  uppercase">
                                        Total
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {record.items.map((item) => (
                                      <tr key={item.id}>
                                        <td className="px-3 py-2 text-sm">
                                          {toDescriptionText(item.description)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-600">
                                          {item.cbs_category?.name || "-"} -{" "}
                                          {item.cbs_category?.cost_type ||
                                            "Uncategorized"}
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm text-gray-600">
                                          {Number(item.quantity)} x{" "}
                                          {formatCurrency(item.unit_cost)}
                                        </td>
                                        <td className="px-3 py-2 text-right text-sm font-semibold">
                                          {formatCurrency(item.total)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="flex justify-end border-t pt-3">
                              <Typography
                                variant="label"
                                weight="bold"
                                className={cn("text-primary text-sm")}
                              >
                                Total Record:{" "}
                                {formatCurrency(record.total_amount)}
                              </Typography>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
