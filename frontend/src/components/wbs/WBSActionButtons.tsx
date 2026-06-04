"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type WBSActionButtonsProps = {
  showKategori?: boolean;
  showPekerjaan?: boolean;
  showSubkategori?: boolean;
  onAddKategori?: () => void;
  onAddPekerjaan?: () => void;
  onAddSubkategori?: () => void;
  disabled?: boolean;
};

export default function WBSActionButtons({
  showKategori = true,
  showPekerjaan = false,
  showSubkategori = false,
  onAddKategori,
  onAddPekerjaan,
  onAddSubkategori,
  disabled = false,
}: WBSActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      {showKategori && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          onClick={onAddKategori}
          disabled={disabled}
        >
          <Plus size={16} className="mr-1" />
          Tambah Kategori
        </Button>
      )}
      {showPekerjaan && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-green-600 hover:bg-green-50 hover:text-green-700"
          onClick={onAddPekerjaan}
          disabled={disabled}
        >
          <Plus size={16} className="mr-1" />
          Tambah Pekerjaan
        </Button>
      )}
      {showSubkategori && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          onClick={onAddSubkategori}
          disabled={disabled}
        >
          <Plus size={16} className="mr-1" />
          Tambah Subkategori
        </Button>
      )}
    </div>
  );
}
