"use client";

import { lazy, Suspense } from "react";

import Typography from "@/components/Typography";
import { Button } from "@/components/ui/button";

import { Layout } from "@/layouts/Layout";

import CBSFormDialog, { CBSFormValues } from "@/components/cbs/CBSFormDialog";
import { useState } from "react";
import Loading from "@/components/Loading";
import { toast } from "sonner";
import BackButton from "@/components/ui/back-button";
import { Plus } from "lucide-react";
import { useCBSMasterData, useCreateCBS } from "@/hooks/useCBS";
import { EmptyState } from "@/components/EmptyState";

const CBSTable = lazy(() => import("@/components/cbs/CBS-Table"));

function CostBreakdownPageContainer() {
  const [isOpen, setIsOpen] = useState(false);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CBSFormValues>>({});

  const { data, isLoading } = useCBSMasterData();
  const { mutate } = useCreateCBS();

  if (isLoading) {
    return <Loading />;
  }
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <BackButton />
          <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col">
              <Typography variant="title" weight="semibold">
                Manage CBS Categories
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Tambah dan kelola kategori CBS yang tersedia untuk semua proyek
              </Typography>
            </div>
          </div>
          <EmptyState
            title="Data Kategori CBS Tidak Ditemukan."
            description="Silahkan membuat kategori CBS baru."
            icon={Plus}
            action={
              <Button onClick={() => setIsOpen(true)}>Add New Category</Button>
            }
          />
        </div>
        <CBSFormDialog
          isOpen={isOpen}
          onOpenChange={handleOpenDialog}
          onSubmit={handleSubmitCategory}
          defaultValues={formData}
          title={
            editIndex !== null
              ? "Edit Cost Category"
              : "Input New Cost Category"
          }
          submitLabel={editIndex !== null ? "Save Changes" : "+ Add Category"}
        />
      </Layout>
    );
  }

  const cbsData = data?.data;

  function handleOpenDialog(open: boolean) {
    if (!open) {
      setEditIndex(null);
      setFormData({});
    }
    setIsOpen(open);
  }

  function handleEdit(index: number) {
    const item = cbsData[index];
    setEditIndex(index);
    setFormData({
      category_name: item.name,
      category_type: item.type as "Per Item" | "Borongan",
    });
    setIsOpen(true);
  }

  function handleSubmitCategory(data: CBSFormValues) {
    const categoryData = {
      name: data.category_name,
      cost_type: data.category_type,
    };

    if (editIndex !== null) {
      // const existing = cbsData[editIndex];
      // updateCategory(editIndex, {
      //   ...categoryData,
      //   selected: existing.selected,
      // });
      toast.success("Kategori CBS berhasil diperbarui!");
    } else {
      // Add Mode
      mutate(categoryData);
    }

    handleOpenDialog(false);
  }

  return (
    <Layout>
      <div className="space-y-6">
        <BackButton />

        {/* Header */}
        <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col">
            <Typography variant="title" weight="semibold">
              Manage CBS Categories
            </Typography>

            <Typography variant="body" className="text-muted-foreground">
              Tambah dan kelola kategori CBS yang tersedia untuk semua proyek
            </Typography>
          </div>

          <Button leftIcon={Plus} onClick={() => setIsOpen(true)}>
            Add New Category
          </Button>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Typography variant="label" className="text-blue-800">
            NOTE: Kategori CBS yang dibuat di sini akan tersedia untuk dipilih
            di setiap proyek. Buka halaman detail proyek untuk memilih CBS yang
            akan digunakan.
          </Typography>
        </div>

        {/* Table */}
        <CBSTable data={cbsData} onEdit={handleEdit} />
      </div>

      <CBSFormDialog
        isOpen={isOpen}
        onOpenChange={handleOpenDialog}
        onSubmit={handleSubmitCategory}
        defaultValues={formData}
        title={
          editIndex !== null ? "Edit Cost Category" : "Input New Cost Category"
        }
        submitLabel={editIndex !== null ? "Save Changes" : "+ Add Category"}
      />
    </Layout>
  );
}

function CostBreakdownPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CostBreakdownPageContainer />
    </Suspense>
  );
}
export default CostBreakdownPage;
