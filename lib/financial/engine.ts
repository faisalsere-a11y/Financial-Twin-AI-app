import { clamp } from "../utils";
import {
  calculateRisk,
  getAssetTotal,
  getDebtBalance,
  getMonthlyDebtPayment,
  getMonthlyExpenses,
  getMonthlyIncome
} from "./risk";
import type {
  FinancialHealthResult,
  FinancialProfile,
  FinancialTwinResult,
  DebtModel,
  HealthBand,
  ScenarioComparison,
  ScenarioInput,
  TimelinePoint
} from "./types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function healthBand(score: number): HealthBand {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 45) return "Fair";
  return "Poor";
}

export function calculateFinancialHealth(profile: FinancialProfile): FinancialHealthResult {
  const monthlyIncome = getMonthlyIncome(profile);
  const monthlyExpenses = getMonthlyExpenses(profile);
  const monthlyDebtPayment = getMonthlyDebtPayment(profile);
  const debtBalance = getDebtBalance(profile);
  const assets = getAssetTotal(profile);
  const netWorth = assets - debtBalance;
  const surplus = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome ? (surplus / monthlyIncome) * 100 : 0;
  const debtRatio = monthlyIncome ? (monthlyDebtPayment / monthlyIncome) * 100 : 100;
  const emergencyFundMonths = monthlyExpenses ? profile.assets.cash / monthlyExpenses : 0;
  const investmentRatio = assets ? ((profile.assets.investments + profile.assets.retirement) / assets) * 100 : 0;
  const netWorthCoverage = monthlyExpenses ? netWorth / (monthlyExpenses * 12) : 0;
  const cashFlowRatio = monthlyIncome ? (surplus / monthlyIncome) * 100 : 0;

  const score =
    clamp(savingsRate, 0, 30) * 0.9 +
    clamp(35 - debtRatio, 0, 35) * 0.58 +
    clamp(emergencyFundMonths / 6, 0, 1) * 18 +
    clamp(investmentRatio / 35, 0, 1) * 13 +
    clamp(netWorthCoverage / 2.5, 0, 1) * 10 +
    clamp(cashFlowRatio / 30, 0, 1) * 12;

  const rounded = Math.round(clamp(score, 0, 100));

  return {
    score: rounded,
    band: healthBand(rounded),
    drivers: [
      {
        label: "Savings Rate",
        value: savingsRate,
        impact: savingsRate >= 20 ? "positive" : savingsRate >= 10 ? "neutral" : "negative"
      },
      {
        label: "Debt Ratio",
        value: debtRatio,
        impact: debtRatio <= 25 ? "positive" : debtRatio <= 40 ? "neutral" : "negative"
      },
      {
        label: "Emergency Fund",
        value: emergencyFundMonths,
        impact: emergencyFundMonths >= 6 ? "positive" : emergencyFundMonths >= 3 ? "neutral" : "negative"
      },
      {
        label: "Investment Ratio",
        value: investmentRatio,
        impact: investmentRatio >= 25 ? "positive" : investmentRatio >= 12 ? "neutral" : "negative"
      }
    ]
  };
}

function buildTimeline(profile: FinancialProfile, months = 12): TimelinePoint[] {
  const monthlyIncome = getMonthlyIncome(profile);
  const monthlyExpenses = getMonthlyExpenses(profile);
  const monthlyDebtPayment = getMonthlyDebtPayment(profile);
  const surplus = monthlyIncome - monthlyExpenses;
  const initialDebt = getDebtBalance(profile);
  const assetTotal = getAssetTotal(profile);
  const investmentMonthlyGrowth = (profile.assets.investments + profile.assets.retirement) * (0.065 / 12);

  return Array.from({ length: months }, (_, index) => {
    const monthNumber = index + 1;
    const savings = profile.assets.cash + surplus * monthNumber;
    const debt = Math.max(0, initialDebt - monthlyDebtPayment * 0.58 * monthNumber);
    const investments =
      profile.assets.investments +
      profile.assets.retirement +
      investmentMonthlyGrowth * monthNumber +
      profile.goals.reduce((total, goal) => total + goal.monthlyContribution * 0.22 * monthNumber, 0);
    const nonLiquidAssets = assetTotal - profile.assets.cash - profile.assets.investments - profile.assets.retirement;

    return {
      month: MONTHS[index % MONTHS.length] ?? `M${monthNumber}`,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      savings,
      debt,
      investments,
      netWorth: savings + investments + nonLiquidAssets - debt,
      cashFlow: surplus
    };
  });
}

export function calculateFinancialTwin(profile: FinancialProfile): FinancialTwinResult {
  const monthlyIncome = getMonthlyIncome(profile);
  const monthlyExpenses = getMonthlyExpenses(profile);
  const monthlyDebtPayment = getMonthlyDebtPayment(profile);
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const debtBalance = getDebtBalance(profile);
  const assetTotal = getAssetTotal(profile);

  return {
    profile,
    monthlyIncome,
    monthlyExpenses,
    monthlyDebtPayment,
    monthlySurplus,
    debtRatio: monthlyIncome ? (monthlyDebtPayment / monthlyIncome) * 100 : 0,
    savingsRate: monthlyIncome ? (monthlySurplus / monthlyIncome) * 100 : 0,
    emergencyFundMonths: monthlyExpenses ? profile.assets.cash / monthlyExpenses : 0,
    netWorth: assetTotal - debtBalance,
    risk: calculateRisk(profile),
    financialHealth: calculateFinancialHealth(profile),
    timeline: buildTimeline(profile)
  };
}

