import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";

export type ChartDataPoint = {
  date: string;
  planned: number;
  actual: number | null;
  plannedAccumulated: number;
  actualAccumulated: number | null;
};

export const generateTimeBuckets = (
  startDate: Date,
  endDate: Date,
  interval: "week" | "month"
) => {
  const options = { weekStartsOn: 1 as const };

  if (interval === "week") {
    return eachWeekOfInterval({ start: startDate, end: endDate }, options);
  } else {
    return eachMonthOfInterval({ start: startDate, end: endDate });
  }
};

/**
 * Generates an idealized S-curve for planned progress.
 * @param steps Total number of steps (time buckets)
 * @returns Array of numbers representing cumulative percentage (0 to 100)
 */
const generateSCurveProfile = (steps: number) => {
  const profile = [];
  const midpoint = steps / 2;
  const steepness = 4 / steps; // Basic sigmoid shape adjustment

  for (let i = 0; i < steps; i++) {
    const x = i - midpoint;
    const sigmoid = 1 / (1 + Math.exp(-steepness * x));
    profile.push(sigmoid);
  }

  const min = profile[0];
  const max = profile[profile.length - 1];

  return profile.map((v) => ((v - min) / (max - min)) * 100);
};

export const generateChartData = (
  startDateStr: string,
  endDateStr: string,
  totalVolume: number,
  currentActualVolume: number,
  interval: "week" | "month"
): ChartDataPoint[] => {
  const startDate = startOfDay(new Date(startDateStr));
  const endDate = startOfDay(new Date(endDateStr));
  const today = startOfDay(new Date());

  if (
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime()) ||
    startDate > endDate
  ) {
    return [];
  }

  const buckets = generateTimeBuckets(startDate, endDate, interval);
  const sCurveProfile = generateSCurveProfile(buckets.length);

  let todayIndex = buckets.findIndex((b) => isAfter(b, today));
  if (todayIndex === -1) todayIndex = buckets.length; // Past end date
  if (todayIndex === 0 && isBefore(today, startDate)) todayIndex = 0; // Future project

  const data: ChartDataPoint[] = buckets.map((date, index) => {
    const dateStr = format(
      date,
      interval === "week" ? "dd MMM yyyy" : "MMM yyyy"
    );

    const plannedPct = sCurveProfile[index];
    const plannedAccumulated = (plannedPct / 100) * totalVolume;

    let actualAccumulated: number | null = null;

    if (index < todayIndex) {
      if (todayIndex <= 1) {
        actualAccumulated = currentActualVolume;
      } else {
        actualAccumulated = (index / (todayIndex - 1)) * currentActualVolume;
      }
    }

    return {
      date: dateStr,
      planned: 0,
      actual: 0,
      plannedAccumulated,
      actualAccumulated: actualAccumulated,
    };
  });

  return data;
};
