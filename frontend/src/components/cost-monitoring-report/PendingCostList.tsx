import React from "react";
import { Button } from "@/components/ui/button";
import Typography from "@/components/Typography";
import { formatCurrency } from "@/utils/formatCurrency";
import { CostOutRecord } from "@/types/cost";
import { Check, X, Eye, Timer } from "lucide-react";
import { formatDate } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface PendingCostListProps {
  records: CostOutRecord[];
  onAction: (id: string, type: "approve" | "reject" | "process") => void;
}

export const PendingCostList: React.FC<PendingCostListProps> = ({
  records,
  onAction,
}) => {
  const isProjectNameAvailable = records.some(
    (record) => !!record.project_name?.trim()
  );

  const statusFilters = [
    { label: "all", value: "all" },
    { label: "on process", value: "onproses" },
    { label: "pending", value: "pending" },
  ] as const;

  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "onproses" | "pending"
  >("all");

  const selectedStatusLabel =
    statusFilters.find((status) => status.value === statusFilter)?.label ??
    statusFilter;

  const filteredRecords = records.filter((record) => {
    if (statusFilter === "all") return true;
    return record.status === statusFilter;
  });

  return (
    <div className="flex h-full flex-1 flex-col space-y-4">
      <div className="flex w-full justify-end">
        <div className="flex gap-2">
          {statusFilters.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={cn(
                "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all",
                statusFilter === status.value
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
          <Typography variant="label" className="text-muted-foreground italic">
            Tidak ada ajuan
            {statusFilter === "all"
              ? ""
              : ` dengan status ${selectedStatusLabel}`}
            .
          </Typography>
        </div>
      ) : (
        filteredRecords.map((record) => (
          <div
            key={record.id}
            className="group flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md md:flex-row md:items-start md:justify-between"
          >
            {/* LEFT CONTENT */}
            <div className="flex-1 space-y-4">
              {/* Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full justify-between">
                  <div className="flex items-center gap-2">
                    {record.status === "onproses" ? (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
                        ON PROCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                        PENDING
                      </span>
                    )}
                    <Typography
                      variant="label"
                      className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                      {isProjectNameAvailable && record.project_name && (
                        <>
                          <span className="rounded-md bg-light-gray/20 px-2 py-0.5 text-xs font-medium text-dark-gray ring-1 ring-light-gray/10 ring-inset">
                            {record.project_name}
                          </span>
                        </>
                      )}
                      <span>
                        {formatDate(record.transaction_date, "dd MMM yyyy")} •{" "}
                        {record.vendor?.name || "No Vendor"} -{" "}
                        {record.activity_name ?? "-"}
                      </span>
                    </Typography>
                  </div>

                  <Link
                    href={`/projects/${record.project_id}/cost-control/record/${record.id}`}
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2 md:w-auto"
                    >
                      <Eye size={16} />
                      Detail
                    </Button>
                  </Link>
                </div>
              </div>

              {/* WBS Info */}
              <div className="rounded-md bg-gray-50 p-2 text-sm">
                <span className="font-semibold text-gray-700">WBS: </span>
                <span className="font-bold text-gray-900">
                  {record.wbs_item.wbs_code}
                </span>
                <span className="text-gray-600">
                  {" "}
                  - {record.wbs_item.description}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2 border-l-2 border-gray-200 pl-4">
                {record.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex-1">
                      <span className="block font-medium text-gray-800">
                        {item.description}
                      </span>
                      <span className="inline-flex items-center rounded-sm bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        {item.cbs_category?.name} -{" "}
                        {item.cbs_category?.cost_type || "Uncategorized"}
                      </span>
                    </div>
                    <span className="whitespace-nowrap text-gray-500">
                      {Number(item.quantity)} × {formatCurrency(item.unit_cost)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <Typography weight="bold" className="text-primary text-base">
                  Total: {formatCurrency(record.total_amount)}
                </Typography>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col md:items-end">
              <Button
                leftIcon={X}
                variant="outline"
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 md:w-full"
                onClick={() => onAction(record.id, "reject")}
              >
                Reject
              </Button>

              {record.status !== "onproses" && (
                <Button
                  leftIcon={Timer}
                  variant="outline"
                  className="w-full gap-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700 md:w-full"
                  onClick={() => onAction(record.id, "process")}
                >
                  Process
                </Button>
              )}

              <Button
                leftIcon={Check}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 md:w-full"
                onClick={() => onAction(record.id, "approve")}
              >
                Approve
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
