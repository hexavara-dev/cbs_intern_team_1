"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import { Briefcase, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";

interface ProjectSummaryProps {
  totalProjects: number;
  totalBudget: number;
  ongoingCount: number;
  completedCount: number;
}

export default function ProjectSummary({
  totalProjects,
  totalBudget,
  ongoingCount,
  completedCount,
}: ProjectSummaryProps) {
  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      description: "Overall project portfolio",
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Budget",
      value: formatCurrency(totalBudget),
      description: "Accumulated budget",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Ongoing",
      value: ongoingCount,
      description: "Active projects",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Completed",
      value: completedCount,
      description: "Successfully finished",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <SummaryCard
            key={stat.title}
            label={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.color}
            iconBgColor={stat.bg}
          />
        ))}
      </div>
    </div>
  );
}
