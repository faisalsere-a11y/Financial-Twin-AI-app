"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { compareScenario, forecastGoalCompletion } from "@/lib/financial/engine";
import { scenarioLibrary } from "@/lib/financial/sample-data";
import type { FinancialProfile, ScenarioInput } from "@/lib/financial/types";
import { chartTheme, chartTooltipStyle } from "@/lib/presentation/chart-theme";
import {
  buildFinancialOverview,
  type FinancialOverviewViewModel,
  type MetricViewModel
} from "@/lib/presentation/financial-overview";
import { buildNovaDecisionView } from "@/lib/presentation/nova-decision";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { clamp, cn, formatCurrency } from "@/lib/utils";

const recommendedScenario: ScenarioInput =
  scenarioLibrary.find((scenario) => scenario.tags.some((tag) => tag === "Recommended")) ?? scenarioLibrary[0]!;
const chartAnimationDuration = 420;

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

function formatPrimaryMetric(
  metric: MetricViewModel,
  value: number,
  currency: FinancialProfile["currency"]
): string {
  switch (metric.id) {
    case "net-worth":
    case "monthly-surplus":
      return formatCurrency(value, currency);
    case "emergency-runway":
      return `${value.toFixed(1)} months`;
    case "health-score":
      return `${Math.round(value)}/100`;
  }

  return value.toLocaleString("en-US");
}

