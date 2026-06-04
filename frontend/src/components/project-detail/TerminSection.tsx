"use client";

import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import IconButton from "@/components/ui/icon-button";
import {
  CurrencyInput,
  formatNumber,
  parseNumber,
} from "@/components/shared/form/currency-input";
import { useState } from "react";
import { toast } from "sonner";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Project } from "@/types/project";

interface TerminSectionProps {
  isEditing: boolean;
  currentBudget: number;
}

export default function TerminSection({
  isEditing,
  currentBudget,
}: TerminSectionProps) {
  const { register, control, watch } = useFormContext<Project>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "termin",
  });

  const [terminPercentage, setTerminPercentage] = useState(0);
  const [terminNominal, setTerminNominal] = useState("");
  const [terminDescription, setTerminDescription] = useState("");

  const watchedTermins = watch("termin");
  const totalTerminNominal = (watchedTermins || []).reduce(
    (acc, curr) => acc + (Number(curr.nominal) || 0),
    0
  );
  const remainingBudget = currentBudget - totalTerminNominal;

  function addTermin() {
    if (!terminDescription || !terminNominal) {
      toast.error("Please fill Percentage, Description and Nominal");
      return;
    }

    const nominalValue = Number(terminNominal);
    if (isNaN(nominalValue) || nominalValue <= 0) {
      toast.error("Nominal must be a valid positive number");
      return;
    }

    const nextSequence = (fields.length + 1).toString();

    append({
      sequence: nextSequence,
      percentage: terminPercentage,
      description: terminDescription,
      nominal: nominalValue,
    });

    setTerminPercentage(0);
    setTerminNominal("");
    setTerminDescription("");
  }

  return (
    <section className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Typography variant="title" weight="semibold">
            Termin Information
          </Typography>
          <Typography variant="label" className="text-muted-foreground">
            Informasi Jadwal Termin Project
          </Typography>
        </div>
        {isEditing && (
          <div className="text-right">
            <Typography variant="label" className="text-muted-foreground block">
              Remaining Budget
            </Typography>
            <Typography
              variant="body"
              weight="bold"
              className={
                remainingBudget < 0 ? "text-red-500" : "text-green-600"
              }
            >
              {formatCurrency(remainingBudget)}
            </Typography>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mb-6 grid grid-cols-2 items-end gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-1 lg:col-span-1">
            <Typography variant="label" className="mb-2 block">
              Termin
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
              className="h-9 w-full rounded-md border bg-white px-3 py-1 text-sm tracking-wide"
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
              placeholder="e.g. Down Payment"
            />
          </div>
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Button
              type="button"
              onClick={addTermin}
              variant="outline"
              className="border-primary text-primary flex h-9 w-full gap-2"
            >
              <Plus size={16} /> Add
            </Button>
          </div>

          <div className="col-span-2 -mt-2 md:col-span-4 lg:col-span-12">
            <Typography
              variant="label"
              className="text-xs text-slate-500 italic"
            >
              *Klik tombol Add untuk memasukkan informasi termin ke dalam daftar
            </Typography>
          </div>
        </div>
      )}

      {/* List of Termins */}
      {fields && fields.length > 0 ? (
        isEditing ? (
          <div className="mt-8 space-y-4">
            <Typography weight="semibold" variant="label">
              Added Termins:
            </Typography>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid grid-cols-2 items-center gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-12"
                >
                  <div className="col-span-1 md:col-span-1">
                    <Typography weight="bold" className="text-primary text-sm">
                      Termin {field.sequence}
                    </Typography>
                  </div>

                  <div className="col-span-1 md:col-span-1">
                    <label className="text-muted-foreground mb-1.5 block text-xs">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      {...register(`termin.${index}.percentage` as const, {
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
                      name={`termin.${index}.nominal` as const}
                      placeholder="0"
                      className="w-full bg-white"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-5">
                    <label className="text-muted-foreground mb-1.5 block text-xs">
                      Description
                    </label>
                    <input
                      type="text"
                      {...register(`termin.${index}.description` as const)}
                      className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. Down Payment"
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
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="relative rounded-md border bg-gray-50/50 p-4"
              >
                <div className="mb-1 flex items-start justify-between">
                  <Typography weight="bold" className="text-primary">
                    Termin {field.sequence} - {field.percentage ?? "N.A%"}%
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
            ))}
          </div>
        )
      ) : (
        <div className="rounded-lg border border-dashed bg-red-50 py-8 text-center">
          <Typography variant="label" className="text-muted-foreground italic">
            Informasi termin belum ditambahkan di proyek ini.
          </Typography>
        </div>
      )}
    </section>
  );
}
