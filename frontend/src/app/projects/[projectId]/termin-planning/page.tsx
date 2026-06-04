"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/layouts/Layout";
import Loading from "@/components/Loading";
import Typography from "@/components/Typography";
import {
  useGetProjectTermin,
  useGetAllTerminAllocations,
  useSaveTerminAllocations,
} from "@/hooks/useTermin";
import { TerminAllocationPayload } from "@/types/termin";
import TerminAllocationTable from "@/components/termin-planning/TerminAllocationTable";
import { SummaryCard } from "@/components/cost-monitoring-report/SummaryCard";
import { CheckCircle2, Clock } from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";

function TerminPlanningPageContainer() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [isEditMode, setIsEditMode] = useState(false);

  const { data: projectTermin, isLoading: isLoadingTermin } =
    useGetProjectTermin(projectId);
  const { data: wbsTerminData, isLoading: isLoadingWbsTermin } =
    useGetAllTerminAllocations(projectId);

  const { mutate: saveAllocations } = useSaveTerminAllocations(projectId);

  const isLoading = isLoadingTermin || isLoadingWbsTermin;

  const termins = useMemo(() => projectTermin ?? [], [projectTermin]);
  const wbsTermin = useMemo(() => wbsTerminData ?? [], [wbsTerminData]);
  const totalVolumes = useMemo(
    () =>
      wbsTermin
        .filter((curr) => curr.is_leaf)
        .reduce((total, curr) => total + (Number(curr.volume) || 0), 0),
    [wbsTermin]
  );

  const totalAllocated = useMemo(() => {
    return wbsTermin
      .filter((curr) => curr.is_leaf)
      .reduce((total, curr) => {
        const allocatedForLeaf = curr.allocations.reduce(
          (sum, alloc) => sum + (Number(alloc.volume) || 0),
          0
        );
        return total + allocatedForLeaf;
      }, 0);
  }, [wbsTermin]);

  const allocatedPercentage =
    totalVolumes > 0 ? (totalAllocated / totalVolumes) * 100 : 0;
  const unallocatedPercentage =
    totalVolumes > 0 ? Math.max(0, 100 - allocatedPercentage) : 0;

  const handleSave = (wbsId: string, terminId: string, volume: number) => {
    const payload: TerminAllocationPayload = {
      wbs_id: wbsId,
      termin_id: terminId,
      volume,
    };
    saveAllocations(payload);
  };

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <div className="mb-6">
        <Typography variant="title" weight="semibold">
          Termin Planning
        </Typography>
        <Typography variant="body" className="text-muted-foreground text-sm">
          Alokasi Volume Pekerjaan ke Setiap Termin
        </Typography>
      </div>

      <div className="space-y-6">
        {/* Summary cards */}
        {wbsTermin.length > 0 && totalVolumes > 0 && (
          <div className="sticky grid grid-cols-1 gap-6 md:grid-cols-2">
            <SummaryCard
              label="Allocated Volume"
              value={`${formatNumber(allocatedPercentage.toFixed(1))}%`}
              icon={CheckCircle2}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <SummaryCard
              label="Unallocated Volume"
              value={`${formatNumber(unallocatedPercentage.toFixed(1))}%`}
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-500"
            />
          </div>
        )}

        {termins.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed py-16 text-center text-gray-400">
            <Typography
              variant="label"
              className="text-muted-foreground italic"
            >
              Informasi termin belum ditambahkan di proyek ini.
            </Typography>
          </div>
        ) : (
          <TerminAllocationTable
            projectTermins={termins}
            wbsTerminData={wbsTermin}
            isEditMode={isEditMode}
            onToggleEditMode={() => setIsEditMode((prev) => !prev)}
            onCellEdited={handleSave}
            totalVolumes={totalVolumes}
          />
        )}
      </div>
    </Layout>
  );
}

export default function TerminPlanningPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TerminPlanningPageContainer />
    </Suspense>
  );
}
