import { describe, expect, it } from "vitest";
import { compareScenario } from "../lib/financial/engine";
import { sampleProfile, scenarioLibrary } from "../lib/financial/sample-data";
import { buildNovaDecisionView } from "../lib/presentation/nova-decision";

describe("NOVA decision view model", () => {
  it("separates recommendation, evidence, assumptions, provenance, and limits", () => {
    const scenario = scenarioLibrary.find((item) => item.type === "car") ?? scenarioLibrary[0];
    const comparison = compareScenario(sampleProfile, scenario);
    const view = buildNovaDecisionView(comparison, {
      source: "deterministic",
      recommendations: comparison.recommendations
    });

    expect(view.recommendation.title).toMatch(/reshape|buffer|feasible/i);
    expect(view.evidence.map((item) => item.id)).toEqual(["surplus", "debt-ratio", "emergency-runway", "health"]);
    expect(view.evidence.find((item) => item.id === "surplus")?.rawDelta).toBe(comparison.delta.monthlySurplus);
    expect(view.assumptions.join(" ")).toContain(`${scenario.durationMonths} months`);
    expect(view.provenance).toEqual({ source: "deterministic", label: "Deterministic fallback" });
    expect(view.confidence.score).toBeGreaterThanOrEqual(0);
    expect(view.confidence.score).toBeLessThanOrEqual(100);
    expect(view.confidence.basis).toContain("input coverage");
    expect(view.boundary).toMatch(/educational/i);
    expect(view.actions.map((action) => action.href)).toEqual(["/onboarding", "/reports"]);
  });

  it("changes the recommendation when the scenario preserves versus harms resilience", () => {
    const investment = scenarioLibrary.find((item) => item.type === "investment") ?? scenarioLibrary[0];
    const loan = scenarioLibrary.find((item) => item.type === "loan") ?? scenarioLibrary[0];
    const highCommitmentLoan = {
      ...loan,
      monthlyExpenseDelta: loan.monthlyExpenseDelta + 3_000,
      monthlyDebtPaymentDelta: loan.monthlyDebtPaymentDelta + 8_000
    };
    const investmentView = buildNovaDecisionView(compareScenario(sampleProfile, investment));
    const loanView = buildNovaDecisionView(compareScenario(sampleProfile, highCommitmentLoan));

    expect(investmentView.recommendation.title).not.toBe(loanView.recommendation.title);
    expect(investmentView.recommendation.tone).not.toBe(loanView.recommendation.tone);
  });

  it("labels external advisor notes without treating them as model evidence", () => {
    const scenario = scenarioLibrary[0];
    const view = buildNovaDecisionView(compareScenario(sampleProfile, scenario), {
      source: "openai",
      recommendations: ["Compare a larger down payment."]
    });

    expect(view.provenance).toEqual({ source: "openai", label: "OpenAI-assisted explanation" });
    expect(view.advisorNotes).toEqual(["Compare a larger down payment."]);
    expect(view.evidence.every((item) => item.detail.length > 0)).toBe(true);
  });
});
