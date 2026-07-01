import { describe, expect, it } from "vitest";
import { calculateFinancialTwin, compareScenario } from "../lib/financial/engine";
import { sampleProfile, sampleScenario } from "../lib/financial/sample-data";

describe("financial twin engine", () => {
  it("projects health, surplus, risk, and 12 month net worth from Saudi profile data", () => {
    const result = calculateFinancialTwin(sampleProfile);

    expect(result.monthlySurplus).toBe(5700);
    expect(result.savingsRate).toBeCloseTo(30.81, 1);
    expect(result.financialHealth.score).toBeGreaterThanOrEqual(78);
    expect(result.risk.level).toBe("Medium");
    expect(result.timeline).toHaveLength(12);
    expect(result.timeline[11]?.netWorth).toBeGreaterThan(result.timeline[0]?.netWorth ?? 0);
  });

  it("compares current path against a car purchase scenario", () => {
    const comparison = compareScenario(sampleProfile, sampleScenario);

    expect(comparison.current.monthlySurplus).toBe(5700);
    expect(comparison.after.monthlySurplus).toBeLessThan(comparison.current.monthlySurplus);
    expect(comparison.delta.debtPayment).toBe(1650);
    expect(comparison.delta.netWorth12Month).toBeLessThan(0);
    expect(comparison.recommendations[0]).toContain("debt ratio");
  });
});
