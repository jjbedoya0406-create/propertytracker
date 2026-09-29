# Phase 1 sign-off report: "Ink" design system

Issue #33 (Ticket 5) — final cleanup, verification, and Section 19
report for the whole Phase 1 arc (issues #25–#33).

## Changed

**Tokens & global setup** (`src/index.css`, `index.html`, `vite.config.ts`):
Section 1 color tokens, Section 2 type scale, Section 3 spacing
(Tailwind's default 4px scale already matched, confirmed rather than
re-implemented), Section 4 radius, Section 16 PWA/manifest colors.
IBM Plex Sans self-hosted and added to the service worker precache.

**New shared components** (`src/components/ui/`, `src/lib/`):
`financial-value.tsx` (+ tests), `icon-button.tsx`, `date-input.tsx`,
`hero-card.tsx`, `stat-tile.tsx`, `list-row.tsx`, `dialog.tsx`,
`typography.ts` (the Text role scale), `ToastContext.tsx` (the global
toast/dismiss-on-sheet-open registry).

**Existing shared components updated in place**: `button.tsx`,
`badge.tsx`, `card.tsx`, `input.tsx`, `select.tsx`, `label.tsx`,
`textarea.tsx`, `sheet.tsx`, `tabs.tsx`, `Toast.tsx`,
`CollapsibleSectionCard.tsx`, `BottomTabBar.tsx`.

**Screens migrated**: Portfolio List (`PropertiesListPage.tsx`,
issue #29), Building Detail (`BuildingInfoPage.tsx`, issue #30), Unit
Detail (`PropertyDetailPage.tsx`, issue #31), Capture
(`CapturePage.tsx`, `ExpenseForm.tsx`, `ReceiptCaptureInput.tsx`,
issue #32), plus their supporting sections and forms
(`SummarySection.tsx`, `TenancySection.tsx`,
`RecurringExpensesSection.tsx`, `RecurringExpenseFormPage.tsx`,
`PeriodPickerSheet.tsx`, `PropertyForm.tsx`, `DueCard.tsx`,
`ClosedYearsSection.tsx`, `ExpensesSection.tsx`, `IncomeSection.tsx`,
`CategoriesListPage.tsx`, `Layout.tsx`).

**This ticket's own cleanup**: `Layout.tsx`'s header wordmark
(`text-[13px]` → `text-caption`), `badge.tsx`'s focus ring
(`ring-[3px]` → `ring-3`, a no-op syntax normalization).

45 files changed in `src/` across the arc (2,149 insertions, 740
deletions) — see `git log f3a3ad4..HEAD` for the full commit history.

## Tokens

All in `src/index.css`:
- Color, spacing, radius, and shadow/scrim tokens live in `:root`.
- Every token is re-exposed as a Tailwind utility (`bg-ink`,
  `text-red-text`, `rounded-xl`→`radius-card`, `shadow-sheet`, etc.)
  in the `@theme inline` block directly below `:root`, so component
  files reference them by class name rather than `var()`.
- The Section 2 type scale is exposed the same way
  (`--text-hero`/`--text-hero--line-height`, etc.) — except the
  `secondary` role, which had to be named `text-caption` in Tailwind
  (not `text-secondary`) because that name collides with the
  pre-existing shadcn `--color-secondary` alias; see "Remaining" for
  why this collision was real, not theoretical.

## Components standardized

Every component in the doc's Section 14 list has been built and is in
active use on at least one real screen: `Text` (as `typography.ts`,
not a wrapping component — see reasoning in issue #27), `SectionHeader`
(via `CollapsibleSectionCard`), `ListRow`, `Chip` (via `Tabs` and the
period-picker trigger), `Button` (all 5 variants + the `full`
52px size), `IconButton`, `Input`, `Select`, `DateInput`, `Divider`
(the pre-existing `Separator` already matched, confirmed not rebuilt),
`Badge` (4 status variants), `FinancialValue` (all 7 types),
`Card`/`HeroCard`/`StatTile`/`DueCard`, `BottomSheet` (the shared
`Sheet`), `Dialog`, `Toast`, `BottomNavigation`.

## Remaining

Left untouched, each for a specific, documented reason — not oversights:

1. **`DonutChart.tsx`'s categorical chart palette** (5 hardcoded hex
   values, including the old ledger green `#2F5233`). The Ink doc
   defines no multi-hue categorical scale, so there is no token to map
   this array to. Flagged and accepted in Ticket 1; unchanged since.
2. **The app icon** (`assets-src/icon-master.svg`, `public/favicon.svg`,
   the PNG icons). This ticket explicitly forbids redesigning it. For
   the record, direct inspection shows it actually uses `#2B3A55`
   (stamp navy — coincidentally already has a real token, `--stamp`)
   and `#EFF3EC` (an old pale-sage background, not literally the
   ledger green `#2F5233` earlier reports assumed).
3. **`LoggedStamp.tsx`'s `text-[10px]`** — the app's one deliberate
   "stamp" personality moment (predates the Ink doc, which doesn't
   address it at all). 10px is below the type scale's floor (`label`,
   12px) by design, not by gap.
4. **`HistoricalImportSection.tsx`'s `w-[180px]`** — a fixed `Select`
   width. Not a color, radius, or spacing-token category (the 4px
   spacing scale governs gaps/padding/margins, not one-off component
   widths); low priority, left as-is.
5. **The focus indicator mechanism.** The doc specifies "2px solid
   outline, 2px offset." Every interactive element actually uses
   Tailwind/shadcn's `focus-visible:ring-3` (a box-shadow ring), not a
   literal CSS `outline` property — same color (`--ring` resolves to
   `--focus`), same visibility, different mechanism. Changing this
   would touch every interactive element in the app (Button, Input,
   Select, IconButton, Chip, ListRow, links — all of them), so it's
   flagged here rather than changed unilaterally in a cleanup ticket.
6. **Icon stroke width** was applied to every icon in new or
   ticket-touched components (`strokeWidth={1.75}`), but no blanket
   sweep was run over the ~15 pre-existing icon call sites the audit
   (issue #28) already identified as out of scope for the screen
   sweeps — most still use Lucide's default 2px stroke.
7. **Expenses/Income row content, the "More" sheet's inner content,
   Dashboard/DonutChart typography, and the hand-built segmented
   controls** (unit tabs, recurring-expense frequency picker) — all
   explicitly out of scope for issues #29–#32 (per each ticket's own
   "Not in this ticket" list and the Phase 2 flags raised in issue
   #28's audit). Still on Tailwind's default type scale, not the Ink
   one.

## Validation

- `npx tsc -b`: clean, every ticket.
- `npm run lint` (oxlint): clean, only the same 6 pre-existing
  `only-export-components` warnings across the whole arc (unrelated to
  this work — they're about fast-refresh, not styling).
- `npm run test` (vitest): 131/131 passing.
- `npm run build`: clean production build every ticket; final rebuild
  for this report confirms 21 precache entries, zero regressions.
- **Hardcoded hex scan**: zero outside `src/index.css` (token
  definitions) and the three documented exceptions above.
- **Offline font check**: confirmed structurally — all 6 IBM Plex Sans
  files (400/500/600 × woff/woff2) are present in the built service
  worker's precache manifest (`grep` on `dist/sw.js` directly, not
  assumed). Could not actually toggle DevTools' network-offline mode
  in this session's browser tooling to confirm live.
- **360px width check**: done piecemeal per ticket using the dev-only
  preview page and temporary component mounts (screenshotted, then
  reverted) — confirmed the hero fit-to-width logic, Chip contrast,
  and Spanish nav labels don't overflow at 360px. **Not independently
  re-verified on the real, signed-in screens** in this ticket — I
  cannot sign in to this app's Google OAuth from here, a limitation
  flagged consistently since issue #25.
- **44×44 hit targets**: systematically enforced via the shared
  components' own height floors (`Button`/`Input`/`Select` at `h-11`,
  `IconButton` at `size-11`, `Chip`/`Tabs`/`ListRow` at
  `min-h-11`/`min-h-14`) rather than checked screen-by-screen by hand.
  Spot-checked the two highest-risk cases (icon-only kebab-menu
  triggers in Expenses/Income) directly — both correctly use
  `size="icon-sm"`, which floors at 44px.

## Checklist — PASS/FAIL by spec section

| # | Section | Result |
|---|---|---|
| 1 | Color tokens | PASS |
| 2 | Typography | PASS |
| 3 | Spacing | PASS |
| 4 | Radius | PASS |
| 5 | Touch targets | PASS (systematic, spot-checked; see Validation) |
| 6 | Surfaces and layout pieces | PASS |
| 7 | Inputs | PASS |
| 8 | Buttons | PASS |
| 9 | Financial values | PASS |
| 10 | Badges and status | PASS |
| 11 | Iconography | PASS with a note — stroke width not swept app-wide (Remaining #6) |
| 12 | Navigation | PASS |
| 13 | Accessibility | PASS with a note — focus ring mechanism, not literal outline (Remaining #5) |
| 14 | Components to standardize | PASS |
| 15 | Localization | PASS |
| 16 | PWA colors | PASS (app icon itself explicitly out of scope) |
| 17 | Consolidation | PASS with documented exceptions (Remaining #1–4) |
| 18 | Implementation requirements | PASS — build/tests/lint clean; offline confirmed structurally; 360px confirmed where testable without sign-in |
