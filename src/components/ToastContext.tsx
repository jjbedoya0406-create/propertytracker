import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "./Toast";

interface ToastState {
  message: string;
  onUndo?: () => void;
}

interface ToastContextValue {
  showToast: (toast: ToastState) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Section 6/issue #27: a single global toast slot, mounted once above the
// router, so any Sheet or Dialog opening can dismiss it regardless of
// which screen or feature raised it — previously every feature (Expenses,
// Income, DueCard, BuildingInfoPage) rendered its own <Toast> tied to its
// own local state, so only the one call site that remembered to clear it
// (DueCard, issue #24 FR8a) actually did. This replaces all of those with
// one shared instance; Sheet and Dialog call dismissToast() themselves
// when they open (see sheet.tsx/dialog.tsx), so callers don't have to.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((next: ToastState) => setToast(next), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <Toast message={toast.message} onUndo={toast.onUndo} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
