import type { CurrencyCode, GoalModel } from "@/lib/financial/types";
import { formatCurrency } from "@/lib/utils";

export type GoalForecastEvidence = GoalModel & {
  progress: number;
  forecastDate: string;
  monthsRemaining: number;
};

export type GoalPortfolioInsight = {
  kind: "complete" | "attention" | "on-track" | "needs-target";
  title: string;
  message: string;
  evidence: ReadonlyArray<{ label: string; value: string }>;
};

export function createGoalPortfolioInsight(
  goals: ReadonlyArray<GoalForecastEvidence>,
  currency: CurrencyCode
): GoalPortfolioInsight | null {
  if (goals.length === 0) return null;

  const finiteAmount = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
  const finiteCount = (value: number) => Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  const normalized = goals.map((goal) => {
    const targetAmount = finiteAmount(goal.targetAmount);
    const currentAmount = finiteAmount(goal.currentAmount);
    const monthlyContribution = finiteAmount(goal.monthlyContribution);
    const progress = Number.isFinite(goal.progress)
      ? Math.min(100, Math.max(0, goal.progress))
      : targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

    return {
      ...goal,
      targetAmount,
      currentAmount,
      monthlyContribution,
      progress,
      monthsRemaining: finiteCount(goal.monthsRemaining),
      remainingAmount: Math.max(0, targetAmount - currentAmount),
      funded: targetAmount > 0 && currentAmount >= targetAmount
    };
  });
  const missingTarget = normalized.find((goal) => goal.targetAmount <= 0);

  if (missingTarget) {
    const target = formatCurrency(missingTarget.targetAmount, currency).replace(/\u00a0/g, " ");
    const current = formatCurrency(missingTarget.currentAmount, currency).replace(/\u00a0/g, " ");
    const monthly = formatCurrency(missingTarget.monthlyContribution, currency).replace(/\u00a0/g, " ");
    return {
      kind: "needs-target",
      title: `${missingTarget.name} needs a target amount`,
      message: `${missingTarget.name} has no positive target amount, so Nova cannot calculate meaningful funding progress or confirm a completion forecast. Set a target amount before using this projection.`,
      evidence: [
        { label: "Target amount", value: target },
        { label: "Current funding", value: current },
        { label: "Monthly plan", value: monthly }
      ]
    };
  }
  const unfinished = normalized.filter((goal) => !goal.funded);

  if (unfinished.length === 0) {
    const count = normalized.length;
    const subject = count === 1
      ? "The modeled goal has current funding at or above its target amount."
      : count === 2 ? "Both modeled goals have" : `All ${count} modeled goals have`;
    return {
      kind: "complete",
      title: count === 1 ? "The modeled goal is funded" : "Every modeled goal is funded",
      message: count === 1
        ? subject
        : `${subject} current funding at or above their target amounts.`,
      evidence: [{ label: "Funded goals", value: `${count} of ${count}` }]
    };
  }

  const lateGoal = unfinished.find((goal) => goal.forecastDate > goal.targetDate);
  const focusGoal = lateGoal ?? unfinished[0]!;
  const remaining = formatCurrency(focusGoal.remainingAmount, currency).replace(/\u00a0/g, " ");
  const monthly = formatCurrency(focusGoal.monthlyContribution, currency).replace(/\u00a0/g, " ");
  const progress = Math.round(focusGoal.progress);
  const evidence = [
    { label: "Modeled completion", value: focusGoal.forecastDate },
    { label: "Target date", value: focusGoal.targetDate },
    { label: "Months remaining", value: String(focusGoal.monthsRemaining) }
  ];

  if (lateGoal) {
    return {
      kind: "attention",
      title: `${focusGoal.name} needs the clearest next review`,
      message: `${focusGoal.name} is modeled to finish on ${focusGoal.forecastDate}, after its ${focusGoal.targetDate} target. It is ${progress}% funded with ${remaining} remaining and ${monthly} planned each month.`,
      evidence
    };
  }

  return {
    kind: "on-track",
    title: `${focusGoal.name} has an on-track forecast`,
    message: `${focusGoal.name} is modeled to finish by its target. It is ${progress}% funded with ${remaining} remaining and ${monthly} planned each month.`,
    evidence
  };
}
