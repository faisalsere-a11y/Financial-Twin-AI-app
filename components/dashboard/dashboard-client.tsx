"use client";

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
  ArrowUpRight,
  BrainCircuit,
  Car,
  CreditCard,
  Home,
  Lightbulb,
  PiggyBank,
  ShieldAlert,
  TrendingUp,
  Undo2,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartFrame } from "@/components/data/chart-frame";
import { MetricCard } from "@/components/data/metric-card";
import { AppPageHeader, MiniMetric, NovaOrb } from "@/components/layout/app-shell";
import { compareScenario, forecastGoalCompletion } from "@/lib/financial/engine";
import { activityFeed, sampleProfile, scenarioLibrary } from "@/lib/financial/sample-data";
import type { ScenarioInput } from "@/lib/financial/types";
import { buildFinancialOverview, type FinancialOverviewViewModel } from "@/lib/presentation/financial-overview";
import { chartTheme, chartTooltipStyle } from "@/lib/presentation/chart-theme";
import { cn, formatCurrency } from "@/lib/utils";

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
  travel: ArrowUpRight,
  retirement: PiggyBank
};

function HealthRing({ score }: { score: number }) {
  return (
    <div className="relative flex size-16 items-center justify-center">
      <svg className="size-16 -rotate-90">
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
      <span className="absolute text-xs font-black">{score}</span>
    </div>
  );
}

function IdentityHeader({ overview }: { overview: FinancialOverviewViewModel }) {

  return (
    <Card id="twin" className="glass-panel-strong border-primary/25 bg-gradient-to-br from-primary/10 via-card to-chart-3/10">
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
              <Badge variant="blue">Sample profile</Badge>
              <span className="text-xs text-muted-foreground">No bank connection</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-border xl:border-l xl:border-r xl:px-6">
          <HealthRing score={overview.health.score} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Health Score</p>
            <p className="font-bold text-positive">{overview.health.band}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniMetric label="Monthly income" value={formatCurrency(overview.flow.monthlyIncome)} />
          <MiniMetric label="Monthly expenses" value={formatCurrency(overview.flow.monthlyExpenses)} />
          <MiniMetric label="Obligations" value={`${formatCurrency(overview.flow.monthlyDebtPayment)}/mo`} />
          <MiniMetric label="Savings balance" value={formatCurrency(overview.flow.savingsBalance)} />
        </div>
      </CardContent>
    </Card>
  );
}

