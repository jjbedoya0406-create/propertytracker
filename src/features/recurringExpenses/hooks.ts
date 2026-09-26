import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequiredAccessToken } from "../../auth";
import { queryKeys } from "../../api/queryKeys";
import {
  createRecurringExpense,
  listRecurringExpenses,
  updateRecurringExpense,
  type CreateRecurringExpenseInput,
} from "../../data/recurringExpenses";
import { useSpreadsheetId } from "../../portfolio/context";
import type { RecurringExpense } from "../../types";

export function useRecurringExpenses() {
  const accessToken = useRequiredAccessToken();
  const spreadsheetId = useSpreadsheetId();

  return useQuery({
    queryKey: queryKeys.recurringExpenses.list(),
    queryFn: () => listRecurringExpenses(accessToken, spreadsheetId),
  });
}

function useInvalidateRecurringExpenses() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.recurringExpenses.all,
    });
}

export function useCreateRecurringExpense() {
  const accessToken = useRequiredAccessToken();
  const spreadsheetId = useSpreadsheetId();
  const invalidate = useInvalidateRecurringExpenses();

  return useMutation({
    mutationFn: (input: CreateRecurringExpenseInput) =>
      createRecurringExpense(accessToken, spreadsheetId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateRecurringExpense() {
  const accessToken = useRequiredAccessToken();
  const spreadsheetId = useSpreadsheetId();
  const invalidate = useInvalidateRecurringExpenses();

  return useMutation({
    mutationFn: (item: RecurringExpense) =>
      updateRecurringExpense(accessToken, spreadsheetId, item),
    onSuccess: invalidate,
  });
}
