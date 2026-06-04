"use client";

import { Layout } from "@/layouts/Layout";
import { useState } from "react";
import BackButton from "@/components/ui/back-button";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { CreateNewProjectFormValues } from "./type";
import { Input } from "@/components/shared/form/input";
import InputSelect from "@/components/shared/form/input-select";
import { Button } from "@/components/ui/button";
import Typography from "@/components/Typography";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CalendarCheck, Plus, Trash2 } from "lucide-react";
import { STATUS_OPTIONS } from "@/constants/project";
import IconButton from "@/components/ui/icon-button";

import { formatCurrency } from "@/utils/formatCurrency";
import { useCreateProject } from "@/hooks/useProjects";
import HelperText from "@/components/ui/helper-text";
import { formatNumber } from "@/utils/formatNumber";
import {
  CurrencyInput,
  parseNumber,
} from "@/components/shared/form/currency-input";
import { cn } from "@/lib/cn";
import { Switch } from "@/components/ui/switch";

export default function NewProject() {
  const router = useRouter();
  const [isTerminByProgress, setIsTerminByProgress] = useState(false);
  const [terminPercentage, setTerminPercentage] = useState(0);
  const [terminNominal, setTerminNominal] = useState("");
  const [terminDescription, setTerminDescription] = useState("");

  const { mutate } = useCreateProject();

  const methods = useForm<CreateNewProjectFormValues>({
    mode: "onBlur",
    defaultValues: {
      project_name: "",
      location: "",
      description: "",
      budget: 0,
      start_date: "",
      end_date: "",
      status: "ongoing",
      termin: [],
    },
  });

  const { control, handleSubmit, register, watch } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "termin",
  });

  const currentBudget = methods.watch("budget") || 0;
  const watchedTermins = watch("termin");
  const totalTerminNominal = (watchedTermins || []).reduce(
    (acc, curr) => acc + (Number(curr.nominal) || 0),
    0
  );
  const remainingBudget = currentBudget - totalTerminNominal;

  function addTermin() {
    if (currentBudget <= 0) {
      toast.error("Please fill in the Project Budget first.");
      return;
    }

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

    // reset input
    setTerminPercentage(0);
    setTerminNominal("");
    setTerminDescription("");
  }

  function onSubmit(data: CreateNewProjectFormValues) {
    if (remainingBudget !== 0) {
      toast.error("Total value termin harus sama dengan budget!");
      return;
    }
    const newProject = {
      name: data.project_name,
      description: data.description,
      location: data.location,
      budget: Number(data.budget),
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status,
      progress: 0,
      cbs_categories: [],
      termin: data.termin,
      category: "termin",
      is_termin_by_progress: isTerminByProgress,
    };

    mutate(newProject);
  }

  return (
    <Layout>
      <BackButton />

      {/* Header */}
      <div className="mb-8">
        <Typography variant="title" weight="bold">
          Create New Project
        </Typography>
        <Typography variant="body" className="text-muted-foreground">
          Buat Project Baru
        </Typography>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Project Information */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 border-b pb-2 text-lg font-semibold">
              Project Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                name="project_name"
                label="Project Name"
                placeholder="e.g. Office Renovation"
                validation={{ required: "Project name is required" }}
              />

              <Input
                name="location"
                label="Location"
                placeholder="e.g. Surabaya"
                validation={{ required: "Location is required" }}
              />
            </div>

            <div className="mt-6">
              <Input
                name="description"
                label="Description"
                placeholder="Brief project description..."
                className="w-full"
              />
            </div>
          </section>

          {/* Budget, Dates & Status */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 border-b pb-2 text-lg font-semibold">
              Project Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <CurrencyInput
                name="budget"
                label="Budget"
                placeholder="e.g. 100000000"
                validation={{
                  required: "Budget is required",
                  min: { value: 0, message: "Budget must be positive" },
                }}
              />

              <Input
                name="start_date"
                label="Start Date"
                type="date"
                validation={{ required: "Start date is required" }}
              />

              <Input
                name="end_date"
                label="End Date"
                type="date"
                validation={{
                  required: "End date is required",
                  validate: (value) => {
                    const startDate = methods.getValues("start_date");
                    if (startDate && value < startDate) {
                      return "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";
                    }
                    return true;
                  },
                }}
              />

              <InputSelect
                name="status"
                label="Status"
                options={STATUS_OPTIONS}
                placeholder="Select Status"
                validation={{ required: "Status is required" }}
              />
            </div>
          </section>

          {/* Timeline / Termin Information */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center justify-between border-b pb-2 text-lg font-semibold">
              <span>Timeline Information</span>
              {currentBudget > 0 && (
                <span
                  className={`text-sm ${
                    remainingBudget < 0 ? "text-red-500" : "text-green-600"
                  }`}
                >
                  Remaining: {formatCurrency(remainingBudget)}
                </span>
              )}
            </h2>

            {/* Toggle Termin Settings */}
            <div
              className={cn(
                "mb-5 flex flex-row items-center justify-between gap-3 rounded-xl border p-4 transition-all duration-200",
                isTerminByProgress
                  ? "bg-light-gray/10 border-light-gray/30 shadow-sm"
                  : "border-slate-200 bg-slate-50/50"
              )}
            >
              <div className="flex min-w-0 flex-1 items-center space-x-3">
                <div
                  className={cn(
                    "shrink-0 rounded-full p-2",
                    isTerminByProgress
                      ? "bg-dark-gray text-white"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-dark-gray font-semibold">
                    Termin by {isTerminByProgress ? "Progress" : "Task"}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {isTerminByProgress
                      ? "Termin proyek berjalan berdasarkan akumulasi persentase pekerjaan yang sudah dilakukan"
                      : "Termin proyek berjalan berdasarkan volume pekerjaan yang sudah dilakukan / direncakan pada tahap termin planning"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center">
                <Switch
                  checked={isTerminByProgress}
                  onCheckedChange={setIsTerminByProgress}
                />
              </div>
            </div>

            {/* Termin Field */}
            <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-4 lg:grid-cols-12">
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
                  Progress (%){" "}
                  <span className="text-xs text-gray-500">
                    {!isTerminByProgress ? "Opsional" : ""}
                  </span>
                </Typography>
                <input
                  type="number"
                  value={formatNumber(terminPercentage)}
                  onChange={(e) => {
                    const val = parseNumber(e.target.value);
                    if (val > 100 || val < 0) {
                      toast.error(
                        "Please input valid percentage range (0-100)!"
                      );
                      return;
                    } else {
                      setTerminPercentage(val === 0 ? 0 : val);
                    }
                  }}
                  className="h-9 w-full rounded-md border px-3 py-1 text-sm tracking-wide"
                  placeholder="e.g. 20%"
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
                  className="h-9 w-full rounded-md border px-3 py-1 text-sm tracking-wide"
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
                  className="h-9 w-full rounded-md border px-3 py-1 text-sm"
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

              <div className="col-span-2 -mt-2 space-y-1.5 md:col-span-4 lg:col-span-12">
                <HelperText>
                  *Klik tombol Add untuk memasukkan informasi termin ke dalam
                  daftar
                </HelperText>

                {currentBudget <= 0 && (
                  <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Silakan isi field budget di atas terlebih dahulu untuk
                    melihat perhitungan sisa budget.
                  </div>
                )}
              </div>
            </div>

            {fields.length > 0 && (
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
                        <Typography
                          weight="bold"
                          className="text-primary text-sm"
                        >
                          Termin {field.sequence}
                        </Typography>
                      </div>

                      <div className="col-span-1 md:col-span-1">
                        <label className="text-muted-foreground mb-1.5 block text-xs">
                          Progress (%)
                        </label>
                        <Input
                          type="number"
                          name={`termin.${index}.percentage` as const}
                          onChange={(e) => {
                            const val = parseNumber(e.target.value);
                            if (val > 100 || val < 0) {
                              toast.error(
                                "Please input valid percentage range (0-100)!"
                              );
                              return;
                            }
                          }}
                          placeholder="0"
                          className="w-full bg-white"
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
            )}
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-8"
            >
              Cancel
            </Button>
            <Button type="submit" className="px-8">
              Create Project
            </Button>
          </div>
        </form>
      </FormProvider>
    </Layout>
  );
}
