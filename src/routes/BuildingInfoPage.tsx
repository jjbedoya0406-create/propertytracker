import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  AlertCircle,
  Building2,
  ChevronLeft,
  Pencil,
  Plus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { CollapsibleSectionCard } from "@/components/CollapsibleSectionCard";
import { useToast } from "@/components/ToastContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "../i18n/useTranslation";
import { AddUnitForm } from "../features/buildings/AddUnitForm";
import { EditBuildingForm } from "../features/buildings/EditBuildingForm";
import {
  useAddUnitToBuilding,
  useBuildings,
  useUpdateBuilding,
} from "../features/buildings/hooks";
import { DashboardSection } from "../features/dashboard/DashboardSection";
import type { FinancialScope } from "../features/properties/financialScope";
import { PeriodPickerSheet } from "../features/properties/PeriodPickerSheet";
import { useProperties } from "../features/properties/hooks";
import { DueCard } from "../features/recurringExpenses/DueCard";
import { RecurringExpensesSection } from "../features/recurringExpenses/RecurringExpensesSection";
import { useRecurringExpenses } from "../features/recurringExpenses/hooks";
import { formatPeriodLabel } from "../lib/period";
import { usePeriod } from "../portfolio/PeriodContext";
import { useSettings } from "../portfolio/context";
import { SummarySection } from "../features/summary/SummarySection";

type SectionKey = "dashboard" | "units" | "recurring";

// Units and Recurring expenses open by default, Dashboard collapsed —
// Units/Recurring start expanded (unlike the unit-page convention) since
// seeing what exists is usually the point of landing here. Summary isn't
// a toggle at all any more (issue #30) — it's the screen's one
// always-visible hero figure, matching the doc's HeroCard treatment.
const DEFAULT_EXPANDED: Record<SectionKey, boolean> = {
  dashboard: false,
  units: true,
  recurring: true,
};

