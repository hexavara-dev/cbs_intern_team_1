import React, { useState, useMemo, useEffect } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useParams } from "next/navigation";
import Typography from "../Typography";
import TableSearchInput from "@/components/shared/TableSearchInput";
import {
  buildHierarchicalTree,
  filterHierarchicalTree,
  HierarchicalNode,
} from "@/utils/wbsHelpers";
import { Button } from "../ui/button";

export interface WBSCostMonitoringItem {
  id: string;
  wbs_id: string;
  description: string;
  is_leaf: boolean;
  planned_cost: number;
  actual_cost: number;
}

interface WBSMonitoringTableProps {
  data: WBSCostMonitoringItem[];
}

// ---------------------------------------------------------------------------
// WBSCostMonitoringRow
// ---------------------------------------------------------------------------

interface RenderRowProps {
  item: HierarchicalNode<WBSCostMonitoringItem>;
  level: number;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
  projectId: string;
}

function WBSCostMonitoringRow({
  item,
  level,
  expandedNodes,
  onToggleExpand,
  projectId,
}: RenderRowProps): React.ReactNode {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedNodes.has(item.wbs_id);
  const isLeaf = item.is_leaf;

  const isOver = item.actual_cost > item.planned_cost && item.planned_cost > 0;
  const v = item.planned_cost - item.actual_cost;

  const indentPx = (level - 1) * 12;
  const rowClass = !isLeaf
    ? "border-b bg-gray-50/80 font-semibold text-gray-800 hover:bg-gray-100/80"
    : "border-b hover:bg-gray-50";

  return (
    <>
      <tr className={rowClass}>
        {/* WBS ID column */}
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <div
            className="flex items-center"
            style={{ paddingLeft: `${indentPx}px` }}
          >
            {!isLeaf ? (
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
            ) : (
              <span className="mr-2 ml-1 inline-block h-2 w-2 flex-shrink-0" />
            )}
            <span>{item.wbs_id}</span>
          </div>
        </td>

        {/* Description column */}
        <td className="max-w-[300px] min-w-[200px] truncate px-3 py-2 text-sm">
          {item.description}
        </td>

        <td className="px-3 py-2 text-center text-sm">
          {formatCurrency(item.planned_cost)}
        </td>
        <td
          className={cn(
            "px-3 py-2 text-center text-sm",
            isOver ? "text-red-600" : "text-gray-900"
          )}
        >
          {item.is_leaf ? formatCurrency(item.actual_cost) : "-"}
        </td>
        <td
          className={cn(
            "px-3 py-2 text-center text-sm",
            v < 0 ? "text-red-500" : "text-gray-600"
          )}
        >
          {item.is_leaf ? formatCurrency(v) : "-"}
        </td>
        <td className="px-3 py-2">
          {isLeaf && (
            <div className="flex justify-center">
              {isOver ? (
                <AlertCircle className="text-red-500" size={18} />
              ) : (
                <CheckCircle2 className="text-green-500" size={18} />
              )}
            </div>
          )}
        </td>
        <td className="px-3 py-2 text-center text-sm">
          {isLeaf ? (
            <Link
              href={`/projects/${projectId}/cost-report/wbs/${encodeURIComponent(
                item.id
              )}`}
              className="text-primary inline-flex items-center gap-1 text-[10px] font-bold uppercase hover:underline"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 px-2 text-[10px]"
              >
                <Eye size={12} />
                Detail
              </Button>
            </Link>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
      </tr>

      {/* Render children if expanded */}
      {hasChildren &&
        isExpanded &&
        item.children!.map((child) => (
          <WBSCostMonitoringRow
            key={child.wbs_id}
            item={child}
            level={level + 1}
            expandedNodes={expandedNodes}
            onToggleExpand={onToggleExpand}
            projectId={projectId}
          />
        ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Table
// ---------------------------------------------------------------------------

export const WBSMonitoringTable: React.FC<WBSMonitoringTableProps> = ({
  data,
}) => {
  const { projectId } = useParams() as { projectId: string };

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Data processing
  const treeData = useMemo(() => {
    // Derive parent IDs by removing the last dot segment (e.g., "1.1.1" -> "1.1")
    const getParentId = (item: WBSCostMonitoringItem) => {
      const parts = item.wbs_id.split(".");
      if (parts.length > 1) {
        return parts.slice(0, -1).join(".");
      }
      return null;
    };
    return buildHierarchicalTree(data, getParentId);
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
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  WBS ID
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Description
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Total RAP
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Total Expenses
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Remaining
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Status
                </th>
                <th className="border-b border-gray-600 px-3 py-3 text-center text-sm font-semibold whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTree.length > 0 ? (
                filteredTree.map((item) => (
                  <WBSCostMonitoringRow
                    key={item.wbs_id}
                    item={item}
                    level={1}
                    expandedNodes={expandedNodes}
                    onToggleExpand={handleToggleExpand}
                    projectId={projectId}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Typography
                        variant="label"
                        className="text-muted-foreground italic"
                      >
                        Data tidak ditemukan.
                      </Typography>
                      {!searchQuery && (
                        <Typography
                          variant="label"
                          className="text-muted-foreground italic"
                        >
                          Tambah item WBS ke proyek untuk monitoring cost.
                        </Typography>
                      )}
                    </div>
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
