"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  PencilLine,
  ShieldAlert,
  Sparkles,
  Target
} from "lucide-react";
import { GoalCelebration } from "@/components/goals/goal-celebration";
import { GoalEditor } from "@/components/goals/goal-editor";
import { GoalProgressRing } from "@/components/goals/goal-progress-ring";
import { AppPageHeader } from "@/components/layout/app-shell";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forecastGoalCompletion } from "@/lib/financial/engine";
import type { FinancialProfile, GoalModel } from "@/lib/financial/types";
import { motionTokens } from "@/lib/motion/variants";
import { createGoalPortfolioInsight } from "@/lib/presentation/goal-insight";
import {
  crossedGoalCompletion,
  moveGoal,
  updateGoal,
  type GoalUpdateValues
} from "@/lib/profile/goal-updates";
import { useFinancialProfile } from "@/lib/profile/use-financial-profile";
import { clamp, cn, formatCurrency } from "@/lib/utils";

type Notice = {
  type: "success" | "error";
  message: string;
} | null;

type GoalsExperienceProps = {
  profile: FinancialProfile;
  source: "sample" | "saved";
  save: (profile: FinancialProfile) => unknown;
  notice: Notice;
  onNotice: (notice: Exclude<Notice, null>) => void;
  onGoalCompleted: (goalName: string) => void;
  onGoalMoved: (goalId: string, direction: -1 | 1) => void;
};

type ReorderFocusRequest = {
  goalId: string;
  direction: -1 | 1;
  subject: string;
};

const milestones = [25, 50, 75, 100] as const;

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-SA", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
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

function failureMessage(error: unknown) {
  return error instanceof Error ? error.message : "The profile store did not accept the change.";
}

