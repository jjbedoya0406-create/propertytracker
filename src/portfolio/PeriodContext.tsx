import { createContext, useContext, useState, type ReactNode } from "react";
import { currentMonthPeriod, type Period } from "../lib/period";

interface PeriodContextValue {
  period: Period;
  setPeriod: (period: Period) => void;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

// Plain in-memory state, deliberately not persisted to storage — shared
// across every property/building page for the session (issue #22, FR3),
// and resets to the current month on a real reload with no extra code
// (AC7), since there's nothing to clear.
export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>(() => currentMonthPeriod());
  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod(): PeriodContextValue {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriod must be used within PeriodProvider");
  }
  return context;
}
