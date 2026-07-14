import { describe, expect, it } from "vitest";
import {
  createGoalPortfolioInsight,
  type GoalForecastEvidence
} from "../lib/presentation/goal-insight";

const goal = (overrides: Partial<GoalForecastEvidence> = {}): GoalForecastEvidence => ({
  id: "house",
  name: "House deposit",
  category: "House",
  targetAmount: 100_000,
  currentAmount: 40_000,
  monthlyContribution: 3_000,
  targetDate: "2027-01-01",
  priority: "High",
  progress: 40,
  forecastDate: "2027-03-01",
  monthsRemaining: 12,
  ...overrides
});

describe("grounded goal portfolio insight", () => {
  it("prioritizes the first forecast that extends beyond its target", () => {
    const insight = createGoalPortfolioInsight([
      goal(),
      goal({
        id: "emergency",
        name: "Emergency fund",
        category: "Emergency",
        targetDate: "2027-06-01",
        forecastDate: "2027-05-01"
      })
    ], "SAR");

    expect(insight).toEqual({
      kind: "attention",
      title: "House deposit needs the clearest next review",
      message: "House deposit is modeled to finish on 2027-03-01, after its 2027-01-01 target. It is 40% funded with SAR 60,000 remaining and SAR 3,000 planned each month.",
      evidence: [
        { label: "Modeled completion", value: "2027-03-01" },
        { label: "Target date", value: "2027-01-01" },
        { label: "Months remaining", value: "12" }
      ]
    });
  });

  it("uses the first unfinished forecast when every forecast is on track", () => {
    const insight = createGoalPortfolioInsight([
      goal({ forecastDate: "2026-12-01" }),
      goal({ id: "second", name: "Second goal", forecastDate: "2026-11-01" })
    ], "SAR");

    expect(insight?.kind).toBe("on-track");
    expect(insight?.title).toBe("House deposit has an on-track forecast");
    expect(insight?.message).toContain("modeled to finish by its target");
    expect(insight?.message).toContain("SAR 60,000 remaining");
  });

  it("does not call the next unfinished goal first when an earlier goal is funded", () => {
    const insight = createGoalPortfolioInsight([
      goal({ currentAmount: 100_000, progress: 100, monthsRemaining: 0 }),
      goal({
        id: "second",
        name: "Second goal",
        forecastDate: "2026-11-01"
      })
    ], "SAR");

    expect(insight?.kind).toBe("on-track");
    expect(insight?.title).toBe("Second goal has an on-track forecast");
    expect(insight?.title).not.toContain("first in your funding order");
  });

  it("reports only current target evidence when every modeled goal is funded", () => {
    const insight = createGoalPortfolioInsight([
      goal({ currentAmount: 100_000, progress: 100, monthsRemaining: 0 }),
      goal({ id: "second", currentAmount: 120_000, progress: 120, monthsRemaining: 0 })
    ], "SAR");

    expect(insight).toEqual({
      kind: "complete",
      title: "Every modeled goal is funded",
      message: "Both modeled goals have current funding at or above their target amounts.",
      evidence: [{ label: "Funded goals", value: "2 of 2" }]
    });
  });

  it("asks for a positive target instead of claiming a zero-target goal is on track", () => {
    const insight = createGoalPortfolioInsight([
      goal({
        targetAmount: 0,
        currentAmount: 0,
        progress: 0,
        forecastDate: "2026-12-01"
      })
    ], "SAR");

    expect(insight).toEqual({
      kind: "needs-target",
      title: "House deposit needs a target amount",
      message: "House deposit has no positive target amount, so Nova cannot calculate meaningful funding progress or confirm a completion forecast. Set a target amount before using this projection.",
      evidence: [
        { label: "Target amount", value: "SAR 0" },
        { label: "Current funding", value: "SAR 0" },
        { label: "Monthly plan", value: "SAR 3,000" }
      ]
    });
  });

  it("is deterministic, leaves inputs unchanged, and has an honest empty state", () => {
    const input = [goal({ currentAmount: Number.NaN, progress: Number.POSITIVE_INFINITY })];
    const snapshot = structuredClone(input);

    const first = createGoalPortfolioInsight(input, "SAR");
    const second = createGoalPortfolioInsight(input, "SAR");

    expect(first).toEqual(second);
    expect(input).toEqual(snapshot);
    expect(first?.message).not.toMatch(/NaN|Infinity|∞/);
    expect(createGoalPortfolioInsight([], "SAR")).toBeNull();
  });
});
