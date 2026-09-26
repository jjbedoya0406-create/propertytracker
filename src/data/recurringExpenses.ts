import { appendValues, getValues, updateValues } from "../api/sheets/client";
import type { RecurringExpense } from "../types";

// Matches the Recurring tab shape (issue #24): recurring_expense_id,
// building_id, name, amount, category_id, frequency, next_due_date,
// anchor_day, status, created_at. Row 1 is the header (written once in
// data/portfolio.ts), data starts at row 2.
const SHEET_NAME = "Recurring";
const DATA_RANGE = `${SHEET_NAME}!A2:J`;

function rowToRecurringExpense(row: unknown[]): RecurringExpense {
  const [
    recurringExpenseId,
    buildingId,
    name,
    amount,
    categoryId,
    frequency,
    nextDueDate,
    anchorDay,
    status,
    createdAt,
  ] = row as [
    string,
    string,
    string,
    number,
    string,
    string,
    string,
    number,
    string,
    string,
  ];
  return {
    recurringExpenseId,
    buildingId,
    name,
    amount: Number(amount) || 0,
    categoryId,
    frequency: frequency === "quarterly" ? "quarterly" : "monthly",
    nextDueDate,
    anchorDay: Number(anchorDay) || 1,
    status:
      status === "paused" || status === "ended" ? status : "active",
    createdAt,
  };
}

function recurringExpenseToRow(item: RecurringExpense): unknown[] {
  return [
    item.recurringExpenseId,
    item.buildingId,
    item.name,
    item.amount,
    item.categoryId,
    item.frequency,
    item.nextDueDate,
    item.anchorDay,
    item.status,
    item.createdAt,
  ];
}

export async function listRecurringExpenses(
  accessToken: string,
  spreadsheetId: string,
): Promise<RecurringExpense[]> {
  const { values } = await getValues(accessToken, spreadsheetId, DATA_RANGE);
  return (values ?? [])
    .filter((row) => Array.isArray(row) && row[0])
    .map(rowToRecurringExpense);
}

export interface CreateRecurringExpenseInput {
  buildingId: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: RecurringExpense["frequency"];
  nextDueDate: string;
  anchorDay: number;
}

export async function createRecurringExpense(
  accessToken: string,
  spreadsheetId: string,
  input: CreateRecurringExpenseInput,
): Promise<RecurringExpense> {
  const item: RecurringExpense = {
    recurringExpenseId: crypto.randomUUID(),
    status: "active",
    createdAt: new Date().toISOString(),
    ...input,
  };
  await appendValues(accessToken, spreadsheetId, DATA_RANGE, [
    recurringExpenseToRow(item),
  ]);
  return item;
}

// Sheets edits target a row number, not an ID, so every write first
// locates the item's current row — same tradeoff as buildings.ts/
// properties.ts.
async function findRecurringExpenseRowNumber(
  accessToken: string,
  spreadsheetId: string,
  recurringExpenseId: string,
): Promise<number> {
  const { values } = await getValues(accessToken, spreadsheetId, DATA_RANGE);
  const index = (values ?? []).findIndex(
    (row) => row[0] === recurringExpenseId,
  );
  if (index === -1) {
    throw new Error(`Recurring expense ${recurringExpenseId} not found`);
  }
  return index + 2; // +1 for 1-indexing, +1 for the header row
}

export async function updateRecurringExpense(
  accessToken: string,
  spreadsheetId: string,
  item: RecurringExpense,
): Promise<void> {
  const rowNumber = await findRecurringExpenseRowNumber(
    accessToken,
    spreadsheetId,
    item.recurringExpenseId,
  );
  await updateValues(
    accessToken,
    spreadsheetId,
    `${SHEET_NAME}!A${rowNumber}:J${rowNumber}`,
    [recurringExpenseToRow(item)],
  );
}
