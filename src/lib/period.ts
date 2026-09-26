import type { Language } from "../types/settings";

// Issue #22: a single period control replaces the separate year picker
// in Summary and month picker in Dashboard — every section on a page
// now follows the same Period.
export type Period =
  | { kind: "year"; year: number }
  | { kind: "month"; year: number; month: number };

export function currentMonthPeriod(now: Date = new Date()): Period {
  return { kind: "month", year: now.getFullYear(), month: now.getMonth() + 1 };
}

// Matches the "YYYY-MM-DD" date strings stored throughout this app —
// dates are never parsed into a Date/local time here, so this stays
// timezone-safe by construction (no conversion to compare against).
export function periodToPrefix(period: Period): string {
  return period.kind === "year"
    ? String(period.year)
    : `${period.year}-${String(period.month).padStart(2, "0")}`;
}

export function isFutureMonth(
  year: number,
  month: number,
  now: Date = new Date(),
): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month > currentMonth);
}

// The picker's "previous year" arrow stops here — never earlier than
// the scope's own oldest transaction, and never later than the current
// year even if a record's date is oddly in the future.
export function earliestYearWithData(
  entries: { date: string }[],
  currentYear: number = new Date().getFullYear(),
): number {
  const years = entries
    .map((entry) => Number(entry.date.slice(0, 4)))
    .filter((year) => Number.isFinite(year));
  return Math.min(currentYear, ...years, currentYear);
}

// Hardcoded rather than Intl-derived — Intl's Spanish abbreviations
// include a trailing period ("ene."), which doesn't match issue #22's
// spec text (FR8: "Ene, Feb, Mar, ...").
export const MONTH_ABBREVIATIONS: Record<Language, string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
};

// One formatter reused for the header chip and every "Showing {period}"
// / "Top category in {period}" sentence — FR8's Spanish chip example
// ("sep 2026") is lowercase, so the month form lowercases for es.
export function formatPeriodLabel(period: Period, language: Language): string {
  if (period.kind === "year") {
    return String(period.year);
  }
  const abbreviation = MONTH_ABBREVIATIONS[language][period.month - 1];
  const label = `${abbreviation} ${period.year}`;
  return language === "es" ? label.toLowerCase() : label;
}
