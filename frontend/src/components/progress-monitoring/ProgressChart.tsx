"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSummaryByTermin } from "@/types/progress";
import { formatNumber } from "@/utils/formatNumber";

type ProgressChartProps = {
  progressByTermin: ProgressSummaryByTermin[];
};

export default function ProgressChart({ progressByTermin }: ProgressChartProps) {
  const data = useMemo(() => {
    let actualRunningTotal = 0;

    return [...progressByTermin]
      .sort((a, b) => a.termin_sequence - b.termin_sequence)
      .map((termin) => {
        const actualPerTermin = termin.actual_volume || 0;
        actualRunningTotal += actualPerTermin;

        return {
          label: `${termin.termin_category === "termin" ? "Termin" : "Adendum"} ${termin.termin_sequence}`,
          actualPerTermin,
          actualCumulative: actualRunningTotal,
        };
      });
  }, [progressByTermin]);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Progress Chart</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="actualCumulativeGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value: number) => formatNumber(value)}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(
                  value: number | undefined,
                  name: string | undefined
                ) => [
                  value !== undefined ? formatNumber(value) : "N/A",
                  name === "Actual Cumulative" || name === "actualCumulative"
                    ? "Cumulative"
                    : "per Termin",
                ]}
                labelStyle={{
                  color: "#374151",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
              />
              <Legend verticalAlign="top" height={36} />

              {/* Actual Cumulative Line */}
              <Area
                type="monotone"
                dataKey="actualCumulative"
                name="Actual Cumulative"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#actualCumulativeGradient)"
                fillOpacity={1}
                dot={false}
              />

              {/* Actual Per Termin Line */}
              <Area
                type="monotone"
                dataKey="actualPerTermin"
                name="Actual per Termin"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#actualGradient)"
                fillOpacity={1}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#16a34a" }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
