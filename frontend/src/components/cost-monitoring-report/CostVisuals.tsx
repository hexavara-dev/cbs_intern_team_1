"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/utils/formatCurrency";
import Typography from "@/components/Typography";
import { AlertTriangle, BarChart3 } from "lucide-react";

interface BudgetUsageChartProps {
  totalRAP: number;
  totalExpenses: number;
}

export const BudgetUsageChart: React.FC<BudgetUsageChartProps> = ({
  totalRAP,
  totalExpenses,
}) => {
  const usagePercentage =
    totalRAP > 0 ? (totalExpenses / totalRAP) * 100 : 0;

  const hasData = totalRAP > 0;

  const radialData = [
    {
      name: "Usage",
      value: Math.min(usagePercentage, 100),
      max: 100,
      fill:
        usagePercentage > 100
          ? "#ef4444" // Red-500
          : usagePercentage > 80
            ? "#eab308" // Yellow-500
            : "#22c55e", // Green-500
    },
  ];

  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {/* Left: Usage Header & Progress Info */}
        <div className="flex flex-col justify-between space-y-4 md:w-1/3">
          <div>
            <Typography
              weight="semibold"
              className="text-[10px] text-gray-400 uppercase"
            >
              Overall Budget Usage
            </Typography>
            <div className="mt-1 flex items-baseline gap-2">
              <Typography
                variant="h4"
                weight="bold"
                className={
                  usagePercentage > 100
                    ? "text-red-600"
                    : usagePercentage > 80
                      ? "text-yellow-600"
                      : "text-green-600"
                }
              >
                {usagePercentage.toFixed(1)}%
              </Typography>
              <Typography
                variant="body"
                className="text-muted-foreground text-sm"
              >
                Terpakai
              </Typography>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total RAP</span>
              <span className="font-semibold text-gray-700">
                {formatCurrency(totalRAP)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Expenses</span>
              <span className="font-semibold text-gray-700">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>

          {usagePercentage > 90 && (
            <div className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 p-2.5 text-[11px] text-orange-600">
              <AlertTriangle size={14} className="shrink-0" />
              <span className="font-medium">
                {usagePercentage > 100
                  ? "Extreme: RAP limit exceeded!"
                  : "Caution: RAP usage is high."}
              </span>
            </div>
          )}
        </div>

        {/* Center/Right: The Chart */}
        <div className="relative flex min-h-[180px] flex-1 items-center justify-center">
          {hasData ? (
            <>
              <ChartContainer
                config={{
                  usage: {
                    label: "Budget Used",
                    color: "var(--color-primary)",
                  },
                }}
                className="aspect-square h-[200px] w-auto"
              >
                <RadialBarChart
                  innerRadius="75%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={90 - 360}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  {/* Background Ring */}
                  <RadialBar
                    dataKey="max"
                    background={{ fill: "#f3f4f6" }} 
                    cornerRadius={10}
                  />
                  {/* Usage Bar */}
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={
                      usagePercentage > 100
                        ? "#ef4444"
                        : usagePercentage > 80
                          ? "#eab308"
                          : "#22c55e"
                    }
                  />
                </RadialBarChart>
              </ChartContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <Typography
                  weight="bold"
                  className={
                    usagePercentage > 100
                      ? "text-xs text-red-600 uppercase"
                      : usagePercentage > 80
                        ? "text-xs text-yellow-600 uppercase"
                        : "text-xs text-green-600 uppercase"
                  }
                >
                  {usagePercentage > 100 ? "OVER" : "IN"}
                </Typography>
                <Typography
                  variant="label"
                  className="text-muted-foreground text-[9px] tracking-widest uppercase opacity-60"
                >
                  Budget
                </Typography>
              </div>
            </>
          ) : (
            <div className="flex h-40 w-40 flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed border-gray-50 p-8">
              <BarChart3 className="text-gray-200" size={32} />
              <Typography
                variant="label"
                className="text-center leading-tight text-gray-400"
              >
                Data tidak ditemukan.
              </Typography>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface CBSBarChartProps {
  cbsSummary: Record<string, { planned: number; actual: number }>;
}

export const CBSBarChart: React.FC<CBSBarChartProps> = ({ cbsSummary }) => {
  const barData = useMemo(() => {
    return Object.entries(cbsSummary)
      .map(([name, data]) => ({
        category: name.split("-")[0],
        planned: data.planned,
        actual: data.actual,
      }))
      .filter((d) => d.planned > 0 || d.actual > 0);
  }, [cbsSummary]);

  const chartConfig = {
    planned: {
      label: "Planned",
      color: "var(--chart-2)",
    },
    actual: {
      label: "Actual",
      color: "var(--chart-1)",
    },
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Typography weight="bold">Comparison per Category</Typography>
        {barData.length === 0 && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <AlertTriangle size={14} />
            <Typography variant="label" className="italic">
              Data budget belum tersedia
            </Typography>
          </div>
        )}
      </div>
      <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div className="h-[300px] w-full">
          {barData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="min-h-[300px] w-full"
            >
              <BarChart
                data={barData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="planned"
                  fill="var(--color-planned)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Bar
                  dataKey="actual"
                  fill="var(--color-actual)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-gray-50/50 text-gray-400 transition-colors hover:bg-gray-50">
              <BarChart3 size={32} className="opacity-20" />
              <Typography variant="body" className="font-medium text-gray-400">
                Selesaikan WBS untuk visualisasi data
              </Typography>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
