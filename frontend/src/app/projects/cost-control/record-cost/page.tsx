"use client";

import { Layout } from "@/layouts/Layout";
import Typography from "@/components/Typography";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Save, Plus } from "lucide-react";
import {
  useForm,
  useFieldArray,
  FormProvider,
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
} from "react-hook-form";
import { Input } from "@/components/shared/form/input";
import InputSelect from "@/components/shared/form/input-select";
import InputCombobox from "@/components/shared/form/input-combobox";
import { CurrencyInput } from "@/components/shared/form/currency-input";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatCurrency";
import BackButton from "@/components/ui/back-button";
import { useGetVendors, useCreateVendor } from "@/hooks/useVendor";
import {
  useCreateCostDescription,
  useCreateCostOut,
  useGetCostDescriptions,
} from "@/hooks/useCostOut";
import { useGetWBSLeaf } from "@/hooks/useWBS";
import { useCBSProjectSelections } from "@/hooks/useCBS";
import { ConfirmDialog } from "@/components/shared/form/confirm-dialog";
import { useProjects } from "@/hooks/useProjects";
import { useEffect } from "react";

type FormValues = {
  project_id: string;
  wbs_id: string;
  activity_name: string;
  date: string;
  vendor: string;
  nota_file: FileList | null;
  items: {
    description: string;
    cbs_category: string;
    unit_cost: number;
    quantity: number;
    total: number;
  }[];
};

