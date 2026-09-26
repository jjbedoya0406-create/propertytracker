import type { Language } from "../types/settings";

// Issue #24: date math for recurring building expenses. Everything here
// works on plain "YYYY-MM-DD" strings and explicit y/m/d components —
// never a bare `new Date(dateString)` parse or a Date-to-Date diff — so
// it stays timezone-safe by construction, matching every other date
// calculation in this app.

export type RecurringExpenseFrequency = "monthly" | "quarterly";

// JS Date months are 0-indexed, so `new Date(year, month, 0)` lands on
// day 0 of `month` (1-12 here) — i.e. the last real day of the *previous*
// index, which is `month` in our 1-12 numbering. Local constructor +
// local getter, used consistently, so there's no UTC/local mismatch.
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// FR7: +1 month (monthly) or +3 months (quarterly), targeting `anchorDay`
// — the day-of-month originally intended (e.g. 31), stored separately
// from `next_due_date` specifically so it survives being clamped away.
// Without it, Jan 31 -> Feb 28 -> Mar 28 would be wrong (AC7 requires
// Mar 31): once "31" is clamped to "28" for February, nothing about the
// string "2026-02-28" alone can recover the original 31.
export function advancePeriod(
  dueDate: string,
  frequency: RecurringExpenseFrequency,
  anchorDay: number,
): string {
  const [yearStr, monthStr] = dueDate.split("-");
  let year = Number(yearStr);
  let month = Number(monthStr) + (frequency === "monthly" ? 1 : 3);

  while (month > 12) {
    month -= 12;
    year += 1;
  }

  const day = Math.min(anchorDay, daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type DueStatus = "not-due" | "due" | "overdue";

const DUE_WINDOW_DAYS = 5;

// Calendar-day difference via Date.UTC (not a local-time Date diff, which
// could be thrown off by a DST transition between the two dates) — both
// inputs are pure calendar dates with no time-of-day component, so UTC
// midnight is just a stable, DST-proof integer axis to diff on.
function dayNumber(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

// FR3: due from 5 days before the next due date; overdue once it's
// passed without being confirmed or skipped. `today` is always passed
// in (never computed internally) so this is directly testable against
// exact AC dates and so it reflects the user's own local calendar date.
export function dueStatus(nextDueDate: string, today: string): DueStatus {
  const daysUntilDue = dayNumber(nextDueDate) - dayNumber(today);
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= DUE_WINDOW_DAYS) return "due";
  return "not-due";
}

// The user's local calendar date as "YYYY-MM-DD" — explicit local
// getters, never `toISOString().slice(0, 10)` (which reads the UTC
// date, off by one from local near midnight in most of this app's
// timezones). This is what "today" means everywhere in this feature.
export function localToday(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "2026-10-03" -> "Oct 3" / "3 oct" — the mockup's own "next Oct 3" /
// "due Sep 20" format (AC1, screenshot), not the raw ISO string. Built
// via explicit y/m/d components passed to a local Date, same pattern as
// lib/monthLabel.ts, to avoid any timezone-shift ambiguity.
export function formatShortDate(date: string, language: Language): string {
  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  const locale = language === "es" ? "es-CO" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(localDate);
}
