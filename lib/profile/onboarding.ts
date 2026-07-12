import { z } from "zod";
import { sampleProfile } from "../financial/sample-data";
import type { ExpenseModel, FinancialProfile } from "../financial/types";

export const onboardingSchema = z
  .object({
    age: z.coerce.number().int().min(18, "Age must be at least 18.").max(90, "Age must be 90 or below."),
    country: z.string().trim().min(2, "Enter a country."),
    currency: z.enum(["SAR", "USD", "EUR", "AED"]),
    employment: z.enum(["Full-time", "Founder", "Contract", "Government", "Self-employed", "Unemployed"]),
    salary: z.coerce.number().min(0, "Salary cannot be negative."),
    bonuses: z.coerce.number().min(0, "Bonus cannot be negative."),
    monthlyIncome: z.coerce.number().min(0, "Monthly income cannot be negative."),
    housing: z.coerce.number().min(0, "Housing cost cannot be negative."),
    expenses: z.coerce.number().min(0, "Living expenses cannot be negative."),
    subscriptions: z.coerce.number().min(0, "Subscriptions cannot be negative."),
    loanBalance: z.coerce.number().min(0, "Loan balance cannot be negative."),
    loanPayment: z.coerce.number().min(0, "Loan payment cannot be negative."),
    creditCardBalance: z.coerce.number().min(0, "Credit card balance cannot be negative."),
    creditLimit: z.coerce.number().min(0, "Credit limit cannot be negative."),
    savings: z.coerce.number().min(0, "Savings cannot be negative."),
    investments: z.coerce.number().min(0, "Investments cannot be negative."),
    insurance: z.coerce.number().min(0, "Insurance cannot be negative."),
    children: z.coerce.number().int().min(0, "Dependents cannot be negative."),
    emergencyFund: z.coerce.number().min(0, "Emergency fund cannot be negative."),
    goal: z.string().trim().min(2, "Enter a goal name."),
    goalAmount: z.coerce.number().min(0, "Goal amount cannot be negative."),
    riskTolerance: z.enum(["Low", "Medium", "High"])
  })
  .superRefine((values, context) => {
    const committedMonthlyIncome = values.salary + values.bonuses / 12;
    if (values.monthlyIncome < committedMonthlyIncome) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monthlyIncome"],
        message: "Total monthly income must include salary and the monthly share of annual bonuses."
      });
    }
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const onboardingSteps = [
  { id: "profile", title: "Profile", summary: "Context and household", fields: ["age", "country", "currency", "employment", "children"] },
  { id: "income", title: "Income", summary: "Reliable monthly inflow", fields: ["salary", "bonuses", "monthlyIncome"] },
  { id: "outflow", title: "Outflow", summary: "Recurring living costs", fields: ["housing", "expenses", "subscriptions", "insurance"] },
  { id: "balance-sheet", title: "Debt & assets", summary: "Obligations and reserves", fields: ["loanBalance", "loanPayment", "creditCardBalance", "creditLimit", "savings", "investments"] },
  { id: "intent", title: "Goals & risk", summary: "Priorities and comfort", fields: ["emergencyFund", "goal", "goalAmount", "riskTolerance"] }
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  summary: string;
  fields: ReadonlyArray<keyof OnboardingValues>;
}>;

const flexibleExpenseKeys = ["food", "transport", "utilities", "education", "lifestyle", "children", "other"] as const;

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function flexibleExpenseTotal(expenses: ExpenseModel) {
  return sum(flexibleExpenseKeys.map((key) => expenses[key]));
}

function scaleFlexibleExpenses(expenses: ExpenseModel, target: number): Pick<ExpenseModel, (typeof flexibleExpenseKeys)[number]> {
  const current = flexibleExpenseTotal(expenses);
  if (current <= 0) {
    return { food: 0, transport: 0, utilities: 0, education: 0, lifestyle: 0, children: 0, other: target };
  }

  let allocated = 0;
  const scaled = {} as Pick<ExpenseModel, (typeof flexibleExpenseKeys)[number]>;

  flexibleExpenseKeys.forEach((key, index) => {
    const value = index === flexibleExpenseKeys.length - 1 ? target - allocated : Math.round((expenses[key] / current) * target * 100) / 100;
    scaled[key] = value;
    allocated += value;
  });

  return scaled;
}

function totalMonthlyIncome(profile: FinancialProfile) {
  return profile.income.salaryMonthly + profile.income.bonusesAnnual / 12 + profile.income.otherMonthly;
}

function primaryGoalFor(profile: FinancialProfile) {
  return profile.goals.find((goal) => goal.category === "House")
    ?? profile.goals.find((goal) => goal.category !== "Emergency")
    ?? profile.goals[0];
}