export function applyScenario(profile: FinancialProfile, scenario: ScenarioInput): FinancialProfile {
  const scenarioAssetValue = scenario.type === "car" ? scenario.assetDelta * 0.86 : scenario.assetDelta;
  const scenarioDebtType: DebtModel["type"] =
    scenario.type === "car" ? "auto-loan" : scenario.type === "house" ? "mortgage" : "personal-loan";

  return {
    ...profile,
    income: {
      ...profile.income,
      otherMonthly: profile.income.otherMonthly + scenario.monthlyIncomeDelta
    },
    expenses: {
      ...profile.expenses,
      other: profile.expenses.other + scenario.monthlyExpenseDelta
    },
    assets: {
      ...profile.assets,
      cash: Math.max(0, profile.assets.cash - scenario.upfrontCost),
      investments:
        scenario.type === "investment"
          ? profile.assets.investments + scenario.monthlyExpenseDelta * 3
          : profile.assets.investments,
      other: profile.assets.other + scenarioAssetValue
    },
    debts: [
      ...profile.debts,
      ...(scenario.liabilityDelta || scenario.monthlyDebtPaymentDelta
        ? [
            {
              label: scenario.name,
              balance: scenario.liabilityDelta,
              monthlyPayment: scenario.monthlyDebtPaymentDelta,
              apr: scenario.type === "car" ? 5.9 : scenario.type === "house" ? 4.8 : 7.2,
              type: scenarioDebtType
            }
          ]
        : [])
    ]
  };
}

function scenarioRecommendations(comparison: Omit<ScenarioComparison, "recommendations">): string[] {
  const debtRatioIncrease = comparison.after.debtRatio - comparison.current.debtRatio;
  const surplusDrop = comparison.current.monthlySurplus - comparison.after.monthlySurplus;
  const waitMonths = Math.max(0, Math.ceil(Math.max(0, surplusDrop * 4) / Math.max(1, comparison.current.monthlySurplus)));
  const recommendations = [
    `Buying this decision changes your debt ratio by ${debtRatioIncrease.toFixed(1)} percentage points.`
  ];

  if (comparison.after.debtRatio > 28) {
    recommendations.push("Increase the down payment or wait until debt ratio is below 25%.");
  }

  if (surplusDrop > 1000) {
    recommendations.push(`Wait ${Math.max(3, waitMonths + 4)} months or reduce recurring cost by ${Math.round(surplusDrop * 0.35)} SAR/month.`);
  }

  if (comparison.after.emergencyFundMonths < 4) {
    recommendations.push("Emergency fund is too low for this decision; rebuild at least 6 months of expenses.");
  }

  if (comparison.after.monthlySurplus > 1200 && comparison.after.risk.level !== "High") {
    recommendations.push(`You can safely invest ${Math.round(comparison.after.monthlySurplus * 0.22)} SAR/month after this scenario.`);
  }

  return recommendations;
}

export function compareScenario(profile: FinancialProfile, scenario: ScenarioInput): ScenarioComparison {
  const current = calculateFinancialTwin(profile);
  const after = calculateFinancialTwin(applyScenario(profile, scenario));
  const current12 = current.timeline.at(-1);
  const after12 = after.timeline.at(-1);
  const comparisonWithoutRecommendations = {
    scenario,
    current,
    after,
    delta: {
      monthlySurplus: after.monthlySurplus - current.monthlySurplus,
      debtPayment: after.monthlyDebtPayment - current.monthlyDebtPayment,
      riskScore: after.risk.score - current.risk.score,
      healthScore: after.financialHealth.score - current.financialHealth.score,
      netWorth12Month: (after12?.netWorth ?? after.netWorth) - (current12?.netWorth ?? current.netWorth),
      savings12Month: (after12?.savings ?? 0) - (current12?.savings ?? 0)
    }
  };

  return {
    ...comparisonWithoutRecommendations,
    recommendations: scenarioRecommendations(comparisonWithoutRecommendations)
  };
}

export function forecastGoalCompletion(profile: FinancialProfile) {
  const twin = calculateFinancialTwin(profile);

  return profile.goals.map((goal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const monthly = Math.max(1, goal.monthlyContribution + twin.monthlySurplus * (goal.priority === "High" ? 0.08 : 0.03));
    const months = Math.ceil(remaining / monthly);
    const date = new Date();
    date.setMonth(date.getMonth() + months);

    return {
      ...goal,
      progress: goal.targetAmount ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
      forecastDate: date.toISOString().slice(0, 10),
      monthsRemaining: months
    };
  });
}
