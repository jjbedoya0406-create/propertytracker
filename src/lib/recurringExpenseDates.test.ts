import { describe, expect, it } from "vitest";
import { advancePeriod, dueStatus } from "./recurringExpenseDates";

describe("advancePeriod", () => {
  it("adds one month for monthly", () => {
    expect(advancePeriod("2026-09-20", "monthly", 20)).toBe("2026-10-20");
  });

  it("adds three months for quarterly (AC6)", () => {
    expect(advancePeriod("2026-10-03", "quarterly", 3)).toBe("2027-01-03");
  });

  it("rolls over into the next year", () => {
    expect(advancePeriod("2026-12-15", "monthly", 15)).toBe("2027-01-15");
  });

  it("clamps to the last day of a shorter month, then snaps back once a later month has the anchor day again (AC7)", () => {
    // Jan 31 -> Feb 28 -> Mar 31, not Mar 28 — the anchor day (31) must
    // survive being clamped away in February.
    const feb = advancePeriod("2026-01-31", "monthly", 31);
    expect(feb).toBe("2026-02-28");
    const mar = advancePeriod(feb, "monthly", 31);
    expect(mar).toBe("2026-03-31");
  });

  it("clamps to Feb 29 in a leap year", () => {
    expect(advancePeriod("2028-01-31", "monthly", 31)).toBe("2028-02-29");
  });

  it("clamps to Feb 28 in a non-leap year", () => {
    expect(advancePeriod("2026-01-31", "monthly", 31)).toBe("2026-02-28");
  });
});

describe("dueStatus", () => {
  it("is due exactly 5 days before (AC2)", () => {
    expect(dueStatus("2026-10-01", "2026-09-26")).toBe("due");
  });

  it("is not due 6 days before (AC2)", () => {
    expect(dueStatus("2026-10-01", "2026-09-25")).toBe("not-due");
  });

  it("is due on the due date itself", () => {
    expect(dueStatus("2026-10-01", "2026-10-01")).toBe("due");
  });

  it("is overdue the day after the due date (AC3)", () => {
    expect(dueStatus("2026-09-20", "2026-09-25")).toBe("overdue");
  });
});
