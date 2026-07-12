"use client";

import Link from "next/link";
import { CalendarClock, PencilLine, ShieldAlert, Target } from "lucide-react";
import { AppPageHeader } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { forecastGoalCompletion } from "@/lib/financial/engine";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { clamp, formatCurrency } from "@/lib/utils";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SA", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function goalSignal(progress: number, forecastDate: string, targetDate: string) {
  if (progress >= 100) {
    return {
      status: "Funded",
      risk: "Target amount reached",
      variant: "success" as const
    };
  }

  if (forecastDate <= targetDate) {
    return {
      status: "On track",
      risk: "Forecast is within the target date",
      variant: "blue" as const
    };
  }

  return {
    status: "Needs attention",
    risk: "Forecast extends beyond the target date",
    variant: "secondary" as const
  };
}

export function GoalsPage() {
  const { profile, isLoaded, source } = useFinancialProfile();
  const goals = forecastGoalCompletion(profile);
  const totalTarget = profile.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalFunded = profile.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const plannedMonthly = profile.goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);

  return (
    <div className="mx-auto max-w-[1280px]">
      <AppPageHeader
        eyebrow="Active financial model"
        title="Goal portfolio"
        description="See the goals in your saved financial model, the engine's estimated completion date, and where your plan needs attention."
        action={
          <Button asChild variant="outline">
            <Link href="/onboarding">
              <PencilLine className="size-4" aria-hidden="true" />
              Edit goals in financial model
            </Link>
          </Button>
        }
      />

      <div aria-live="polite" className="sr-only">
        {isLoaded
          ? `${profile.goals.length} active goals loaded from ${source === "saved" ? "your saved" : "the sample"} financial model.`
          : "Loading active goals."}
      </div>

      <section aria-labelledby="goal-summary-title" className="mb-6 grid gap-4 md:grid-cols-3">
        <h2 id="goal-summary-title" className="sr-only">Goal portfolio summary</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Funded so far</p>
            <p className="mt-2 text-2xl font-black">{formatCurrency(totalFunded, profile.currency)}</p>
            <p className="mt-1 text-sm text-muted-foreground">of {formatCurrency(totalTarget, profile.currency)} targeted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Planned each month</p>
            <p className="mt-2 text-2xl font-black">{formatCurrency(plannedMonthly, profile.currency)}</p>
            <p className="mt-1 text-sm text-muted-foreground">across {profile.goals.length} active {profile.goals.length === 1 ? "goal" : "goals"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Forecast method</p>
            <p className="mt-2 text-lg font-black">Contribution + surplus allocation</p>
            <p className="mt-1 text-sm text-muted-foreground">High-priority goals receive a larger share of modeled surplus.</p>
          </CardContent>
        </Card>
      </section>

      {profile.goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-black">No goals in this financial model</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Add a target amount, date, and monthly contribution to create a forecast you can act on.
              </p>
            </div>
            <Button asChild>
              <Link href="/onboarding">Add goals to financial model</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section aria-labelledby="active-goals-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="active-goals-title" className="text-xl font-black">Active goals</h2>
              <p className="mt-1 text-sm text-muted-foreground">Forecasts update when your income, expenses, or goals change.</p>
            </div>
            <Badge variant="secondary">{goals.length} modeled</Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => {
              const progress = clamp(goal.progress, 0, 100);
              const signal = goalSignal(progress, goal.forecastDate, goal.targetDate);

              return (
                <Card key={goal.id} className="overflow-hidden">
                  <CardHeader className="border-b border-border/70 bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Target aria-hidden="true" />
                      </span>
                      <Badge variant={goal.priority === "High" ? "success" : goal.priority === "Medium" ? "blue" : "secondary"}>
                        {goal.priority} priority
                      </Badge>
                    </div>
                    <CardTitle className="normal-case tracking-normal">{goal.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{goal.category} · target {formatDate(goal.targetDate)}</p>
                  </CardHeader>
                  <CardContent className="grid gap-5 pt-6">
                    <div>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{formatCurrency(goal.currentAmount, profile.currency)}</span>
                        <span className="font-bold">{formatCurrency(goal.targetAmount, profile.currency)}</span>
                      </div>
                      <Progress
                        value={progress}
                        role="progressbar"
                        aria-label={`${goal.name} funding progress`}
                        aria-valuenow={Math.round(progress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">{Math.round(progress)}% funded</p>
                    </div>

                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Next monthly contribution</dt>
                        <dd className="mt-1 font-black">{formatCurrency(goal.monthlyContribution, profile.currency)}</dd>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Engine forecast</dt>
                        <dd className="mt-1 font-black">{formatDate(goal.forecastDate)}</dd>
                        <dd className="mt-1 text-xs text-muted-foreground">{goal.monthsRemaining} months remaining</dd>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          <CalendarClock className="size-3.5" aria-hidden="true" />
                          Forecast status
                        </dt>
                        <dd className="mt-2"><Badge variant={signal.variant}>{signal.status}</Badge></dd>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 p-3">
                        <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          <ShieldAlert className="size-3.5" aria-hidden="true" />
                          Risk signal
                        </dt>
                        <dd className="mt-1 text-sm font-semibold leading-5">{signal.risk}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
