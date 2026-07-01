import type { FinancialTwinResult, ScenarioComparison } from "@/lib/financial/types";

export function twinToCsv(twin: FinancialTwinResult, comparison?: ScenarioComparison) {
  const rows = [
    ["Metric", "Current", "After Decision", "Delta"],
    [
      "Monthly Surplus",
      twin.monthlySurplus,
      comparison?.after.monthlySurplus ?? "",
      comparison?.delta.monthlySurplus ?? ""
    ],
    ["Debt Ratio", twin.debtRatio.toFixed(1), comparison?.after.debtRatio.toFixed(1) ?? "", comparison?.delta.debtPayment ?? ""],
    [
      "Health Score",
      twin.financialHealth.score,
      comparison?.after.financialHealth.score ?? "",
      comparison?.delta.healthScore ?? ""
    ],
    ["Risk Score", twin.risk.score, comparison?.after.risk.score ?? "", comparison?.delta.riskScore ?? ""],
    ["Net Worth", twin.netWorth, comparison?.after.netWorth ?? "", ""],
    [],
    ["Month", "Cash Flow", "Savings", "Debt", "Net Worth"],
    ...twin.timeline.map((point) => [
      point.month,
      point.cashFlow,
      Math.round(point.savings),
      Math.round(point.debt),
      Math.round(point.netWorth)
    ])
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}
