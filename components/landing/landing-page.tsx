import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitCompareArrows,
  LineChart,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Wand2
} from "lucide-react";
import { NovaOrb } from "@/components/brand/nova-orb";
import { DecisionPreview } from "@/components/landing/decision-preview";
import { HeroAtmosphere } from "@/components/landing/hero-atmosphere";
import { LandingReveal, LandingStagger } from "@/components/landing/landing-motion";
import { LandingNav } from "@/components/landing/landing-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const trustSignals = [
  {
    icon: ShieldCheck,
    label: "Privacy boundary",
    value: "No bank connection required"
  },
  {
    icon: GitCompareArrows,
    label: "Calculation layer",
    value: "Deterministic simulation engines"
  },
  {
    icon: UserRoundCheck,
    label: "Preview context",
    value: "Saudi sample profile · SAR"
  },
  {
    icon: LockKeyhole,
    label: "Server capability",
    value: "SQLite-backed account mode"
  }
];

const journey = [
  {
    number: "01",
    icon: Database,
    title: "Model what is true",
    body: "Bring income, spending, debt, assets, goals, and risk tolerance into one coherent financial twin.",
    tags: ["Profile", "Cash flow", "Goals"]
  },
  {
    number: "02",
    icon: GitCompareArrows,
    title: "Test the next move",
    body: "Compare the current path with a car, home, investment, emergency, salary, or loan decision.",
    tags: ["Before", "After", "Trade-offs"]
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "Understand the evidence",
    body: "NOVA turns model deltas into evidence, assumptions, risk signals, and a practical next action.",
    tags: ["Evidence", "Assumptions", "Boundary"]
  }
];

const novaEvidence = [
  {
    icon: Radar,
    label: "Recommendation",
    body: "Choose the path that protects monthly flexibility, not only the lowest upfront cost."
  },
  {
    icon: LineChart,
    label: "Evidence",
    body: "Compare surplus, debt ratio, emergency runway, health score, and 12-month net worth."
  },
  {
    icon: Wand2,
    label: "Assumptions",
    body: "Scenario duration, sample profile, expected return, and recurring costs remain visible."
  },
  {
    icon: ShieldCheck,
    label: "Boundary",
    body: "Educational guidance—not a promise, bank decision, or regulated recommendation."
  }
];

const decisionGroups = [
  {
    label: "Life choices",
    description: "Model major commitments against the same household profile.",
    items: [
      { label: "Buy a car", href: "/simulations?scenario=car" },
      { label: "Buy a home", href: "/simulations?scenario=house" }
    ]
  },
  {
    label: "Resilience",
    description: "See how shocks and new obligations change financial runway.",
    items: [
      { label: "Emergency expense", href: "/simulations?scenario=emergency" },
      { label: "Take a loan", href: "/simulations?scenario=loan" }
    ]
  },
  {
    label: "Growth",
    description: "Compare added income and long-term investing with today’s path.",
    items: [
      { label: "Increase salary", href: "/simulations?scenario=salary" },
      { label: "Start investing", href: "/simulations?scenario=investment" }
    ]
  }
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
    question: "What happens when advisor mode is unavailable?",
    answer: "NOVA returns deterministic guidance derived from the scenario comparison, so the core decision workflow remains usable without an external advisor response."
  },
  {
    question: "Can I export my analysis?",
    answer: "The reports area supports CSV export from the financial model. Every export should be reviewed before it is used for a real decision."
  }
];

const heroEnter = "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-both";

