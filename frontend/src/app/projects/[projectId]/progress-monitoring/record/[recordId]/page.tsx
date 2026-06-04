"use client";

import { Layout } from "@/layouts/Layout";
import { useParams } from "next/navigation";
import {
  Calendar,
  Layers,
  Info,
  Image as ImageIcon,
  ClipboardList,
} from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";
import Typography from "@/components/Typography";
import BackButton from "@/components/ui/back-button";
import { formatDate } from "date-fns";
import Image from "next/image";
import { useGetDetailProgressHistory } from "@/hooks/useProgressMonitoring";
import Loading from "@/components/Loading";

export default function ProgressMonitoringDetailPage() {
  const { projectId, recordId } = useParams() as {
    projectId: string;
    recordId: string;
  };

  const { data: record, isLoading } = useGetDetailProgressHistory(
    projectId,
    recordId
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!record) {
    return (
      <Layout>
        <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed bg-white p-8 text-center shadow-sm">
          <Typography variant="body" className="text-muted-foreground italic">
            Data progress tidak ditemukan.
          </Typography>
          <BackButton />
        </div>
      </Layout>
    );
  }

  const photoUrls = Array.isArray(record.photo_url)
    ? record.photo_url
    : record.photo_url
      ? [record.photo_url]
      : [];

  return (
    <Layout>
      <div className="space-y-8">
        <BackButton />

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Typography variant="title" weight="bold">
                Progress Record WBS Item Detail
              </Typography>
              <div className="text-muted-foreground flex items-center gap-2">
                <Typography variant="body">
                  {record.wbs_item.wbs_id} - {record.wbs_item.description}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description Section */}
            <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b bg-gray-50/50 p-6">
                <ClipboardList size={20} className="text-primary" />
                <Typography weight="bold">Progress Description</Typography>
              </div>
              <div className="p-6">
                <Typography
                  variant="body"
                  className="leading-relaxed text-gray-700"
                >
                  {record.description || "No description provided."}
                </Typography>
              </div>
            </section>

            {/* Photo Evidence Section */}
            <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b bg-gray-50/50 p-6">
                <ImageIcon size={20} className="text-primary" />
                <Typography weight="bold">Photo</Typography>
              </div>
              <div className="p-6">
                {photoUrls.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {photoUrls.map((photoUrl, index) => (
                      <div
                        key={`${photoUrl}-${index}`}
                        className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-50 shadow-inner"
                      >
                        <Image
                          src={`${photoUrl}`}
                          alt={`Progress Evidence ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-48 w-full flex-col items-center justify-center space-y-2 rounded-lg border border-dashed bg-gray-50 text-gray-400">
                    <ImageIcon size={32} />
                    <Typography variant="body">
                      No photo proof attached
                    </Typography>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <Typography weight="bold" className="mb-6">
                Recording Data
              </Typography>

              <div className="space-y-6">
                {/* Date */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-blue-50 p-2 text-blue-500">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Progress Date
                    </Typography>
                    <Typography weight="semibold" className="text-gray-900">
                      {formatDate(
                        new Date(record.progress_date),
                        "dd MMM yyyy"
                      )}
                    </Typography>
                  </div>
                </div>

                {/* WBS */}
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
                      {record.wbs_item.wbs_id}
                    </Typography>
                  </div>
                </div>

                {/* Termin */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-indigo-50 p-2 text-indigo-500">
                    <Info size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Termin
                    </Typography>
                    <Typography weight="semibold" className="text-gray-900">
                      {record.termin.category === "termin"
                        ? "Termin"
                        : "Adendum"}{" "}
                      {record.termin.sequence}
                    </Typography>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-emerald-50 p-2 text-emerald-500">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <Typography
                      variant="label"
                      className="font-medium text-gray-400"
                    >
                      Completed Volume
                    </Typography>
                    <Typography weight="semibold" className="text-lg">
                      {formatNumber(record.actual_volume)} {record.unit}
                    </Typography>
                  </div>
                </div>
              </div>
            </section>

            {/* ID Card */}
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <Typography variant="label" className="text-xs text-gray-400">
                RECORD ID: {record.id.toUpperCase()}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
