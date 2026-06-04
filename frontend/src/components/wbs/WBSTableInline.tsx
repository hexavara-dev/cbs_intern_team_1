import { ColumnProps, WBSData, CBSData } from "@/types/cbs-wbs";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  Search,
  ChevronRight,
  ChevronDown,
  GitBranch,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import InlineWBSRow, { InlineWBSFormData } from "./InlineWBSRow";
import { useState, useMemo, useEffect } from "react";
import { ConfirmDialog } from "@/components/shared/form/confirm-dialog";

type EditingState = {
  isEditing: boolean;
  type: "kategori" | "pekerjaan" | "subkategori";
  parentId?: string;
  wbsId: string;
} | null;

type WBSTableInlineProps = {
  data: WBSData[];
  flatData: WBSData[];
  cbsColumns?: ColumnProps[];
  cbsData?: Omit<CBSData, "selected">[];
  onCellEdited?: (wbsId: string, field: string, value: string | number) => void;
  onDelete?: (wbsId: string) => void;
  onAddItem?: (
    type: "kategori" | "pekerjaan" | "subkategori",
    parentId: string | null,
    wbsId: string,
    data: InlineWBSFormData
  ) => void;
  onSave?: () => void;
  costSummaries?: CostSummary;
};

export default function WBSTableInline({
  data,
  flatData,
  cbsColumns = [],
  cbsData = [],
  onCellEdited,
  onDelete,
  onAddItem,
  onSave,
  costSummaries,
}: WBSTableInlineProps) {
  const [editingState, setEditingState] = useState<EditingState>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize all nodes as expanded initially
  useMemo(() => {
    // Only set expanded nodes on first load if empty
    if (expandedNodes.size === 0 && flatData.length > 0) {
      const allIds = flatData.map((item) => item.wbs_id);
      setExpandedNodes(new Set(allIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatData.length]);

  // Filter Data based on Search Logic
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const lowerQuery = searchQuery.toLowerCase();

    const matches = (item: WBSData): boolean => {
      const selfMatch =
        item.description.toLowerCase().includes(lowerQuery) ||
        item.wbs_id.toLowerCase().includes(lowerQuery);

      const childrenMatch = item.children
        ? item.children.some((child) => matches(child))
        : false;

      return selfMatch || childrenMatch;
    };

    const filterTree = (nodes: WBSData[]): WBSData[] => {
      return nodes
        .map((node) => {
          // Clone to avoid mutating original structure for display
          const newNode = { ...node };
          if (newNode.children) {
            newNode.children = filterTree(newNode.children);
          }
          return newNode;
        })
        .filter((node) => matches(node));
    };

    return filterTree(data);
  }, [data, searchQuery]);

  // Auto-expand on search
  useEffect(() => {
    if (searchQuery) {
      const allIds = flatData.map((item) => item.wbs_id);
      setExpandedNodes(new Set(allIds));
    }
  }, [searchQuery, flatData]);

  const totalCost = useMemo(() => {
    return data
      .filter((item) => !item.is_leaf)
      .reduce((sum, item) => sum + (item.totalCost || 0), 0);
  }, [data]);

  // Generate next WBS ID for inline editing
  const generateNextId = (parentId: string | null): string => {
    if (!parentId) {
      // Top-level category (1, 2, 3...)
      const topLevelIds = flatData
        .filter((item) => !item.wbs_id.includes("."))
        .map((item) => Number(item.wbs_id))
        .filter((num) => !isNaN(num));

      return topLevelIds.length > 0
        ? String(Math.max(...topLevelIds) + 1)
        : "1";
    }

    // Child items: Find items that start with parentId + "." and have exactly one more segment
    const parentSegments = parentId.split(".").length;
    const children = flatData.filter((item) => {
      return (
        item.wbs_id.startsWith(`${parentId}.`) &&
        item.wbs_id.split(".").length === parentSegments + 1
      );
    });

    const childNums = children
      .map((item) => Number(item.wbs_id.split(".").pop()))
      .filter((num) => !isNaN(num));

    const nextIndex = childNums.length > 0 ? Math.max(...childNums) + 1 : 1;
    return `${parentId}.${nextIndex}`;
  };

  const handleStartEdit = (
    type: "kategori" | "pekerjaan" | "subkategori",
    parentId: string | null
  ) => {
    const wbsId = generateNextId(parentId);
    setEditingState({
      isEditing: true,
      type,
      parentId: parentId || undefined,
      wbsId,
    });

    // Auto-expand the parent node when adding a child
    if (parentId && !expandedNodes.has(parentId)) {
      setExpandedNodes((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.add(parentId);
        return newExpanded;
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingState(null);
  };

  const handleSaveEdit = (formData: InlineWBSFormData) => {
    if (editingState && onAddItem) {
      onAddItem(
        editingState.type,
        editingState.parentId || null,
        editingState.wbsId,
        formData
      );
    }
    setEditingState(null);
  };

  // Build column headers - hide Action column when not in edit mode
  const baseHeaders = ["WBS ID", "Description", "Volume", "Satuan"];
  const cbsHeaders = cbsColumns.map((col) => col.header);
  const otherHeaders = isEditMode ? ["Cost", "Action"] : ["Cost"];
  const allHeaders = [...baseHeaders, ...cbsHeaders, ...otherHeaders];

  // Handle Enter key to save (blur)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  // Render a single WBS row recursively
  const renderRow = (item: WBSData, level: number): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedNodes.has(item.wbs_id);
    const isLeaf = item.is_leaf;
    const isSpecialUnit =
      item.unit?.toLowerCase() === "group" ||
      item.unit?.toLowerCase() === "unit";

    const toggleExpand = (wbsId: string) => {
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(wbsId)) {
        newExpanded.delete(wbsId);
      } else {
        newExpanded.add(wbsId);
      }
      setExpandedNodes(newExpanded);
    };

    const rowClass = !isLeaf
      ? "border-b hover:bg-gray-50 bg-gray-50/80 font-semibold text-gray-800"
      : "border-b hover:bg-gray-50";

    const indentPx = (level - 1) * 12;

    // Main data row
    rows.push(
      <tr key={item.wbs_id} className={rowClass}>
        {/* WBS ID with indentation */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <div
            className="flex items-center"
            style={{ paddingLeft: `${indentPx}px` }}
          >
            {!isLeaf && (
              <button
                onClick={() => toggleExpand(item.wbs_id)}
                className="mr-1 rounded p-0.5 text-gray-500 hover:bg-gray-200"
              >
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
            {isLeaf && <span className="inline-block w-5"></span>}
            {item.wbs_id}
          </div>
        </td>

        {/* Description */}
        <td className="px-3 py-2 text-sm">
          <div style={{ paddingLeft: `${indentPx}px` }}>
            {isEditMode ? (
              <input
                type="text"
                defaultValue={item.description}
                className={`w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${!isLeaf ? "font-semibold" : ""}`}
                onBlur={(e) =>
                  onCellEdited?.(item.wbs_id, "description", e.target.value)
                }
                onKeyDown={handleKeyDown}
              />
            ) : (
              <span className={!isLeaf ? "font-semibold text-gray-800" : ""}>
                {item.description}
              </span>
            )}
          </div>
        </td>

        {/* Volume */}
        <td className="px-3 py-2 text-center text-sm">
          {isLeaf ? (
            isEditMode ? (
              isSpecialUnit ? (
                <span>{formatNumber(item.volume) || "-"}</span>
              ) : (
                <input
                  type="number"
                  defaultValue={item.volume || ""}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  onBlur={(e) =>
                    onCellEdited?.(
                      item.wbs_id,
                      "volume",
                      Number(e.target.value)
                    )
                  }
                  onKeyDown={handleKeyDown}
                />
              )
            ) : (
              <span>{formatNumber(item.volume) || "-"}</span>
            )
          ) : isSpecialUnit ? (
            <span>{formatNumber(item.volume) || "-"}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        {/* Satuan */}
        <td className="px-3 py-2 text-center text-sm">
          {isLeaf ? (
            isEditMode ? (
              isSpecialUnit ? (
                <span>{capitalizeFirstLetter(item.unit) || "-"}</span>
              ) : (
                <select
                  defaultValue={item.unit || ""}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  onChange={(e) =>
                    onCellEdited?.(item.wbs_id, "unit", e.target.value)
                  }
                >
                  <option value="">-</option>
                  {DUMMY_UNIT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <span>
                {isSpecialUnit
                  ? capitalizeFirstLetter(item.unit)
                  : item.unit || "-"}
              </span>
            )
          ) : isSpecialUnit ? (
            <span>{capitalizeFirstLetter(item.unit) || "-"}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        {/* CBS Columns */}
        {cbsColumns.map((col) => {
          const key = col.header.split(" (")[0];
          const value = item.cbs_category?.[key] ?? 0;

          return (
            <td key={key} className="px-3 py-2 text-center text-sm">
              {isLeaf ? (
                isEditMode ? (
                  isSpecialUnit ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <input
                      type="number"
                      defaultValue={value || ""}
                      className="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-center text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      onBlur={(e) =>
                        onCellEdited?.(
                          item.wbs_id,
                          `cbs_category.${key}`,
                          Number(e.target.value)
                        )
                      }
                      onKeyDown={handleKeyDown}
                    />
                  )
                ) : (
                  <span>{value ? formatCurrency(value) : "-"}</span>
                )
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
          );
        })}

        {/* Cost */}
        <td className="px-3 py-2 text-center text-sm font-medium">
          {isLeaf && isEditMode && isSpecialUnit ? (
            <input
              type="number"
              defaultValue={item.totalCost || ""}
              className="w-24 rounded border border-gray-300 bg-white px-2 py-1 text-center text-sm font-normal focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              onBlur={(e) =>
                onCellEdited?.(
                  item.wbs_id,
                  "total_cost",
                  Number(e.target.value)
                )
              }
              onKeyDown={handleKeyDown}
            />
          ) : item.totalCost ? (
            formatCurrency(item.totalCost)
          ) : (
            "0"
          )}
        </td>

        {/* Action - only in edit mode */}
        {isEditMode && (
          <td className="px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1">
              {!isLeaf && level === 1 && (
                <button
                  type="button"
                  className="cursor-pointer rounded p-1 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                  onClick={() => handleStartEdit("subkategori", item.wbs_id)}
                  disabled={editingState !== null}
                  title={`Tambah Subkategori untuk ${item.wbs_id}`}
                >
                  <GitBranch size={16} />
                </button>
              )}
              {level >= 1 && (
                <button
                  type="button"
                  className="cursor-pointer rounded p-1 text-green-700 hover:bg-green-50 disabled:opacity-50"
                  onClick={() => handleStartEdit("pekerjaan", item.wbs_id)}
                  disabled={editingState !== null}
                  title={`Tambah Pekerjaan untuk ${item.wbs_id}`}
                >
                  <FilePlus size={16} />
                </button>
              )}
              <ConfirmDialog
                title="Delete Confirmation"
                description={`Apakah anda yakin ingin menghapus data "${item.wbs_id} - ${item.description}"?`}
                onConfirm={() => onDelete?.(item.wbs_id)}
                customTrigger={
                  <button
                    className="cursor-pointer rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    disabled={editingState !== null}
                    title={`Hapus WBS ${item.wbs_id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                }
              />
            </div>
          </td>
        )}
      </tr>
    );

    if (hasChildren && isExpanded) {
      item.children!.forEach((child) => {
        rows.push(...renderRow(child, level + 1));
      });
    }

    const showActionRow = (!isLeaf && isExpanded) || (isLeaf && isEditMode);

    if (showActionRow) {
      // Render inline edit row here if editing for this parent
      if (editingState && editingState.parentId === item.wbs_id) {
        // Indent visual for the form should align with children level
        const editLevel = level + 1;
        const formIndentPx = (editLevel - 1) * 12;

        rows.push(
          <InlineWBSRow
            key={`inline-${item.wbs_id}`}
            type={editingState.type}
            wbsId={editingState.wbsId}
            cbsData={cbsData}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            indent={formIndentPx}
          />
        );
      }
    }

    return rows;
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      setEditingState(null);
      onSave?.();
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="w-full">
      {/* Header with Search and Edit/Save Button */}
      <div className="mb-3 flex justify-end gap-4 md:flex-row md:items-center">
        <div className="mb-2 flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-fit md:w-64">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <input
              placeholder="Search WBS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border pr-3 pl-8 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button
            type="button"
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleEditMode}
            className="gap-2"
          >
            {isEditMode ? (
              <>
                <Eye size={16} />
                View Mode
              </>
            ) : (
              <>
                <Pencil size={16} />
                Edit Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-sm border">
        <table className="w-full border-collapse">
          {/* Header - Dark Gray */}
          <thead className="bg-gray-700 text-white">
            <tr>
              {allHeaders.map((header, idx) => (
                <th
                  key={idx}
                  className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Empty state when no data - only show when NOT in edit mode and NOT adding item */}
            {filteredData.length === 0 && !editingState && !isEditMode && (
              <tr>
                <td
                  colSpan={allHeaders.length}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Typography variant="label" className="text-gray-500">
                      {searchQuery
                        ? "Data tidak ditemukan"
                        : "Data WBS belum ada"}
                    </Typography>
                    {!searchQuery && (
                      <Typography variant="label" className="text-gray-500">
                        Klik tombol &quot;Edit&quot; di atas untuk mulai
                        menambahkan data
                      </Typography>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* Render all rows */}
            {filteredData.map((item) => renderRow(item, 1))}

            {/* Inline edit row for NEW KATEGORI (no parent) - only in edit mode */}
            {isEditMode && editingState && !editingState.parentId && (
              <InlineWBSRow
                type={editingState.type}
                wbsId={editingState.wbsId}
                cbsData={cbsData}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                indent={0}
              />
            )}

            {/* Bottom action row - Tambah Kategori - only in edit mode */}
            {isEditMode && (
              <tr className="bg-gray-50">
                <td colSpan={allHeaders.length} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => handleStartEdit("kategori", null)}
                      disabled={editingState !== null}
                    >
                      <Plus size={16} className="mr-1" />
                      Tambah Kategori
                    </Button>
                  </div>
                </td>
              </tr>
            )}
            {/* Total Cost Row */}
            {data.length > 0 && (
              <tr className="border-t-2 border-gray-200 bg-white">
                <td
                  colSpan={baseHeaders.length}
                  className="px-4 py-3 text-right text-base font-bold tracking-wide text-gray-900 uppercase"
                >
                  Total RAP
                </td>
                {cbsColumns.map((col, idx) => {
                  const key = col.header.split(" (")[0];
                  const categorySummary = costSummaries?.by_cbs_category?.find(
                    (c) => c.cbs_name === key
                  );
                  const plannedCost = categorySummary?.planned_cost || 0;

                  return (
                    <td
                      key={`total-${idx}`}
                      className="px-3 py-3 text-center text-base font-bold text-gray-900"
                    >
                      {formatCurrency(Number(plannedCost))}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center text-base font-bold text-gray-900">
                  {formatCurrency(totalCost)}
                </td>
                {isEditMode && <td className="px-3 py-3"></td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from "react";
import Typography from "../Typography";
import { DUMMY_UNIT_OPTIONS } from "@/data/dummy-unit-options";
import { formatCurrency } from "@/utils/formatCurrency";
import { CostSummary } from "@/types/cost";
import { formatNumber } from "@/utils/formatNumber";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
