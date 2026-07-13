"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bitcoin, Building2, Landmark, PiggyBank, ShieldCheck, TrendingUp } from "lucide-react";
import { ChartFrame } from "@/components/data/chart-frame";
import { AppPageHeader } from "@/components/layout/app-shell";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { MotionCard } from "@/components/motion/motion-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { runInvestmentProjection, runMonteCarlo } from "@/lib/financial/investments";
import type { FinancialProfile } from "@/lib/financial/types";
import { chartTheme, chartTooltipStyle } from "@/lib/presentation/chart-theme";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { formatCurrency } from "@/lib/utils";

const presets = {
  Stocks: { return: 9, volatility: 17, icon: TrendingUp, description: "Broad equity assumption with meaningful year-to-year movement." },
  ETF: { return: 7.5, volatility: 11, icon: Landmark, description: "Diversified fund assumption with moderate modeled variability." },
  Crypto: { return: 14, volatility: 42, icon: Bitcoin, description: "Highly volatile assumption with a wide range of modeled outcomes." },
  Savings: { return: 3.2, volatility: 1.5, icon: PiggyBank, description: "Low-volatility cash-equivalent assumption with lower modeled growth." },
  "Mutual Funds": { return: 6.8, volatility: 9, icon: Landmark, description: "Diversified managed-fund assumption with moderate variability." },
  "Real Estate": { return: 5.5, volatility: 7, icon: Building2, description: "Property-growth assumption before fees, financing, or liquidity costs." }
};

type AssetType = keyof typeof presets;
const chartAnimationDuration = 420;

const inputSchema = z.object({
  initialAmount: z.coerce.number().min(0, "Initial amount cannot be negative.").max(1_000_000_000, "Initial amount is outside the supported range."),
  monthlyContribution: z.coerce.number().min(0, "Monthly contribution cannot be negative.").max(10_000_000, "Monthly contribution is outside the supported range."),
  years: z.coerce.number().int().min(1, "Use at least one year.").max(50, "Use 50 years or less.")
});

type InvestmentInputs = z.infer<typeof inputSchema>;

function defaultsForProfile(profile: FinancialProfile): InvestmentInputs {
  return {
    initialAmount: profile.assets.investments,
    monthlyContribution: profile.goals.find((goal) => goal.category === "Retirement")?.monthlyContribution ?? 1200,
    years: 10
  };
}

export function InvestmentSimulator() {
  const activeProfile = useFinancialProfile();
  const { subject, isLoaded, savedAt } = activeProfile;
  const profileKey = `${subject}:${savedAt ?? "sample"}`;
  if (!subject || !isLoaded) {
    return <div aria-live="polite"><AppPageHeader title="Explore return and risk ranges" description="Loading the active account model." /><Card><CardContent className="p-6 text-sm text-muted-foreground">Waiting for an authenticated account.</CardContent></Card></div>;
  }
  return <SubjectInvestmentSimulator key={profileKey} activeProfile={activeProfile} />;
}

