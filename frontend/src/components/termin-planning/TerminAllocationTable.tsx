"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { WBSData } from "@/types/cbs-wbs";
import { TerminInformation, WBSTerminPlanningItem } from "@/types/termin";
import { formatNumber } from "@/utils/formatNumber";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { toast } from "sonner";
import {
  buildHierarchicalTree,
  filterHierarchicalTree,
  HierarchicalNode,
} from "@/utils/wbsHelpers";
import TableSearchInput from "@/components/shared/TableSearchInput";
import ViewEditModeButton from "@/components/shared/ViewEditModeButton";
import Typography from "@/components/Typography";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TerminAllocationTableProps {
  projectTermins: TerminInformation[];
  wbsTerminData: WBSTerminPlanningItem[];
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onCellEdited: (wbsId: string, terminId: string, volume: number) => void;
  totalVolumes: number;
}

interface FlatAllocation {
  wbs_id: string;
  termin_sequence: string;
  termin_category: string;
  volume: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build label: "Termin 1" | "Adendum 1" based on category */
function getTerminLabel(termin: TerminInformation): string {
  const prefix = termin.category === "adendum" ? "Adendum" : "Termin";
  return `${prefix} ${termin.sequence} ${termin.percentage !== undefined || null ? `- ${termin.percentage}%` : ""}`;
}

/** Status dot color for a leaf row */
function getAllocationStatus(
  wbsVolume: number,
  totalAllocated: number
): "completed" | "partial" | "empty" {
  if (wbsVolume <= 0) return "empty";
  if (totalAllocated >= wbsVolume) return "completed";
  if (totalAllocated > 0) return "partial";
  return "empty";
}

const STATUS_DOT: Record<string, string> = {
  completed: "bg-green-500",
  partial: "bg-amber-400",
  empty: "bg-blue-400",
};

/**
 * Map WBSTerminPlanningItem[] (flat, from API) → WBSData[] (flat, compatible
 * with buildWBSTree). The WBSData type has `wbs_parent_id` — we map from
 * `parent_id` returned by the API.
 */
function mapToWBSData(items: WBSTerminPlanningItem[]): WBSData[] {
  const idMap = new Map<string, string>();
  for (const item of items) {
    if (item.id) {
      idMap.set(item.id, item.wbs_id);
    }
  }

  return items.map((item) => {
    const stringWbsParentId = item.parent_id
      ? (idMap.get(item.parent_id) ?? "")
      : "";

    return {
      wbs_id: item.wbs_id,
      wbs_parent_id: stringWbsParentId,
      description: item.description,
      volume: Number(item.volume) || 0,
      unit: item.unit ?? "",
      is_leaf: item.is_leaf,
      totalCost: 0,
      cbs_category: {},
      node_id: item.id,
    };
  });
}

/**
 * Flatten embedded allocations from WBSTerminPlanningItem[] into a flat array
 * that AllocationCell can use for lookups.
 */
function flattenAllocations(items: WBSTerminPlanningItem[]): FlatAllocation[] {
  const result: FlatAllocation[] = [];
  for (const item of items) {
    for (const alloc of item.allocations) {
      result.push({
        wbs_id: item.wbs_id,
        termin_sequence: alloc.termin_sequence,
        termin_category: alloc.termin_category,
        volume: Number(alloc.volume) || 0,
      });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// AllocationCell
// ---------------------------------------------------------------------------

interface AllocationCellProps {
  item: WBSData;
  termin: TerminInformation;
  allocations: FlatAllocation[];
  onCellEdited: (wbsId: string, terminId: string, value: number) => void;
  isEditMode: boolean;
}

function AllocationCell({
  item,
  termin,
  allocations,
  onCellEdited,
  isEditMode,
}: AllocationCellProps) {
  const [val, setVal] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Match by wbs_id + termin_sequence + termin_category
  const terminCategory = termin.category ?? "termin";
  const cellValue =
    allocations.find(
      (a) =>
        a.wbs_id === item.wbs_id &&
        a.termin_sequence === termin.sequence &&
        a.termin_category === terminCategory
    )?.volume ?? 0;

  // Sync local state when cellValue changes
  useEffect(() => {
    setVal(cellValue === 0 ? "" : cellValue.toString());
  }, [cellValue]);

  // Calculate how much is allocated to OTHER termins (across all categories)
  const maxAllowed = useMemo(() => {
    const otherAllocated = allocations
      .filter(
        (a) =>
          a.wbs_id === item.wbs_id &&
          !(
            a.termin_sequence === termin.sequence &&
            a.termin_category === terminCategory
          )
      )
      .reduce((acc, a) => acc + Number(a.volume), 0);
    return item.volume - otherAllocated;
  }, [allocations, item.wbs_id, termin.sequence, terminCategory, item.volume]);

  const handleBlur = () => {
    setIsFocused(false);
    const newVal = parseFloat(val);
    const parsedVal = isNaN(newVal) ? 0 : newVal;

    if (parsedVal > maxAllowed) {
      toast.error(
        `Volume melebihi sisa yang tersedia (maks: ${formatNumber(maxAllowed)})`
      );
      setVal(maxAllowed.toString());
      return;
    }

    if (!termin.id) {
      toast.error("Failed to update data");
      return;
    }

    if (parsedVal !== cellValue) {
      onCellEdited(item.node_id || item.wbs_id, termin.id, parsedVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  if (!isEditMode) {
    return (
      <td className="px-3 py-2 text-center text-sm">
        <span>{cellValue > 0 ? formatNumber(cellValue) : "-"}</span>
      </td>
    );
  }

  const currentValNum = parseFloat(val);
  const currentSisa = maxAllowed - (isNaN(currentValNum) ? 0 : currentValNum);

  return (
    <td className="px-3 py-2 text-center text-sm">
      <div className="relative inline-flex items-center justify-center">
        <input
          type="number"
          min={0}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="0"
          className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />

        {isFocused && currentSisa > 0 && (
          <div
            className="absolute top-1/2 left-full z-10 ml-2 w-max -translate-y-1/2 cursor-pointer rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
            onMouseDown={(e) => {
              e.preventDefault();
              setVal(maxAllowed.toString());
            }}
          >
            Sisa: {formatNumber(currentSisa)}
          </div>
        )}
      </div>
    </td>
  );
}

// ---------------------------------------------------------------------------
// WBSAllocationRow
// ---------------------------------------------------------------------------

interface RenderRowProps {
  item: HierarchicalNode<WBSData>;
  level: number;
  projectTermins: TerminInformation[];
  allocations: FlatAllocation[];
  onCellEdited: (wbsId: string, terminId: string, value: number) => void;
  isEditMode: boolean;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
}

function WBSAllocationRow({
  item,
  level,
  projectTermins,
  allocations,
  onCellEdited,
  isEditMode,
  expandedNodes,
  onToggleExpand,
}: RenderRowProps): React.ReactNode {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedNodes.has(item.wbs_id);
  const isLeaf = item.is_leaf;
  const isSpecialUnit =
    item.unit?.toLowerCase() === "group" || item.unit?.toLowerCase() === "unit";

  const indentPx = (level - 1) * 12;

  const totalAllocated = useMemo(() => {
    if (!isLeaf) return 0;
    return allocations
      .filter((a) => a.wbs_id === item.wbs_id)
      .reduce((acc, a) => acc + a.volume, 0);
  }, [allocations, item.wbs_id, isLeaf]);

  const status = isLeaf
    ? getAllocationStatus(item.volume, totalAllocated)
    : "empty";

  const rowClass = !isLeaf
    ? "border-b bg-gray-50/80 font-semibold text-gray-800 hover:bg-gray-100/80"
    : "border-b hover:bg-gray-50";

  return (
    <>
      <tr key={item.wbs_id} className={rowClass}>
        {/* WBS ID column */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <div
            className="flex items-center"
            style={{ paddingLeft: `${indentPx}px` }}
          >
            {!isLeaf && (
              <button
                onClick={() => onToggleExpand(item.wbs_id)}
                className="mr-1 rounded p-0.5 text-gray-500 hover:bg-gray-200"
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
            {isLeaf && (
              <span
                className={`mr-2 ml-1 inline-block h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[status]}`}
              />
            )}
            {item.wbs_id}
          </div>
        </td>

        {/* Description column */}
        <td className="px-3 py-2 text-sm">
          <div
            className="flex items-center gap-1"
            style={{ paddingLeft: `${indentPx}px` }}
          >
            <span className={!isLeaf ? "font-semibold text-gray-800" : ""}>
              {item.description}
            </span>
          </div>
        </td>

        {/* Volume */}
        <td className="px-3 py-2 text-center text-sm">
          {isLeaf ? (
            formatNumber(item.volume)
          ) : isSpecialUnit ? (
            <span>{formatNumber(item.volume) || "-"}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        {/* Satuan */}
        <td className="px-3 py-2 text-center text-sm">
          {isLeaf ? (
            isSpecialUnit ? (
              capitalizeFirstLetter(item.unit)
            ) : (
              item.unit || "-"
            )
          ) : isSpecialUnit ? (
            <span>{capitalizeFirstLetter(item.unit) || "-"}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        {/* One column per termin */}
        {projectTermins.map((termin, idx) => {
          if (!isLeaf) {
            return (
              <td
                key={`${item.wbs_id}-termin-${idx}`}
                className="px-3 py-2 text-center text-sm"
              >
                <span className="text-gray-400">-</span>
              </td>
            );
          }

          return (
            <AllocationCell
              key={`${item.wbs_id}-termin-${idx}`}
              item={item}
              termin={termin}
              allocations={allocations}
              onCellEdited={onCellEdited}
              isEditMode={isEditMode}
            />
          );
        })}
      </tr>

      {/* Render children if expanded */}
      {hasChildren &&
        isExpanded &&
        item.children!.map((child) => (
          <WBSAllocationRow
            key={child.wbs_id}
            item={child}
            level={level + 1}
            projectTermins={projectTermins}
            allocations={allocations}
            onCellEdited={onCellEdited}
            isEditMode={isEditMode}
            expandedNodes={expandedNodes}
            onToggleExpand={onToggleExpand}
          />
        ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Table
// ---------------------------------------------------------------------------

export default function TerminAllocationTable({
  projectTermins,
  wbsTerminData,
  isEditMode,
  onToggleEditMode,
  onCellEdited,
  totalVolumes,
}: TerminAllocationTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Derive flat WBSData[] and tree internally from wbsTerminData
  const flatWbsData = useMemo(
    () => mapToWBSData(wbsTerminData),
    [wbsTerminData]
  );
  const treeWbsData = useMemo(
    () => buildHierarchicalTree(flatWbsData, (item) => item.wbs_parent_id),
    [flatWbsData]
  );

  // Flatten embedded allocations for cell lookups
  const allocations = useMemo(
    () => flattenAllocations(wbsTerminData),
    [wbsTerminData]
  );

  // Expand all nodes on first load
  useEffect(() => {
    if (flatWbsData.length > 0) {
      setExpandedNodes(new Set(flatWbsData.map((d) => d.wbs_id)));
    }
  }, [flatWbsData.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-expand all when searching
  useEffect(() => {
    if (searchQuery) {
      setExpandedNodes(new Set(flatWbsData.map((d) => d.wbs_id)));
    }
  }, [searchQuery, flatWbsData]);

  const handleToggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ---------- Search filter ----------
  const filteredTree = useMemo(() => {
    return filterHierarchicalTree(treeWbsData, searchQuery);
  }, [treeWbsData, searchQuery]);

  // ---------- Termin Totals ----------
  const terminTotals = useMemo(() => {
    return projectTermins.map((termin) => {
      const terminCategory = termin.category ?? "termin";
      const total = allocations
        .filter(
          (a) =>
            a.termin_sequence === termin.sequence &&
            a.termin_category === terminCategory
        )
        .reduce((sum, a) => sum + Number(a.volume), 0);
      return { sequence: termin.sequence, total };
    });
  }, [allocations, projectTermins]);

  // ---------- Column count for colSpan ----------
  const totalCols = 4 + projectTermins.length;

  return (
    <div className="w-full">
      {/* ---- Table header bar ---- */}
      <div className="mb-3 flex justify-end gap-3 md:flex-row md:items-end">
        <div className="mb-2 flex items-center gap-3">
          <TableSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search WBS Items..."
          />
          <ViewEditModeButton
            isEditMode={isEditMode}
            onToggle={onToggleEditMode}
          />
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="w-full overflow-x-auto rounded-sm border">
        <table className="w-full border-collapse text-sm">
          {/* Header */}
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                WBS ID
              </th>
              <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Description
              </th>
              <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Volume
              </th>
              <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Satuan
              </th>
              {projectTermins.map((termin, idx) => (
                <th
                  key={`th-termin-${idx}`}
                  className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  {getTerminLabel(termin)}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {filteredTree.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-12 text-center">
                  <Typography variant="label" className="text-gray-400 italic">
                    {searchQuery
                      ? "Data tidak ditemukan"
                      : "Data WBS belum tersedia"}
                  </Typography>
                </td>
              </tr>
            ) : (
              filteredTree.map((item) => (
                <WBSAllocationRow
                  key={item.wbs_id}
                  item={item}
                  level={1}
                  projectTermins={projectTermins}
                  allocations={allocations}
                  onCellEdited={onCellEdited}
                  isEditMode={isEditMode}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleToggleExpand}
                />
              ))
            )}

            {/* Termin Totals footer row */}
            {wbsTerminData.length > 0 && (
              <tr className="border-t-2 border-gray-200 bg-white">
                <td
                  colSpan={4}
                  className="px-4 py-3 text-right text-sm font-bold tracking-wide text-gray-900 uppercase"
                >
                  Total Allocated Volumes (%):
                </td>
                {terminTotals.map(({ total }, idx) => (
                  <td
                    key={`footer-termin-${idx}`}
                    className="px-4 py-3 text-center text-base font-bold text-gray-900"
                  >
                    {total > 0 && totalVolumes > 0
                      ? formatNumber(((total / totalVolumes) * 100).toFixed(1))
                      : "0"}
                    %
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
          Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
          Partially Allocated
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400" />
          Editable Termin
        </span>
      </div>
    </div>
  );
}
