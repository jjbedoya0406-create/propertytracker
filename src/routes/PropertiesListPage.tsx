import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Building2, ChevronRight, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FinancialValue } from "@/components/ui/financial-value";
import { HeroCard, HeroCardLabel } from "@/components/ui/hero-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoggedStamp } from "@/components/LoggedStamp";
import { formatMonthLabel } from "@/lib/monthLabel";
import { useTranslation } from "../i18n/useTranslation";
import { useSettings } from "../portfolio/context";
import type {
  Building,
  Currency,
  Expense,
  Income,
  Property,
  PropertyStatus,
} from "../types";
import { useBuildings } from "../features/buildings/hooks";
import { useAllExpenses } from "../features/expenses/hooks";
import { useAllIncome } from "../features/income/hooks";
import { groupPropertiesByBuilding } from "../features/properties/groupByBuilding";
import {
  computePortfolioTotals,
  computePropertyPreview,
  type PropertyPreview,
} from "../features/properties/portfolioSummary";
import { PropertyForm } from "../features/properties/PropertyForm";
import { useCreateProperty, useProperties } from "../features/properties/hooks";

export function PropertiesListPage() {
  const { t } = useTranslation();
  const { language, currency } = useSettings();
  const { data: properties, isPending, isError, error } = useProperties();
  const { data: buildings } = useBuildings();
  const { data: allIncome } = useAllIncome();
  const { data: allExpenses } = useAllExpenses();
  const createProperty = useCreateProperty();
  const [statusFilter, setStatusFilter] = useState<PropertyStatus>("active");
  const [showAddForm, setShowAddForm] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const portfolioTotals = useMemo(() => {
    if (!properties || !allIncome || !allExpenses) {
      return { income: 0, expenses: 0 };
    }
    const activeIds = new Set(
      properties.filter((p) => p.status === "active").map((p) => p.propertyId),
    );
    const income = allIncome.filter((entry) => activeIds.has(entry.propertyId));
    // Building-shared expenses (buildingId, no propertyId) always count —
    // buildings have no active/archived concept of their own.
    const expenses = allExpenses.filter((entry) =>
      entry.propertyId ? activeIds.has(entry.propertyId) : true,
    );
    return computePortfolioTotals(income, expenses, currentMonth);
  }, [properties, allIncome, allExpenses, currentMonth]);
  const portfolioNet = portfolioTotals.income - portfolioTotals.expenses;

  if (isPending) {
    return <p className="text-muted-foreground">{t("properties.loading")}</p>;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertDescription>
          {error instanceof Error ? error.message : t("properties.loadError")}
        </AlertDescription>
      </Alert>
    );
  }

  const filtered = properties.filter(
    (property) => property.status === statusFilter,
  );
  const hasNoPropertiesAtAll = properties.length === 0;
  const items = groupPropertiesByBuilding(filtered, buildings ?? []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-semibold text-ink">
          {t("properties.title")}
        </h1>
        {!hasNoPropertiesAtAll && (
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as PropertyStatus)}
          >
            <TabsList>
              <TabsTrigger value="active">{t("common.active")}</TabsTrigger>
              <TabsTrigger value="archived">{t("common.archived")}</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {!hasNoPropertiesAtAll && (
        <HeroCard className="items-center text-center">
          <HeroCardLabel>
            {t("properties.portfolioNetLabel", {
              month: formatMonthLabel(currentMonth, language),
            })}
          </HeroCardLabel>
          <FinancialValue
            type="net"
            amount={portfolioNet}
            currency={currency}
            fit
          />
          <span className="flex items-center gap-1 text-caption text-muted-foreground">
            {t("summary.income")}{" "}
            <FinancialValue
              type="supporting"
              amount={portfolioTotals.income}
              currency={currency}
            />
            <span aria-hidden="true">·</span>
            {t("summary.expenses")}{" "}
            <FinancialValue
              type="supporting"
              amount={portfolioTotals.expenses}
              currency={currency}
            />
          </span>
        </HeroCard>
      )}

      {hasNoPropertiesAtAll && !showAddForm && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-muted-foreground">
              {t("properties.emptyState")}
            </p>
            <Button variant="outline" onClick={() => setShowAddForm(true)}>
              {t("properties.addButton")}
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasNoPropertiesAtAll && (
        <>
          {items.length === 0 ? (
            <p className="text-muted-foreground">
              {t("properties.noneForStatus", {
                status: t(`common.${statusFilter}`).toLowerCase(),
              })}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) =>
                item.kind === "standalone" ? (
                  <StandalonePropertyRow
                    key={item.property.propertyId}
                    property={item.property}
                    isJustCreated={item.property.propertyId === justCreatedId}
                    currency={currency}
                    preview={previewForStandalone(
                      item.property,
                      allIncome ?? [],
                      allExpenses ?? [],
                      currentMonth,
                    )}
                  />
                ) : (
                  <BuildingListRow
                    key={item.building.buildingId}
                    building={item.building}
                    units={item.units}
                    currency={currency}
                    preview={previewForBuilding(
                      item.building,
                      item.units,
                      allIncome ?? [],
                      allExpenses ?? [],
                      currentMonth,
                    )}
                  />
                ),
              )}
            </div>
          )}

          {!showAddForm && (
            <Button
              variant="outline"
              className="self-start"
              onClick={() => setShowAddForm(true)}
            >
              {t("properties.addButton")}
            </Button>
          )}
        </>
      )}

      {showAddForm && (
        <Card>
          <CardContent>
            <PropertyForm
              submitLabel={t("properties.addButton")}
              isSubmitting={createProperty.isPending}
              onSubmit={(input) => {
                createProperty.mutate(input, {
                  onSuccess: (property) => {
                    setShowAddForm(false);
                    setJustCreatedId(property.propertyId);
                  },
                });
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function previewForStandalone(
  property: Property,
  allIncome: Income[],
  allExpenses: Expense[],
  month: string,
): PropertyPreview {
  const income = allIncome.filter((e) => e.propertyId === property.propertyId);
  const expenses = allExpenses.filter(
    (e) => e.propertyId === property.propertyId,
  );
  return computePropertyPreview(income, expenses, income.length > 0, month);
}

function previewForBuilding(
  building: Building,
  units: Property[],
  allIncome: Income[],
  allExpenses: Expense[],
  month: string,
): PropertyPreview {
  const unitIds = units.map((u) => u.propertyId);
  const income = allIncome.filter((e) => unitIds.includes(e.propertyId));
  const expenses = allExpenses.filter(
    (e) =>
      (e.propertyId && unitIds.includes(e.propertyId)) ||
      e.buildingId === building.buildingId,
  );
  return computePropertyPreview(income, expenses, income.length > 0, month);
}

function RowPreview({
  preview,
  currency,
}: {
  preview: PropertyPreview;
  currency: Currency;
}) {
  const { t } = useTranslation();
  if (preview.kind === "noActivity") {
    return (
      <span className="text-caption text-muted-foreground">
        {t("properties.noActivityYet")}
      </span>
    );
  }
  // A property/building that's never had an income record (e.g. an
  // owner-occupied unit) previews its expenses alone (see
  // portfolioSummary.ts) — genuinely an "expense" figure, not a net.
  if (preview.kind === "expensesOnly") {
    return (
      <FinancialValue
        type="expense"
        amount={preview.amount}
        currency={currency}
      />
    );
  }
  return (
    <FinancialValue
      type="list-net"
      amount={preview.amount}
      currency={currency}
    />
  );
}

function StandalonePropertyRow({
  property,
  isJustCreated,
  currency,
  preview,
}: {
  property: Property;
  isJustCreated: boolean;
  currency: Currency;
  preview: PropertyPreview;
}) {
  const { t } = useTranslation();
  return (
    <Card className="[--card-spacing:0px]">
      <Link
        to={`/properties/${property.propertyId}`}
        className="flex min-h-11 items-center justify-between gap-3 p-4 hover:bg-muted/50"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Home className="size-4 text-primary" />
          </span>
          <span className="text-body-strong text-ink">{property.name}</span>
        </span>
        <div className="flex items-center gap-2">
          {isJustCreated && <LoggedStamp />}
          {property.status === "archived" && (
            <Badge variant="paused">{t("common.archived")}</Badge>
          )}
          <RowPreview preview={preview} currency={currency} />
          <ChevronRight
            className="size-5 shrink-0 text-ink"
            strokeWidth={1.75}
          />
        </div>
      </Link>
    </Card>
  );
}

// Navigates straight to the Building Info screen (issue #14) — every
// row on this list navigates on tap now, no inline expand/collapse
// anywhere (that behavior, from issue #13, is superseded).
function BuildingListRow({
  building,
  units,
  currency,
  preview,
}: {
  building: Building;
  units: Property[];
  currency: Currency;
  preview: PropertyPreview;
}) {
  const { t } = useTranslation();
  return (
    <Card className="[--card-spacing:0px]">
      <Link
        to={`/buildings/${building.buildingId}`}
        className="flex min-h-11 items-center justify-between gap-3 p-4 hover:bg-muted/50"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stamp/10">
            <Building2 className="size-4 text-stamp" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-body-strong text-ink">{building.name}</span>
            <span className="text-caption text-muted-foreground">
              {t("properties.unitCount", { count: String(units.length) })}
            </span>
          </span>
        </span>
        <div className="flex items-center gap-2">
          <RowPreview preview={preview} currency={currency} />
          <ChevronRight
            className="size-5 shrink-0 text-ink"
            strokeWidth={1.75}
          />
        </div>
      </Link>
    </Card>
  );
}
