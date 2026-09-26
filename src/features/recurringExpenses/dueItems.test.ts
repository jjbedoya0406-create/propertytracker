import { describe, expect, it } from "vitest";
import { selectDueItems } from "./dueItems";
import type { RecurringExpense } from "../../types";

function item(overrides: Partial<RecurringExpense> = {}): RecurringExpense {
  return {
    recurringExpenseId: "re-1",
    buildingId: "b-1",
    name: "HOA",
    amount: 250,
    categoryId: "cat-1",
    frequency: "monthly",
    nextDueDate: "2026-10-01",
    anchorDay: 1,
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("selectDueItems", () => {
  it("excludes items that aren't due yet", () => {
    const result = selectDueItems([item()], "2026-09-25");
    expect(result).toEqual([]);
  });

  it("includes items due within the window", () => {
    const result = selectDueItems([item()], "2026-09-26");
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("due");
  });

  it("excludes paused and ended items even if their date has passed", () => {
    const paused = item({ recurringExpenseId: "re-2", status: "paused" });
    const ended = item({ recurringExpenseId: "re-3", status: "ended" });
    const result = selectDueItems([paused, ended], "2026-10-05");
    expect(result).toEqual([]);
  });

  it("excludes items in the pending-skip set (issue #24 FR6 — hides immediately, no server round trip)", () => {
    const due = item();
    const result = selectDueItems(
      [due],
      "2026-10-01",
      new Set([due.recurringExpenseId]),
    );
    expect(result).toEqual([]);
  });

  it("sorts overdue items before due items, then by date", () => {
    const overdueLater = item({
      recurringExpenseId: "overdue-later",
      nextDueDate: "2026-09-20",
    });
    const overdueEarlier = item({
      recurringExpenseId: "overdue-earlier",
      nextDueDate: "2026-09-10",
    });
    const due = item({ recurringExpenseId: "due", nextDueDate: "2026-10-01" });
    const result = selectDueItems(
      [due, overdueLater, overdueEarlier],
      "2026-09-26",
    );
    expect(result.map((r) => r.recurringExpense.recurringExpenseId)).toEqual([
      "overdue-earlier",
      "overdue-later",
      "due",
    ]);
  });
});
