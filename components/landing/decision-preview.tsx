"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildLandingPreview, landingScenarioOptions } from "@/lib/presentation/landing-preview";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motionTokens } from "@/lib/motion/variants";

function chartPoints(values: number[], allValues: number[]) {
  const width = 560;
  const height = 190;
  const padding = 18;
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const range = Math.max(1, maximum - minimum);
  const xStep = (width - padding * 2) / Math.max(1, values.length - 1);

  return values
    .map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - minimum) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function getLandingTabDestination(currentIndex: number, key: string, itemCount: number) {
  if (itemCount <= 0) return null;

  switch (key) {
    case "ArrowRight":
      return (currentIndex + 1) % itemCount;
    case "ArrowLeft":
      return (currentIndex - 1 + itemCount) % itemCount;
    case "Home":
      return 0;
    case "End":
      return itemCount - 1;
    default:
      return null;
  }
}

export function DecisionPreview() {
  const [selectedId, setSelectedId] = useState(landingScenarioOptions[0]?.id ?? "scenario-start-investment");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const shouldReduceMotion = useReducedMotion() === true;
  const preview = useMemo(() => buildLandingPreview(selectedId), [selectedId]);
  const cashFlow = preview.overview.cashFlow.slice(0, 6);
  const allValues = cashFlow.flatMap((point) => [point.current, point.after]);
  const currentPoints = chartPoints(cashFlow.map((point) => point.current), allValues);
  const afterPoints = chartPoints(cashFlow.map((point) => point.after), allValues);
  const delta = preview.overview.decision.monthlySurplusDelta;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const destination = getLandingTabDestination(currentIndex, event.key, landingScenarioOptions.length);
    if (destination === null) return;

    event.preventDefault();
    const option = landingScenarioOptions[destination];
    if (!option) return;
    setSelectedId(option.id);
    tabRefs.current[destination]?.focus();
  };

  return (
    <section aria-label="Interactive financial decision preview" className="premium-ring relative overflow-hidden rounded-[2rem] border border-border bg-card/90 p-4 shadow-glass-strong sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-20 size-64 rounded-full bg-chart-3/15 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="nova-orb size-9 rounded-full" aria-hidden="true" />
            <div>
              <p className="text-sm font-black">Decision preview</p>
              <p className="text-xs text-muted-foreground">Real engine · sample profile · SAR</p>
            </div>
          </div>
          <Badge variant="outline">No bank connection</Badge>
        </div>

        <div role="tablist" aria-label="Choose a financial decision" aria-orientation="horizontal" className="mt-5 grid gap-2 sm:grid-cols-3">
          {landingScenarioOptions.map((option, index) => {
            const selected = option.id === selectedId;
            return (
              <button
                key={option.id}
                id={`landing-tab-${option.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="landing-decision-panel"
                tabIndex={selected ? 0 : -1}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                onClick={() => setSelectedId(option.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={cn(
                  "min-h-12 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-[transform,background-color,border-color,color] [transition-duration:var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none",
                  selected
                    ? "border-primary/40 bg-primary/10 text-primary shadow-glow"
                    : "border-border bg-muted/40 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/20 hover:bg-muted"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div
          id="landing-decision-panel"
          role="tabpanel"
          aria-labelledby={`landing-tab-${preview.scenario.id}`}
          className="mt-5 grid gap-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/35 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Monthly impact</p>
              <p className={cn("mt-2 text-xl font-black tabular-nums", delta >= 0 ? "text-positive" : "text-caution")}>
                {delta > 0 ? "+" : ""}{formatCurrency(delta)}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/35 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Health now</p>
              <p className="mt-2 text-xl font-black tabular-nums">{preview.healthCurrent}/100</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/35 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">After decision</p>
              <p className="mt-2 text-xl font-black tabular-nums text-primary">{preview.healthAfter}/100</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/35 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black">Six-month cash-flow comparison</p>
                <p className="mt-1 text-xs text-muted-foreground">Current path and {preview.scenario.name.toLowerCase()}</p>
              </div>
              <div className="flex gap-3 text-[10px] font-bold uppercase tracking-[0.08em]">
                <span className="flex items-center gap-1.5 text-primary"><span className="size-2 rounded-full bg-chart-1" />Current</span>
                <span className="flex items-center gap-1.5 text-positive"><span className="size-2 rounded-full bg-chart-2" />After</span>
              </div>
            </div>
            <p className="sr-only">{preview.overview.cashFlowSummary}</p>
            <svg
              viewBox="0 0 560 190"
              aria-hidden="true"
              focusable="false"
              className="h-44 w-full overflow-visible"
            >
              {[38, 76, 114, 152].map((y) => (
                <line key={y} x1="18" x2="542" y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth="1" />
              ))}
              <polyline points={currentPoints} fill="none" stroke="hsl(var(--chart-1))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
              <polyline points={afterPoints} fill="none" stroke="hsl(var(--chart-2))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
              <motion.polyline
                key={`current-${selectedId}`}
                points={currentPoints}
                fill="none"
                stroke="hsl(var(--chart-1))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : motionTokens.deliberate,
                  ease: motionTokens.ease,
                  delay: shouldReduceMotion ? 0 : 0
                }}
              />
              <motion.polyline
                key={`after-${selectedId}`}
                points={afterPoints}
                fill="none"
                stroke="hsl(var(--chart-2))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : motionTokens.deliberate,
                  ease: motionTokens.ease,
                  delay: shouldReduceMotion ? 0 : 0.06
                }}
              />
            </svg>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.07] p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary">
                <BrainCircuit className="size-4" aria-hidden="true" /> NOVA recommendation
              </p>
              <p className="mt-3 text-sm font-semibold leading-6">{preview.recommendation}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/35 p-4 text-xs leading-5 text-muted-foreground">
              <p className="flex items-center gap-2 font-black text-foreground"><ShieldCheck className="size-4 text-positive" aria-hidden="true" />Evidence</p>
              <p className="mt-2">{preview.evidence}</p>
              <p className="mt-2">{preview.assumption}</p>
            </div>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link href={preview.simulationHref}>
              Open full comparison <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
      <Sparkles className="pointer-events-none absolute bottom-5 right-5 size-5 text-primary/25" aria-hidden="true" />
    </section>
  );
}
