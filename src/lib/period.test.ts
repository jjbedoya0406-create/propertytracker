import { describe, expect, it } from "vitest";
import {
  earliestYearWithData,
  formatPeriodLabel,
  isFutureMonth,
  periodToPrefix,
  type Period,
} from "./period";

describe("periodToPrefix", () => {
  it("formats a year period", () => {
    expect(periodToPrefix({ kind: "year", year: 2026 })).toBe("2026");
  });

  it("formats a month period, zero-padded", () => {
    expect(periodToPrefix({ kind: "month", year: 2026, month: 9 })).toBe(
      "2026-09",
    );
    expect(periodToPrefix({ kind: "month", year: 2026, month: 12 })).toBe(
      "2026-12",
    );
  });
});

describe("isFutureMonth", () => {
  const now = new Date(2026, 8, 15); // Sep 15, 2026

  it("is false for the current month", () => {
    expect(isFutureMonth(2026, 9, now)).toBe(false);
  });

  it("is false for a past month in the current year", () => {
    expect(isFutureMonth(2026, 3, now)).toBe(false);
  });

  it("is true for a later month in the current year", () => {
    expect(isFutureMonth(2026, 10, now)).toBe(true);
  });

  it("is true for any month in a future year", () => {
    expect(isFutureMonth(2027, 1, now)).toBe(true);
  });

  it("is false for any month in a past year", () => {
    expect(isFutureMonth(2025, 12, now)).toBe(false);
  });
});

describe("earliestYearWithData", () => {
  it("returns the current year when there's no data", () => {
    expect(earliestYearWithData([], 2026)).toBe(2026);
  });

  it("returns the earliest year found in the data", () => {
    expect(
      earliestYearWithData(
        [{ date: "2024-03-01" }, { date: "2025-01-01" }, { date: "2026-06-01" }],
        2026,
      ),
    ).toBe(2024);
  });

  it("never returns later than the current year even if data is oddly in the future", () => {
    expect(earliestYearWithData([{ date: "2027-01-01" }], 2026)).toBe(2026);
  });
});

describe("formatPeriodLabel", () => {
  const year: Period = { kind: "year", year: 2026 };
  const month: Period = { kind: "month", year: 2026, month: 9 };

  it("formats a year the same in both languages", () => {
    expect(formatPeriodLabel(year, "en")).toBe("2026");
    expect(formatPeriodLabel(year, "es")).toBe("2026");
  });

  it("formats a month in English as capitalized abbreviation + year", () => {
    expect(formatPeriodLabel(month, "en")).toBe("Sep 2026");
  });

  it("formats a month in Spanish as lowercase abbreviation + year", () => {
    expect(formatPeriodLabel(month, "es")).toBe("sep 2026");
  });
});
