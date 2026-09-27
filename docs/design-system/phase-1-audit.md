# Phase 1 audit: legacy styling and sweep plan

Issue #28 (Ticket 4). No code was changed to produce this — this file is
the only change in this ticket's commit.

## Methodology

Two different levels of detail are used below, deliberately:

- **Rare violations** (hardcoded hex/rgb colors, arbitrary-pixel Tailwind
  values like `text-[13px]`, non-standard icons, emoji) are listed
  **exhaustively, with exact file and line**. There are few enough of
  these that a full list is both possible and useful.
- **The pervasive gap** — screen code still using Tailwind's default type
  scale (`text-sm`, `text-xs`, `font-medium`, ad hoc `<button>`s, `<span>`
  money displays via raw `formatCurrency()`, one-off list rows) instead
  of the Ink type scale and Tickets 2–3's shared components — is
  **counted per file**, with representative examples, rather than listing
  every one of the several hundred individual occurrences. Every screen
  in this app was built before the Ink system existed, so this gap
  exists almost everywhere; a line-by-line inventory of every `text-sm`
  wouldn't be more actionable than the count, and would make this
  document unreviewable. The counts below are exactly what the sweep
  tickets' line-count estimates are built from.

Money displays are audited as "uses `FinancialValue`?" — this app has
25 remaining raw `formatCurrency()` call sites rendered directly in JSX
instead of through the Ticket 2 component (a 26th, in `DueCard.tsx`, is
inside a toast message string, not a render, so it's excluded).

## Prerequisite: a shared-component gap, not a screen issue

**`src/components/ui/card.tsx`** — `CardTitle` (`font-heading text-base
leading-snug font-medium`, line 51), `CardDescription` (`text-sm
text-muted-foreground`, line 63), and the base `Card` element itself
(`text-sm`, line 22) were all left on Tailwind's default scale. Card
wasn't touched in Tickets 2–3 because its *background and radius*
already matched the doc (confirmed in Ticket 2's checkpoint) — nobody
checked its internal typography sub-parts at the time.

This matters more than any single screen: **every screen in the app
renders at least one `Card`**, so this one component is the highest-
leverage fix available. Recommend a tiny standalone ticket (mapping
`CardTitle` → `section`/`title` role, `CardDescription` → `secondary`
role) that runs *before* or *alongside* Sweep A below, the same
"update the shared component once, screens pick it up automatically"
pattern Tickets 1–3 used throughout. Doing it first means the screen
sweeps below don't each need to touch Card usage separately.

## Screen-by-screen audit

Both accounts (English/USD, Spanish/COP) render the same components —
nothing found below is account-specific; string *length* differences
(Spanish running longer) were already checked for the components Ticket
3 touched (nav bar, chip) and are worth re-checking per sweep ticket
where new components get applied to real copy.

### 1. Global shell — `src/routes/Layout.tsx` (28 lines)

- Hardcoded/raw: `text-[13px]` header wordmark (line 14) — an arbitrary
  value that doesn't match any Ink role (13px is closest to `secondary`,
  but this is a brand wordmark, not body text — worth a deliberate call,
  not an automatic map).
- The active-portfolio-label pill (line 19, `bg-secondary
  text-secondary-foreground`) already reads correct shadcn aliases; only
  its `text-xs` size wants mapping to `label`.
- No one-off components beyond typography.
- Size: 2 spots.

### 2. Sign-in — `src/routes/SignInPage.tsx` (35 lines)

- Nothing found. Already 100% shared components (`Card`, `Button`,
  `Alert`, `Separator`) with no manual color/size classes at all — this
  screen is already effectively Ink-ready once the Card fix above lands.
- Size: 0 spots (pending the Card fix).

### 3. Properties list — `src/routes/PropertiesListPage.tsx` (355 lines)

- **Hardcoded hex** (already known, flagged in Ticket 1's report):
  `bg-[#2B3A55]/10` (line 340) and `text-[#2B3A55]` (line 341) — the
  building-row icon chip. `#2B3A55` is the pre-Ink "stamp" navy; the
  `--stamp` token already carries this exact value, so this is a
  mechanical swap to `bg-stamp/10 text-stamp`, not a judgment call.
- Type scale: 11 spots (`text-sm`/`text-xs`/`font-medium`, e.g. building
  and property names, addresses, the empty-state copy).
- Money: 5 raw `formatCurrency()` calls, none through `FinancialValue`
  (property/building list rows show a net figure — these are exactly
  the `list-net` type).
- One-off: the "+ Add property" affordance and per-row actions are
  plain `<button>`/`<Link>`s that should become `Button` `text` variant
  or `IconButton` per Ticket 2's variants.
- Size: ~18 spots.

### 4. Property detail — `src/routes/PropertyDetailPage.tsx` (481 lines)

The largest screen file; renders both the single-unit view and the
multi-unit building overview (issue #15), plus every section below as
children.

- Type scale: 7 spots directly in this file (screen header, unit-tab
  labels).
- **Phase 2 flag — do not touch in Phase 1**: the unit-tab row (line
  ~185–194) is a hand-built segmented control (`bg-primary
  text-primary-foreground` fill on the selected tab), not the doc's
  `Chip` or a real `Tabs` component. A faithful Ink treatment likely
  wants a horizontal `Chip` row or Radix `Tabs`, either of which changes
  markup/keyboard behavior, not just colors — flagging for Phase 2
  rather than deciding here.
- No hardcoded hex or arbitrary-px values of its own (its children —
  `SummarySection`, `DashboardSection`, etc. — carry their own, audited
  separately below).
- Size: ~10 spots directly in this file.

### 5. Property/unit form — `src/features/properties/PropertyForm.tsx` (155 lines)

- Already partly Ink'd in Ticket 3 (the Archive confirmation is now a
  real `Dialog` with `destructive`/`outline` `Button`s).
- Remaining: the "Archive unit" entry-point link (line ~101,
  `text-body-strong text-red-text`) is already token-correct from
  Ticket 3 — nothing left here except the plain `Input`/`Label` usage,
  which is already compliant.
- Size: ~0–2 spots.

### 6. `src/features/buildings/PromotePropertyForm.tsx` (90 lines)

- Type scale: 1 spot.
- Size: 1 spot.

### 7. Building info — `src/routes/BuildingInfoPage.tsx` (285 lines)

- Type scale: 6 spots (header card, unit-count label, empty states).
- Raw px: `bottom-[55px]` (line 272) — already justified in a code
  comment as a real measured height matching `BottomTabBar`, not a
  token gap; leave as-is, don't "fix" it into a token that doesn't
  exist.
- One-off: the pencil-edit `IconButton` opportunity on the building
  name header (currently a plain `<button>` + `Pencil` icon).
- Size: ~7 spots.

### 8. `src/features/buildings/EditBuildingForm.tsx` (93 lines) / `src/features/buildings/AddUnitForm.tsx` (72 lines)

- Both are already close to compliant (`Input`/`Label`/`Button` only);
  spot-check found no hardcoded colors. Minor `text-sm` labels remain
  in each.
- Size: ~2 spots each.

### 9. Recurring expenses section — `src/features/recurringExpenses/RecurringExpensesSection.tsx` (85 lines)

- Type scale: 4 spots.
- Money: 1 raw `formatCurrency()` (line 60) not through
  `FinancialValue` — this is exactly `DueCard`'s sibling list (all
  recurring expenses, not just due ones) and should get the same
  `neutral`/`list-net` treatment `DueCard` already has.
- One-off: each row is list-row shaped already (name, frequency,
  amount, paused badge) — a strong `ListRow` candidate, and unlike
  Expenses/Income below, **these rows already navigate on tap** (to
  the edit route), so adopting `ListRow`'s tappable mode is a pure
  visual change here, not a Phase 2 flag.
- Size: ~6 spots.

### 10. Recurring expense form — `src/routes/RecurringExpenseFormPage.tsx` (442 lines)

- Already partly Ink'd in Ticket 3 (the End confirmation is a real
  `Dialog`).
