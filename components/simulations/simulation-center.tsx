"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useForm, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { NovaOrb } from "@/components/brand/nova-orb";
import { ChartFrame } from "@/components/data/chart-frame";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compareScenario } from "@/lib/financial/engine";
import { sampleScenario, scenarioLibrary } from "@/lib/financial/sample-data";
import type { ScenarioComparison, ScenarioInput } from "@/lib/financial/types";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { chartTheme, chartTooltipStyle } from "@/lib/presentation/chart-theme";
import { buildNovaDecisionView, type AdvisorSource } from "@/lib/presentation/nova-decision";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";

const isGitHubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";

const formSchema = z
  .object({
    price: z.coerce.number().positive("Enter a vehicle price above zero."),
    downPayment: z.coerce.number().min(0, "Down payment cannot be negative."),
    interest: z.coerce.number().min(0, "Interest cannot be negative.").max(100, "Interest must be 100% or less."),
    loanYears: z.coerce.number().int().min(1, "Use at least one year.").max(12, "Use 12 years or less."),
    insurance: z.coerce.number().min(0, "Insurance cannot be negative."),
    fuel: z.coerce.number().min(0, "Fuel cannot be negative."),
    maintenance: z.coerce.number().min(0, "Maintenance cannot be negative."),
    expectedResale: z.coerce.number().min(0, "Resale value cannot be negative."),
    incomeChange: z.coerce.number()
  })
  .superRefine((values, context) => {
    if (values.downPayment > values.price) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["downPayment"], message: "Down payment cannot exceed the vehicle price." });
    }
  });

type SimulationForm = z.infer<typeof formSchema>;
type SimulationResponse = { comparison: ScenarioComparison; advice: string[]; advisorSource: AdvisorSource };

const defaults: SimulationForm = {
  price: 142000,
  downPayment: 35000,
  interest: 5.9,
  loanYears: 5,
  insurance: 380,
  fuel: 280,
  maintenance: 160,
  expectedResale: 72000,
  incomeChange: 0
};

function calculateMonthlyPayment(values: SimulationForm) {
  const principal = Math.max(0, values.price - values.downPayment);
  const months = Math.max(1, values.loanYears * 12);
  const monthlyRate = values.interest / 100 / 12;
  return monthlyRate ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)) : principal / months;
}

function customCarScenario(values: SimulationForm): ScenarioInput {
  return {
    id: "custom-buy-car",
    name: "Custom car purchase",
    type: "car",
    upfrontCost: values.downPayment,
    assetDelta: values.expectedResale / 0.86,
    liabilityDelta: Math.max(0, values.price - values.downPayment),
    monthlyIncomeDelta: values.incomeChange,
    monthlyExpenseDelta: values.insurance + values.fuel + values.maintenance,
    monthlyDebtPaymentDelta: Math.round(calculateMonthlyPayment(values)),
    annualReturnDelta: 0,
    durationMonths: values.loanYears * 12,
    tags: ["Custom inputs", "Vehicle", "Decision lab"]
  };
}

