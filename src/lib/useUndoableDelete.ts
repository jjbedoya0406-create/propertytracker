import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useToast } from "@/components/ToastContext";

interface UseUndoableDeleteOptions<T> {
  queryKey: QueryKey;
  getId: (item: T) => string;
  onCommit: (item: T) => Promise<void>;
  // Shown in the global toast for the duration of the undo window.
  message: string;
  windowMs?: number;
}

// Shared by expenses and income (issue #10): tapping Delete doesn't call
// the real delete right away — it optimistically hides the row and starts
// a timer. Undo cancels the timer and puts the row back; letting the
// window expire fires the actual Sheets delete. The toast itself is
// raised and dismissed here (issue #27's global toast slot) rather than
// by each caller, so callers don't need their own toast-visibility state.
export function useUndoableDelete<T>({
  queryKey,
  getId,
  onCommit,
  message,
  windowMs = 6000,
}: UseUndoableDeleteOptions<T>) {
  const queryClient = useQueryClient();
  const { showToast, dismissToast } = useToast();
  const [pendingItem, setPendingItem] = useState<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function remove(item: T) {
    queryClient.setQueryData<T[]>(queryKey, (old) =>
      (old ?? []).filter((existing) => getId(existing) !== getId(item)),
    );
    setPendingItem(item);
    showToast({ message, onUndo: undo });
    timeoutRef.current = setTimeout(() => {
      setPendingItem(null);
      timeoutRef.current = null;
      dismissToast();
      onCommit(item).catch(() => {
        // The window already closed and the row is gone from the visible
        // list — re-insert it rather than silently losing data on a
        // network hiccup. Rare path, not a retry queue (see plan).
        queryClient.setQueryData<T[]>(queryKey, (old) => [
          ...(old ?? []),
          item,
        ]);
      });
    }, windowMs);
  }

  function undo() {
    if (!pendingItem) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    queryClient.setQueryData<T[]>(queryKey, (old) => [
      ...(old ?? []),
      pendingItem,
    ]);
    setPendingItem(null);
    dismissToast();
  }

  return { pendingItem, remove, undo };
}
