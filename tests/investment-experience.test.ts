import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("portfolio simulator experience", () => {
  const source = readFileSync("components/investments/investment-simulator.tsx", "utf8");

  it("uses the active profile and validated accessible controls", () => {
    expect(source).toContain("useFinancialProfile");
    expect(source).toContain("profile.assets.investments");
    expect(source).toContain('htmlFor="initialAmount"');
    expect(source).toContain('id="initialAmount"');
    expect(source).toContain("aria-invalid");
    expect(source).toContain("aria-describedby");
    expect(source).toContain('role="alert"');
    expect(source).toContain('aria-live="polite"');
  });

  it("explains risk and deterministic percentile output", () => {
    expect(source).toContain("Volatility");
    expect(source).toContain("P10");
    expect(source).toContain("P50");
    expect(source).toContain("P90");
    expect(source).toContain("Deterministic seed: 1337");
    expect(source).toContain("not guaranteed");
  });

  it("uses accessible semantically themed charts", () => {
    expect(source).toContain("ChartFrame");
    expect(source).toContain("chartTheme.current");
    expect(source).toContain("chartTheme.after");
    expect(source).toContain("chartTheme.comparison");
    expect(source).toContain("profile.currency");
    expect(source).not.toContain('stroke="#');
    expect(source).not.toContain('background: "#');
    expect(source).not.toContain("rgba(255,255,255");
  });
});
