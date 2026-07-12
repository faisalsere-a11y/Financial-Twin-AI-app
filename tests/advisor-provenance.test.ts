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
});
