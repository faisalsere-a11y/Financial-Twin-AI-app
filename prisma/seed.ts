import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { compareScenario } from "../lib/financial/engine";
import { sampleProfile, sampleScenario, scenarioLibrary } from "../lib/financial/sample-data";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "ahmed@example.com" },
    update: {
      name: sampleProfile.name,
      passwordHash
    },
    create: {
      email: "ahmed@example.com",
      name: sampleProfile.name,
      passwordHash
    }
  });

  await prisma.financialProfile.upsert({
    where: { userId: user.id },
    update: {
      age: sampleProfile.age,
      country: sampleProfile.country,
      currency: sampleProfile.currency,
      employment: sampleProfile.employment,
      riskTolerance: sampleProfile.riskTolerance,
      monthlySalary: sampleProfile.income.salaryMonthly,
      annualBonus: sampleProfile.income.bonusesAnnual,
      monthlyExpenses: Object.values(sampleProfile.expenses).reduce((total, value) => total + value, 0),
      cashSavings: sampleProfile.assets.cash,
      investments: sampleProfile.assets.investments,
      retirement: sampleProfile.assets.retirement,
      realEstate: sampleProfile.assets.realEstate,
      creditLimit: sampleProfile.creditLimit,
      creditUsed: sampleProfile.creditUsed,
      dependents: sampleProfile.dependents
    },
    create: {
      userId: user.id,
      age: sampleProfile.age,
      country: sampleProfile.country,
      currency: sampleProfile.currency,
      employment: sampleProfile.employment,
      riskTolerance: sampleProfile.riskTolerance,
      monthlySalary: sampleProfile.income.salaryMonthly,
      annualBonus: sampleProfile.income.bonusesAnnual,
      monthlyExpenses: Object.values(sampleProfile.expenses).reduce((total, value) => total + value, 0),
      cashSavings: sampleProfile.assets.cash,
      investments: sampleProfile.assets.investments,
      retirement: sampleProfile.assets.retirement,
      realEstate: sampleProfile.assets.realEstate,
      creditLimit: sampleProfile.creditLimit,
      creditUsed: sampleProfile.creditUsed,
      dependents: sampleProfile.dependents
    }
  });

  const profile = await prisma.financialProfile.findUniqueOrThrow({ where: { userId: user.id } });
  await prisma.debt.deleteMany({ where: { profileId: profile.id } });
  await prisma.goal.deleteMany({ where: { profileId: profile.id } });
  await prisma.simulation.deleteMany({ where: { userId: user.id } });

  await prisma.debt.createMany({
    data: sampleProfile.debts.map((debt) => ({
      profileId: profile.id,
      label: debt.label,
      balance: debt.balance,
      payment: debt.monthlyPayment,
      apr: debt.apr,
      type: debt.type
    }))
  });

  await prisma.goal.createMany({
    data: sampleProfile.goals.map((goal) => ({
      profileId: profile.id,
      name: goal.name,
      category: goal.category,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      monthlyContribution: goal.monthlyContribution,
      targetDate: new Date(goal.targetDate),
      priority: goal.priority
    }))
  });

  await Promise.all(
    scenarioLibrary.slice(0, 4).map((scenario) =>
      prisma.simulation.create({
        data: {
          userId: user.id,
          name: scenario.name,
          type: scenario.type,
          inputJson: JSON.stringify(scenario),
          resultJson: JSON.stringify(compareScenario(sampleProfile, scenario)),
          favorite: scenario.id === sampleScenario.id
        }
      })
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
