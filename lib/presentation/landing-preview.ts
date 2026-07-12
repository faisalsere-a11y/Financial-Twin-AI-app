import { compareScenario } from "../financial/engine";
import { sampleProfile, scenarioLibrary } from "../financial/sample-data";
import type { ScenarioInput } from "../financial/types";
import { buildFinancialOverview, type FinancialOverviewViewModel } from "./financial-overview";

const optionDefinitions = [
  {
    id: "scenario-start-investment",
    label: "Invest monthly",
    description: "Compare disciplined investing with the current path."
  },
  {
    id: "scenario-buy-car",
    label: "Buy a car",
    description: "See the liquidity and debt impact before financing."
  },
  {
    id: "scenario-buy-home",
    label: "Buy a home",
    description: "Stress-test a long-term housing commitment."
  }
] as const;

export const landingScenarioOptions = optionDefinitions.map((option) => ({ ...option }));

export interface LandingPreviewViewModel {
  scenario: ScenarioInput;
  overview: FinancialOverviewViewModel;
  healthCurrent: number;
  healthAfter: number;
  evidence: string;
  recommendation: string;
  assumption: string;
  simulationHref: string;
}

const defaultScenario = scenarioLibrary.find((scenario) => scenario.id === "scenario-start-investment") ?? scenarioLibrary[0];

export function buildLandingPreview(scenarioId: string): LandingPreviewViewModel {
  const scenario = scenarioLibrary.find((item) => item.id === scenarioId) ?? defaultScenario;

  if (!scenario) {
    throw new Error("The landing preview requires at least one configured scenario.");
  }

  const comparison = compareScenario(sampleProfile, scenario);
  const monthlyDelta = comparison.delta.monthlySurplus;
  const absoluteDelta = Math.abs(monthlyDelta).toLocaleString("en-US");
  const evidence = monthlyDelta === 0
    ? `${scenario.name} keeps monthly cash flow unchanged in the sample model.`
    : `${scenario.name} ${monthlyDelta > 0 ? "adds" : "uses"} ${absoluteDelta} SAR of monthly cash flow in the sample model.`;

  return {
    scenario,
    overview: buildFinancialOverview(sampleProfile, scenario),
    healthCurrent: comparison.current.financialHealth.score,
    healthAfter: comparison.after.financialHealth.score,
    evidence,
    recommendation: comparison.recommendations[1] ?? comparison.recommendations[0] ?? "Compare another scenario before deciding.",
    assumption: `Uses the sample profile, a ${scenario.durationMonths}-month decision horizon, and no live bank connection.`,
    simulationHref: `/simulations?scenario=${scenario.type}`
  };
}
