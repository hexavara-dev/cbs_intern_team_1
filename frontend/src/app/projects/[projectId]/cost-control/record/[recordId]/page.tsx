"use client";

import { Layout } from "@/layouts/Layout";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Layers,
  Printer,
  Receipt,
  Banknote,
  Info,
  User,
  UserCheck,
  Check,
  X,
  MessageCircleX,
  Timer,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import Typography from "@/components/Typography";
import BackButton from "@/components/ui/back-button";
import { formatDate } from "date-fns";
import { useGetCostOutById } from "@/hooks/useCostOut";
import Loading from "@/components/Loading";
import { cn } from "@/lib/cn";
import { CostActionDialog } from "@/components/cost-control/CostActionDialog";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";

export default function CostRecordDetailPage() {
  const { projectId, recordId } = useParams() as {
    projectId: string;
    recordId: string;
  };

  const {
    data: record,
    isLoading,
    refetch,
  } = useGetCostOutById(projectId, recordId);
  const approvedFileSrc = record?.approved_file?.replace(/^bukti\//, "");
  const notaProofSrc = record?.nota_proof?.replace(/^nota\//, "");
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "process" | null
  >(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (isLoading) {
    return <Loading />;
  }

  if (!record) {
    return (
      <Layout>
        <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed bg-white p-8 text-center shadow-sm">
          <div className="space-y-1">
            <Typography variant="body" className="text-muted-foreground italic">
              History Cost tidak ditemukan.
            </Typography>
          </div>
          <BackButton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <BackButton />
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Typography variant="title" weight="bold">
                Cost Out Detail
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Reviewing record for WBS Item {record.wbs_item.wbs_code}
              </Typography>
            </div>
          </div>

          <div className="flex gap-5">
            {approvedFileSrc && record.status === "approved" && (
              <Button
                variant="outline"
                onClick={() => setPreviewImage(approvedFileSrc)}
              >
                <Banknote />
                Show Bukti TF
              </Button>
            )}

            {notaProofSrc && (
              <Button
                variant="outline"
                onClick={() => setPreviewImage(notaProofSrc)}
              >
                <Receipt />
                Show Nota
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => window.print()}
              className="w-fit"
            >
              <Printer size={16} className="mr-2" />
              Print Receipt
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b bg-gray-50/50 p-6">
                <Typography weight="bold">Cost Information</Typography>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider uppercase">
                        Description
                      </th>
                      <th className="px-6 py-4 font-semibold tracking-wider uppercase">
                        CBS Category
                      </th>
                      <th className="px-6 py-4 text-right font-semibold tracking-wider uppercase">
                        Unit Cost
                      </th>
                      <th className="px-6 py-4 text-center font-semibold tracking-wider uppercase">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-right font-semibold tracking-wider uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-t">
                    {record.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.cbs_category?.name} -{" "}
                          {item.cbs_category?.cost_type}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50/50">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-6 text-right font-bold text-gray-900"
                      >
                        Total Amount
                      </td>
                      <td className="text-primary px-6 py-6 text-right text-lg font-bold">
                        {formatCurrency(record.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Action Buttons for Pending or Onprocess */}
            {(record.status === "pending" || record.status === "onproses") && (
              <div className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <Typography weight="semibold" className="text-gray-800">
                    Menunggu Persetujuan
                  </Typography>
                  <Typography variant="label" className="text-gray-500">
                    Pastikan Anda telah meninjau detail sebelum menyetujui atau
                    menolak.
                  </Typography>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Button
                    leftIcon={X}
                    variant="outline"
                    onClick={() => setActionType("reject")}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-32"
                  >
                    Reject
                  </Button>
                  {record.status !== "onproses" && (
                    <Button
                      leftIcon={Timer}
                      variant="outline"
                      onClick={() => setActionType("process")}
                      className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700 sm:w-32"
                    >
                      Process
                    </Button>
                  )}

                  <Button
                    leftIcon={Check}
                    variant="default"
                    onClick={() => setActionType("approve")}
                    className="w-full bg-green-600 hover:bg-green-700 sm:w-32"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="space-y-6">
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <Typography weight="bold" className="mb-6">
                Transaction Data
              </Typography>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-yellow-50 p-2 text-yellow-500">
                    <Info size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Status
                    </Typography>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
                        record.status === "approved" &&
                          "border-green-200 bg-green-100 text-green-700",
                        record.status === "rejected" &&
                          "border-red-200 bg-red-100 text-red-700",
                        record.status === "pending" &&
                          "border-yellow-200 bg-yellow-100 text-yellow-700",
                        record.status === "onproses" &&
                          "border-gray-200 bg-gray-100 text-gray-700"
                      )}
                    >
                      {record.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {record.status === "rejected" &&
                  record.rejection_reason !== undefined && (
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-red-50 p-2 text-red-500">
                        <MessageCircleX size={18} />
                      </div>
                      <div>
                        <Typography
                          variant="label"
                          className="font-medium text-gray-400"
                        >
                          Reason
                        </Typography>
                        <Typography weight="semibold" className="text-gray-900">
                          {record.rejection_reason}
                        </Typography>
                      </div>
                    </div>
                  )}

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-50 p-2 text-blue-500">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Date
                    </Typography>
                    <Typography weight="semibold" className="text-gray-900">
                      {formatDate(record.transaction_date, "dd MMM yyyy")}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-orange-50 p-2 text-orange-500">
                    <Layers size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      WBS Item
                    </Typography>
                    <Typography weight="semibold" className="text-gray-900">
                      {record.wbs_item.wbs_code}
                    </Typography>
                  </div>
                </div>

                {record.submitted_by && (
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-indigo-50 p-2 text-indigo-500">
                      <User size={18} />
                    </div>
                    <div>
                      <Typography
                        variant="label"
                        className="font-medium text-gray-400"
                      >
                        Submitted By
                      </Typography>
                      <Typography weight="semibold" className="text-gray-900">
                        {record.submitted_by.full_name}
                      </Typography>
                    </div>
                  </div>
                )}

                {record.approved_by && (
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-emerald-50 p-2 text-emerald-500">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <Typography
                        variant="label"
                        className="font-medium text-gray-400"
                      >
                        Approved By
                      </Typography>
                      <Typography weight="semibold" className="text-gray-900">
                        {record.approved_by.full_name}
                      </Typography>
                    </div>
                  </div>
                )}

                {record.approved_at && (
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-teal-50 p-2 text-teal-500">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <Typography
                        variant="label"
                        className="font-medium text-gray-400"
                      >
                        Approved At
                      </Typography>
                      <Typography weight="semibold" className="text-gray-900">
                        {formatDate(record.approved_at, "dd MMM yyyy HH:mm")}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <Typography variant="label" className="text-gray-400">
                ID: {record.id}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <CostActionDialog
        isOpen={!!actionType}
        onOpenChange={(open) => !open && setActionType(null)}
        actionType={actionType}
        recordId={recordId}
        onSuccess={() => refetch()}
      />

      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-4xl overflow-hidden border-none bg-white shadow-none">
          {previewImage && (
            <div className="relative flex max-h-[90vh] w-full items-center justify-center p-4">
              <Image
                src={
                  previewImage.startsWith("http")
                    ? previewImage
                    : `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "")}/${previewImage.replace(/^\/+/, "")}`
                }
                alt="Preview Dokumen"
                width={1200}
                height={1200}
                className="max-h-[85vh] max-w-full rounded-md object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
