import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinancialValue } from "./financial-value";

// Covers issue #26's own acceptance criteria examples exactly.
describe("FinancialValue", () => {
  it("shows a leading + in mint-text for income", () => {
    render(<FinancialValue type="income" amount={1200} currency="USD" />);
    const el = screen.getByText("+$1,200.00");
    expect(el).toHaveClass("text-mint-text");
  });

  it("shows a leading - in red-text for a negative list-net", () => {
    render(<FinancialValue type="list-net" amount={-150} currency="USD" />);
    const el = screen.getByText("-$150.00");
    expect(el).toHaveClass("text-red-text");
  });

  it("shows no sign for a positive list-net, colored mint-text", () => {
    render(<FinancialValue type="list-net" amount={150} currency="USD" />);
    const el = screen.getByText("$150.00");
    expect(el).toHaveClass("text-mint-text");
  });

  it("shows a zero list-net in ink with no sign", () => {
    render(<FinancialValue type="list-net" amount={0} currency="USD" />);
    const el = screen.getByText("$0.00");
    expect(el).toHaveClass("text-ink");
  });

  it("shows a leading - in red-text for a negative net (hero), no + on positive", () => {
    const { rerender } = render(
      <FinancialValue type="net" amount={-473.97} currency="USD" />,
    );
    expect(screen.getByText("-$473.97")).toHaveClass("text-red-text");

    rerender(<FinancialValue type="net" amount={500} currency="USD" />);
    expect(screen.getByText("$500.00")).toHaveClass("text-ink");
  });

  it("never repeats a sign for stat/neutral/supporting types", () => {
    render(
      <>
        <FinancialValue type="stat" amount={2500} currency="USD" />
        <FinancialValue type="neutral" amount={500} currency="USD" />
        <FinancialValue type="supporting" amount={75} currency="USD" />
      </>,
    );
    expect(screen.getByText("$2,500.00")).toHaveClass("text-ink");
    expect(screen.getByText("$500.00")).toHaveClass("text-ink");
    expect(screen.getByText("$75.00")).toHaveClass("text-muted-foreground");
  });

  it("formats COP amounts identically to before this ticket (no decimals, period thousands separator)", () => {
    render(<FinancialValue type="expense" amount={430000} currency="COP" />);
    // es-CO's Intl.NumberFormat inserts a non-breaking space between the
    // symbol and amount (same as currency.test.ts) — match loosely so the
    // exact whitespace character isn't what this test is about.
    expect(screen.getByText(/^-\$\s*430\.000$/)).toHaveClass("text-red-text");
  });
});
