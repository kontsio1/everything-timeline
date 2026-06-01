/**
 * Formats a year number as a BCE/AD/plain string, matching the timeline display convention.
 * null is displayed as "Present".
 */
export const formatYear = (year: number | null): string => {
    if (year === null) return "Present";
    if (year < 0) return `${Math.abs(year)} BCE`;
    if (year > 0 && year <= 1299) return `${year} AD`;
    return year.toString();
};

/**
 * Generates an array of year integers from startYear to endYear (inclusive).
 */
export const generateYearOptions = (startYear: number, endYear: number): number[] =>
    Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

