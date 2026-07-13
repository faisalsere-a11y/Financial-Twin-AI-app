import { describe, expect, it } from "vitest";
import { sampleProfile } from "../lib/financial/sample-data";
import {
  GoalUpdateError,
  crossedGoalCompletion,
  goalUpdateSchema,
  moveGoal,
  updateGoal
} from "../lib/profile/goal-updates";

function cloneProfile() {
  return structuredClone(sampleProfile);
}

describe("goalUpdateSchema", () => {
  it("accepts the planned spread-goal call shape and trims the name", () => {
    const goal = sampleProfile.goals[0]!;

    const parsed = goalUpdateSchema.parse({ ...goal, name: "  Safety reserve  " });

    expect(parsed).toEqual({ ...goal, name: "Safety reserve" });
  });

  it.each([
    ["blank name", { name: "   " }],
    ["unsupported category", { category: "Car" }],
    ["zero target", { targetAmount: 0 }],
    ["negative current", { currentAmount: -1 }],
    ["negative contribution", { monthlyContribution: -1 }],
    ["nonfinite target", { targetAmount: Number.POSITIVE_INFINITY }],
    ["nonfinite current", { currentAmount: Number.NaN }],
    ["nonfinite contribution", { monthlyContribution: Number.NEGATIVE_INFINITY }],
    ["impossible ISO date", { targetDate: "2027-02-29" }],
    ["timestamp instead of ISO date", { targetDate: "2027-11-01T00:00:00.000Z" }],
    ["unsupported priority", { priority: "Urgent" }]
  ])("rejects %s", (_label, patch) => {
    const goal = sampleProfile.goals[0]!;

    expect(goalUpdateSchema.safeParse({ ...goal, ...patch }).success).toBe(false);
  });
});

describe("goal updates", () => {
  it("immutably updates only the selected goal without mutating the input", () => {
    const profile = cloneProfile();
    const snapshot = cloneProfile();
    const goal = profile.goals[0]!;
    const values = { ...goal, name: "  Updated reserve  ", currentAmount: goal.currentAmount + 500 };

    const next = updateGoal(profile, goal.id, values);

    expect(next.goals[0]).toEqual({ ...goal, name: "Updated reserve", currentAmount: goal.currentAmount + 500 });
    expect(next).not.toBe(profile);
    expect(next.goals).not.toBe(profile.goals);
    expect(next.goals[0]).not.toBe(goal);
    expect(next.goals[1]).toBe(profile.goals[1]);
    expect(profile).toEqual(snapshot);
    expect(values).toEqual({ ...goal, name: "  Updated reserve  ", currentAmount: goal.currentAmount + 500 });
  });

  it("does not allow an input id to mutate the selected goal id", () => {
    const goal = sampleProfile.goals[0]!;

    expect(() => updateGoal(sampleProfile, goal.id, { ...goal, id: "goal-hijacked" })).toThrowError(
      expect.objectContaining({
        code: "GOAL_VALIDATION_FAILED",
        message: "Goal update is invalid."
      })
    );
    expect(sampleProfile.goals[0]!.id).toBe(goal.id);
  });

  it("throws a stable validation error and leaves the profile unchanged", () => {
    const profile = cloneProfile();
    const snapshot = cloneProfile();
    const goal = profile.goals[0]!;

    expect(() => updateGoal(profile, goal.id, { ...goal, targetAmount: Number.NaN })).toThrowError(
      expect.objectContaining({
        code: "GOAL_VALIDATION_FAILED",
        message: "Goal update is invalid."
      })
    );
    expect(profile).toEqual(snapshot);
  });

  it("throws a stable missing-goal error for update and move", () => {
    for (const operation of [
      () => updateGoal(sampleProfile, "missing-goal", sampleProfile.goals[0]!),
      () => moveGoal(sampleProfile, "missing-goal", 1)
    ]) {
      expect(operation).toThrowError(
        expect.objectContaining({
          code: "GOAL_NOT_FOUND",
          message: 'Goal "missing-goal" was not found.'
        })
      );
    }
  });

  it("reorders within bounds without cloning or mutating goal objects", () => {
    const profile = cloneProfile();
    const snapshot = cloneProfile();
    const first = profile.goals[0]!;
    const second = profile.goals[1]!;

    const next = moveGoal(profile, second.id, -1);

    expect(next).not.toBe(profile);
    expect(next.goals).not.toBe(profile.goals);
    expect(next.goals[0]).toBe(second);
    expect(next.goals[1]).toBe(first);
    expect(profile).toEqual(snapshot);
  });

  it("returns the same profile for boundary moves", () => {
    const first = sampleProfile.goals[0]!;
    const last = sampleProfile.goals.at(-1)!;

    expect(moveGoal(sampleProfile, first.id, -1)).toBe(sampleProfile);
    expect(moveGoal(sampleProfile, last.id, 1)).toBe(sampleProfile);
  });

  it("rejects invalid runtime move directions with a stable validation error", () => {
    expect(() => moveGoal(sampleProfile, sampleProfile.goals[0]!.id, 2 as -1 | 1)).toThrowError(
      expect.objectContaining({
        code: "GOAL_VALIDATION_FAILED",
        message: "Goal update is invalid."
      })
    );
  });
});

describe("crossedGoalCompletion", () => {
  it("returns true only when progress crosses from below 100 percent", () => {
    expect(
      crossedGoalCompletion(
        { currentAmount: 90, targetAmount: 100 },
        { currentAmount: 100, targetAmount: 100 }
      )
    ).toBe(true);
    expect(
      crossedGoalCompletion(
        { currentAmount: 90, targetAmount: 100 },
        { currentAmount: 101, targetAmount: 100 }
      )
    ).toBe(true);
    expect(
      crossedGoalCompletion(
        { currentAmount: 100, targetAmount: 100 },
        { currentAmount: 100, targetAmount: 100 }
      )
    ).toBe(false);
    expect(
      crossedGoalCompletion(
        { currentAmount: 120, targetAmount: 100 },
        { currentAmount: 130, targetAmount: 100 }
      )
    ).toBe(false);
  });

  it.each([
    [{ currentAmount: 0, targetAmount: 0 }, { currentAmount: 1, targetAmount: 0 }],
    [{ currentAmount: 0, targetAmount: -1 }, { currentAmount: 1, targetAmount: 1 }],
    [{ currentAmount: -1, targetAmount: 100 }, { currentAmount: 100, targetAmount: 100 }],
    [{ currentAmount: Number.NaN, targetAmount: 100 }, { currentAmount: 100, targetAmount: 100 }],
    [{ currentAmount: 0, targetAmount: 100 }, { currentAmount: Number.POSITIVE_INFINITY, targetAmount: 100 }],
    [{ currentAmount: 0, targetAmount: 100 }, { currentAmount: 100, targetAmount: Number.NaN }]
  ])("does not celebrate invalid completion inputs", (before, after) => {
    expect(crossedGoalCompletion(before, after)).toBe(false);
  });
});

describe("GoalUpdateError", () => {
  it("is a named Error with a stable public code", () => {
    const error = new GoalUpdateError("GOAL_NOT_FOUND", 'Goal "x" was not found.');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("GoalUpdateError");
    expect(error.code).toBe("GOAL_NOT_FOUND");
  });
});
