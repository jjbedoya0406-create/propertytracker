export type RecurringExpenseFrequency = "monthly" | "quarterly";
export type RecurringExpenseStatus = "active" | "paused" | "ended";

export interface RecurringExpense {
  recurringExpenseId: string;
  buildingId: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: RecurringExpenseFrequency;
  nextDueDate: string;
  // The day-of-month originally intended (e.g. 31) — kept separate from
  // nextDueDate specifically so it survives being clamped for a shorter
  // month (issue #24, AC7: Jan 31 -> Feb 28 -> Mar 31, not Mar 28). Set
  // at creation, updated only if the user manually edits the due date.
  anchorDay: number;
  status: RecurringExpenseStatus;
  createdAt: string;
}
