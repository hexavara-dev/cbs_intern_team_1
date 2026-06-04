import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { CostInRecord } from "@/types/cost";

interface CostInHistoryTableProps {
  data: CostInRecord[];
}

export default function CostInHistoryTable({ data }: CostInHistoryTableProps) {
  const { projectId } = useParams() as { projectId: string };

  return (
    <div className="w-full overflow-hidden rounded-md border shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Tanggal
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Termin
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Nominal
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Aksi
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
                  Belum ada riwayat penerimaan Cost In.
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr
                  key={record.id}
                  className="border-b transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-4 py-4 text-center text-sm">
                    {formatDate(
                      new Date(record.transaction_date),
                      "dd MMM yyyy"
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-sm ">
                    {record.termin.category === "adendum"
                      ? "Adendum"
                      : "Termin"}{" "}
                    {record.termin.sequence}
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    {record.description}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-900">
                    {formatCurrency(record.amount)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Link
                      href={`/projects/${projectId}/cost-in/record/${record.id}`}
                      passHref
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
  );
}
