import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AlertCircle, Building2, ChevronLeft, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslation } from "../i18n/useTranslation";
import { PromotePropertyForm } from "../features/buildings/PromotePropertyForm";
import {
  useBuildings,
  usePromotePropertyToBuilding,
} from "../features/buildings/hooks";
import { DashboardSection } from "../features/dashboard/DashboardSection";
import { ExpensesSection } from "../features/expenses/ExpensesSection";
import { IncomeForm } from "../features/income/IncomeForm";
import { IncomeSection } from "../features/income/IncomeSection";
import { useCreateIncome } from "../features/income/hooks";
import type { FinancialScope } from "../features/properties/financialScope";
import { PeriodPickerSheet } from "../features/properties/PeriodPickerSheet";
import { PropertyForm } from "../features/properties/PropertyForm";
import { usePeriod } from "../portfolio/PeriodContext";
import { SummarySection } from "../features/summary/SummarySection";
import { TenancySection } from "../features/tenancies/TenancySection";
import {
  useProperties,
  useSetPropertyStatus,
  useUpdateProperty,
} from "../features/properties/hooks";

type SectionKey = "summary" | "dashboard" | "tenancy" | "income" | "expenses";

// Summary open, everything else collapsed — the page's job is logging a
// payment, not analytics (issue #4).
const DEFAULT_EXPANDED: Record<SectionKey, boolean> = {
  summary: true,
  dashboard: false,
  tenancy: false,
  income: false,
  expenses: false,
};

