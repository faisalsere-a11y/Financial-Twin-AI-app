import type { ScenarioComparison } from "../financial/types";
import { clamp, formatCurrency, formatPercent } from "../utils";

export type AdvisorSource = "deterministic" | "openai";

export interface NovaDecisionEvidence {
  id: "surplus" | "debt-ratio" | "emergency-runway" | "health";
  label: string;
  value: string;
  rawDelta: number;
  detail: string;
}

export interface NovaDecisionView {
  recommendation: {
    title: string;
    summary: string;
    tone: "positive" | "caution" | "danger";
  };
  evidence: NovaDecisionEvidence[];
  confidence: {
    score: number;
    level: "High" | "Medium" | "Low";
    basis: string;
  };
  assumptions: string[];
  provenance: {
    source: AdvisorSource;
    label: "Deterministic fallback" | "OpenAI-assisted explanation";
  };
  advisorNotes: string[];
  actions: Array<{ label: string; href: "/onboarding" | "/reports" }>;
  boundary: string;
}

function recommendationFor(comparison: ScenarioComparison): NovaDecisionView["recommendation"] {
  const debtRatioChange = comparison.after.debtRatio - comparison.current.debtRatio;

  if (comparison.after.risk.level === "High" || comparison.after.monthlySurplus < 0 || debtRatioChange >= 10) {
    return {
      title: "Reshape this decision before committing",
      summary: "The modeled obligation weakens resilience beyond a prudent range. Reduce the commitment, increase the upfront buffer, or delay the decision.",
      tone: "danger"
    };
  }

  if (comparison.delta.healthScore < 0 || comparison.delta.monthlySurplus < -1000 || comparison.after.emergencyFundMonths < 4) {
    return {
      title: "Proceed only with a protected buffer",
      summary: "The decision remains possible in the model, but it consumes meaningful monthly or emergency capacity. Compare a lower-cost version before acting.",
      tone: "caution"
    };
  }

  return {
    title: "Financially feasible in the current model",
    summary: "Cash flow, debt service, and emergency runway remain within the model's resilient range. Review assumptions and compare at least one adverse variant.",
    tone: "positive"
  };
}

function confidenceFor(comparison: ScenarioComparison): NovaDecisionView["confidence"] {
  const scenarioValues = [
    comparison.scenario.upfrontCost,
    comparison.scenario.assetDelta,
    comparison.scenario.liabilityDelta,
    comparison.scenario.monthlyIncomeDelta,
    comparison.scenario.monthlyExpenseDelta,
    comparison.scenario.monthlyDebtPaymentDelta,
    comparison.scenario.annualReturnDelta,
    comparison.scenario.durationMonths
  ];
  const completeInputs = scenarioValues.filter(Number.isFinite).length;
  let score = 96 * (completeInputs / scenarioValues.length);

  if (comparison.scenario.durationMonths > 120) score -= 6;
  if (comparison.scenario.upfrontCost > comparison.current.profile.assets.cash) score -= 15;
  if (comparison.after.risk.level === "High") score -= 10;
  if (comparison.scenario.annualReturnDelta !== 0) score -= 8;
  if (!comparison.scenario.tags.length) score -= 4;

  const rounded = Math.round(clamp(score, 0, 100));
  return {
    score: rounded,
    level: rounded >= 85 ? "High" : rounded >= 65 ? "Medium" : "Low",
    basis: `${completeInputs}/${scenarioValues.length} input coverage with deterministic engine stability adjustments; this is not a probability of success.`
  };
}

export function buildNovaDecisionView(
  comparison: ScenarioComparison,
  advisor: { source: AdvisorSource; recommendations: string[] } = {
    source: "deterministic",
    recommendations: comparison.recommendations
  }
): NovaDecisionView {
  const currency = comparison.current.profile.currency;
  const surplusDelta = comparison.delta.monthlySurplus;
  const debtRatioDelta = comparison.after.debtRatio - comparison.current.debtRatio;
  const runwayDelta = comparison.after.emergencyFundMonths - comparison.current.emergencyFundMonths;
  const healthDelta = comparison.delta.healthScore;
  const scenario = comparison.scenario;

  return {
    recommendation: recommendationFor(comparison),
    evidence: [
      {
        id: "surplus",
        label: "Monthly surplus",
        value: formatCurrency(comparison.after.monthlySurplus, currency),
        rawDelta: surplusDelta,
        detail: `Monthly surplus ${surplusDelta >= 0 ? "rises" : "falls"} by ${formatCurrency(Math.abs(surplusDelta), currency)}.`
      },
      {
        id: "debt-ratio",
        label: "Debt payment ratio",
        value: formatPercent(comparison.after.debtRatio, 1),
        rawDelta: debtRatioDelta,
        detail: `Debt payments change by ${debtRatioDelta >= 0 ? "+" : ""}${debtRatioDelta.toFixed(1)} percentage points of monthly income.`
      },
      {
        id: "emergency-runway",
        label: "Emergency runway",
        value: `${comparison.after.emergencyFundMonths.toFixed(1)} months`,
        rawDelta: runwayDelta,
        detail: `Liquid reserves change by ${runwayDelta >= 0 ? "+" : ""}${runwayDelta.toFixed(1)} months of modeled expenses.`
      },
      {
        id: "health",
        label: "Financial health",
        value: `${comparison.after.financialHealth.score}/100`,
        rawDelta: healthDelta,
        detail: `Health moves from ${comparison.current.financialHealth.score} to ${comparison.after.financialHealth.score}.`
      }
    ],
    confidence: confidenceFor(comparison),
    assumptions: [
      `Upfront cost of ${formatCurrency(scenario.upfrontCost, currency)}.`,
      `Recurring expense change of ${formatCurrency(scenario.monthlyExpenseDelta, currency)} per month.`,
      `Debt payment change of ${formatCurrency(scenario.monthlyDebtPaymentDelta, currency)} per month.`,
      `Modeled over ${scenario.durationMonths} months with no unlisted income, tax, fee, or inflation changes.`,
      ...(scenario.annualReturnDelta !== 0 ? [`Annual return input changes by ${formatPercent(scenario.annualReturnDelta, 1)} and is not guaranteed.`] : [])
    ],
    provenance: {
      source: advisor.source,
      label: advisor.source === "openai" ? "OpenAI-assisted explanation" : "Deterministic fallback"
    },
    advisorNotes: advisor.recommendations,
    actions: [
      { label: "Adjust financial model", href: "/onboarding" },
      { label: "Review printable report", href: "/reports" }
    ],
    boundary: "Educational decision support only. The model does not know future market returns, taxes, fees, credit approval, or changes that are not entered here."
  };
}
