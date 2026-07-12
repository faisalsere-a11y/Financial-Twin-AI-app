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

  it("round trips the same non-emergency goal selected for onboarding", () => {
    const base = {
      ...sampleProfile,
      goals: [
        { ...sampleProfile.goals[0], category: "Emergency" as const },
        { ...sampleProfile.goals[1], id: "retirement", category: "Retirement" as const, name: "Retire well" }
      ]
    };
    const values = profileToOnboardingValues(base);
    const updated = onboardingToFinancialProfile({ ...values, goal: "Retire earlier", goalAmount: 900_000 }, base);

    expect(updated.goals.find((goal) => goal.id === "retirement")).toMatchObject({
      name: "Retire earlier",
      targetAmount: 900_000
    });
  });

  it("creates primary and emergency goals when the base profile has none", () => {
    const base = { ...sampleProfile, goals: [] };
    const updated = onboardingToFinancialProfile(
      { ...profileToOnboardingValues(base), emergencyFund: 42_000, goal: "First home", goalAmount: 250_000 },
      base
    );

    expect(updated.goals.find((goal) => goal.category === "Emergency")?.currentAmount).toBe(42_000);
    expect(updated.goals.find((goal) => goal.category !== "Emergency")).toMatchObject({
      name: "First home",
      targetAmount: 250_000
    });
  });

  it("does not duplicate an emergency-only goal as the primary goal", () => {
    const emergency = { ...sampleProfile.goals[0], id: "only-emergency", category: "Emergency" as const, name: "Emergency Fund" };
    const base = { ...sampleProfile, goals: [emergency] };
    const values = profileToOnboardingValues(base);
    const updated = onboardingToFinancialProfile(values, base);

    expect(values).toMatchObject({ goal: "Primary goal", goalAmount: 0 });
    expect(updated.goals.filter((goal) => goal.category === "Emergency")).toHaveLength(1);
    expect(updated.goals.find((goal) => goal.category === "House")).toMatchObject({
      name: "Primary goal",
      targetAmount: 0
    });
  });
});
