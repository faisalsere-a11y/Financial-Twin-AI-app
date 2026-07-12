import { describe, expect, it } from "vitest";
import { calculateFinancialTwin } from "../lib/financial/engine";
import { sampleProfile } from "../lib/financial/sample-data";
import {
  onboardingDefaults,
  onboardingToFinancialProfile,
  profileToOnboardingValues
} from "../lib/profile/onboarding";

describe("onboarding profile adapter", () => {
  it("derives form defaults from the authoritative sample profile", () => {
    expect(onboardingDefaults).toEqual(profileToOnboardingValues(sampleProfile));
    expect(onboardingDefaults.monthlyIncome).toBe(18_500);
    expect(onboardingDefaults.expenses).toBe(7_650);
    expect(onboardingDefaults.goal).toBe("House Down Payment");
  });

  it("round trips the sample without changing engine results", () => {
    const before = calculateFinancialTwin(sampleProfile);
    const profile = onboardingToFinancialProfile(onboardingDefaults, sampleProfile);
    const after = calculateFinancialTwin(profile);

    expect(after.monthlyIncome).toBe(before.monthlyIncome);
    expect(after.monthlyExpenses).toBe(before.monthlyExpenses);
    expect(after.monthlyDebtPayment).toBe(before.monthlyDebtPayment);
    expect(after.netWorth).toBe(before.netWorth);
    expect(after.financialHealth).toEqual(before.financialHealth);
    expect(profile).not.toBe(sampleProfile);
  });

  it("maps edited model fields into a complete financial profile", () => {
    const profile = onboardingToFinancialProfile(
      {
        ...onboardingDefaults,
        age: 35,
        monthlyIncome: 20_000,
        expenses: 8_000,
        loanBalance: 70_000,
        creditCardBalance: 8_000,
        savings: 65_000,
        investments: 110_000,
        emergencyFund: 65_000,
        goal: "Home Deposit",
        goalAmount: 320_000,
        riskTolerance: "High"
      },
      sampleProfile
    );
    const twin = calculateFinancialTwin(profile);

    expect(profile.age).toBe(35);
    expect(twin.monthlyIncome).toBe(20_000);
    expect(twin.monthlyExpenses).toBeCloseTo(13_150, 2);
    expect(profile.debts.find((debt) => debt.type === "personal-loan")?.balance).toBe(70_000);
    expect(profile.creditUsed).toBe(8_000);
    expect(profile.assets.cash).toBe(65_000);
    expect(profile.assets.investments).toBe(110_000);
    expect(profile.goals.find((goal) => goal.category === "Emergency")?.currentAmount).toBe(65_000);
    expect(profile.goals.find((goal) => goal.category === "House")?.name).toBe("Home Deposit");
    expect(profile.goals.find((goal) => goal.category === "House")?.targetAmount).toBe(320_000);
    expect(profile.riskTolerance).toBe("High");
  });
});
