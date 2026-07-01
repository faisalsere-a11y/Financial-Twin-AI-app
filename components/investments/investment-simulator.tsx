"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bitcoin, Building2, Landmark, PiggyBank, TrendingUp } from "lucide-react";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { runInvestmentProjection, runMonteCarlo } from "@/lib/financial/investments";
import { formatCurrency } from "@/lib/utils";

const presets = {
  Stocks: { return: 9, volatility: 17, icon: TrendingUp },
  ETF: { return: 7.5, volatility: 11, icon: Landmark },
  Crypto: { return: 14, volatility: 42, icon: Bitcoin },
  Savings: { return: 3.2, volatility: 1.5, icon: PiggyBank },
  "Mutual Funds": { return: 6.8, volatility: 9, icon: Landmark },
  "Real Estate": { return: 5.5, volatility: 7, icon: Building2 }
};

type AssetType = keyof typeof presets;

export function InvestmentSimulator() {
  const [asset, setAsset] = useState<AssetType>("ETF");
  const [initialAmount, setInitialAmount] = useState(52000);
  const [monthlyContribution, setMonthlyContribution] = useState(1200);
  const [years, setYears] = useState(10);
  const preset = presets[asset];
  const projection = useMemo(
    () => runInvestmentProjection({ initialAmount, monthlyContribution, annualReturn: preset.return, years, volatility: preset.volatility }),
    [initialAmount, monthlyContribution, preset.return, preset.volatility, years]
  );
  const monteCarlo = useMemo(
    () =>
      runMonteCarlo({
        initialAmount,
        monthlyContribution,
        annualReturn: preset.return,
        years,
        volatility: preset.volatility,
        iterations: 400,
        seed: 1337
      }),
    [initialAmount, monthlyContribution, preset.return, preset.volatility, years]
  );

  return (
    <div className="mx-auto max-w-[1280px]">
      <AppPageHeader
        title="Investment Simulator"
        description="Project stocks, ETF, crypto, savings, mutual funds, and real estate with compound growth and simple Monte Carlo simulation."
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>Asset Type</Label>
              <Select value={asset} onValueChange={(value) => setAsset(value as AssetType)}>
                {Object.keys(presets).map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="grid gap-3">
              <Label>Initial Amount</Label>
              <Input type="number" value={initialAmount} onChange={(event) => setInitialAmount(Number(event.target.value))} />
            </div>
            <div className="grid gap-3">
              <Label>Monthly Contribution</Label>
              <Input type="number" value={monthlyContribution} onChange={(event) => setMonthlyContribution(Number(event.target.value))} />
            </div>
            <div className="grid gap-3">
              <Label>Years</Label>
              <Input type="number" value={years} onChange={(event) => setYears(Number(event.target.value))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Badge variant="success">Return {preset.return}%</Badge>
              <Badge variant={preset.volatility > 20 ? "danger" : "blue"}>Risk {preset.volatility}%</Badge>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="p-5"><p className="text-xs font-bold uppercase text-muted-foreground">Future Value</p><p className="mt-2 text-2xl font-black">{formatCurrency(projection.futureValue)}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-xs font-bold uppercase text-muted-foreground">Gain</p><p className="mt-2 text-2xl font-black">{formatCurrency(projection.gain)}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-xs font-bold uppercase text-muted-foreground">Monte Carlo p10</p><p className="mt-2 text-2xl font-black">{formatCurrency(monteCarlo.p10)}</p></CardContent></Card>
            <Card><CardContent className="p-5"><p className="text-xs font-bold uppercase text-muted-foreground">Monte Carlo p90</p><p className="mt-2 text-2xl font-black">{formatCurrency(monteCarlo.p90)}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Compound Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.points}>
                  <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                  <XAxis dataKey="year" stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#0d1423", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }} />
                  <Area dataKey="optimistic" stroke="#16d69a" fill="#16d69a1f" />
                  <Area dataKey="expected" stroke="#2f7cff" fill="#2f7cff22" />
                  <Area dataKey="conservative" stroke="#f6b50e" fill="#f6b50e17" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monte Carlo Range</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monteCarlo.paths}>
                  <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,.35)" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#0d1423", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10 }} />
                  <Line dataKey="optimistic" stroke="#16d69a" strokeWidth={2} dot={false} />
                  <Line dataKey="expected" stroke="#2f7cff" strokeWidth={2} dot={false} />
                  <Line dataKey="pessimistic" stroke="#f6b50e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
