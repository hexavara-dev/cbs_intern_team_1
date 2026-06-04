"use client";

import Typography from "@/components/Typography";
import { ProgressSummaryByTermin as ProgressByTerminItem } from "@/types/progress";
import { formatNumber } from "@/utils/formatNumber";

type ProgressSummaryByTerminProps = {
  data: ProgressByTerminItem[];
};

export default function ProgressSummaryByTermin({
  data,
}: ProgressSummaryByTerminProps) {
  if (data.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <div className="mb-4">
        <Typography variant="title" weight="bold">
          Progress Aktual per Termin
        </Typography>
        <Typography
          variant="body"
          className="text-muted-foreground mt-1 text-sm"
        >
          Ringkasan Progress Aktual Setiap Termin
        </Typography>
      </div>

      <div className="border-border/70 rounded-lg border">
        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="text-muted-foreground grid grid-cols-[52px_minmax(150px,1fr)_minmax(180px,2fr)_110px] border-b px-4 py-2 text-xs font-semibold tracking-wide uppercase">
              <span className="text-center">No</span>
              <span>Termin</span>
              <span>Progress</span>
              <span className="text-right">Aktual Vol</span>
            </div>

            {data.map((termin, index) => {
              const percentage = Math.min(
                100,
                Math.max(0, Number(termin.percentage || 0))
              );

              return (
                <div
                  key={`${termin.termin_category}-${termin.termin_sequence}`}
                  className="grid grid-cols-[52px_minmax(150px,1fr)_minmax(180px,2fr)_110px] items-center gap-3 border-b px-4 py-3 last:border-b-0"
                >
                  <Typography
                    variant="body"
                    weight="medium"
                    className="text-center text-sm"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Typography>

                  <div className="min-w-0">
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="text-sm"
                    >
                      {termin.termin_category === "termin"
                        ? "Termin"
                        : "Adendum"}{" "}
                      {termin.termin_sequence}
                    </Typography>
                    <Typography
                      variant="label"
                      className="text-muted-foreground block truncate text-xs capitalize"
                    >
                      {termin.termin_label}
                    </Typography>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-dark-gray h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="bg-dark-gray text-primary-foreground min-w-[46px] rounded-full px-2 py-0.5 text-center text-[11px] font-semibold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <Typography
                    variant="label"
                    className="text-muted-foreground text-right text-xs"
                  >
                    {formatNumber(termin.actual_volume)} /{" "}
                    {formatNumber(termin.planned_volume)}
                  </Typography>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