export function LandingPage() {
  return (
    <main className="gradient-mesh relative min-h-screen overflow-x-clip">
      <a
        href="#landing-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform [transition-duration:var(--motion-fast)] focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <LandingNav />

      <section
        id="landing-content"
        tabIndex={-1}
        className="relative isolate px-4 pb-20 pt-28 outline-none sm:pt-32 lg:pb-28 lg:pt-40"
      >
        <HeroAtmosphere />
        <div className="container relative z-10 grid min-w-0 gap-14 xl:grid-cols-[0.78fr_1.22fr] xl:items-center xl:gap-10">
          <div className="min-w-0 xl:pb-8">
            <Badge variant="blue" className={`${heroEnter} mb-7 w-fit`} style={{ animationDuration: "260ms" }}>
              <Sparkles className="mr-1 size-3" aria-hidden="true" />
              Financial foresight, explained
            </Badge>
            <h1
              className={`${heroEnter} max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[5rem]`}
              style={{ animationDuration: "260ms", animationDelay: "65ms" }}
            >
              See the financial future of a decision <span className="gradient-text-blue">before you make it.</span>
            </h1>
            <p
              className={`${heroEnter} mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8`}
              style={{ animationDuration: "260ms", animationDelay: "130ms" }}
            >
              Build a living model of your money, compare the current path with the next move, and understand exactly
              what changes across cash flow, debt, risk, and goals.
            </p>
            <div
              className={`${heroEnter} mt-9 flex flex-col gap-3 sm:flex-row`}
              style={{ animationDuration: "260ms", animationDelay: "195ms" }}
            >
              <Button size="lg" className="min-w-44" asChild>
                <Link href="/signup">
                  Create your twin <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="glass" className="min-w-44" asChild>
                <Link href="/dashboard">Explore sample twin</Link>
              </Button>
            </div>
            <div
              className={`${heroEnter} mt-9 grid max-w-xl gap-3 text-xs font-semibold text-muted-foreground sm:grid-cols-3`}
              style={{ animationDuration: "260ms", animationDelay: "195ms" }}
            >
              {[
                "No bank connection required",
                "Deterministic core model",
                "Light and dark themes"
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-positive" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            className="relative min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:fill-mode-both xl:pl-4"
            style={{ animationDuration: "420ms", animationDelay: "80ms" }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -left-3 top-16 z-20 hidden rounded-2xl border border-primary/20 bg-card/85 px-4 py-3 shadow-glass backdrop-blur-xl xl:block">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">Model source</p>
              <p className="mt-1 text-xs font-bold">Engine-backed comparison</p>
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute -right-4 bottom-20 z-20 hidden rounded-2xl border border-positive/20 bg-card/85 px-4 py-3 shadow-glass backdrop-blur-xl xl:block">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-positive">Context</p>
              <p className="mt-1 text-xs font-bold">Sample profile · SAR</p>
            </div>
            <DecisionPreview />
          </div>
        </div>
      </section>

      <section aria-label="Product capability evidence" className="relative z-10 border-y border-border bg-card/55 backdrop-blur-xl">
        <LandingStagger
          as="ul"
          ariaLabel="Verified product capabilities"
          className="container grid sm:grid-cols-2 xl:grid-cols-4"
          itemClassName="border-b border-border xl:border-b-0 xl:border-l xl:first:border-l-0"
        >
          {trustSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.label} className="flex h-full min-w-0 gap-3 px-1 py-5 sm:px-5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{signal.label}</span>
                  <span className="mt-1 block text-sm font-bold">{signal.value}</span>
                </span>
              </div>
            );
          })}
        </LandingStagger>
      </section>

      <section id="how-it-works" className="container scroll-mt-24 py-24 lg:py-32">
        <LandingReveal className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">How it works</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            From financial noise to a decision you can explain.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
            One workflow carries the same profile from inputs to comparison, then keeps the reasoning attached to the result.
          </p>
        </LandingReveal>
        <LandingStagger
          as="ol"
          ariaLabel="Financial twin workflow"
          className="mt-12 grid gap-5 lg:grid-cols-3"
          itemClassName="h-full"
        >
          {journey.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.number} interactive className="h-full min-h-80 border-primary/10 bg-card/80">
                <CardContent className="flex h-full flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-glow">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span aria-hidden="true" className="text-sm font-black tabular-nums text-muted-foreground">{step.number}</span>
                  </div>
                  <h3 className="mt-10 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {step.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </LandingStagger>
      </section>

      <section id="nova" className="relative scroll-mt-24 border-y border-border bg-card/45 py-24 lg:py-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_45%,hsl(var(--brand)/0.12),transparent_34rem)]" />
        <div className="container relative grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <LandingReveal>
            <div className="flex items-center gap-4">
              <NovaOrb className="size-14" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">NOVA intelligence</p>
                <p className="mt-1 text-xs text-muted-foreground">Recommendation with visible reasoning</p>
              </div>
            </div>
            <h2 className="mt-7 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              A recommendation is useful only when you can see why.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              NOVA combines deterministic model changes with plain-language guidance. Every answer stays framed by evidence,
              assumptions, and the limits of the available information.
            </p>
          </LandingReveal>
          <LandingStagger
            as="ol"
            ariaLabel="NOVA evidence sequence"
            className="grid gap-3"
            itemClassName="h-full"
          >
            {novaEvidence.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="group grid h-full gap-4 rounded-2xl border border-border bg-background/65 p-5 shadow-glass sm:grid-cols-[auto_1fr_auto] sm:items-start">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-black">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                  <span aria-hidden="true" className="hidden text-xs font-black tabular-nums text-muted-foreground sm:block">0{index + 1}</span>
                </div>
              );
            })}
          </LandingStagger>
        </div>
      </section>

      <section className="container py-24 lg:py-32">
        <LandingReveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-positive">Decision coverage</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">One twin. Six modeled moves.</h2>
          </div>
          <p className="max-w-2xl leading-7 text-muted-foreground">
            The included scenario library covers these decisions against the same financial profile, so trade-offs stay comparable.
          </p>
        </LandingReveal>
        <LandingStagger
          as="ul"
          ariaLabel="Supported decision groups"
          className="mt-10 grid gap-5 lg:grid-cols-3"
          itemClassName="h-full"
        >
          {decisionGroups.map((group) => (
            <Card key={group.label} interactive className="h-full border-positive/10 bg-card/80">
              <CardContent className="flex h-full flex-col p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{group.label}</p>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{group.description}</p>
                <ul aria-label={`${group.label} scenarios`} className="mt-6 grid gap-2">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="group/link flex min-h-11 items-center justify-between rounded-xl border border-border bg-muted/35 px-4 text-sm font-bold transition-[transform,background-color,border-color] [transition-duration:var(--motion-fast)] hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
                      >
                        {item.label}
                        <ArrowRight className="size-4 text-muted-foreground transition-transform [transition-duration:var(--motion-fast)] group-hover/link:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </LandingStagger>
      </section>

      <section id="trust" className="container scroll-mt-24 pb-24 lg:pb-32">
        <LandingReveal>
          <Card className="overflow-hidden border-primary/25 bg-primary/[0.055]">
            <CardContent className="grid gap-10 p-7 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <LockKeyhole className="size-4" aria-hidden="true" />
                  Trust by design
                </p>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                  Know the data mode before you trust the answer.
                </h2>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  The interface distinguishes sample, account, and advisor behavior instead of presenting them as the same thing.
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  ["Sample profile", "Uses the included Saudi profile in SAR and does not connect to a bank."],
                  ["SQLite-backed account mode", "Uses the repository’s local server account flow. Production deployments still require institution-grade encryption, audit logging, and retention controls."],
                  ["Advisor mode", "Uses an optional server capability; deterministic scenario guidance remains available when that capability is disabled or unavailable."]
                ].map(([label, body]) => (
                  <div key={label} className="rounded-2xl border border-border bg-background/60 p-5">
                    <p className="font-black">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </LandingReveal>
      </section>

      <section id="faq" className="scroll-mt-24 border-y border-border bg-card/45 py-24">
        <div className="container">
          <LandingReveal className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">FAQ</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Clarity before commitment.</h2>
          </LandingReveal>
          <LandingStagger
            as="ul"
            ariaLabel="Frequently asked questions"
            className="mt-10 grid gap-4 lg:grid-cols-2"
            itemClassName="h-full"
          >
            {faq.map((item) => (
              <Card key={item.question} className="h-full bg-background/60">
                <CardContent className="p-6">
                  <h3 className="font-black">{item.question}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </LandingStagger>
        </div>
      </section>

      <section className="container py-24">
        <LandingReveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-primary/25 bg-primary/10 p-8 shadow-glass-strong sm:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-chart-3/20 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-1/3 size-72 rounded-full bg-positive/10 blur-3xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Your next decision</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.045em] sm:text-5xl">Model it before money moves.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                  Start with your own profile or inspect the included sample before entering any real financial commitment.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="glass" asChild><Link href="/dashboard">Explore sample</Link></Button>
                <Button size="lg" asChild>
                  <Link href="/signup">Create your financial twin <ArrowRight className="size-4" aria-hidden="true" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </LandingReveal>
      </section>
    </main>
  );
}