// Dedicated building-wide screen (issue #14) — reached only from My
// Properties. Deliberately separate from PropertyDetailPage's own
// inline building overview (reached by tapping a building's name from
// inside one of its unit pages), which is untouched and keeps working
// exactly as before.
export function BuildingInfoPage() {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { buildingId } = useParams<{ buildingId: string }>();
  const { period } = usePeriod();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast, dismissToast } = useToast();
  const { data: properties, isPending, isError, error } = useProperties();
  const { data: buildings } = useBuildings();
  const { data: recurringExpenses } = useRecurringExpenses();
  const addUnit = useAddUnitToBuilding();
  const updateBuilding = useUpdateBuilding();
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [showEditBuildingForm, setShowEditBuildingForm] = useState(false);
  const [expandedSections, setExpandedSections] =
    useState<Record<SectionKey, boolean>>(DEFAULT_EXPANDED);
  // Set by RecurringExpenseFormPage on save/pause/resume/end (issue #24)
  // — mirrors the existing justLoggedExpenseId navigation-state pattern
  // (CapturePage -> ExpensesSection). Raised through the global toast slot
  // (issue #27) rather than rendered locally, and dismissed on unmount so
  // navigating away clears it exactly as the old locally-rendered version
  // did.
  const toastMessage = (location.state as { toastMessage?: string } | null)
    ?.toastMessage;
  useEffect(() => {
    if (!toastMessage) return;
    showToast({ message: toastMessage });
    return () => dismissToast();
  }, [toastMessage, showToast, dismissToast]);

  function toggleSection(key: SectionKey) {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  }

  if (!buildingId) {
    return <Navigate to="/properties" replace />;
  }

  const building = buildings?.find((b) => b.buildingId === buildingId);
  const units = (properties ?? []).filter((p) => p.buildingId === buildingId);
  const isMultiUnit = units.length >= 2;
  const isReady = Boolean(building) && isMultiUnit;

  const scope: FinancialScope = {
    kind: "building",
    buildingId,
    unitPropertyIds: units.map((unit) => unit.propertyId),
  };
  const buildingRecurringExpenses = (recurringExpenses ?? []).filter(
    (item) => item.buildingId === buildingId,
  );

  return (
    // Same 36px derivation as PropertyDetailPage.tsx: the full 132px
    // clearance minus PortfolioLayout's own pb-24 (96px) it's already
    // nested inside.
    <div className={cn("flex flex-col gap-6", isReady && "pb-9")}>
      <Link
        to="/properties"
        className="inline-flex min-h-11 w-fit items-center gap-1 text-body text-muted-foreground hover:text-foreground"
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

      {!isPending && !isError && !isReady && (
        <Navigate to="/properties" replace />
      )}

      {building && isReady && (
        <>
          {/* Card matches Summary/Units (issue #15) — replaces the old
              bare flex row + separate "Building details" card, which
              only ever existed to show the address. */}
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <Building2 className="mt-0.5 size-5 shrink-0 text-foreground" />
                  {/* line-clamp, never truncate to one line — a long
                      building name should still be readable. */}
                  <h1 className="line-clamp-2 text-title font-semibold text-ink">
                    {building.name}
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  aria-label={t("common.edit")}
                  onClick={() => setShowEditBuildingForm(true)}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
              {/* Only when it actually adds information — many
                  buildings are named after their own address. */}
              {building.address && building.address !== building.name && (
                <p className="text-muted-foreground">{building.address}</p>
              )}
              <div>
                <PeriodPickerSheet scope={scope} />
              </div>
            </CardContent>
          </Card>

          {/* Between the header card and Summary (issue #24, FR4) —
              always uses real "today", ignores the period picker
              entirely (AC9), and renders nothing when nothing is due. */}
          <DueCard building={building} items={buildingRecurringExpenses} />

          {showEditBuildingForm && (
            <Card>
              <CardContent>
                <EditBuildingForm
                  initialName={building.name}
                  initialAddress={building.address}
                  isSubmitting={updateBuilding.isPending}
                  onSubmit={(input) => {
                    updateBuilding.mutate(
                      { ...building, ...input },
                      { onSuccess: () => setShowEditBuildingForm(false) },
                    );
                  }}
                  onCancel={() => setShowEditBuildingForm(false)}
                />
              </CardContent>
            </Card>
          )}

          <SummarySection variant="hero" scope={scope} period={period} />

          <CollapsibleSectionCard
            title={`${t("buildings.unitsTitle")} (${units.length})`}
            hint={units.map((unit) => unit.name).join(", ")}
            isExpanded={expandedSections.units}
            onToggle={() => toggleSection("units")}
          >
            <div className="flex flex-col gap-4">
              <p className="text-caption text-muted-foreground">
                {t("buildings.showingPeriod", {
                  period: formatPeriodLabel(period, language),
                })}
              </p>
              <div className="divide-y divide-border rounded-lg border px-4">
                {units.map((unit) => (
                  <ListRow
                    key={unit.propertyId}
                    title={unit.name}
                    onOpen={() => navigate(`/properties/${unit.propertyId}`)}
                  />
                ))}
              </div>
              {showAddUnitForm ? (
                <AddUnitForm
                  isSubmitting={addUnit.isPending}
                  onSubmit={(input) => {
                    addUnit.mutate(
                      { building, unitName: input.unitName },
                      { onSuccess: () => setShowAddUnitForm(false) },
                    );
                  }}
                  onCancel={() => setShowAddUnitForm(false)}
                />
              ) : (
                <Button
                  type="button"
                  variant="text"
                  className="w-fit px-0"
                  onClick={() => setShowAddUnitForm(true)}
                >
                  <Plus className="size-4" />
                  {t("buildings.addUnitButton")}
                </Button>
              )}
            </div>
          </CollapsibleSectionCard>

          <RecurringExpensesSection
            buildingId={buildingId}
            items={buildingRecurringExpenses}
            isExpanded={expandedSections.recurring}
            onToggleExpanded={() => toggleSection("recurring")}
          />

          <DashboardSection
            scope={scope}
            period={period}
            isExpanded={expandedSections.dashboard}
            onToggleExpanded={() => toggleSection("dashboard")}
          />

          {/* Same fixed positioning as unit pages (bottom-[55px] flush
              against BottomTabBar, border-t divider, bg-background) —
              no inline form here, just a link to Capture, since there's
              no "Log building income" (buildings never earn income
              directly, per this issue's Non-Goals). */}
          <div className="fixed inset-x-0 bottom-[55px] z-30 border-t border-border bg-background">
            <div className="mx-auto max-w-2xl px-4 pt-2 pb-3">
              <Button asChild size="full" className="shadow-lg">
                <Link to={`/capture?buildingId=${building.buildingId}`}>
                  {t("buildings.logExpenseAction")}
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
