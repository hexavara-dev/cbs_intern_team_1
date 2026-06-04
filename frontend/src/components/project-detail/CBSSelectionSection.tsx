"use client";

import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { Edit2, Check, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useCBSMasterData,
  useCBSProjectSelections,
  useCreateCBS,
  useUpdateCBSProjectSelections,
} from "@/hooks/useCBS";
import CBSFormDialog, { CBSFormValues } from "@/components/cbs/CBSFormDialog";
import { Project } from "@/types/project";

interface CBSSelectionSectionProps {
  projectId: string;
  project: Project;
}

export default function CBSSelectionSection({
  projectId,
}: CBSSelectionSectionProps) {
  const { data: cbsMasterDataAPI, isLoading: isLoadingcbsMasterDataAPI } =
    useCBSMasterData();
  const { data: cbsProjectData, isLoading: isLoadingCBSProject } =
    useCBSProjectSelections(projectId);

  const isLoading = isLoadingcbsMasterDataAPI || isLoadingCBSProject;
  const cbsMasterData = cbsMasterDataAPI?.data ?? [];
  const cbsProjectSelections = cbsProjectData?.data;

  // Map Current Project CBS Selection Data
  const selectedCBSProject = cbsMasterData?.map((masterItem) => {
    const isSelected = cbsProjectSelections?.some(
      (selection) => selection.id === masterItem.id
    );

    return {
      ...masterItem,
      selected: isSelected,
    };
  });

  const isSelectedCBSProject =
    (selectedCBSProject ?? []).filter((cbs) => cbs.selected).length > 0;

  const { mutate: createCBS } = useCreateCBS();
  const updateCBSMutation = useUpdateCBSProjectSelections(projectId);

  const [selectedCBSIds, setSelectedCBSIds] = useState<Set<string>>(new Set());
  const [isEditingCBS, setIsEditingCBS] = useState(false);
  const [isAddCBSOpen, setIsAddCBSOpen] = useState(false);

  // Initialize selected CBS IDs from API data
  // Only sync from server when NOT editing to prevent overwriting user's unsaved changes
  useEffect(() => {
    if (cbsProjectData?.data && !isEditingCBS) {
      const selectedIds = new Set<string>(
        cbsProjectData.data.map((cbs) => cbs.id)
      );
      setSelectedCBSIds(selectedIds);
    }
  }, [cbsProjectData, isEditingCBS]);

  // Handle checkbox toggle
  function handleToggleCBS(id: string) {
    setSelectedCBSIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  // Save CBS selection to backend API
  async function handleSaveCBS() {
    const selectedIds = Array.from(selectedCBSIds);
    await updateCBSMutation.mutateAsync(selectedIds);
    setIsEditingCBS(false);
  }

  function handleAddNewCBS(data: CBSFormValues) {
    createCBS(
      {
        name: data.category_name,
        cost_type: data.category_type,
      },
      {
        onSuccess: (response) => {
          // Auto-select the newly created CBS for this project
          if (response?.data?.id) {
            setSelectedCBSIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(response.data.id);
              return newSet;
            });
          }
          setIsAddCBSOpen(false);
        },
      }
    );
  }

  return (
    <>
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Typography variant="title" weight="semibold">
              Cost Breakdown Structure (CBS)
            </Typography>
            <Typography variant="label" className="text-muted-foreground">
              Kategori CBS yang dipakai untuk WBS proyek ini
            </Typography>
          </div>
          {!isEditingCBS ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsEditingCBS(true)}
            >
              <Edit2 size={14} />
              Edit Selection
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddCBSOpen(true)}
            >
              + Tambah CBS Baru
            </Button>
          )}
        </div>

        {!isEditingCBS ? (
          isLoading ? (
            <p className="w-full text-center text-gray-500">Loading...</p>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              {isSelectedCBSProject ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCBSProject!
                    .filter((cbs) => cbs.selected)
                    .map((cbs, index) => (
                      <div
                        key={index}
                        className="bg-secondary/20 inline-flex flex-col rounded-md border px-4 py-2"
                      >
                        <Typography weight="semibold" className="text-sm">
                          {cbs.name}
                        </Typography>
                        <Typography
                          variant="label"
                          className="text-[10px] text-gray-500"
                        >
                          {cbs.type}
                        </Typography>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-red-50 py-8 text-center">
                  <Typography
                    variant="label"
                    className="text-muted-foreground italic"
                  >
                    Belum ada kategori CBS yang dipilih.
                  </Typography>
                  <Button
                    variant="link"
                    className=""
                    onClick={() => setIsEditingCBS(true)}
                  >
                    Mulai Pilih CBS
                  </Button>
                </div>
              )}
            </div>
          )
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {!cbsMasterData || cbsMasterData?.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 py-12 text-center">
                <Typography
                  variant="body"
                  className="text-muted-foreground mb-4"
                >
                  Belum ada kategori CBS yang tersedia.
                </Typography>
                <Button leftIcon={Plus} onClick={() => setIsAddCBSOpen(true)}>
                  Buat Kategori CBS
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedCBSProject?.map((cbs, index) => {
                  const isSelected = selectedCBSIds.has(cbs.id);

                  return (
                    <label
                      key={index}
                      className={cn(
                        "hover:border-primary/50 flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all",
                        isSelected && "border-primary bg-primary/5"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleCBS(cbs.id)}
                        className="text-primary focus:ring-primary h-5 w-5 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <Typography weight="semibold">{cbs.name}</Typography>
                        <Typography
                          variant="label"
                          className="text-muted-foreground"
                        >
                          {cbs.type}
                        </Typography>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <Typography variant="label" className="text-muted-foreground">
                {selectedCBSIds.size} CBS kategori dipilih
              </Typography>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditingCBS(false)}
                  disabled={updateCBSMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="gap-2"
                  onClick={handleSaveCBS}
                  disabled={updateCBSMutation.isPending}
                >
                  {updateCBSMutation.isPending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isEditingCBS && cbsProjectData && selectedCBSProject?.length > 0 && (
          <div className="mt-8 flex justify-end border-t pt-6">
            <Link href={`/projects/${projectId}/wbs`}>
              <Button className="gap-2" size="lg">
                Continue to WBS Planning
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        )}
      </section>

      <CBSFormDialog
        isOpen={isAddCBSOpen}
        onOpenChange={setIsAddCBSOpen}
        onSubmit={handleAddNewCBS}
      />
    </>
  );
}