function HealthRing({ score }: { score: number }) {
  const reduceMotion = useReducedMotion();
  const finalOffset = 157 - (score / 100) * 157;
  return (
    <div
      className="relative flex size-16 shrink-0 items-center justify-center"
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
          initial={{ strokeDashoffset: reduceMotion ? finalOffset : 157 }}
          animate={{ strokeDashoffset: finalOffset }}
          transition={{ duration: reduceMotion ? 0 : chartAnimationDuration / 1000, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-xs font-black" aria-hidden="true">
        <AnimatedNumber value={score} duration={chartAnimationDuration / 1000} />
      </span>
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
    <Reveal className="min-w-0">
      <Card id="twin" className="glass-panel-strong relative min-w-0 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-card to-chart-3/10">
        <div className="scanline pointer-events-none absolute inset-0 opacity-15" />
        <CardContent className="relative grid min-w-0 gap-5 p-5 xl:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.7fr)] xl:items-center">
          <div className="flex min-w-0 items-center gap-5">
            <div className="relative flex size-20 shrink-0 items-center justify-center rounded-3xl border border-primary/20 bg-card shadow-glow">
              <NovaOrb className="size-12" />
              <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-positive text-[9px] font-black text-primary-foreground">
                AI
              </span>
            </div>
            <div className="min-w-0">
              <p className="break-words text-xs font-black uppercase tracking-[0.18em] text-primary">Financial model ready</p>
              <h2 className="mt-1 break-words text-2xl font-black tracking-tight">{overview.profile.name}</h2>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                <Badge variant="success">Calculated locally</Badge>
                <Badge variant={source === "saved" ? "blue" : "secondary"}>
                  {source === "saved" ? "Saved profile" : "Sample model"}
                </Badge>
                <span className="break-words text-xs text-muted-foreground">No live bank connection</span>
              </div>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-3 border-border xl:border-l xl:border-r xl:px-6">
            <HealthRing score={overview.health.score} />
            <div className="min-w-0">
              <p className="break-words text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Health score</p>
              <p className="break-words font-bold text-positive">{overview.health.band}</p>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 items-stretch gap-3 2xl:grid-cols-[repeat(4,minmax(0,1fr))]">
            <MiniMetric
              label="Monthly income"
              numericValue={overview.flow.monthlyIncome}
              format={(value) => formatCurrency(value, currency)}
            />
            <MiniMetric
              label="Monthly expenses"
              numericValue={overview.flow.monthlyExpenses}
              format={(value) => formatCurrency(value, currency)}
            />
            <MiniMetric
              label="Obligations"
              numericValue={overview.flow.monthlyDebtPayment}
              format={(value) => formatCurrency(value, currency)}
              suffix="/mo"
            />
            <MiniMetric
              label="Savings balance"
              numericValue={overview.flow.savingsBalance}
              format={(value) => formatCurrency(value, currency)}
            />
          </div>
        </CardContent>
      </Card>
    </Reveal>
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
  const reduceMotion = useReducedMotion();
  const Icon = scenarioIcons[scenario.type];
  const delta = scenario.monthlyIncomeDelta - scenario.monthlyExpenseDelta - scenario.monthlyDebtPaymentDelta;
  const tone = scenario.tags.some((tag) => tag.toLowerCase().includes("high")) ? "danger" : selected ? "success" : "blue";

  return (
    <motion.button
      type="button"
      layout={!reduceMotion}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "glass-panel flex h-full min-h-44 w-full min-w-0 flex-col items-start justify-between rounded-2xl p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-primary/45 bg-gradient-to-br from-primary/15 to-chart-3/10 shadow-glow"
      )}
    >
      <span className="flex w-full items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-muted/50 text-primary">
          <Icon aria-hidden="true" />
        </span>
        <Badge variant={tone}>{scenario.tags[0]}</Badge>
      </span>
      <span className="min-w-0">
        <span className="block break-words font-black">{scenario.name}</span>
        <span className="mt-2 block break-words text-sm font-semibold text-muted-foreground">
          {delta >= 0 ? "+" : ""}{formatCurrency(delta, currency)} /mo
        </span>
      </span>
      <span className={cn("w-full rounded-xl border px-3 py-2 text-center text-xs font-bold", selected ? "border-primary/30 bg-primary text-primary-foreground" : "border-border bg-muted text-foreground")}>
        {selected ? "Selected" : "Compare decision"}
      </span>
    </motion.button>
  );
}

function CashFlowChart({
  overview,
  reduceMotion
}: {
  overview: FinancialOverviewViewModel;
  reduceMotion: boolean;
}) {
  return (
    <Reveal className="h-full min-w-0">
      <ChartFrame
        title="Future cash flow"
        description={`Current path compared with ${overview.decision.name}`}
        summary={overview.cashFlowSummary}
        className="h-full min-h-72 min-w-0"
        action={
          <div className="flex gap-3 text-xs" aria-hidden="true">
            <span className="flex items-center gap-2 text-primary"><span className="h-0.5 w-3 bg-chart-1" />Current</span>
            <span className="flex items-center gap-2 text-positive"><span className="h-0.5 w-3 bg-chart-2" />After</span>
          </div>
        }
      >
        <div className="h-56 min-w-0" aria-hidden="true">
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
              <Area
                type="monotone"
                dataKey="current"
                stroke={chartTheme.current}
                strokeWidth={2}
                fill="url(#dashboard-current)"
                isAnimationActive={!reduceMotion}
                animationDuration={chartAnimationDuration}
              />
              <Area
                type="monotone"
                dataKey="after"
                stroke={chartTheme.after}
                strokeWidth={2.5}
                strokeDasharray="6 5"
                fill="url(#dashboard-after)"
                isAnimationActive={!reduceMotion}
                animationDuration={chartAnimationDuration}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartFrame>
    </Reveal>
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
    <Card id="insights" className={cn("relative h-full min-w-0 overflow-hidden", toneClass)}>
      <CardHeader>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex min-w-0 items-center gap-2 break-words text-base normal-case tracking-normal">
            <NovaOrb className="size-7" />
            NOVA decision brief
          </CardTitle>
          <Badge variant="secondary">{decision.provenance.label}</Badge>
        </div>
        <h3 className="break-words pt-2 text-xl font-black">{decision.recommendation.title}</h3>
        <p className="break-words text-sm leading-6 text-muted-foreground">{decision.recommendation.summary}</p>
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

function TwinSummary({
  selected,
  profile,
  reduceMotion
}: {
  selected: ScenarioInput;
  profile: FinancialProfile;
  reduceMotion: boolean;
}) {
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
    <Reveal className="h-full min-w-0">
      <ChartFrame
        title="Decision balance sheet"
        description={`Modeled balances after ${selected.name}.`}
        summary={summary}
        className="h-full min-w-0"
      >
        <div className="grid min-w-0 gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
          <div className="h-40 min-w-0" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={43}
                  outerRadius={66}
                  paddingAngle={4}
                  isAnimationActive={!reduceMotion}
                  animationDuration={chartAnimationDuration}
                >
                  {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid min-w-0 gap-3">
            <MiniMetric label="Risk profile" value={`${comparison.after.risk.level} (${comparison.after.risk.score})`} />
            <MiniMetric label="Emergency fund" value={`${comparison.after.emergencyFundMonths.toFixed(1)} months`} />
            <MiniMetric label="Health impact" value={`${comparison.delta.healthScore >= 0 ? "+" : ""}${comparison.delta.healthScore} points`} />
          </div>
        </div>
      </ChartFrame>
    </Reveal>
  );
}

function GoalTracker({ profile }: { profile: FinancialProfile }) {
  const goals = forecastGoalCompletion(profile).slice(0, 4);

  return (
    <Card className="h-full min-w-0">
      <CardHeader>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <CardTitle className="min-w-0">Goal tracker</CardTitle>
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
    <Card className="h-full min-w-0">
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
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
  const reduceMotion = useReducedMotion() === true;
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
    <div className="mx-auto flex min-w-0 max-w-[1440px] flex-col gap-6">
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
      <div className="grid min-w-0 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            format={(value) => formatPrimaryMetric(metric, value, profile.currency)}
          />
        ))}
      </div>

      <section aria-labelledby="quick-comparisons-title" className="grid min-w-0 gap-4">
        <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 id="quick-comparisons-title" className="text-xl font-black">Quick decision comparisons</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select a scenario to update every comparison below.</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href="/simulations">Explore all scenarios <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
        </div>
        <Stagger className="grid min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
          {scenarioLibrary.slice(0, 4).map((scenario) => (
            <StaggerItem key={scenario.id} className="h-full min-w-0">
              <ScenarioTile
                scenario={scenario}
                selected={selected.id === scenario.id}
                currency={profile.currency}
                onSelect={() => selectScenario(scenario)}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <CashFlowChart overview={overview} reduceMotion={reduceMotion} />
        <Reveal className="h-full min-w-0">
          <NovaDecisionPanel selected={selected} profile={profile} />
        </Reveal>
      </div>
      <Reveal className="min-w-0">
        <DecisionEvidence selected={selected} profile={profile} />
      </Reveal>
      <div className="grid min-w-0 items-stretch gap-6 xl:grid-cols-3">
        <TwinSummary selected={selected} profile={profile} reduceMotion={reduceMotion} />
        <GoalTracker profile={profile} />
        <DecisionHistory />
      </div>
      <Reveal className="min-w-0">
        <ChartFrame
          title="Monthly flow composition"
          description="Current recurring income, expenses, debt obligations, and surplus from the active profile."
          summary={flowSummary}
          className="min-w-0"
        >
          <div className="h-64 min-w-0" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="label" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar
                  dataKey="value"
                  fill={chartTheme.current}
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={!reduceMotion}
                  animationDuration={chartAnimationDuration}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      </Reveal>
    </div>
  );
}