- Type scale: 5 remaining spots (screen header, frequency segmented
  control labels).
- One-off: the frequency picker (monthly/quarterly) is another
  hand-built segmented control, same shape as PropertyDetailPage's
  unit tabs — same Phase 2 flag applies if a real `Chip`/`Tabs`
  treatment is wanted; a plain color/token pass (no restructure) is
  fine for Phase 1.
- Size: ~7 spots.

### 11. `src/features/recurringExpenses/ConfirmRecurringExpenseSheet.tsx` (199 lines)

- Already inherits the Ticket 3 `BottomSheet` styling automatically.
- Type scale + money spots inside its own content not yet counted
  precisely; spot check found `text-sm`/`font-medium` on the amount and
  date fields, and its confirm amount is a raw `formatCurrency()`-style
  input, not `FinancialValue` (this one is arguably out of scope for a
  read-only `FinancialValue` swap, since it's an *editable* amount
  field — flag as a judgment call for whoever sweeps this file, not a
  Phase 2 blocker).
- Size: ~5 spots.

### 12. Period picker — `src/features/properties/PeriodPickerSheet.tsx` (153 lines)

- The trigger `Chip` itself is already done (Ticket 3). The sheet's
  *body* (year nav, the 12-month grid, the "All of [year]" button) still
  uses `text-sm`/`text-lg font-medium` (5 spots) and plain `<button>`s
  for month cells that could become `Chip` or a dedicated grid cell
  style.
