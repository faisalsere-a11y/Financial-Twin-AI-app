import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitCompareArrows,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";
import { DecisionPreview } from "@/components/landing/decision-preview";
import { LandingNav, NovaOrb } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const journey = [
  {
    number: "01",
    icon: Database,
    title: "Model what is true",
    body: "Bring income, spending, debt, assets, goals, and risk tolerance into one coherent financial twin."
  },
  {
    number: "02",
    icon: GitCompareArrows,
    title: "Test the next move",
    body: "Compare the current path with a car, home, investment, emergency, salary, or loan decision."
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "Understand the trade-off",
    body: "NOVA turns the model delta into evidence, assumptions, risk signals, and a practical next action."
  }
];

const decisionGroups = [
  { label: "Life", items: ["Buy a car", "Buy a home", "Education", "Family change"] },
  { label: "Resilience", items: ["Job loss", "Emergency expense", "Debt change", "Salary increase"] },
  { label: "Wealth", items: ["Start investing", "Retirement", "Portfolio growth", "Goal funding"] }
];

const faq = [
  {
    question: "Is Financial Twin a bank or financial adviser?",
    answer: "No. It is an educational simulation and planning layer. It does not hold funds, move money, or replace regulated advice."
  },
  {
    question: "Where do the numbers come from?",
    answer: "The product uses deterministic cash-flow, debt, risk, health, goal, and investment engines. The sample journey uses the included Saudi profile in SAR."
  },
  {
    question: "What happens when OpenAI is not configured?",
    answer: "NOVA falls back to deterministic recommendations derived from the scenario comparison, so the core product remains usable without an API key."
  },
  {
    question: "Can I export my analysis?",
    answer: "The reports area supports CSV export from the financial model. Every export should be reviewed before it is used for a real decision."
  }
];

export function LandingPage() {
  return (
    <main className="gradient-mesh min-h-screen overflow-hidden">
      <LandingNav />

      <section className="relative px-4 pb-24 pt-32 lg:pb-32 lg:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-8 size-[44rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="container relative grid gap-14 xl:grid-cols-[0.82fr_1.18fr] xl:items-center">
          <div>
            <Badge variant="blue" className="mb-7 w-fit">
              <Sparkles className="mr-1 size-3" aria-hidden="true" />
              Financial foresight, explained
            </Badge>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              See the financial future of a decision <span className="gradient-text-blue">before you make it.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              Build a living model of your money, compare the current path with the next move, and understand exactly
              what changes across cash flow, debt, risk, and goals.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Create your twin <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Explore sample twin</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-positive" aria-hidden="true" />No bank connection required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-positive" aria-hidden="true" />Deterministic core model</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-positive" aria-hidden="true" />Light and dark themes</span>
            </div>
          </div>
          <DecisionPreview />
        </div>
      </section>

      <section aria-label="Product trust summary" className="border-y border-border bg-card/50">
        <div className="container grid gap-px sm:grid-cols-3">
          {[
            ["Model", "Cash flow, debt, assets, goals, health"],
            ["Region", "Saudi sample profile · SAR formatting"],
            ["Boundary", "Educational simulation · no money movement"]
          ].map(([label, value]) => (
            <div key={label} className="px-5 py-6 sm:border-l sm:border-border sm:first:border-l-0">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">{label}</p>
              <p className="mt-2 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="container scroll-mt-24 py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">From financial noise to a decision you can explain.</h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {journey.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} className="group min-h-72">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-black tabular-nums text-muted-foreground">{step.number}</span>
                  </div>
                  <h3 className="mt-10 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="nova" className="scroll-mt-24 border-y border-border bg-card/45 py-24 lg:py-32">
        <div className="container grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <div className="flex items-center gap-4">
              <NovaOrb className="size-12" />
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">NOVA intelligence</p>
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.035em] sm:text-5xl">A recommendation is only useful when you can see why.</h2>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              NOVA combines deterministic model changes with plain-language guidance. Every answer is framed by evidence,
              assumptions, and the limits of the available information.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              [Radar, "Recommendation", "Choose the path that protects monthly flexibility, not only the lowest upfront cost."],
              [GitCompareArrows, "Evidence", "Compare surplus, debt ratio, emergency runway, health score, and 12-month net worth."],
              [Wand2, "Assumptions", "Scenario duration, sample profile, expected return, and recurring costs remain visible."],
              [ShieldCheck, "Boundary", "Educational guidance—not a promise, bank decision, or regulated recommendation."]
            ].map(([Icon, label, body]) => {
              const ItemIcon = Icon as typeof Radar;
              return (
                <div key={label as string} className="grid gap-3 rounded-2xl border border-border bg-background/60 p-5 sm:grid-cols-[auto_1fr]">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ItemIcon className="size-4" aria-hidden="true" /></span>
                  <div><p className="font-black">{label as string}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{body as string}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-24 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-positive">Decision coverage</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.035em]">One twin. Many possible futures.</h2>
          </div>
          <p className="max-w-2xl leading-7 text-muted-foreground">The existing model supports decisions across everyday life, financial resilience, and long-term wealth without changing the underlying profile.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {decisionGroups.map((group) => (
            <Card key={group.label}>
              <CardContent className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{group.label}</p>
                <div className="mt-5 grid gap-3">
                  {group.items.map((item) => <p key={item} className="flex items-center gap-3 text-sm font-semibold"><span className="size-1.5 rounded-full bg-positive" />{item}</p>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="trust" className="container scroll-mt-24 pb-24 lg:pb-32">
        <Card className="overflow-hidden border-primary/25 bg-primary/[0.055]">
          <CardContent className="grid gap-10 p-7 lg:grid-cols-[1fr_1fr] lg:p-10">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><LockKeyhole className="size-4" aria-hidden="true" />Trust by design</p>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.03em] sm:text-4xl">Know the data mode before you trust the answer.</h2>
            </div>
            <div className="grid gap-5 text-sm leading-6 text-muted-foreground">
              <p><strong className="text-foreground">Sample mode:</strong> uses the included Saudi profile and does not connect to a bank.</p>
              <p><strong className="text-foreground">Local server mode:</strong> uses the repository&apos;s SQLite-backed account flow. Production deployments still require institution-grade encryption, audit logging, and retention controls.</p>
              <p><strong className="text-foreground">AI mode:</strong> uses OpenAI only when a key is configured and otherwise returns deterministic scenario guidance.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="faq" className="scroll-mt-24 border-y border-border bg-card/45 py-24">
        <div className="container">
          <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">FAQ</p><h2 className="mt-4 text-4xl font-black tracking-[-0.035em]">Clarity before commitment.</h2></div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {faq.map((item) => (
              <Card key={item.question}><CardContent className="p-6"><h3 className="font-black">{item.question}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p></CardContent></Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-primary/10 p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-chart-3/20 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Your next decision</p><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">Model it before money moves.</h2></div>
            <Button size="lg" asChild><Link href="/signup">Create your financial twin <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
