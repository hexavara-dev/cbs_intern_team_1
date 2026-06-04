"use client";

import React from "react";
import { CostOutRecord } from "@/types/cost";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/utils/formatCurrency";

import { formatDate } from "date-fns";

interface CostHistoryTableProps {
  records: CostOutRecord[];
}

export default function CostHistoryTable({ records }: CostHistoryTableProps) {
  const isProjectNameAvailable = records.some(
    (record) => !!record.project_name?.trim()
  );

  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "approved" | "rejected"
  >("all");

  const filteredRecords = records.filter((record) => {
    if (statusFilter === "all") return true;
    return record.status === statusFilter;
  });

  const headers = [
    "Date",
    ...(isProjectNameAvailable ? ["Project Name"] : []),
    "Activity Name",
    "WBS Item",
    "Vendor",
    "Total Amount",
    "Status",
    "Action",
  ];

  return (
    <div className="w-full space-y-4">
      <div className="flex w-full justify-end">
        <div className="flex items-center gap-4">
          {/* Status Filter Buttons */}
          <div className="flex gap-2">
            {(["all", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all",
                  statusFilter === status
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-md border shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-700 text-white">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-muted-foreground px-4 py-12 text-center italic"
                  >
                    Tidak ada {statusFilter === "all" ? "" : statusFilter}{" "}
                    riwayat cost out.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-4 text-center text-sm">
                      {formatDate(record.transaction_date, "dd MMM yyyy")}
                    </td>
                    {isProjectNameAvailable && (
                      <td className="px-4 py-4 text-center text-sm font-medium">
                        {record.project_name || "-"}
                      </td>
                    )}
                    <td className="px-4 py-4 text-center text-sm font-medium">
                      {record.activity_name || "-"}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {record.wbs_item.wbs_code} - {record.wbs_item.description}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {record.vendor?.name}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium">
                      {formatCurrency(record.total_amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          record.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : record.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link
                        href={`/projects/${record.project_id}/cost-control/record/${record.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 text-xs"
                        >
                          <Eye size={14} />
                          Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