function GoalsExperience({
  profile,
  source,
  save,
  notice,
  onNotice,
  onGoalCompleted,
  onGoalMoved
}: GoalsExperienceProps) {
  const [selectedGoal, setSelectedGoal] = useState<GoalModel | null>(null);
  const [movingGoalId, setMovingGoalId] = useState<string | null>(null);
  const [expandedGoalIds, setExpandedGoalIds] = useState(() => new Set<string>());
  const shouldReduceMotion = useReducedMotion() === true;
  const movingRef = useRef(false);
  const goals = forecastGoalCompletion(profile);
  const totalTarget = profile.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalFunded = profile.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const plannedMonthly = profile.goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0);
  const insight = createGoalPortfolioInsight(goals, profile.currency);

  const toggleGoalDetails = (goalId: string) => {
    setExpandedGoalIds((current) => {
      const next = new Set(current);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const handleGoalSave = (goalId: string, values: GoalUpdateValues) => {
    const beforeGoal = profile.goals.find((goal) => goal.id === goalId);
    try {
      const nextProfile = updateGoal(profile, goalId, values);
      const afterGoal = nextProfile.goals.find((goal) => goal.id === goalId);
      save(nextProfile);
      onNotice({ type: "success", message: `${afterGoal?.name ?? "Goal"} saved. Forecasts have been refreshed.` });
      if (beforeGoal && afterGoal && crossedGoalCompletion(beforeGoal, afterGoal)) {
        onGoalCompleted(afterGoal.name);
      }
    } catch (error) {
      onNotice({ type: "error", message: `Your goal was not saved. ${failureMessage(error)}` });
      throw error;
    }
  };

  const handleMoveGoal = (goalId: string, direction: -1 | 1) => {
    if (movingRef.current) return;
    const goalName = profile.goals.find((goal) => goal.id === goalId)?.name ?? "Goal";

    try {
      const nextProfile = moveGoal(profile, goalId, direction);
      if (nextProfile === profile) return;
      movingRef.current = true;
      setMovingGoalId(goalId);
      save(nextProfile);
      onGoalMoved(goalId, direction);
      onNotice({
        type: "success",
        message: `${goalName} moved ${direction === -1 ? "earlier" : "later"} in the funding order.`
      });
    } catch (error) {
      onNotice({ type: "error", message: `The goal order was not saved. ${failureMessage(error)}` });
    } finally {
      movingRef.current = false;
      setMovingGoalId(null);
    }
  };

  return (
    <>
      <div
        inert={Boolean(selectedGoal)}
        aria-hidden={selectedGoal ? true : undefined}
        className="mx-auto max-w-[1280px]"
      >
        <AppPageHeader
          eyebrow="Active financial model"
          title="Goal portfolio"
          description="Edit saved goals, tune their funding order, and see the engine refresh each completion forecast."
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
          {`${profile.goals.length} active goals loaded from ${source === "saved" ? "your saved" : "the sample"} financial model.`}
        </div>

        {notice && (
          <div
            role={notice.type === "error" ? "alert" : "status"}
            data-state={notice.type === "success" ? "success" : "error"}
            aria-live={notice.type === "error" ? "assertive" : "polite"}
            className={cn(
              "mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold",
              notice.type === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-positive/30 bg-positive/10 text-positive"
            )}
          >
            {notice.type === "error"
              ? <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              : <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            <span>{notice.message}</span>
          </div>
        )}

        <section aria-labelledby="goal-summary-title" className="mb-6 grid gap-4 md:grid-cols-3">
          <h2 id="goal-summary-title" className="sr-only">Goal portfolio summary</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Funded so far</p>
              <AnimatedNumber
                value={totalFunded}
                format={(value) => formatCurrency(value, profile.currency)}
                wrap
                className="mt-2 text-2xl font-black"
              />
              <p className="mt-1 text-sm text-muted-foreground">of {formatCurrency(totalTarget, profile.currency)} targeted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Planned each month</p>
              <AnimatedNumber
                value={plannedMonthly}
                format={(value) => formatCurrency(value, profile.currency)}
                wrap
                className="mt-2 text-2xl font-black"
              />
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

        {insight && (
          <Card
            aria-labelledby="goal-nova-insight-title"
            className="mb-6 border-primary/25 bg-[linear-gradient(135deg,hsl(var(--primary)/0.10),hsl(var(--card))_48%,hsl(var(--chart-3)/0.08))]"
          >
            <CardHeader className="border-b border-primary/15">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.12] text-primary shadow-glow">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Nova goal signal</p>
                  <h2 id="goal-nova-insight-title" className="mt-1 text-lg font-black tracking-tight">{insight.title}</h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 sm:p-6">
              <p className="max-w-4xl text-sm leading-6 text-foreground/90">{insight.message}</p>
              <dl className="grid gap-3 sm:grid-cols-3">
                {insight.evidence.map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-background/55 p-3">
                    <dt className="text-[11px] font-black uppercase tracking-[0.11em] text-muted-foreground">{item.label}</dt>
                    <dd className="mt-1 text-sm font-black tabular-nums">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs leading-5 text-muted-foreground">Grounded in this financial model only. Update a goal to refresh the forecast evidence.</p>
            </CardContent>
          </Card>
        )}

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
                <p className="mt-1 text-sm text-muted-foreground">Forecasts update as soon as a goal change is saved.</p>
              </div>
              <Badge variant="secondary">{goals.length} modeled</Badge>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal, index) => {
                const progress = clamp(goal.progress, 0, 100);
                const signal = goalSignal(progress, goal.forecastDate, goal.targetDate);
                const nextMilestone = milestones.find((milestone) => progress < milestone);
                const detailsId = `goal-details-${goal.id}`;
                const detailsExpanded = expandedGoalIds.has(goal.id);
                const goalInsight = createGoalPortfolioInsight([goal], profile.currency);

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
                      <p className="text-sm text-muted-foreground">{goal.category} · {Math.round(progress)}% funded</p>
                    </CardHeader>

                    <CardContent className="grid gap-5 pt-6">
                      <div className="flex items-center gap-5">
                        <GoalProgressRing value={progress} label={`${goal.name} funding progress`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Current position</p>
                          <p className="mt-1 text-lg font-black">{formatCurrency(goal.currentAmount, profile.currency)}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), profile.currency)} remains of {formatCurrency(goal.targetAmount, profile.currency)}.
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        aria-expanded={detailsExpanded}
                        aria-controls={detailsId}
                        onClick={() => toggleGoalDetails(goal.id)}
                        className="w-full justify-between border border-border bg-muted/25"
                      >
                        {detailsExpanded ? "Hide forecast details" : "Show forecast details"}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-4 motion-safe:transition-transform motion-safe:[transition-duration:var(--motion-fast)]",
                            detailsExpanded && "rotate-180"
                          )}
                        />
                      </Button>

                      <AnimatePresence initial={false}>
                        {detailsExpanded && (
                          <motion.div
                            id={detailsId}
                            role="region"
                            aria-label={`${goal.name} forecast details`}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                            transition={{ duration: shouldReduceMotion ? 0 : motionTokens.standard, ease: motionTokens.ease }}
                            className="grid gap-5"
                          >
                            <ol aria-label={`${goal.name} funding milestones`} className="grid grid-cols-4 gap-2">
                              {milestones.map((milestone) => {
                                const reached = progress >= milestone;
                                return (
                                  <li
                                    key={milestone}
                                    aria-label={`${milestone}% ${reached ? "reached" : "not reached"}`}
                                    aria-current={nextMilestone === milestone ? "step" : undefined}
                                    className="text-center"
                                  >
                                    <span aria-hidden="true" className={cn("mx-auto block h-1.5 rounded-full", reached ? "bg-primary shadow-glow" : "bg-muted")} />
                                    <span className="mt-1.5 block text-[10px] font-bold text-muted-foreground">{milestone}%</span>
                                  </li>
                                );
                              })}
                            </ol>

                            <dl className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl border border-border bg-muted/30 p-3">
                                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Target date</dt>
                                <dd className="mt-1 font-black">{formatDate(goal.targetDate)}</dd>
                              </div>
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
                              <div className="rounded-xl border border-border bg-muted/30 p-3 sm:col-span-2">
                                <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                  <ShieldAlert className="size-3.5" aria-hidden="true" />
                                  Risk signal
                                </dt>
                                <dd className="mt-1 text-sm font-semibold leading-5">{signal.risk}</dd>
                              </div>
                            </dl>

                            {goalInsight && (
                              <div className="rounded-xl border border-primary/20 bg-primary/[0.08] p-4" aria-label={`${goal.name} Nova forecast note`}>
                                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-primary">
                                  <Sparkles className="size-3.5" aria-hidden="true" />
                                  Nova forecast note
                                </p>
                                <p className="mt-2 text-sm leading-6 text-foreground/90">{goalInsight.message}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                        <Button
                          type="button"
                          id={`edit-goal-${goal.id}`}
                          size="sm"
                          variant="outline"
                          aria-haspopup="dialog"
                          onClick={() => setSelectedGoal(goal)}
                        >
                          <PencilLine className="size-3.5" aria-hidden="true" />
                          Edit goal
                        </Button>
                        <Button
                          type="button"
                          id={`move-goal-${goal.id}-earlier`}
                          size="sm"
                          variant="ghost"
                          aria-label={`Move ${goal.name} earlier`}
                          disabled={index === 0 || movingGoalId !== null}
                          onClick={() => handleMoveGoal(goal.id, -1)}
                        >
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                          Earlier
                        </Button>
                        <Button
                          type="button"
                          id={`move-goal-${goal.id}-later`}
                          size="sm"
                          variant="ghost"
                          aria-label={`Move ${goal.name} later`}
                          disabled={index === goals.length - 1 || movingGoalId !== null}
                          onClick={() => handleMoveGoal(goal.id, 1)}
                        >
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                          Later
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {selectedGoal && (
        <GoalEditor
          goal={selectedGoal}
          returnFocusId={`edit-goal-${selectedGoal.id}`}
          onClose={() => setSelectedGoal(null)}
          onSave={handleGoalSave}
        />
      )}
    </>
  );
}

export function GoalsPage() {
  const activeProfile = useFinancialProfile();
  const { profile, source, subject, savedAt, isLoaded, save } = activeProfile;
  const [notice, setNotice] = useState<Notice>(null);
  const [celebration, setCelebration] = useState<{ id: number; goalName: string } | null>(null);
  const lastSubjectRef = useRef(subject);
  const celebrationSequenceRef = useRef(0);
  const pendingReorderFocusRef = useRef<ReorderFocusRequest | null>(null);

  useEffect(() => {
    if (lastSubjectRef.current === subject) return;
    lastSubjectRef.current = subject;
    setNotice(null);
    setCelebration(null);
    pendingReorderFocusRef.current = null;
  }, [subject]);

  useEffect(() => {
    const pendingFocus = pendingReorderFocusRef.current;
    if (!isLoaded || !subject || !pendingFocus) return;
    if (pendingFocus.subject !== subject) {
      pendingReorderFocusRef.current = null;
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const preferredDirection = pendingFocus.direction === -1 ? "earlier" : "later";
      const fallbackDirection = pendingFocus.direction === -1 ? "later" : "earlier";
      const target = [
        `move-goal-${pendingFocus.goalId}-${preferredDirection}`,
        `move-goal-${pendingFocus.goalId}-${fallbackDirection}`,
        `edit-goal-${pendingFocus.goalId}`
      ]
        .map((id) => document.getElementById(id))
        .find((element): element is HTMLButtonElement => (
          element instanceof HTMLButtonElement && !element.disabled
        ));
      target?.focus();
      pendingReorderFocusRef.current = null;
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [isLoaded, profile, subject]);

  if (!subject || !isLoaded) {
    return (
      <div className="mx-auto max-w-[1280px]">
        <AppPageHeader
          eyebrow="Active financial model"
          title="Goal portfolio"
          description="Loading the goal model scoped to your active account."
        />
        <Card>
          <CardContent role="status" aria-live="polite" className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
            <LoaderCircle className="size-8 animate-spin text-primary motion-reduce:animate-none" aria-hidden="true" />
            <div>
              <p className="font-black">Loading goal portfolio</p>
              <p className="mt-1 text-sm text-muted-foreground">Resolving your account-scoped financial profile.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileKey = `${subject}:${savedAt ?? "sample"}`;

  return (
    <>
      <GoalsExperience
        key={profileKey}
        profile={profile}
        source={source}
        save={save}
        notice={notice}
        onNotice={setNotice}
        onGoalMoved={(goalId, direction) => {
          pendingReorderFocusRef.current = { goalId, direction, subject };
        }}
        onGoalCompleted={(goalName) => {
          celebrationSequenceRef.current += 1;
          setCelebration({ id: celebrationSequenceRef.current, goalName });
        }}
      />
      {celebration && (
        <GoalCelebration
          key={celebration.id}
          goalName={celebration.goalName}
          onComplete={() => {
            setCelebration((current) => current?.id === celebration.id ? null : current);
          }}
        />
      )}
    </>
  );
}