- Size: ~5 spots.

### 13. Expenses section — `src/features/expenses/ExpensesSection.tsx` (252 lines)

- Type scale: 5 spots.
- Money: 3 raw `formatCurrency()` calls (running total, per-row amount)
  — the per-row amount is a straightforward `expense`/`neutral`
  `FinancialValue` swap.
- **Phase 2 flag**: rows don't navigate anywhere — tapping opens an
  inline edit form in place, and per-row actions live in a kebab
  (`MoreVertical`) dropdown menu. `ListRow`'s *tappable, chevron-right*
  mode assumes navigation, which this isn't. A **non-tappable** `ListRow`
  (title/supporting-line left, `FinancialValue` + existing dropdown on
  the right) is a legitimate Phase 1 visual swap; making the whole row
  open the edit form (replacing the kebab menu) would be a behavior
  change and is out of scope here.
- Size: ~9 spots.

### 14. `src/features/expenses/ExpenseForm.tsx` (452 lines) / `ExpenseEditForm.tsx` (156 lines)

- Type scale: 7 spots in `ExpenseForm` (labels, the receipt-attachment
  copy, the currency-aware amount input's helper text); `ExpenseEditForm`
  not separately counted but is structurally the same form, smaller.
- Already uses shared `Input`/`Label`/`Select`/`Button` throughout — no
  raw HTML form controls, no hardcoded colors.
- Size: ~9 spots combined.

### 15. `src/features/expenses/ReceiptCaptureInput.tsx` (193 lines)

- Type scale: 5 spots.
- **Note, not a Phase 2 flag**: uses a raw `<input type="file">` (line
  found via grep) — file inputs render their own OS/browser chrome that
  can't be fully re-skinned; only the surrounding label/button/preview
  chrome can move to Ink tokens. Worth calling out so the sweep doesn't
  chase an unachievable "no raw `<input>`" goal here.
- Size: ~5 spots.

### 16. Income section — `src/features/income/IncomeSection.tsx` (424 lines)

- Type scale: 12 spots — the largest single count of any file in the
  app (year/month grouping headers, per-entry rows, empty states).
- Money: 5 raw `formatCurrency()` calls.
- Same `ListRow` non-tappable / kebab-menu shape and Phase 2 caveat as
  Expenses above (they were built as a matched pair).
- Size: ~17 spots — the single largest sweep item; see Sweep D sizing
  below.

### 17. `src/features/income/IncomeForm.tsx` (118 lines) / `IncomeEditForm.tsx` (121 lines)

- Structurally identical to the Expense forms; not separately counted
  in detail, estimate ~5 spots each by analogy.
- Size: ~10 spots combined.

### 18. Tenancy section — `src/features/tenancies/TenancySection.tsx` (190 lines) / `TenancyForm.tsx` (119 lines)

- Type scale: 4 spots in the section; form not separately counted
  (small, `Input`/`Label`/date-input only, no colors).
- Size: ~6 spots combined.

### 19. Closed years — `src/features/closedYears/ClosedYearsSection.tsx` (127 lines)

- Type scale: 4 spots.
- Already picked up the Ticket 2 `Button` `destructive` solid-fill
  automatically (the "Close year" confirm button) — no action needed
  there.
- Size: 4 spots.

### 20. Summary — `src/features/summary/SummarySection.tsx` (125 lines)

- Type scale: 2 spots.
- Money: 6 raw `formatCurrency()` calls (Income/Expenses/Net rows,
  building-vs-unit breakdown) — the clearest, most concentrated
  `FinancialValue` opportunity in the app: `income`, `expense`, and
  `net` types map onto this file's rows almost one-to-one.
- **Phase 2 flag**: this is also the screen's closest existing analog to
  a `HeroCard`/`StatTile` layout (net figure + income/expense pair) —
  Ticket 2 deliberately didn't force `HeroCard` onto it since Summary's
  current layout is a plain list, not a hero card. Restructuring it
  into a real `HeroCard` is a layout change; a pure `FinancialValue`
  color/sign swap on the existing list rows is not, and is what Phase 1
  should do here.
- Size: ~8 spots.

### 21. Dashboard — `src/features/dashboard/DashboardSection.tsx` (186 lines) / `DonutChart.tsx`

- Type scale: 8 spots.
- Money: 2 raw `formatCurrency()` calls.
- **Known exception, not a bug**: `DonutChart.tsx`'s five categorical
  colors (`#2F5233` old ledger green, `#A13D2F`, `#B8862E`, `#4E6E8E`,
  `#9C9186`) are hardcoded and include the pre-Ink green. Already
  identified and accepted in Ticket 1's final report: the Ink doc
  doesn't define a categorical palette with enough distinct hues for a
  multi-slice chart, so this is a deliberate, documented exception, not
  something a sweep ticket should "fix" by guessing new colors. If a
  categorical chart palette is ever added to the doc, this is where it
  would land.
- Size: ~10 spots (excluding the chart palette exception).

### 22. Capture — `src/routes/CapturePage.tsx` (small)

- Minimal findings — mostly composes other already-covered forms
  (`ExpenseForm`, `ReceiptCaptureInput`). ~1 spot of its own.
- Size: 1 spot.

### 23. Categories — `src/routes/CategoriesListPage.tsx` (187 lines)

- Type scale: 3 spots (`text-xl font-medium` screen title, line 53;
  `font-medium` category name, line 96).
- Size: 3 spots.

### 24. Settings — `src/routes/SettingsPage.tsx` (small)

- Type scale: 2 spots (`text-xl font-medium` screen title, line 30).
- Size: 2 spots.

### 25. Historical import — `src/features/historicalImport/HistoricalImportSection.tsx` (295 lines)

- Type scale: 13 spots — second-largest count after Income.
- Raw px: `w-[180px]` (line 155, a `SelectTrigger` width — not a color
  or type-scale issue, just an arbitrary width; low priority).
- **Note, not a Phase 2 flag**: also uses a raw `<select>`/`<input>`
  (CSV column-mapping controls) alongside the shared `Select` — same
  native-chrome caveat as `ReceiptCaptureInput` above.
- Size: ~14 spots.

### 26. Drive migration — `src/features/driveMigration/DriveMigrationSection.tsx` (148 lines)

- Type scale: 9 spots.
- Size: 9 spots.

### 27. Connect portfolio — `src/features/connectedPortfolios/ConnectPortfolioForm.tsx` (115 lines)

- Not individually counted; small form (`Input`/`Label`/`Button` only),
  estimate ~3 spots by file size and pattern consistency with similar
  forms.
- Size: ~3 spots.

### 28. Bottom navigation / "More" sheet — `src/components/BottomTabBar.tsx` (14 spots remaining)

- The nav bar itself (icons, background, active/inactive color, tab
  labels) is **done** — Ticket 3.
- The **sheet's inner content** — portfolio-switcher rows, the
  Categories/Settings links, Sign out — is not: 14 remaining
  `text-sm`/`text-xs`/`font-medium` spots. These rows already
  navigate/select on tap, making them a clean `ListRow` (tappable mode)
  candidate, same reasoning as Recurring Expenses above.
- Size: 14 spots.

### Already fully done (Tickets 1–3), no sweep needed

`DueCard.tsx`, the `More`/period-picker/recurring-confirm `Sheet` shells
themselves, `Card`'s background/radius, `Badge`, `Button`, `Input`,
`Select`, `Label`, the Archive/End `Dialog`s, `Toast`, the bottom nav
bar's own bar (not its sheet content).

## Phase 2 candidates (layout/behavior changes — do not do these in Phase 1)

1. **Unit-tab segmented control** (`PropertyDetailPage.tsx`) and the
   **frequency segmented control** (`RecurringExpenseFormPage.tsx`) —
   hand-built tab rows; a faithful Ink treatment likely wants `Chip` or
   real `Tabs`, which changes markup/keyboard behavior beyond a color
   swap.
2. **Expenses/Income rows becoming fully tappable** — today they expand
   an inline edit form and use a kebab-menu for actions; making the
   whole row navigate (matching `ListRow`'s tappable/chevron mode
   exactly) would replace that interaction, not just its colors. The
   non-tappable `ListRow` shell is fine for Phase 1; the interaction
   change is not.
3. **Summary → `HeroCard`/`StatTile` restructure** — Summary's net
   figure and income/expense pair are laid out as a plain list today.
   Moving them into an actual `HeroCard` (as `HeroCard`/`StatTile` were
   designed for) is a layout change; recoloring the existing list rows
   with `FinancialValue` is not.
4. **`DonutChart`'s categorical palette** — not a layout/behavior
   change, but a genuine token gap: the doc has no multi-hue
   categorical palette, so this is left out of every sweep ticket
   below rather than silently "fixed" with invented colors.

## Proposed sweep tickets

Each groups 3–6 screens/views and stays well under ~300 changed lines
(these are class-string swaps, not rewrites — the per-file "spot"
counts above are a closer proxy for changed-line count than the files'
total line counts). Every screen/view from the audit above appears in
exactly one ticket.

| Ticket | Screens/views | Est. spots |
|---|---|---|
| **Sweep A** — Shell & simple screens | Layout, SignInPage, SettingsPage, CategoriesListPage | ~7 |
| **Sweep B** — Properties | PropertiesListPage, PropertyDetailPage, PropertyForm, PromotePropertyForm | ~29 (+ the hex-color fix) |
| **Sweep C** — Building & recurring expenses | BuildingInfoPage, EditBuildingForm, AddUnitForm, RecurringExpensesSection, RecurringExpenseFormPage, ConfirmRecurringExpenseSheet, PeriodPickerSheet | ~36 |
| **Sweep D** — Money lists (Expenses & Income) | ExpensesSection, ExpenseForm, ExpenseEditForm, ReceiptCaptureInput, IncomeSection, IncomeForm, IncomeEditForm | ~50 (largest sweep — mostly Income's 17) |
| **Sweep E** — Remaining building-page sections | TenancySection, TenancyForm, ClosedYearsSection, SummarySection, DashboardSection | ~22 |
| **Sweep F** — Utility flows & nav shell content | CapturePage, HistoricalImportSection, DriveMigrationSection, ConnectPortfolioForm, BottomTabBar's More-sheet content | ~30 |

Recommend running the **Card typography fix** (see "Prerequisite"
above) before or alongside Sweep A, since every sweep ticket after it
benefits from Card already being correct.

## Verification

No code was changed. `git status` shows only this new file
(`docs/design-system/phase-1-audit.md`) added.
