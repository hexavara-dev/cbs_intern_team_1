import React from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { TerminInformation } from "@/types/termin";

interface CostInTerminSummaryTableProps {
  data: (TerminInformation & {
    total_received: number;
  })[];
}

export default function CostInTerminSummaryTable({
  data,
}: CostInTerminSummaryTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-md border shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Termin
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Nominal Termin
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Total Diterima
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Selisih
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-muted-foreground px-4 py-12 text-center italic"
                >
                  Tidak ada data termin.
                </td>
              </tr>
            ) : (
              data.map((termin) => {
                const remaining = termin.nominal - termin.total_received;
                const isUnderpaid = remaining > 0;
                const isOverpaid = remaining < 0;
                const isSettled = remaining === 0;

                return (
                  <tr
                    key={termin.id || termin.sequence}
                    className="border-b transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-4 text-center text-sm font-medium">
                      {termin.category === "adendum"
                        ? `Adendum ${termin.sequence}`
                        : `Termin ${termin.sequence}`}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {termin.description}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {formatCurrency(termin.nominal)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {formatCurrency(termin.total_received)}
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      <span
                        className={`${
                          isUnderpaid
                            ? "text-red-500"
                            : isOverpaid
                              ? "text-green-600"
                              : ""
                        }`}
                      >
                        {isUnderpaid && "-"}
                        {isOverpaid && "+"}
                        {formatCurrency(Math.abs(remaining))}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm">
                      {isSettled ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          Belum Lunas
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
