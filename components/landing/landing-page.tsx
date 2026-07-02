"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer } from "recharts";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CircleDollarSign,
  GitCompareArrows,
  Play,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LandingNav, MiniMetric, NovaOrb } from "@/components/layout/app-shell";

const heroData = [
  { month: "Jan", current: 4200, after: 4200 },
  { month: "Feb", current: 4380, after: 4650 },
  { month: "Mar", current: 4620, after: 5280 },
  { month: "Apr", current: 4880, after: 6020 },
  { month: "May", current: 5200, after: 7100 },
  { month: "Jun", current: 5580, after: 8200 }
];

const riskBars = [
  { name: "Debt", value: 61 },
  { name: "Cash", value: 82 },
  { name: "Goal", value: 74 },
  { name: "Risk", value: 38 }
];

const features = [
  {
    icon: BrainCircuit,
    title: "Living financial twin",
    body: "A structured model of income, debt, assets, goals, emergency runway, and behavior signals."
  },
  {
    icon: Wand2,
    title: "Decision simulations",
    body: "Run car, house, loan, job loss, marriage, child, education, travel, and retirement scenarios."
  },
  {
    icon: GitCompareArrows,
    title: "Current vs future",
    body: "See how each choice changes cash flow, savings, debt ratio, health, and goal timing."
  },
  {
    icon: Sparkles,
    title: "NOVA AI advisor",
    body: "Get plain-language recommendations like wait 8 months or raise the down payment by 15%."
  }
];

function MockDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.12 }}
      className="glass-panel-strong premium-ring relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] p-4 text-left"
    >
      <div className="scanline pointer-events-none absolute inset-0 opacity-20" />
      <div className="absolute -right-16 -top-16 size-52 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.3fr]">
        <div className="grid gap-4">
          <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-500/[0.12] to-violet-500/10 p-5">
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <NovaOrb className="size-10" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight">Ahmed Al-Harbi</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="success">Health 82</Badge>
                  <Badge variant="blue">NOVA synced</Badge>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniMetric label="Net worth" value="320,450 SAR" />
              <MiniMetric label="Monthly surplus" value="4,200 SAR" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Savings</p>
                <p className="mt-2 text-xl font-black">52k SAR</p>
                <Progress value={58} className="mt-4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Debt ratio</p>
                <p className="mt-2 text-xl font-black text-amber-300">22%</p>
                <Progress value={22} className="mt-4" indicatorClassName="bg-amber-400" />
              </CardContent>
            </Card>
          </div>
          <Card className="border-emerald-400/25 bg-emerald-400/10">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-black">Start Investment</p>
                <p className="mt-1 text-xs text-muted-foreground">1,200 SAR/month</p>
              </div>
              <Badge variant="success">Safe</Badge>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>Future Cash Flow Timeline</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Current path vs after decision</p>
              </div>
              <Badge variant="blue">12 month model</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heroData}>
                    <defs>
                      <linearGradient id="landingAfter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="landingCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="current" stroke="#60a5fa" strokeWidth={2} fill="url(#landingCurrent)" />
                    <Area type="monotone" dataKey="after" stroke="#10b981" strokeWidth={3} fill="url(#landingAfter)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <Card className="border-violet-400/20 bg-violet-400/[0.08]">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <NovaOrb className="size-9" />
                  <p className="text-sm font-black text-violet-200">NOVA says</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Buying now keeps you safe, but investing first improves your 12-month net worth by 18,400 SAR.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="h-40 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskBars}>
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="gradient-mesh min-h-screen overflow-hidden">
      <LandingNav />
      <section className="relative px-4 pb-20 pt-28">
        <div className="absolute left-1/2 top-10 size-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="container relative">
          <div className="grid gap-12 min-[900px]:grid-cols-[0.9fr_1.1fr] min-[900px]:items-center">
            <div>
              <Badge variant="blue" className="mb-6">
                <Zap className="mr-1 size-3" />
                Financial simulation cockpit
              </Badge>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
                Financial Twin AI
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Create a digital twin of your money, run decisions before they happen, and compare your current life
                against the future path after each choice.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Create your twin
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button size="lg" variant="glass" asChild>
                  <Link href="/dashboard">
                    <Play data-icon="inline-start" />
                    Open demo cockpit
                  </Link>
                </Button>
              </div>
              <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
                <MiniMetric label="Demo income" value="18,500 SAR" />
                <MiniMetric label="Net worth" value="320,450 SAR" />
                <MiniMetric label="Health" value="82/100" />
              </div>
            </div>
            <MockDashboard />
          </div>
        </div>
      </section>

      <section id="features" className="container grid gap-5 py-20 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="group">
              <CardHeader>
                <span className="mb-3 flex size-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-blue-200 transition-transform group-hover:scale-105">
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-base normal-case tracking-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="container grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Decision lab</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Simulate the big move before your bank account feels it.
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Every scenario updates the twin instantly, then shows the exact delta across cash flow, debt, savings,
            emergency runway, risk, and goal dates.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {["Buy a house", "Start investing", "Lose job", "Emergency expense"].map((item, index) => (
            <Card key={item} className={index === 1 ? "border-emerald-400/30 bg-emerald-400/10 shadow-glow-green" : ""}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-black">{item}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Current path vs after decision</p>
                </div>
                <ArrowRight className="size-5 text-blue-300" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">Pricing</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Launch-ready plans for a real FinTech demo.</h2>
          <p className="mt-4 text-muted-foreground">
            Start free, then unlock unlimited simulations, AI advice, exports, and family planning.
          </p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            ["Starter", "0 SAR", ["1 financial twin", "5 simulations/month", "Goal tracking"]],
            ["Pro", "49 SAR/mo", ["Unlimited simulations", "AI advisor", "CSV/PDF exports", "Monte Carlo"]],
            ["Family Office", "249 SAR/mo", ["Multi-profile planning", "Advisor workspace", "Priority support"]]
          ].map(([name, price, items], index) => (
            <Card key={name as string} className={index === 1 ? "border-blue-400/[0.35] bg-blue-400/10 shadow-glow" : ""}>
              <CardHeader>
                <CardTitle className="text-base normal-case tracking-tight">{name}</CardTitle>
                <p className="text-3xl font-black">{price}</p>
              </CardHeader>
              <CardContent className="grid gap-3">
                {(items as string[]).map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-emerald-300" />
                    {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container grid gap-5 py-16 lg:grid-cols-3">
        {[
          "This finally made large purchases feel measurable instead of emotional.",
          "The current-vs-future timeline is exactly what my family needed before buying a house.",
          "It feels like a private CFO for everyday decisions."
        ].map((quote) => (
          <Card key={quote}>
            <CardContent className="p-6">
              <p className="text-lg font-semibold leading-8">&quot;{quote}&quot;</p>
              <p className="mt-5 text-sm text-muted-foreground">Saudi beta customer</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="faq" className="container py-20">
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            ["Is this a bank?", "No. It is a simulation and planning layer for decisions before money moves."],
            ["Does AI replace an advisor?", "No. It explains tradeoffs and flags risks so advice conversations are better prepared."],
            ["Can I export reports?", "Yes. Monthly, quarterly, annual, CSV, and demo PDF export flows are included."],
            ["Is data private?", "The demo uses SQLite locally. Production deployments should add encryption, audit logs, and secure key management."]
          ].map(([question, answer]) => (
            <Card key={question}>
              <CardContent className="p-6">
                <p className="font-black">{question}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <Card className="overflow-hidden border-blue-400/30 bg-blue-400/10">
          <CardContent className="relative flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div className="absolute -right-10 -top-12 text-[9rem] font-black leading-none text-blue-300/5">AI</div>
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-blue-200">
                <ShieldCheck className="size-4" />
                Investor-ready demo
              </p>
              <h2 className="mt-2 text-3xl font-black">Create a financial twin and test the next decision.</h2>
            </div>
            <Button size="lg" asChild>
              <Link href="/signup">
                Start now
                <CircleDollarSign data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