function FormField({
  id,
  label,
  error,
  children
}: {
  id: FieldPath<SimulationForm>;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SimulationCenter() {
  const { profile, source } = useFinancialProfile();
  const [mode, setMode] = useState<"library" | "custom">("library");
  const [selectedScenario, setSelectedScenario] = useState<ScenarioInput>(sampleScenario);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [status, setStatus] = useState<{ kind: "info" | "success" | "error"; message: string } | null>(null);
  const form = useForm<SimulationForm>({ resolver: zodResolver(formSchema), defaultValues: defaults, mode: "onBlur" });
  const values = form.watch();
  const monthlyPayment = useMemo(() => calculateMonthlyPayment(values), [values]);
  const selectedPreview = useMemo(() => compareScenario(profile, selectedScenario), [profile, selectedScenario]);

  useEffect(() => {
    const requestedScenario = new URLSearchParams(window.location.search).get("scenario");
    if (!requestedScenario) return;
    const match = scenarioLibrary.find((scenario) => scenario.type === requestedScenario || scenario.id === requestedScenario);
    if (match) setSelectedScenario(match);
  }, []);

  const mutation = useMutation({
    mutationFn: async (scenario: ScenarioInput): Promise<SimulationResponse> => {
      if (isGitHubPages) {
        const comparison = compareScenario(profile, scenario);
        return {
          comparison,
          advice: comparison.recommendations,
          advisorSource: "deterministic"
        };
      }

      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, profile })
      });
      const body = (await response.json().catch(() => null)) as (SimulationResponse & { error?: string }) | null;
      if (!response.ok || !body) throw new Error(body?.error ?? "The decision could not be analyzed.");
      return body;
    },
    onMutate: (scenario) => {
      setStatus({ kind: "info", message: `Analyzing ${scenario.name} against ${profile.name}'s active model.` });
    },
    onSuccess: (data) => {
      setResult(data);
      setStatus({ kind: "success", message: `${data.comparison.scenario.name} analysis complete.` });
    },
    onError: (error) => {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "The decision could not be analyzed." });
    }
  });

  const resetLab = () => {
    form.reset(defaults);
    setSelectedScenario(sampleScenario);
    setMode("library");
    setResult(null);
    setStatus(null);
    mutation.reset();
  };

  const selectScenario = (scenario: ScenarioInput) => {
    setSelectedScenario(scenario);
    setResult(null);
    setStatus(null);
    mutation.reset();
  };

  const nova = useMemo(
    () => result ? buildNovaDecisionView(result.comparison, { source: result.advisorSource, recommendations: result.advice }) : null,
    [result]
  );
  const chartData = result?.comparison.current.timeline.map((point, index) => ({
    month: point.month,
    current: Math.round(point.netWorth),
    after: Math.round(result.comparison.after.timeline[index]?.netWorth ?? point.netWorth)
  })) ?? [];
  const chartSummary = result
    ? `${result.comparison.scenario.name} changes projected 12-month net worth by ${formatCurrency(result.comparison.delta.netWorth12Month, profile.currency)}.`
    : "Run an analysis to compare current and after-decision net worth.";

  const errorFor = (name: FieldPath<SimulationForm>) => form.formState.errors[name]?.message as string | undefined;
  const numberField = (name: FieldPath<SimulationForm>) => form.register(name, { valueAsNumber: true });

  return (
    <div className="mx-auto max-w-[1440px]">
      <AppPageHeader
        eyebrow="Decision lab"
        title="Compare the next move before money moves"
        description="Choose a supported scenario or shape a custom vehicle purchase, then inspect the model evidence and NOVA explanation separately."
        action={<Button variant="outline" onClick={resetLab}><RotateCcw data-icon="inline-start" aria-hidden="true" />Reset lab</Button>}
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black">Active model: {profile.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{source === "saved" ? "Saved in this browser" : "Bundled sample profile"} · {profile.currency} · No bank synchronization</p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-muted p-1" aria-label="Decision input mode">
          <button type="button" aria-pressed={mode === "library"} onClick={() => setMode("library")} className={cn("rounded-lg px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", mode === "library" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Scenario library</button>
          <button type="button" aria-pressed={mode === "custom"} onClick={() => setMode("custom")} className={cn("rounded-lg px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", mode === "custom" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>Custom car builder</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg normal-case tracking-tight">{mode === "library" ? "Choose a decision" : "Custom car builder"}</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">{mode === "library" ? "Every option is backed by the existing scenario library." : "Adjust financing, ownership costs, resale, and income change."}</p>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            {mode === "library" ? (
              <div className="grid gap-4">
                <div role="radiogroup" aria-label="Scenario library" className="grid gap-3 sm:grid-cols-2">
                  {scenarioLibrary.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      role="radio"
                      aria-checked={selectedScenario.id === scenario.id}
                      onClick={() => selectScenario(scenario)}
                      className={cn(
                        "min-h-36 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selectedScenario.id === scenario.id ? "border-primary/35 bg-primary/10" : "border-border bg-background/55 hover:bg-muted/70"
                      )}
                    >
                      <span className="font-black text-foreground">{scenario.name}</span>
                      <span className="mt-2 block text-sm tabular-nums text-muted-foreground">{formatCurrency(scenario.upfrontCost, profile.currency)} upfront · {scenario.durationMonths} months</span>
                      <span className="mt-3 flex flex-wrap gap-1.5">{scenario.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">Selected model delta</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="block text-muted-foreground">Monthly surplus</span><strong className="tabular-nums">{formatCurrency(selectedPreview.after.monthlySurplus, profile.currency)}</strong></div>
                    <div><span className="block text-muted-foreground">Health after</span><strong>{selectedPreview.after.financialHealth.score}/100</strong></div>
                  </div>
                </div>
                <Button size="lg" onClick={() => mutation.mutate(selectedScenario)} disabled={mutation.isPending}>Analyze selected scenario<ArrowRight data-icon="inline-end" aria-hidden="true" /></Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit((submitted) => mutation.mutate(customCarScenario(submitted)))} noValidate className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="price">Vehicle price</Label>
                    <Input id="price" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("price"))} aria-describedby={errorFor("price") ? "price-error" : undefined} {...numberField("price")} />
                    {errorFor("price") && <p id="price-error" role="alert" className="text-sm text-destructive">{errorFor("price")}</p>}
                  </div>
                  <FormField id="downPayment" label="Down payment" error={errorFor("downPayment")}><Input id="downPayment" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("downPayment"))} aria-describedby={errorFor("downPayment") ? "downPayment-error" : undefined} {...numberField("downPayment")} /></FormField>
                  <FormField id="interest" label="Annual interest %" error={errorFor("interest")}><Input id="interest" type="number" min={0} step="0.1" inputMode="decimal" aria-invalid={Boolean(errorFor("interest"))} aria-describedby={errorFor("interest") ? "interest-error" : undefined} {...numberField("interest")} /></FormField>
                  <FormField id="loanYears" label="Loan years" error={errorFor("loanYears")}><Input id="loanYears" type="number" min={1} max={12} inputMode="numeric" aria-invalid={Boolean(errorFor("loanYears"))} aria-describedby={errorFor("loanYears") ? "loanYears-error" : undefined} {...numberField("loanYears")} /></FormField>
                  <FormField id="insurance" label="Insurance / month" error={errorFor("insurance")}><Input id="insurance" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("insurance"))} aria-describedby={errorFor("insurance") ? "insurance-error" : undefined} {...numberField("insurance")} /></FormField>
                  <FormField id="fuel" label="Fuel / month" error={errorFor("fuel")}><Input id="fuel" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("fuel"))} aria-describedby={errorFor("fuel") ? "fuel-error" : undefined} {...numberField("fuel")} /></FormField>
                  <FormField id="maintenance" label="Maintenance / month" error={errorFor("maintenance")}><Input id="maintenance" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("maintenance"))} aria-describedby={errorFor("maintenance") ? "maintenance-error" : undefined} {...numberField("maintenance")} /></FormField>
                  <FormField id="expectedResale" label="Expected resale value" error={errorFor("expectedResale")}><Input id="expectedResale" type="number" min={0} inputMode="decimal" aria-invalid={Boolean(errorFor("expectedResale"))} aria-describedby={errorFor("expectedResale") ? "expectedResale-error" : undefined} {...numberField("expectedResale")} /></FormField>
                  <FormField id="incomeChange" label="Monthly income change" error={errorFor("incomeChange")}><Input id="incomeChange" type="number" inputMode="decimal" aria-invalid={Boolean(errorFor("incomeChange"))} aria-describedby={errorFor("incomeChange") ? "incomeChange-error" : undefined} {...numberField("incomeChange")} /></FormField>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Estimated monthly debt payment</p>
                  <p className="mt-1 text-2xl font-black tabular-nums">{Number.isFinite(monthlyPayment) ? formatCurrency(monthlyPayment, profile.currency) : "—"}</p>
                </div>
                <Button type="submit" size="lg" disabled={mutation.isPending}><SlidersHorizontal data-icon="inline-start" aria-hidden="true" />Analyze custom scenario</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {status && (
            <div aria-live="polite" role={status.kind === "error" ? "alert" : "status"} className={status.kind === "error" ? "rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive" : status.kind === "success" ? "rounded-xl border border-positive/25 bg-positive/10 p-4 text-sm text-positive" : "rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm text-foreground"}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{status.message}</span>
                {status.kind === "error" && mutation.variables && <Button type="button" size="sm" variant="outline" onClick={() => mutation.mutate(mutation.variables)}>Retry analysis</Button>}
              </div>
            </div>
          )}

          {mutation.isPending ? (
            <Card aria-live="polite">
              <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
                <NovaOrb className="size-14 animate-pulse" />
                <div><p className="font-black">Recalculating the financial twin</p><p className="mt-2 text-sm text-muted-foreground">Comparing cash flow, debt, reserves, risk, health, and timeline.</p></div>
              </CardContent>
            </Card>
          ) : result && nova ? (
            <>
              <ChartFrame
                title="Current and after-decision net worth"
                description={`${result.comparison.scenario.name} · 12-month deterministic projection`}
                summary={chartSummary}
                action={<div className="flex gap-3 text-xs"><span className="text-primary">Current</span><span className="text-positive">After</span></div>}
              >
                <div className="h-72" aria-label="Current and after decision net worth">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                      <XAxis dataKey="month" stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                      <YAxis stroke={chartTheme.axis} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area type="monotone" dataKey="current" stroke={chartTheme.current} fill={chartTheme.current} fillOpacity={0.1} />
                      <Area type="monotone" dataKey="after" stroke={chartTheme.after} fill={chartTheme.after} fillOpacity={0.12} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartFrame>

              <Card>
                <CardHeader className="border-b border-border">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg normal-case tracking-tight"><NovaOrb className="size-8" />NOVA decision brief</CardTitle>
                    <Badge variant={nova.provenance.source === "openai" ? "blue" : "secondary"}>{nova.provenance.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-5 sm:p-6">
                  <section aria-labelledby="nova-recommendation-title" className={cn("rounded-2xl border p-5", nova.recommendation.tone === "danger" ? "border-destructive/25 bg-destructive/10" : nova.recommendation.tone === "caution" ? "border-caution/25 bg-caution/10" : "border-positive/25 bg-positive/10")}>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Recommendation</p>
                    <h2 id="nova-recommendation-title" className="mt-2 text-xl font-black">{nova.recommendation.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{nova.recommendation.summary}</p>
                  </section>

                  <section aria-labelledby="nova-evidence-title">
                    <h2 id="nova-evidence-title" className="text-sm font-black">Engine evidence</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {nova.evidence.map((item) => <div key={item.id} className="rounded-xl border border-border bg-background/55 p-4"><p className="text-xs font-bold text-muted-foreground">{item.label}</p><p className="mt-1 text-lg font-black tabular-nums">{item.value}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p></div>)}
                    </div>
                  </section>

                  <section aria-labelledby="nova-confidence-title" className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-4"><h2 id="nova-confidence-title" className="text-sm font-black">Model confidence</h2><Badge variant={nova.confidence.level === "High" ? "success" : nova.confidence.level === "Medium" ? "warning" : "danger"}>{nova.confidence.level} · {nova.confidence.score}</Badge></div>
                    <Progress value={nova.confidence.score} className="mt-3" />
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{nova.confidence.basis}</p>
                  </section>

                  {nova.advisorNotes.length > 0 && <section aria-labelledby="nova-notes-title"><h2 id="nova-notes-title" className="text-sm font-black">Advisor notes</h2><div className="mt-3 grid gap-2">{nova.advisorNotes.map((note) => <p key={note} className="rounded-xl border border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">{note}</p>)}</div></section>}

                  <section aria-labelledby="nova-assumptions-title">
                    <h2 id="nova-assumptions-title" className="text-sm font-black">Assumptions and limits</h2>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">{nova.assumptions.map((assumption) => <li key={assumption} className="flex gap-2"><span aria-hidden="true">•</span><span>{assumption}</span></li>)}</ul>
                    <p className="mt-4 flex gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />{nova.boundary}</p>
                  </section>

                  <div className="flex flex-wrap gap-3">{nova.actions.map((action) => <Button key={action.href} variant="outline" asChild><Link href={action.href}>{action.label}<ArrowRight data-icon="inline-end" aria-hidden="true" /></Link></Button>)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm normal-case tracking-tight">Current versus after</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Metric</TableHead><TableHead>Current</TableHead><TableHead>After</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {[
                        ["Monthly surplus", formatCurrency(result.comparison.current.monthlySurplus, profile.currency), formatCurrency(result.comparison.after.monthlySurplus, profile.currency)],
                        ["Debt payment ratio", formatPercent(result.comparison.current.debtRatio, 1), formatPercent(result.comparison.after.debtRatio, 1)],
                        ["Emergency runway", `${result.comparison.current.emergencyFundMonths.toFixed(1)} months`, `${result.comparison.after.emergencyFundMonths.toFixed(1)} months`],
                        ["Financial health", `${result.comparison.current.financialHealth.score}/100`, `${result.comparison.after.financialHealth.score}/100`]
                      ].map(([label, current, after]) => <TableRow key={label}><TableCell className="font-semibold">{label}</TableCell><TableCell>{current}</TableCell><TableCell>{after}</TableCell></TableRow>)}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
                <NovaOrb className="size-14" />
                <div><p className="font-black">Ready for a decision comparison</p><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Choose a supported scenario or customize a car purchase. No result is saved or applied to your profile unless you explicitly edit the financial model.</p></div>
              </CardContent>
            </Card>
          )}

          {mutation.isError && !status && <div role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle className="mr-2 inline size-4" aria-hidden="true" />The analysis could not be completed.</div>}
          {mutation.isSuccess && <p className="sr-only"><CheckCircle2 aria-hidden="true" />Analysis completed successfully.</p>}
        </div>
      </div>
    </div>
  );
}
