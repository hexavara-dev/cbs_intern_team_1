"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/utils/formatNumber";
import { formatDate } from "date-fns";
import { ProgressHistoryRecord } from "@/types/progress";

interface ProgressHistoryTableProps {
  records: ProgressHistoryRecord[];
}

export default function ProgressHistoryTable({
  records,
}: ProgressHistoryTableProps) {
  const headers = [
    "Date",
    "WBS Item",
    "Termin",
    "Description",
    "Completed Volume",
    "Action",
  ];

  return (
    <div className="w-full space-y-4">
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
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="text-muted-foreground px-4 py-12 text-center italic"
                  >
                    Tidak ada riwayat progress.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-4 text-center text-sm">
                      {formatDate(new Date(record.progress_date), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {record.wbs_item.wbs_id} - {record.wbs_item.description}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {record.termin.category === "termin"
                        ? "Termin "
                        : "Adendum "}
                      {record.termin.sequence}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {record.description}
                    </td>
                    <td className="flex items-center justify-center gap-1 px-4 py-6 text-center text-sm">
                      {formatNumber(record.actual_volume)} {record.unit}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Link
                        href={`/projects/${record.project_id}/progress-monitoring/record/${record.id}`}
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
