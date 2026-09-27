import type { ReactNode } from "react";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { FinancialValue } from "@/components/ui/financial-value";
import { HeroCard, HeroCardLabel, HeroCardStats } from "@/components/ui/hero-card";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatTile, StatTileLabel } from "@/components/ui/stat-tile";

// Dev-only preview of every component this ticket touched, in every
// variant/state, per docs/Design_System_v0.2.md section 14's acceptance
// criteria. Excluded from production builds — see the dev-gated route in
// App.tsx, which never registers this route when import.meta.env.DEV is
// false.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-secondary text-muted-foreground">{label}</div>
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
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-title text-ink">Ink components preview</h1>

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
            <span className="text-secondary text-red-text">
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
          <span className="text-secondary text-muted-foreground">·</span>
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
          <AlertCircle strokeWidth={1.75} className="size-5 text-muted-foreground" />
        </Row>
      </Section>
    </div>
  );
}
