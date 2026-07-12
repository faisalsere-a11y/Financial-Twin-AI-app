import { describe, expect, it } from "vitest";
import { calculateFinancialTwin, compareScenario } from "../lib/financial/engine";
import { sampleProfile, sampleScenario } from "../lib/financial/sample-data";
import { buildFinancialOverview } from "../lib/presentation/financial-overview";
import { formatCurrency } from "../lib/utils";

describe("financial overview presentation", () => {
  it("maps authoritative twin metrics without recalculating them", () => {
    const twin = calculateFinancialTwin(sampleProfile);
    const view = buildFinancialOverview(sampleProfile, sampleScenario);

    expect(view.profile).toEqual({ name: sampleProfile.name, initials: sampleProfile.initials, currency: "SAR" });
    expect(view.metrics.map((metric) => metric.id)).toEqual([
      "net-worth",
      "monthly-surplus",
      "emergency-runway",
      "health-score"
    ]);
    expect(view.metrics[0]?.value).toBe(formatCurrency(twin.netWorth));
    expect(view.metrics[1]?.rawValue).toBe(twin.monthlySurplus);
    expect(view.flow).toEqual({
      monthlyIncome: twin.monthlyIncome,
      monthlyExpenses: twin.monthlyExpenses,
      monthlyDebtPayment: twin.monthlyDebtPayment,
      savingsBalance: sampleProfile.assets.cash,
      debtRatio: twin.debtRatio,
      savingsRate: twin.savingsRate
    });
  });

  it("builds current and after series plus an equivalent text summary", () => {
    const comparison = compareScenario(sampleProfile, sampleScenario);
    const view = buildFinancialOverview(sampleProfile, sampleScenario);

    expect(view.cashFlow).toHaveLength(12);
    expect(view.cashFlow[0]).toEqual({
      month: comparison.current.timeline[0]?.month,
      current: comparison.current.timeline[0]?.cashFlow,
      after: comparison.after.timeline[0]?.cashFlow
    });
    expect(view.cashFlowSummary).toContain(formatCurrency(comparison.current.timeline.at(-1)?.cashFlow ?? 0));
    expect(view.cashFlowSummary).toContain(formatCurrency(comparison.after.timeline.at(-1)?.cashFlow ?? 0));
  });
});
