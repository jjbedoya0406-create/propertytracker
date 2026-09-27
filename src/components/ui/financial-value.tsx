import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { Currency } from "@/types";

// Section 9: one shared component for every money display in the app.
// Wraps the existing formatCurrency exactly as-is — never re-derives the
// number, only adds color/sign/weight/tabular digits on top of it.
export type FinancialValueType =
  | "income"
  | "expense"
  | "net"
  | "list-net"
  | "stat"
  | "supporting"
  | "neutral";

interface FinancialValueProps {
  amount: number;
  currency: Currency;
  type: FinancialValueType;
  className?: string;
  // Hero numbers only (type="net"): stays on one line, shrinks down to a
  // 28px floor instead of wrapping/truncating a long COP value.
  fit?: boolean;
}

function colorClassFor(type: FinancialValueType, amount: number): string {
  switch (type) {
    case "income":
      return "text-mint-text";
    case "expense":
      return "text-red-text";
    case "net":
      return amount < 0 ? "text-red-text" : "text-ink";
    case "list-net":
      if (amount > 0) return "text-mint-text";
      if (amount < 0) return "text-red-text";
      return "text-ink";
    case "stat":
    case "neutral":
      return "text-ink";
    case "supporting":
      return "text-muted-foreground";
  }
}

function signFor(type: FinancialValueType, amount: number): "" | "+" | "-" {
  switch (type) {
    case "income":
      return "+";
    case "expense":
      return "-";
    case "net":
    case "list-net":
      // Section 9: minus sign only when negative, never a plus on positive.
      return amount < 0 ? "-" : "";
    case "stat":
    case "neutral":
    case "supporting":
      return "";
  }
}

function sizeClassFor(type: FinancialValueType): string {
  switch (type) {
    case "net":
      return "text-hero font-semibold";
    case "stat":
      return "text-value font-semibold";
    case "supporting":
      return "text-caption font-normal";
    case "income":
    case "expense":
    case "list-net":
    case "neutral":
      return "text-body-strong font-semibold";
  }
}

// Section 2: hero numbers fit on one line down to a 28px floor rather than
// wrapping or truncating. Ties font-size to the container width via a CSS
// custom property so a long COP amount (e.g. "$12.850.000") shrinks on a
// 360px phone without JS-measured layout thrash on every render.
function useFitToWidth(text: string) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el?.parentElement) return;

    const HERO_PX = 40;
    const MIN_PX = 28;
    el.style.fontSize = `${HERO_PX}px`;
    const available = el.parentElement.clientWidth;
    const needed = el.scrollWidth;
    if (needed <= available) {
      setFontSize(null);
      return;
    }
    const scaled = Math.max(MIN_PX, Math.floor((HERO_PX * available) / needed));
    setFontSize(scaled);
  }, [text]);

  return { ref, fontSize };
}

export function FinancialValue({
  amount,
  currency,
  type,
  className,
  fit = false,
}: FinancialValueProps) {
  const sign = signFor(type, amount);
  const formatted = `${sign}${formatCurrency(Math.abs(amount), currency)}`;
  const { ref, fontSize } = useFitToWidth(fit ? formatted : "");

  return (
    <span
      ref={fit ? ref : undefined}
      className={cn(
        "inline-block tabular-nums whitespace-nowrap",
        colorClassFor(type, amount),
        sizeClassFor(type),
        className,
      )}
      style={fit && fontSize !== null ? { fontSize: `${fontSize}px` } : undefined}
    >
      {formatted}
    </span>
  );
}
