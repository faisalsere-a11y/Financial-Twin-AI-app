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
import { AppPageHeader, MiniMetric, NovaOrb } from "@/components/layout/app-shell";
import { calculateFinancialTwin, compareScenario, forecastGoalCompletion } from "@/lib/financial/engine";
import { activityFeed, sampleProfile, scenarioLibrary } from "@/lib/financial/sample-data";
import type { ScenarioInput } from "@/lib/financial/types";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

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
        <circle cx="32" cy="32" r="25" stroke="rgba(255,255,255,.08)" strokeWidth="5" fill="none" />
        <motion.circle
          cx="32"
          cy="32"
          r="25"
          stroke="#3b82f6"
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

function MetricCard({
  title,
  value,
  sub,
  accent = "green",
  children
}: {
  title: string;
  value: string;
  sub?: string;
  accent?: "green" | "blue" | "amber" | "rose";
  children?: React.ReactNode;
}) {
  const accentClass = {
    green: "from-emerald-400/[0.55] to-emerald-400/0",
    blue: "from-blue-400/[0.55] to-blue-400/0",
    amber: "from-amber-400/[0.55] to-amber-400/0",
    rose: "from-rose-400/[0.55] to-rose-400/0"
  }[accent];

  return (
    <Card className="relative min-h-32 overflow-hidden">
      <div className={cn("absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t opacity-35", accentClass)} />
      <CardHeader className="pb-3">
        <CardTitle className="text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-black tracking-tight">{value}</div>
        {sub && <div className="mt-1 text-xs font-semibold text-muted-foreground">{sub}</div>}
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}

function IdentityHeader({ selected }: { selected: ScenarioInput }) {
  const twin = calculateFinancialTwin(sampleProfile);
  const comparison = compareScenario(sampleProfile, selected);

  return (
    <Card id="twin" className="glass-panel-strong border-blue-400/25 bg-gradient-to-br from-blue-500/10 via-white/[0.035] to-violet-500/10">
      <div className="scanline pointer-events-none absolute inset-0 opacity-15" />
      <CardContent className="relative grid gap-5 p-5 xl:grid-cols-[1.1fr_auto_1.7fr] xl:items-center">
        <div className="flex items-center gap-5">
          <div className="relative flex size-20 items-center justify-center rounded-3xl border border-blue-400/20 bg-white/[0.04] shadow-glow">
            <NovaOrb className="size-12" />
            <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-[#05080f] bg-emerald-400 text-[9px] font-black text-emerald-950">
              AI
            </span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Digital twin active</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Ahmed Al-Harbi</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="success">Twin Active</Badge>
              <Badge variant="blue">NOVA synced</Badge>
              <span className="text-xs text-muted-foreground">Last synced 2 min ago</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-border xl:border-l xl:border-r xl:px-6">
          <HealthRing score={twin.financialHealth.score} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Health Score</p>
            <p className="font-bold text-emerald-300">{twin.financialHealth.band}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniMetric label="Net Worth" value={formatCurrency(twin.netWorth)} />
          <MiniMetric label="Monthly Surplus" value={formatCurrency(twin.monthlySurplus)} />
          <MiniMetric label="Debt Ratio" value={formatPercent(comparison.after.debtRatio)} />
          <MiniMetric label="Savings Rate" value={formatPercent(twin.savingsRate)} />
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

function CashFlowChart({ selected }: { selected: ScenarioInput }) {
  const comparison = useMemo(() => compareScenario(sampleProfile, selected), [selected]);
  const data = comparison.current.timeline.map((point, index) => ({
    month: point.month,
    current: Math.round(point.cashFlow + index * 110),
    after: Math.round((comparison.after.timeline[index]?.cashFlow ?? point.cashFlow) + index * 260)
  }));

  return (
    <Card className="min-h-72">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>Future Cash Flow Timeline</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Current path vs after decision</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-2 text-blue-300"><span className="h-0.5 w-3 bg-blue-400" />Current</span>
          <span className="flex items-center gap-2 text-emerald-300"><span className="h-0.5 w-3 bg-emerald-400" />After</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="after" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="current" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.26} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0d1423", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }} />
              <Area type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} fill="url(#current)" />
              <Area type="monotone" dataKey="after" stroke="#10b981" strokeWidth={2.5} strokeDasharray="6 5" fill="url(#after)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
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
    { name: "Cash", value: comparison.after.profile.assets.cash, color: "#10b981" },
    { name: "Invested", value: comparison.after.profile.assets.investments + comparison.after.profile.assets.retirement, color: "#3b82f6" },
    { name: "Real estate", value: comparison.after.profile.assets.realEstate, color: "#8b5cf6" },
    { name: "Debt", value: comparison.after.monthlyDebtPayment * 24, color: "#f6b50e" }
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
              <Tooltip contentStyle={{ background: "#0d1423", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }} />
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
  const twin = calculateFinancialTwin(sampleProfile);
  const comparison = compareScenario(sampleProfile, selected);
  const barData = [
    { label: "Income", value: twin.monthlyIncome },
    { label: "Expenses", value: twin.monthlyExpenses },
    { label: "Obligations", value: twin.monthlyDebtPayment },
    { label: "Surplus", value: twin.monthlySurplus }
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
      <IdentityHeader selected={selected} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Monthly Income" value={formatCurrency(twin.monthlyIncome)} accent="green" />
        <MetricCard title="Monthly Expenses" value={formatCurrency(twin.monthlyExpenses)} accent="amber">
          <div className="flex gap-1">
            <span className="h-1.5 flex-1 rounded bg-amber-400" />
            <span className="h-1.5 flex-[0.7] rounded bg-amber-500/60" />
            <span className="h-1.5 flex-[0.55] rounded bg-amber-600/40" />
          </div>
        </MetricCard>
        <MetricCard title="Savings Balance" value={formatCurrency(sampleProfile.assets.cash)} accent="blue" />
        <MetricCard title="Obligations" value={`${formatCurrency(twin.monthlyDebtPayment)}/mo`} accent="rose">
          <Badge variant="blue">2 scheduled next week</Badge>
        </MetricCard>
        <MetricCard title="Risk Profile" value={comparison.after.risk.level} sub={comparison.after.risk.explanation} accent="amber" />
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
          <CashFlowChart selected={selected} />
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
              <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
              <XAxis dataKey="label" stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0d1423", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