export default function GlobalRecordCostPage() {
  const router = useRouter();

  // Project list for selector
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects();
  const projectOptions = (projectsData?.data ?? []).map((p) => ({
    label: p.name,
    value: p.id,
  }));

  const { data: vendors, isLoading: isLoadingVendors } = useGetVendors();
  const {
    data: costItemDescriptionAPI,
    isLoading: isLoadingCostItemDescription,
  } = useGetCostDescriptions();

  const { mutateAsync: createVendor } = useCreateVendor();
  const { mutateAsync: createCostItemDescription } = useCreateCostDescription();
  const { mutateAsync: createCostOut, isPending: isSubmitting } =
    useCreateCostOut();

  const vendorOptions = vendors ?? [];

  const costItemDescriptionOptions =
    costItemDescriptionAPI?.map((item) => ({
      label: item.description,
      value: item.description,
    })) ?? [];

  const methods = useForm<FormValues>({
    defaultValues: {
      project_id: "",
      date: new Date().toISOString().split("T")[0],
      items: [],
      vendor: "",
      nota_file: null,
    },
    mode: "onChange",
  });

  const { control, handleSubmit, watch, setValue } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch selected project to reactively fetch WBS & CBS
  const selectedProjectId = watch("project_id");

  // Fetch WBS options — useGetWBSLeaf already has `enabled: !!projectId`
  const { data: leafWBSAPI, isLoading: isLoadingLeafWBS } =
    useGetWBSLeaf(selectedProjectId);

  // Fetch CBS options — guard with enabled here since useCBSProjectSelections has no built-in guard
  const { data: cbsProjectData, isLoading: isLoadingCBSProject } =
    useCBSProjectSelections(selectedProjectId);

  // Reset wbs_id whenever project changes
  useEffect(() => {
    setValue("wbs_id", "");
  }, [selectedProjectId, setValue]);

  const leafWBS = leafWBSAPI ?? [];
  const wbsOptions = leafWBS.map((item) => ({
    label: `${item.wbs_id} - ${item.description}`,
    value: item.id,
  }));

  const cbsOptions = (cbsProjectData?.data || []).map((cbs) => ({
    label: `${cbs.name} (${cbs.type})`,
    value: `${cbs.id}`,
  }));

  const items = watch("items");
  const totalCost = (items || []).reduce((acc, item) => {
    const cost = Number(item.unit_cost) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + cost * qty;
  }, 0);

  const handleAddItem = () => {
    append({
      description: "",
      cbs_category: "",
      unit_cost: 0,
      quantity: 1,
      total: 0,
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.project_id) {
      toast.error("Please select a project");
      return;
    }

    if (data.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (!data.nota_file || data.nota_file.length === 0) {
      toast.error("Please upload a nota file");
      return;
    }

    const formData = new FormData();
    formData.append("nota", data.nota_file[0]);
    formData.append("wbs_item_id", data.wbs_id);
    formData.append("vendor_id", data.vendor);
    formData.append("activity_name", data.activity_name);
    formData.append("transaction_date", data.date);
    formData.append("total_amount", String(totalCost));

    const mappedItems = data.items.map((item) => ({
      description: item.description,
      cbs_category_id: item.cbs_category,
      unit_cost: Number(item.unit_cost),
      quantity: Number(item.quantity),
      total: Number(item.unit_cost) * Number(item.quantity),
    }));

    formData.append("items", JSON.stringify(mappedItems));

    try {
      await createCostOut({ projectId: data.project_id, data: formData });
      toast.success("Cost Request Submitted for Approval!");
      // Redirect back to global cost control
      router.push("/projects/cost-control");
    } catch (error) {
      toast.error("Failed to submit cost request, " + error);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <BackButton />
        <div className="mb-8 flex items-center gap-4">
          <div className="space-y-2">
            <Typography variant="title" weight="bold">
              Request Cost Out
            </Typography>
            <Typography variant="body" className="text-muted-foreground">
              Ajukan Pengeluaran Baru — Pilih Proyek Terlebih Dahulu
            </Typography>
          </div>
        </div>

        <div className="space-y-6">
          <FormProvider {...methods}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* Header Info */}
              <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
                <Typography variant="title" weight="semibold">
                  Information
                </Typography>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Project Selector — full width, first field */}
                  <div className="md:col-span-2">
                    <InputSelect
                      name="project_id"
                      label="Project"
                      placeholder="Select Project"
                      options={projectOptions}
                      validation={{ required: "Project is required" }}
                      className="w-full bg-white!"
                      disabled={isLoadingProjects}
                    />
                  </div>

                  <InputCombobox
                    name="wbs_id"
                    label="WBS Item"
                    placeholder={
                      selectedProjectId
                        ? "Pick or Search WBS Item"
                        : "Select a project first"
                    }
                    options={wbsOptions}
                    validation={{ required: "WBS Item is required" }}
                    className="w-full"
                    allowCustomValue={false}
                    disabled={!selectedProjectId || isLoadingLeafWBS}
                  />
                  <Input
                    name="activity_name"
                    label="Activity Name"
                    placeholder="e.g: Pembelian Material X"
                    validation={{ required: "Nama Kegiatan is required" }}
                  />
                  <InputCombobox
                    name="vendor"
                    label="Vendor / Supplier"
                    placeholder="Select or Type Vendor"
                    options={vendorOptions}
                    allowCustomValue
                    onCreateCustomValue={async (val) => {
                      try {
                        const newVendor = await createVendor({ name: val });
                        toast.success("Vendor created successfully!");
                        return newVendor;
                      } catch (error) {
                        toast.error("Failed to create vendor");
                        throw error;
                      }
                    }}
                    helperText="*Jika tidak ada di list, ketik dan klik 'Create' untuk membuat baru."
                    validation={{ required: "Vendor is required" }}
                    className="w-full"
                    disabled={isLoadingVendors}
                  />
                  <Input
                    name="date"
                    label="Transaction Date"
                    type="date"
                    validation={{ required: "Date is required" }}
                  />
                  <div className="md:col-span-2">
                    <Controller
                      name="nota_file"
                      control={control}
                      rules={{ required: "Nota is required" }}
                      render={({
                        // eslint-disable-next-line unused-imports/no-unused-vars
                        field: { onChange, value, ...field },
                        fieldState: { error },
                      }: {
                        field: ControllerRenderProps<FormValues, "nota_file">;
                        fieldState: ControllerFieldState;
                      }) => (
                        <div className="w-fit space-y-1.5">
                          <label className="text-sm font-bold text-gray-700">
                            Upload Nota
                          </label>
                          <input
                            {...field}
                            type="file"
                            className="border-input bg-background placeholder:text-muted-foreground flex h-10 w-fit cursor-pointer rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                          {error && (
                            <p className="text-sm text-red-500">
                              {error.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* Items Section */}
              <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <Typography variant="title" weight="semibold">
                    Cost Items
                  </Typography>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    variant="outline"
                    className="gap-2"
                    disabled={!selectedProjectId}
                  >
                    <Plus size={16} /> Add New Item
                  </Button>
                </div>

                {/* List of Items */}
                <div className="mt-4 space-y-4">
                  {fields.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-gray-50/50 py-12 text-center">
                      <Typography
                        variant="label"
                        className="text-muted-foreground italic"
                      >
                        {selectedProjectId
                          ? `Belum ada item yang ditambahkan. Mulai isi dengan klik "Add New Item".`
                          : "Pilih proyek terlebih dahulu sebelum menambahkan item."}
                      </Typography>
                    </div>
                  ) : (
                    fields.map((field, index) => {
                      const itemCost = watch(`items.${index}.unit_cost`) || 0;
                      const itemQty = watch(`items.${index}.quantity`) || 0;
                      const itemTotal = Number(itemCost) * Number(itemQty);

                      return (
                        <div
                          key={field.id}
                          className="relative grid grid-cols-1 items-start gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-12"
                        >
                          <div className="md:col-span-12 lg:col-span-4">
                            <InputCombobox
                              name={`items.${index}.description`}
                              label="Description"
                              placeholder="Search or type new..."
                              options={costItemDescriptionOptions}
                              allowCustomValue
                              onCreateCustomValue={async (val) => {
                                try {
                                  const newDescription =
                                    await createCostItemDescription(val);
                                  toast.success(
                                    "Cost item description create successfully!"
                                  );
                                  return newDescription;
                                } catch (error) {
                                  toast.error("Failed to create description");
                                  throw error;
                                }
                              }}
                              validation={{
                                required: "Description is required",
                              }}
                              helperText="*Jika tidak ada di list, ketik dan klik 'Create' untuk membuat baru."
                              disabled={isLoadingCostItemDescription}
                            />
                          </div>

                          <div className="md:col-span-6 lg:col-span-3">
                            <InputSelect
                              name={`items.${index}.cbs_category`}
                              label="CBS Category"
                              placeholder={
                                selectedProjectId
                                  ? "Select CBS"
                                  : "Select project first"
                              }
                              options={cbsOptions}
                              validation={{
                                required: "Category is required",
                              }}
                              className="w-full bg-white!"
                              disabled={!selectedProjectId || isLoadingCBSProject}
                            />
                          </div>

                          <div className="md:col-span-3 lg:col-span-2">
                            <CurrencyInput
                              name={`items.${index}.unit_cost`}
                              label="Unit Cost"
                              placeholder="0"
                              validation={{ required: "Required", min: 1 }}
                            />
                          </div>
                          <div className="md:col-span-3 lg:col-span-1">
                            <Input
                              name={`items.${index}.quantity`}
                              label="Qty"
                              type="number"
                              placeholder="1"
                              validation={{ required: "Required", min: 1 }}
                            />
                          </div>

                          {/* Action & Total */}
                          <div className="flex items-end justify-between gap-4 md:col-span-12 lg:col-span-2 lg:justify-end">
                            <div className="mb-2 lg:text-right">
                              <Typography
                                weight="bold"
                                className="text-primary text-lg"
                              >
                                {formatCurrency(itemTotal)}
                              </Typography>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mb-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => remove(index)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Total Footer */}
                <div className="-mx-6 mt-6 -mb-6 flex items-center justify-between rounded-b-lg border-t bg-gray-50 px-6 py-4">
                  <div>
                    <Typography
                      variant="label"
                      weight="bold"
                      className="tracking-wide text-gray-900 uppercase"
                    >
                      Total Cost
                    </Typography>
                    <Typography
                      variant="body"
                      weight="bold"
                      className="text-primary text-xl"
                    >
                      {formatCurrency(totalCost)}
                    </Typography>
                  </div>

                  <ConfirmDialog
                    leftIcon={Save}
                    placeholder={`${isSubmitting ? "Submitting..." : "Submit Request"}`}
                    title="Submit Request"
                    description="Pastikan data yang anda masukkan sudah sesuai."
                    onConfirm={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  />
                </div>
              </section>
            </form>
          </FormProvider>
        </div>
      </div>
    </Layout>
  );
}
