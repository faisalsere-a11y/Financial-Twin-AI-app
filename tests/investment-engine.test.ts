import { describe, expect, it } from "vitest";
import { runInvestmentProjection, runMonteCarlo } from "../lib/financial/investments";

describe("investment simulator", () => {
  it("compounds monthly contributions into an annual projection", () => {
    const projection = runInvestmentProjection({
      initialAmount: 52000,
      monthlyContribution: 1200,
      annualReturn: 8,
      years: 10,
      volatility: 12
    });

    expect(projection.points).toHaveLength(11);
    expect(projection.futureValue).toBeGreaterThan(260000);
    expect(projection.totalContributions).toBe(196000);
  });

  it("produces deterministic Monte Carlo percentiles when seeded", () => {
    const result = runMonteCarlo({
      initialAmount: 25000,
      monthlyContribution: 1500,
      annualReturn: 7,
      years: 8,
      volatility: 10,
      iterations: 250,
      seed: 42
    });

    expect(result.p10).toBeLessThan(result.median);
    expect(result.median).toBeLessThan(result.p90);
    expect(result.paths).toHaveLength(24);
  });
});
