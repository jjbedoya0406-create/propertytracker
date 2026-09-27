import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Home,
  Menu,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinancialValue } from "@/components/ui/financial-value";
import {
  HeroCard,
  HeroCardLabel,
  HeroCardStats,
} from "@/components/ui/hero-card";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListRow } from "@/components/ui/list-row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatTile, StatTileLabel } from "@/components/ui/stat-tile";
import { ToastProvider, useToast } from "@/components/ToastContext";
import { textClass } from "@/lib/typography";
import { PortfolioContext } from "@/portfolio/context";

// Dev-only preview of every component this ticket touched, in every
// variant/state, per docs/Design_System_v0.2.md section 14's acceptance
// criteria. Excluded from production builds — see the dev-gated route in
// App.tsx, which never registers this route when import.meta.env.DEV is
// false.
//
// This route sits outside RequirePortfolio (it needs no sign-in), but
// Toast (and anything else using useTranslation/useSettings) reads
// PortfolioContext, and Sheet/Dialog read ToastContext — both only ever
// mounted inside RequirePortfolio/PortfolioLayout in the real app (see
// App.tsx). This page provides its own mock/self-contained versions of
// both, the same way LoggedStamp.test.tsx mocks PortfolioContext, so its
// Toast/Sheet/Dialog demos work without a real sign-in.
const mockPortfolioContext = {
  spreadsheetId: "preview-spreadsheet-id",
  settings: { language: "en" as const, currency: "USD" as const },
  homeSpreadsheetId: "preview-spreadsheet-id",
  activeLabel: null,
  activeConnectionId: null,
  connectedPortfolios: [],
  switchToHome: () => {},
  switchToPortfolio: () => {},
};
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-caption text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-section text-ink">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

export function DevComponentsPreviewPage() {
  return (
    <PortfolioContext.Provider value={mockPortfolioContext}>
      <ToastProvider>
        <PreviewContent />
      </ToastProvider>
    </PortfolioContext.Provider>
  );
}

