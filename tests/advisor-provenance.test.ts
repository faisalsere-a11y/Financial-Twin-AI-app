import { afterEach, describe, expect, it } from "vitest";
import { compareScenario } from "../lib/financial/engine";
import { sampleProfile, sampleScenario } from "../lib/financial/sample-data";
import {
  buildAdvisorResponse,
  generateAdvisorRecommendations,
  generateAdvisorResponse
} from "../lib/ai/advisor";

const originalApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
});

describe("advisor provenance", () => {
  it("normalizes deterministic and OpenAI response shapes", () => {
    expect(buildAdvisorResponse([" First note ", "", "First note", "Second note"], "deterministic")).toEqual({
      recommendations: ["First note", "Second note"],
      source: "deterministic"
    });
    expect(buildAdvisorResponse(["External explanation"], "openai")).toEqual({
      recommendations: ["External explanation"],
      source: "openai"
    });
  });

  it("labels the no-key fallback as deterministic", async () => {
    delete process.env.OPENAI_API_KEY;
    const comparison = compareScenario(sampleProfile, sampleScenario);
    const response = await generateAdvisorResponse(comparison);

    expect(response.source).toBe("deterministic");
    expect(response.recommendations).toHaveLength(4);
    await expect(generateAdvisorRecommendations(comparison)).resolves.toEqual(response.recommendations);
  });

  it("describes debt direction honestly and avoids car-specific advice for investments", async () => {
    delete process.env.OPENAI_API_KEY;
    const comparison = compareScenario(sampleProfile, {
      ...sampleScenario,
      id: "salary-rise",
      name: "Salary increase",
      type: "salary",
      liabilityDelta: 0,
      monthlyDebtPaymentDelta: 0,
      monthlyIncomeDelta: 4_000,
      upfrontCost: 0
    });
    const salaryAdvice = await generateAdvisorResponse(comparison);

    expect(salaryAdvice.recommendations[0]).toMatch(/decreases|unchanged/i);
    expect(salaryAdvice.recommendations.join(" ")).not.toMatch(/down payment|upfront payment/i);
  });
});
