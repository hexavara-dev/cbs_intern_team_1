"use client";

import React, { useState, useMemo, useEffect } from "react";
import { formatNumber } from "@/utils/formatNumber";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { TerminInformation } from "@/types/termin";
import { WBSProgressMonitoringItem } from "@/types/progress";
import { ChevronDown, ChevronRight } from "lucide-react";
import TableSearchInput from "@/components/shared/TableSearchInput";
import {
  buildHierarchicalTree,
  filterHierarchicalTree,
  HierarchicalNode,
} from "@/utils/wbsHelpers";

interface ProgressMonitoringTableProps {
  data: WBSProgressMonitoringItem[];
  termins?: TerminInformation[];
}

function mapToWBSData(
  items: WBSProgressMonitoringItem[]
): (WBSProgressMonitoringItem & { wbs_parent_id: string })[] {
  const idMap = new Map<string, string>();
  for (const item of items) {
    if (item.id) idMap.set(item.id, item.wbs_id);
  }

  return items.map((item) => {
    const stringWbsParentId = item.parent_id
      ? (idMap.get(item.parent_id) ?? "")
      : "";
    return {
      ...item,
      wbs_parent_id: stringWbsParentId,
    };
  });
}

function calculateAggregates(item: WBSProgressMonitoringItem) {
  const totalActual = item.progress.reduce(
    (sum, p) => sum + p.actual_volume,
    0
  );
  const remaining = item.planned_volume - totalActual;

  return { totalActual, remaining };
}

export type ProgressTreeNode = HierarchicalNode<WBSProgressMonitoringItem>;

export const ProgressMonitoringTable: React.FC<
  ProgressMonitoringTableProps
> = ({ data, termins = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const treeData = useMemo(() => {
    const mapped = mapToWBSData(data);
    return buildHierarchicalTree(mapped, (item) => item.wbs_parent_id);
  }, [data]);

  const filteredTree = useMemo(() => {
    return filterHierarchicalTree(treeData, searchQuery);
  }, [treeData, searchQuery]);

  // Expand all initially and on search
  useEffect(() => {
    if (data.length > 0) {
      setExpandedNodes(new Set(data.map((d) => d.wbs_id)));
    }
  }, [data.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchQuery) {
      setExpandedNodes(new Set(data.map((d) => d.wbs_id)));
    }
  }, [searchQuery, data]);

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

  const renderRow = (node: ProgressTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.wbs_id);
    const item = node;

    const { totalActual, remaining } = calculateAggregates(item);
    const isLeaf = item.is_leaf;
    const isSpecialUnit =
      item.unit?.toLowerCase() === "group" ||
      item.unit?.toLowerCase() === "unit";
    const indentPx = level * 12;

    const rowClass = !isLeaf
      ? "border-b bg-gray-50/80 font-semibold text-gray-800 hover:bg-gray-100/80"
      : "border-b hover:bg-gray-50";

    return (
      <React.Fragment key={item.wbs_id}>
        <tr className={rowClass}>
          {/* WBS ID Column */}
          <td className="px-3 py-2 text-sm whitespace-nowrap">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${indentPx}px` }}
            >
              {!isLeaf ? (
                <button
                  onClick={() => handleToggleExpand(item.wbs_id)}
                  className="mr-1 rounded p-0.5 text-gray-500 hover:bg-gray-200"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              ) : (
                <span className="mr-2 ml-1 inline-block h-2 w-2 flex-shrink-0" />
              )}
              <span>{item.wbs_id}</span>
            </div>
          </td>

          {/* Description Column */}
          <td className="max-w-[300px] min-w-[200px] truncate px-3 py-2 text-sm">
            {item.description}
          </td>

          {/* Planned Vol Column */}
          <td className="px-3 py-2 text-center text-sm">
            {isLeaf ? (
              <span>{formatNumber(item.planned_volume)}</span>
            ) : isSpecialUnit ? (
              <span>{formatNumber(item.planned_volume) || "-"}</span>
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

          {/* Termin Actuals */}
          {termins.map((termin, idx) => {
            const terminCat = termin.category || "termin";
            const progressForTermin = item.progress.find(
              (p) =>
                p.termin_sequence === termin.sequence &&
                p.termin_category === terminCat
            );
            const plannedForTermin = progressForTermin?.planned_volume || 0;
            const actualForTermin = progressForTermin?.actual_volume || 0;

            return (
              <React.Fragment key={`termin-${idx}`}>
                {/* Planned Volume Sub-Column */}
                <td className="px-3 py-2 text-center text-sm">
                  {isLeaf && plannedForTermin > 0 ? (
                    <span>{formatNumber(plannedForTermin)}</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>

                {/* Actual Volume Sub-Column */}
                <td className="px-3 py-2 text-center text-sm">
                  {isLeaf && actualForTermin > 0 ? (
                    <span>{formatNumber(actualForTermin)}</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </React.Fragment>
            );
          })}

          {/* Total Actual Vol Column */}
          <td className="px-3 py-2 text-center text-sm text-gray-900">
            {isLeaf ? formatNumber(totalActual) : "-"}
          </td>

          {/* Remaining Vol Column */}
          <td className="px-3 py-2 text-center text-sm">
            {isLeaf ? formatNumber(remaining) : "-"}
          </td>
        </tr>
        {hasChildren &&
          isExpanded &&
          node.children!.map((child) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex w-full justify-end">
        <TableSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search WBS..."
        />
      </div>

      <div className="overflow-hidden rounded-sm border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th
                  rowSpan={2}
                  className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  WBS ID
                </th>
                <th
                  rowSpan={2}
                  className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  Description
                </th>
                <th
                  rowSpan={2}
                  className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  Volume
                </th>
                <th
                  rowSpan={2}
                  className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  Satuan
                </th>

                {termins.length > 0 &&
                  termins.map((t, idx) => (
                    <th
                      key={`termin-header-${idx}`}
                      colSpan={2}
                      className="border-b border-l border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                    >
                      {t.category === "termin" ? "Termin" : "Adendum"}{" "}
                      {t.sequence}
                    </th>
                  ))}

                <th
                  rowSpan={2}
                  className="border-b border-l border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  Total Actual
                </th>
                <th
                  rowSpan={2}
                  className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap"
                >
                  Remaining Vol
                </th>
              </tr>
              {termins.length > 0 && (
                <tr className="bg-gray-700 text-white">
                  {termins.map((t, idx) => (
                    <React.Fragment key={`sub-header-${idx}`}>
                      <th className="min-w-[90px] border-r border-b border-l border-gray-600 px-3 py-2 text-center text-[12px] font-semibold whitespace-nowrap">
                        Planned
                      </th>
                      <th className="min-w-[90px] border-b border-gray-600 px-3 py-2 text-center text-[12px] font-semibold whitespace-nowrap">
                        Actual
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTree.length > 0 ? (
                filteredTree.map((node) => renderRow(node, 0))
              ) : (
                <tr>
                  <td
                    colSpan={6 + termins.length * 2}
                    className="py-12 text-center text-gray-500"
                  >
                    Belum ada data progres monitoring yang tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
