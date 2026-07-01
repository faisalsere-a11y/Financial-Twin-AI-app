import { clamp } from "../utils";
import type { FinancialProfile, RiskLevel, RiskResult } from "./types";

function levelFromRiskScore(score: number): RiskLevel {
  if (score < 34) return "Low";
  if (score < 67) return "Medium";
  return "High";
}

function factorStatus(score: number): RiskLevel {
  if (score < 8) return "Low";
  if (score < 18) return "Medium";
  return "High";
}

export function getMonthlyIncome(profile: FinancialProfile) {
  return profile.income.salaryMonthly + profile.income.otherMonthly + profile.income.bonusesAnnual / 12;
}

export function getMonthlyExpenses(profile: FinancialProfile) {
  return Object.values(profile.expenses).reduce((total, value) => total + value, 0);
}

export function getMonthlyDebtPayment(profile: FinancialProfile) {
  return profile.debts.reduce((total, debt) => total + debt.monthlyPayment, 0);
}

export function getDebtBalance(profile: FinancialProfile) {
  return profile.debts.reduce((total, debt) => total + debt.balance, 0);
}

export function getAssetTotal(profile: FinancialProfile) {
  return Object.values(profile.assets).reduce((total, value) => total + value, 0);
}

export function calculateRisk(profile: FinancialProfile): RiskResult {
  const monthlyIncome = getMonthlyIncome(profile);
  const monthlyExpenses = getMonthlyExpenses(profile);
  const monthlyDebtPayment = getMonthlyDebtPayment(profile);
  const debtRatio = monthlyIncome ? (monthlyDebtPayment / monthlyIncome) * 100 : 100;
  const emergencyFundMonths = monthlyExpenses ? profile.assets.cash / monthlyExpenses : 0;
  const creditUtilization = profile.creditLimit ? (profile.creditUsed / profile.creditLimit) * 100 : 0;
  const investmentAssets = profile.assets.investments + profile.assets.retirement;
  const assetTotal = getAssetTotal(profile);
  const diversification = assetTotal ? (investmentAssets / assetTotal) * 100 : 0;
  const cashFlowRatio = monthlyIncome ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : -100;

  const debtScore = clamp(debtRatio * 0.85, 0, 30);
  const emergencyScore = emergencyFundMonths >= 6 ? 2 : emergencyFundMonths >= 3 ? 10 : 22;
  const diversificationScore = diversification >= 35 ? 4 : diversification >= 18 ? 10 : 18;
  const cashFlowScore = cashFlowRatio >= 25 ? 4 : cashFlowRatio >= 10 ? 10 : 22;
  const creditScore = creditUtilization < 25 ? 4 : creditUtilization < 50 ? 9 : 18;
  const stabilityScore = clamp((100 - profile.income.stabilityScore) * 0.18, 0, 12);

  const score = Math.round(
    debtScore + emergencyScore + diversificationScore + cashFlowScore + creditScore + stabilityScore
  );
  const level = levelFromRiskScore(score);

  return {
    score,
    level,
    explanation:
      level === "Low"
        ? "Strong cash flow and reserves keep the twin resilient."
        : level === "Medium"
          ? "The twin is stable, but debt load and reserve depth should be watched before major commitments."
          : "Debt, cash flow, or emergency reserves make the next decision materially fragile.",
    factors: [
      {
        label: "Debt ratio",
        score: Math.round(debtScore),
        status: factorStatus(debtScore),
        detail: `${debtRatio.toFixed(1)}% of monthly income is committed to debt.`
      },
      {
        label: "Emergency fund",
        score: emergencyScore,
        status: factorStatus(emergencyScore),
        detail: `${emergencyFundMonths.toFixed(1)} months of expenses are covered.`
      },
      {
        label: "Investment mix",
        score: diversificationScore,
        status: factorStatus(diversificationScore),
        detail: `${diversification.toFixed(1)}% of assets sit in invested buckets.`
      },
      {
        label: "Cash flow",
        score: cashFlowScore,
        status: factorStatus(cashFlowScore),
        detail: `${cashFlowRatio.toFixed(1)}% surplus against monthly income.`
      },
      {
        label: "Credit utilization",
        score: creditScore,
        status: factorStatus(creditScore),
        detail: `${creditUtilization.toFixed(1)}% of revolving credit is used.`
      }
    ]
  };
}
