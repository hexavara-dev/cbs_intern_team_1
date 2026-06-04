"use client";

import Loading from "@/components/Loading";
import { Layout } from "@/layouts/Layout";
import { ColumnProps, WBSData } from "@/types/cbs-wbs";
import { lazy, Suspense, useMemo } from "react";
import { buildWBSTree } from "@/utils/buildWBSTree";
import {
  transformWBSFromBackend,
  BackendWBSItem,
} from "@/utils/transformWBSData";
import Link from "next/link";
import { ArrowRight, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineWBSFormData } from "@/components/wbs/InlineWBSRow";
import Typography from "@/components/Typography";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/utils/formatCurrency";
import { SummaryCard } from "@/components/cost-monitoring-report/SummaryCard";
import { Wallet, Activity } from "lucide-react";
import { useCBSProjectSelections } from "@/hooks/useCBS";
import {
  useCreateWBS,
  useGetWBS,
  useUpdateWBS,
  useDeleteWBS,
  useGetTotalRAP,
} from "@/hooks/useWBS";
import { useProject } from "@/hooks/useProjects";
import { useGetCostSummary } from "@/hooks/useCostReport";

const WBSTableInline = lazy(() => import("@/components/wbs/WBSTableInline"));

function ProjectWBSPageContainer() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: selectedCBSAPI, isLoading: isLoadingCBS } =
    useCBSProjectSelections(projectId);
  const { data: wbsDataAPI, isLoading: isLoadingWBS } = useGetWBS(projectId);
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: totalRAPAPI, isLoading: isLoadingTotalRAPAPI } =
    useGetTotalRAP(projectId);
  const { data: costSummary, isLoading: isLoadingCostSummary } =
    useGetCostSummary(projectId);

  const { mutate: createWBS } = useCreateWBS(projectId);
  const { mutate: updateWBS } = useUpdateWBS(projectId);
  const { mutate: deleteWBS } = useDeleteWBS(projectId);

  const selectedCBS = useMemo(
    () => selectedCBSAPI?.data ?? [],
    [selectedCBSAPI]
  );
  const totalRAP = totalRAPAPI ?? 0;

  // Transform backend data to frontend format
  const wbsData = useMemo(() => {
    const rawData = wbsDataAPI?.data ?? [];
    if (rawData.length === 0 || selectedCBS.length === 0) return [];
    return transformWBSFromBackend(
      rawData as unknown as BackendWBSItem[],
      selectedCBS
    );
  }, [wbsDataAPI, selectedCBS]);

  const userCBS: ColumnProps[] = selectedCBS.map((data) => ({
    header: `${data.name} (${data.type})`,
    type: "numeric",
  }));

  const tableData = buildWBSTree(wbsData);

  function handleAddItem(
    type: "kategori" | "pekerjaan" | "subkategori",
    parentId: string | null,
    wbsId: string,
    formData: InlineWBSFormData
  ) {
    const isLeaf = type === "pekerjaan";

    let cbsCategory: Record<string, number> = {};

    if (isLeaf && formData.volume && formData.cbs_cost) {
      cbsCategory = formData.cbs_cost;
    }

    const newRow: Omit<WBSData, "totalCost"> = {
      wbs_id: wbsId,
      wbs_parent_id: parentId ?? "",
      description: formData.description,
      volume: formData.volume ?? 0,
      unit: formData.unit ?? "",
      cbs_category: cbsCategory,
      is_leaf: isLeaf,
      total_cost: formData.total_cost,
    };

    createWBS(newRow);
  }

  function handleCellEdited(
    wbsId: string,
    field: string,
    value: string | number
  ) {
    if (field.startsWith("cbs_category.")) {
      const cbsKey = field.split(".")[1];
      const currentItem = wbsData.find((item) => item.wbs_id === wbsId);
      if (currentItem) {
        const updatedCbsCategory = {
          ...currentItem.cbs_category,
          [cbsKey]: Number(value),
        };
        updateWBS({
          wbs_id: wbsId,
          cbs_category: updatedCbsCategory,
        });
      }
    } else {
      const normalizedField = field === "totalCost" ? "total_cost" : field;

      updateWBS({
        wbs_id: wbsId,
        [normalizedField]: value,
      });
    }
  }

  function handleDelete(wbsId: string) {
    deleteWBS(wbsId);
  }

  if (
    isLoadingCBS ||
    isLoadingWBS ||
    isLoadingProject ||
    isLoadingTotalRAPAPI ||
    isLoadingCostSummary
  ) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="mb-6">
        <Typography variant="title" weight="semibold">
          WBS
        </Typography>

        <Typography variant="body" className="text-muted-foreground">
          Atur WBS Anda Disini
        </Typography>
      </div>

      {/* Content */}
      {selectedCBS.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-red-50 p-8">
          <Typography
            variant="label"
            className="text-muted-foreground mb-4 text-center italic"
          >
            CBS belum dipilih.
            <br />
            Silahkan pilih Kategori CBS terlebih dahulu
          </Typography>
          <Link href={`/projects/${projectId}`}>
            <Button variant="link" size="lg" className="gap-2">
              Pilih CBS
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
              label="Total Budget Proyek"
              value={formatCurrency(project?.budget ?? 0)}
              icon={Wallet}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <SummaryCard
              label="Total Rencana Anggaran Pelaksanaan (RAP)"
              value={formatCurrency(totalRAP)}
              icon={CircleDollarSign}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-500"
            />
            <SummaryCard
              label="Selisih Budget - RAP"
              value={formatCurrency((project?.budget || 0) - totalRAP)}
              icon={Activity}
              iconBgColor={
                (project?.budget || 0) - totalRAP < 0
                  ? "bg-red-50"
                  : "bg-green-50"
              }
              iconColor={
                (project?.budget || 0) - totalRAP < 0
                  ? "text-red-500"
                  : "text-green-500"
              }
              valueClassName={
                (project?.budget || 0) - totalRAP < 0
                  ? "text-red-600"
                  : "text-green-600"
              }
            />
          </div>

          <WBSTableInline
            data={tableData}
            flatData={wbsData}
            cbsColumns={userCBS}
            cbsData={selectedCBS}
            onCellEdited={handleCellEdited}
            onDelete={handleDelete}
            onAddItem={handleAddItem}
            costSummaries={costSummary}
          />
        </div>
      )}
    </Layout>
  );
}

export default function ProjectWBSPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectWBSPageContainer />
    </Suspense>
  );
}
