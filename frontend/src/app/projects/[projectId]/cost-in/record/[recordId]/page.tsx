"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Layers, Printer, Eye, Info, User } from "lucide-react";
import Image from "next/image";
import { formatDate } from "date-fns";

import { Layout } from "@/layouts/Layout";
import Typography from "@/components/Typography";
import BackButton from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatCurrency";
import { useGetCostInRecord } from "@/hooks/useCostIn";
import Loading from "@/components/Loading";

export default function CostInDetailPage() {
  const { projectId, recordId } = useParams() as {
    projectId: string;
    recordId: string;
  };
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: costInRecord, isLoading } = useGetCostInRecord(
    projectId,
    recordId
  );
  const proofImageSrc = costInRecord?.proof_file?.replace(/^receipt\//, "");

  if (isLoading) {
    return <Loading />;
  }

  if (!costInRecord) {
    return <>"No Data"</>;
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
                Cost In Detail
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Detail Informasi Cost In
              </Typography>
            </div>
          </div>

          <div className="flex gap-3">
            {proofImageSrc && (
              <Button
                variant="outline"
                onClick={() => setPreviewImage(proofImageSrc)}
                className="gap-2"
              >
                <Eye size={16} />
                Lihat Bukti Transfer
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
                <Typography weight="bold">Informasi Penerimaan</Typography>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Typography
                        variant="label"
                        className="text-muted-foreground font-medium"
                      >
                        Termin
                      </Typography>
                      <Typography weight="semibold" className="text-gray-900">
                        {costInRecord.termin.category === "adendum"
                          ? "Adendum"
                          : "Termin"}{" "}
                        {costInRecord.termin.sequence} -{" "}
                        {costInRecord.termin.description}
                      </Typography>
                    </div>
                    <div className="space-y-1">
                      <Typography
                        variant="label"
                        className="text-muted-foreground font-medium"
                      >
                        Nominal Diterima
                      </Typography>
                      <Typography
                        variant="title"
                        weight="bold"
                        className="text-primary"
                      >
                        {formatCurrency(costInRecord.amount)}
                      </Typography>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Typography
                      variant="label"
                      className="text-muted-foreground font-medium"
                    >
                      Deskripsi
                    </Typography>
                    <Typography className="text-gray-900">
                      {costInRecord.description}
                    </Typography>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Metadata Sidebar */}
          <div className="space-y-6">
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <Typography weight="bold" className="mb-6">
                Informasi Transaksi
              </Typography>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-50 p-2 text-blue-500">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Tanggal Transaksi
                    </Typography>
                    <Typography weight="semibold" className="text-gray-900">
                      {formatDate(
                        new Date(costInRecord.transaction_date),
                        "dd MMM yyyy"
                      )}
                    </Typography>
                  </div>
                </div>

                {costInRecord.created_by && (
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-indigo-50 p-2 text-indigo-500">
                      <User size={18} />
                    </div>
                    <div>
                      <Typography
                        variant="label"
                        className="font-medium text-gray-400"
                      >
                        Dicatat Oleh
                      </Typography>
                      <Typography weight="semibold" className="text-gray-900">
                        {costInRecord.created_by.full_name}
                      </Typography>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-orange-50 p-2 text-orange-500">
                    <Layers size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Kategori
                    </Typography>
                    <Typography weight="semibold" className="text-gray-900">
                      {costInRecord.termin.category === "termin"
                        ? "Termin"
                        : "Adendum"}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-yellow-50 p-2 text-yellow-500">
                    <Info size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Record ID
                    </Typography>
                    <Typography
                      weight="semibold"
                      className="break-all text-gray-900"
                    >
                      {recordId}
                    </Typography>
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <Typography variant="label" className="text-gray-400">
                Project ID: {projectId}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-4xl overflow-hidden border-none bg-white shadow-none">
          {previewImage && (
            <div className="relative flex max-h-[90vh] w-full items-center justify-center p-4">
              <Image
                src={`${previewImage}`}
                alt="Preview Bukti Transfer"
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
