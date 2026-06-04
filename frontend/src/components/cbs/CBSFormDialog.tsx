"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import HelperText from "@/components/ui/helper-text";
import { Input } from "@/components/shared/form/input";
import InputSelect from "@/components/shared/form/input-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CBSFormValues = {
  category_name: string;
  category_type: "Per Item" | "Borongan";
};

type CBSFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CBSFormValues) => void;
  defaultValues?: Partial<CBSFormValues>;
  title?: string;
  submitLabel?: string;
};

const COST_TYPE = [
  { label: "Per Item", value: "Per Item" },
  { label: "Borongan", value: "Borongan" },
];

export default function CBSFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  defaultValues,
  title = "Input New Cost Category",
  submitLabel = "+ Add Category",
}: CBSFormDialogProps) {
  const methods = useForm<CBSFormValues>({
    mode: "onBlur",
    defaultValues: {
      category_name: "",
      category_type: "Per Item",
    },
  });

  const { handleSubmit, reset } = methods;

  // Reset form when dialog opens/closes or defaultValues change
  useEffect(() => {
    if (isOpen) {
      reset({
        category_name: defaultValues?.category_name || "",
        category_type: defaultValues?.category_type || "Per Item",
      });
    }
  }, [isOpen, defaultValues, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle >{title}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {title.includes("New")
                  ? "Masukkan kategori cost baru jika tidak tersedia di tabel"
                  : "Perbarui informasi kategori cost"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Category Name */}
              <Input
                name="category_name"
                label="Category Name"
                placeholder="ex: Material"
                validation={{ required: "Category Name is required" }}
              />

              {/* Category Type */}
              <div className="flex flex-col gap-2">
                <InputSelect
                  name="category_type"
                  options={COST_TYPE}
                  label="Category Type"
                  placeholder="Select Category Type"
                  className="w-full"
                  validation={{ required: "Category Type is required" }}
                />

                <div className="space-y-1">
                  <HelperText className="text-muted-foreground text-xs italic">
                    *Per Item: Total price = price × volume
                  </HelperText>
                  <HelperText className="text-muted-foreground text-xs italic">
                    *Borongan: Total price = fixed price
                  </HelperText>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