function SubjectInvestmentSimulator({ activeProfile }: { activeProfile: ReturnType<typeof useFinancialProfile> }) {
  const { profile, source, subject, isLoaded } = activeProfile;
  const reduceMotion = useReducedMotion() === true;
  const hydratedSubject = useRef<string | null>(null);
  const [asset, setAsset] = useState<AssetType>("ETF");
  const form = useForm<InvestmentInputs>({
    resolver: zodResolver(inputSchema),
    defaultValues: defaultsForProfile(profile),
    mode: "onChange"
  });
  const watched = form.watch();

  useEffect(() => {
    if (!isLoaded || !subject || hydratedSubject.current === subject) return;
    form.reset(defaultsForProfile(profile));
    setAsset("ETF");
    hydratedSubject.current = subject;
  }, [form, isLoaded, profile, subject]);

  const parsed = inputSchema.safeParse(watched);
  const inputs = parsed.success ? parsed.data : defaultsForProfile(profile);
  const preset = presets[asset];
  const projection = useMemo(
    () => runInvestmentProjection({ ...inputs, annualReturn: preset.return, volatility: preset.volatility }),
    [inputs, preset.return, preset.volatility]
  );
  const monteCarlo = useMemo(
    () => runMonteCarlo({ ...inputs, annualReturn: preset.return, volatility: preset.volatility, iterations: 400, seed: 1337 }),
    [inputs, preset.return, preset.volatility]
  );
  const riskLevel = preset.volatility > 25 ? "High" : preset.volatility > 8 ? "Medium" : "Low";
  const Icon = preset.icon;
  const endingPoint = projection.points.at(-1);
  const projectionSummary = `After ${inputs.years} years, expected value is ${formatCurrency(projection.futureValue, profile.currency)}, with a conservative path of ${formatCurrency(endingPoint?.conservative ?? 0, profile.currency)} and an optimistic path of ${formatCurrency(endingPoint?.optimistic ?? 0, profile.currency)}.`;
  const rangeSummary = `The seeded simulation produces P10 ${formatCurrency(monteCarlo.p10, profile.currency)}, P50 ${formatCurrency(monteCarlo.median, profile.currency)}, and P90 ${formatCurrency(monteCarlo.p90, profile.currency)}.`;
  const summaryMetrics = [
    { label: "Expected value", value: projection.futureValue },
    { label: "Modeled gain", value: projection.gain },
    { label: "P10 lower outcome", value: monteCarlo.p10 },
    { label: "P50 median", value: monteCarlo.median }
  ];

  const initialError = form.formState.errors.initialAmount?.message;
  const contributionError = form.formState.errors.monthlyContribution?.message;
  const yearsError = form.formState.errors.years?.message;

  return (
    <div className="mx-auto min-w-0 max-w-[1320px]">
      <AppPageHeader
        eyebrow="Portfolio lab"
        title="Explore return and risk ranges"
        description="Project the active portfolio with compound growth and a deterministic seeded Monte Carlo range. Outputs are scenarios, not forecasts or guarantees."
      />

      <div className="mb-6 min-w-0 break-words rounded-2xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
        Starting amount comes from {source === "saved" ? `${profile.name}'s browser-saved profile` : "the bundled sample profile"}. Changes here are exploratory and do not overwrite the financial model.
      </div>

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[22rem_minmax(0,1fr)] 2xl:items-start">
        <Card className="min-w-0 border-primary/20 bg-primary/5 2xl:sticky 2xl:top-24">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg normal-case tracking-tight">Portfolio inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-5 p-5 sm:p-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="assetType">Asset assumption</Label>
              <Select id="assetType" value={asset} onValueChange={(value) => setAsset(value as AssetType)}>
                {Object.keys(presets).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </Select>
            </div>

            <Reveal key={asset} className="min-h-52 min-w-0 rounded-xl border border-border bg-background/60 p-4">
              <div className="flex min-w-0 items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="break-words font-black">{asset}</p><p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{preset.description}</p></div></div>
              <div className="mt-4 flex flex-wrap gap-2"><Badge variant="success">Return input {preset.return}%</Badge><Badge variant={riskLevel === "High" ? "danger" : riskLevel === "Medium" ? "warning" : "blue"}>Volatility {preset.volatility}%</Badge></div>
            </Reveal>

            <div className="flex flex-col gap-2">
              <Label htmlFor="initialAmount">Initial amount</Label>
              <Input id="initialAmount" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(initialError)} aria-describedby={initialError ? "initialAmount-error" : "initialAmount-note"} {...form.register("initialAmount", { valueAsNumber: true })} />
              <p id="initialAmount-note" className="text-xs text-muted-foreground">Defaults to current investments in the active profile.</p>
              {initialError && <p id="initialAmount-error" role="alert" className="text-sm text-destructive">{initialError}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="monthlyContribution">Monthly contribution</Label>
              <Input id="monthlyContribution" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(contributionError)} aria-describedby={contributionError ? "monthlyContribution-error" : undefined} {...form.register("monthlyContribution", { valueAsNumber: true })} />
              {contributionError && <p id="monthlyContribution-error" role="alert" className="text-sm text-destructive">{contributionError}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="years">Time horizon in years</Label>
              <Input id="years" type="number" min={1} max={50} inputMode="numeric" aria-invalid={Boolean(yearsError)} aria-describedby={yearsError ? "years-error" : undefined} {...form.register("years", { valueAsNumber: true })} />
              {yearsError && <p id="years-error" role="alert" className="text-sm text-destructive">{yearsError}</p>}
            </div>

            <div className="rounded-xl border border-caution/20 bg-caution/10 p-4 text-xs leading-5 text-muted-foreground">
              <strong className="text-foreground">Risk interpretation.</strong> Volatility is the model&apos;s annual return dispersion assumption; it is not a maximum loss. Taxes, fees, inflation, liquidity, and sequence risk are not modeled.
            </div>
          </CardContent>
        </Card>

        <div className="grid min-w-0 gap-6">
          <Stagger aria-live="polite" className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] items-stretch gap-4">
            {summaryMetrics.map((metric) => (
              <StaggerItem key={metric.label} className="h-full min-w-0">
                <MotionCard interactive={false} className="h-full min-w-0">
                  <CardContent className="min-w-0 p-5">
                    <p className="break-words text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{metric.label}</p>
                    <p className="mt-2 min-w-0 font-black tracking-tight text-foreground">
                      <AnimatedNumber
                        value={metric.value}
                        format={(value) => formatCurrency(value, profile.currency)}
                        wrap
                        className="min-w-0 max-w-full text-xl sm:text-2xl"
                      />
                    </p>
                  </CardContent>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="min-w-0">
            <ChartFrame
              title="Compound growth range"
              description={`${asset} · ${inputs.years} years · contributions included`}
              summary={projectionSummary}
              action={<div className="flex flex-wrap gap-3 text-xs"><span className="text-caution">Conservative</span><span className="text-primary">Expected</span><span className="text-positive">Optimistic</span></div>}
            >
              <div className="h-80 min-w-0 overflow-hidden" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={projection.points}>
                    <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="year" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="optimistic" stroke={chartTheme.after} fill={chartTheme.after} fillOpacity={0.08} isAnimationActive={!reduceMotion} animationDuration={chartAnimationDuration} />
                    <Area type="monotone" dataKey="expected" stroke={chartTheme.current} fill={chartTheme.current} fillOpacity={0.1} isAnimationActive={!reduceMotion} animationDuration={chartAnimationDuration} />
                    <Area type="monotone" dataKey="conservative" stroke={chartTheme.comparison} fill={chartTheme.comparison} fillOpacity={0.06} isAnimationActive={!reduceMotion} animationDuration={chartAnimationDuration} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartFrame>
          </Reveal>

          <Reveal className="min-w-0">
            <ChartFrame
              title="Monte Carlo percentile paths"
              description="400 seeded iterations · Deterministic seed: 1337"
              summary={rangeSummary}
              action={<div className="flex flex-wrap gap-3 text-xs"><span className="text-caution">P10</span><span className="text-primary">P50</span><span className="text-positive">P90</span></div>}
            >
              <div className="h-80 min-w-0 overflow-hidden" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={monteCarlo.paths}>
                    <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                    <XAxis dataKey="month" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="optimistic" stroke={chartTheme.after} strokeWidth={2} dot={false} isAnimationActive={!reduceMotion} animationDuration={chartAnimationDuration} />
                    <Line type="monotone" dataKey="expected" stroke={chartTheme.current} strokeWidth={2} dot={false} isAnimationActive={!reduceMotion} animationDuration={chartAnimationDuration} />
                    <Line type="monotone" dataKey="pessimistic" stroke={chartTheme.comparison} strokeWidth={2} dot={false} isAnimationActive={!reduceMotion} animationDuration={chartAnimationDuration} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartFrame>
          </Reveal>

          <Card className="min-w-0">
            <CardHeader><CardTitle className="text-sm normal-case tracking-tight">How to read this range</CardTitle></CardHeader>
            <CardContent className="grid min-w-0 gap-3 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
              <p className="min-w-0 break-words"><strong className="text-foreground">P10</strong> means 10% of seeded runs ended at or below {formatCurrency(monteCarlo.p10, profile.currency)}.</p>
              <p className="min-w-0 break-words"><strong className="text-foreground">P50</strong> is the median seeded result: {formatCurrency(monteCarlo.median, profile.currency)}.</p>
              <p className="min-w-0 break-words"><strong className="text-foreground">P90</strong> means 90% ended at or below {formatCurrency(monteCarlo.p90, profile.currency)}.</p>
              <p className="flex min-w-0 gap-2 break-words sm:col-span-3"><ShieldCheck className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />Returns are not guaranteed. These ranges are educational outputs from fixed assumptions, not market predictions or investment advice.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
