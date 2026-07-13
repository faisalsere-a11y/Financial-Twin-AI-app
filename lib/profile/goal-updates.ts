import { z } from "zod";
import type { FinancialProfile, GoalModel } from "../financial/types";

const goalCategories = [
  "Emergency",
  "Retirement",
  "House",
  "Wedding",
  "Vacation",
  "Education"
] as const satisfies readonly GoalModel["category"][];

const goalPriorities = ["High", "Medium", "Low"] as const satisfies readonly GoalModel["priority"][];

function isRealIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1) return false;

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

export const goalUpdateSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, "Enter a goal name."),
  category: z.enum(goalCategories),
  targetAmount: z.number().finite().positive("Target amount must be greater than zero."),
  currentAmount: z.number().finite().nonnegative("Current amount cannot be negative."),
  monthlyContribution: z.number().finite().nonnegative("Monthly contribution cannot be negative."),
  targetDate: z.string().refine(isRealIsoDate, "Enter a valid date in YYYY-MM-DD format."),
  priority: z.enum(goalPriorities)
}).strict();

export type GoalUpdateValues = z.input<typeof goalUpdateSchema>;
export type GoalUpdateErrorCode = "GOAL_NOT_FOUND" | "GOAL_VALIDATION_FAILED";

const errorMessages: Record<GoalUpdateErrorCode, string> = {
  GOAL_NOT_FOUND: "Goal was not found.",
  GOAL_VALIDATION_FAILED: "Goal update is invalid."
};

export class GoalUpdateError extends Error {
  readonly code: GoalUpdateErrorCode;
  readonly issues: z.ZodIssue[];

  constructor(code: GoalUpdateErrorCode, message = errorMessages[code], issues: z.ZodIssue[] = []) {
    super(message);
    this.name = "GoalUpdateError";
    this.code = code;
    this.issues = issues;
  }
}

function goalNotFound(goalId: string) {
  return new GoalUpdateError("GOAL_NOT_FOUND", `Goal "${goalId}" was not found.`);
}

function invalidGoalUpdate(issues: z.ZodIssue[] = []) {
  return new GoalUpdateError("GOAL_VALIDATION_FAILED", errorMessages.GOAL_VALIDATION_FAILED, issues);
}

export function updateGoal(
  profile: FinancialProfile,
  goalId: string,
  values: GoalUpdateValues
): FinancialProfile {
  const goalIndex = profile.goals.findIndex((goal) => goal.id === goalId);
  if (goalIndex === -1) throw goalNotFound(goalId);

  const result = goalUpdateSchema.safeParse(values);
  if (!result.success) throw invalidGoalUpdate(result.error.issues);
  if (result.data.id !== undefined && result.data.id !== goalId) throw invalidGoalUpdate();

  const nextGoal: GoalModel = {
    ...result.data,
    id: profile.goals[goalIndex]!.id
  };

  return {
    ...profile,
    goals: profile.goals.map((goal, index) => index === goalIndex ? nextGoal : goal)
  };
}

export function moveGoal(profile: FinancialProfile, goalId: string, direction: -1 | 1): FinancialProfile {
  const goalIndex = profile.goals.findIndex((goal) => goal.id === goalId);
  if (goalIndex === -1) throw goalNotFound(goalId);
  if (direction !== -1 && direction !== 1) throw invalidGoalUpdate();

  const nextIndex = Math.max(0, Math.min(profile.goals.length - 1, goalIndex + direction));
  if (nextIndex === goalIndex) return profile;

  const goals = profile.goals.slice();
  const [selectedGoal] = goals.splice(goalIndex, 1);
  goals.splice(nextIndex, 0, selectedGoal!);
  return { ...profile, goals };
}

type GoalCompletionAmounts = Pick<GoalModel, "currentAmount" | "targetAmount">;

function hasValidCompletionAmounts(goal: GoalCompletionAmounts) {
  return Number.isFinite(goal.currentAmount)
    && goal.currentAmount >= 0
    && Number.isFinite(goal.targetAmount)
    && goal.targetAmount > 0;
}

export function crossedGoalCompletion(before: GoalCompletionAmounts, after: GoalCompletionAmounts) {
  if (!hasValidCompletionAmounts(before) || !hasValidCompletionAmounts(after)) return false;
  return before.currentAmount / before.targetAmount < 1
    && after.currentAmount / after.targetAmount >= 1;
}
