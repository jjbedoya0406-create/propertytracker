import { dueStatus } from "../../lib/recurringExpenseDates";
import type { RecurringExpense } from "../../types";

export interface DueItem {
  recurringExpense: RecurringExpense;
  status: "due" | "overdue";
}

// FR3/FR4: only active items can be due (paused/ended never appear —
// AC10/AC11), a pending skip hides an item immediately with no server
// round trip (FR6 — the actual due-date advance only commits once the
// undo window elapses), and overdue items sort before due ones, then by
// date.
export function selectDueItems(
  items: RecurringExpense[],
  today: string,
  pendingSkipIds: Set<string> = new Set(),
): DueItem[] {
  return items
    .filter(
      (item) =>
        item.status === "active" && !pendingSkipIds.has(item.recurringExpenseId),
    )
    .map((item) => ({ recurringExpense: item, status: dueStatus(item.nextDueDate, today) }))
    .filter(
      (entry): entry is DueItem =>
        entry.status === "due" || entry.status === "overdue",
    )
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "overdue" ? -1 : 1;
      }
      return a.recurringExpense.nextDueDate.localeCompare(
        b.recurringExpense.nextDueDate,
      );
    });
}
