"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  ArrowRight,
  Car,
  CreditCard,
  History,
  Home,
  PiggyBank,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  Wallet
} from "lucide-react";
import { NovaOrb } from "@/components/brand/nova-orb";
import { ChartFrame } from "@/components/data/chart-frame";
import { MetricCard } from "@/components/data/metric-card";
import { AppPageHeader, MiniMetric } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { compareScenario, forecastGoalCompletion } from "@/lib/financial/engine";
import { scenarioLibrary } from "@/lib/financial/sample-data";
import type { FinancialProfile, ScenarioInput } from "@/lib/financial/types";
import { chartTheme, chartTooltipStyle } from "@/lib/presentation/chart-theme";
import { buildFinancialOverview, type FinancialOverviewViewModel } from "@/lib/presentation/financial-overview";
import { buildNovaDecisionView } from "@/lib/presentation/nova-decision";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { clamp, cn, formatCurrency } from "@/lib/utils";

const recommendedScenario: ScenarioInput =
  scenarioLibrary.find((scenario) => scenario.tags.some((tag) => tag === "Recommended")) ?? scenarioLibrary[0]!;

const scenarioIcons = {
  car: Car,
  house: Home,
  loan: CreditCard,
  investment: TrendingUp,
  salary: Wallet,
  "job-loss": ShieldAlert,
  family: Home,
  education: PiggyBank,
  emergency: ShieldAlert,
  travel: ArrowRight,
  retirement: PiggyBank
};

