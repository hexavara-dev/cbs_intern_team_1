"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DUMMY_UNIT_OPTIONS } from "@/data/dummy-unit-options";
import { CBSData } from "@/types/cbs-wbs";
import { Check, X, Info } from "lucide-react";
import { useState } from "react";

type InlineWBSRowType = "kategori" | "pekerjaan" | "subkategori";

type InlineWBSRowProps = {
  type: InlineWBSRowType;
  wbsId: string;
  cbsData?: Omit<CBSData, "selected">[];
  onSave: (data: InlineWBSFormData) => void;
  onCancel: () => void;
  indent?: number;
};

export type InlineWBSFormData = {
  description: string;
  volume?: number;
  unit?: string;
  cbs_cost?: Record<string, number>;
  total_cost?: number;
};

export default function InlineWBSRow({
  type,
  wbsId,
  cbsData = [],
  onSave,
  onCancel,
  indent = 0, // Default 0
}: InlineWBSRowProps) {
  const [description, setDescription] = useState("");
  const [volume, setVolume] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState("");
  const [cbsCost, setCbsCost] = useState<Record<string, number>>({});
  const [isGroup, setIsGroup] = useState(false);
  const [groupCount, setGroupCount] = useState<number | undefined>(undefined);
  const [cost, setCost] = useState<number | undefined>(undefined);

  const isPekerjaan = type === "pekerjaan";
  const isKategori = type === "kategori";
  const typeLabel =
    type === "kategori"
      ? "Kategori"
      : type === "pekerjaan"
        ? "Pekerjaan"
        : "Subkategori";

  const handleSave = () => {
    if (!description.trim()) return;

    if (isPekerjaan && (!volume || !unit)) return;

    // Group validation: jumlah dan cost wajib diisi jika group aktif
    if (
      isKategori &&
      isGroup &&
      (!groupCount || groupCount < 1 || !cost || cost < 1)
    )
      return;

    const formData: InlineWBSFormData = {
      description: description.trim(),
    };

    if (isPekerjaan) {
      formData.volume = volume;
      formData.unit = unit;
      formData.cbs_cost = cbsCost;
    }

    if (isKategori && isGroup) {
      formData.unit = "group";
      formData.volume = groupCount;
      formData.total_cost = cost;
    }

    onSave(formData);
  };

  const handleCbsCostChange = (key: string, value: string) => {
    setCbsCost((prev) => ({
      ...prev,
      [key]: Number(value) || 0,
    }));
  };

  return (
    <tr className="border-b bg-blue-50/50">
      {/* WBS ID - auto generated with indentation */}
      <td className="px-3 py-3 text-sm font-medium whitespace-nowrap text-gray-600">
        <div style={{ paddingLeft: indent ? `${indent}px` : "0px" }}>
          {wbsId}
        </div>
      </td>

      {/* Description */}
      <td className="px-4 py-3">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={`Nama ${typeLabel}...`}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      </td>

      {/* Volume - for pekerjaan, or Jumlah for kategori group */}
      <td className="px-4 py-3">
        {isPekerjaan ? (
          <input
            type="number"
            value={volume ?? ""}
            onChange={(e) => setVolume(Number(e.target.value) || undefined)}
            placeholder="Volume"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        ) : isKategori && isGroup ? (
          <input
            type="number"
            min={1}
            value={groupCount ?? ""}
            onChange={(e) => setGroupCount(Number(e.target.value) || undefined)}
            placeholder="Jumlah"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        ) : (
          <span className="block text-center text-gray-400">-</span>
        )}
      </td>

      {/* Satuan - for pekerjaan, or Group toggle for kategori */}
      <td className="px-4 py-3">
        {isPekerjaan ? (
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Pilih</option>
            {DUMMY_UNIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : isKategori ? (
          <div
            className="flex items-center justify-center gap-2"
            title="Aktifkan untuk generate beberapa unit secara otomatis"
          >
            <Switch
              checked={isGroup}
              onCheckedChange={(checked) => {
                setIsGroup(checked);
                if (!checked) setGroupCount(undefined);
              }}
              size="sm"
              className="data-[state=checked]:bg-blue-600"
            />
            <div className="flex items-center gap-1">
              {isGroup ? (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Group
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-500 transition-colors">
                  Group?
                </span>
              )}
              <Info size={14} className="text-gray-400" />
            </div>
          </div>
        ) : (
          <span className="block text-center text-gray-400">-</span>
        )}
      </td>

      {/* CBS Columns - only for pekerjaan */}
      {cbsData.map((cbs) => {
        const key = cbs.name;
        return (
          <td key={key} className="px-4 py-3">
            {isPekerjaan ? (
              <input
                type="number"
                value={cbsCost[key] ?? ""}
                onChange={(e) => handleCbsCostChange(key, e.target.value)}
                placeholder="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            ) : (
              <span className="block text-center text-gray-400">-</span>
            )}
          </td>
        );
      })}

      {/* Cost column */}
      <td className="px-4 py-3">
        {isKategori && isGroup ? (
          <input
            type="number"
            value={cost ?? ""}
            onChange={(e) => setCost(Number(e.target.value) || undefined)}
            placeholder="0"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        ) : (
          <span className="block text-center text-gray-400">-</span>
        )}
      </td>

      {/* Action column */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={handleSave}
          >
            <Check size={16} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={onCancel}
          >
            <X size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
