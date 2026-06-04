import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Typography from "@/components/Typography";
import { Input } from "@/components/shared/form/input";
import { CurrencyInput } from "@/components/shared/form/currency-input";
import { DialogDescription } from "@radix-ui/react-dialog";

export type CostInFormValues = {
  terminCategory: string;
  date: string;
  nominal: number | null;
  description: string;
  photo: FileList | null;
};

interface CostInFormDialogProps {
  onCreateCostIn: (data: CostInFormValues) => void;
}

export default function CostInFormDialog({
  onCreateCostIn,
}: CostInFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const methods = useForm<CostInFormValues>({
    mode: "onBlur",
    defaultValues: {
      terminCategory: "",
      date: "",
      nominal: null,
      description: "",
      photo: null,
    },
  });

  const { handleSubmit, reset } = methods;

  function onSubmit(data: CostInFormValues) {
    onCreateCostIn(data);

    setIsOpen(false);
    reset();
  }

  return (
    <FormProvider {...methods}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2" leftIcon={Plus}>
            Add Cost In
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add Cost In</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Catat Cost In Proyek per Termin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  name="date"
                  label="Date"
                  placeholder="Pilih Tanggal"
                  type="date"
                  className="w-fit"
                  validation={{ required: "Date is required" }}
                />
              </div>
              <div className="grid gap-2">
                <Input
                  name="description"
                  label="Description"
                  placeholder="Ex: Uang Muka 20%"
                  validation={{ required: "Description is required" }}
                />
              </div>
              <div className="grid gap-2">
                <CurrencyInput
                  name="nominal"
                  label="Nominal (Rp)"
                  placeholder="Ex: 5.000.000"
                  validation={{ required: "Nominal is required" }}
                />
              </div>
              <div className="grid gap-2">
                <Typography variant="label" weight="medium">
                  Bukti Transfer
                </Typography>
                <Input
                  name="photo"
                  type="file"
                  accept="image/*,.pdf"
                  validation={{ required: "Photo is required" }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}