export function profileToOnboardingValues(profile: FinancialProfile): OnboardingValues {
  const personalLoan = profile.debts.find((debt) => debt.type === "personal-loan");
  const creditCard = profile.debts.find((debt) => debt.type === "credit-card");
  const emergencyGoal = profile.goals.find((goal) => goal.category === "Emergency");
  const primaryGoal = primaryGoalFor(profile);

  return {
    age: profile.age,
    country: profile.country,
    currency: profile.currency,
    employment: profile.employment,
    salary: profile.income.salaryMonthly,
    bonuses: profile.income.bonusesAnnual,
    monthlyIncome: totalMonthlyIncome(profile),
    housing: profile.expenses.housing,
    expenses: flexibleExpenseTotal(profile.expenses),
    subscriptions: profile.expenses.subscriptions,
    loanBalance: personalLoan?.balance ?? 0,
    loanPayment: personalLoan?.monthlyPayment ?? 0,
    creditCardBalance: creditCard?.balance ?? profile.creditUsed,
    creditLimit: profile.creditLimit,
    savings: profile.assets.cash,
    investments: profile.assets.investments,
    insurance: profile.expenses.insurance,
    children: profile.dependents,
    emergencyFund: emergencyGoal?.currentAmount ?? profile.assets.cash,
    goal: primaryGoal?.name ?? "Primary goal",
    goalAmount: primaryGoal?.targetAmount ?? 0,
    riskTolerance: profile.riskTolerance
  };
}

export function onboardingToFinancialProfile(values: OnboardingValues, baseProfile: FinancialProfile = sampleProfile): FinancialProfile {
  const initials = baseProfile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const flexibleExpenses = scaleFlexibleExpenses(baseProfile.expenses, values.expenses);
  const hasPersonalLoan = baseProfile.debts.some((debt) => debt.type === "personal-loan");
  const hasCreditCard = baseProfile.debts.some((debt) => debt.type === "credit-card");
  const debts = baseProfile.debts.map((debt) => {
    if (debt.type === "personal-loan") return { ...debt, balance: values.loanBalance, monthlyPayment: values.loanPayment };
    if (debt.type === "credit-card") return { ...debt, balance: values.creditCardBalance };
    return { ...debt };
  });

  if (!hasPersonalLoan && (values.loanBalance > 0 || values.loanPayment > 0)) {
    debts.push({ label: "Personal Loan", balance: values.loanBalance, monthlyPayment: values.loanPayment, apr: 0, type: "personal-loan" });
  }
  if (!hasCreditCard && values.creditCardBalance > 0) {
    debts.push({ label: "Credit Card", balance: values.creditCardBalance, monthlyPayment: 0, apr: 0, type: "credit-card" });
  }

  const selectedPrimaryGoal = primaryGoalFor(baseProfile);
  const goals = baseProfile.goals.map((goal) => {
    if (goal.category === "Emergency") return { ...goal, currentAmount: values.emergencyFund };
    if (goal.id === selectedPrimaryGoal?.id) return { ...goal, name: values.goal, targetAmount: values.goalAmount };
    return { ...goal };
  });

  if (!goals.some((goal) => goal.category === "Emergency")) {
    goals.push({
      id: `${baseProfile.id}-emergency`, name: "Emergency Fund", category: "Emergency", targetAmount: Math.max(values.emergencyFund, values.expenses * 6),
      currentAmount: values.emergencyFund, monthlyContribution: 0, targetDate: "2027-12-31", priority: "High"
    });
  }
  if (!selectedPrimaryGoal || selectedPrimaryGoal.category === "Emergency") {
    goals.push({
      id: `${baseProfile.id}-primary`, name: values.goal, category: "House", targetAmount: values.goalAmount,
      currentAmount: 0, monthlyContribution: 0, targetDate: "2030-12-31", priority: "High"
    });
  }

  return {
    ...baseProfile,
    initials,
    age: values.age,
    country: values.country,
    currency: values.currency,
    employment: values.employment,
    riskTolerance: values.riskTolerance,
    dependents: values.children,
    creditLimit: values.creditLimit,
    creditUsed: values.creditCardBalance,
    insuranceCoverageMonthly: values.insurance,
    income: {
      ...baseProfile.income,
      salaryMonthly: values.salary,
      bonusesAnnual: values.bonuses,
      otherMonthly: Math.max(0, values.monthlyIncome - values.salary - values.bonuses / 12)
    },
    expenses: {
      ...baseProfile.expenses,
      ...flexibleExpenses,
      housing: values.housing,
      subscriptions: values.subscriptions,
      insurance: values.insurance
    },
    debts,
    assets: {
      ...baseProfile.assets,
      cash: values.savings,
      investments: values.investments
    },
    goals
  };
}

export const onboardingDefaults = profileToOnboardingValues(sampleProfile);
