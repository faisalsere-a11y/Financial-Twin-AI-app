"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
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
import { LandingNav } from "@/components/layout/app-shell";

const heroData = [
  { month: "Jan", value: 4200 },
  { month: "Feb", value: 4550 },
  { month: "Mar", value: 5100 },
  { month: "Apr", value: 5700 },
  { month: "May", value: 6900 },
  { month: "Jun", value: 7800 }
];

const features = [
  {
    icon: BrainCircuit,
    title: "Digital financial twin",
    body: "Model income, spending, debts, assets, goals, and risk tolerance in one evolving profile."
  },
  {
    icon: Wand2,
    title: "Decision simulation",
    body: "Test buying a car, taking a loan, investing, marriage, travel, job loss, and emergency expenses."
  },
  {
    icon: BarChart3,
    title: "Future timeline",
    body: "Compare current path against after-decision cash flow, net worth, debt, and savings."
  },
  {
    icon: Sparkles,
    title: "AI recommendations",
    body: "Receive clear next moves like wait periods, down payment targets, and safe monthly investment ranges."
  }
];

function MockDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
      className="glass-panel premium-ring relative mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded-2xl p-4"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <div className="grid gap-4">
          <Card className="border-primary/25 bg-primary/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-lg font-black text-primary">AH</div>
                <div>
                  <p className="text-lg font-black">Ahmed Al-Harbi</p>
                  <Badge variant="success">Health Score 82</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Net Worth</p>
                <p className="mt-2 text-2xl font-black">320,450 SAR</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Savings</p>
                <p className="mt-2 text-2xl font-black">52,000 SAR</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold">Buy a Car</span>
                <Badge variant="warning">Possible in 3m</Badge>
              </div>
              <Progress value={64} />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Future Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={heroData}>
                  <defs>
                    <linearGradient id="heroLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16d69a" stopOpacity={0.36} />
                      <stop offset="100%" stopColor="#16d69a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#16d69a" strokeWidth={3} fill="url(#heroLine)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {["Cash flow +18%", "Debt ratio -6%", "Goal date -8mo"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-background/40 p-3 text-sm font-bold">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <LandingNav />
      <section className="relative px-4 pb-20 pt-32">
        <div className="absolute left-1/2 top-20 size-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative text-center">
          <Badge variant="success" className="mb-6">
            <Zap className="mr-1" />
            Simulate before you commit
          </Badge>
          <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tight md:text-7xl">
            Your future finances, visible before the decision.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Financial Twin AI creates a living model of your money and predicts how choices affect cash flow,
            savings, debt, risk, investments, and goals in SAR.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Create your twin
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link href="/dashboard">
                <Play data-icon="inline-start" />
                View demo
              </Link>
            </Button>
          </div>
          <MockDashboard />
        </div>
      </section>
      <section id="features" className="container grid gap-5 py-20 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <span className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon />
                </span>
                <CardTitle className="normal-case tracking-normal">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
      <section className="container grid gap-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Built for decisions that change the next decade.</h2>
          <p className="mt-4 text-muted-foreground">
            Every simulation compares today against the future path, then translates risk into plain-language next
            steps. No spreadsheet tabs. No blind commitments.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {["Buy a house", "Start investing", "Lose job", "Emergency expense"].map((item, index) => (
            <Card key={item} className={index === 1 ? "border-primary/35 bg-primary/10" : ""}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="font-black">{item}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Current path vs after decision</p>
                </div>
                <ArrowRight className="text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section id="pricing" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-black tracking-tight">Pricing that fits a hackathon launch.</h2>
          <p className="mt-4 text-muted-foreground">Start free, upgrade when your financial twin becomes a daily habit.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            ["Starter", "0 SAR", ["1 financial twin", "5 simulations/month", "Goal tracking"]],
            ["Pro", "49 SAR/mo", ["Unlimited simulations", "AI advisor", "CSV/PDF exports", "Monte Carlo"]],
            ["Family Office", "249 SAR/mo", ["Multi-profile planning", "Advisor workspace", "Priority support"]]
          ].map(([name, price, items], index) => (
            <Card key={name as string} className={index === 1 ? "border-primary/35 bg-primary/10 shadow-glow" : ""}>
              <CardHeader>
                <CardTitle className="normal-case tracking-normal">{name}</CardTitle>
                <p className="text-3xl font-black">{price}</p>
              </CardHeader>
              <CardContent className="grid gap-3">
                {(items as string[]).map((item) => (
                  <p key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="text-primary" />
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
              <p className="text-lg font-semibold leading-8">“{quote}”</p>
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
        <Card className="overflow-hidden border-primary/30 bg-primary/10">
          <CardContent className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <ShieldCheck />
                Investor-ready demo
              </p>
              <h2 className="mt-2 text-3xl font-black">Create a financial twin and test the next decision.</h2>
            </div>
            <Button size="lg" asChild>
              <Link href="/signup">
                Start now
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
