import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compareScenario } from "../lib/financial/engine";
import { sampleProfile, scenarioLibrary } from "../lib/financial/sample-data";

describe("landing decision preview", () => {
  it("offers only scenarios backed by the existing library", async () => {
    const path = "lib/presentation/landing-preview.ts";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;
    const { landingScenarioOptions } = await import("../lib/presentation/landing-preview");

    expect(landingScenarioOptions.map((option) => option.id)).toEqual([
      "scenario-start-investment",
      "scenario-buy-car",
      "scenario-buy-home"
    ]);
    for (const option of landingScenarioOptions) {
      expect(scenarioLibrary.some((scenario) => scenario.id === option.id)).toBe(true);
    }
  });

  it("derives every preview value from the financial engine", async () => {
    const path = "lib/presentation/landing-preview.ts";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;
    const { buildLandingPreview } = await import("../lib/presentation/landing-preview");
    const scenario = scenarioLibrary.find((item) => item.id === "scenario-buy-car")!;
    const comparison = compareScenario(sampleProfile, scenario);
    const preview = buildLandingPreview(scenario.id);

    expect(preview.scenario.name).toBe(scenario.name);
    expect(preview.overview.decision.monthlySurplusDelta).toBe(comparison.delta.monthlySurplus);
    expect(preview.healthAfter).toBe(comparison.after.financialHealth.score);
    expect(preview.evidence).toContain(`${Math.abs(comparison.delta.monthlySurplus).toLocaleString("en-US")} SAR`);
    expect(preview.simulationHref).toBe("/simulations?scenario=car");
  });

  it("falls back deterministically to the investment scenario", async () => {
    const path = "lib/presentation/landing-preview.ts";
    expect(existsSync(path)).toBe(true);
    if (!existsSync(path)) return;
    const { buildLandingPreview } = await import("../lib/presentation/landing-preview");
    expect(buildLandingPreview("missing").scenario.id).toBe("scenario-start-investment");
  });
});