export function PropertyDetailPage() {
  const { t } = useTranslation();
  const { propertyId } = useParams<{ propertyId?: string }>();
  const { data: properties, isPending, isError, error } = useProperties();
  const { data: buildings } = useBuildings();
  const updateProperty = useUpdateProperty();
  const setPropertyStatus = useSetPropertyStatus();
  const promotePropertyToBuilding = usePromotePropertyToBuilding();
  const createIncome = useCreateIncome();
  const { period } = usePeriod();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [showQuickLogIncome, setShowQuickLogIncome] = useState(false);
  const [expandedSections, setExpandedSections] =
    useState<Record<SectionKey, boolean>>(DEFAULT_EXPANDED);
  // Which sibling unit's tab is active — always a real unit id (issue
  // #15 retired the old "null = building overview" mode; the building
  // name now navigates to the real Building Info screen instead).
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(
    propertyId,
  );

  function toggleSection(key: SectionKey) {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  }

  // Local selection would otherwise persist across a URL param change
  // (this route component doesn't remount when the param changes) —
  // reset it so arriving at a different URL lands on the right state.
  useEffect(() => {
    setSelectedUnitId(propertyId);
  }, [propertyId]);

  // Landing on a different unit is a fresh "landing" — collapsed
  // sections reset the same way every time (issue #4), not just on the
  // very first mount.
  useEffect(() => {
    setExpandedSections(DEFAULT_EXPANDED);
    setShowQuickLogIncome(false);
  }, [selectedUnitId]);

  if (!propertyId) {
    return <Navigate to="/properties" replace />;
  }

  const property = properties?.find((p) => p.propertyId === propertyId);

  // Every unit sharing this buildingId. The selector only renders once
  // this is 2+ — a promoted property always has a sibling by construction,
  // so this only ever collapses back to flat for a genuinely standalone
  // property (Requirement 8, issue #7). Sorted numeric-aware (issue #16)
  // so "301, 302, 303, 304" reads in order rather than sheet-insertion
  // order — unit names aren't always pure numbers (e.g. "Jess house"),
  // so this falls back to plain alphabetic comparison for those.
  const siblings = property?.buildingId
    ? (properties ?? [])
        .filter((p) => p.buildingId === property.buildingId)
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )
    : [];
  const isMultiUnit = siblings.length >= 2;
  const building = isMultiUnit
    ? buildings?.find((b) => b.buildingId === property?.buildingId)
    : undefined;

  const activeProperty = isMultiUnit
    ? siblings.find((p) => p.propertyId === selectedUnitId)
    : property;

  const scope: FinancialScope | undefined = activeProperty
    ? { kind: "unit", propertyId: activeProperty.propertyId }
    : undefined;

  return (
    // The full clearance needed is 132px (BottomTabBar's 55px + the
    // action bar's own 69px + an 8px gap), but PortfolioLayout (App.tsx)
    // already wraps every page in its own pb-24 (96px) — this only
    // needs to add the remainder (132 - 96 = 36px = pb-9), confirmed by
    // measuring the real, fully-nested layout end to end rather than
    // this div in isolation (an earlier pass here got this wrong by
    // missing that outer padding). If the bar's height/position changes,
    // this needs to move with it.
    <div className={cn("flex flex-col gap-6", activeProperty && "pb-9")}>
      <Link
        to="/properties"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("property.backLink")}
      </Link>

      {isPending && (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>
            {error instanceof Error ? error.message : t("property.loadError")}
          </AlertDescription>
        </Alert>
      )}

      {!isPending && !isError && propertyId && !property && (
        <Navigate to="/properties" replace />
      )}

      {/* Card matches Summary/Units on Building Info (issue #15). The
          building name links to the real Building Info screen instead
          of toggling an inline overview (issue #15 retired that mode
          entirely — see BuildingSection.tsx's removal) — no pencil
          here, editing the building happens from that screen now. The
          period carries over automatically (same session-wide
          usePeriod() context regardless of which screen set it). */}
      {isMultiUnit && building && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <Link
              to={`/buildings/${building.buildingId}`}
              className="flex items-start gap-2 text-primary"
            >
              <Building2 className="mt-0.5 size-5 shrink-0" />
              <h1 className="line-clamp-2 text-xl font-medium">
                {building.name}
              </h1>
            </Link>
            <div>{scope && <PeriodPickerSheet scope={scope} />}</div>
            {/* Grid, not a horizontal tab strip (issue #16) — every unit
                stays visible without a swipe gesture, wrapping to more
                rows instead of scrolling. Selected/unselected contrast
                is deliberately stark (solid fill vs. plain border)
                rather than the previous subtle-background pill
                treatment, which blended units together once a building
                had more than a couple of units. */}
            <div className="grid grid-cols-4 gap-2">
              {siblings.map((unit) => {
                const isSelected = selectedUnitId === unit.propertyId;
                return (
                  <button
                    key={unit.propertyId}
                    type="button"
                    onClick={() => setSelectedUnitId(unit.propertyId)}
                    className={cn(
                      "min-h-11 rounded-lg px-2 py-2 text-center text-sm font-medium break-words",
                      isSelected
                        ? "border border-primary bg-primary text-primary-foreground"
                        : // Issue #16 originally used a 0.5px border here, which
                          // read as plain text rather than a tappable tab
                          // (issue #18) — a full 1px border, matching every
                          // other outline-style control in the app
                          // (buttonVariants' "outline" variant), reads as
                          // clearly interactive instead.
                          "border border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {unit.name}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identity info, not a data section — always first, before any
          collapsible card (moved here per feedback on issue #4). */}
      {activeProperty && (
        <Card>
          <CardContent>
            {isEditing ? (
              <PropertyForm
                initialValues={{
                  name: activeProperty.name,
                  address: activeProperty.address,
                }}
                submitLabel={t("common.saveChanges")}
                isSubmitting={updateProperty.isPending}
                // A unit belonging to a building reads its address from
                // the building instead of its own copy (issue #20) — no
                // point editing a field nothing displays.
                showAddressField={!building}
                onSubmit={(input) => {
                  updateProperty.mutate(
                    {
                      ...activeProperty,
                      name: input.name,
                      address: input.address,
                    },
                    { onSuccess: () => setIsEditing(false) },
                  );
                }}
                onCancel={() => setIsEditing(false)}
                // Archiving a unit moved into the edit view (issue #21)
                // — a standalone property still archives from its own
                // button row below, unchanged.
                onArchive={
                  building
                    ? () => {
                        setPropertyStatus.mutate(
                          { property: activeProperty, status: "archived" },
                          { onSuccess: () => setIsEditing(false) },
                        );
                      }
                    : undefined
                }
                isArchiving={setPropertyStatus.isPending}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-medium">
                      {activeProperty.name}
                    </h1>
                    {/* Prefers the building's address over this unit's
                        own copy (issue #20) — the two used to drift
                        independently since promotion only ever snapshot
                        a copy once, at promotion time. */}
                    {(building?.address ?? activeProperty.address) && (
                      <p className="text-muted-foreground">
                        {building?.address ?? activeProperty.address}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Only for a standalone property — a unit inside a
                        multi-unit building already has the chip on the
                        sticky header above, which controls the same
                        page-wide period; showing it twice would be
                        redundant. */}
                    {!isMultiUnit && scope && (
                      <PeriodPickerSheet scope={scope} />
                    )}
                    {activeProperty.status === "archived" && (
                      <Badge variant="secondary">
                        {t("common.archived")}
                      </Badge>
                    )}
                    {/* A unit gets a pencil icon, matching the building
                        screen (issue #21) — Edit/Archive as separate
                        buttons moved into the edit view itself. A
                        standalone property keeps its own button row
                        below, unchanged. */}
                    {building && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("common.edit")}
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {!building && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      {t("common.edit")}
                    </Button>
                    {activeProperty.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={setPropertyStatus.isPending}
                        onClick={() =>
                          setPropertyStatus.mutate({
                            property: activeProperty,
                            status: "archived",
                          })
                        }
                      >
                        {t("common.archive")}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={setPropertyStatus.isPending}
                        onClick={() =>
                          setPropertyStatus.mutate({
                            property: activeProperty,
                            status: "active",
                          })
                        }
                      >
                        {t("common.unarchive")}
                      </Button>
                    )}
                    {/* Only offered for a standalone property — once
                        promoted, adding further units happens from the
                        Building tab instead. */}
                    {!activeProperty.buildingId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddUnitForm(true)}
                      >
                        {t("buildings.addUnitButton")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeProperty && showAddUnitForm && (
        <Card>
          <CardContent>
            <PromotePropertyForm
              initialBuildingName={activeProperty.name}
              isSubmitting={promotePropertyToBuilding.isPending}
              onSubmit={(input) => {
                promotePropertyToBuilding.mutate(
                  {
                    property: activeProperty,
                    buildingName: input.buildingName,
                    newUnitName: input.newUnitName,
                  },
                  { onSuccess: () => setShowAddUnitForm(false) },
                );
              }}
              onCancel={() => setShowAddUnitForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {scope && (
        <>
          <SummarySection
            scope={scope}
            period={period}
            isExpanded={expandedSections.summary}
            onToggleExpanded={() => toggleSection("summary")}
          />
          <DashboardSection
            scope={scope}
            period={period}
            isExpanded={expandedSections.dashboard}
            onToggleExpanded={() => toggleSection("dashboard")}
          />
        </>
      )}

      {activeProperty && (
        <>
          <TenancySection
            propertyId={activeProperty.propertyId}
            isExpanded={expandedSections.tenancy}
            onToggleExpanded={() => toggleSection("tenancy")}
          />
          <IncomeSection
            propertyId={activeProperty.propertyId}
            isExpanded={expandedSections.income}
            onToggleExpanded={() => toggleSection("income")}
          />
          <ExpensesSection
            propertyId={activeProperty.propertyId}
            isExpanded={expandedSections.expenses}
            onToggleExpanded={() => toggleSection("expenses")}
          />
        </>
      )}

      {/* Only when a specific unit (or standalone property) is active —
          both income and expenses are unit-scoped (issue #7, Requirement
          3), so there's no single target to log against from the
          building overview. Log expense still hands off to the Capture
          flow (OCR) — only Log income gets an inline form here. The top
          border + background turn this into a visibly persistent
          toolbar rather than buttons floating loose over whatever
          content is scrolled beneath them. Sits flush against
          BottomTabBar (bottom-[55px] = its real measured height, not
          guessed) — UndoBanner is repositioned to stack above this bar
          instead of overlapping it, since the two always coexist on
          this page. Truly `fixed` to the viewport (not just trailing
          the last card) — nothing between this and Layout's <main> sets
          a transform/filter that would re-scope it. */}
      {activeProperty && (
        <div className="fixed inset-x-0 bottom-[55px] z-30 border-t border-border bg-background">
          <div className="mx-auto max-w-2xl px-4 pt-2 pb-3">
            {showQuickLogIncome ? (
              <Card>
                <CardContent>
                  <IncomeForm
                    isSubmitting={createIncome.isPending}
                    onSubmit={(input) => {
                      createIncome.mutate(
                        { propertyId: activeProperty.propertyId, ...input },
                        { onSuccess: () => setShowQuickLogIncome(false) },
                      );
                    }}
                    onCancel={() => setShowQuickLogIncome(false)}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="flex gap-2">
                {/* Issue #19: expense-logging is a routine action, not a
                    destructive one — filled green (matching "Log building
                    expense" on the Building Info screen), with income as
                    the outlined/secondary action instead. Reverses #4's
                    original red treatment for expense. */}
                <Button
                  variant="outline"
                  className="flex-1 shadow-lg"
                  onClick={() => setShowQuickLogIncome(true)}
                >
                  {t("property.logIncomeQuickAction")}
                </Button>
                <Button asChild className="flex-1 shadow-lg">
                  <Link
                    to={`/capture?propertyId=${activeProperty.propertyId}`}
                  >
                    {t("expenses.logButton")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