function ScenarioTile({
  scenario,
  selected,
  onSelect
}: {
  scenario: ScenarioInput;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = scenarioIcons[scenario.type];
  const delta = scenario.monthlyIncomeDelta - scenario.monthlyExpenseDelta - scenario.monthlyDebtPaymentDelta;
  const tone = scenario.tags.some((tag) => tag.toLowerCase().includes("high")) ? "danger" : selected ? "success" : "blue";

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "glass-panel flex min-h-44 cursor-pointer flex-col items-start justify-between rounded-2xl p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "border-blue-400/[0.45] bg-gradient-to-br from-blue-500/[0.16] to-violet-500/[0.12] shadow-glow"
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-blue-200">
          <Icon />
        </span>
        <Badge variant={tone}>{scenario.tags[0]}</Badge>
      </div>
      <div>
        <h3 className="font-black">{scenario.name}</h3>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          {delta >= 0 ? "+" : ""}
          {formatCurrency(delta)} /mo
        </p>
      </div>
      <Button className="w-full" variant={selected ? "default" : "secondary"} size="sm">
        {selected ? "Selected" : "Simulate"}
      </Button>
    </motion.div>
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
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-2 text-primary"><span className="h-0.5 w-3 bg-chart-1" />Current</span>
          <span className="flex items-center gap-2 text-positive"><span className="h-0.5 w-3 bg-chart-2" />After</span>
        </div>
      }
    >
      <div className="h-56">
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

function RecommendationPanel({ selected }: { selected: ScenarioInput }) {
  const comparison = useMemo(() => compareScenario(sampleProfile, selected), [selected]);

  return (
    <Card id="insights" className="relative overflow-hidden border-violet-400/25 bg-gradient-to-br from-violet-500/10 to-blue-500/[0.06]">
      <div className="absolute -right-10 -top-8 text-[11rem] font-black leading-none text-blue-300/5">AI</div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base normal-case tracking-normal">
          <NovaOrb className="size-7" />
          NOVA Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="relative grid gap-3">
        {comparison.recommendations.slice(0, 4).map((recommendation, index) => (
          <motion.div
            key={recommendation}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="flex gap-3">
              <span className={cn("mt-1 size-2 rounded-full", index === 0 ? "bg-emerald-400" : index === 1 ? "bg-amber-400" : "bg-blue-400")} />
              <p className="text-sm leading-6 text-muted-foreground">{recommendation}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProjectionBars({ selected }: { selected: ScenarioInput }) {
  const comparison = useMemo(() => compareScenario(sampleProfile, selected), [selected]);
  const current = [
    { label: "Savings", value: 42 },
    { label: "Debt Payoff", value: 61 },
    { label: "Investment", value: 18 },
    { label: "Emergency", value: 85 }
  ];
  const after = [
    { label: "Savings", value: Math.round(Math.min(100, 42 + comparison.delta.savings12Month / 1500)) },
    { label: "Debt Payoff", value: Math.round(Math.max(0, 61 - comparison.delta.debtPayment / 140)) },
    { label: "Investment", value: selected.type === "investment" ? 49 : 23 },
    { label: "Emergency", value: Math.round(comparison.after.emergencyFundMonths * 20) }
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[{ title: "Current Path Projection (12mo)", rows: current }, { title: `After Decision: ${selected.name}`, rows: after }].map((group) => (
        <Card key={group.title} className={group.title.startsWith("After") ? "border-emerald-400/25 bg-emerald-400/10" : ""}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {group.rows.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>{item.label}</span>
                  <span className="text-foreground">{item.value}%</span>
                </div>
                <Progress value={item.value} indicatorClassName={item.label.includes("Debt") ? "bg-amber-400" : "bg-emerald-400"} />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TwinSummary({ selected }: { selected: ScenarioInput }) {
  const comparison = useMemo(() => compareScenario(sampleProfile, selected), [selected]);
  const data = [
    { name: "Cash", value: comparison.after.profile.assets.cash, color: chartTheme.after },
    { name: "Invested", value: comparison.after.profile.assets.investments + comparison.after.profile.assets.retirement, color: chartTheme.current },
    { name: "Real estate", value: comparison.after.profile.assets.realEstate, color: chartTheme.comparison },
    { name: "Debt", value: comparison.after.monthlyDebtPayment * 24, color: "hsl(var(--caution))" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="text-blue-300" />
          Financial Twin
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-[180px_1fr]">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={4}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3">
          <MiniMetric label="Risk Profile" value={`${comparison.after.risk.level} (${comparison.after.risk.score})`} />
          <MiniMetric label="Emergency Fund" value={`${comparison.after.emergencyFundMonths.toFixed(1)} months`} />
          <MiniMetric label="Decision Impact" value={`${comparison.delta.healthScore >= 0 ? "+" : ""}${comparison.delta.healthScore} health`} />
        </div>
      </CardContent>
    </Card>
  );
}

function GoalTracker() {
  const goals = forecastGoalCompletion(sampleProfile).slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Tracker</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold">{goal.name}</span>
              <span className="text-xs text-muted-foreground">{goal.monthsRemaining} mo</span>
            </div>
            <Progress value={goal.progress} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentSimulations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Simulations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {activityFeed.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3">
            <Lightbulb className="mt-0.5 text-blue-300" />
            <p className="text-sm text-muted-foreground">{item}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardClient() {
  const [selected, setSelected] = useState(scenarioLibrary[1] ?? scenarioLibrary[0]);
  const overview = useMemo(() => buildFinancialOverview(sampleProfile, selected), [selected]);
  const barData = [
    { label: "Income", value: overview.flow.monthlyIncome },
    { label: "Expenses", value: overview.flow.monthlyExpenses },
    { label: "Obligations", value: overview.flow.monthlyDebtPayment },
    { label: "Surplus", value: overview.metrics.find((metric) => metric.id === "monthly-surplus")?.rawValue ?? 0 }
  ];

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
      <AppPageHeader
        title="Twin Cockpit"
        description="A live financial command center where NOVA compares decisions, risk, cash flow, savings, debt, and goals in real time."
        action={
          <Button
            variant="glass"
            onClick={() => {
              setSelected(scenarioLibrary[1] ?? scenarioLibrary[0]);
              toast.success("Simulation reverted to recommended investment scenario.");
            }}
          >
            <Undo2 data-icon="inline-start" />
            Undo Simulation
          </Button>
        }
      />
      <IdentityHeader overview={overview} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {scenarioLibrary.slice(0, 4).map((scenario) => (
            <ScenarioTile
              key={scenario.id}
              scenario={scenario}
              selected={selected.id === scenario.id}
              onSelect={() => setSelected(scenario)}
            />
          ))}
        </div>
        <div className="grid gap-6">
          <CashFlowChart overview={overview} />
          <RecommendationPanel selected={selected} />
        </div>
      </div>
      <ProjectionBars selected={selected} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <TwinSummary selected={selected} />
        <GoalTracker />
        <RecentSimulations />
      </div>
      <Card className="border-blue-400/20">
        <CardHeader>
          <CardTitle>Monthly Flow Composition</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="label" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="value" fill={chartTheme.current} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
