import OpenAI from "openai";
import type { ScenarioComparison } from "@/lib/financial/types";
import type { AdvisorSource } from "@/lib/presentation/nova-decision";

export interface AdvisorResponse {
  recommendations: string[];
  source: AdvisorSource;
}

export function buildAdvisorResponse(recommendations: string[], source: AdvisorSource): AdvisorResponse {
  return {
    recommendations: [...new Set(recommendations.map((item) => item.trim()).filter(Boolean))].slice(0, 4),
    source
  };
}

function mockAdvice(comparison: ScenarioComparison) {
  const scenarioType = comparison.scenario.type;
  const surplusDelta = Math.abs(comparison.delta.monthlySurplus);
  const debtDelta = comparison.after.debtRatio - comparison.current.debtRatio;
  const direction = debtDelta > 0.05 ? "increases" : debtDelta < -0.05 ? "decreases" : "leaves";
  const debtDetail = direction === "leaves"
    ? "leaves your debt ratio essentially unchanged"
    : `${direction} your debt ratio by ${Math.abs(debtDelta).toFixed(1)} percentage points`;
  const currency = comparison.current.profile.currency;
  const obligationScenario = ["car", "house", "loan", "education"].includes(scenarioType);
  const cashFlowAdvice = obligationScenario
    ? surplusDelta > 1000
      ? "Compare a lower-cost version or a larger upfront payment before accepting the monthly obligation."
      : "Keep the planned payment inside the tested cash-flow range and compare one lower-cost version."
    : scenarioType === "investment"
      ? "Compare a lower monthly contribution to see how much liquidity the return assumption is costing."
      : "Compare a conservative version of the same income and expense assumptions before acting.";

  return [
    `${comparison.scenario.name} ${debtDetail}.`,
    cashFlowAdvice,
    comparison.after.emergencyFundMonths < 4
      ? "Emergency fund is too low after this move. Rebuild it before adding new obligations."
      : `A 20% surplus allocation would be ${Math.max(0, Math.round(comparison.after.monthlySurplus * 0.2))} ${currency}/month; test that allocation separately before committing.`,
    scenarioType === "investment"
      ? "Use a diversified ETF core before adding higher-volatility assets."
      : obligationScenario
        ? "Run a second version with a larger upfront payment to compare lower risk against liquidity."
        : "Stress-test the result with lower income and higher recurring expenses."
  ];
}

export async function generateAdvisorResponse(comparison: ScenarioComparison): Promise<AdvisorResponse> {
  if (!process.env.OPENAI_API_KEY || process.env.AI_ADVISOR_ENABLED !== "true") {
    return buildAdvisorResponse(mockAdvice(comparison), "deterministic");
  }

  try {
    const configuredTimeout = Number(process.env.OPENAI_TIMEOUT_MS ?? 10_000);
    const timeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? Math.min(configuredTimeout, 60_000)
      : 10_000;
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout,
      maxRetries: 1
    });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "You are Financial Twin AI, a concise financial planning assistant. Return four short, specific recommendations in the provided profile currency. Do not provide regulated financial advice disclaimers."
        },
        {
          role: "user",
          content: JSON.stringify({
            scenario: comparison.scenario,
            currency: comparison.current.profile.currency,
            current: {
              surplus: comparison.current.monthlySurplus,
              debtRatio: comparison.current.debtRatio,
              risk: comparison.current.risk.level,
              emergencyFundMonths: comparison.current.emergencyFundMonths
            },
            after: {
              surplus: comparison.after.monthlySurplus,
              debtRatio: comparison.after.debtRatio,
              risk: comparison.after.risk.level,
              emergencyFundMonths: comparison.after.emergencyFundMonths
            }
          })
        }
      ]
    });

    const content = response.choices[0]?.message.content;
    if (!content) return buildAdvisorResponse(mockAdvice(comparison), "deterministic");

    return buildAdvisorResponse(
      content.split(/\n+/).map((line) => line.replace(/^[-*\d.]\s*/, "").trim()),
      "openai"
    );
  } catch {
    return buildAdvisorResponse(mockAdvice(comparison), "deterministic");
  }
}

export async function generateAdvisorRecommendations(comparison: ScenarioComparison) {
  return (await generateAdvisorResponse(comparison)).recommendations;
}
