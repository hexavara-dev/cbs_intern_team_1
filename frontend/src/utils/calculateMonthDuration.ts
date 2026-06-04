import { differenceInMonths, parseISO } from "date-fns";

/**
 * Calculates the duration in months between two dates.
 * The calculation is inclusive of the start and end months.
 *
 * @param startDate - The start date string (ISO format)
 * @param endDate - The end date string (ISO format)
 * @returns The number of months as a string, e.g., "6 Bulan"
 */
export const calculateMonthDuration = (
  startDate: string,
  endDate: string
): string => {
  if (!startDate || !endDate) return "-";

  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // differenceInMonths returns the number of full months between two dates.
  // We add 1 to make it inclusive (e.g., Jan to June is 6 months).
  const months = differenceInMonths(end, start) + 1;

  return `${months} Bulan`;
};
