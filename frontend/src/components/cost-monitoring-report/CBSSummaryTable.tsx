import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import Typography from "../Typography";
import { CostCBSCategorySummary } from "@/types/cost";

interface CBSSummaryTableProps {
  summary: CostCBSCategorySummary[];
}

export const CBSSummaryTable: React.FC<CBSSummaryTableProps> = ({
  summary,
}) => {
  return (
    <div className="overflow-hidden rounded-sm border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-left text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">CBS Category</th>
              <th className="px-4 py-3 text-right font-semibold">Total RAP</th>
              <th className="px-4 py-3 text-right font-semibold">
                Total Expenses
              </th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {summary.length > 0 ? (
              summary.map((data, idx) => {
                const isOver =
                  data.actual_cost > data.planned_cost && data.planned_cost > 0;
                return (
                  <tr key={idx} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">
                        {data.cbs_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.cost_type}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-gray-600">
                      {formatCurrency(data.planned_cost)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-4 text-right font-semibold",
                        isOver ? "text-red-600" : "text-gray-900"
                      )}
                    >
                      {formatCurrency(data.actual_cost)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        {isOver ? (
                          <div className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-bold tracking-wider text-red-600 uppercase">
                            <AlertCircle size={12} />
                            Over
                          </div>
                        ) : data.planned_cost > 0 ? (
                          <div className="flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2 py-1 text-[10px] font-bold tracking-wider text-green-600 uppercase">
                            <CheckCircle2 size={12} />
                            Safe
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="text-gray-300" size={32} />
                    <Typography variant="body" className="text-gray-500">
                      Belum ada kategori CBS yang dikonfigurasi.
                    </Typography>
                    <Typography variant="label" className="text-gray-400">
                      Silakan tentukan budget di WBS atau CBS.
                    </Typography>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