function PreviewContent() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-title text-ink">Ink components preview</h1>

      <Section title="Text">
        <div className="flex flex-col gap-1">
          <span className={textClass("hero")}>Hero $1,284,350.00</span>
          <span className={textClass("title")}>Title</span>
          <span className={textClass("value")}>Value</span>
          <span className={textClass("section")}>Section</span>
          <span className={textClass("body-strong")}>Body strong</span>
          <span className={textClass("body")}>Body</span>
          <span className={textClass("secondary", "muted")}>Secondary</span>
          <span className={textClass("label")}>Label</span>
        </div>
      </Section>

      <Section title="SectionHeader">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-section text-ink">Recurring expenses</span>
            <span className="text-caption text-muted-foreground">
              3 bills
            </span>
          </div>
        </div>
      </Section>

      <Section title="Chip">
        <Row label="Period selector">
          <button
            type="button"
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg bg-card px-3 text-body font-medium text-ink"
          >
            <Calendar className="size-4" />
            Mar 2026
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </Row>
      </Section>

      <Section title="Divider">
        <Separator />
      </Section>

      <Section title="ListRow">
        <div className="divide-y divide-border">
          <ListRow
            title="HOA fee"
            supportingLine="Due Mar 3"
            right={
              <FinancialValue type="neutral" amount={500} currency="USD" />
            }
          />
          <ListRow
            title="Unit 2B"
            supportingLine="Net this month"
            right={
              <FinancialValue type="list-net" amount={-150} currency="USD" />
            }
          />
          <ListRow
            title="Pest control"
            right={
              <Button type="button" size="sm">
                Confirm
              </Button>
            }
          />
          <ListRow title="607 Ponzano rd" onOpen={() => {}} />
        </div>
      </Section>

      <Section title="BottomSheet">
        <Row label="Open sheet">
          <Button type="button" onClick={() => setSheetOpen(true)}>
            Open bottom sheet
          </Button>
        </Row>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4 text-body text-ink">
              Sheet content goes here.
            </div>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Dialog">
        <Row label="Open dialog">
          <Button type="button" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
        </Row>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End HOA fee?</DialogTitle>
              <DialogDescription>
                Its history stays in your records. You can set it up again
                later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                End
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Toast">
        <Row label="With Undo">
          <Button
            type="button"
            onClick={() =>
              showToast({ message: "Expense deleted", onUndo: () => {} })
            }
          >
            Show toast
          </Button>
        </Row>
      </Section>

      <Section title="BottomNavigation">
        <div className="flex border-t border-line bg-page">
          <div className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-caption font-medium text-ink">
            <Home className="size-6" />
            Properties
          </div>
          <div className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-caption font-medium text-muted-foreground">
            <Plus className="size-6" />
            Capture
          </div>
          <div className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-caption font-medium text-muted-foreground">
            <Menu className="size-6" />
            More
          </div>
        </div>
      </Section>

      <Section title="Button">
        <Row label="Variants">
          <Button variant="default">Primary</Button>
          <Button variant="outline">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="destructive-secondary">Destructive secondary</Button>
          <Button variant="text">Text</Button>
        </Row>
        <Row label="Disabled">
          <Button disabled>Primary</Button>
          <Button variant="outline" disabled>
            Secondary
          </Button>
          <Button variant="destructive-secondary" disabled>
            Destructive secondary
          </Button>
        </Row>
        <Row label="Full-width (52px)">
          <Button variant="default" size="full">
            Log building expense
          </Button>
        </Row>
      </Section>

      <Section title="IconButton">
        <Row label="Default / disabled">
          <IconButton aria-label="Add">
            <Plus strokeWidth={1.75} />
          </IconButton>
          <IconButton aria-label="Delete" disabled>
            <Trash2 strokeWidth={1.75} />
          </IconButton>
        </Row>
      </Section>

      <Section title="Input, Select, DateInput">
        <Row label="Default">
          <div className="flex flex-col gap-2">
            <Label htmlFor="preview-input">Name</Label>
            <Input id="preview-input" placeholder="Placeholder text" />
          </div>
        </Row>
        <Row label="Disabled">
          <Input disabled value="Disabled value" readOnly />
        </Row>
        <Row label="Error">
          <div className="flex flex-col gap-1">
            <Input aria-invalid defaultValue="Bad value" />
            <span className="text-caption text-red-text">
              This field is required
            </span>
          </div>
        </Row>
        <Row label="Select">
          <Select defaultValue="rent">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="DateInput">
          <DateInput defaultValue="2026-03-01" />
        </Row>
      </Section>

      <Section title="Badge">
        <Row label="Status variants">
          <Badge variant="overdue">Overdue</Badge>
          <Badge variant="due">Due</Badge>
          <Badge variant="positive">Paid</Badge>
          <Badge variant="paused">Paused</Badge>
        </Row>
      </Section>

      <Section title="Card / Due card">
        <Row label="Default card">
          <Card className="w-full">
            <CardContent>Default card surface</CardContent>
          </Card>
        </Row>
        <Row label="Due card">
          <Card variant="due" className="w-full">
            <CardContent className="flex items-center justify-between">
              <span className="text-body-strong text-ink">HOA fee</span>
              <Badge variant="overdue">Overdue</Badge>
            </CardContent>
          </Card>
        </Row>
      </Section>

      <Section title="HeroCard / StatTile">
        <HeroCard className="w-full">
          <HeroCardLabel>Net this month</HeroCardLabel>
          <FinancialValue type="net" amount={1284350} currency="USD" />
          <HeroCardStats>
            <StatTile>
              <StatTileLabel>Income</StatTileLabel>
              <FinancialValue type="stat" amount={3500} currency="USD" />
            </StatTile>
            <StatTile>
              <StatTileLabel>Expenses</StatTileLabel>
              <FinancialValue type="stat" amount={75} currency="USD" />
            </StatTile>
          </HeroCardStats>
        </HeroCard>
      </Section>

      <Section title="FinancialValue — every type, USD and COP">
        <Row label="income">
          <FinancialValue type="income" amount={1200} currency="USD" />
          <FinancialValue type="income" amount={1200000} currency="COP" />
        </Row>
        <Row label="expense">
          <FinancialValue type="expense" amount={75} currency="USD" />
          <FinancialValue type="expense" amount={430000} currency="COP" />
        </Row>
        <Row label="net (positive / negative)">
          <FinancialValue type="net" amount={500} currency="USD" />
          <FinancialValue type="net" amount={-500} currency="USD" />
        </Row>
        <Row label="list-net (positive / negative / zero)">
          <FinancialValue type="list-net" amount={150} currency="USD" />
          <FinancialValue type="list-net" amount={-150} currency="USD" />
          <FinancialValue type="list-net" amount={0} currency="USD" />
        </Row>
        <Row label="stat">
          <FinancialValue type="stat" amount={2500} currency="USD" />
        </Row>
        <Row label="supporting">
          <FinancialValue type="supporting" amount={2500} currency="USD" />
          <span className="text-caption text-muted-foreground">·</span>
          <FinancialValue type="supporting" amount={75} currency="USD" />
        </Row>
        <Row label="neutral">
          <FinancialValue type="neutral" amount={500} currency="USD" />
        </Row>
      </Section>

      <Section title="FinancialValue — hero fit mode at 360px (long COP value)">
        <div className="w-[360px] max-w-full rounded-lg border border-line p-3">
          <FinancialValue type="net" amount={-128435000} currency="COP" fit />
        </div>
      </Section>

      <Section title="Icon color reference">
        <Row label="ink / muted">
          <AlertCircle strokeWidth={1.75} className="size-5 text-ink" />
          <AlertCircle
            strokeWidth={1.75}
            className="size-5 text-muted-foreground"
          />
        </Row>
      </Section>
    </div>
  );
}