function HealthRing({ score }: { score: number }) {
  return (
    <div
      className="relative flex size-16 items-center justify-center"
      role="img"
      aria-label={`Financial health score ${score} out of 100`}
    >
      <svg className="size-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r="25" stroke={chartTheme.grid} strokeWidth="5" fill="none" />
        <motion.circle
          cx="32"
          cy="32"
          r="25"
          stroke={chartTheme.current}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={157}
          initial={{ strokeDashoffset: 157 }}
          animate={{ strokeDashoffset: 157 - (score / 100) * 157 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-xs font-black" aria-hidden="true">{score}</span>
    </div>
  );
}

function IdentityHeader({
  overview,
  source
}: {
  overview: FinancialOverviewViewModel;
  source: "sample" | "saved";
}) {
  const currency = overview.profile.currency;

  return (
    <Card id="twin" className="glass-panel-strong relative overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-card to-chart-3/10">
      <div className="scanline pointer-events-none absolute inset-0 opacity-15" />
      <CardContent className="relative grid gap-5 p-5 xl:grid-cols-[1.1fr_auto_1.7fr] xl:items-center">
        <div className="flex items-center gap-5">
          <div className="relative flex size-20 items-center justify-center rounded-3xl border border-primary/20 bg-card shadow-glow">
            <NovaOrb className="size-12" />
            <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-positive text-[9px] font-black text-primary-foreground">
              AI
            </span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Financial model ready</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{overview.profile.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="success">Calculated locally</Badge>
              <Badge variant={source === "saved" ? "blue" : "secondary"}>
                {source === "saved" ? "Saved profile" : "Sample model"}
              </Badge>
              <span className="text-xs text-muted-foreground">No live bank connection</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-border xl:border-l xl:border-r xl:px-6">
          <HealthRing score={overview.health.score} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Health score</p>
            <p className="font-bold text-positive">{overview.health.band}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniMetric label="Monthly income" value={formatCurrency(overview.flow.monthlyIncome, currency)} />
          <MiniMetric label="Monthly expenses" value={formatCurrency(overview.flow.monthlyExpenses, currency)} />
          <MiniMetric label="Obligations" value={`${formatCurrency(overview.flow.monthlyDebtPayment, currency)}/mo`} />
          <MiniMetric label="Savings balance" value={formatCurrency(overview.flow.savingsBalance, currency)} />
        </div>
      </CardContent>
    </Card>
  );
}

function ScenarioTile({
  scenario,
  selected,
  currency,
  onSelect
}: {
  scenario: ScenarioInput;
  selected: boolean;
  currency: FinancialProfile["currency"];
  onSelect: () => void;
}) {
  const Icon = scenarioIcons[scenario.type];
  const delta = scenario.monthlyIncomeDelta - scenario.monthlyExpenseDelta - scenario.monthlyDebtPaymentDelta;
  const tone = scenario.tags.some((tag) => tag.toLowerCase().includes("high")) ? "danger" : selected ? "success" : "blue";

  return (
    <motion.button
      type="button"
      layout
      whileHover={{ y: -4 }}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "glass-panel flex min-h-44 flex-col items-start justify-between rounded-2xl p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary/45 bg-gradient-to-br from-primary/15 to-chart-3/10 shadow-glow"
      )}
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/50 text-primary">
          <Icon aria-hidden="true" />
        </span>
        <Badge variant={tone}>{scenario.tags[0]}</Badge>
      </span>
      <span>
        <span className="block font-black">{scenario.name}</span>
        <span className="mt-2 block text-sm font-semibold text-muted-foreground">
          {delta >= 0 ? "+" : ""}{formatCurrency(delta, currency)} /mo
        </span>
      </span>
      <span className={cn("w-full rounded-xl border px-3 py-2 text-center text-xs font-bold", selected ? "border-primary/30 bg-primary text-primary-foreground" : "border-border bg-muted text-foreground")}>
        {selected ? "Selected" : "Compare decision"}
      </span>
    </motion.button>
  );
}

function CashFlowChart({ overview }: { overview: FinancialOverviewViewModel }) {
  return (
    <ChartFrame
      title="Future cash flow"
      description={`Current path compared with ${overview.decision.name}`}
      summary={overview.cashFlowSummary}
      className="min-h-72"
      action={
        <div className="flex gap-3 text-xs" aria-hidden="true">
          <span className="flex items-center gap-2 text-primary"><span className="h-0.5 w-3 bg-chart-1" />Current</span>
          <span className="flex items-center gap-2 text-positive"><span className="h-0.5 w-3 bg-chart-2" />After</span>
        </div>
      }
    >
      <div className="h-56" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={overview.cashFlow}>
            <defs>
              <linearGradient id="dashboard-after" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartTheme.after} stopOpacity={0.28} />
                <stop offset="100%" stopColor={chartTheme.after} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashboard-current" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartTheme.current} stopOpacity={0.22} />
                <stop offset="100%" stopColor={chartTheme.current} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartTheme.grid} vertical={false} />
            <XAxis dataKey="month" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
            <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Area type="monotone" dataKey="current" stroke={chartTheme.current} strokeWidth={2} fill="url(#dashboard-current)" />
            <Area type="monotone" dataKey="after" stroke={chartTheme.after} strokeWidth={2.5} strokeDasharray="6 5" fill="url(#dashboard-after)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function NovaDecisionPanel({ selected, profile }: { selected: ScenarioInput; profile: FinancialProfile }) {
  const comparison = useMemo(() => compareScenario(profile, selected), [profile, selected]);
  const decision = useMemo(() => buildNovaDecisionView(comparison), [comparison]);
  const toneClass = {
    positive: "border-positive/30 bg-positive/10",
    caution: "border-caution/30 bg-caution/10",
    danger: "border-destructive/30 bg-destructive/10"
  }[decision.recommendation.tone];

  return (
    <Card id="insights" className={cn("relative overflow-hidden", toneClass)}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base normal-case tracking-normal">
            <NovaOrb className="size-7" />
            NOVA decision brief
          </CardTitle>
          <Badge variant="secondary">{decision.provenance.label}</Badge>
        </div>
        <h3 className="pt-2 text-xl font-black">{decision.recommendation.title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{decision.recommendation.summary}</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          {decision.evidence.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card/70 p-3">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{item.label}</dt>
              <dd className="mt-1 font-black">{item.value}</dd>
              <dd className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</dd>
            </div>
          ))}
        </dl>
        <div className="rounded-xl border border-border bg-card/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">Model confidence</p>
            <Badge variant={decision.confidence.level === "High" ? "success" : "warning"}>
              {decision.confidence.level} · {decision.confidence.score}/100
            </Badge>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{decision.confidence.basis}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {decision.actions.map((action) => (
            <Button key={action.href} asChild size="sm" variant="outline">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
        <p className="border-t border-border pt-3 text-xs leading-5 text-muted-foreground">{decision.boundary}</p>
      </CardContent>
    </Card>
  );
}

function DecisionEvidence({ selected, profile }: { selected: ScenarioInput; profile: FinancialProfile }) {
  const comparison = useMemo(() => compareScenario(profile, selected), [profile, selected]);
  const currentEnd = comparison.current.timeline.at(-1) ?? comparison.current.timeline[0]!;
  const afterEnd = comparison.after.timeline.at(-1) ?? comparison.after.timeline[0]!;
  const currentDebt = profile.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const afterDebt = comparison.after.profile.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const rows = [
    {
      label: "12-month net worth",
      current: formatCurrency(currentEnd.netWorth, profile.currency),
      after: formatCurrency(afterEnd.netWorth, profile.currency),
      delta: formatCurrency(afterEnd.netWorth - currentEnd.netWorth, profile.currency)
    },
    {
      label: "12-month savings",
      current: formatCurrency(currentEnd.savings, profile.currency),
      after: formatCurrency(afterEnd.savings, profile.currency),
      delta: formatCurrency(afterEnd.savings - currentEnd.savings, profile.currency)
    },
    {
      label: "Starting debt",
      current: formatCurrency(currentDebt, profile.currency),
      after: formatCurrency(afterDebt, profile.currency),
      delta: formatCurrency(afterDebt - currentDebt, profile.currency)
    },
    {
      label: "Emergency runway",
      current: `${comparison.current.emergencyFundMonths.toFixed(1)} mo`,
      after: `${comparison.after.emergencyFundMonths.toFixed(1)} mo`,
      delta: `${(comparison.after.emergencyFundMonths - comparison.current.emergencyFundMonths).toFixed(1)} mo`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision evidence</CardTitle>
        <p className="text-sm text-muted-foreground">Direct current-versus-after outputs for {selected.name}; no synthetic progress percentages.</p>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="rounded-xl border border-border bg-muted/30 p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{row.label}</dt>
              <dd className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <span><span className="block text-xs text-muted-foreground">Current</span><span className="font-bold">{row.current}</span></span>
                <span><span className="block text-xs text-muted-foreground">After</span><span className="font-bold">{row.after}</span></span>
              </dd>
              <dd className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">Modeled delta: {row.delta}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function TwinSummary({ selected, profile }: { selected: ScenarioInput; profile: FinancialProfile }) {
  const comparison = useMemo(() => compareScenario(profile, selected), [profile, selected]);
  const debtBalance = comparison.after.profile.debts.reduce((sum, debt) => sum + debt.balance, 0);
  const data = [
    { name: "Cash", value: comparison.after.profile.assets.cash, color: chartTheme.after },
    { name: "Invested", value: comparison.after.profile.assets.investments + comparison.after.profile.assets.retirement, color: chartTheme.current },
    { name: "Real estate", value: comparison.after.profile.assets.realEstate, color: chartTheme.comparison },
    { name: "Debt", value: debtBalance, color: "hsl(var(--caution))" }
  ];
  const summary = `After ${selected.name}, modeled assets include ${formatCurrency(data[0].value, profile.currency)} cash and ${formatCurrency(data[1].value, profile.currency)} invested, against ${formatCurrency(debtBalance, profile.currency)} debt.`;

  return (
    <ChartFrame title="Decision balance sheet" description={`Modeled balances after ${selected.name}.`} summary={summary}>
      <div className="grid gap-5 sm:grid-cols-[160px_1fr] sm:items-center">
        <div className="h-40" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={43} outerRadius={66} paddingAngle={4}>
                {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3">
          <MiniMetric label="Risk profile" value={`${comparison.after.risk.level} (${comparison.after.risk.score})`} />
          <MiniMetric label="Emergency fund" value={`${comparison.after.emergencyFundMonths.toFixed(1)} months`} />
          <MiniMetric label="Health impact" value={`${comparison.delta.healthScore >= 0 ? "+" : ""}${comparison.delta.healthScore} points`} />
        </div>
      </div>
    </ChartFrame>
  );
}

function GoalTracker({ profile }: { profile: FinancialProfile }) {
  const goals = forecastGoalCompletion(profile).slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Goal tracker</CardTitle>
          <Button asChild size="sm" variant="ghost"><Link href="/goals">View all</Link></Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center">
            <p className="text-sm font-bold">No active goals</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Add goals to your financial model to see forecasts here.</p>
          </div>
        ) : goals.map((goal) => {
          const progress = clamp(goal.progress, 0, 100);
          return (
            <div key={goal.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-bold">{goal.name}</span>
                <span className="text-xs text-muted-foreground">{goal.monthsRemaining} mo</span>
              </div>
              <Progress
                value={progress}
                role="progressbar"
                aria-label={`${goal.name} funding progress`}
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function DecisionHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-5 text-primary" aria-hidden="true" />
          Decision workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-xl border border-dashed border-border p-4">
          <p className="text-sm font-bold">Simulation history is not stored</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Dashboard comparisons are session-only. Use the decision lab for the complete scenario library, then export a report if you need a durable record.
          </p>
        </div>
        <Button asChild><Link href="/simulations">Open decision lab <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
        <Button asChild variant="outline"><Link href="/reports">Open report workspace</Link></Button>
      </CardContent>
    </Card>
  );
}

export function DashboardClient() {
  const { profile, source } = useFinancialProfile();
  const [selected, setSelected] = useState(recommendedScenario);
  const [selectionStatus, setSelectionStatus] = useState(`${recommendedScenario.name} selected.`);
  const overview = useMemo(() => buildFinancialOverview(profile, selected), [profile, selected]);
  const barData = [
    { label: "Income", value: overview.flow.monthlyIncome },
    { label: "Expenses", value: overview.flow.monthlyExpenses },
    { label: "Obligations", value: overview.flow.monthlyDebtPayment },
    { label: "Surplus", value: overview.metrics.find((metric) => metric.id === "monthly-surplus")?.rawValue ?? 0 }
  ];
  const flowSummary = `Monthly income is ${formatCurrency(overview.flow.monthlyIncome, profile.currency)}, expenses are ${formatCurrency(overview.flow.monthlyExpenses, profile.currency)}, obligations are ${formatCurrency(overview.flow.monthlyDebtPayment, profile.currency)}, and surplus is ${formatCurrency(barData[3].value, profile.currency)}.`;

  const selectScenario = (scenario: ScenarioInput) => {
    setSelected(scenario);
    setSelectionStatus(`${scenario.name} selected. Dashboard evidence updated.`);
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
      <AppPageHeader
        title="Twin cockpit"
        description="A local financial command center where NOVA compares decisions, risk, cash flow, savings, debt, and goals from your active model."
        action={
          <Button
            variant="outline"
            disabled={selected.id === recommendedScenario.id}
            onClick={() => selectScenario(recommendedScenario)}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset selection
          </Button>
        }
      />
      <p role="status" aria-live="polite" className="sr-only">{selectionStatus}</p>
      <IdentityHeader overview={overview} source={source} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
      </div>

      <section aria-labelledby="quick-comparisons-title" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="quick-comparisons-title" className="text-xl font-black">Quick decision comparisons</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select a scenario to update every comparison below.</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href="/simulations">Explore all scenarios <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {scenarioLibrary.slice(0, 4).map((scenario) => (
            <ScenarioTile
              key={scenario.id}
              scenario={scenario}
              selected={selected.id === scenario.id}
              currency={profile.currency}
              onSelect={() => selectScenario(scenario)}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
        <CashFlowChart overview={overview} />
        <NovaDecisionPanel selected={selected} profile={profile} />
      </div>
      <DecisionEvidence selected={selected} profile={profile} />
      <div className="grid gap-6 xl:grid-cols-3">
        <TwinSummary selected={selected} profile={profile} />
        <GoalTracker profile={profile} />
        <DecisionHistory />
      </div>
      <ChartFrame
        title="Monthly flow composition"
        description="Current recurring income, expenses, debt obligations, and surplus from the active profile."
        summary={flowSummary}
      >
        <div className="h-64" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="label" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="value" fill={chartTheme.current} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </div>
  );
}
