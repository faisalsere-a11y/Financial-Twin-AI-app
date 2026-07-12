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
  const scenario = comparison.scenario.name.toLowerCase();
  const surplusDelta = Math.abs(comparison.delta.monthlySurplus);
  const debtDelta = comparison.after.debtRatio - comparison.current.debtRatio;

  return [
    `${comparison.scenario.name} increases your debt ratio by ${debtDelta.toFixed(1)} percentage points.`,
    surplusDelta > 1000
      ? `Wait 8 months or increase the down payment by 15% to protect your monthly surplus.`
      : `This scenario keeps your cash flow resilient if your emergency fund stays above 6 months.`,
    comparison.after.emergencyFundMonths < 4
      ? "Emergency fund is too low after this move. Rebuild it before adding new obligations."
      : `You can safely invest ${Math.max(400, Math.round(comparison.after.monthlySurplus * 0.2))} SAR/month while keeping the plan balanced.`,
    scenario.includes("investment")
      ? "Use a diversified ETF core before adding higher-volatility assets."
      : "Run a second version with a larger upfront payment to compare lower risk against liquidity."
  ];
}

export async function generateAdvisorResponse(comparison: ScenarioComparison): Promise<AdvisorResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return buildAdvisorResponse(mockAdvice(comparison), "deterministic");
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content:
            "You are Financial Twin AI, a concise Saudi-focused financial planning assistant. Return four short, specific recommendations in SAR. Do not provide regulated financial advice disclaimers."
        },
        {
          role: "user",
          content: JSON.stringify({
            scenario: comparison.scenario,
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
