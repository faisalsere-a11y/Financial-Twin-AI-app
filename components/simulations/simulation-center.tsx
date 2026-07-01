"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Heart, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sampleScenario } from "@/lib/financial/sample-data";
import type { ScenarioComparison } from "@/lib/financial/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

const formSchema = z.object({
  price: z.coerce.number().min(0),
  downPayment: z.coerce.number().min(0),
  interest: z.coerce.number().min(0),
  loanYears: z.coerce.number().min(1),
  insurance: z.coerce.number().min(0),
  fuel: z.coerce.number().min(0),
  maintenance: z.coerce.number().min(0),
  expectedResale: z.coerce.number().min(0),
  incomeChange: z.coerce.number()
});

type SimulationForm = z.infer<typeof formSchema>;
type SimulationResponse = { comparison: ScenarioComparison; advice: string[] };

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function SimulationCenter() {
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const form = useForm<SimulationForm>({ resolver: zodResolver(formSchema), defaultValues: defaults });
  const values = form.watch();
  const monthlyPayment = useMemo(() => {
    const principal = Math.max(0, values.price - values.downPayment);
    const months = values.loanYears * 12;
    const monthlyRate = values.interest / 100 / 12;
    return monthlyRate ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)) : principal / months;
  }, [values]);

  const mutation = useMutation({
    mutationFn: async (payload: SimulationForm) => {
      const response = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "custom-buy-car",
          name: "Buy a Car",
          type: "car",
          upfrontCost: payload.downPayment,
          assetDelta: payload.price,
          liabilityDelta: Math.max(0, payload.price - payload.downPayment),
          monthlyIncomeDelta: payload.incomeChange,
          monthlyExpenseDelta: payload.insurance + payload.fuel + payload.maintenance,
          monthlyDebtPaymentDelta: Math.round(monthlyPayment),
          annualReturnDelta: 0,
          durationMonths: payload.loanYears * 12,
          tags: ["Custom", "Car", "Decision"]
        })
      });
      if (!response.ok) throw new Error("Simulation failed");
      return (await response.json()) as SimulationResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success("Simulation complete. Your twin has been updated.");
    },
    onError: () => toast.error("Simulation could not run.")
  });

  const chartData = (result?.comparison ?? null)?.current.timeline.map((point, index) => ({
    month: point.month,
    current: Math.round(point.netWorth),
    after: Math.round(result?.comparison.after.timeline[index]?.netWorth ?? point.netWorth)
  }));

  return (
    <div className="mx-auto max-w-[1280px]">
      <AppPageHeader
        title="Simulation Center"
        description="Create scenarios, run the financial twin, and compare the current timeline against the future after a decision."
        action={
          <Button variant="glass" onClick={() => { form.reset(defaults); setResult(null); }}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="normal-case tracking-normal">Buy a Car Scenario</CardTitle>
            <p className="text-sm text-muted-foreground">Price, down payment, interest, loan years, insurance, fuel, maintenance, resale, and income change.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit((payload) => mutation.mutate(payload))} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Price"><Input type="number" {...form.register("price")} /></Field>
                <Field label="Down Payment"><Input type="number" {...form.register("downPayment")} /></Field>
                <Field label="Interest %"><Input type="number" step="0.1" {...form.register("interest")} /></Field>
                <Field label="Loan Years"><Input type="number" {...form.register("loanYears")} /></Field>
                <Field label="Insurance / mo"><Input type="number" {...form.register("insurance")} /></Field>
                <Field label="Fuel / mo"><Input type="number" {...form.register("fuel")} /></Field>
                <Field label="Maintenance / mo"><Input type="number" {...form.register("maintenance")} /></Field>
                <Field label="Expected Resale"><Input type="number" {...form.register("expectedResale")} /></Field>
                <Field label="Monthly Income Change"><Input type="number" {...form.register("incomeChange")} /></Field>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Estimated monthly debt payment</p>
                <p className="mt-1 text-2xl font-black">{formatCurrency(monthlyPayment)}</p>
              </div>
              <Button disabled={mutation.isPending}>
                <Wand2 data-icon="inline-start" />
                {mutation.isPending ? "Running Simulation..." : "Run Simulation"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparison Output</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="grid gap-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <Badge variant="success">Cash Flow {formatCurrency(result.comparison.after.monthlySurplus)}</Badge>
                    <Badge variant="warning">Debt {formatPercent(result.comparison.after.debtRatio, 1)}</Badge>
                    <Badge variant="blue">Risk {result.comparison.after.risk.level}</Badge>
                    <Badge variant="success">Health {result.comparison.after.financialHealth.score}</Badge>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "#0d1423", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }} />
                        <Area dataKey="current" stroke="#2f7cff" fill="#2f7cff22" />
                        <Area dataKey="after" stroke="#16d69a" fill="#16d69a22" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ["Savings", result.comparison.current.timeline.at(-1)?.savings, result.comparison.after.timeline.at(-1)?.savings],
                        ["Debt", result.comparison.current.timeline.at(-1)?.debt, result.comparison.after.timeline.at(-1)?.debt],
                        ["Cash Flow", result.comparison.current.monthlySurplus, result.comparison.after.monthlySurplus]
                      ].map(([label, current, after]) => (
                        <TableRow key={label as string}>
                          <TableCell className="font-semibold">{label}</TableCell>
                          <TableCell>{formatCurrency(Number(current))}</TableCell>
                          <TableCell>{formatCurrency(Number(after))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                  <Sparkles className="text-primary" />
                  <p>Run a simulation to generate updated cash flow, savings, debt, risk, timeline, and charts.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>AI Explanation</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => toast.success("Scenario added to favorites.")} aria-label="Favorite">
                <Heart />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(result?.advice ?? sampleScenario.tags.map((tag) => `Ready to analyze: ${tag}`)).map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-background/45 p-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
