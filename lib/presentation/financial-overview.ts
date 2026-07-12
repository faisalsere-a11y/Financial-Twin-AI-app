import { calculateFinancialTwin, compareScenario } from "../financial/engine";
import type { CurrencyCode, FinancialProfile, ScenarioInput } from "../financial/types";
import { formatCurrency, formatPercent } from "../utils";

export type MetricTone = "positive" | "caution" | "danger" | "neutral";

export interface MetricViewModel {
  id: "net-worth" | "monthly-surplus" | "emergency-runway" | "health-score";
  label: string;
  rawValue: number;
  value: string;
  detail: string;
  tone: MetricTone;
}

export interface CashFlowPointViewModel {
  month: string;
  current: number;
  after: number;
}

export interface FinancialOverviewViewModel {
  profile: {
    name: string;
    initials: string;
    currency: CurrencyCode;
  };
  health: {
    score: number;
    band: string;
    riskLevel: string;
    riskScore: number;
  };
  flow: {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyDebtPayment: number;
    savingsBalance: number;
    debtRatio: number;
    savingsRate: number;
  };
  metrics: MetricViewModel[];
  cashFlow: CashFlowPointViewModel[];
  cashFlowSummary: string;
  decision: {
    name: string;
    monthlySurplusDelta: number;
    healthDelta: number;
  };
}

export function buildFinancialOverview(
  profile: FinancialProfile,
  scenario: ScenarioInput
): FinancialOverviewViewModel {
  const twin = calculateFinancialTwin(profile);
  const comparison = compareScenario(profile, scenario);
  const currency = profile.currency;
  const currentCashFlow = comparison.current.timeline.at(-1)?.cashFlow ?? comparison.current.monthlySurplus;
  const afterCashFlow = comparison.after.timeline.at(-1)?.cashFlow ?? comparison.after.monthlySurplus;
  const direction = comparison.delta.monthlySurplus === 0
    ? "no monthly change"
    : `${comparison.delta.monthlySurplus > 0 ? "an increase" : "a decrease"} of ${formatCurrency(
        Math.abs(comparison.delta.monthlySurplus),
        currency
      )}`;

  return {
    profile: {
      name: profile.name,
      initials: profile.initials,
      currency
    },
    health: {
      score: twin.financialHealth.score,
      band: twin.financialHealth.band,
      riskLevel: twin.risk.level,
      riskScore: twin.risk.score
    },
    flow: {
      monthlyIncome: twin.monthlyIncome,
      monthlyExpenses: twin.monthlyExpenses,
      monthlyDebtPayment: twin.monthlyDebtPayment,
      savingsBalance: profile.assets.cash,
      debtRatio: twin.debtRatio,
      savingsRate: twin.savingsRate
    },
    metrics: [
      {
        id: "net-worth",
        label: "Net worth",
        rawValue: twin.netWorth,
        value: formatCurrency(twin.netWorth, currency),
        detail: "Assets minus outstanding debt",
        tone: twin.netWorth >= 0 ? "positive" : "danger"
      },
      {
        id: "monthly-surplus",
        label: "Monthly surplus",
        rawValue: twin.monthlySurplus,
        value: formatCurrency(twin.monthlySurplus, currency),
        detail: `${formatPercent(twin.savingsRate)} savings rate`,
        tone: twin.monthlySurplus >= 0 ? "positive" : "danger"
      },
      {
        id: "emergency-runway",
        label: "Emergency runway",
        rawValue: twin.emergencyFundMonths,
        value: `${twin.emergencyFundMonths.toFixed(1)} months`,
        detail: "Cash divided by monthly outflow",
        tone: twin.emergencyFundMonths >= 6 ? "positive" : twin.emergencyFundMonths >= 3 ? "caution" : "danger"
      },
      {
        id: "health-score",
        label: "Financial health",
        rawValue: twin.financialHealth.score,
        value: `${twin.financialHealth.score}/100`,
        detail: twin.financialHealth.band,
        tone: twin.financialHealth.score >= 80 ? "positive" : twin.financialHealth.score >= 60 ? "caution" : "danger"
      }
    ],
    cashFlow: comparison.current.timeline.map((point, index) => ({
      month: point.month,
      current: point.cashFlow,
      after: comparison.after.timeline[index]?.cashFlow ?? point.cashFlow
    })),
    cashFlowSummary: `Current monthly cash flow is ${formatCurrency(currentCashFlow, currency)}. After ${scenario.name}, it is ${formatCurrency(afterCashFlow, currency)}, ${direction}.`,
    decision: {
      name: scenario.name,
      monthlySurplusDelta: comparison.delta.monthlySurplus,
      healthDelta: comparison.delta.healthScore
    }
  };
}
