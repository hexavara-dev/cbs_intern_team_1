"use client";

import React, { useEffect } from "react";
import { formatNumber } from "@/utils/formatNumber";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider } from "react-hook-form";
import InputCombobox from "@/components/shared/form/input-combobox";
import { Input } from "@/components/shared/form/input";
import { TerminTask } from "@/types/termin";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useGetWBSLeaf } from "@/hooks/useWBS";
import { useParams } from "next/navigation";

interface ProgressUpdateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: TerminTask[];
  onSave: ({
    wbs_id,
    termin_id,
    actual_volume,
    description,
    photo,
  }: UpdateProgressFormValues) => void;
}

export type UpdateProgressFormValues = {
  wbs_id: string;
  termin_id: string;
  description: string;
  actual_volume: number | string;
  photo: FileList | null;
};

export const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  isOpen,
  onOpenChange,
  tasks,
  onSave,
}) => {
  const params = useParams();
  const projectId = params.projectId as string;

  const methods = useForm<UpdateProgressFormValues>({
    defaultValues: {
      wbs_id: "",
      description: "",
      actual_volume: "",
      photo: null,
    },
    mode: "onBlur",
  });

  const { data: leafWBSAPI, isLoading: isLoadingLeafWBS } =
    useGetWBSLeaf(projectId);

  const { handleSubmit, watch, reset } = methods;

  const leafWBS = leafWBSAPI ?? [];

  const selectedWbsId = watch("wbs_id");
  const selectedTask = tasks.find((t) => t.wbs_id === selectedWbsId);

  useEffect(() => {
    if (isOpen) {
      reset({ wbs_id: "", termin_id: "", actual_volume: "", photo: null });
    }
  }, [isOpen, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  const wbsOptions = leafWBS.map((item) => ({
    label: `${item.wbs_id} - ${item.description}`,
    value: item.id,
  }));

  const onSubmit = (data: UpdateProgressFormValues) => {
    const volumeNum = parseFloat(data.actual_volume as string);
    const finalVolume = isNaN(volumeNum) ? 0 : volumeNum;

    onSave({
      wbs_id: data.wbs_id,
      termin_id: data.termin_id,
      actual_volume: finalVolume,
      description: data.description,
      photo: data.photo,
    });
  };

  const terminIdStr = String(watch("termin_id"));
  const allocations = selectedTask?.allocations || [];
  const currentAllocation = allocations.find(
    (a) => String(a.termin_id) === terminIdStr
  );

  return (
    <>
      {/* Manual Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => handleOpenChange(false)}
        />
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={false}>
        <DialogContent className="flex max-w-xl flex-col p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">
              Update Progress
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update volume pekerjaan yang sudah diselesaikan beserta bukti
              fotonya.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...methods}>
            <form
              id="progress-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 pt-2"
            >
              {/* WBS Dropdown */}
              <InputCombobox
                name="wbs_id"
                label="WBS Item"
                placeholder="Pick or Search WBS Item"
                options={wbsOptions}
                validation={{ required: "WBS Item is required" }}
                className="w-full"
                allowCustomValue={false}
                disabled={isLoadingLeafWBS}
              />

              {/* Description */}
              <Input
                name="description"
                label="Description"
                placeholder="Ex: Gali Tanah"
                validation={{ required: "Description is required" }}
              />

              {/* Actual Volume */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  {selectedTask && (
                    <span className="text-sm text-gray-500">
                      {currentAllocation && terminIdStr
                        ? `Target Volume ${
                            currentAllocation.termin_category === "termin"
                              ? "Termin"
                              : "Adendum"
                          } ${currentAllocation.termin_sequence}: ${formatNumber(
                            currentAllocation.volume
                          )} ${selectedTask.unit}`
                        : `Total Target Volume: ${formatNumber(
                            selectedTask.planned_volume
                          )} ${selectedTask.unit}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    label="Total Completed Volume"
                    name="actual_volume"
                    type="number"
                    placeholder="Ex: 15.5"
                    validation={{
                      required: "Volume is required",
                      min: 0,
                    }}
                    disabled={!selectedWbsId}
                    helperText="*Note: Input ini akan meng-update total volume yang selesai, bukan menambah."
                    helperTextClassname="text-gray-500"
                  />
                  <div className="mb-2 flex h-10 w-16 items-center justify-center rounded-md border bg-gray-50 text-sm text-gray-500">
                    {selectedTask ? selectedTask.unit : "-"}
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <Input
                name="photo"
                label="Photo"
                type="file"
                accept="image/*"
                validation={{ required: "Bukti Foto is required" }}
                disabled={!selectedWbsId}
              />
            </form>
          </FormProvider>

          <DialogFooter className="mt-8 gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="progress-form">
              Update Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
