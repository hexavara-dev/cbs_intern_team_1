"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSummaryByTermin as ProgressByTerminItem } from "@/types/progress";
import { formatNumber } from "@/utils/formatNumber";
import { Activity, BarChart3, CheckCircle2, CircleDashed } from "lucide-react";
import ProgressSummaryByTermin from "./ProgressSummaryByTermin";

type ProgressSummaryProps = {
  totalPlanned: number;
  totalExecuted: number;
  percentage: number;
  progressByTermin: ProgressByTerminItem[];
};

export default function ProgressSummary({
  totalPlanned,
  totalExecuted,
  percentage,
  progressByTermin,
}: ProgressSummaryProps) {
  const remaining = Math.max(0, totalPlanned - totalExecuted);

  const cards = [
    {
      title: "Total Tasks",
      value: formatNumber(totalPlanned),
      icon: CircleDashed,
      description: "Total tasks allocated",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Completed Tasks",
      value: formatNumber(totalExecuted),
      icon: CheckCircle2,
      description: "Tasks completed (100%)",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Remaining Tasks",
      value: formatNumber(remaining),
      icon: Activity,
      description: "Tasks left to complete",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Overall Progress",
      value: `${percentage.toFixed(2)}%`,
      icon: BarChart3,
      description: "Completion percentage",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-full p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-muted-foreground text-sm">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProgressSummaryByTermin data={progressByTermin} />
    </div>
  );
}
