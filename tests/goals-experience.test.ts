import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(
  path.join(process.cwd(), "components/goals/goals-page.tsx"),
  "utf8"
);

describe("goal portfolio experience", () => {
  it("renders only active-profile goals and exposes a real model-edit path", () => {
    expect(source).toContain("useFinancialProfile");
    expect(source).toContain("forecastGoalCompletion(profile)");
    expect(source).toContain("profile.goals.length === 0");
    expect(source).toContain('href="/onboarding"');
    expect(source).toContain("Edit goals in financial model");
    expect(source).not.toContain('["Wedding", "Education"]');
    expect(source).not.toContain("Financial Calendar");
    expect(source).not.toContain("Loan payment due");
  });

  it("shows currency-correct progress, forecast evidence, and the next contribution", () => {
    expect(source).toContain("profile.currency");
    expect(source).toContain("goal.targetDate");
    expect(source).toContain("goal.forecastDate");
    expect(source).toContain("goal.monthsRemaining");
    expect(source).toContain("goal.monthlyContribution");
    expect(source).toContain("Next monthly contribution");
    expect(source).toContain("Forecast status");
    expect(source).toContain("Risk signal");
  });

  it("gives goal progress and status accessible names", () => {
    expect(source).toContain('role="progressbar"');
    expect(source).toContain("aria-valuenow");
    expect(source).toContain("aria-valuemin={0}");
    expect(source).toContain("aria-valuemax={100}");
    expect(source).toContain('aria-live="polite"');
  });
});
