"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import IconButton from "@/components/ui/icon-button";
import { TerminInformation } from "@/types/termin";
import {
  CurrencyInput,
  formatNumber,
  parseNumber,
} from "@/components/shared/form/currency-input";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "sonner";

interface AdendumSectionProps {
  isEditingProject: boolean;
}

export default function AdendumSection({
  isEditingProject,
}: AdendumSectionProps) {
  const { control, register } = useFormContext<{
    adendum: TerminInformation[];
  }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "adendum",
  });

  const [terminPercentage, setTerminPercentage] = useState(0);
  const [terminNominal, setTerminNominal] = useState("");
  const [terminDescription, setTerminDescription] = useState("");
  const [isAddingAdendum, setIsAddingAdendum] = useState(false);

  function addAdendum() {
    if (!terminDescription || !terminNominal) {
      toast.error("Please fill Description and Nominal");
      return;
    }

    const nominalValue = Number(terminNominal);
    if (isNaN(nominalValue) || nominalValue <= 0) {
      toast.error("Nominal must be a valid positive number");
      return;
    }

    const nextValue = `${fields.length + 1}`;

    append({
      sequence: nextValue,
      percentage: terminPercentage,
      description: terminDescription,
      nominal: nominalValue,
      category: "adendum",
    });

    setTerminPercentage(0);
    setTerminNominal("");
    setTerminDescription("");
  }

  if (!isEditingProject && fields.length === 0) {
    return (
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <Typography variant="title" weight="semibold">
            Adendum Information
          </Typography>
          <Typography variant="label" className="text-muted-foreground">
            Informasi Jadwal Adendum Project
          </Typography>
        </div>
        <div className="rounded-lg border border-dashed bg-gray-50 py-8 text-center">
          <Typography variant="label" className="text-muted-foreground italic">
            Tidak ada adendum pada proyek ini. <br /> Tambahkan adendum jika
            terdapat pekerjaan di luar perencanaan awal proyek.
          </Typography>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Typography variant="title" weight="semibold">
            Adendum Information
          </Typography>
          <Typography variant="label" className="text-muted-foreground">
            Informasi Jadwal Adendum Project
          </Typography>
        </div>
      </div>

      {isEditingProject && fields.length === 0 && !isAddingAdendum && (
        <div className="mb-6 rounded-lg border border-dashed bg-gray-50 py-8 text-center">
          <Typography
            variant="label"
            className="text-muted-foreground mb-2 block italic"
          >
            Tidak ada adendum pada proyek ini.
          </Typography>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddingAdendum(true)}
          >
            <Plus size={16} className="mr-2" /> Add Adendum
          </Button>
        </div>
      )}

      {isEditingProject && (fields.length > 0 || isAddingAdendum) && (
        <div className="mb-6 grid grid-cols-1 items-end gap-6 rounded-lg border bg-gray-50 p-4 md:grid-cols-12">
          <div className="col-span-1 lg:col-span-1">
            <Typography variant="label" className="mb-2 block">
              Adendum
            </Typography>
            <div className="flex h-9 w-full items-center justify-center rounded-md border bg-gray-100 px-3 text-sm font-semibold text-gray-500">
              {fields.length + 1}
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2">
            <Typography variant="label" className="mb-2 block">
              Progress (%)
            </Typography>
            <input
              type="number"
              value={formatNumber(terminPercentage)}
              onChange={(e) => {
                const val = parseNumber(e.target.value);
                if (val > 100 || val < 0) {
                  toast.error("Please input valid percentage range (0-100)!");
                  return;
                } else {
                  setTerminPercentage(val === 0 ? 0 : val);
                }
              }}
              className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm tracking-wide"
              placeholder="e.g. 20"
            />
          </div>
          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <Typography variant="label" className="mb-2 block">
              Nominal (Rp)
            </Typography>
            <input
              type="text"
              value={formatNumber(terminNominal)}
              onChange={(e) => {
                const val = parseNumber(e.target.value);
                setTerminNominal(val === 0 ? "" : val.toString());
              }}
              className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm tracking-wide tabular-nums"
              placeholder="e.g. 50.000.000"
            />
          </div>
          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <Typography variant="label" className="mb-2 block">
              Description
            </Typography>
            <input
              type="text"
              value={terminDescription}
              onChange={(e) => setTerminDescription(e.target.value)}
              className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm"
              placeholder="e.g. Additional features"
            />
          </div>
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Button
              type="button"
              onClick={addAdendum}
              variant="outline"
              className="border-primary text-primary flex h-9 w-full gap-2"
            >
              <Plus size={16} /> Add
            </Button>
          </div>

          <div className="-mt-2 md:col-span-12">
            <Typography
              variant="label"
              className="text-xs text-slate-500 italic"
            >
              *Klik tombol Add untuk memasukkan informasi adendum ke dalam
              daftar
            </Typography>
          </div>
        </div>
      )}

      <div
        className={
          isEditingProject
            ? "space-y-4"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {fields.map((field, index) => {
          if (isEditingProject) {
            return (
              <div
                key={field.id}
                className="relative grid grid-cols-1 items-center gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-12"
              >
                <div className="col-span-1 md:col-span-1">
                  <Typography weight="bold" className="text-primary text-sm">
                    Adendum {field.sequence}
                  </Typography>
                </div>

                <div className="col-span-1 md:col-span-1">
                  <label className="text-muted-foreground mb-1.5 block text-xs">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    {...register(`adendum.${index}.percentage` as const, {
                      onChange: (e) => {
                        const val = parseNumber(e.target.value);
                        if (val > 100 || val < 0) {
                          toast.error(
                            "Please input valid percentage range (0-100)!"
                          );
                          e.target.value = val > 100 ? 100 : 0;
                          return;
                        }
                      },
                    })}
                    placeholder="0"
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 md:col-span-4">
                  <label className="text-muted-foreground mb-1.5 block text-xs">
                    Nominal (Rp)
                  </label>
                  <CurrencyInput
                    name={`adendum.${index}.nominal`}
                    placeholder="0"
                    className="bg-white"
                  />
                </div>

                <div className="col-span-2 md:col-span-5">
                  <label className="text-muted-foreground mb-1.5 block text-xs">
                    Description
                  </label>
                  <input
                    type="text"
                    {...register(`adendum.${index}.description` as const)}
                    className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Additional features"
                  />
                </div>

                <div className="col-span-2 flex justify-end md:col-span-1">
                  <IconButton
                    icon={Trash2}
                    className="bg-transparent text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => remove(index)}
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={field.id}
              className="group hover:border-primary/50 relative rounded-md border bg-gray-50/50 p-4 transition-all"
            >
              <div className="mb-1 flex items-start justify-between">
                <Typography weight="bold" className="text-primary">
                  Adendum {field.sequence} - {field.percentage ?? "N.A%"}
                </Typography>
                <Typography
                  weight="semibold"
                  className="text-sm text-green-700"
                >
                  {formatCurrency(field.nominal)}
                </Typography>
              </div>
              <Typography variant="body">{field.description}</Typography>
            </div>
          );
        })}
      </div>
    </section>
  );
}
